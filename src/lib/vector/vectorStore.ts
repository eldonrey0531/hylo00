import { generateJinaEmbeddings } from '@/lib/ai/jinaEmbeddings';
import { logger } from '@/utils/console-logger';

interface StoreItineraryVectorParams {
  workflowId: string;
  sessionId: string;
  destination?: string;
  rawContent: string;
  itinerary: unknown;
  model: string;
  formData?: Record<string, any>;
}

interface StoreItineraryVectorResult {
  stored: boolean;
  vectorIds: string[];
  failures?: Array<{ id: string; error: string }>;
  message?: string;
}

interface VectorEntry {
  id: string;
  text: string;
  metadata: Record<string, any>;
  document: Record<string, any>;
}

interface KeyFacts {
  destination?: string;
  budget?: string;
  dates?: string;
  travelParty?: string;
  travelPartyFirstSentence?: string;
}

const VECTOR_ENDPOINT = process.env.VECTOR_DB_ENDPOINT || process.env.VECTOR_DB_WRITE_URL;
const VECTOR_API_KEY = process.env.VECTOR_DB_API_KEY || process.env.VECTOR_DB_TOKEN;

export async function storeItineraryVector(params: StoreItineraryVectorParams): Promise<StoreItineraryVectorResult> {
  const { workflowId, sessionId, destination, itinerary, model, formData } = params;

  if (!VECTOR_ENDPOINT) {
    logger.warn(201, 'VECTOR_DB_ENDPOINT_MISSING', 'vectorStore.ts', 'storeItineraryVector', 'Vector endpoint environment variable not set', {
      workflowId,
      sessionId,
    });

    return {
      stored: false,
      vectorIds: [],
      message: 'Vector endpoint not configured',
    };
  }

  const keyFacts = extractKeyFacts(itinerary, destination, formData);

  logger.debug(200, 'VECTOR_KEY_FACTS_EXTRACTED', 'vectorStore.ts', 'storeItineraryVector', {
    workflowId,
    keyFacts,
  });

  const entries = buildVectorEntries({
    workflowId,
    keyFacts,
  });

  if (entries.length === 0) {
    logger.warn(202, 'VECTOR_NO_ENTRIES', 'vectorStore.ts', 'storeItineraryVector', 'No vector entries were generated for itinerary', {
      workflowId,
    });

    return {
      stored: false,
      vectorIds: [],
      message: 'No vector entries generated',
    };
  }

  let embeddingModel = 'jina-embeddings-v3';
  let embeddingUsage: Record<string, unknown> | undefined;
  let embeddings: number[][];

  try {
    const embeddingResult = await generateJinaEmbeddings(
      entries.map((entry) => entry.text),
      {
        task: 'text-matching',
        inputType: 'text',
      },
    );

    embeddings = embeddingResult.embeddings;
    embeddingModel = embeddingResult.model;
    embeddingUsage = embeddingResult.usage;

    if (!Array.isArray(embeddings) || embeddings.length !== entries.length) {
      throw new Error('Embedding count mismatch for itinerary entries.');
    }
  } catch (error) {
    logger.error(203, 'VECTOR_EMBEDDING_FAILED', 'vectorStore.ts', 'storeItineraryVector', error instanceof Error ? error.message : String(error), {
      workflowId,
    });

    return {
      stored: false,
      vectorIds: [],
      message: error instanceof Error ? error.message : String(error),
    };
  }

  const sharedMetadata = {
    workflowId,
    sessionId,
    model,
    embeddingModel,
    generatedAt: new Date().toISOString(),
    destination: keyFacts.destination,
    budget: keyFacts.budget,
    dates: keyFacts.dates,
    travelPartyFirstSentence: keyFacts.travelPartyFirstSentence,
    embeddingUsage,
  };

  const successes: string[] = [];
  const failures: Array<{ id: string; error: string }> = [];

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const vector = embeddings[index];

    if (!Array.isArray(vector) || vector.length === 0) {
      failures.push({ id: entry.id, error: 'Received empty vector from embeddings API' });
      continue;
    }

    const payload = {
      id: entry.id,
      values: vector,
      metadata: {
        ...sharedMetadata,
        ...entry.metadata,
      },
      document: entry.document,
    };

    try {
      logger.debug(204, 'VECTOR_DB_REQUEST', 'vectorStore.ts', 'storeItineraryVector', {
        endpoint: VECTOR_ENDPOINT,
        workflowId,
        entryId: entry.id,
        hasApiKey: Boolean(VECTOR_API_KEY),
        embeddingModel,
        category: entry.metadata?.category,
      });

      const response = await fetch(VECTOR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(VECTOR_API_KEY ? { Authorization: `Bearer ${VECTOR_API_KEY}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        failures.push({ id: entry.id, error: `HTTP ${response.status}: ${errorBody}` });
        logger.error(205, 'VECTOR_DB_REQUEST_FAILED', 'vectorStore.ts', 'storeItineraryVector', `HTTP ${response.status}`, {
          workflowId,
          entryId: entry.id,
          status: response.status,
          body: errorBody,
        });
        continue;
      }

      const result = await response.json().catch(() => ({ id: entry.id }));
      const storedId = result?.id || entry.id;
      successes.push(storedId);

      logger.log(206, 'VECTOR_DB_REQUEST_SUCCEEDED', 'vectorStore.ts', 'storeItineraryVector', {
        workflowId,
        entryId: entry.id,
        storedId,
        category: entry.metadata?.category,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ id: entry.id, error: message });
      logger.error(207, 'VECTOR_DB_REQUEST_ERROR', 'vectorStore.ts', 'storeItineraryVector', message, {
        workflowId,
        entryId: entry.id,
      });
    }
  }

  return {
    stored: failures.length === 0 && successes.length > 0,
    vectorIds: successes,
    failures: failures.length > 0 ? failures : undefined,
    message: failures.length > 0 ? 'Some vector entries failed to store' : undefined,
  };
}

function buildVectorEntries({
  workflowId,
  keyFacts,
}: {
  workflowId: string;
  keyFacts: KeyFacts;
}): VectorEntry[] {
  const overviewText = buildOverviewText(keyFacts);

  if (!overviewText) {
    return [];
  }

  return [
    {
      id: `${workflowId}:facts`,
      text: overviewText,
      metadata: {
        category: 'facts',
      },
      document: {
        destination: keyFacts.destination ?? null,
        budget: keyFacts.budget ?? null,
        dates: keyFacts.dates ?? null,
        travelPartyFirstSentence: keyFacts.travelPartyFirstSentence ?? null,
      },
    },
  ];
}

function buildOverviewText(keyFacts: KeyFacts): string {
  const lines: string[] = [];

  if (keyFacts.destination) {
    lines.push(`Destination: ${keyFacts.destination}`);
  }
  if (keyFacts.dates) {
    lines.push(`Dates: ${keyFacts.dates}`);
  }
  if (keyFacts.budget) {
    lines.push(`Budget: ${keyFacts.budget}`);
  }

  const travelPartyLine = keyFacts.travelPartyFirstSentence ?? keyFacts.travelParty;
  if (travelPartyLine) {
    lines.push(`Travel Party: ${travelPartyLine}`);
  }

  return lines.join('\n');
}

function extractKeyFacts(itinerary: unknown, fallbackDestination?: string, formData?: Record<string, any>): KeyFacts {
  const facts: KeyFacts = {};
  const data = (typeof itinerary === 'object' && itinerary !== null ? itinerary : {}) as Record<string, any>;

  const tripSummary = typeof data.tripSummary === 'object' && data.tripSummary !== null ? (data.tripSummary as Record<string, any>) : {};
  const keyDetails = typeof data.keyDetails === 'object' && data.keyDetails !== null ? (data.keyDetails as Record<string, any>) : {};
  const summary = typeof data.summary === 'object' && data.summary !== null ? (data.summary as Record<string, any>) : {};

  facts.destination =
    sanitizeString(keyDetails.destination) ||
    sanitizeString(tripSummary.destination) ||
    sanitizeString(data.destination) ||
    sanitizeString(data.location) ||
    sanitizeString(summary.destination) ||
    sanitizeString(fallbackDestination) ||
    sanitizeString(formData?.location);

  facts.budget =
    sanitizeString(keyDetails.budget) ||
    sanitizeString(tripSummary.budgetDisplay) ||
    sanitizeString(data.budget) ||
    sanitizeString(summary.budget) ||
    formatBudgetFromFormData(formData);

  const dates =
    sanitizeString(keyDetails.dates) ||
    sanitizeString((keyDetails as Record<string, any>).dateDisplay) ||
    sanitizeString(tripSummary.dateDisplay) ||
    sanitizeString(data.dates) ||
    sanitizeString(summary.dates) ||
    formatDatesFromFormData(formData);
  facts.dates = dates || undefined;

  const travelParty =
    sanitizeString(keyDetails.travelers) ||
    sanitizeString((keyDetails as Record<string, any>).travelParty) ||
    sanitizeString(tripSummary.travelerCount) ||
    sanitizeString(tripSummary.travelers) ||
    sanitizeString(data.travelParty) ||
    sanitizeString(summary.travelParty) ||
    buildTravelPartyFromFormData(formData);

  facts.travelParty = travelParty;
  facts.travelPartyFirstSentence = travelParty ? firstSentence(travelParty) : undefined;

  return facts;
}

function formatBudgetFromFormData(formData?: Record<string, any>): string | undefined {
  if (!formData) {
    return undefined;
  }

  if (formData.flexibleBudget === true) {
    return 'Flexible budget';
  }

  if (typeof formData.budget === 'number' && Number.isFinite(formData.budget)) {
    const currency = sanitizeString(formData.currency) ?? 'USD';
    return `${currency} ${formData.budget}`;
  }

  return sanitizeString(formData.budgetDisplay);
}

function formatDatesFromFormData(formData?: Record<string, any>): string | undefined {
  if (!formData) {
    return undefined;
  }

  const depart = sanitizeString(formData.departDate);
  const ret = sanitizeString(formData.returnDate);
  const plannedDays = typeof formData.plannedDays === 'number' && Number.isFinite(formData.plannedDays) ? formData.plannedDays : undefined;

  if (depart && ret) {
    return `${depart} – ${ret}`;
  }

  if (depart && plannedDays) {
    return `${depart} for ${plannedDays} days`;
  }

  if (depart) {
    return `Departing ${depart}`;
  }

  if (plannedDays) {
    return `${plannedDays} day itinerary (flexible dates)`;
  }

  if (formData.flexibleDates === true) {
    return 'Flexible dates';
  }

  return undefined;
}

function buildTravelPartyFromFormData(formData?: Record<string, any>): string | undefined {
  if (!formData) {
    return undefined;
  }

  const adults = typeof formData.adults === 'number' && formData.adults >= 0 ? formData.adults : undefined;
  const children = typeof formData.children === 'number' && formData.children >= 0 ? formData.children : undefined;

  if (adults == null && children == null) {
    return undefined;
  }

  const parts: string[] = [];

  if (typeof adults === 'number') {
    parts.push(`${adults} adult${adults === 1 ? '' : 's'}`);
  }

  if (typeof children === 'number' && children > 0) {
    parts.push(`${children} child${children === 1 ? '' : 'ren'}`);
  }

  return parts.join(', ');
}

function sanitizeString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function firstSentence(value: string): string {
  const trimmed = value.trim();
  const periodIndex = trimmed.indexOf('.');

  if (periodIndex === -1) {
    return trimmed;
  }

  return trimmed.slice(0, periodIndex + 1).trim();
}

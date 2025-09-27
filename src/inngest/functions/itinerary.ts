import { storeItineraryVector } from '@/lib/vector/vectorStore';
import { stateStore } from '@/lib/redis/stateStore';
import { logger } from '@/utils/console-logger';
import { buildGrokItineraryPrompt, generateGrokItineraryDraft } from '@/lib/ai/architectAI';
import { inngest } from '@/inngest/client';

/**
 * Itinerary generation workflow using Inngest
 * Orchestrates AI calls, research, logging, and Redis persistence
 */
export const itineraryWorkflow = inngest.createFunction(
  {
    id: 'itinerary.generate',
    name: 'Generate AI Itinerary',
    retries: 3,
  },
  { event: 'itinerary.generate.requested' },
  async ({ event, step }) => {
    const { formData, sessionId, workflowId } = event.data;

    logger.log(14, 'INNGEST_WORKFLOW_STARTED', 'inngest/functions/itinerary.ts', 'itineraryWorkflow', {
      workflowId,
      sessionId,
      location: formData.location,
      adults: formData.adults,
    });

    // Store initial workflow state
    await stateStore.storeItineraryState({
      workflowId,
      sessionId,
      status: 'processing',
      formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Step 1: AI Itinerary Architect (Grok-4-fast-reasoning)
    const aiArchitectResult = await step.run('ai-itinerary-architect', async () => {
      logger.log(15, 'AI_ARCHITECT_STARTED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
        workflowId,
        destination: formData.location,
        adults: formData.adults,
        children: formData.children ?? 0,
      });

      const prompt = buildGrokItineraryPrompt(formData as any);
      logger.log(15, 'AI_PROMPT_PREVIEW', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
        workflowId,
        promptLength: prompt.length,
        promptPreview: prompt.slice(0, 1200),
      });

      const modelName = 'grok-4-fast-reasoning';
      logger.log(15, 'XAI_MODEL_INITIALIZED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
        workflowId,
        model: modelName,
        apiKeyPresent: Boolean(process.env.XAI_API_KEY),
        apiKeyLength: process.env.XAI_API_KEY?.length ?? 0,
      });

      const startedAt = Date.now();

      try {
        logger.log(15, 'XAI_REQUEST_DISPATCHED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          workflowId,
          model: modelName,
          promptCharacters: prompt.length,
        });

        const draft = await generateGrokItineraryDraft({
          prompt,
          model: modelName,
        });

        logger.log(16, 'XAI_RESPONSE_METADATA', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          workflowId,
          model: modelName,
          finishReason: draft.metadata.finishReason,
          warnings: draft.metadata.warnings,
          usage: draft.metadata.usage,
          responseStatus: draft.metadata.responseStatus,
          hasResponse: typeof draft.metadata.responseStatus !== 'undefined',
          latencyMs: draft.metadata.latencyMs,
          responseBodyPreview: draft.metadata.responseBodyPreview,
        });

        if (draft.metadata.fallbackSource !== 'none') {
          logger.log(16, 'XAI_RESPONSE_FALLBACK_USED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
            workflowId,
            model: modelName,
            fallbackSource: draft.metadata.fallbackSource,
          });
        }

        logger.log(16, 'AI_RESPONSE_OUTPUT', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          aiResponse: draft.rawOutput,
        });

        const itinerary = draft.itinerary as Record<string, any>;

        const vectorResult = await storeItineraryVector({
          workflowId,
          sessionId,
          destination: formData.location,
          rawContent: draft.cleanedJson,
          itinerary,
          model: modelName,
          formData,
        });

        logger.log(16, 'AI_ARCHITECT_COMPLETED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', {
          workflowId,
          durationMs: Date.now() - startedAt,
          generatedDays: Array.isArray((itinerary as any)?.dailyPlans)
            ? (itinerary as any).dailyPlans.length
            : Array.isArray((itinerary as any)?.dailyItinerary)
              ? (itinerary as any).dailyItinerary.length
              : Array.isArray((itinerary as any)?.days)
                ? (itinerary as any).days.length
                : 0,
          storedInVector: vectorResult.stored,
          vectorIds: vectorResult.vectorIds,
          vectorFailures: vectorResult.failures?.length ?? 0,
          usage: draft.metadata.usage,
          reasoningCharacters: 0,
        });

        return {
          itinerary,
          rawOutput: draft.cleanedJson,
          vectorResult,
          model: modelName,
          usage: draft.metadata.usage,
          reasoning: null,
        };
      } catch (error) {
        logger.error(17, 'AI_ARCHITECT_FAILED', 'inngest/functions/itinerary.ts', 'aiItineraryArchitect', error instanceof Error ? error : String(error), {
          workflowId,
        });
        throw error;
      }
    });

    // Store final result in Redis
    await step.run('store-itinerary', async () => {
      logger.log(20, 'REDIS_STORAGE_STARTED', 'inngest/functions/itinerary.ts', 'storeItinerary', {
        workflowId,
        vectorCount: aiArchitectResult.vectorResult.vectorIds.length,
        vectorFailures: aiArchitectResult.vectorResult.failures?.length ?? 0,
      });

      const stored = await stateStore.storeItineraryState({
        workflowId,
        sessionId,
        status: 'completed',
        formData,
        itinerary: aiArchitectResult.itinerary,
        research: {},
        vector: aiArchitectResult.vectorResult,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (!stored) {
        logger.warn(21, 'REDIS_STORAGE_FAILED', 'inngest/functions/itinerary.ts', 'storeItinerary', 'Failed to store itinerary in Redis', {
          workflowId,
        });
      }

      return { stored };
    });

    logger.log(21, 'INNGEST_WORKFLOW_COMPLETED', 'inngest/functions/itinerary.ts', 'itineraryWorkflow', {
      workflowId,
      status: 'completed',
    });

    return {
      success: true,
      workflowId,
      itinerary: aiArchitectResult.itinerary,
      rawAiOutput: aiArchitectResult.rawOutput,
      vector: aiArchitectResult.vectorResult,
      usage: aiArchitectResult.usage,
      reasoning: aiArchitectResult.reasoning,
    };
  },
);

export const functions = [itineraryWorkflow];

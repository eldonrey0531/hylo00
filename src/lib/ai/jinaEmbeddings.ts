const JINA_ENDPOINT = 'https://api.jina.ai/v1/embeddings';

export interface JinaEmbeddingOptions {
  model?: string;
  task?: 'text-search' | 'text-matching' | 'clustering' | 'classification';
  inputType?: 'search_document' | 'search_query' | 'text';
}

export interface JinaEmbeddingResponse {
  embeddings: number[][];
  usage?: {
    totalTokens?: number;
    promptTokens?: number;
    embeddingTokens?: number;
  };
  model: string;
}

export async function generateJinaEmbeddings(
  inputs: string[],
  { model = 'jina-embeddings-v3', task = 'text-matching', inputType = 'text' }: JinaEmbeddingOptions = {},
): Promise<JinaEmbeddingResponse> {
  if (!inputs || inputs.length === 0) {
    throw new Error('Jina embeddings require at least one input string.');
  }

  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error('JINA_API_KEY is not configured.');
  }

  const body = {
    model,
    task,
    input_type: inputType,
    input: inputs,
  };

  const response = await fetch(JINA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Jina embeddings request failed (${response.status}): ${responseText}`);
  }

  let parsed: any;
  try {
    parsed = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    throw new Error('Failed to parse Jina embeddings response.');
  }

  const data = Array.isArray(parsed?.data) ? parsed.data : [];
  if (data.length === 0 || !Array.isArray(data[0]?.embedding)) {
    throw new Error('Jina embeddings response missing embedding vector.');
  }

  return {
    embeddings: data.map((entry: any) => entry.embedding as number[]),
    usage: parsed?.usage,
    model: parsed?.model ?? model,
  };
}

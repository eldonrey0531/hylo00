import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

async function main() {
  loadEnvLocal();
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error('Missing XAI_API_KEY environment variable.');
    process.exitCode = 1;
    return;
  }

  try {
    const startedAt = Date.now();
    const result = await callXai(apiKey, buildPrompt());

    const latency = Date.now() - startedAt;

    console.log('\n=== Grok Reasoning Demo ===');
    console.log('Latency (ms):', latency);
    console.log('Finish reason:', result.finish_reason ?? 'unknown');
    console.log('Token usage:', result.usage ?? 'n/a');
    console.log('\nRaw output (truncated):');
    if (result.text) {
      logTruncated(result.text, 1200);
    } else {
      console.log('[empty response body]');
      console.dir(result.raw, { depth: 6 });
    }
  } catch (error) {
    console.error('Grok reasoning call failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function buildPrompt(): string {
  return `You are an expert travel concierge crafting tailored itineraries. Create a two-day plan for a slow-luxury couple's escape in Lisbon with rooftop cocktails, Michelin-level dining, and a private sailing excursion.`;
}

function logTruncated(text: string, limit: number) {
  if (!text) {
    console.log('[empty response]');
    return;
  }

  if (text.length <= limit) {
    console.log(text);
    return;
  }

  console.log(text.slice(0, limit));
  console.log('... [truncated]');
}

void main();

function loadEnvLocal() {
  if (process.env.XAI_API_KEY) {
    return;
  }

  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const [key, ...rest] = trimmed.split('=');
    if (!key) {
      continue;
    }
    const value = rest.join('=').trim();
    if (!process.env[key] && key === 'XAI_API_KEY') {
      process.env[key] = value.replace(/^"|"$/g, '');
    }
  }
}

async function callXai(apiKey: string, prompt: string) {
  const response = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-4-fast-reasoning',
      input: [{ role: 'user', content: prompt }],
      max_output_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`xAI request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = coalesceOutput(data);
  return {
    text,
    finish_reason: data?.output?.[0]?.stopReason ?? data?.output?.[0]?.finish_reason ?? data?.finish_reason,
    usage: data?.usage,
    raw: data,
  };
}

function coalesceOutput(payload: any): string | null {
  if (!payload) return null;
  const outputs = payload.output ?? payload.outputs ?? [];
  const parts: string[] = [];

  for (const item of outputs) {
    const content = item?.content ?? item?.contents;
    if (!content) continue;
    if (Array.isArray(content)) {
      for (const entry of content) {
        if (typeof entry?.text === 'string') {
          parts.push(entry.text);
        } else if (typeof entry === 'string') {
          parts.push(entry);
        }
      }
    } else if (typeof content?.text === 'string') {
      parts.push(content.text);
    }
  }

  if (parts.length === 0) {
    const messageText = payload?.response?.output_text ?? payload?.text;
    return typeof messageText === 'string' ? messageText : null;
  }

  return parts.join('\n');
}

import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';

const SAMPLE_PROMPT = `You are Hylo's concierge itinerary architect.
Draft a one-day sample itinerary for Paris that balances iconic landmarks, food, and local experiences.
Return the itinerary as rich markdown with section headings and bullets.
Include morning, afternoon, evening anchors, plus transport, dining, and an estimated budget range.
Keep the tone upbeat and concierge-like.`;

async function main() {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    console.error('Missing XAI_API_KEY environment variable. Set it before running this script.');
    process.exit(1);
  }

  const xai = createXai({
    apiKey,
  });

  console.log('Requesting itinerary draft from grok-4-fast-reasoning...');

  const result = await generateText({
    model: xai('grok-4-fast-reasoning') as any,
  prompt: SAMPLE_PROMPT,
  maxTokens: 4000,
    temperature: 0.6,
  });

  console.log('\n=== Raw Text Response ===\n');
  console.log(result.text ?? '(no text field returned)');

  console.log('\n=== Usage Metadata ===\n');
  console.dir(
    {
      finishReason: result.finishReason,
      usage: result.usage,
      warnings: result.warnings,
    },
    { depth: null },
  );
}

main().catch((error) => {
  console.error('Failed to generate itinerary draft:', error);
  process.exit(1);
});

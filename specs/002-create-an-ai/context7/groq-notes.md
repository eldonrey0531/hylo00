# Context7 Notes: Groq + Vercel AI SDK

## Provider Setup
- Import the Groq provider from `@ai-sdk/groq` and pass the model slug when calling helpers (`groq('openai/gpt-oss-120b')`).
- Groq models are accessed through the shared `streamText` API from the `ai` package; provide either a `prompt` or structured `messages`.
- The provider reads `GROQ_API_KEY` by default, matching our `.env.template` entry.

## Streaming Patterns
- `streamText` returns an iterator—iterate `result.textStream` for plain text or `result.fullStream` for delta metadata (`{ type: 'text-delta', text }`).
- To surface streaming responses in Next.js route handlers, return `result.toUIMessageStreamResponse()`; this works with the App Router (`app/api/.../route.ts`).
- Use `convertToModelMessages(messages)` when forwarding React UI chat history to the Groq model to preserve roles and attachments.

## Tool & Callback Usage
- Groq exposes built-in tools via `groq.tools.*`; e.g., `groq.tools.browserSearch({})` enables live search. Set `toolChoice: 'required'` to force invocation.
- Supply optional callbacks like `onFinish` to capture the final text, token usage, and generated messages for logging or persistence.
- Call `result.consumeStream()` if you need the stream to run to completion regardless of client disconnects; this keeps `onFinish` firing for audits.

## Helpful References
- Groq provider README snippet: `packages/groq/README.md#_snippet_3`
- AI SDK streaming cookbook example: `content/cookbook/05-node/21-stream-text-with-chat-prompt.mdx#_snippet_0`
- Streaming API handler pattern: `content/cookbook/01-next/21-stream-text-with-chat-prompt.mdx#_snippet_1`

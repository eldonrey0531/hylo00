import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.XAI_API_KEY) {
      return NextResponse.json({ error: 'XAI_API_KEY not configured' }, { status: 500 });
    }

    // Test 1: Simple chat completion
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4-fast-reasoning',
        messages: [
          { role: 'user', content: 'Say hello in one word.' }
        ],
        temperature: 0.7,
      }),
    });

    const responseStatus = response.status;
    const responseBody = await response.text();

    let parsedBody;
    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      parsedBody = null;
    }

    return NextResponse.json({
      success: response.ok,
      status: responseStatus,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: parsedBody || responseBody,
      rawBody: responseBody.slice(0, 1000),
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

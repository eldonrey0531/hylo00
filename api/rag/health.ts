/**
 * RAG System Health API - Health monitoring and status
 * T049: System health endpoint for monitoring
 * Vercel Edge Function for constitutional compliance
 */

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const healthResponse = {
      status: 'ok',
      service: 'rag-health',
      timestamp: new Date().toISOString(),
      message: 'RAG health service is running (Edge mode)',
      services: {
        session: 'disabled',
        vector: 'disabled',
        qdrant: 'disabled',
        huggingface: 'disabled',
      },
      environment: 'edge',
    };

    return new Response(JSON.stringify(healthResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
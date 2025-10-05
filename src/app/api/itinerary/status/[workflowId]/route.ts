import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/console-logger';
import { stateStore } from '@/lib/redis/stateStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const startTime = Date.now();
  const { workflowId } = await params;

  try {
    logger.log(1, 'Status check request received', 'status/[workflowId]/route.ts', 'GET', { workflowId });

    // Validate workflow ID format
    if (!workflowId || !workflowId.startsWith('workflow_')) {
      logger.error(2, 'Invalid workflow ID format', 'status/[workflowId]/route.ts', 'GET', 'ValidationError: Invalid workflow ID');
      return NextResponse.json(
        { error: 'Invalid workflow ID format', success: false },
        { status: 400 }
      );
    }

    // Fetch actual workflow state from stateStore
    logger.log(3, 'Fetching workflow state from stateStore', 'status/[workflowId]/route.ts', 'GET', { workflowId });

    const workflowState = await stateStore.getItineraryState(workflowId);

    if (!workflowState) {
      logger.error(4, 'Workflow state not found', 'status/[workflowId]/route.ts', 'GET', 'Workflow not found in stateStore');
      return NextResponse.json(
        { error: 'Workflow not found', success: false },
        { status: 404 }
      );
    }

    logger.log(5, 'Workflow state retrieved', 'status/[workflowId]/route.ts', 'GET', {
      status: workflowState.status,
      hasItinerary: !!workflowState.itinerary,
      hasLayout: !!workflowState.layout,
      hasLayoutContent: !!workflowState.layout?.content,
    });

    // Map status and prepare response
    const status = workflowState.status;
    const progress = status === 'completed' ? 100 : status === 'processing' ? 50 : 10;
    const currentStep = status === 'completed' ? 'Itinerary generation complete' :
                       status === 'processing' ? 'Generating AI itinerary content' :
                       'Initializing workflow';

    // Return structured response with the stored itinerary data
    let parsedItinerary: any | null = workflowState.layout?.content ?? null;
    let rawItinerary: string | null = null;
    let itineraryParseError: string | null = null;

    if (!parsedItinerary) {
      if (workflowState.itinerary) {
        rawItinerary = typeof workflowState.itinerary === 'string'
          ? workflowState.itinerary
          : JSON.stringify(workflowState.itinerary, null, 2);

        try {
          parsedItinerary = JSON.parse(rawItinerary);
          console.log('✅ [STATUS API] Successfully parsed itinerary JSON:', {
            workflowId,
            hasIntro: !!parsedItinerary?.intro,
            dailyPlansCount: Array.isArray(parsedItinerary?.dailyPlans) ? parsedItinerary.dailyPlans.length : 0,
            originalStringLength: rawItinerary.length,
          });
        } catch (error) {
          itineraryParseError = error instanceof Error ? error.message : String(error);
          console.error('❌ [STATUS API] Failed to parse itinerary JSON:', {
            workflowId,
            error: itineraryParseError,
            originalStringPreview: rawItinerary.slice(0, 200),
          });
          parsedItinerary = null;
        }
      } else {
        console.log('⚠️ [STATUS API] No itinerary data found in workflow state:', {
          workflowId,
          workflowStateKeys: Object.keys(workflowState),
        });
      }
    } else {
      rawItinerary = typeof workflowState.itinerary === 'string'
        ? workflowState.itinerary
        : JSON.stringify(workflowState.itinerary, null, 2);
      console.log('✅ [STATUS API] Using pre-formatted layout content for itinerary response:', {
        workflowId,
        hasIntro: !!parsedItinerary?.intro,
        dailyPlanBuckets: Array.isArray(parsedItinerary?.daily)
          ? parsedItinerary.daily.length
          : 0,
      });
    }

    const response = {
      success: true,
      status,
      progress,
      currentStep,
      itinerary: parsedItinerary, // Use the parsed itinerary
      rawItinerary,
      itineraryParseError,
      formData: workflowState.formData || null,
      error: workflowState.error || null,
      createdAt: workflowState.createdAt,
      updatedAt: workflowState.updatedAt,
      layoutMetadata: workflowState.layout
        ? {
            model: workflowState.layout.model,
            usedGroq: workflowState.layout.usedGroq,
          }
        : null,
    };

    logger.log(6, 'Status response prepared', 'status/[workflowId]/route.ts', 'GET', {
      status,
      progress,
      hasItinerary: !!response.itinerary,
      processingTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error(7, 'Status check failed', 'status/[workflowId]/route.ts', 'GET', error instanceof Error ? error.message : String(error), {
      workflowId,
      processingTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        status: 'error',
        progress: 0,
        currentStep: 'Error occurred',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/console-logger';
import { inngest } from '@/inngest/client';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.log(1, 'Itinerary generation request received', 'route.ts', 'POST');

    // Parse request body
    const body = await request.json();
    const { formData, sessionId, options = {} } = body;

    logger.log(2, 'Request parsed', 'route.ts', 'POST', {
      hasFormData: !!formData,
      sessionId: sessionId || 'not-provided',
      options
    });

    // Basic validation - just check if formData exists
    if (!formData) {
      logger.error(3, 'Missing formData in request', 'route.ts', 'POST', 'ValidationError: formData is required');
      return NextResponse.json(
        { error: 'formData is required', success: false },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.log(4, 'Session ID resolved', 'route.ts', 'POST', { sessionId: finalSessionId });

    // Log the received form data
    logger.log(5, 'Form data received', 'route.ts', 'POST', {
      location: formData.location,
      adults: formData.adults,
      budget: formData.budget,
      currency: formData.currency,
      dataSize: JSON.stringify(formData).length
    });

    // Generate workflow ID
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.log(25, 'Workflow ID generated', 'route.ts', 'POST', { workflowId });

    // Calculate estimated completion time (mock: 2-5 minutes)
    const estimatedCompletion = new Date(Date.now() + (3 * 60 * 1000)).toISOString(); // 3 minutes from now
    logger.log(26, 'Estimated completion calculated', 'route.ts', 'POST', { estimatedCompletion });

    // Generate status endpoint URL
    const statusEndpoint = `${request.nextUrl.origin}/api/itinerary/status/${workflowId}`;
    logger.log(27, 'Status endpoint generated', 'route.ts', 'POST', { statusEndpoint });

    // Step 28-32: Enqueue Inngest workflow
    logger.log(28, 'Workflow enqueue starting', 'route.ts', 'POST', { workflowId });
    
    try {
      await inngest.send({
        name: "itinerary.generate.requested",
        data: {
          formData,
          sessionId: finalSessionId,
          workflowId
        }
      });
      
      logger.log(29, 'Workflow enqueued successfully', 'route.ts', 'POST', { workflowId });
    } catch (error) {
      logger.error(30, 'Failed to enqueue workflow', 'route.ts', 'POST', error instanceof Error ? error.message : String(error));
      return NextResponse.json(
        { error: 'Failed to start workflow', success: false },
        { status: 500 }
      );
    }

    // Step 33: Store initial workflow state in Redis (mock for now)
    logger.log(33, 'Workflow state storage simulation', 'route.ts', 'POST', {
      workflowId,
      status: 'queued',
      message: 'Redis storage would happen here'
    });

    const processingTime = Date.now() - startTime;
    logger.log(34, 'API request completed successfully', 'route.ts', 'POST', {
      workflowId,
      sessionId: finalSessionId,
      processingTimeMs: processingTime
    });

    // Return success response per contract
    return NextResponse.json({
      success: true,
      workflowId,
      estimatedCompletion,
      statusEndpoint,
      message: 'Itinerary generation started successfully',
      sessionId: finalSessionId
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(35, 'Unexpected error in itinerary generation', 'route.ts', 'POST', error instanceof Error ? error : String(error), {
      processingTimeMs: processingTime
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}

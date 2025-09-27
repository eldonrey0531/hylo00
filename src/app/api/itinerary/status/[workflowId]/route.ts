import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/console-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  const startTime = Date.now();
  const workflowId = params.workflowId;

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

    // TODO: Step 3-4: Check Redis for actual workflow state (T027)
    // For now, simulate workflow progress based on workflow ID timestamp
    const workflowTimestamp = workflowId.split('_')[1];
    const workflowAge = Date.now() - parseInt(workflowTimestamp || '0');
    const ageInMinutes = workflowAge / (1000 * 60);

    logger.log(3, 'Workflow age calculated', 'status/[workflowId]/route.ts', 'GET', {
      workflowTimestamp,
      ageInMinutes,
      workflowAge
    });

    // Simulate progress based on age (mock implementation)
    let status: 'pending' | 'processing' | 'complete' | 'error';
    let progress: number;
    let currentStep: string;
    let itinerary = null;
    let error = null;

    if (ageInMinutes < 0.5) {
      status = 'pending';
      progress = 1;
      currentStep = 'Initializing workflow';
    } else if (ageInMinutes < 1) {
      status = 'processing';
      progress = 5;
      currentStep = 'Validating form data';
    } else if (ageInMinutes < 2) {
      status = 'processing';
      progress = 10;
      currentStep = 'Researching destination data';
    } else if (ageInMinutes < 3) {
      status = 'processing';
      progress = 15;
      currentStep = 'Generating AI itinerary content';
    } else if (ageInMinutes < 4) {
      status = 'processing';
      progress = 20;
      currentStep = 'Assembling final itinerary';
    } else if (ageInMinutes < 5) {
      status = 'complete';
      progress = 24;
      currentStep = 'Itinerary generation complete';
      // Mock completed itinerary
      itinerary = {
        id: `itinerary_${workflowId}`,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0',
          status: 'complete'
        },
        summary: {
          location: 'Paris, France',
          duration: '5 days',
          travelers: '2 adults',
          budget: '$3000 USD',
          theme: 'Cultural exploration'
        },
        keyDetails: [
          '5-day itinerary',
          'Cultural focus',
          '$3000 budget',
          '2 travelers'
        ],
        dailyActivities: [
          {
            day: 1,
            date: '2024-06-01',
            activities: [
              {
                time: '09:00',
                title: 'Arrival and hotel check-in',
                description: 'Arrive in Paris and settle into your accommodation',
                location: 'Hotel in city center'
              }
            ]
          }
        ],
        travelTips: [
          {
            category: 'transportation',
            priority: 'high',
            title: 'Use Paris Metro',
            content: 'The metro is efficient and covers the entire city'
          }
        ]
      };
    } else {
      // Simulate occasional errors for testing
      if (Math.random() < 0.1) {
        status = 'error';
        progress = 0;
        currentStep = 'Failed during processing';
        error = 'AI service temporarily unavailable';
      } else {
        status = 'complete';
        progress = 24;
        currentStep = 'Itinerary generation complete';
        itinerary = {
          id: `itinerary_${workflowId}`,
          metadata: {
            createdAt: new Date().toISOString(),
            version: '1.0',
            status: 'complete'
          },
          summary: {
            location: 'Paris, France',
            duration: '5 days',
            travelers: '2 adults',
            budget: '$3000 USD',
            theme: 'Cultural exploration'
          },
          keyDetails: [
            '5-day itinerary',
            'Cultural focus',
            '$3000 budget',
            '2 travelers'
          ],
          dailyActivities: [
            {
              day: 1,
              date: '2024-06-01',
              activities: [
                {
                  time: '09:00',
                  title: 'Arrival and hotel check-in',
                  description: 'Arrive in Paris and settle into your accommodation',
                  location: 'Hotel in city center'
                }
              ]
            }
          ],
          travelTips: [
            {
              category: 'transportation',
              priority: 'high',
              title: 'Use Paris Metro',
              content: 'The metro is efficient and covers the entire city'
            }
          ]
        };
      }
    }

    // Generate mock logs based on progress
    const logs = [];
    for (let i = 1; i <= progress; i++) {
      logs.push({
        step: i,
        timestamp: new Date(Date.now() - (progress - i) * 10000).toISOString(),
        message: `Step ${i} completed`,
        file: 'workflow.ts',
        method: 'process',
        level: 'info',
        data: { workflowId }
      });
    }

    logger.log(4, 'Status response prepared', 'status/[workflowId]/route.ts', 'GET', {
      status,
      progress,
      currentStep,
      hasItinerary: !!itinerary,
      logCount: logs.length
    });

    const processingTime = Date.now() - startTime;
    logger.log(5, 'Status check completed', 'status/[workflowId]/route.ts', 'GET', {
      workflowId,
      status,
      processingTimeMs: processingTime
    });

    // Return status response per contract
    return NextResponse.json({
      status,
      progress,
      currentStep,
      itinerary,
      error,
      logs
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(6, 'Unexpected error in status check', 'status/[workflowId]/route.ts', 'GET', error instanceof Error ? error : String(error), {
      workflowId,
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
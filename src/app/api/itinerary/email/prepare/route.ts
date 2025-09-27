import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/console-logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.log(1, 'Email preparation request received', 'email/prepare/route.ts', 'POST');

    const body = await request.json();
    const { itineraryId, includeAttachment = true, customMessage = '' } = body;

    logger.log(2, 'Request parsed', 'email/prepare/route.ts', 'POST', {
      itineraryId,
      includeAttachment,
      hasCustomMessage: !!customMessage
    });

    // Validate required fields
    if (!itineraryId) {
      logger.error(3, 'Missing itineraryId in request', 'email/prepare/route.ts', 'POST', 'ValidationError: itineraryId is required');
      return NextResponse.json(
        { error: 'itineraryId is required', success: false },
        { status: 400 }
      );
    }

    // TODO: Step 4-5: Retrieve itinerary from Redis (T027)
    // For now, simulate retrieving itinerary data
    logger.log(4, 'Retrieving itinerary data', 'email/prepare/route.ts', 'POST', { itineraryId });

    // Mock itinerary data
    const mockItinerary = {
      id: itineraryId,
      summary: {
        location: 'Paris, France',
        duration: '5 days',
        travelers: '2 adults',
        budget: '$3000 USD',
        theme: 'Cultural exploration'
      },
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
            },
            {
              time: '14:00',
              title: 'Visit Eiffel Tower',
              description: 'Iconic landmark visit with guided tour',
              location: 'Champ de Mars, 5 Avenue Anatole France'
            }
          ]
        },
        {
          day: 2,
          date: '2024-06-02',
          activities: [
            {
              time: '10:00',
              title: 'Louvre Museum',
              description: 'Explore world-famous art collection',
              location: 'Rue de Rivoli, 75001 Paris'
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
        },
        {
          category: 'food',
          priority: 'medium',
          title: 'Try local bakeries',
          content: 'Fresh croissants and pastries are a must-try'
        }
      ]
    };

    // TODO: Step 6-8: Generate PDF attachment if requested (T031, T032)
    let attachmentUrl = null;
    if (includeAttachment) {
      logger.log(6, 'Generating PDF attachment', 'email/prepare/route.ts', 'POST');
      // Mock PDF generation
      attachmentUrl = `${request.nextUrl.origin}/api/itinerary/export/pdf?itineraryId=${itineraryId}&format=standard`;
      logger.log(7, 'PDF attachment URL generated', 'email/prepare/route.ts', 'POST', { attachmentUrl });
    }

    // Step 9: Generate email content
    logger.log(8, 'Generating email content', 'email/prepare/route.ts', 'POST');

    const subject = `Your Personalized Itinerary: ${mockItinerary.summary.location}`;

    const customMessageHtml = customMessage
      ? `<p><strong>Personal Note:</strong> ${customMessage.replace(/\n/g, '<br>')}</p>`
      : '';

    const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Itinerary</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .day { margin: 20px 0; border-left: 4px solid #667eea; padding-left: 15px; }
        .activity { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 3px; }
        .tips { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Personalized Travel Itinerary</h1>
        <p>Created especially for your trip to ${mockItinerary.summary.location}</p>
    </div>

    <div class="content">
        ${customMessageHtml}

        <div class="summary">
            <h2>Trip Summary</h2>
            <p><strong>Destination:</strong> ${mockItinerary.summary.location}</p>
            <p><strong>Duration:</strong> ${mockItinerary.summary.duration}</p>
            <p><strong>Travelers:</strong> ${mockItinerary.summary.travelers}</p>
            <p><strong>Budget:</strong> ${mockItinerary.summary.budget}</p>
            <p><strong>Theme:</strong> ${mockItinerary.summary.theme}</p>
        </div>

        <h2>Daily Itinerary</h2>
        ${mockItinerary.dailyActivities.map(day => `
            <div class="day">
                <h3>Day ${day.day}: ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                ${day.activities.map(activity => `
                    <div class="activity">
                        <strong>${activity.time} - ${activity.title}</strong><br>
                        ${activity.description}<br>
                        <em>Location: ${activity.location}</em>
                    </div>
                `).join('')}
            </div>
        `).join('')}

        <div class="tips">
            <h2>Travel Tips</h2>
            ${mockItinerary.travelTips.map(tip => `
                <div style="margin: 10px 0;">
                    <strong>${tip.title}</strong> (${tip.category})<br>
                    ${tip.content}
                </div>
            `).join('')}
        </div>
    </div>

    <div class="footer">
        <p>This itinerary was generated using AI to create a personalized travel experience.</p>
        <p>For questions or modifications, please contact our support team.</p>
    </div>
</body>
</html>`;

    logger.log(9, 'Email content generated', 'email/prepare/route.ts', 'POST', {
      subjectLength: subject.length,
      bodyLength: body.length,
      hasAttachment: !!attachmentUrl
    });

    const processingTime = Date.now() - startTime;
    logger.log(10, 'Email preparation completed successfully', 'email/prepare/route.ts', 'POST', {
      itineraryId,
      processingTimeMs: processingTime
    });

    // Return email data per contract
    return NextResponse.json({
      success: true,
      emailData: {
        subject,
        body: emailBody,
        attachmentUrl
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(11, 'Unexpected error in email preparation', 'email/prepare/route.ts', 'POST', error instanceof Error ? error : String(error), {
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
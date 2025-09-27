'use client'

import { useState, useEffect } from 'react';
import TripDetails from '@/components/forms/TripDetails';
import { FormData } from '@/components/forms/TripDetails/types';
import ConditionalTravelStyle from '@/components/forms/ConditionalTravelStyle';
import { TravelStyleGroup } from '@/components/forms/TravelStyleGroup';
import { TravelStyleChoice } from '@/types/travel-style-choice';

function Page() {
  const [formData, setFormData] = useState<FormData>({
    location: '',
    departDate: '',
    returnDate: '',
    flexibleDates: false,
    adults: 2,
    children: 0,
    childrenAges: [],
    budget: 5000,
    currency: 'USD',
    flexibleBudget: false,
    budgetMode: 'total',
    travelStyleChoice: 'not-selected',
    travelStyleAnswers: {},
    tripNickname: '',
    contactName: '',
    contactEmail: '',
    selectedGroups: [],
    selectedInterests: [],
    selectedInclusions: [],
    customGroupText: '',
    customInterestsText: '',
    customInclusionsText: '',
    inclusionPreferences: {},
    contactInfo: {
      name: '',
      email: '',
      subscribe: true,
    },
  });

  const [travelStyleChoice, setTravelStyleChoice] = useState<TravelStyleChoice>(TravelStyleChoice.NOT_SELECTED);
  const [validationTriggered, setValidationTriggered] = useState<boolean>(false);
  const [customVibesText, setCustomVibesText] = useState<string>('');
  const [lastLogCount, setLastLogCount] = useState<number>(0);

  // Fetch and display server logs in browser console
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        if (data.success && data.logs.length > lastLogCount) {
          const newLogs = data.logs.slice(lastLogCount);
          newLogs.forEach((log: any) => {
            console.log(`[SERVER] Step ${log.stepNumber}: ${log.action} in ${log.fileName} - ${log.functionName}`, log);
          });
          setLastLogCount(data.logs.length);
        }
      } catch (error) {
        console.error('[CLIENT] Failed to fetch server logs:', error);
      }
    };

    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [lastLogCount]);

  // Handle travel style choice selection
  const handleTravelStyleChoice = (choice: TravelStyleChoice) => {
    console.log('handleTravelStyleChoice called', choice);
    setTravelStyleChoice(choice);
    setFormData(prev => ({
      ...prev,
      travelStyleChoice: choice === TravelStyleChoice.DETAILED ? 'answer-questions' :
                         choice === TravelStyleChoice.SKIP ? 'skip-to-details' :
                         'not-selected'
    }));
  };

  // Handle itinerary generation
  const handleGenerateItinerary = async () => {
    console.log('Generating itinerary with data:', formData);

    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          options: {}
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Itinerary generation started successfully!', result);
        alert(`Itinerary generation started! Workflow ID: ${result.workflowId}`);
      } else {
        console.error('❌ Itinerary generation failed:', result);
        alert('Failed to start itinerary generation. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error calling itinerary API:', error);
      alert('An error occurred while starting itinerary generation. Please try again.');
    }
  };

  const handleTripNicknameChange = (nickname: string) => {
    setFormData((prev) => ({
      ...prev,
      tripNickname: nickname,
      travelStyleAnswers: {
        ...prev.travelStyleAnswers,
        tripNickname: nickname,
      },
    }));
  };

  const handleContactInfoChange = (contact: Record<string, any>) => {
    setFormData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        ...contact,
      },
      contactName: contact.name !== undefined ? contact.name : prev.contactName,
      contactEmail: contact.email !== undefined ? contact.email : prev.contactEmail,
    }));
  };

  return (
    <div className="min-h-screen bg-primary py-8 font-raleway">
      <header className="bg-trip-details text-primary py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-3xl">🌏</span>
            <h1 className="text-[35px] font-bold tracking-wide text-primary font-raleway">
              TRIP DETAILS
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="space-y-6">
          <TripDetails formData={formData} onFormChange={setFormData} showAdditionalForms={true} validationErrors={{}} />

          <ConditionalTravelStyle
            choice={travelStyleChoice}
            onChoiceChange={handleTravelStyleChoice}
            formData={formData}
            onFormChange={setFormData}
            onGenerateItinerary={handleGenerateItinerary}
            tripNickname={formData.tripNickname || formData.travelStyleAnswers?.tripNickname || ''}
            onTripNicknameChange={handleTripNicknameChange}
            contactInfo={formData.contactInfo || {}}
            onContactChange={handleContactInfoChange}
          />

          {travelStyleChoice === TravelStyleChoice.DETAILED && (
            <>
              <div className="text-center mb-6 bg-[#f9dd8b] p-6 w-full">
                <h2 className="text-[35px] font-bold text-primary font-raleway mb-2">
                  🌏 Travel Style
                </h2>
                <p className="text-primary font-bold font-raleway text-[27px]">
                  Answer with this group and trip in mind.
                </p>
              </div>

              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <TravelStyleGroup
                  formData={formData}
                  onFormChange={setFormData}
                  validationErrors={{}}
                />
              </div>

              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="mb-4 text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/logs');
                        const data = await response.json();
                        if (data.success) {
                          console.log('📋 All Server Logs:', data.logs);
                          alert(`Fetched ${data.logs.length} server logs. Check browser console for details.`);
                        } else {
                          console.error('Failed to fetch logs:', data.error);
                        }
                      } catch (error) {
                        console.error('Error fetching logs:', error);
                      }
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    📋 View Server Logs in Console
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateItinerary}
                  className="w-full px-12 py-6 rounded-[36px] font-bold font-raleway text-[32px] bg-[#f68854] text-primary hover:shadow-2xl hover:shadow-white/30 border-4 border-white shadow-[inset_0_0_0_2px_rgba(255,255,255,1)] transition-all duration-300 transform hover:scale-105 relative group"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span>GENERATE MY PERSONALIZED ITINERARY</span>
                    <span className="text-2xl">✨</span>
                  </div>
                  <div className="absolute inset-0 rounded-[36px] bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Page;

'use client'

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TripDetails from '@/components/forms/TripDetails';
import { FormData } from '@/components/forms/TripDetails/types';
import ConditionalTravelStyle from '@/components/forms/ConditionalTravelStyle';
import { TravelStyleGroup } from '@/components/forms/TravelStyleGroup';
import { TravelStyleChoice } from '@/types/travel-style-choice';
import ItineraryDisplay from '@/components/ItineraryDisplay';

const STATUS_POLL_INTERVAL = 2000;

const emojiSequence = ["✈️", "🏝️", "🗺️", "🚗", "🛳️", "🎒", "🏨", "🚆", "🚌", "🌍"];

const createHorizontalPath = (index: number) => {
  return {
    x: [0, 400, 1200], // Start from current position, move further to center (400px), then to far right edge (1200px)
    rotateY: [90, 0, -90], // Start rotated (coming from back), face forward, then rotate away (going to back)
  };
};

type LayoutMetadata = {
  model?: string;
  usedGroq?: boolean;
  generatedAt?: string;
};

interface WorkflowLog {
  timestamp?: string;
}

const createInitialFormData = (): FormData => ({
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

function Page() {
  const [formData, setFormData] = useState<FormData>(() => createInitialFormData());

  const [travelStyleChoice, setTravelStyleChoice] = useState<TravelStyleChoice>(TravelStyleChoice.NOT_SELECTED);
  const [lastLogCount, setLastLogCount] = useState<number>(0);
  const [resultFormData, setResultFormData] = useState<FormData | null>(null);
  const [itineraryLayout, setItineraryLayout] = useState<any | null>(null);
  const [layoutMetadata, setLayoutMetadata] = useState<LayoutMetadata | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [rawItinerary, setRawItinerary] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showAnalyzingBanner, setShowAnalyzingBanner] = useState<boolean>(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeWorkflowIdRef = useRef<string | null>(null);
  const notFoundRetryRef = useRef<number>(0);

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

  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, []);

  const clearExistingPoll = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const scheduleNextPoll = (wfId: string, delay = STATUS_POLL_INTERVAL) => {
    if (activeWorkflowIdRef.current !== wfId) {
      return;
    }

    clearExistingPoll();
    pollTimeoutRef.current = setTimeout(() => pollStatus(wfId), delay);
  };

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

    clearExistingPoll();
    activeWorkflowIdRef.current = null;
    notFoundRetryRef.current = 0;
    setIsGenerating(true);
    setShowAnalyzingBanner(true);
    setItineraryLayout(null);
    setRawItinerary(null);
    setLayoutMetadata(null);
    setMapImageUrl(null);
    setLastUpdated(null);
    setResultFormData(formData);

    // Scroll to loading section
    setTimeout(() => {
      loadingRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
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
  setWorkflowId(result.workflowId);
  activeWorkflowIdRef.current = result.workflowId;
  notFoundRetryRef.current = 0;
  // Start polling for status
  void pollStatus(result.workflowId);
      } else {
        console.error('❌ Itinerary generation failed:', result);
        alert('Failed to start itinerary generation. Please try again.');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('💥 Error calling itinerary API:', error);
      alert('An error occurred while starting itinerary generation. Please try again.');
      setIsGenerating(false);
    }
  };

  // Poll for workflow status
  const pollStatus = async (wfId: string) => {
    if (!wfId || activeWorkflowIdRef.current !== wfId) {
      return;
    }

    try {
      const response = await fetch(`/api/itinerary/status/${wfId}`);
      const statusData = await response.json().catch(() => ({}));

      console.log('Status check:', statusData);

      if (!response.ok) {
        if (response.status === 404) {
          notFoundRetryRef.current += 1;
          console.log(`Workflow ${wfId} not found (attempt ${notFoundRetryRef.current}). Continuing to poll...`);
          scheduleNextPoll(wfId);
          return;
        }

        const errorMessage = statusData?.error || 'Unknown error occurred while checking status.';
        console.error('State check failed:', errorMessage);
        alert(`Itinerary state check failed: ${errorMessage}`);
        setIsGenerating(false);
        setWorkflowId(null);
        activeWorkflowIdRef.current = null;
        clearExistingPoll();
        return;
      }

      notFoundRetryRef.current = 0;

      console.log('🎯 [UI] Status response received:', {
        status: statusData.status,
        progress: statusData.progress,
        currentStep: statusData.currentStep,
        hasItinerary: !!statusData.itinerary,
        itineraryType: typeof statusData.itinerary,
        itineraryKeys: statusData.itinerary ? Object.keys(statusData.itinerary) : [],
        hasRawItinerary: typeof statusData.rawItinerary === 'string',
        parseError: statusData.itineraryParseError || null,
        fullResponse: statusData,
      });

      if (statusData.itineraryParseError) {
        console.warn('⚠️ [UI] Itinerary parse error reported by API:', statusData.itineraryParseError);
      }

      if (typeof statusData.rawItinerary === 'string') {
        setRawItinerary(statusData.rawItinerary);
      }

      // Set the itinerary layout directly from the response
      if (statusData.itinerary) {
        console.log('📋 [UI] Setting itinerary layout from status response:', {
          hasIntro: !!statusData.itinerary.intro,
          hasDailyPlans: !!statusData.itinerary.dailyPlans,
          dailyPlansCount: statusData.itinerary.dailyPlans?.length || 0,
          fullItinerary: statusData.itinerary,
        });
        setItineraryLayout(statusData.itinerary);
        setLayoutMetadata({
          generatedAt: statusData.updatedAt,
        });
      } else if (statusData.rawItinerary) {
        console.warn('⚠️ [UI] Parsed itinerary unavailable; relying on raw itinerary string.');
        setItineraryLayout(null);
      }

      if (statusData.formData) {
        setResultFormData(statusData.formData);
      }

      if (statusData.status === 'completed') {
        console.log('Workflow completed, stopping polling');
        setIsGenerating(false);
        setLastUpdated(statusData.updatedAt);
        clearExistingPoll();
        return;
      }

      if (statusData.status === 'error') {
        console.error('Workflow error:', statusData.error);
        alert(`Itinerary generation failed: ${statusData.error || 'Unknown error'}`);
        setIsGenerating(false);
        clearExistingPoll();
        return;
      }

      // Continue polling for processing workflows
      scheduleNextPoll(wfId);
    } catch (error) {
      console.error('Error checking status:', error);
      scheduleNextPoll(wfId);
    }
  };

  const handleStartOver = () => {
    clearExistingPoll();
    activeWorkflowIdRef.current = null;
    notFoundRetryRef.current = 0;
    setWorkflowId(null);
    setIsGenerating(false);
    setItineraryLayout(null);
    setLayoutMetadata(null);
    setLastUpdated(null);
    setMapImageUrl(null);
    setResultFormData(null);
    setRawItinerary(null);
    setFormData(createInitialFormData());
    setTravelStyleChoice(TravelStyleChoice.NOT_SELECTED);
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
      <header className="bg-trip-details text-primary py-4 px-6 shadow-lg w-full px-[20%]">
        <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
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
            tripNickname={formData.tripNickname || (formData.travelStyleAnswers?.tripNickname as string) || ''}
            onTripNicknameChange={handleTripNicknameChange}
            contactInfo={formData.contactInfo || {}}
            onContactChange={handleContactInfoChange}
          />

        </div>
      </main>

      {/* Travel Style Section - Header full width, content in main container */}
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

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-3">
            <TravelStyleGroup
              formData={formData}
              onFormChange={setFormData}
              validationErrors={{}}
            />

            <div className="pt-6" style={{ paddingBottom: '2.5rem' }}>
              <button
                type="button"
                onClick={handleGenerateItinerary}
                className="w-full px-12 rounded-[36px] font-bold font-raleway text-[32px] bg-[#f68854] text-primary transition-all duration-300 transform hover:scale-105 relative group whitespace-nowrap flex items-center justify-center py-2 border-0"
              >
                GENERATE MY PERSONALIZED ITINERARY ✨
                <div className="absolute inset-0 rounded-[36px] bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Loading section - always show when generating or when we have layout */}
  {(showAnalyzingBanner || isGenerating || itineraryLayout) && (
        <div ref={loadingRef} className="w-full px-8 relative mt-[45px]" style={{ backgroundColor: '#b0c29c' }}>
          <div className="max-w-4xl mx-auto">
            {/* Main content with hotel emoji and text side by side, centered on page */}
            <div className="flex items-center justify-center relative z-10" style={{ borderBottom: '8px' }}>
              {/* Animated emojis moving horizontally across this specific flex container */}
              {emojiSequence.map((emoji, index) => (
                <motion.div
                  key={`${emoji}-${index}`}
                  className="absolute text-4xl pointer-events-none z-20"
                  style={{
                    left: '-100px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0],
                    ...createHorizontalPath(index),
                  }}
                  transition={{
                    duration: 6,
                    delay: index * 1.5,
                    repeat: Infinity,
                    repeatDelay: (emojiSequence.length - 1) * 1.5,
                    ease: "easeInOut",
                  }}
                >
                  {emoji}
                </motion.div>
              ))}
              
              <div className="text-[6rem] mr-8 leading-none">
                🏨
              </div>
              {/* Show analyzing text always - never disappears */}
              <div className="relative" style={{ paddingBottom: '0.6rem' }}>
                <div className="text-center relative" style={{ color: '#43636f' }}>
                  <span className="block py-4 text-[4.5rem] font-bold leading-none">
                    <span className="text-[2.5rem] font-semibold uppercase">analyzing to create your</span><br />
                    BEST TRIP EVER!
                    <span className="text-[1.6rem] mt-2 block">Thanks for your patience</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show itinerary display below loading section when available */}
      {(itineraryLayout || rawItinerary) && (
        <motion.div 
          className="w-full relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {(() => {
            console.log('Page: Rendering itinerary display section');
            console.log('Page: itineraryLayout exists:', !!itineraryLayout);
            console.log('Page: rawItinerary exists:', !!rawItinerary);
            return null;
          })()}
          {itineraryLayout ? (
            <ItineraryDisplay
              layout={itineraryLayout}
              formData={resultFormData ?? formData}
              mapImageUrl={mapImageUrl}
              isLoading={isGenerating}
              layoutMetadata={layoutMetadata}
              lastUpdated={lastUpdated}
              onStartOver={handleStartOver}
            />
          ) : rawItinerary ? (
            <motion.div 
              className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Your AI-Generated Itinerary</h1>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">{rawItinerary}</pre>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleStartOver}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}

export default Page;
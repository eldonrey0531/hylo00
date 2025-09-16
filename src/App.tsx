import React, { useState, useRef, useEffect } from 'react';
import {
  generateItinerary,
  TravelFormData,
  AgentLog,
} from './services/groqService';
import TripDetailsForm from './components/TripDetailsForm';
import TravelGroupSelector from './components/TravelGroupSelector';
import TravelInterests from './components/TravelInterests';
import ItineraryInclusions from './components/ItineraryInclusions';
import TravelExperience from './components/TravelExperience';
import TripVibe from './components/TripVibe';
import SampleDays from './components/SampleDays';
import DinnerChoice from './components/DinnerChoice';
import TripNickname from './components/TripNickname';
import ItineraryDisplay from './components/ItineraryDisplay';
import BehindTheScenes from './components/BehindTheScenes';

function App() {
  const [formData, setFormData] = useState({});
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedSampleDays, setSelectedSampleDays] = useState<string[]>([]);
  const [dinnerChoices, setDinnerChoices] = useState<string[]>([]);
  const [tripNickname, setTripNickname] = useState<string>('');
  const [contactInfo, setContactInfo] = useState({});
  const [generatedItinerary, setGeneratedItinerary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string>('');
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const itineraryRef = useRef<HTMLDivElement>(null);

  const handleGenerateItinerary = async () => {
    const travelData: TravelFormData = {
      tripDetails: formData,
      groups: selectedGroups,
      interests: selectedInterests,
      inclusions: selectedInclusions,
      experience: selectedExperience,
      vibes: selectedVibes,
      sampleDays: selectedSampleDays,
      dinnerChoices: dinnerChoices,
      nickname: tripNickname,
      contact: contactInfo,
    };

    setIsGenerating(true);
    setGenerationError('');
    setGeneratedItinerary(''); // Clear previous itinerary
    setAgentLogs([]); // Clear previous logs

    try {
      const result = await generateItinerary(travelData, (logs) => {
        setAgentLogs(logs);
      });

      setGeneratedItinerary(result.itinerary);
      setAgentLogs(result.logs);

      // Smooth scroll to the itinerary after a short delay
      setTimeout(() => {
        itineraryRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setGenerationError(
        'Sorry, we encountered an error generating your itinerary. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Prepare form data for behind the scenes view
  const completeFormData: TravelFormData = {
    tripDetails: formData,
    groups: selectedGroups,
    interests: selectedInterests,
    inclusions: selectedInclusions,
    experience: selectedExperience,
    vibes: selectedVibes,
    sampleDays: selectedSampleDays,
    dinnerChoices: dinnerChoices,
    nickname: tripNickname,
    contact: contactInfo,
  };

  return (
    <div className="min-h-screen bg-primary py-8 font-raleway">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Trip Details Header - Full Width No Rounded Corners */}
          <div className="bg-trip-details text-primary py-4 px-6 shadow-lg -mx-4 sm:-mx-6 lg:-mx-8 2xl:-mx-16">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">🌏</span>
              <h1 className="text-2xl font-bold tracking-wide text-primary font-raleway">
                TRIP DETAILS
              </h1>
            </div>
          </div>

          {/* Trip Details Form */}
          <TripDetailsForm formData={formData} onFormChange={setFormData} />

          {/* Travel Group */}
          <TravelGroupSelector
            selectedGroups={selectedGroups}
            onSelectionChange={setSelectedGroups}
          />

          {/* Travel Interests */}
          <TravelInterests
            selectedInterests={selectedInterests}
            onSelectionChange={setSelectedInterests}
          />

          {/* What Should We Include in Your Itinerary */}
          <ItineraryInclusions
            selectedInclusions={selectedInclusions}
            onSelectionChange={setSelectedInclusions}
          />

          {/* Travel Style Header - Full Width No Rounded Corners */}
          <div className="bg-trip-details text-primary py-4 px-6 shadow-lg -mx-4 sm:-mx-6 lg:-mx-8 2xl:-mx-16">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">🌏</span>
              <h2 className="text-2xl font-bold tracking-wide text-primary font-raleway">
                TRAVEL STYLE
              </h2>
            </div>
          </div>

          {/* Travel Style Description */}
          <div className="text-center py-4">
            <p className="text-primary leading-relaxed text-sm font-bold font-raleway">
              <span style={{ color: '#ece8de' }}>
                The next few questions are optional, but answering them helps us
                understand you and create an even more personalized itinerary.
              </span>{' '}
              <span style={{ color: '#f9dd8b' }} className="font-bold">
                Answer them with this group and trip in mind.
              </span>
            </p>
          </div>

          {/* Travel Experience */}
          <div className="bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200">
            <div className="space-y-3 mb-6">
              <h4 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
                What is your group's level of travel experience?
              </h4>
              <p className="text-primary font-bold font-raleway text-xs">
                Select all that apply
              </p>
            </div>
            <TravelExperience
              selectedExperience={selectedExperience}
              onSelectionChange={setSelectedExperience}
            />
          </div>

          {/* Trip Vibe */}
          <div className="bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200">
            <div className="space-y-3 mb-6">
              <h4 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
                What do you want the "vibe" of this trip to be?
              </h4>
              <p className="text-primary font-bold font-raleway text-xs">
                Select all that apply
              </p>
            </div>
            <TripVibe
              selectedVibes={selectedVibes}
              onSelectionChange={setSelectedVibes}
            />
          </div>

          {/* Sample Days */}
          <div className="bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200">
            <SampleDays
              selectedDays={selectedSampleDays}
              onSelectionChange={setSelectedSampleDays}
            />
          </div>

          {/* Dinner Choice */}
          <div className="bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200">
            <DinnerChoice
              selectedChoice={dinnerChoices}
              onSelectionChange={setDinnerChoices}
            />
          </div>

          {/* Trip Nickname with Contact Info */}
          <div className="bg-form-box rounded-[36px] p-6 shadow-lg border border-gray-200">
            <TripNickname
              tripNickname={tripNickname}
              onNicknameChange={setTripNickname}
              contactInfo={contactInfo}
              onContactChange={setContactInfo}
            />
          </div>

          {/* Generate Button */}
          <div className="pt-6">
            <button
              onClick={handleGenerateItinerary}
              disabled={isGenerating}
              className={`w-full px-8 py-4 rounded-[36px] font-raleway font-bold text-xl shadow-lg transition-all duration-300 flex items-center justify-center ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#f68854] hover:bg-[#e57743] hover:shadow-xl transform hover:scale-105'
              } text-[#406170]`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#406170] mr-3"></div>
                  GENERATING YOUR ITINERARY...
                </>
              ) : (
                'GENERATE MY PERSONALIZED ITINERARY ✨'
              )}
            </button>
          </div>

          {/* Itinerary Results Section - Directly below the button */}
          <div ref={itineraryRef}>
            {(isGenerating || generatedItinerary || generationError) && (
              <ItineraryDisplay
                itinerary={generatedItinerary}
                isLoading={isGenerating}
                error={generationError}
              />
            )}
          </div>
        </div>
      </main>

      {/* Behind the Scenes Component */}
      <BehindTheScenes
        formData={completeFormData}
        agentLogs={agentLogs}
        isProcessing={isGenerating}
      />
    </div>
  );
}

export default App;

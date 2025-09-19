import React from 'react';
import TravelExperience from './travel-style/TravelExperience';
import TripVibe from './travel-style/TripVibe';
import SampleDays from './travel-style/SampleDays';
import DinnerChoice from './travel-style/DinnerChoice';
import TripNickname from './travel-style/TripNickname';

interface TravelStyleGroupProps {
  onFormChange?: (data: any) => void;
  formData?: any;
}

export const TravelStyleGroup: React.FC<TravelStyleGroupProps> = ({ onFormChange, formData }) => {
  const handleExperienceChange = (experience: string[]) => {
    onFormChange?.({
      ...formData,
      travelStyleAnswers: {
        ...formData?.travelStyleAnswers,
        experience,
      },
    });
  };

  const handleVibeChange = (vibes: string[]) => {
    onFormChange?.({
      ...formData,
      travelStyleAnswers: {
        ...formData?.travelStyleAnswers,
        vibes,
      },
    });
  };

  const handleVibeOtherChange = (vibesOther: string) => {
    onFormChange?.({
      ...formData,
      travelStyleAnswers: {
        ...formData?.travelStyleAnswers,
        vibesOther,
      },
    });
  };

  const handleSampleDaysChange = (sampleDays: string[]) => {
    onFormChange?.({
      ...formData,
      travelStyleAnswers: {
        ...formData?.travelStyleAnswers,
        sampleDays,
      },
    });
  };

  const handleDinnerChoiceChange = (dinnerChoices: string[]) => {
    onFormChange?.({
      ...formData,
      travelStyleAnswers: {
        ...formData?.travelStyleAnswers,
        dinnerChoices,
      },
    });
  };

  const handleTripNicknameChange = (tripNickname: string) => {
    onFormChange?.({
      ...formData,
      travelStyleAnswers: {
        ...formData?.travelStyleAnswers,
        tripNickname,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary font-raleway mb-2">
          Travel Style Preferences
        </h2>
        <p className="text-gray-600">Let's customize your trip experience</p>
      </div>

      <div className="bg-form-box rounded-[20px] p-6">
        <div className="mb-4">
          <h4 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
            What's your travel experience?
          </h4>
          <p className="text-primary font-bold font-raleway text-xs">
            Select all that apply
          </p>
        </div>
        <TravelExperience
          selectedExperience={formData?.travelStyleAnswers?.experience || []}
          onSelectionChange={handleExperienceChange}
        />
      </div>

      <div className="bg-form-box rounded-[20px] p-6">
        <div className="mb-4">
          <h4 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
            What's the vibe you're going for?
          </h4>
          <p className="text-primary font-bold font-raleway text-xs">
            Select all that apply
          </p>
        </div>
        <TripVibe
          selectedVibes={formData?.travelStyleAnswers?.vibes || []}
          onSelectionChange={handleVibeChange}
          otherText={formData?.travelStyleAnswers?.vibesOther || ''}
          onOtherTextChange={handleVibeOtherChange}
        />
      </div>

      <div className="bg-form-box rounded-[20px] p-6">
        <div className="mb-4">
          <h4 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
            Which of these sample travel days are you drawn to?
          </h4>
          <p className="text-primary font-bold font-raleway text-xs">
            Select all that apply
          </p>
        </div>
        <SampleDays
          selectedDays={formData?.travelStyleAnswers?.sampleDays || []}
          onSelectionChange={handleSampleDaysChange}
        />
      </div>

      <div className="bg-form-box rounded-[20px] p-6">
        <div className="mb-4">
          <h4 className="text-xl font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
            You just landed and are starving. Where are you having dinner?
          </h4>
          <p className="text-primary font-bold font-raleway text-xs">
            Select all that apply
          </p>
        </div>
        <DinnerChoice
          selectedChoice={formData?.travelStyleAnswers?.dinnerChoices || []}
          onSelectionChange={handleDinnerChoiceChange}
        />
      </div>

      <div className="bg-form-box rounded-[20px] p-6">
        <TripNickname
          tripNickname={formData?.travelStyleAnswers?.tripNickname || ''}
          onNicknameChange={handleTripNicknameChange}
          contactInfo={formData?.contactInfo || {}}
          onContactChange={(contactInfo) => {
            onFormChange?.({
              ...formData,
              contactInfo,
            });
          }}
        />
      </div>
    </div>
  );
};

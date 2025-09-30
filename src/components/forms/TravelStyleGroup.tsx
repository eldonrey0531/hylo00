import React from 'react';
import TravelExperience from './travel-style/TravelExperience';
import TripVibe from './travel-style/TripVibe';
import SampleDays from './travel-style/SampleDays';
import DinnerChoice from './travel-style/DinnerChoice';
import TripNickname from './travel-style/TripNickname';

interface TravelStyleGroupProps {
  onFormChange?: (data: any) => void;
  formData?: any;
  validationErrors?: any;
}

export const TravelStyleGroup: React.FC<TravelStyleGroupProps> = ({ onFormChange, formData, validationErrors }) => {
  console.log('TravelStyleGroup rendering', { formData });
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
    console.log('handleVibeChange called with:', vibes);
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

      <div className="bg-form-box rounded-[36px] p-6">
        <div className="mb-4">
          <h4 className="text-[25px] font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
            What is your group's level of travel experience?
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

      <div className="bg-form-box rounded-[36px] p-6">
        <div className="mb-4">
          <h4 className="text-[25px] font-bold text-primary uppercase tracking-wide mb-1 font-raleway">
            What do you want the "vibe" of this trip to be?
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

      <div className="bg-form-box rounded-[36px] p-6">
        <SampleDays
          selectedDays={formData?.travelStyleAnswers?.sampleDays || []}
          onSelectionChange={handleSampleDaysChange}
        />
      </div>

      <div className="bg-form-box rounded-[36px] p-6">
        <DinnerChoice
          selectedChoice={formData?.travelStyleAnswers?.dinnerChoices || []}
          onSelectionChange={handleDinnerChoiceChange}
        />
      </div>

      <div className="bg-form-box rounded-[36px] p-6">
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
          formData={formData}
          validationErrors={validationErrors?.tripNickname || []}
        />
      </div>
    </div>
  );
};

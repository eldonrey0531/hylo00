// T007: TripNickname Simplified Component
// Simplified to only trip nickname, contact name, and email address

import React from 'react';
import type { FormData } from './types';

interface TripNicknameProps {
  formData: FormData;
  onFormChange: (data: Partial<FormData>) => void;
}

const TripNickname: React.FC<TripNicknameProps> = ({
  formData,
  onFormChange,
}) => {
  const handleInputChange = (field: keyof FormData, value: string) => {
    // Enforce maxLength limits
    let processedValue = value;
    if (field === 'tripNickname' && value.length > 50) {
      processedValue = value.slice(0, 50);
    } else if (field === 'contactName' && value.length > 100) {
      processedValue = value.slice(0, 100);
    }
    
    onFormChange({ [field]: processedValue });
  };

  // Simple email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showEmailError = formData.contactEmail && !isValidEmail(formData.contactEmail);

  return (
    <div 
      className="bg-form-box rounded-[36px] p-6 border-3 border-primary space-y-6"
      role="group"
      aria-labelledby="trip-contact-heading"
    >
      <h4 
        id="trip-contact-heading" 
        className="text-lg font-bold text-primary uppercase tracking-wide mb-4 font-raleway text-center"
      >
        Trip & Contact Information
      </h4>

      {/* Trip Nickname Field */}
      <div>
        <label 
          htmlFor="trip-nickname"
          className="block text-primary font-bold mb-2 font-raleway text-lg"
        >
          Trip Nickname
        </label>
        <input
          id="trip-nickname"
          type="text"
          placeholder="Give your trip a fun name! (e.g., 'European Adventure 2024')"
          value={formData.tripNickname || ''}
          onChange={(e) => handleInputChange('tripNickname', e.target.value)}
          className="w-full px-4 py-3 border-2 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white placeholder-gray-500 font-raleway font-bold"
          required
          maxLength={50}
          tabIndex={0}
          aria-describedby="nickname-help"
        />
        <div id="nickname-help" className="text-xs text-gray-600 mt-1 font-raleway">
          Help us personalize your experience (max 50 characters)
        </div>
      </div>

      {/* Contact Name Field */}
      <div>
        <label 
          htmlFor="contact-name"
          className="block text-primary font-bold mb-2 font-raleway text-lg"
        >
          Your Name
        </label>
        <input
          id="contact-name"
          type="text"
          placeholder="Enter your full name"
          value={formData.contactName || ''}
          onChange={(e) => handleInputChange('contactName', e.target.value)}
          className="w-full px-4 py-3 border-2 border-primary rounded-[10px] focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white placeholder-gray-500 font-raleway font-bold"
          required
          maxLength={100}
          tabIndex={0}
          aria-describedby="name-help"
        />
        <div id="name-help" className="text-xs text-gray-600 mt-1 font-raleway">
          We'll use this to personalize your itinerary
        </div>
      </div>

      {/* Email Address Field */}
      <div>
        <label 
          htmlFor="contact-email"
          className="block text-primary font-bold mb-2 font-raleway text-lg"
        >
          Email Address
        </label>
        <input
          id="contact-email"
          type="email"
          placeholder="Enter your email address"
          value={formData.contactEmail || ''}
          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-[10px] focus:ring-2 focus:ring-primary transition-all duration-200 text-primary bg-white placeholder-gray-500 font-raleway font-bold ${
            showEmailError 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-primary focus:border-primary'
          }`}
          required
          tabIndex={0}
          aria-describedby="email-help"
        />
        <div id="email-help" className="text-xs text-gray-600 mt-1 font-raleway">
          We'll send your personalized itinerary here
        </div>
        {showEmailError && (
          <div className="text-red-500 text-sm mt-1 font-raleway font-bold">
            Please enter a valid email address
          </div>
        )}
      </div>
    </div>
  );
};

export default TripNickname;
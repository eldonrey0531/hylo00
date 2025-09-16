import React, { useState } from 'react';
import { Calendar, MapPin, Users, DollarSign, Heart, Sparkles, ChevronRight, ChevronLeft, Plane, Hotel, Utensils, Camera, ShoppingBag, TreePalm, Mountain, Building2, Waves, Palette, Music, Dumbbell, Book, Coffee, Sunset, PartyPopper, Briefcase, Home, Zap, Leaf, X, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useItinerary } from '../contexts/ItineraryContext';
import type { ItineraryFormData } from '../types';

const ItineraryForm: React.FC = () => {
  const navigate = useNavigate();
  const { setFormData } = useItinerary();
  const [currentStep, setCurrentStep] = useState(0);
  const [showOtherInput, setShowOtherInput] = useState<string | null>(null);
  const [showPreferenceDetail, setShowPreferenceDetail] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setLocalFormData] = useState<ItineraryFormData>({
    destinations: [''],
    startDate: '',
    endDate: '',
    travelGroup: '',
    travelGroupOther: '', // Added for custom input
    groupSize: 1,
    budget: 0,
    budgetType: 'total', // Added to track budget type
    currency: 'USD',
    interests: [],
    interestsOther: '', // Added for custom input
    pace: 'moderate',
    accommodation: 'hotel',
    transportation: [],
    dietary: [],
    accessibility: [],
    activities: [],
    vibe: '',
    vibeOther: '', // Added for custom input
    preferences: {
      flights: false,
      hotels: false,
      restaurants: false,
      activities: false,
      transportation: false,
      shopping: false,
      nightlife: false,
      culture: false,
      nature: false,
      adventure: false,
      relaxation: false,
      photography: false
    },
    preferenceDetails: {} // Added to store preference details
  });

  const steps = [
    { title: 'Destinations', icon: MapPin },
    { title: 'Dates', icon: Calendar },
    { title: 'Travel Group', icon: Users },
    { title: 'Budget', icon: DollarSign },
    { title: 'Interests', icon: Heart },
    { title: 'Preferences', icon: Sparkles }
  ];

  const travelGroups = [
    { value: 'solo', label: 'Solo Traveler', icon: Briefcase },
    { value: 'couple', label: 'Couple', icon: Heart },
    { value: 'family', label: 'Family with Kids', icon: Home },
    { value: 'friends', label: 'Group of Friends', icon: Users },
    { value: 'business', label: 'Business Travel', icon: Briefcase },
    { value: 'other', label: 'Other', icon: Sparkles }
  ];

  const interests = [
    { value: 'culture', label: 'Culture & History', icon: Building2 },
    { value: 'adventure', label: 'Adventure', icon: Mountain },
    { value: 'relaxation', label: 'Relaxation', icon: TreePalm },
    { value: 'food', label: 'Food & Dining', icon: Utensils },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { value: 'nature', label: 'Nature', icon: Leaf },
    { value: 'nightlife', label: 'Nightlife', icon: PartyPopper },
    { value: 'photography', label: 'Photography', icon: Camera },
    { value: 'beach', label: 'Beach & Water', icon: Waves },
    { value: 'art', label: 'Art & Museums', icon: Palette },
    { value: 'music', label: 'Music & Festivals', icon: Music },
    { value: 'sports', label: 'Sports & Fitness', icon: Dumbbell },
    { value: 'learning', label: 'Learning & Workshops', icon: Book },
    { value: 'wellness', label: 'Wellness & Spa', icon: Sparkles },
    { value: 'other', label: 'Other', icon: Zap }
  ];

  const vibes = [
    { value: 'adventurous', label: 'Adventurous & Active', icon: Mountain },
    { value: 'relaxed', label: 'Relaxed & Chill', icon: Coffee },
    { value: 'romantic', label: 'Romantic', icon: Heart },
    { value: 'cultural', label: 'Cultural & Educational', icon: Book },
    { value: 'luxurious', label: 'Luxurious & Pampered', icon: Sparkles },
    { value: 'budget', label: 'Budget-Friendly', icon: DollarSign },
    { value: 'family', label: 'Family-Friendly', icon: Home },
    { value: 'party', label: 'Party & Nightlife', icon: PartyPopper },
    { value: 'eco', label: 'Eco-Friendly', icon: Leaf },
    { value: 'spontaneous', label: 'Spontaneous & Flexible', icon: Zap },
    { value: 'other', label: 'Other', icon: Sunset }
  ];

  const preferenceOptions = [
    { key: 'flights', label: 'Flights', icon: Plane, detail: 'Preferred airlines, class, or special requirements' },
    { key: 'hotels', label: 'Hotels', icon: Hotel, detail: 'Hotel preferences, amenities, or location requirements' },
    { key: 'restaurants', label: 'Restaurants', icon: Utensils, detail: 'Cuisine types, dietary restrictions, or dining preferences' },
    { key: 'activities', label: 'Activities', icon: Camera, detail: 'Specific activities or experiences you want' },
    { key: 'transportation', label: 'Local Transport', icon: Building2, detail: 'Rental car, public transit, or other transport needs' },
    { key: 'shopping', label: 'Shopping', icon: ShoppingBag, detail: 'Shopping interests or specific items to buy' },
    { key: 'nightlife', label: 'Nightlife', icon: PartyPopper, detail: 'Bars, clubs, or evening entertainment preferences' },
    { key: 'culture', label: 'Culture', icon: Palette, detail: 'Museums, galleries, or cultural sites of interest' },
    { key: 'nature', label: 'Nature', icon: Leaf, detail: 'Parks, hiking trails, or outdoor preferences' },
    { key: 'adventure', label: 'Adventure', icon: Mountain, detail: 'Extreme sports or adventure activities' },
    { key: 'relaxation', label: 'Relaxation', icon: TreePalm, detail: 'Spa, wellness, or relaxation preferences' },
    { key: 'photography', label: 'Photography', icon: Camera, detail: 'Photo spots or photography tour interests' }
  ];

  const handleDestinationChange = (index: number, value: string) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = value;
    setLocalFormData({ ...formData, destinations: newDestinations });
  };

  const addDestination = () => {
    setLocalFormData({ ...formData, destinations: [...formData.destinations, ''] });
  };

  const removeDestination = (index: number) => {
    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    setLocalFormData({ ...formData, destinations: newDestinations });
  };

  const handleInterestToggle = (interest: string) => {
    if (interest === 'other') {
      setShowOtherInput('interests');
      return;
    }
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    setLocalFormData({ ...formData, interests: newInterests });
  };

  const handlePreferenceToggle = (key: string) => {
    const newPreferences = {
      ...formData.preferences,
      [key]: !formData.preferences[key as keyof typeof formData.preferences]
    };
    setLocalFormData({ ...formData, preferences: newPreferences });
    
    // Show detail input popup when preference is selected
    if (!formData.preferences[key as keyof typeof formData.preferences]) {
      setShowPreferenceDetail(key);
    } else {
      // Clear detail if preference is deselected
      const newDetails = { ...formData.preferenceDetails };
      delete newDetails[key];
      setLocalFormData({ ...formData, preferenceDetails: newDetails });
    }
  };

  const handlePreferenceDetailSave = (key: string, detail: string) => {
    setLocalFormData({
      ...formData,
      preferenceDetails: {
        ...formData.preferenceDetails,
        [key]: detail
      }
    });
    setShowPreferenceDetail(null);
  };

  const handleOtherInputSave = (field: string, value: string) => {
    if (field === 'travelGroup') {
      setLocalFormData({ ...formData, travelGroup: 'other', travelGroupOther: value });
    } else if (field === 'interests') {
      setLocalFormData({ ...formData, interestsOther: value });
    } else if (field === 'vibe') {
      setLocalFormData({ ...formData, vibe: 'other', vibeOther: value });
    }
    setShowOtherInput(null);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Destinations
        if (formData.destinations.some(d => !d.trim())) {
          newErrors.destinations = 'All destinations must be filled';
        }
        break;
      case 1: // Dates
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        break;
      case 2: // Travel Group
        if (!formData.travelGroup) newErrors.travelGroup = 'Please select a travel group type';
        if (formData.travelGroup === 'other' && !formData.travelGroupOther) {
          newErrors.travelGroup = 'Please describe your travel group';
        }
        break;
      case 3: // Budget
        if (formData.budget <= 0) newErrors.budget = 'Please enter a valid budget';
        break;
      case 4: // Interests
        if (formData.interests.length === 0 && !formData.interestsOther) {
          newErrors.interests = 'Please select at least one interest or describe your own';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Prepare final form data with all collected information
    const finalFormData = {
      ...formData,
      // Include custom "other" values in the main data
      travelGroup: formData.travelGroup === 'other' ? formData.travelGroupOther : formData.travelGroup,
      interests: formData.interestsOther 
        ? [...formData.interests, formData.interestsOther]
        : formData.interests,
      vibe: formData.vibe === 'other' ? formData.vibeOther : formData.vibe,
      // Budget information with type
      budgetInfo: {
        amount: formData.budget,
        type: formData.budgetType,
        currency: formData.currency,
        perPerson: formData.budgetType === 'per-person' ? formData.budget : formData.budget / formData.groupSize
      }
    };
    
    setFormData(finalFormData);
    navigate('/generate');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Destinations
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Where would you like to go?</h2>
              <p className="text-textSecondary">Add one or more destinations for your trip</p>
            </div>
            
            <div className="space-y-4">
              {formData.destinations.map((destination, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => handleDestinationChange(index, e.target.value)}
                      placeholder={`Destination ${index + 1}`}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  {formData.destinations.length > 1 && (
                    <button
                      onClick={() => removeDestination(index)}
                      className="p-3 bg-surface border border-border rounded-xl text-textSecondary hover:text-error hover:border-error transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addDestination}
                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-textSecondary hover:border-primary hover:text-primary transition-colors"
              >
                + Add another destination
              </button>
              
              {errors.destinations && (
                <p className="text-error text-sm">{errors.destinations}</p>
              )}
            </div>
          </div>
        );

      case 1: // Dates
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">When are you traveling?</h2>
              <p className="text-textSecondary">Select your travel dates</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setLocalFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.startDate && (
                  <p className="text-error text-sm mt-1">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setLocalFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.endDate && (
                  <p className="text-error text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Travel Group
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Who's traveling?</h2>
              <p className="text-textSecondary">Tell us about your travel group</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {travelGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <button
                    key={group.value}
                    onClick={() => {
                      if (group.value === 'other') {
                        setShowOtherInput('travelGroup');
                      } else {
                        setLocalFormData({ ...formData, travelGroup: group.value, travelGroupOther: '' });
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.travelGroup === group.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-textSecondary hover:border-primary/50'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">{group.label}</span>
                  </button>
                );
              })}
            </div>
            
            {formData.travelGroup === 'other' && formData.travelGroupOther && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                <p className="text-sm text-primary">Custom group: {formData.travelGroupOther}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">
                Group Size
              </label>
              <input
                type="number"
                min="1"
                value={formData.groupSize}
                onChange={(e) => setLocalFormData({ ...formData, groupSize: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            {errors.travelGroup && (
              <p className="text-error text-sm">{errors.travelGroup}</p>
            )}
          </div>
        );

      case 3: // Budget
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">What's your budget?</h2>
              <p className="text-textSecondary">Help us plan within your budget</p>
            </div>
            
            <div className="space-y-4">
              {/* Budget Type Toggle */}
              <div className="flex gap-2 p-1 bg-surface rounded-xl">
                <button
                  onClick={() => setLocalFormData({ ...formData, budgetType: 'total' })}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    formData.budgetType === 'total'
                      ? 'bg-primary text-white'
                      : 'text-textSecondary hover:text-white'
                  }`}
                >
                  Total Trip Budget
                </button>
                <button
                  onClick={() => setLocalFormData({ ...formData, budgetType: 'per-person' })}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    formData.budgetType === 'per-person'
                      ? 'bg-primary text-white'
                      : 'text-textSecondary hover:text-white'
                  }`}
                >
                  Per Person Budget
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Amount ({formData.budgetType === 'per-person' ? 'per person' : 'total'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => setLocalFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setLocalFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
              </div>
              
              {formData.budget > 0 && formData.groupSize > 1 && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <p className="text-sm text-primary">
                    {formData.budgetType === 'total' 
                      ? `Budget per person: ${formData.currency} ${(formData.budget / formData.groupSize).toFixed(2)}`
                      : `Total budget: ${formData.currency} ${(formData.budget * formData.groupSize).toFixed(2)}`
                    }
                  </p>
                </div>
              )}
              
              {errors.budget && (
                <p className="text-error text-sm">{errors.budget}</p>
              )}
            </div>
          </div>
        );

      case 4: // Interests
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">What are your interests?</h2>
              <p className="text-textSecondary">Select all that apply</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interests.map((interest) => {
                const Icon = interest.icon;
                const isSelected = interest.value === 'other' 
                  ? formData.interestsOther !== ''
                  : formData.interests.includes(interest.value);
                
                return (
                  <button
                    key={interest.value}
                    onClick={() => handleInterestToggle(interest.value)}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-textSecondary hover:border-primary/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{interest.label}</span>
                  </button>
                );
              })}
            </div>
            
            {formData.interestsOther && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                <p className="text-sm text-primary">Custom interests: {formData.interestsOther}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">What do you want the "vibe" of this trip to be?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vibes.map((vibe) => {
                  const Icon = vibe.icon;
                  return (
                    <button
                      key={vibe.value}
                      onClick={() => {
                        if (vibe.value === 'other') {
                          setShowOtherInput('vibe');
                        } else {
                          setLocalFormData({ ...formData, vibe: vibe.value, vibeOther: '' });
                        }
                      }}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                        formData.vibe === vibe.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface text-textSecondary hover:border-primary/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{vibe.label}</span>
                    </button>
                  );
                })}
              </div>
              
              {formData.vibe === 'other' && formData.vibeOther && (
                <div className="mt-3 p-4 bg-primary/10 border border-primary/30 rounded-xl">
                  <p className="text-sm text-primary">Custom vibe: {formData.vibeOther}</p>
                </div>
              )}
            </div>
            
            {errors.interests && (
              <p className="text-error text-sm">{errors.interests}</p>
            )}
          </div>
        );

      case 5: // Preferences
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">What Should We Include in Your Itinerary?</h2>
              <p className="text-textSecondary">Select what you'd like us to plan for you</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {preferenceOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.preferences[option.key as keyof typeof formData.preferences];
                
                return (
                  <button
                    key={option.key}
                    onClick={() => handlePreferenceToggle(option.key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-textSecondary hover:border-primary/50'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium block">{option.label}</span>
                    {formData.preferenceDetails[option.key] && (
                      <div className="mt-2 text-xs text-primary/80">
                        <Info className="w-3 h-3 inline mr-1" />
                        Details added
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {Object.keys(formData.preferenceDetails).length > 0 && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                <p className="text-sm font-medium text-primary mb-2">Your preferences:</p>
                <div className="space-y-1">
                  {Object.entries(formData.preferenceDetails).map(([key, value]) => (
                    <p key={key} className="text-xs text-primary/80">
                      • {preferenceOptions.find(o => o.key === key)?.label}: {value}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      index <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-surface text-textSecondary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        index < currentStep
                          ? 'bg-primary'
                          : 'bg-surface'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <span
                key={index}
                className={`text-xs ${
                  index <= currentStep ? 'text-primary' : 'text-textSecondary'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */<div className="bg-surface rounded-2xl p-8 shadow-xl">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0
                ? 'bg-surface text-textSecondary cursor-not-allowed'
                : 'bg-surface text-white hover:bg-surface/80'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all"
          >
            {currentStep === steps.length - 1 ? 'Generate Itinerary' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Other Input Modal */}
      {showOtherInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {showOtherInput === 'travelGroup' && 'Describe your travel group'}
              {showOtherInput === 'interests' && 'What other interests do you have?'}
              {showOtherInput === 'vibe' && 'Describe your ideal trip vibe'}
            </h3>
            <textarea
              autoFocus
              placeholder={
                showOtherInput === 'travelGroup' 
                  ? 'e.g., Multi-generational family, School group, etc.'
                  : showOtherInput === 'interests'
                  ? 'e.g., Architecture, Wine tasting, Cooking classes, etc.'
                  : 'e.g., Spiritual journey, Digital detox, etc.'
              }
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              rows={4}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleOtherInputSave(showOtherInput, e.currentTarget.value);
                }
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowOtherInput(null)}
                className="flex-1 py-2 px-4 bg-background border border-border rounded-xl text-textSecondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                  if (textarea?.value) {
                    handleOtherInputSave(showOtherInput, textarea.value);
                  }
                }}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preference Detail Modal */}
      {showPreferenceDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">
              {preferenceOptions.find(o => o.key === showPreferenceDetail)?.label} Preferences
            </h3>
            <p className="text-textSecondary text-sm mb-4">
              {preferenceOptions.find(o => o.key === showPreferenceDetail)?.detail}
            </p>
            <textarea
              autoFocus
              placeholder="Tell us more about what you're looking for..."
              defaultValue={formData.preferenceDetails[showPreferenceDetail] || ''}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-white placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              rows={4}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePreferenceDetailSave(showPreferenceDetail, e.currentTarget.value);
                }
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowPreferenceDetail(null);
                  // Deselect the preference if no detail was provided
                  if (!formData.preferenceDetails[showPreferenceDetail]) {
                    const newPreferences = {
                      ...formData.preferences,
                      [showPreferenceDetail]: false
                    };
                    setLocalFormData({ ...formData, preferences: newPreferences });
                  }
                }}
                className="flex-1 py-2 px-4 bg-background border border-border rounded-xl text-textSecondary hover:text-white transition-colors"
              >
                Skip
              </button>
              <button
                onClick={(e) => {
                  const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                  handlePreferenceDetailSave(showPreferenceDetail, textarea.value);
                }}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryForm;

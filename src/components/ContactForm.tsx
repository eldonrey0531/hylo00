import React from 'react';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';

interface ContactFormProps {
  contactInfo: any;
  onContactChange: (info: any) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  contactInfo,
  onContactChange,
}) => {
  const handleInputChange = (field: string, value: string) => {
    onContactChange({ ...contactInfo, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-bold text-primary uppercase tracking-wide mb-2">
          Contact Information
        </h4>
        <p className="text-primary font-medium">
          We'll use this information to send you your personalized itinerary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-primary font-semibold mb-2">
            <User className="inline h-4 w-4 mr-2" />
            First Name
          </label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={contactInfo.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white"
          />
        </div>

        <div>
          <label className="block text-primary font-semibold mb-2">
            <User className="inline h-4 w-4 mr-2" />
            Last Name
          </label>
          <input
            type="text"
            placeholder="Enter your last name"
            value={contactInfo.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-primary font-semibold mb-2">
          <Mail className="inline h-4 w-4 mr-2" />
          Email
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          value={contactInfo.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white"
        />
      </div>

      <div>
        <label className="block text-primary font-semibold mb-2">
          <Phone className="inline h-4 w-4 mr-2" />
          Phone (Optional)
        </label>
        <input
          type="tel"
          placeholder="(555) 123-4567"
          value={contactInfo.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white"
        />
      </div>

      <div>
        <label className="block text-primary font-semibold mb-2">
          <MessageSquare className="inline h-4 w-4 mr-2" />
          Additional Comments (Optional)
        </label>
        <textarea
          placeholder="Any special requests, dietary restrictions, accessibility needs, or other important information..."
          value={contactInfo.comments || ''}
          onChange={(e) => handleInputChange('comments', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-primary bg-white resize-none"
          rows={4}
        />
      </div>
    </div>
  );
};

export default ContactForm;

import React from 'react';
import { X, Download, Mail } from 'lucide-react';

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: string;
  isLoading: boolean;
  error?: string;
}

const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([itinerary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'my-travel-itinerary.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('My Personalized Travel Itinerary');
    const body = encodeURIComponent(itinerary);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 id="modal-title" className="text-2xl font-bold font-raleway">
              Your Personalized Itinerary ✨
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-light rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-4 text-primary font-bold font-raleway">
                Generating your personalized itinerary...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-bold font-raleway">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-raleway font-bold"
              >
                Close
              </button>
            </div>
          )}

          {itinerary && !isLoading && !error && (
            <div className="space-y-6">
              <div className="bg-form-box rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-raleway text-primary leading-relaxed">
                  {itinerary}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {itinerary && !isLoading && !error && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-2xl">
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-raleway font-bold"
              >
                <Download className="h-5 w-5" />
                <span>Download Itinerary</span>
              </button>
              <button
                onClick={handleEmail}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 font-raleway font-bold"
              >
                <Mail className="h-5 w-5" />
                <span>Email Itinerary</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryModal;

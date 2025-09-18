import React from 'react';

interface FormErrorDisplayProps {
  errors: Record<string, string>;
  className?: string;
}

export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ errors, className = '' }) => {
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-[10px] p-4 mb-4 ${className}`}>
      <div className="flex items-center mb-2">
        <div className="text-red-500 mr-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h4 className="text-red-800 font-semibold font-raleway">
          Please fix the following errors:
        </h4>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {errorEntries.map(([field, message]) => (
          <li key={field} className="text-red-700 text-sm font-raleway">
            <span className="font-medium capitalize">{field.replace('.', ' ')}:</span> {message}
          </li>
        ))}
      </ul>
    </div>
  );
};

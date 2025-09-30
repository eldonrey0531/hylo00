'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SimilarItinerary {
  workflowId: string;
  score: number;
  destination: string;
  duration: number;
  budget: string;
  activities: string[];
  preferences: string[];
  createdAt: string;
  summary?: {
    title: string;
    description: string;
  };
}

interface SearchResponse {
  success: boolean;
  results: SimilarItinerary[];
  count: number;
  query: {
    destination: string;
    duration?: string;
    budget?: string;
    activities?: string[];
    preferences?: string[];
  };
}

export default function SimilarItinerariesSearch() {
  const [searchQuery, setSearchQuery] = useState({
    destination: '',
    duration: '',
    budget: '',
    activities: [] as string[],
    preferences: [] as string[],
  });
  const [results, setResults] = useState<SimilarItinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/itinerary/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...searchQuery,
          duration: searchQuery.duration ? parseInt(searchQuery.duration) : undefined,
          topK: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setResults(data.results);
      } else {
        throw new Error('Search request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search itineraries');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (activity: string) => {
    if (activity.trim() && !searchQuery.activities.includes(activity.trim())) {
      setSearchQuery(prev => ({
        ...prev,
        activities: [...prev.activities, activity.trim()]
      }));
    }
  };

  const removeActivity = (activity: string) => {
    setSearchQuery(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a !== activity)
    }));
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Find Similar Itineraries</h2>
      
      {/* Search Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Destination *
          </label>
          <input
            type="text"
            id="destination"
            value={searchQuery.destination}
            onChange={(e) => setSearchQuery(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Paris, Tokyo, New York"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              id="duration"
              value={searchQuery.duration}
              onChange={(e) => setSearchQuery(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="30"
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget
            </label>
            <select
              id="budget"
              value={searchQuery.budget}
              onChange={(e) => setSearchQuery(prev => ({ ...prev, budget: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any budget</option>
              <option value="budget">Budget</option>
              <option value="moderate">Moderate</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || !searchQuery.destination.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Searching...' : 'Search Similar Itineraries'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Found {results.length} similar itineraries:
          </h3>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={result.workflowId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">
                    {result.summary?.title || `Trip to ${result.destination}`}
                  </h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {Math.round(result.score * 100)}% match
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">
                  {result.summary?.description || `${result.duration} day trip to ${result.destination}`}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Destination:</span> {result.destination}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {result.duration} days
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span> {result.budget}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(result.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {result.activities.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Activities: </span>
                    <span className="text-sm text-gray-600">{result.activities.join(', ')}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && searchQuery.destination && !error && (
        <motion.div 
          className="text-center text-gray-500 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No similar itineraries found. Try adjusting your search criteria.
        </motion.div>
      )}
    </motion.div>
  );
}
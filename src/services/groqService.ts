import { generateMultiAgentItinerary, AgentLog } from './multiAgentService';

export interface TravelFormData {
  tripDetails: any;
  groups: string[];
  interests: string[];
  inclusions: string[];
  experience: string[];
  vibes: string[];
  sampleDays: string[];
  dinnerChoices: string[];
  nickname: string;
  contact: any;
}

// Main entry point that uses the multi-agent system
export const generateItinerary = async (
  formData: TravelFormData,
  onAgentUpdate?: (logs: AgentLog[]) => void
): Promise<{ itinerary: string; logs: AgentLog[] }> => {
  try {
    // Use the multi-agent system for accurate, selection-based generation
    const result = await generateMultiAgentItinerary(formData, onAgentUpdate);
    return result;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
};

export type { AgentLog };

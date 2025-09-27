import { DailyActivity } from './daily-activity';
import { TravelTip } from './travel-tip';
import { ItineraryStatus, LogStatus } from './enums';

export interface TripSummary {
  tripNickname: string;
  destination: string;
  dateDisplay: string;
  travelerCount: string;
  budgetDisplay: string;
  contactName: string;
}

export interface KeyDetails {
  destination: string;
  dates: string;
  travelers: string;
  budget: string;
  preparedFor: string;
}

export interface ItineraryMetadata {
  processingStartTime: Date;
  processingEndTime?: Date;
  totalDuration?: number;
  aiModel: string;
  dataSourcesUsed: string[];
  logEntries: ConsoleLogEntry[];
  errors: string[];
  warnings: string[];
}

export interface ConsoleLogEntry {
  stepNumber: number;
  action: string;
  fileName: string;
  functionName: string;
  timestamp: Date;
  data: Record<string, any>;
  duration: number | null;
  status: LogStatus;
}

export interface Itinerary {
  id: string;
  tripNickname: string;
  generatedAt: Date;
  status: ItineraryStatus;
  tripSummary: TripSummary;
  keyDetails: KeyDetails;
  mapImageUrl: string;
  dailyItinerary: DailyActivity[];
  travelTips: TravelTip[];
  metadata: ItineraryMetadata;
}


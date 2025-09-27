import { Priority } from './enums';

export enum TipCategory {
  PACKING = 'packing',
  TRANSPORTATION = 'transportation',
  DINING = 'dining',
  SAFETY = 'safety',
  CULTURE = 'culture',
  BUDGET = 'budget',
  WEATHER = 'weather',
  HEALTH = 'health'
}

export interface TravelTip {
  category: TipCategory;
  title: string;
  content: string;
  applicability: string[];
  priority: Priority;
  source: string;
}

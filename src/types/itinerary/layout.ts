export interface LayoutIntro {
  heading: string;
  body: string[];
  highlights: string[];
}

export interface LayoutDailySection {
  title: string;
  summary: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
  dining: string[];
  highlight: string;
}

export interface LayoutTipSection {
  title: string;
  bullets: string[];
}

export interface ItineraryLayout {
  intro: LayoutIntro;
  daily: LayoutDailySection[];
  keyTakeaways: string[];
  nextSteps: string[];
  travelTips: LayoutTipSection[];
}
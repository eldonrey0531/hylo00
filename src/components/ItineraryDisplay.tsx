import React from 'react';
import { motion } from 'framer-motion';
import type { FormData } from '@/components/forms/TripDetails/types';
import { InteractiveMap } from '@/components/InteractiveMap';
import { dateUtils } from '@/components/forms/TripDetails/utils';

type LayoutSection = {
  title?: string;
  summary?: string;
  activities?: string | string[];
  notes?: string;
  transportation?: string | string[];
  dining?: DiningInput;
};

type SectionInput = LayoutSection | string | string[] | null | undefined;

type DiningInput =
  | {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    }
  | string
  | string[]
  | null
  | undefined;

type LayoutDailyPlan = {
  day?: number;
  title?: string;
  date?: string;
  summary?: string;
  morning?: SectionInput;
  afternoon?: SectionInput;
  evening?: SectionInput;
  signatureHighlight?: string;
  transportation?: SectionInput;
  dining?: DiningInput;
  [key: string]: unknown;
};

type LayoutMetadata = {
  generatedAt?: string;
  model?: string;
  usedGroq?: boolean;
};

interface ItineraryLayout {
  intro?: string;
  overview?: string;
  quickSummary?: string | string[];
  dailyPlans?: LayoutDailyPlan[];
  keyTakeaways?: string | string[];
  nextSteps?: string | string[];
  travelTips?: Array<{ title?: string; description?: string }>;
  daily?: LayoutDailyPlan[];
}

interface ItineraryDisplayProps {
  layout: ItineraryLayout | null;
  formData: FormData | null;
  mapImageUrl?: string | null;
  isLoading?: boolean;
  layoutMetadata?: LayoutMetadata | null;
  lastUpdated?: string | null;
  onStartOver: () => void;
  onDownloadPdf?: () => void;
  onPrepareEmail?: () => void;
}

const safeTrim = (value?: string | null) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const toFriendlyDateLabel = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsedFromMMDD = dateUtils.parseMMDDYY(trimmed);
  if (parsedFromMMDD) {
    return dateUtils.formatDisplayDate(parsedFromMMDD);
  }

  const fallback = new Date(trimmed);
  if (!Number.isNaN(fallback.getTime())) {
    return dateUtils.formatDisplayDate(fallback);
  }

  return trimmed;
};

const formatList = (value?: string | string[]) => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {value.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  }

  return <p className="text-gray-700 whitespace-pre-line">{value}</p>;
};

const sanitizeStringOrStringArray = (value: unknown): string | string[] | undefined => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);

    return items.length > 0 ? items : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  return undefined;
};

const sanitizeDiningInput = (value: unknown): DiningInput | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);

    return items.length > 0 ? items : undefined;
  }

  if (typeof value === 'object') {
    const entries = value as Record<string, unknown>;
    const breakfast = typeof entries.breakfast === 'string' ? entries.breakfast.trim() : undefined;
    const lunch = typeof entries.lunch === 'string' ? entries.lunch.trim() : undefined;
    const dinner = typeof entries.dinner === 'string' ? entries.dinner.trim() : undefined;

    const diningObject: { breakfast?: string; lunch?: string; dinner?: string } = {};

    if (breakfast) {
      diningObject.breakfast = breakfast;
    }

    if (lunch) {
      diningObject.lunch = lunch;
    }

    if (dinner) {
      diningObject.dinner = dinner;
    }

    return Object.keys(diningObject).length > 0 ? diningObject : undefined;
  }

  return undefined;
};

const normalizeSection = (input?: SectionInput): LayoutSection | null => {
  if (!input) {
    return null;
  }

  if (Array.isArray(input)) {
    const items = input
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);

    if (items.length === 0) {
      return null;
    }

    return { activities: items };
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }
    return { activities: trimmed };
  }

  const section: LayoutSection = {
    title: input.title,
    summary: input.summary,
    activities: input.activities,
    notes: input.notes,
    transportation: sanitizeStringOrStringArray(
      (input as Record<string, unknown>).transportation ??
        (input as Record<string, unknown>).transport ??
        (input as Record<string, unknown>).gettingAround ??
        (input as Record<string, unknown>).transit ??
        (input as Record<string, unknown>).travel ??
        (input as Record<string, unknown>).transfer
    ),
    dining: sanitizeDiningInput(
      (input as Record<string, unknown>).dining ??
        (input as Record<string, unknown>).meals ??
        (input as Record<string, unknown>).diningOptions ??
        (input as Record<string, unknown>).food
    ),
  };

  if (Array.isArray(section.activities)) {
    section.activities = section.activities
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }

  if (typeof section.activities === 'string') {
    section.activities = section.activities.trim();
  }

  if (section.summary) {
    section.summary = section.summary.trim();
  }

  if (section.notes) {
    section.notes = section.notes.trim();
  }

  if (!section.summary && !section.activities && !section.notes && !section.transportation && !section.dining) {
    return null;
  }

  return section;
};

type RenderDiningOptions = {
  heading?: string;
  headingClassName?: string;
  containerClassName?: string;
  headingTag?: 'h3' | 'h4';
  textClassName?: string;
  itemClassName?: string;
};

const renderDining = (
  dining?: DiningInput,
  options: RenderDiningOptions = {
    heading: '🍽️ Dining',
    headingClassName: 'text-lg font-semibold text-gray-800 mb-2',
    containerClassName: 'mb-4',
    headingTag: 'h3',
    textClassName: 'text-gray-700 whitespace-pre-line',
    itemClassName: 'text-gray-700',
  }
) => {
  const {
    heading = '🍽️ Dining',
    headingClassName = 'text-lg font-semibold text-gray-800 mb-2',
    containerClassName = 'mb-4',
    headingTag = 'h3',
    textClassName = 'text-gray-700 whitespace-pre-line',
    itemClassName = 'text-gray-700',
  } = options;

  if (!dining) {
    return null;
  }

  const HeadingTag = headingTag;

  if (typeof dining === 'string') {
    const trimmed = dining.trim();
    if (!trimmed) {
      return null;
    }

    return (
      <div className={containerClassName}>
        <HeadingTag className={headingClassName}>{heading}</HeadingTag>
        <p className={textClassName}>{trimmed}</p>
      </div>
    );
  }

  if (Array.isArray(dining)) {
    const items = dining
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);

    if (items.length === 0) {
      return null;
    }

    return (
      <div className={containerClassName}>
        <HeadingTag className={headingClassName}>{heading}</HeadingTag>
        <div className="space-y-2">
          {items.map((item, index) => (
            <p key={index} className={itemClassName}>
              {item}
            </p>
          ))}
        </div>
      </div>
    );
  }

  const entries = [
    { label: 'Breakfast', value: dining.breakfast },
    { label: 'Lunch', value: dining.lunch },
    { label: 'Dinner', value: dining.dinner },
  ].filter((entry) => entry.value && typeof entry.value === 'string' && entry.value.trim());

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName}>
      <HeadingTag className={headingClassName}>{heading}</HeadingTag>
      <div className="space-y-2">
        {entries.map(({ label, value }) => (
          <p key={label} className={itemClassName}>
            <strong>{label}:</strong> {value}
          </p>
        ))}
      </div>
    </div>
  );
};

const renderTransportationDetails = (
  transportation?: string | string[],
  heading: string = '🚗 Transportation',
  headingClassName: string = 'text-lg font-semibold text-gray-800 mb-2',
  containerClassName: string = 'mb-4',
  textClassName: string = 'text-gray-700 whitespace-pre-line'
) => {
  if (!transportation) {
    return null;
  }

  if (Array.isArray(transportation)) {
    const items = transportation.filter(Boolean);
    if (items.length === 0) {
      return null;
    }

    return (
      <div className={containerClassName}>
        <h4 className={headingClassName}>{heading}</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  const trimmed = transportation.trim();
  if (!trimmed) {
    return null;
  }

  return (
    <div className={containerClassName}>
      <h4 className={headingClassName}>{heading}</h4>
      <p className={textClassName}>{trimmed}</p>
    </div>
  );
};

const renderSection = (label: string, sectionInput?: SectionInput, icon?: string) => {
  const section = normalizeSection(sectionInput);

  if (!section) {
    return null;
  }

  const activities = Array.isArray(section.activities)
    ? section.activities.join('\n')
    : section.activities;

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {icon ? `${icon} ` : ''}{label}
      </h3>
      {section.summary && <p className="text-gray-700 mb-2">{section.summary}</p>}
      {activities && <p className="text-gray-700 whitespace-pre-line">{activities}</p>}
      {section.notes && <p className="text-gray-600 italic mt-2">{section.notes}</p>}
      {renderTransportationDetails(
        section.transportation,
        '🚗 Transportation',
        'text-sm font-semibold uppercase tracking-wide text-gray-600 mb-1',
        'mt-3',
        'text-gray-700'
      )}
      {renderDining(section.dining, {
        heading: 'Dining',
        headingTag: 'h4',
        headingClassName: 'text-sm font-semibold uppercase tracking-wide text-gray-600 mb-1',
        containerClassName: 'mt-3',
        textClassName: 'text-gray-700 whitespace-pre-line',
        itemClassName: 'text-gray-700',
      })}
    </div>
  );
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  layout,
  formData,
  mapImageUrl = null,
  isLoading = false,
  onStartOver,
  onDownloadPdf,
  onPrepareEmail,
}) => {
  if (!layout || !formData) {
    return null;
  }

  const heroName =
    safeTrim(formData.tripNickname) ||
    safeTrim(formData.travelStyleAnswers?.tripNickname) ||
    safeTrim(formData.location) ||
    'Your Adventure';

  const travelersLabel = (() => {
    const adults = formData.adults ?? 0;
    const children = formData.children ?? 0;
    const adultPart = `${adults} adult${adults === 1 ? '' : 's'}`;
    const childPart =
      children > 0 ? ` • ${children} kid${children === 1 ? '' : 's'}` : '';
    return `${adultPart}${childPart}`;
  })();

  const departDateLabel = toFriendlyDateLabel(formData.departDate);
  const returnDateLabel = toFriendlyDateLabel(formData.returnDate);

  const dateLabel =
    departDateLabel && returnDateLabel
      ? `${departDateLabel} → ${returnDateLabel}`
      : 'Flexible';

  const dailyPlans: LayoutDailyPlan[] = Array.isArray(layout.dailyPlans) && layout.dailyPlans.length > 0
    ? layout.dailyPlans
    : Array.isArray(layout.daily)
      ? layout.daily
      : [];

  const hasDailyPlans = dailyPlans.length > 0;

  const handleDownload = () => {
    onDownloadPdf?.();
  };

  const handlePrepareEmail = () => {
    onPrepareEmail?.();
  };

  return (
    <motion.section 
      className="w-full bg-[#406170] py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="space-y-2 text-center pt-[55px]"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-[clamp(3rem,8vw,5rem)] font-bold uppercase whitespace-nowrap pt-[15px] pb-5">
          <span className="text-[#ece8de]">YOUR </span>
          <span className="text-[#f9dd8b]">PERSONALIZED </span>
          <span className="text-[#ece8de]">ITINERARY</span>
        </div>
        <div
          className="text-[35px] font-bold uppercase py-3 tracking-[3px]"
          style={{ backgroundColor: 'rgb(176, 194, 155)', color: 'rgb(64, 97, 112)' }}
        >
          TRIP SUMMARY | "{heroName}"
        </div>
      </motion.div>

      <div className="mx-auto px-[7%] pt-[3%] pb-[3%]">
        <div className="space-y-8">
          <motion.div 
            className="rounded-3xl p-8"
            style={{ backgroundColor: '#406170' }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: 'Destination', value: safeTrim(formData.location) || '—' },
                { label: 'Dates', value: dateLabel },
                { label: 'Travelers', value: travelersLabel },
                { 
                  label: 'Budget',
                  value: formData.flexibleBudget ? (
                    <div className="flex flex-col items-center text-center gap-1">
                      <span className="text-[22px] font-bold text-[#1f2f35]">
                        Budget is Flexible
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-1">
                      <div className="text-[22px] font-bold text-[#1f2f35]">
                        ${typeof formData.budget === 'number' && formData.budget > 0
                          ? formData.budget.toLocaleString()
                          : '0'}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#43636f]">
                        {(formData as any).budgetMode === 'total' ? 'Total Budget' : 'Per-Person'}
                      </div>
                    </div>
                  )
                },
                { 
                  label: 'Prepared for', 
                  value: safeTrim(formData.contactName) || safeTrim((formData.contactInfo as any)?.name) || '—' 
                }
              ].map((item, index) => (
                <motion.div 
                  key={item.label}
                  className="rounded-xl border border-[#5a8291] bg-[#f9f6ee] px-5 py-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                >
                  <dt className="text-[18px] font-bold uppercase tracking-[0.15em] text-[#406170] mb-2.5 text-center">
                    {item.label}
                  </dt>
                  <dd className="flex flex-col items-center text-center gap-1 text-[#1f2f35] leading-snug break-words">
                    {typeof item.value === 'string' ? (
                      <span className="text-[22px] font-bold">{item.value}</span>
                    ) : (
                      item.value
                    )}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>

          <motion.div 
            className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            {formData?.location ? (
              <InteractiveMap
                location={formData.location}
                lat={formData.locationDetails?.latitude ?? undefined}
                lng={formData.locationDetails?.longitude ?? undefined}
                zoom={5.5}
                className="w-full"
              />
            ) : mapImageUrl ? (
              <img
                src={mapImageUrl}
                alt="Trip map"
                className="w-full object-cover max-h-[420px]"
              />
            ) : (
              <div className="w-full flex flex-col items-center justify-center bg-[#f1f6f4] text-[#4d6b73] min-h-[260px]">
                {isLoading ? 'Loading map…' : 'Map preview not available'}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div>
        <div
          className="shadow-sm mb-[45px] p-[3%]"
          style={{ backgroundColor: 'rgb(176, 194, 155)', color: 'rgb(64, 97, 112)' }}
        >
          <h3 className="font-bold uppercase text-center text-[35px] tracking-[0.05em]">
            🗓️ Daily Itinerary
          </h3>
        </div>

        {hasDailyPlans ? (
          <div className="space-y-4">
            {dailyPlans.map((plan, index) => {
              const eveningInput = (plan as any).evening ?? (plan as any).evenning;
              const dayNumber = plan.day ?? index + 1;
              const planTitle = plan.title || (plan as any).dayTitle || '';
              const planDateLabel = toFriendlyDateLabel(plan.date);
              const titleSuffix = planTitle || planDateLabel || '';
              const title = titleSuffix
                ? `Day ${dayNumber}: ${titleSuffix}`
                : `Day ${dayNumber}`;
              const summary = plan.summary || (plan as any).description || '';
              const highlight =
                typeof plan.signatureHighlight === 'string'
                  ? plan.signatureHighlight
                  : typeof (plan as any).highlight === 'string'
                    ? (plan as any).highlight
                    : undefined;

              const dining = plan.dining ?? (plan as any).meals ?? (plan as any).diningOptions;

              return (
              <motion.div
                key={`${plan.day ?? index}`}
                className="max-w-4xl mx-auto shadow-sm rounded-b-2xl mb-[20px]"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 + (index * 0.2) }}
              >
                <div
                  className="grid grid-cols-1 rounded-t-2xl"
                  style={{ backgroundColor: '#406170', color: '#ffffff' }}
                >
                  <div className="flex flex-wrap items-baseline gap-3 pr-6 pl-14 py-4">
                      <h4 className="font-bold text-[21px]">
                      {title}
                    </h4>
                    {planDateLabel && planTitle && (
                      <span className="text-sm text-white/70">{planDateLabel}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-5 bg-white rounded-[36px] p-6 border-[3px] border-gray-200">
                  {summary && (
                    <div className="rounded-2xl border border-[#dce5e2] bg-[#f7f9f8] p-4 text-base leading-relaxed text-[#1f2f35]">
                      {summary}
                    </div>
                  )}
                  {renderSection('Morning', plan.morning, '🌅')}
                  {renderSection('Afternoon', plan.afternoon, '☀️')}
                  {renderSection('Evening', eveningInput, '🌙')}
                  {renderDining(dining)}
                  {renderSection('Transportation', plan.transportation, '🚗')}

                  {highlight && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f9dd8b]/60 to-[#f2a65a]/60 text-[#4d3217]">
                      <h4 className="text-lg font-semibold mb-2">
                        ✨ Signature highlight
                      </h4>
                      <p className="whitespace-pre-line">{highlight}</p>
                    </div>
                  )}
                </div>
              </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500">
            Daily itinerary details are not available yet.
          </p>
        )}
      </div>

      {layout.travelTips && layout.travelTips.length > 0 && (
        <div className="space-y-8">
          <div
            className="border border-slate-100 shadow-sm p-6 text-center mt-[45px] text-[35px]"
            style={{ backgroundColor: 'rgb(176, 194, 155)', color: 'rgb(64, 97, 112)' }}
          >
            <h3 className="font-bold uppercase tracking-widest mb-4 text-[35px]">
              💡 Tips for Your Trip
            </h3>
          </div>

          <div className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#406170]">
            Tailored for {heroName} using your travel preferences
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-4 rounded-2xl bg-[#ece8de] border-y-[10px] border-[#d1d5db]">
            {layout.travelTips.map((tip, index) => (
              <article key={`${tip.title ?? index}`} className="space-y-1 py-3">
                {tip.title && (
                  <h4 className="text-base font-semibold text-slate-900">
                    {tip.title}
                  </h4>
                )}
                {tip.description && (
                  <p className="text-sm text-slate-600 leading-snug">
                    {tip.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      <div
        className="border border-slate-100 shadow-sm p-6 text-center text-[35px] mt-[45px]"
        style={{ backgroundColor: 'rgb(176, 194, 155)', color: 'rgb(64, 97, 112)' }}
      >
        <h3 className="font-bold uppercase tracking-widest mb-0 text-[35px]">
          ❓ What do you want to do next?
        </h3>
      </div>

      <motion.div 
        className="rounded-2xl p-8 my-[10px] max-w-6xl mx-auto mt-10 mb-16"
        style={{ backgroundColor: '#406170' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.0 }}
      >
        <div className="flex flex-col gap-4">
          {/* Row 1: 3 buttons */}
          <div className="flex gap-3 justify-start flex-wrap">
            <motion.button
              type="button"
              onClick={onStartOver}
              className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all hover:scale-105 flex-1"
              style={{ 
                backgroundColor: '#f9dd8b', 
                color: '#406170',
                fontWeight: 700,
                border: 'none',
                minWidth: 'fit-content'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🔀</span>
              <span>MAKE CHANGES TO MY ITINERARY</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all hover:scale-105 flex-1"
              style={{ 
                backgroundColor: '#e2a2d2', 
                color: '#406170',
                fontWeight: 700,
                border: 'none',
                minWidth: 'fit-content'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>⬇️</span>
              <span>EXPORT IT AS A PDF</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handlePrepareEmail}
              className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all hover:scale-105 flex-1"
              style={{ 
                backgroundColor: '#96a4f2', 
                color: '#406170',
                fontWeight: 700,
                border: 'none',
                minWidth: 'fit-content'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>📧</span>
              <span>EMAIL IT</span>
            </motion.button>
          </div>

          {/* Row 2: 2 buttons */}
          <div className="flex gap-3 justify-start flex-wrap">
            <motion.button
              type="button"
              className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all hover:scale-105 flex-1"
              style={{ 
                backgroundColor: '#f68854', 
                color: '#406170',
                fontWeight: 700,
                border: 'none',
                minWidth: 'fit-content'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🔗</span>
              <span>SHARE VIA LINK</span>
            </motion.button>

            <motion.button
              type="button"
              className="flex items-center gap-3 px-5 py-3 rounded-lg transition-all hover:scale-105 flex-1"
              style={{ 
                backgroundColor: '#b0c29b', 
                color: '#406170',
                fontWeight: 700,
                border: 'none',
                minWidth: 'fit-content'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🗺️</span>
              <span className="whitespace-normal text-left">LET HYLO PLAN AND BOOK EVERYTHING FOR ME WITH HYLO CONCIERGE</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default ItineraryDisplay;
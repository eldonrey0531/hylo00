import Groq from 'groq-sdk';

import type { TripFormData } from '@/types';
import type { ItineraryLayout, LayoutDailySection, LayoutTipSection } from '@/types/itinerary/layout';
import { logger } from '@/utils/console-logger';

let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
	if (groqClient) {
		return groqClient;
	}

	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		logger.warn(30, 'GROQ_API_KEY_MISSING', 'lib/ai/groqService.ts', 'getGroqClient', 'GROQ_API_KEY is not configured');
		return null;
	}

	groqClient = new Groq({ apiKey });
	return groqClient;
}

export interface FormatItineraryLayoutParams {
	workflowId: string;
	itinerary: unknown;
	rawContent: string;
	formData: TripFormData;
}

export interface FormatItineraryLayoutResult {
	layout: ItineraryLayout;
	model: string;
	rawText: string;
	usedGroq: boolean;
}

const LAYOUT_MODEL = process.env.GROQ_LAYOUT_MODEL || 'openai/gpt-oss-120b';

export async function formatItineraryLayout(params: FormatItineraryLayoutParams): Promise<FormatItineraryLayoutResult> {
	const { workflowId, itinerary, rawContent, formData } = params;

	const client = getGroqClient();
	if (!client) {
		logger.warn(30, 'GROQ_CLIENT_UNAVAILABLE', 'lib/ai/groqService.ts', 'formatItineraryLayout', 'Falling back to heuristic layout', {
			workflowId,
		});
		return {
			layout: buildFallbackLayout(itinerary),
			model: 'fallback:heuristic',
			rawText: '',
			usedGroq: false,
		};
	}

	const prompt = buildLayoutPrompt({ itinerary, rawContent, formData });

	try {
		logger.log(30, 'GROQ_LAYOUT_REQUEST_DISPATCHED', 'lib/ai/groqService.ts', 'formatItineraryLayout', {
			workflowId,
			model: LAYOUT_MODEL,
			promptCharacters: prompt.length,
		});

		const response = await client.chat.completions.create({
			model: LAYOUT_MODEL,
			temperature: 0.2,
			max_tokens: 2000,
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'system',
					content:
						'You are a travel concierge converting structured itineraries into polished layout JSON. Return valid JSON matching the schema provided. Keep language warm, concise, and action oriented.',
				},
				{
					role: 'user',
					content: prompt,
				},
			],
		});

		const rawText = response.choices?.[0]?.message?.content ?? '';

		if (!rawText) {
			throw new Error('Groq returned empty response');
		}

		const parsed = parseLayoutResponse(rawText);

		logger.log(31, 'GROQ_LAYOUT_SUCCESS', 'lib/ai/groqService.ts', 'formatItineraryLayout', {
			workflowId,
			model: LAYOUT_MODEL,
			introHeading: parsed.intro.heading,
			dailyCount: parsed.daily.length,
		});

		return {
			layout: parsed,
			model: LAYOUT_MODEL,
			rawText,
			usedGroq: true,
		};
	} catch (error) {
		logger.error(32, 'GROQ_LAYOUT_FAILED', 'lib/ai/groqService.ts', 'formatItineraryLayout', error instanceof Error ? error : String(error), {
			workflowId,
		});

		return {
			layout: buildFallbackLayout(itinerary),
			model: 'fallback:heuristic',
			rawText: '',
			usedGroq: false,
		};
	}
}

function buildLayoutPrompt({
	itinerary,
	rawContent,
	formData,
}: {
	itinerary: unknown;
	rawContent: string;
	formData: TripFormData;
}): string {
	const itineraryJson = safeStringify(itinerary);
	const formJson = safeStringify(formData);

	return `You are given an AI generated trip itinerary and the original traveler form submission.

Return a JSON object matching this TypeScript interface:

interface LayoutIntro {
	heading: string;
	body: string[];
	highlights: string[];
}

interface LayoutDailySection {
	title: string;
	summary: string;
	morning: string[];
	afternoon: string[];
	evening: string[];
	dining: string[];
	highlight: string;
}

interface LayoutTipSection {
	title: string;
	bullets: string[];
}

interface ItineraryLayout {
	intro: LayoutIntro;
	daily: LayoutDailySection[];
	keyTakeaways: string[];
	nextSteps: string[];
	travelTips: LayoutTipSection[];
}

CRITICAL INSTRUCTIONS FOR DAILY ACTIVITIES:
- The input data contains dailyPlans with morning/afternoon/evening objects that have "activities" fields (strings)
- ANALYZE the keyTakeaways to understand traveler preferences (history, arts, food, shopping, nightlife, etc.)
- BREAK DOWN each "activities" string into 3+ SPECIFIC, DETAILED bullet points (minimum 3 per time period)
- Make each bullet point actionable, engaging, and location-specific
- Focus on practical details, cultural insights, and memorable experiences
- Ensure activities align with the destination and traveler interests from keyTakeaways
- Transform basic descriptions into rich, human-readable experiences

Example: If input activities string is "Visit the Imperial Palace gardens for a serene history lesson (stroll the grounds, learn about samurai era). Signature highlight: Picnicking under cherry blossoms"
Transform to: ["Take a peaceful morning stroll through the Imperial Palace East Gardens", "Learn about samurai history at the informative exhibits", "Find a perfect spot for a relaxing picnic breakfast", "Photograph the beautiful landscape and traditional architecture"]

Rules:
- Use the travel style, group, and date preferences from the traveler form to personalize tone.
- Each array must contain at least one item.
- Use markdown-friendly plain text only (no HTML tags).
- Summaries should be 1-2 sentences. Bullet strings should be concise actions or highlights.
- Ensure day titles include the day number and destination focus.
- Key takeaways should emphasize memorable experiences.
- Next steps should focus on concierge follow-ups.
- TRAVEL TIPS: Generate at least 3 comprehensive travel tip sections with practical, location-specific advice covering preparation, local customs, safety, and unique experiences.

Traveler form data:
${formJson}

Original itinerary JSON (contains keyTakeaways for analysis):
${itineraryJson}

Original raw content (if helpful):
${rawContent}`;
}

function parseLayoutResponse(raw: string): ItineraryLayout {
	const trimmed = raw.trim();
	let jsonText = trimmed;

	const match = trimmed.match(/```json([\s\S]*?)```/i) || trimmed.match(/```([\s\S]*?)```/i);
	if (match) {
		jsonText = match[1];
	}

	const parsed = JSON.parse(jsonText) as Partial<ItineraryLayout>;

	return normalizeLayout(parsed);
}

function normalizeLayout(layout: Partial<ItineraryLayout>): ItineraryLayout {
	const intro = layout.intro ?? {
		heading: 'Your Personalized Journey',
		body: ['Your itinerary is ready.'],
		highlights: [],
	};

	return {
		intro: {
			heading: intro.heading || 'Your Personalized Journey',
			body: normalizeStringArray(intro.body, ['Let’s explore your upcoming adventure.']),
			highlights: normalizeStringArray(intro.highlights, []),
		},
		daily: normalizeDaily(layout.daily),
		keyTakeaways: normalizeStringArray(layout.keyTakeaways, ['Expect memorable experiences tailored to your preferences.']),
		nextSteps: normalizeStringArray(layout.nextSteps, ['Confirm schedule details and handle any reservations.']),
		travelTips: normalizeTips(layout.travelTips),
	};
}

type ScheduleEntry = {
	time?: string;
	activity?: string;
	details?: string;
};

function splitScheduleByPeriod(schedule: ScheduleEntry[] | undefined): {
	morning: string[];
	afternoon: string[];
	evening: string[];
	dining: string[];
	highlight: string | null;
} {
	if (!Array.isArray(schedule) || schedule.length === 0) {
		return { morning: [], afternoon: [], evening: [], dining: [], highlight: null };
	}

	const morning: string[] = [];
	const afternoon: string[] = [];
	const evening: string[] = [];
	const dining: string[] = [];
	let highlight: string | null = null;

	const inferPeriod = (time?: string): 'morning' | 'afternoon' | 'evening' => {
		if (!time) return 'afternoon';
		const lower = time.toLowerCase();
		if (lower.includes('evening') || lower.includes('late') || lower.includes('night')) {
			return 'evening';
		}
		if (lower.includes('morning')) {
			return 'morning';
		}
		if (lower.includes('afternoon')) {
			return 'afternoon';
		}

		const durationMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
		if (durationMatch) {
			const hour = parseInt(durationMatch[1], 10) % 12;
			const isPm = durationMatch[3] === 'pm';
			const normalizedHour = hour + (isPm ? 12 : 0);
			if (normalizedHour >= 17 || normalizedHour < 5) {
				return 'evening';
			}
			if (normalizedHour >= 12) {
				return 'afternoon';
			}
			return 'morning';
		}

		return 'afternoon';
	};

	schedule.forEach((entry) => {
		if (!entry || (typeof entry.activity !== 'string' && typeof entry.details !== 'string')) {
			return;
		}

		const bulletParts: string[] = [];
		if (entry.activity) {
			bulletParts.push(entry.activity.trim());
		}
		if (entry.details) {
			bulletParts.push(entry.details.trim());
		}
		const bullet = bulletParts.join(' — ').trim();
		if (!bullet) {
			return;
		}

		const period = inferPeriod(entry.time);
		switch (period) {
			case 'morning':
				morning.push(bullet);
				break;
			case 'evening':
				evening.push(bullet);
				break;
			default:
				afternoon.push(bullet);
		}

		if (!highlight) {
			highlight = bullet;
		}

		if (entry.details && /dinner|lunch|breakfast|meal|tapas|restaurant|bar/i.test(entry.details)) {
			dining.push(entry.details.trim());
		}
	});

	return {
		morning,
		afternoon,
		evening,
		dining,
		highlight,
	};
}

function normalizeDaily(daily?: LayoutDailySection[]): LayoutDailySection[] {
	if (!Array.isArray(daily) || daily.length === 0) {
		return [
			{
				title: 'Day 1: Arrival & First Impressions',
				summary: 'Settle into your destination and begin exploring with curated experiences tailored to your travel style.',
				morning: ['Arrive at your accommodation and take time to freshen up', 'Enjoy a welcome breakfast featuring local specialties', 'Take a leisurely walk to get oriented with your surroundings'],
				afternoon: ['Visit a nearby landmark or attraction that captures the local essence', 'Explore a local market or neighborhood to experience daily life', 'Find a quiet spot to relax and people-watch'],
				evening: ['Watch the sunset from a scenic viewpoint', 'Stroll through well-lit areas to experience the evening atmosphere', 'Find a cozy spot for your first dinner in the destination'],
				dining: ['Try a traditional restaurant with authentic local cuisine', 'Sample street food from a reputable vendor', 'Enjoy a meal that incorporates regional ingredients'],
				highlight: 'Your first authentic connection with the destination\'s unique character and welcoming spirit.',
			},
		];
	}

	return daily.map((section, index) => {
		const scheduleData = splitScheduleByPeriod((section as any)?.schedule);
		const derivedMorning = scheduleData.morning.length > 0 ? scheduleData.morning : undefined;
		const derivedAfternoon = scheduleData.afternoon.length > 0 ? scheduleData.afternoon : undefined;
		const derivedEvening = scheduleData.evening.length > 0 ? scheduleData.evening : undefined;
		const derivedDining = scheduleData.dining.length > 0 ? scheduleData.dining : undefined;
		const derivedHighlight = scheduleData.highlight;

		return {
			title: section?.title || `Day ${index + 1}: Discovery & Adventure`,
			summary: section?.summary || 'A carefully crafted day of meaningful experiences and memorable moments.',
			morning: normalizeStringArray(section?.morning, derivedMorning ?? [
				'Start your day with a nourishing breakfast',
				'Take a morning walk to explore the neighborhood',
				'Visit a local café for coffee and people-watching',
			]),
			afternoon: normalizeStringArray(section?.afternoon, derivedAfternoon ?? [
				'Discover a key attraction or cultural site',
				'Enjoy a leisurely lunch with local flavors',
				'Explore nearby areas at a comfortable pace',
			]),
			evening: normalizeStringArray(section?.evening, derivedEvening ?? [
				'Experience the destination as locals do',
				'Find a scenic spot to watch the day transition',
				'Relax with evening entertainment or quiet reflection',
			]),
			dining: normalizeStringArray(section?.dining, derivedDining ?? [
				'Savor traditional dishes with regional specialties',
				'Try a restaurant that locals recommend',
				'Experience dining that tells a story about the place',
			]),
			highlight: section?.highlight || derivedHighlight || 'A standout experience that will become a cherished memory of your journey.',
		};
	});
}

function normalizeTips(tips?: LayoutTipSection[]): LayoutTipSection[] {
	if (!Array.isArray(tips) || tips.length === 0) {
		return [
			{
				title: 'Local Transportation',
				bullets: ['Research public transit options and download relevant apps.', 'Consider ride-sharing services for convenience.', 'Plan for walking distances between attractions.'],
			},
			{
				title: 'Cultural Etiquette',
				bullets: ['Learn basic local greetings and customs.', 'Respect local dress codes at religious sites.', 'Try local specialties and show appreciation for the cuisine.'],
			},
			{
				title: 'Health & Safety',
				bullets: ['Stay hydrated and protect yourself from the sun.', 'Keep important documents and valuables secure.', 'Have emergency contact numbers saved on your phone.'],
			},
		];
	}

	// Ensure we have at least 3 tips
	const enhancedTips = [...tips];
	while (enhancedTips.length < 3) {
		const defaultTips = [
			{
				title: 'Packing Essentials',
				bullets: ['Pack comfortable walking shoes for exploration.', 'Bring weather-appropriate clothing layers.', 'Don\'t forget adapters for local electrical outlets.'],
			},
			{
				title: 'Budget Planning',
				bullets: ['Set daily spending limits for meals and activities.', 'Look for free or low-cost local experiences.', 'Track expenses to stay within your budget.'],
			},
			{
				title: 'Sustainable Travel',
				bullets: ['Use reusable water bottles and shopping bags.', 'Choose eco-friendly transportation when possible.', 'Support local businesses and artisans.'],
			},
		];
		enhancedTips.push(defaultTips[enhancedTips.length % defaultTips.length]);
	}

	return enhancedTips.map((tip) => ({
		title: tip?.title || 'Additional Insight',
		bullets: normalizeStringArray(tip?.bullets, ['Keep this tip in mind.']),
	}));
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
	if (Array.isArray(value)) {
		const cleaned = value
			.map((item) => (typeof item === 'string' ? item.trim() : null))
			.filter((item): item is string => Boolean(item));
		if (cleaned.length > 0) {
			return cleaned;
		}
	}

	if (typeof value === 'string' && value.trim()) {
		return [value.trim()];
	}

	return fallback;
}

function buildFallbackLayout(itinerary: unknown): ItineraryLayout {
	const draft = itinerary as any;
	const dailyPlans: any[] = Array.isArray(draft?.dailyPlans)
		? draft.dailyPlans
		: Array.isArray(draft?.dailyItinerary)
			? draft.dailyItinerary
			: [];

	const daily = dailyPlans.map((plan: any, index: number) => ({
		title: plan?.title || plan?.dayTitle || `Day ${plan?.day ?? index + 1}`,
		summary: plan?.summary || 'Curated experiences aligned with your interests.',
		morning: normalizeStringArray(plan?.morning?.activities ?? plan?.morning, [
			'Start your day with local breakfast options',
			'Explore nearby attractions at a relaxed pace',
			'Take time for morning reflection or light activities'
		]),
		afternoon: normalizeStringArray(plan?.afternoon?.activities ?? plan?.afternoon, [
			'Enjoy lunch featuring regional specialties',
			'Visit key landmarks and cultural sites',
			'Engage in afternoon activities suited to your interests'
		]),
		evening: normalizeStringArray(plan?.evening?.activities ?? plan?.evening, [
			'Unwind with dinner at a recommended restaurant',
			'Experience evening entertainment or nightlife',
			'Reflect on the day\'s experiences'
		]),
		dining: normalizeStringArray(plan?.dining, ['Sample local cuisine.', 'Try regional specialties.', 'Enjoy authentic dining experiences.']),
		highlight: typeof plan?.signatureHighlight === 'string'
			? plan.signatureHighlight
			: 'A highlight moment to remember.',
	}));

	return {
		intro: {
			heading: draft?.intro?.heading || 'Your Personalized Journey',
			body: normalizeStringArray(draft?.intro?.body ?? draft?.intro, ['Your itinerary is ready.']),
			highlights: normalizeStringArray(draft?.highlights, []),
		},
		daily: daily.length > 0 ? daily : normalizeDaily(undefined),
		keyTakeaways: normalizeStringArray(draft?.keyTakeaways, ['Expect memorable experiences tailored to you.']),
		nextSteps: normalizeStringArray(draft?.nextSteps, ['Confirm details with your concierge.']),
		travelTips: normalizeTips(draft?.travelTips),
	};
}

function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value, null, 2);
	} catch (error) {
		return typeof value === 'string' ? value : '[unserializable]';
	}
}

export * from './architectAI';

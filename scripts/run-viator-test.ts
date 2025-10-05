import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { register } from 'tsconfig-paths';

type TripFormData = Record<string, any>;

async function main() {
  loadEnvLocal();

  const cleanup = register({
    baseUrl: resolve(process.cwd()),
    paths: {
      '@/*': ['src/*'],
      '@/app/*': ['src/app/*'],
      '@/components/*': ['src/components/*'],
      '@/inngest/*': ['src/inngest/*'],
      '@/lib/*': ['src/lib/*'],
      '@/types/*': ['src/types/*'],
      '@/utils/*': ['src/utils/*'],
      '@/tests/*': ['./tests/*'],
    },
  });

  try {
    if (!process.env.VIATOR_API_KEY) {
      console.error('Missing VIATOR_API_KEY environment variable.');
      process.exitCode = 1;
      return;
    }

    const [{ getItineraryConfig, resetItineraryConfig }, viatorModule] = await Promise.all([
      import('@/lib/config/itinerary-config'),
      import('@/lib/ai/viatorAI'),
    ]);

    const { getViatorContextForItinerary, getViatorDestinationId, searchViatorProducts } = viatorModule;

    resetItineraryConfig();
    const config = getItineraryConfig();

    console.log('✅ Loaded Viator configuration.');
    console.log(' • API key length:', config.viator.apiKey.length);
    console.log(' • Partner ID:', config.viator.partnerId || '(default)');

  const formData = buildSampleFormData();
  const typedFormData = formData as any;

  console.log('\n➡️  Resolving destination ID for:', typedFormData.location);
  const destinationId = await getViatorDestinationId(typedFormData.locationDetails ?? typedFormData.location);

    if (!destinationId) {
      console.error('❌ Unable to resolve Viator destination ID for sample form data.');
      process.exitCode = 1;
      return;
    }

    console.log('✅ Destination ID:', destinationId);

    console.log('\n➡️  Fetching Viator products (same call the workflow performs)...');
    const viatorResults = await searchViatorProducts({
      destinationName: typedFormData.location,
      destinationId,
      latitude: typedFormData.locationDetails?.latitude,
      longitude: typedFormData.locationDetails?.longitude,
      startDate: typedFormData.departDate ?? undefined,
      endDate: typedFormData.returnDate ?? undefined,
      currency: typedFormData.currency,
      categories: typedFormData.selectedInclusions,
      interests: typedFormData.selectedInterests,
      adults: typedFormData.adults,
      children: typedFormData.children,
    });

    console.log('✅ Viator products fetched:', viatorResults.products.length);
    if (viatorResults.products.length > 0) {
      const first = viatorResults.products[0];
      console.log('   Sample product:', first.productName);
      console.log('   Price:', first.price.formattedPrice);
      console.log('   URL:', first.productUrl);
    }

    console.log('\n➡️  Building Viator context for the AI prompt (workflow usage)...');
  const context = await getViatorContextForItinerary(typedFormData);

    console.log('✅ Viator context length:', context.length);
    console.log('\n=== Context Preview ===');
    logTruncated(context, 1200);
    console.log('=======================\n');

    console.log('🎉 Viator integration smoke-test completed successfully.');
  } finally {
    cleanup();
  }
}

function buildSampleFormData(): TripFormData {
  return {
    location: 'Tokyo, Japan',
    locationDetails: {
      placeId: 'ChIJ51cu8IcbXWARiRtXIothAS4',
      label: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      city: 'Tokyo',
      country: 'Japan',
      countryCode: 'JP',
    },
    departDate: '2025-11-10',
    returnDate: '2025-11-15',
    flexibleDates: false,
    plannedDays: null,
    adults: 2,
    children: 0,
    childrenAges: [],
  budget: 6000,
  currency: 'USD',
  budgetMode: 'total',
    flexibleBudget: false,
    selectedGroups: ['couple'],
    customGroupText: null,
    selectedInterests: ['culture', 'food', 'nightlife'],
    customInterestsText: null,
    selectedInclusions: ['activities', 'dining'],
    customInclusionsText: null,
    inclusionPreferences: {},
    travelStyleAnswers: {
      vibes: ['cultural immersion', 'culinary adventures'],
      experience: ['private guides', 'nightlife'],
      dinnerChoices: ['Michelin-star dining', 'street food tours'],
      sampleDays: ['Museum mornings', 'Evening bar hopping'],
    },
    contactInfo: {
      name: 'Test Concierge',
      email: 'concierge@example.com',
    },
  };
}

function logTruncated(text: string, limit: number) {
  if (text.length <= limit) {
    console.log(text);
    return;
  }

  console.log(text.slice(0, limit));
  console.log('... [truncated]');
}

main().catch((error) => {
  console.error('❌ Viator smoke-test failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

function loadEnvLocal() {
  if (process.env.VIATOR_API_KEY) {
    return;
  }

  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const [key, ...rest] = trimmed.split('=');
    if (!key) {
      continue;
    }
    const value = rest.join('=').trim();
    if (!process.env[key] && key === 'VIATOR_API_KEY') {
      process.env[key] = value.replace(/^"|"$/g, '');
    }
    if (!process.env[key] && key === 'VIATOR_PARTNER_ID') {
      process.env[key] = value.replace(/^"|"$/g, '');
    }
  }
}
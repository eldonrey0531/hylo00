import { createRoutingGroqClient } from './llmRoutingService';

const groq = createRoutingGroqClient({
  enableLogging: true,
});

export interface TravelFormData {
  tripDetails: any;
  groups: string[];
  interests: string[];
  inclusions: string[];
  inclusionPreferences?: any;
  experience: string[];
  vibes: string[];
  sampleDays: string[];
  dinnerChoices: string[];
  nickname: string;
  contact: any;
}

export interface AgentLog {
  agentId: number;
  agentName: string;
  model: string;
  timestamp: string;
  input: any;
  output: any;
  searchQueries?: string[];
  decisions?: string[];
  reasoning?: string;
}

interface SelectedChoices {
  hasAccommodations: boolean;
  hasDining: boolean;
  hasTransportation: boolean;
  hasActivities: boolean;
  hasGuides: boolean;
  categories: {
    [key: string]: any;
  };
}

// Agent 1: Data Gatherer - Extracts and validates user selections
const gatherUserSelections = async (
  formData: TravelFormData,
  logs: AgentLog[]
): Promise<SelectedChoices> => {
  const startTime = new Date().toISOString();

  try {
    // Extract all values including defaults
    const adults = formData.tripDetails?.adults || 2;
    const children = formData.tripDetails?.children || 0;
    const budget = formData.tripDetails?.budget || 5000;
    const currency = formData.tripDetails?.currency || 'USD';

    // Extract "Other" manual inputs from various categories
    const extractOtherInputs = () => {
      const otherInputs: any = {};

      // Check each category for "Other:" prefixed values
      const checkForOther = (items: string[], key: string) => {
        const otherItem = items?.find((item) => item.startsWith('Other:'));
        if (otherItem) {
          otherInputs[key] = otherItem.replace('Other:', '').trim();
        }
      };

      checkForOther(formData.groups, 'travelGroupOther');
      checkForOther(formData.interests, 'interestsOther');
      checkForOther(formData.experience, 'experienceOther');
      checkForOther(formData.vibes, 'vibesOther');

      return otherInputs;
    };

    // Extract inclusion preferences including Nature and other specific preferences
    const extractInclusionPreferences = () => {
      const preferences: any = {};

      if (formData.inclusionPreferences) {
        // Extract all inclusion preferences
        Object.keys(formData.inclusionPreferences).forEach((key) => {
          if (formData.inclusionPreferences[key]) {
            preferences[key] = formData.inclusionPreferences[key];

            // Special handling for nature preferences
            if (key === 'nature' && formData.inclusionPreferences[key].naturePreferences) {
              preferences.naturePreferences = formData.inclusionPreferences[key].naturePreferences;
            }
          }
        });
      }

      return preferences;
    };

    const otherInputs = extractOtherInputs();
    const inclusionPrefs = extractInclusionPreferences();

    const prompt = `
You are a data extraction specialist. Analyze the following travel form data and extract ALL provided information including defaults and manual inputs.

FORM DATA:
- Trip Location: ${formData.tripDetails?.location || 'Not specified'}
- Departure Date: ${formData.tripDetails?.departDate || 'Not specified'}
- Return Date: ${formData.tripDetails?.returnDate || 'Not specified'}
- Planned Days: ${formData.tripDetails?.plannedDays || 'Not specified'}
- Adults: ${adults}
- Children: ${children}
- Children Ages: ${formData.tripDetails?.childrenAges?.join(', ') || 'None'}
- Budget: ${budget} ${currency}
- Trip Nickname: "${formData.nickname || 'Not specified'}"

SELECTED CATEGORIES:
- Travel Group: ${formData.groups?.length > 0 ? formData.groups.join(', ') : 'NONE SELECTED'}
  ${
    otherInputs.travelGroupOther
      ? `- Travel Group Other Input: "${otherInputs.travelGroupOther}"`
      : ''
  }
- Travel Interests: ${
      formData.interests?.length > 0 ? formData.interests.join(', ') : 'NONE SELECTED'
    }
  ${otherInputs.interestsOther ? `- Interests Other Input: "${otherInputs.interestsOther}"` : ''}
- Itinerary Inclusions: ${
      formData.inclusions?.length > 0 ? formData.inclusions.join(', ') : 'NONE SELECTED'
    }
  ${
    inclusionPrefs.naturePreferences
      ? `- Nature Preferences: "${inclusionPrefs.naturePreferences}"`
      : ''
  }
- Experience Level: ${
      formData.experience?.length > 0 ? formData.experience.join(', ') : 'NONE SELECTED'
    }
  ${otherInputs.experienceOther ? `- Experience Other Input: "${otherInputs.experienceOther}"` : ''}
- Trip Vibe: ${formData.vibes?.length > 0 ? formData.vibes.join(', ') : 'NONE SELECTED'}
  ${otherInputs.vibesOther ? `- Vibe Other Input: "${otherInputs.vibesOther}"` : ''}
- Sample Days: ${formData.sampleDays?.length > 0 ? formData.sampleDays.join(', ') : 'NONE SELECTED'}
- Dinner Choices: ${
      formData.dinnerChoices?.length > 0 ? formData.dinnerChoices.join(', ') : 'NONE SELECTED'
    }

INCLUSION PREFERENCES DETAILS:
${JSON.stringify(inclusionPrefs, null, 2)}

CONTACT INFORMATION:
- Name: ${formData.contact?.name || 'Not provided'}
- Email: ${formData.contact?.email || 'Not provided'}

INSTRUCTIONS:
Return a JSON object with the following structure. Include ALL values including defaults:
{
  "hasAccommodations": boolean (true if "Accommodations" is in inclusions),
  "hasDining": boolean (true if "Dining" is in inclusions),
  "hasTransportation": boolean (true if "Transportation" or "Rental Car" is in inclusions),
  "hasActivities": boolean (true if "Activities" or "Activities & Tours" is in inclusions),
  "hasGuides": boolean (true if "Local guides" is in inclusions),
  "categories": {
    "location": "extracted location",
    "dates": "extracted dates",
    "travelers": {
      "adults": ${adults},
      "children": ${children},
      "childrenAges": [${formData.tripDetails?.childrenAges?.join(', ') || ''}],
      "total": ${adults + children}
    },
    "budget": {
      "amount": ${budget},
      "currency": "${currency}",
      "formatted": "${budget} ${currency}"
    },
    "travelGroup": [array of selected groups],
    "travelGroupOther": "${otherInputs.travelGroupOther || ''}",
    "interests": [array of selected interests],
    "interestsOther": "${otherInputs.interestsOther || ''}",
    "inclusions": [array of selected inclusions],
    "inclusionPreferences": ${JSON.stringify(inclusionPrefs)},
    "experience": [array of selected experience levels],
    "experienceOther": "${otherInputs.experienceOther || ''}",
    "vibes": [array of selected vibes],
    "vibesOther": "${otherInputs.vibesOther || ''}",
    "sampleDays": [array of selected sample days],
    "dinnerChoices": [array of selected dinner choices],
    "contact": {
      "name": "${formData.contact?.name || ''}",
      "email": "${formData.contact?.email || ''}"
    },
    "nickname": "${formData.nickname || ''}"
  }
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a precise data extraction agent. Extract ALL provided information including defaults and manual inputs.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0]?.message?.content;
    const parsedResult = result ? JSON.parse(result) : getDefaultSelections(formData);

    // Ensure all values are properly extracted
    if (!parsedResult.categories.travelers) {
      parsedResult.categories.travelers = {
        adults,
        children,
        childrenAges: formData.tripDetails?.childrenAges || [],
        total: adults + children,
      };
    }

    if (!parsedResult.categories.budget) {
      parsedResult.categories.budget = {
        amount: budget,
        currency,
        formatted: `${budget} ${currency}`,
      };
    }

    // Merge other inputs
    Object.keys(otherInputs).forEach((key) => {
      if (otherInputs[key] && !parsedResult.categories[key]) {
        parsedResult.categories[key] = otherInputs[key];
      }
    });

    // Log the agent's work
    const decisions = [];
    if (parsedResult.hasAccommodations) decisions.push('User wants accommodation recommendations');
    if (parsedResult.hasDining) decisions.push('User wants dining recommendations');
    if (parsedResult.hasTransportation) decisions.push('User wants transportation details');
    if (parsedResult.hasActivities) decisions.push('User wants activities and tours');
    if (parsedResult.hasGuides) decisions.push('User wants local guide information');
    decisions.push(`Extracted ${adults} adults, ${children} children`);
    decisions.push(`Budget: ${budget} ${currency}`);

    Object.keys(otherInputs).forEach((key) => {
      if (otherInputs[key]) {
        decisions.push(`Custom input for ${key}: ${otherInputs[key]}`);
      }
    });

    if (inclusionPrefs.naturePreferences) {
      decisions.push(`Nature preferences: ${inclusionPrefs.naturePreferences}`);
    }

    logs.push({
      agentId: 1,
      agentName: 'Data Gatherer',
      model: 'llama-3.3-70b-versatile',
      timestamp: startTime,
      input: formData,
      output: parsedResult,
      decisions,
      reasoning: `Analyzed form data and identified ${decisions.length} key selections. Extracted all form values including defaults (adults: ${adults}, children: ${children}, budget: ${budget} ${currency}) and manual "Other" inputs.`,
    });

    return parsedResult;
  } catch (error) {
    console.error('Error in Agent 1 (Data Gatherer):', error);
    return getDefaultSelections(formData);
  }
};

// Agent 2: Information Gatherer - Gets real-time data using compound-beta
const gatherRealtimeInformation = async (
  selections: SelectedChoices,
  logs: AgentLog[]
): Promise<string> => {
  const startTime = new Date().toISOString();

  try {
    const location = selections.categories.location;
    const interests = selections.categories.interests?.join(', ') || '';
    const dates = selections.categories.dates;
    const budget = selections.categories.budget?.formatted || 'Not specified';
    const travelers = selections.categories.travelers;

    const searchQueries = [];
    let searchQuery = `Research comprehensive information for ${location}:\n`;

    // Build search queries based on selections
    if (selections.hasActivities && interests) {
      const query = `Best activities and attractions in ${location} for: ${interests}`;
      searchQuery += `- ${query}\n`;
      searchQueries.push(query);
    }

    if (selections.hasAccommodations) {
      const query = `Hotel recommendations in ${location} for ${travelers.adults} adults${
        travelers.children > 0 ? ` and ${travelers.children} children` : ''
      }, budget: ${budget}`;
      searchQuery += `- ${query}\n`;
      searchQueries.push(query);
    }

    if (selections.hasDining) {
      const query = `Best restaurants and dining experiences in ${location}`;
      searchQuery += `- ${query}\n`;
      searchQueries.push(query);
    }

    if (selections.hasTransportation) {
      const query = `Transportation options, car rentals, and getting around in ${location}`;
      searchQuery += `- ${query}\n`;
      searchQueries.push(query);
    }

    // Include nature preferences if specified
    if (selections.categories.inclusionPreferences?.naturePreferences) {
      const query = `Nature activities in ${location}: ${selections.categories.inclusionPreferences.naturePreferences}`;
      searchQuery += `- ${query}\n`;
      searchQueries.push(query);
    }

    // Include "Other" manual inputs in searches
    if (selections.categories.interestsOther) {
      const query = `${location} activities for: ${selections.categories.interestsOther}`;
      searchQuery += `- ${query}\n`;
      searchQueries.push(query);
    }

    // Always search for these
    searchQueries.push(`Current events and festivals in ${location} for ${dates}`);
    searchQueries.push(`Weather conditions and best time to visit ${location}`);
    searchQueries.push(`Safety tips, local customs, and travel advice for ${location}`);
    searchQueries.push(`Hidden gems and local recommendations in ${location}`);

    searchQuery += `- Current events and festivals for ${dates}\n`;
    searchQuery += `- Weather conditions and seasonal considerations\n`;
    searchQuery += `- Safety tips and local customs\n`;
    searchQuery += `- Hidden gems and insider tips\n`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a travel information specialist with web search capabilities. Provide current, accurate, and comprehensive information for the specified location and categories.',
        },
        {
          role: 'user',
          content: searchQuery,
        },
      ],
      model: 'compound-beta',
      temperature: 0.2,
      max_tokens: 3000,
    });

    const result = completion.choices[0]?.message?.content || 'No real-time information available.';

    logs.push({
      agentId: 2,
      agentName: 'Information Gatherer',
      model: 'compound-beta (with web search)',
      timestamp: startTime,
      input: { location, interests, dates, budget, travelers },
      output: result,
      searchQueries,
      reasoning: `Performed ${searchQueries.length} targeted web searches for ${location}. Gathered real-time information about activities, accommodations, dining, transportation, events, weather, and local insights to inform itinerary planning.`,
    });

    return result;
  } catch (error) {
    console.error('Error in Agent 2 (Information Gatherer):', error);
    return 'Unable to fetch real-time information at this moment.';
  }
};

// Agent 3: Planning Strategist - Creates itinerary structure using real-time info
const planItineraryStructure = async (
  selections: SelectedChoices,
  realtimeInfo: string,
  formData: TravelFormData,
  logs: AgentLog[]
): Promise<string> => {
  const startTime = new Date().toISOString();

  try {
    const prompt = `
You are an itinerary planning strategist. Based on the user's selections and REAL-TIME INFORMATION gathered, create a detailed plan structure.

USER SELECTIONS:
${JSON.stringify(selections, null, 2)}

REAL-TIME INFORMATION GATHERED:
${realtimeInfo}

TRIP NICKNAME: "${formData.nickname}"
TRAVELER NAME: ${formData.contact?.name || 'Traveler'}

CRITICAL RULES:
1. USE the real-time information to make specific, informed recommendations
2. ONLY include sections for what was explicitly selected in "inclusions"
3. If accommodations NOT selected, DO NOT mention hotels or where to stay
4. If dining NOT selected, DO NOT recommend restaurants
5. If transportation NOT selected, DO NOT provide transport details
6. If activities NOT selected, DO NOT suggest tours or activities
7. Incorporate any "Other" manual inputs provided by the user
8. Use the nature preferences if provided: ${
      selections.categories.inclusionPreferences?.naturePreferences || 'None'
    }
9. Include custom inputs: 
   - Travel Group Other: ${selections.categories.travelGroupOther || 'None'}
   - Interests Other: ${selections.categories.interestsOther || 'None'}
   - Experience Other: ${selections.categories.experienceOther || 'None'}
   - Vibes Other: ${selections.categories.vibesOther || 'None'}

Create a structured plan that includes:
- Personalized welcome using the trip nickname "${formData.nickname}"
- Day-by-day breakdown informed by the real-time information
- ONLY include sections for selected inclusions
- Incorporate specific findings from the web searches
- Budget-conscious recommendations based on ${
      selections.categories.budget?.formatted || 'budget not specified'
    }
- Consider group size: ${selections.categories.travelers?.adults || 0} adults, ${
      selections.categories.travelers?.children || 0
    } children

Return a detailed, personalized planning structure based on actual current information.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a strategic planner who creates data-driven itineraries using real-time information. Base your recommendations on the actual search results provided.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.3,
      max_tokens: 3000,
    });

    const result = completion.choices[0]?.message?.content || 'Unable to create plan structure.';

    // Log the planning decisions
    const decisions = [
      `Created personalized itinerary for "${formData.nickname}"`,
      `Incorporated real-time information from web searches`,
      `Planned for ${selections.categories.travelers?.adults || 0} adults, ${
        selections.categories.travelers?.children || 0
      } children`,
      `Budget consideration: ${selections.categories.budget?.formatted || 'Not specified'}`,
      `Focused on ${selections.categories.interests?.length || 0} interest categories`,
      `Adapted for ${selections.categories.experience?.join(', ') || 'general'} experience level`,
      `Structured for ${selections.categories.vibes?.join(', ') || 'balanced'} trip vibe`,
    ];

    if (selections.categories.travelGroupOther) {
      decisions.push(`Incorporated custom travel group: ${selections.categories.travelGroupOther}`);
    }
    if (selections.categories.interestsOther) {
      decisions.push(`Incorporated custom interests: ${selections.categories.interestsOther}`);
    }
    if (selections.categories.inclusionPreferences?.naturePreferences) {
      decisions.push(
        `Incorporated nature preferences: ${selections.categories.inclusionPreferences.naturePreferences}`
      );
    }

    logs.push({
      agentId: 3,
      agentName: 'Planning Strategist',
      model: 'openai/gpt-oss-20b',
      timestamp: startTime,
      input: {
        selections,
        realtimeInfo: realtimeInfo.substring(0, 500) + '...',
      },
      output: result,
      decisions,
      reasoning: `Designed data-driven itinerary framework using real-time information. Created personalized structure for ${
        selections.categories.travelers?.total || 0
      } travelers with budget of ${selections.categories.budget?.formatted || 'unspecified'}.`,
    });

    return result;
  } catch (error) {
    console.error('Error in Agent 3 (Planning Strategist):', error);
    throw error;
  }
};

// Agent 4: Content Compiler - Assembles final itinerary
const compileItinerary = async (
  selections: SelectedChoices,
  plan: string,
  realtimeInfo: string,
  formData: TravelFormData,
  logs: AgentLog[]
): Promise<string> => {
  const startTime = new Date().toISOString();

  try {
    const prompt = `
You are a master travel writer creating a personalized itinerary. Compile the final output using the structured plan and real-time information.

USER SELECTIONS:
${JSON.stringify(selections, null, 2)}

STRUCTURED ITINERARY PLAN:
${plan}

REAL-TIME INFORMATION:
${realtimeInfo}

TRAVELER DETAILS:
- Name: ${formData.contact?.name || 'Traveler'}
- Trip Nickname: "${formData.nickname}"
- Adults: ${selections.categories.travelers?.adults || 2}
- Children: ${selections.categories.travelers?.children || 0}
- Budget: ${selections.categories.budget?.formatted || 'Not specified'}

CREATE A PERSONALIZED ITINERARY WITH THESE RULES:
1. Start with a warm welcome using their name and trip nickname
2. ONLY include sections for selected inclusions:
   ${
     selections.hasAccommodations
       ? '- Include accommodation recommendations'
       : '- DO NOT mention accommodations'
   }
   ${
     selections.hasDining
       ? '- Include dining recommendations'
       : '- DO NOT include restaurant recommendations'
   }
   ${
     selections.hasTransportation
       ? '- Include transportation details'
       : '- DO NOT include transportation details'
   }
   ${
     selections.hasActivities
       ? '- Include activities and tours'
       : '- DO NOT suggest specific activities'
   }
   ${selections.hasGuides ? '- Include local guide information' : '- DO NOT mention guides'}

3. Structure the output with these emoji headers ONLY for selected sections:
   🌟 **WELCOME MESSAGE**
   📅 **DAY-BY-DAY ITINERARY**
   ${selections.hasAccommodations ? '🏨 **ACCOMMODATION RECOMMENDATIONS**' : ''}
   ${selections.hasDining ? '🍽️ **DINING GUIDE**' : ''}
   ${selections.hasTransportation ? '🚗 **TRANSPORTATION GUIDE**' : ''}
   💰 **BUDGET BREAKDOWN**
   📱 **PRACTICAL INFORMATION**
   ✨ **SPECIAL TOUCHES**

4. For the day-by-day itinerary:
   - Focus on the selected interests: ${selections.categories.interests?.join(', ')}
   - Match the selected vibe: ${selections.categories.vibes?.join(', ')}
   - Incorporate sample day preferences: ${selections.categories.sampleDays?.join(', ')}
   - Consider experience level: ${selections.categories.experience?.join(', ')}
   - Include nature activities if specified: ${
     selections.categories.inclusionPreferences?.naturePreferences || 'None'
   }

5. Include any "Other" manual inputs:
   ${
     selections.categories.travelGroupOther
       ? `- Travel Group Other: ${selections.categories.travelGroupOther}`
       : ''
   }
   ${
     selections.categories.interestsOther
       ? `- Interests Other: ${selections.categories.interestsOther}`
       : ''
   }
   ${
     selections.categories.experienceOther
       ? `- Experience Other: ${selections.categories.experienceOther}`
       : ''
   }
   ${selections.categories.vibesOther ? `- Vibes Other: ${selections.categories.vibesOther}` : ''}

6. Budget should reflect: ${selections.categories.budget?.amount || 5000} ${
      selections.categories.budget?.currency || 'USD'
    } for ${selections.categories.travelers?.total || 2} travelers

CRITICAL: Use specific recommendations from the real-time information. Do not create generic content.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert travel writer who creates personalized, detailed itineraries using real-time information and user preferences.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 5000,
    });

    const result = completion.choices[0]?.message?.content || 'Unable to generate final itinerary.';

    const decisions = [
      `Compiled personalized itinerary for "${formData.nickname}"`,
      `Included ${
        [
          selections.hasAccommodations,
          selections.hasDining,
          selections.hasTransportation,
          selections.hasActivities,
          selections.hasGuides,
        ].filter(Boolean).length
      } selected inclusion categories`,
      `Personalized for ${formData.contact?.name || 'traveler'} with ${
        selections.categories.travelers?.total || 2
      } travelers`,
      `Budget: ${selections.categories.budget?.formatted || 'Not specified'}`,
      `Incorporated real-time information and current recommendations`,
    ];

    if (
      selections.categories.travelGroupOther ||
      selections.categories.interestsOther ||
      selections.categories.experienceOther ||
      selections.categories.vibesOther
    ) {
      decisions.push("Incorporated custom 'Other' inputs from user");
    }

    if (selections.categories.inclusionPreferences?.naturePreferences) {
      decisions.push('Included nature activity preferences');
    }

    logs.push({
      agentId: 4,
      agentName: 'Content Compiler',
      model: 'openai/gpt-oss-120b',
      timestamp: startTime,
      input: {
        selections: selections.categories,
        planSummary: plan.substring(0, 200) + '...',
        realtimeInfoSummary: realtimeInfo.substring(0, 200) + '...',
      },
      output: result,
      decisions,
      reasoning: `Assembled comprehensive itinerary for ${
        selections.categories.travelers?.total || 2
      } travelers with budget of ${
        selections.categories.budget?.formatted || 'unspecified'
      }. Incorporated all user preferences including manual "Other" inputs and nature preferences.`,
    });

    return result;
  } catch (error) {
    console.error('Error in Agent 4 (Content Compiler):', error);
    throw error;
  }
};

// Helper function for default selections
const getDefaultSelections = (formData: TravelFormData): SelectedChoices => {
  const inclusions = formData.inclusions || [];
  const adults = formData.tripDetails?.adults || 2;
  const children = formData.tripDetails?.children || 0;
  const budget = formData.tripDetails?.budget || 5000;
  const currency = formData.tripDetails?.currency || 'USD';

  // Extract "Other" inputs
  const otherInputs: any = {};
  const checkForOther = (items: string[], key: string) => {
    const otherItem = items?.find((item) => item.startsWith('Other:'));
    if (otherItem) {
      otherInputs[key] = otherItem.replace('Other:', '').trim();
    }
  };

  checkForOther(formData.groups, 'travelGroupOther');
  checkForOther(formData.interests, 'interestsOther');
  checkForOther(formData.experience, 'experienceOther');
  checkForOther(formData.vibes, 'vibesOther');

  return {
    hasAccommodations: inclusions.some((i) => i.toLowerCase().includes('accommodation')),
    hasDining: inclusions.some((i) => i.toLowerCase().includes('dining')),
    hasTransportation: inclusions.some(
      (i) => i.toLowerCase().includes('transportation') || i.toLowerCase().includes('rental')
    ),
    hasActivities: inclusions.some(
      (i) => i.toLowerCase().includes('activities') || i.toLowerCase().includes('tours')
    ),
    hasGuides: inclusions.some((i) => i.toLowerCase().includes('guide')),
    categories: {
      location: formData.tripDetails?.location || '',
      dates: `${formData.tripDetails?.departDate || ''} to ${
        formData.tripDetails?.returnDate || ''
      }`,
      travelers: {
        adults: adults,
        children: children,
        childrenAges: formData.tripDetails?.childrenAges || [],
        total: adults + children,
      },
      budget: {
        amount: budget,
        currency: currency,
        formatted: `${budget} ${currency}`,
      },
      travelGroup: formData.groups || [],
      travelGroupOther: otherInputs.travelGroupOther || '',
      interests: formData.interests || [],
      interestsOther: otherInputs.interestsOther || '',
      inclusions: inclusions,
      inclusionPreferences: formData.inclusionPreferences || {},
      experience: formData.experience || [],
      experienceOther: otherInputs.experienceOther || '',
      vibes: formData.vibes || [],
      vibesOther: otherInputs.vibesOther || '',
      sampleDays: formData.sampleDays || [],
      dinnerChoices: formData.dinnerChoices || [],
      contact: {
        name: formData.contact?.name || '',
        email: formData.contact?.email || '',
      },
      nickname: formData.nickname || '',
    },
  };
};

// Main orchestrator function with reordered workflow
export const generateMultiAgentItinerary = async (
  formData: TravelFormData,
  onAgentUpdate?: (logs: AgentLog[]) => void
): Promise<{ itinerary: string; logs: AgentLog[] }> => {
  const logs: AgentLog[] = [];

  try {
    console.log('🤖 Starting Multi-Agent Itinerary Generation...');

    // Agent 1: Gather and validate selections
    console.log('📊 Agent 1: Gathering user selections...');
    const selections = await gatherUserSelections(formData, logs);
    if (onAgentUpdate) onAgentUpdate([...logs]);
    console.log('✅ Selections gathered:', selections);

    // Agent 2: Gather real-time information (runs BEFORE planning)
    console.log('🌐 Agent 2: Gathering real-time information...');
    const realtimeInfo = await gatherRealtimeInformation(selections, logs);
    if (onAgentUpdate) onAgentUpdate([...logs]);
    console.log('✅ Real-time info gathered');

    // Agent 3: Plan itinerary structure using real-time info (runs AFTER information gathering)
    console.log('📝 Agent 3: Planning itinerary structure with real-time data...');
    const plan = await planItineraryStructure(selections, realtimeInfo, formData, logs);
    if (onAgentUpdate) onAgentUpdate([...logs]);
    console.log('✅ Data-driven plan created');

    // Agent 4: Compile final itinerary
    console.log('✨ Agent 4: Compiling final itinerary...');
    const finalItinerary = await compileItinerary(selections, plan, realtimeInfo, formData, logs);
    if (onAgentUpdate) onAgentUpdate([...logs]);
    console.log('✅ Itinerary compiled successfully');

    return { itinerary: finalItinerary, logs };
  } catch (error) {
    console.error('Error in multi-agent itinerary generation:', error);
    throw new Error('Failed to generate personalized itinerary. Pleasetry again.');
  }
};

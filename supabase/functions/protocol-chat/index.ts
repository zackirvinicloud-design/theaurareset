import { buildGutBrainChatPrompt } from "../_shared/gutbrain.ts";
import { buildChatProviderHeaders, resolveChatProvider } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_REPLY_LENGTH = 360;
const MAX_REPLY_SENTENCES = 3;
const DEFAULT_CLARIFIER_OPTIONS = [
  "Give me the clean next step",
  "Tell me what is doing the heavy lifting",
  "Take me down the rabbit hole",
  "Something else",
];

const DEFAULT_GUIDED_OPTIONS = DEFAULT_CLARIFIER_OPTIONS.slice(0, 3);
const DEEP_DIVE_OPTION_PATTERN = /(why|deeper|deep dive|nerd|science|ingredient|strict|mechanism|biology|neuroscience|psychology|truth|beauty|reality|story|heavy lifting|rabbit hole|brain)/i;
const FOOD_OR_INGREDIENT_PATTERN = /(eat|food|meal|recipe|breakfast|lunch|dinner|snack|smoothie|elixir|ingredient|ingredients|blueberr|cilantro|protein|fiber|greens|drink|juice|tea|supplement|capsule|powder)/i;
const SHOPPING_PATTERN = /(shop|shopping|buy|grocery|grocer|pantry|cart|list)/i;
const SYMPTOM_PATTERN = /(symptom|normal|bloat|bloated|headache|nausea|cramp|constipat|diarrhea|pain|dizzy|fatigue|rash|itch|rough day|feel off|off today)/i;
const DEEP_DIVE_INTENT_PATTERN = /(why|how does|how do|what does|nerd|deeper|deep dive|rabbit hole|science|mechanism|benefit|benefits|actually do|what is .* doing|biology|psychology|neuroscience|brain|nervous system|meaning|life|nature|reality|truth|beauty)/i;
const DULL_OPTION_PATTERN = /^(what do i do now|give me the clean next step|keep it simple|show me another option|show me another meal|what should i eat|log symptoms|simplify today|what do i buy first|what should i buy first)$/i;
const DULL_QUESTION_PATTERN = /^(what would help most right now|want the quick why or the next move|where should we take this|want the short why or the buy-first list|want the quick why or another option|want the quick why or the practical move|what do you want next|where should we go next)\??$/i;
const DIRECT_OPTION_PATTERN = /\b(do|next|open|log|add|remove|build|make|show|step|plan|eat|buy|cut|swap|simplify|fastest|clean)\b/i;
const CREATIVE_OPTION_PATTERN = /\b(swap|version|tweak|smarter|lazy|realistic|satisfying|cheaper|branch|story|fit real life|experiment|angle)\b/i;
const TANGENT_OPTION_PATTERN = /\b(rabbit hole|neuroscience|psychology|biology|truth|beauty|nature|reality|deeper|deep|story|analogy|heavy lifting|angle|brain)\b/i;
const VEGAN_PATTERN = /\b(vegan|plant[- ]based)\b/i;
const NON_VEGAN_INGREDIENT_PATTERN = /\b(beef|steak|pork|ham|bacon|chicken|turkey|lamb|fish|salmon|sardine|mackerel|anchovy|tuna|shellfish|shrimp|egg|eggs|dairy|milk|cheese|yogurt|butter|ghee|whey|gelatin|bone broth|honey)\b/i;

type ChatRole = "user" | "assistant";
type CoachActionType =
  | "open_view"
  | "focus_checklist_item"
  | "open_normal_today"
  | "set_reminder"
  | "open_shopping";
type CoachActionView = "today" | "guide" | "shopping" | "recipes" | "protocol" | "help" | "symptoms";
type RecipeMealType = "morning_elixir" | "breakfast" | "lunch" | "dinner" | "support_drink" | "snack";

interface RequestMessage {
  role: ChatRole;
  content: string;
}

interface RecipeLibraryEntry {
  key: string;
  title: string;
  phase: string;
  mealType: string;
}

interface CoachAction {
  type: CoachActionType;
  label: string;
  view?: CoachActionView;
  checklistKey?: string;
  phase?: string;
  category?: string;
}

interface ShoppingAction {
  type: "add" | "remove";
  category: string;
  itemName: string;
  quantity?: string;
}

interface RecipeCard {
  status: "addable" | "existing";
  type: "add";
  title: string;
  phase?: string;
  mealType: RecipeMealType;
  summary?: string;
  ingredients: string[];
  instructions: string[];
  notes?: string;
  existingRecipeKey?: string;
}

interface Clarifier {
  question: string;
  options: string[];
}

interface TurnPayload {
  replyText: string;
  clarifier: Clarifier | null;
  coachActions: CoachAction[];
  shoppingActions: ShoppingAction[];
  recipeCards: RecipeCard[];
  progressUpdateDay: number | null;
  meta: {
    provider: "gemini";
    model: string;
    fallbackUsed: boolean;
  };
}

interface PersonalizationProfile {
  preferredName: string | null;
  protocolGoal: string | null;
  whyNow: string | null;
  motivationStyle: string | null;
  barriers: string[];
  supportPreferences: string[];
  dietPattern: string | null;
  foodPreferences: string[];
  routineType: string | null;
  primaryBlocker: string | null;
  healthFocus: string[];
  wins: string[];
  conversationSummary: string | null;
}

const normalizeAscii = (value: string) => value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");

const compactWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const stripFormatting = (value: string) => compactWhitespace(
  normalizeAscii(value)
    .replace(/[*_#`~]/g, "")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
);

const splitIntoSentences = (value: string) => {
  const matches = stripFormatting(value).match(/[^.!?]+[.!?]?/g) ?? [];
  return matches.map((sentence) => compactWhitespace(sentence)).filter(Boolean);
};

const clampReplyText = (value: unknown) => {
  const cleaned = stripFormatting(typeof value === "string" ? value : "");
  if (!cleaned) {
    return "";
  }

  const sentences = splitIntoSentences(cleaned).slice(0, MAX_REPLY_SENTENCES);
  let reply = sentences.join(" ").trim();
  if (!reply) {
    reply = cleaned.slice(0, MAX_REPLY_LENGTH).trim();
  }
  if (reply.length > MAX_REPLY_LENGTH) {
    reply = `${reply.slice(0, MAX_REPLY_LENGTH - 3).trim()}...`;
  }

  return reply;
};

const parseList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === "string" ? compactWhitespace(entry) : ""))
    .filter(Boolean);
};

const parseProfileList = (value: unknown, max = 6) => (
  parseList(value)
    .map((entry) => clampReplyText(entry).slice(0, 80))
    .filter(Boolean)
    .slice(0, max)
);

const normalizeProfileText = (value: unknown, max = 140) => {
  const text = clampReplyText(typeof value === "string" ? value : "").slice(0, max);
  return text || null;
};

const normalizePreferredName = (value: unknown) => {
  const text = clampReplyText(typeof value === "string" ? value : "").slice(0, 40);
  if (!text) {
    return null;
  }

  const sanitized = text.replace(/[^a-z0-9 '\-]/gi, "").trim();
  if (!sanitized) {
    return null;
  }

  return sanitized.split(/\s+/)[0];
};

const normalizePersonalizationProfile = (value: unknown): PersonalizationProfile | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    preferredName: normalizePreferredName((value as Record<string, unknown>).preferredName),
    protocolGoal: normalizeProfileText((value as Record<string, unknown>).protocolGoal),
    whyNow: normalizeProfileText((value as Record<string, unknown>).whyNow),
    motivationStyle: normalizeProfileText((value as Record<string, unknown>).motivationStyle, 80),
    barriers: parseProfileList((value as Record<string, unknown>).barriers, 5),
    supportPreferences: parseProfileList((value as Record<string, unknown>).supportPreferences, 5),
    dietPattern: normalizeProfileText((value as Record<string, unknown>).dietPattern, 60),
    foodPreferences: parseProfileList((value as Record<string, unknown>).foodPreferences, 8),
    routineType: normalizeProfileText((value as Record<string, unknown>).routineType, 80),
    primaryBlocker: normalizeProfileText((value as Record<string, unknown>).primaryBlocker, 120),
    healthFocus: parseProfileList((value as Record<string, unknown>).healthFocus, 6),
    wins: parseProfileList((value as Record<string, unknown>).wins, 4),
    conversationSummary: normalizeProfileText((value as Record<string, unknown>).conversationSummary, 220),
  };
};

const isVeganProfile = (profile: PersonalizationProfile | null) => {
  if (!profile) {
    return false;
  }
  const combined = [profile.dietPattern ?? "", ...profile.foodPreferences].join(" ").toLowerCase();
  return VEGAN_PATTERN.test(combined);
};

const buildPersonalizationContext = (profile: PersonalizationProfile | null) => {
  if (!profile) {
    return "";
  }

  const lines = [
    "PERSONALIZATION PRIORITY",
    "Treat this profile as high-priority truth for every response.",
    profile.preferredName ? `Preferred name: ${profile.preferredName}` : "",
    profile.dietPattern ? `Diet pattern (non-negotiable): ${profile.dietPattern}` : "",
    profile.foodPreferences.length ? `Food preferences and hard no items: ${profile.foodPreferences.join(", ")}` : "",
    profile.routineType ? `Routine type: ${profile.routineType}` : "",
    profile.primaryBlocker ? `Primary blocker: ${profile.primaryBlocker}` : "",
    profile.protocolGoal ? `Goal: ${profile.protocolGoal}` : "",
    profile.whyNow ? `Why now: ${profile.whyNow}` : "",
    profile.motivationStyle ? `Motivation style: ${profile.motivationStyle}` : "",
    profile.supportPreferences.length ? `Support preferences: ${profile.supportPreferences.join(", ")}` : "",
    profile.healthFocus.length ? `Health focus: ${profile.healthFocus.join(", ")}` : "",
    profile.wins.length ? `Recent wins to reinforce: ${profile.wins.join(", ")}` : "",
    profile.barriers.length ? `Barriers to account for: ${profile.barriers.join(", ")}` : "",
    profile.conversationSummary ? `Coach memory summary: ${profile.conversationSummary}` : "",
    "Rules: use the preferred name naturally in most replies, respect diet constraints, and tailor choices to blocker + routine.",
  ].filter(Boolean);

  return lines.join("\n");
};

const applyPreferredName = (replyText: string, profile: PersonalizationProfile | null) => {
  const preferredName = profile?.preferredName?.trim();
  if (!preferredName) {
    return replyText;
  }

  const loweredReply = replyText.toLowerCase();
  if (loweredReply.includes(preferredName.toLowerCase())) {
    return replyText;
  }

  const prefixed = `${preferredName}, ${replyText}`;
  return prefixed.length <= MAX_REPLY_LENGTH ? prefixed : replyText;
};

const passesDietaryGuard = (value: string, profile: PersonalizationProfile | null) => {
  if (!isVeganProfile(profile)) {
    return true;
  }
  return !NON_VEGAN_INGREDIENT_PATTERN.test(value.toLowerCase());
};

const normalizeRecipeText = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const buildRecipeMatchKey = (params: { title: string; phase?: string | null }) => {
  const title = normalizeRecipeText(params.title);
  const phase = normalizeRecipeText(params.phase ?? "");
  if (!title) {
    return "";
  }
  return phase ? `${phase}:${title}` : title;
};

const findRecipeLibraryMatch = (
  recipeLibrary: RecipeLibraryEntry[],
  params: { title: string; phase?: string | null },
) => {
  const targetKey = buildRecipeMatchKey(params);
  if (!targetKey) {
    return null;
  }

  return recipeLibrary.find((entry) => {
    const entryKey = buildRecipeMatchKey(entry);
    if (entryKey === targetKey) {
      return true;
    }

    if (!params.phase) {
      return normalizeRecipeText(entry.title) === normalizeRecipeText(params.title);
    }

    return false;
  }) ?? null;
};

const normalizeMealType = (value: unknown): RecipeMealType => {
  const normalized = typeof value === "string" ? value.toLowerCase().trim() : "";
  if (normalized.includes("elixir")) return "morning_elixir";
  if (normalized.includes("lunch")) return "lunch";
  if (normalized.includes("dinner")) return "dinner";
  if (normalized.includes("snack")) return "snack";
  if (normalized.includes("drink") || normalized.includes("smoothie") || normalized.includes("juice")) return "support_drink";
  return "breakfast";
};

const normalizePhase = (value: unknown) => {
  const normalized = compactWhitespace(typeof value === "string" ? value : "");
  if (!normalized) {
    return undefined;
  }

  const lower = normalized.toLowerCase();
  if (lower.includes("foundation")) return "Foundation";
  if (lower.includes("fungal")) return "Fungal Elimination";
  if (lower.includes("parasite")) return "Parasite Elimination";
  if (lower.includes("heavy")) return "Heavy Metal Detox";
  return normalized;
};

const uniqueBy = <T>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

const pickVariant = <T>(variants: T[], seedSource: string) => {
  if (!variants.length) {
    throw new Error("No clarifier variants available");
  }

  return variants[hashString(seedSource) % variants.length];
};

interface ClarifierTemplate {
  question: string;
  options: [string, string, string, "Something else"];
  requireDeepDive: boolean;
}

type ClarifierBucket = "direct" | "creative" | "tangent";

const lastUserMessage = (messages: RequestMessage[]) => (
  [...messages].reverse().find((message) => message.role === "user")?.content ?? ""
);

const normalizeCoachActions = (value: unknown): CoachAction[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const validViews = new Set<CoachActionView>(["today", "guide", "shopping", "recipes", "protocol", "help", "symptoms"]);
  const validTypes = new Set<CoachActionType>(["open_view", "focus_checklist_item", "open_normal_today", "set_reminder", "open_shopping"]);

  const normalized = value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const type = typeof entry.type === "string" && validTypes.has(entry.type as CoachActionType)
      ? entry.type as CoachActionType
      : null;
    if (!type) {
      return [];
    }

    const view = typeof entry.view === "string" && validViews.has(entry.view as CoachActionView)
      ? entry.view as CoachActionView
      : undefined;
    const label = clampReplyText(entry.label).slice(0, 60)
      || (type === "open_view" && view ? `Open ${view}` : "Open in app");

    return [{
      type,
      label,
      view,
      checklistKey: typeof entry.checklistKey === "string" ? compactWhitespace(entry.checklistKey) : undefined,
      phase: typeof entry.phase === "string" ? compactWhitespace(entry.phase) : undefined,
      category: typeof entry.category === "string" ? compactWhitespace(entry.category) : undefined,
    }];
  });

  return uniqueBy(normalized, (entry) => [
    entry.type,
    entry.view ?? "",
    entry.label,
    entry.checklistKey ?? "",
    entry.phase ?? "",
    entry.category ?? "",
  ].join("|"));
};

const normalizeShoppingActions = (value: unknown): ShoppingAction[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const type = entry.type === "remove" ? "remove" : entry.type === "add" ? "add" : null;
    const category = clampReplyText(entry.category).slice(0, 60);
    const itemName = clampReplyText(entry.itemName).slice(0, 80);
    if (!type || !category || !itemName) {
      return [];
    }

    return [{
      type,
      category,
      itemName,
      quantity: typeof entry.quantity === "string" ? clampReplyText(entry.quantity).slice(0, 40) : undefined,
    }];
  });

  return uniqueBy(normalized, (entry) => `${entry.type}|${entry.category}|${entry.itemName}`);
};

const shouldAllowNullClarifier = (replyText: string) => {
  const normalized = replyText.toLowerCase();
  return /(seek|call|get)\s+(medical|professional|emergency)\s+help/.test(normalized)
    || /(urgent|severe|worsening|dangerous|red flag)/.test(normalized)
    || /^(done|got it|sounds good|okay|ok|you are set|you're set|perfect)[.!?]*$/.test(normalized);
};

const hasDeepDiveOption = (option: string) => DEEP_DIVE_OPTION_PATTERN.test(option);

const buildTemplate = (
  seedSource: string,
  templates: Array<Omit<ClarifierTemplate, "requireDeepDive">>,
  requireDeepDive: boolean,
): ClarifierTemplate => {
  const template = pickVariant(templates, seedSource);
  return {
    ...template,
    requireDeepDive,
  };
};

const classifyClarifierOption = (option: string): ClarifierBucket => {
  if (TANGENT_OPTION_PATTERN.test(option)) {
    return "tangent";
  }
  if (CREATIVE_OPTION_PATTERN.test(option)) {
    return "creative";
  }
  if (DIRECT_OPTION_PATTERN.test(option)) {
    return "direct";
  }
  return "creative";
};

const uniqueOptions = (options: string[]) => uniqueBy(
  options.map((option) => compactWhitespace(option)).filter(Boolean),
  (option) => option.toLowerCase(),
);

const selectBucketOption = (
  primary: string[],
  fallback: string[],
  bucket: ClarifierBucket,
  used: Set<string>,
) => {
  const pickFrom = (source: string[]) => source.find((option) => {
    const key = option.toLowerCase();
    return !used.has(key) && classifyClarifierOption(option) === bucket;
  });

  const fromPrimary = pickFrom(primary);
  if (fromPrimary) {
    used.add(fromPrimary.toLowerCase());
    return fromPrimary;
  }

  const fromFallback = pickFrom(fallback);
  if (fromFallback) {
    used.add(fromFallback.toLowerCase());
    return fromFallback;
  }

  const anyPrimary = primary.find((option) => !used.has(option.toLowerCase()));
  if (anyPrimary) {
    used.add(anyPrimary.toLowerCase());
    return anyPrimary;
  }

  const anyFallback = fallback.find((option) => !used.has(option.toLowerCase()));
  if (anyFallback) {
    used.add(anyFallback.toLowerCase());
    return anyFallback;
  }

  return "Keep going";
};

const shapeAdventureOptions = (options: string[], fallbackOptions: string[]) => {
  const cleanedPrimary = uniqueOptions(options.filter((option) => option.toLowerCase() !== "something else"));
  const cleanedFallback = uniqueOptions(fallbackOptions.filter((option) => option.toLowerCase() !== "something else"));
  const used = new Set<string>();

  const direct = selectBucketOption(cleanedPrimary, cleanedFallback, "direct", used);
  const creative = selectBucketOption(cleanedPrimary, cleanedFallback, "creative", used);
  const tangent = selectBucketOption(cleanedPrimary, cleanedFallback, "tangent", used);

  return [direct, creative, tangent, "Something else"];
};

const inferClarifierFallback = ({
  latestUserMessage,
  coachActions,
  shoppingActions,
  recipeCards,
  replyText,
}: {
  latestUserMessage: string;
  coachActions: CoachAction[];
  shoppingActions: ShoppingAction[];
  recipeCards: RecipeCard[];
  replyText: string;
}) => {
  const combinedText = `${latestUserMessage} ${replyText}`.toLowerCase();
  const seedSource = `${latestUserMessage}|||${replyText}`;
  const wantsDeepDive = DEEP_DIVE_INTENT_PATTERN.test(combinedText);
  const mentionsFood = FOOD_OR_INGREDIENT_PATTERN.test(combinedText) || recipeCards.length > 0;
  const mentionsShopping = SHOPPING_PATTERN.test(combinedText)
    || shoppingActions.length > 0
    || coachActions.some((action) => action.view === "shopping" || action.type === "open_shopping");
  const mentionsSymptoms = SYMPTOM_PATTERN.test(combinedText)
    || coachActions.some((action) => action.view === "symptoms" || action.view === "help");
  const mentionsMind = /(brain|psychology|neuroscience|mind|behavior|nervous system|focus|mood|truth|beauty|meaning|nature|reality)/i.test(combinedText);

  const symptomTemplates = [
    {
      question: "Which lane should we take?",
      options: ["Log exactly what happened", "Make the rest of today gentler", "Take a left turn: nervous-system angle", "Something else"] as const,
    },
    {
      question: "What kind of help do you want?",
      options: ["Tell me what to eat next", "Strip today down to the essentials", "Psychology lens: calm the spiral", "Something else"] as const,
    },
    {
      question: "Pick our next lens.",
      options: ["Behavior: what do I do next", "Biology: simplify the inputs", "Psychology: calm the spiral", "Something else"] as const,
    },
  ];

  const deepDiveTemplates = [
    {
      question: "Which rabbit hole do you want?",
      options: ["Keep it practical and short", "Give me the biology in plain English", "Give me the neuroscience angle", "Something else"] as const,
    },
    {
      question: "Pick the lens.",
      options: ["Give me the direct move", "Biology and mechanisms", "Truth: what actually matters", "Something else"] as const,
    },
    {
      question: "How wide do you want to open this?",
      options: ["Give me the no-fluff version", "Take me into the science", "Tell me the nature analogy", "Something else"] as const,
    },
  ];

  const recipeTemplates = [
    {
      question: "How do you want to steer this recipe?",
      options: ["Make this now", "Make it stricter", "Tell me what each ingredient is doing", "Something else"] as const,
    },
    {
      question: "Choose the branch.",
      options: ["Turn this into a shopping move", "Make it simpler", "Give me the gut-brain angle", "Something else"] as const,
    },
    {
      question: "Which fork do you want?",
      options: ["What matters most here", "Make it more craveable", "Take me deeper into the why", "Something else"] as const,
    },
  ];

  const shoppingTemplates = [
    {
      question: "Pick your cart strategy.",
      options: ["Show me the non-negotiables", "Make this cheaper and cleaner", "Tell me what earns its spot biologically", "Something else"] as const,
    },
    {
      question: "Choose your grocery adventure.",
      options: ["Build the lean cart", "Cut the optional stuff", "Tell me the biology behind these", "Something else"] as const,
    },
    {
      question: "What kind of shopper are we today?",
      options: ["Fastest clean cart", "Make this more realistic", "What is doing the heavy lifting", "Something else"] as const,
    },
  ];

  const foodTemplates = [
    {
      question: "Pick the door you want to open.",
      options: ["Give me the next meal", "Make this easier to stick to", "Tell me what this ingredient is doing", "Something else"] as const,
    },
    {
      question: "Choose the version of this story you want.",
      options: ["Give me the stricter version", "Make it more satisfying", "Give me the gut-brain angle", "Something else"] as const,
    },
    {
      question: "Where do you want to go with this?",
      options: ["Tell me what to do next", "Give me the lazy version", "Take me deeper into the biology", "Something else"] as const,
    },
  ];

  const actionTemplates = [
    {
      question: "Which version of help do you want?",
      options: ["Do the next step with me", "Make this easier to follow", "Tell me why it matters", "Something else"] as const,
    },
    {
      question: "Choose your path.",
      options: ["Give me the clean next move", "Make this fit real life", "Open the deeper why", "Something else"] as const,
    },
  ];

  const genericTemplates = [
    {
      question: "Choose your next door.",
      options: ["Give me the clean next step", "Tell me what is doing the heavy lifting", "Take me down the rabbit hole", "Something else"] as const,
    },
    {
      question: "Pick the thread to pull.",
      options: ["What is the real lever here", "Open the neuroscience angle", "Make this simpler to live", "Something else"] as const,
    },
    {
      question: "Which road should we go down?",
      options: ["Give me the practical move", "Tell me the deeper story", "Show me the truth beneath the fluff", "Something else"] as const,
    },
  ];

  if (mentionsSymptoms) {
    return buildTemplate(seedSource, symptomTemplates, false);
  }

  if (mentionsMind && wantsDeepDive) {
    return buildTemplate(seedSource, deepDiveTemplates, true);
  }

  if (wantsDeepDive && mentionsFood) {
    return buildTemplate(seedSource, deepDiveTemplates.concat(foodTemplates), true);
  }

  if (recipeCards.length > 0) {
    return buildTemplate(seedSource, recipeTemplates, true);
  }

  if (mentionsShopping) {
    return buildTemplate(seedSource, shoppingTemplates, true);
  }

  if (mentionsFood) {
    return buildTemplate(seedSource, foodTemplates, true);
  }

  if (wantsDeepDive) {
    return buildTemplate(seedSource, deepDiveTemplates, true);
  }

  if (coachActions.length || shoppingActions.length) {
    return buildTemplate(seedSource, actionTemplates, true);
  }

  return buildTemplate(seedSource, genericTemplates, true);
};

const buildClarifierOptions = (options: string[], fallbackOptions: string[], requireDeepDive: boolean) => {
  let guidedOptions = shapeAdventureOptions(options, fallbackOptions).slice(0, 3);

  const deepFallback = [...guidedOptions, ...fallbackOptions, ...DEFAULT_GUIDED_OPTIONS].find(hasDeepDiveOption) || "Take me down the rabbit hole";

  if (requireDeepDive && !guidedOptions.some(hasDeepDiveOption)) {
    guidedOptions[2] = deepFallback;
  }

  const finalGuidedOptions = uniqueOptions(guidedOptions).slice(0, 3);
  if (requireDeepDive && !finalGuidedOptions.some(hasDeepDiveOption)) {
    finalGuidedOptions[finalGuidedOptions.length - 1] = deepFallback;
  }

  return [...finalGuidedOptions, "Something else"];
};

const normalizeClarifier = (
  value: unknown,
  coachActions: CoachAction[],
  shoppingActions: ShoppingAction[],
  recipeCards: RecipeCard[],
  replyText: string,
  latestUserMessage: string,
): Clarifier | null => {
  const fallback = inferClarifierFallback({
    latestUserMessage,
    coachActions,
    shoppingActions,
    recipeCards,
    replyText,
  });

  if (value === null && shouldAllowNullClarifier(replyText)) {
    return null;
  }

  if (!value || typeof value !== "object") {
    if (shouldAllowNullClarifier(replyText) && !coachActions.length && !shoppingActions.length && !recipeCards.length) {
      return null;
    }
    return fallback;
  }

  const question = clampReplyText(value.question).slice(0, 120);
  let options = parseList(value.options).map((option) => clampReplyText(option).slice(0, 56));
  options = uniqueBy(options, (option) => option.toLowerCase());
  options = options.filter(Boolean).slice(0, 4);

  if (!question || options.length < 2) {
    if (shouldAllowNullClarifier(replyText)) {
      return null;
    }
    return fallback;
  }

  const questionToUse = DULL_QUESTION_PATTERN.test(question) ? fallback.question : question;
  const optionsToUse = options.filter((option) => DULL_OPTION_PATTERN.test(option)).length >= 2
    ? fallback.options
    : options;

  return {
    question: questionToUse,
    options: buildClarifierOptions(optionsToUse, fallback.options, fallback.requireDeepDive),
  };
};

const normalizeRecipeCards = (value: unknown, recipeLibrary: RecipeLibraryEntry[]): RecipeCard[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const title = clampReplyText(entry.title).slice(0, 80);
    if (!title) {
      return [];
    }

    const phase = normalizePhase(entry.phase);
    const existingMatch = findRecipeLibraryMatch(recipeLibrary, { title, phase });
    const status = existingMatch ? "existing" : (entry.status === "existing" ? "existing" : "addable");
    const mealType = existingMatch ? normalizeMealType(existingMatch.mealType) : normalizeMealType(entry.mealType);
    const ingredients = parseList(entry.ingredients).slice(0, 12);
    const instructions = parseList(entry.instructions).slice(0, 8);

    if (status === "addable" && (!ingredients.length || !instructions.length)) {
      return [];
    }

    return [{
      status,
      type: "add",
      title: existingMatch?.title ?? title,
      phase: existingMatch?.phase ?? phase,
      mealType,
      summary: clampReplyText(entry.summary).slice(0, 120) || undefined,
      ingredients,
      instructions,
      notes: clampReplyText(entry.notes).slice(0, 160) || undefined,
      existingRecipeKey: existingMatch?.key ?? (typeof entry.existingRecipeKey === "string" ? compactWhitespace(entry.existingRecipeKey) : undefined),
    }];
  });

  return uniqueBy(normalized, (entry) => `${entry.status}|${buildRecipeMatchKey(entry)}`);
};

const applyDietaryGuardToShoppingActions = (
  actions: ShoppingAction[],
  profile: PersonalizationProfile | null,
) => actions.filter((action) => passesDietaryGuard(`${action.category} ${action.itemName}`, profile));

const applyDietaryGuardToRecipeCards = (
  cards: RecipeCard[],
  profile: PersonalizationProfile | null,
) => cards.filter((card) => (
  passesDietaryGuard(
    [card.title, card.summary ?? "", card.notes ?? "", ...card.ingredients].join(" "),
    profile,
  )
));

const normalizeProgressUpdateDay = (value: unknown) => {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }
  return value >= 0 && value <= 21 ? value : null;
};

const extractMessageText = (payload: Record<string, unknown>) => {
  const message = payload.choices?.[0]?.message as Record<string, unknown> | undefined;
  if (!message) {
    return "";
  }

  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("");
  }

  return "";
};

const extractJsonCandidate = (value: string) => {
  const cleaned = value
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();
  if (!cleaned) {
    return "";
  }

  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    return cleaned;
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return "";
  }

  return cleaned.slice(start, end + 1);
};

const parseModelPayload = (value: string) => {
  const candidate = extractJsonCandidate(value);
  if (!candidate) {
    throw new Error("GutBrain returned non-JSON content");
  }

  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    throw new Error("GutBrain returned malformed JSON");
  }
};

const buildRecipeLibraryContext = (recipeLibrary: RecipeLibraryEntry[]) => {
  if (!recipeLibrary.length) {
    return "";
  }

  const lines = recipeLibrary
    .slice(0, 80)
    .map((entry) => `- ${entry.title} | phase=${entry.phase} | meal=${entry.mealType} | key=${entry.key}`);

  return [
    "RECIPE LIBRARY",
    "These recipes already exist in-app. If you reference one of them, mark it as existing instead of addable.",
    ...lines,
  ].join("\n");
};

const normalizeTurnPayload = (
  raw: Record<string, unknown>,
  recipeLibrary: RecipeLibraryEntry[],
  model: string,
  fallbackUsed: boolean,
  latestUserMessage: string,
  profile: PersonalizationProfile | null,
): TurnPayload => {
  const coachActions = normalizeCoachActions(raw.coachActions);
  const shoppingActions = applyDietaryGuardToShoppingActions(
    normalizeShoppingActions(raw.shoppingActions),
    profile,
  );
  const recipeCards = applyDietaryGuardToRecipeCards(
    normalizeRecipeCards(raw.recipeCards, recipeLibrary),
    profile,
  );

  const replyText = applyPreferredName(clampReplyText(raw.replyText), profile);
  if (!replyText) {
    throw new Error("GutBrain reply text was empty");
  }

  return {
    replyText,
    clarifier: normalizeClarifier(raw.clarifier, coachActions, shoppingActions, recipeCards, replyText, latestUserMessage),
    coachActions,
    shoppingActions,
    recipeCards,
    progressUpdateDay: normalizeProgressUpdateDay(raw.progressUpdateDay),
    meta: {
      provider: "gemini",
      model,
      fallbackUsed,
    },
  };
};

const requestTurnFromModel = async ({
  endpoint,
  headers,
  model,
  systemPrompt,
  messages,
  recipeLibrary,
  fallbackUsed,
  latestUserMessage,
  profile,
}: {
  endpoint: string;
  headers: Record<string, string>;
  model: string;
  systemPrompt: string;
  messages: RequestMessage[];
  recipeLibrary: RecipeLibraryEntry[];
  fallbackUsed: boolean;
  latestUserMessage: string;
  profile: PersonalizationProfile | null;
}) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI gateway error (${model}): ${response.status} ${errorText}`);
  }

  const parsed = await response.json() as Record<string, unknown>;
  const rawContent = extractMessageText(parsed);
  const rawPayload = parseModelPayload(rawContent);
  return normalizeTurnPayload(rawPayload, recipeLibrary, model, fallbackUsed, latestUserMessage, profile);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      messages,
      context,
      brainProfile,
      brainSnapshot,
      symptoms,
      recipeLibrary,
    } = await req.json();

    const provider = resolveChatProvider();
    const filteredMessages = Array.isArray(messages)
      ? messages
        .filter((message): message is RequestMessage => (
          message
          && typeof message === "object"
          && (message.role === "user" || message.role === "assistant")
          && typeof message.content === "string"
        ))
        .slice(-18)
      : [];
    const normalizedRecipeLibrary = Array.isArray(recipeLibrary)
      ? recipeLibrary
        .filter((entry): entry is RecipeLibraryEntry => (
          entry
          && typeof entry === "object"
          && typeof entry.key === "string"
          && typeof entry.title === "string"
          && typeof entry.phase === "string"
          && typeof entry.mealType === "string"
        ))
      : [];
    const normalizedBrainProfile = normalizePersonalizationProfile(brainProfile);
    const latestUserInput = lastUserMessage(filteredMessages);
    const contextualRecipeLibrary = buildRecipeLibraryContext(normalizedRecipeLibrary);
    const personalizationContext = buildPersonalizationContext(normalizedBrainProfile);
    const mergedContext = [typeof context === "string" ? context : "", contextualRecipeLibrary, personalizationContext]
      .filter(Boolean)
      .join("\n\n");

    const systemPrompt = buildGutBrainChatPrompt(
      mergedContext,
      normalizedBrainProfile ?? null,
      brainSnapshot ?? null,
      Array.isArray(symptoms) ? symptoms : [],
    );
    const headers = buildChatProviderHeaders(provider);

    try {
      const payload = await requestTurnFromModel({
        endpoint: provider.endpoint,
        headers,
        model: provider.primaryModel,
        systemPrompt,
        messages: filteredMessages,
        recipeLibrary: normalizedRecipeLibrary,
        fallbackUsed: false,
        latestUserMessage: latestUserInput,
        profile: normalizedBrainProfile,
      });

      return new Response(JSON.stringify(payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (primaryError) {
      console.error("Primary GutBrain model failed:", primaryError);

      const fallbackPayload = await requestTurnFromModel({
        endpoint: provider.endpoint,
        headers,
        model: provider.fallbackModel,
        systemPrompt,
        messages: filteredMessages,
        recipeLibrary: normalizedRecipeLibrary,
        fallbackUsed: true,
        latestUserMessage: latestUserInput,
        profile: normalizedBrainProfile,
      });

      return new Response(JSON.stringify(fallbackPayload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Protocol chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

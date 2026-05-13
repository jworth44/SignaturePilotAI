const TONE_MAP = {
  Professional: {
    titlePrefix: "Strategic",
    cta: "Schedule a short introduction call",
    disclaimer: "This message may contain confidential business information.",
    colorDirection: "Electric blue with clean charcoal contrast",
    layout: "executive"
  },
  Friendly: {
    titlePrefix: "Friendly",
    cta: "Say hello and book a quick chat",
    disclaimer: "Replies are welcome and usually answered within one business day.",
    colorDirection: "Soft blue with approachable lavender accents",
    layout: "minimal"
  },
  Premium: {
    titlePrefix: "Executive",
    cta: "Book a premium consultation",
    disclaimer: "Confidentiality applies to all project discussions and estimates.",
    colorDirection: "Deep charcoal with electric blue and soft purple accents",
    layout: "corporate"
  },
  Contractor: {
    titlePrefix: "Licensed",
    cta: "Request a quote for your next project",
    disclaimer: "Quotes and timelines are confirmed after scope review.",
    colorDirection: "Bold blue with grounded charcoal utility tones",
    layout: "contractor"
  },
  Minimal: {
    titlePrefix: "Clear",
    cta: "Visit the site for details",
    disclaimer: "Please keep this email for your records.",
    colorDirection: "Light neutral base with restrained blue highlights",
    layout: "minimal"
  }
};

const GOAL_SUFFIX_MAP = {
  "Book calls": "for calls",
  "Get quotes": "for project quotes",
  "Show credibility": "for trusted communication",
  "Drive website visits": "for site traffic"
};

const INDUSTRY_MAP = {
  "Contractor / Trades": {
    noun: "Project Lead",
    cta: "Request a site visit",
    disclaimer: "Quotes and project timelines are confirmed after scope review.",
    layout: "contractor"
  },
  "Safety Consulting": {
    noun: "Safety Consultant",
    cta: "Book a compliance review",
    disclaimer: "Safety recommendations are tailored after a documented assessment.",
    layout: "executive"
  },
  "Real Estate": {
    noun: "Real Estate Advisor",
    cta: "Book a property consult",
    disclaimer: "Availability, pricing, and disclosures are confirmed before listing or purchase.",
    layout: "corporate"
  },
  "Law / Legal": {
    noun: "Legal Counsel",
    cta: "Schedule a confidential consult",
    disclaimer: "This email does not create a solicitor-client relationship until confirmed in writing.",
    layout: "executive"
  },
  "Finance / Insurance": {
    noun: "Financial Advisor",
    cta: "Review your options",
    disclaimer: "Coverage and financial guidance are subject to suitability and policy review.",
    layout: "corporate"
  },
  "Medical / Health": {
    noun: "Care Specialist",
    cta: "Book a consultation",
    disclaimer: "Medical guidance is confirmed after individual assessment and intake.",
    layout: "executive"
  },
  "Fitness / Coaching": {
    noun: "Performance Coach",
    cta: "Start your plan",
    disclaimer: "Training recommendations are adjusted to goals, readiness, and health history.",
    layout: "minimal"
  },
  "Tech / SaaS": {
    noun: "Product Advisor",
    cta: "See the platform in action",
    disclaimer: "Roadmap and pricing details are shared during live demos and onboarding.",
    layout: "minimal"
  },
  "Retail / Ecommerce": {
    noun: "Brand Manager",
    cta: "Browse featured collections",
    disclaimer: "Availability, fulfillment, and pricing are subject to active inventory.",
    layout: "minimal"
  },
  "Creative / Design": {
    noun: "Creative Director",
    cta: "View the portfolio",
    disclaimer: "Project timelines and licensing are finalized in the approved scope.",
    layout: "minimal"
  },
  "General Professional": {
    noun: "Business Advisor",
    cta: "Schedule an introduction",
    disclaimer: "Replies are monitored during regular business hours.",
    layout: "executive"
  }
};

export async function buildSignatureSuggestions(input) {
  const normalized = normalizeInput(input);
  if (process.env.OPENAI_API_KEY) {
    try {
      const aiPayload = await requestOpenAiSuggestions(normalized);
      if (aiPayload) {
        return {
          ...aiPayload,
          suggestedLayoutValue: normalizeSignatureLayoutValue(aiPayload.suggestedLayoutValue || aiPayload.suggestedLayout),
          source: "openai",
          message: "Generated with OpenAI."
        };
      }
    } catch {
      return {
        ...buildFallbackSuggestions(normalized),
        source: "fallback",
        message: "OpenAI is unavailable right now. Using built-in suggestions instead."
      };
    }
  }

  return {
    ...buildFallbackSuggestions(normalized),
    source: "fallback",
    message: "OpenAI is not configured. Using built-in suggestions instead."
  };
}

export function normalizeSignatureLayoutValue(value) {
  const normalized = String(value || "").toLowerCase().trim();
  if (["executive", "minimal", "contractor", "corporate", "mobile-compact"].includes(normalized)) {
    return normalized;
  }
  if (normalized.includes("premium") || normalized.includes("corporate")) {
    return "corporate";
  }
  if (normalized.includes("modern") || normalized.includes("minimal")) {
    return "minimal";
  }
  if (normalized.includes("contractor")) {
    return "contractor";
  }
  if (normalized.includes("mobile")) {
    return "mobile-compact";
  }
  return "executive";
}

function buildFallbackSuggestions(input) {
  const tonePreset = TONE_MAP[input.tone] || TONE_MAP.Professional;
  const industryPreset = INDUSTRY_MAP[input.businessType] || INDUSTRY_MAP["General Professional"];
  const company = input.companyName || input.businessType || "Your Company";
  const person = input.fullName || "Your Name";
  const goalSuffix = GOAL_SUFFIX_MAP[input.goal] || "for professional outreach";
  const compactIndustry = input.businessType === "Custom" ? "Business" : input.businessType;

  return {
    suggestedTitleLine: `${tonePreset.titlePrefix} ${industryPreset.noun} | ${company}`,
    suggestedCta: `${industryPreset.cta || tonePreset.cta} ${goalSuffix}.`,
    suggestedDisclaimer: industryPreset.disclaimer || tonePreset.disclaimer,
    suggestedColorDirection: `${tonePreset.colorDirection} for ${compactIndustry}.`,
    suggestedLayout: readableLayoutName(industryPreset.layout || tonePreset.layout),
    suggestedLayoutValue: industryPreset.layout || tonePreset.layout,
    promptEcho: `${person} | ${input.businessType} | ${input.tone} | ${input.goal}`
  };
}

async function requestOpenAiSuggestions(input) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SIGNATURE_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate concise JSON for email signature suggestions. Return keys: suggestedTitleLine, suggestedCta, suggestedDisclaimer, suggestedColorDirection, suggestedLayout, suggestedLayoutValue."
        },
        {
          role: "user",
          content: `Business type: ${input.businessType}\nTone: ${input.tone}\nGoal: ${input.goal}\nCompany: ${input.companyName}\nPerson: ${input.fullName}`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed.");
  }

  const payload = await response.json();
  const rawContent = payload?.choices?.[0]?.message?.content;
  if (!rawContent) {
    return null;
  }

  return JSON.parse(rawContent);
}

function normalizeInput(input) {
  return {
    businessType: String(input.businessType || "Professional services").trim(),
    tone: String(input.tone || "Professional").trim(),
    goal: String(input.goal || "Show credibility").trim(),
    companyName: String(input.companyName || "").trim(),
    fullName: String(input.fullName || "").trim()
  };
}

function readableLayoutName(value) {
  const normalized = normalizeSignatureLayoutValue(value);
  switch (normalized) {
    case "minimal":
      return "Minimal";
    case "contractor":
      return "Contractor";
    case "corporate":
      return "Corporate";
    case "mobile-compact":
      return "Mobile Compact";
    default:
      return "Executive";
  }
}

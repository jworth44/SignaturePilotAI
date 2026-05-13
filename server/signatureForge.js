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

const LOGO_STYLE_PALETTES = {
  Modern: ["circle", "monogram", "square", "wordmark"],
  Luxury: ["crest", "ring", "monogram", "shield"],
  Minimal: ["monogram", "bar", "circle", "wordmark"],
  Corporate: ["shield", "stack", "square", "wordmark"],
  Contractor: ["badge", "shield", "diamond", "wordmark"],
  Tech: ["hex", "monogram", "orbit", "wordmark"],
  Bold: ["square", "diamond", "crest", "wordmark"]
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

export async function buildLogoStudioConcepts(input) {
  const normalized = normalizeLogoInput(input);
  if (process.env.OPENAI_API_KEY) {
    try {
      const concepts = await requestOpenAiLogoConcepts(normalized);
      if (concepts.length) {
        return {
          concepts,
          source: "openai",
          message: buildLogoStudioMessage(normalized.action, "Generated with OpenAI.")
        };
      }
    } catch {
      return {
        concepts: buildFallbackLogoConcepts(normalized),
        source: "fallback",
        message: buildLogoStudioMessage(normalized.action, "Generated demo logo concepts locally.")
      };
    }
  }

  return {
    concepts: buildFallbackLogoConcepts(normalized),
    source: "fallback",
    message: buildLogoStudioMessage(normalized.action, "Generated demo logo concepts locally.")
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

function normalizeLogoInput(input) {
  return {
    action: String(input.action || "generate").trim().toLowerCase(),
    businessName: String(input.businessName || "Signature Pilot AI").trim(),
    industry: String(input.industry || "Professional services").trim(),
    style: String(input.style || "Modern").trim(),
    primaryColor: normalizeHexColor(input.primaryColor || "#2663ff"),
    secondaryColor: normalizeHexColor(input.secondaryColor || "#8b6dff"),
    instructions: String(input.instructions || "").trim(),
    references: Array.isArray(input.references) ? input.references.filter(Boolean).slice(0, 3) : [],
    selectedLogo: String(input.selectedLogo || "").trim()
  };
}

function normalizeHexColor(value) {
  const normalized = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : "#2663ff";
}

function buildFallbackLogoConcepts(input) {
  const variants = LOGO_STYLE_PALETTES[input.style] || LOGO_STYLE_PALETTES.Modern;
  return variants.slice(0, 4).map((variant, index) => {
    const svg = buildLogoSvg({
      businessName: input.businessName,
      industry: input.industry,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      variant,
      index,
      action: input.action
    });

    return {
      id: `${input.action}-${variant}-${index}`,
      label: `${readableVariantName(variant)} ${index + 1}`,
      description: buildVariantDescription(input, variant, index),
      dataUrl: svgToDataUrl(svg)
    };
  });
}

async function requestOpenAiLogoConcepts(input) {
  const promptBase = buildOpenAiLogoPrompt(input);
  const concepts = [];

  for (let index = 0; index < 4; index += 1) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_LOGO_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `${promptBase}\nVariation ${index + 1}: ${variationPrompt(index)}.`
              },
              ...input.references.map((image) => ({
                type: "input_image",
                image_url: image
              })),
              ...(input.selectedLogo
                ? [
                    {
                      type: "input_image",
                      image_url: input.selectedLogo
                    }
                  ]
                : [])
            ]
          }
        ],
        tools: [
          {
            type: "image_generation",
            size: "1024x1024",
            quality: "medium",
            background: "transparent",
            action: input.action === "refine" || input.references.length ? "auto" : "generate"
          }
        ],
        tool_choice: { type: "image_generation" }
      })
    });

    if (!response.ok) {
      throw new Error("OpenAI logo studio request failed.");
    }

    const payload = await response.json();
    const imageCall = Array.isArray(payload.output)
      ? payload.output.find((entry) => entry.type === "image_generation_call" && entry.result)
      : null;

    if (!imageCall?.result) {
      continue;
    }

    concepts.push({
      id: `openai-${index + 1}`,
      label: `AI concept ${index + 1}`,
      description: imageCall.revised_prompt || buildVariantDescription(input, "wordmark", index),
      dataUrl: `data:image/png;base64,${imageCall.result}`
    });
  }

  return concepts;
}

function buildOpenAiLogoPrompt(input) {
  const base = [
    `Create a polished email-signature-ready logo concept for ${input.businessName}.`,
    `Industry: ${input.industry}.`,
    `Style: ${input.style}.`,
    `Primary colour: ${input.primaryColor}.`,
    `Secondary colour: ${input.secondaryColor}.`,
    "Keep the mark clean, premium, readable at small sizes, and suitable for Gmail and Outlook signatures."
  ];

  if (input.instructions) {
    base.push(`Instructions: ${input.instructions}.`);
  }

  if (input.action === "blend") {
    base.push("Blend the uploaded references into a single cohesive logo concept.");
  }

  if (input.action === "refine") {
    base.push("Refine the selected logo while preserving the strongest recognizable features.");
  }

  return base.join(" ");
}

function buildLogoStudioMessage(action, fallback) {
  switch (action) {
    case "blend":
      return "Uploaded references blended into fresh logo concepts.";
    case "refine":
      return "Selected logo refined into new concept variations.";
    default:
      return fallback;
  }
}

function buildVariantDescription(input, variant, index) {
  const readable = readableVariantName(variant);
  if (input.action === "blend") {
    return `${readable} concept blending uploaded references with a ${input.style.toLowerCase()} direction.`;
  }
  if (input.action === "refine") {
    return `${readable} refinement built from the selected logo and your instructions.`;
  }
  return `${readable} concept for ${input.businessName} in a ${input.style.toLowerCase()} style.`;
}

function readableVariantName(variant) {
  return String(variant)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function variationPrompt(index) {
  return [
    "Use a balanced monogram-first direction",
    "Lean into a premium badge composition",
    "Focus on a cleaner geometric silhouette",
    "Present a stronger wordmark-led lockup"
  ][index] || "Present a clean premium variation";
}

function buildLogoSvg({ businessName, industry, primaryColor, secondaryColor, variant, index, action }) {
  const initials = businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "SP";
  const wordmark = escapeXml(businessName);
  const industryLabel = escapeXml(action === "blend" ? "Blended concept" : action === "refine" ? "Refined concept" : industry);
  const mark = buildVariantMark(variant, primaryColor, secondaryColor, initials, index);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420" role="img" aria-label="${wordmark}">
  <rect width="640" height="420" rx="36" fill="#f8fbff"/>
  <rect x="38" y="38" width="564" height="344" rx="28" fill="#ffffff"/>
  ${mark}
  <text x="320" y="300" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="700" fill="#111827">${wordmark}</text>
  <text x="320" y="334" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="18" fill="#475569">${industryLabel}</text>
  <text x="320" y="362" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="16" fill="${primaryColor}">${escapeXml(readableVariantName(variant))}</text>
</svg>`.trim();
}

function buildVariantMark(variant, primaryColor, secondaryColor, initials, index) {
  const shadow = `<ellipse cx="320" cy="148" rx="90" ry="18" fill="rgba(15,23,42,0.07)"/>`;

  switch (variant) {
    case "crest":
      return `${shadow}<rect x="252" y="66" width="136" height="136" rx="34" fill="${primaryColor}"/><path d="M320 86 C345 106 366 106 382 98 V160 C382 186 360 208 320 226 C280 208 258 186 258 160 V98 C274 106 295 106 320 86Z" fill="${secondaryColor}"/><text x="320" y="164" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="46" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "shield":
      return `${shadow}<path d="M320 64 L398 94 V148 C398 198 362 229 320 246 C278 229 242 198 242 148 V94 Z" fill="${primaryColor}"/><path d="M320 88 L376 110 V146 C376 182 351 205 320 219 C289 205 264 182 264 146 V110 Z" fill="${secondaryColor}"/><text x="320" y="164" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="44" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "badge":
      return `${shadow}<circle cx="320" cy="132" r="74" fill="${primaryColor}"/><circle cx="320" cy="132" r="54" fill="${secondaryColor}"/><text x="320" y="146" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "diamond":
      return `${shadow}<path d="M320 52 L398 130 L320 208 L242 130 Z" fill="${primaryColor}"/><path d="M320 84 L366 130 L320 176 L274 130 Z" fill="${secondaryColor}"/><text x="320" y="144" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "hex":
      return `${shadow}<path d="M282 62 H358 L396 128 L358 194 H282 L244 128 Z" fill="${primaryColor}"/><path d="M296 84 H344 L370 128 L344 172 H296 L270 128 Z" fill="${secondaryColor}"/><text x="320" y="145" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "orbit":
      return `${shadow}<circle cx="320" cy="132" r="60" fill="${primaryColor}"/><ellipse cx="320" cy="132" rx="86" ry="38" fill="none" stroke="${secondaryColor}" stroke-width="12"/><text x="320" y="146" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "square":
      return `${shadow}<rect x="250" y="62" width="140" height="140" rx="${18 + index * 4}" fill="${primaryColor}"/><rect x="274" y="86" width="92" height="92" rx="18" fill="${secondaryColor}"/><text x="320" y="145" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "stack":
      return `${shadow}<rect x="242" y="68" width="156" height="44" rx="18" fill="${primaryColor}"/><rect x="260" y="118" width="120" height="34" rx="16" fill="${secondaryColor}"/><rect x="276" y="158" width="88" height="28" rx="14" fill="${primaryColor}"/><text x="320" y="142" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "bar":
      return `${shadow}<rect x="228" y="98" width="184" height="74" rx="26" fill="${primaryColor}"/><rect x="228" y="176" width="120" height="12" rx="6" fill="${secondaryColor}"/><text x="320" y="145" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
    case "wordmark":
      return `${shadow}<rect x="234" y="88" width="172" height="92" rx="28" fill="${primaryColor}"/><circle cx="272" cy="134" r="22" fill="${secondaryColor}"/><path d="M324 110 H378" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/><path d="M324 138 H390" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/><path d="M324 166 H364" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>`;
    case "circle":
    case "monogram":
    default:
      return `${shadow}<circle cx="320" cy="132" r="72" fill="${primaryColor}"/><circle cx="320" cy="132" r="48" fill="${secondaryColor}" opacity="0.88"/><text x="320" y="146" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>`;
  }
}

function svgToDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

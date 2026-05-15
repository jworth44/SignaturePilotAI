// TEMPLATE LAYOUT MATRIX
// Professional Classic    -> renderSplitLayout
// Executive Corporate     -> renderBannerLayout
// Minimal Clean           -> renderMinimalLayout
// Premium Consultant      -> renderTwoColumnSplitLayout
// Contractor Bold         -> renderBannerLayout
// Real Estate             -> renderSplitLayout
// Legal / Finance         -> renderTwoColumnSplitLayout
// Health / Medical        -> renderBorderedCardLayout
// Creative / Designer     -> renderBorderedCardLayout
// Tech / SaaS             -> renderSplitLayout
// Mobile Compact          -> renderStackedLayout
// Signature Card          -> renderCardLayout
// Corporate Card          -> renderBorderedCardLayout

const TEMPLATE_META = {
  "professional-classic": { name: "Professional Classic", accentWeight: 600, label: "Book a quick call", pro: false },
  "executive-corporate": { name: "Executive Corporate", accentWeight: 700, label: "Schedule a leadership call", pro: true },
  "minimal-clean": { name: "Minimal Clean", accentWeight: 500, label: "Connect", pro: false },
  "premium-consultant": { name: "Premium Consultant", accentWeight: 700, label: "Book a strategy session", pro: true },
  "contractor-bold": { name: "Contractor Bold", accentWeight: 700, label: "Request a quote", pro: false },
  "real-estate": { name: "Real Estate", accentWeight: 700, label: "View listings", pro: true },
  "legal-finance": { name: "Legal / Finance", accentWeight: 700, label: "Schedule a consultation", pro: true },
  "health-medical": { name: "Health / Medical", accentWeight: 600, label: "Book an appointment", pro: true },
  "creative-designer": { name: "Creative / Designer", accentWeight: 600, label: "See our latest work", pro: true },
  "tech-saas": { name: "Tech / SaaS", accentWeight: 600, label: "See the platform", pro: true },
  "mobile-compact": { name: "Mobile Compact", accentWeight: 600, label: "Tap to connect", pro: false },
  "signature-card": { name: "Signature Card", accentWeight: 700, label: "Open profile", pro: true },
  "corporate-card": { name: "Corporate Card", accentWeight: 700, label: "Open profile", pro: true }
};

const FREE_FAMILIES = new Set(["professional-classic", "minimal-clean", "contractor-bold", "mobile-compact"]);

const LOGO_SIZES = {
  small: 56,
  medium: 72,
  large: 96,
  "extra-large": 128
};

const TEMPLATE_FONT_STACKS = {
  "professional-classic": {
    identity: "Arial, Helvetica, sans-serif",
    label: "Arial, Helvetica, sans-serif"
  },
  "executive-corporate": {
    identity: "'Trebuchet MS', Arial, sans-serif",
    label: "'Trebuchet MS', Arial, sans-serif"
  },
  "minimal-clean": {
    identity: "Georgia, 'Times New Roman', serif",
    label: "Georgia, 'Times New Roman', serif"
  },
  "premium-consultant": {
    identity: "'Palatino Linotype', Palatino, Georgia, serif",
    label: "'Palatino Linotype', Palatino, Georgia, serif"
  },
  "contractor-bold": {
    identity: "'Trebuchet MS', Verdana, sans-serif",
    label: "'Trebuchet MS', Verdana, sans-serif"
  },
  "real-estate": {
    identity: "Verdana, Geneva, sans-serif",
    label: "Verdana, Geneva, sans-serif"
  },
  "legal-finance": {
    identity: "Georgia, 'Times New Roman', serif",
    label: "Georgia, 'Times New Roman', serif"
  },
  "health-medical": {
    identity: "'Lucida Sans', 'Lucida Grande', sans-serif",
    label: "'Lucida Sans', 'Lucida Grande', sans-serif"
  },
  "creative-designer": {
    identity: "'Trebuchet MS', Arial, sans-serif",
    label: "'Trebuchet MS', Arial, sans-serif"
  },
  "tech-saas": {
    identity: "Arial, Helvetica, sans-serif",
    label: "'Courier New', Courier, monospace"
  },
  "mobile-compact": {
    identity: "Arial, Helvetica, sans-serif",
    label: "Arial, Helvetica, sans-serif"
  },
  "signature-card": {
    identity: "'Palatino Linotype', Palatino, Georgia, serif",
    label: "'Palatino Linotype', Palatino, Georgia, serif"
  },
  "corporate-card": {
    identity: "'Trebuchet MS', Arial, sans-serif",
    label: "'Trebuchet MS', Arial, sans-serif"
  }
};

const SOCIAL_ICON_URLS = {
  linkedinUrl: "https://cdn-icons-png.flaticon.com/16/174/174857.png",
  facebookUrl: "https://cdn-icons-png.flaticon.com/16/174/174848.png",
  instagramUrl: "https://cdn-icons-png.flaticon.com/16/174/174855.png",
  twitterUrl: "https://cdn-icons-png.flaticon.com/16/5968/5968958.png",
  youtubeUrl: "https://cdn-icons-png.flaticon.com/16/1384/1384060.png"
};

export function getDefaultDraft() {
  return {
    fullName: "James Worthing",
    jobTitle: "Founder",
    companyName: "Signature Pilot AI",
    phone: "+1 (555) 123-4567",
    email: "James@signaturepilotai.com",
    website: "signature-pilot-ai.com",
    location: "Winnipeg, MB",
    linkedinUrl: "https://linkedin.com",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    brandColor: "#2663ff",
    layout: "professional-classic",
    templateVariant: 1,
    layoutManuallySelected: false,
    layoutAutoSelected: false,
    tier: "free",
    includeBranding: true,
    logoSize: "medium",
    logoFit: "contain",
    logoShape: "rounded",
    customLogoWidth: 72,
    showDivider: false,
    showTemplateTags: false,
    logoDataUrl: "",
    photoDataUrl: "",
    ctaText: "Book a quick call",
    ctaDestinationType: "none",
    ctaUrl: "",
    disclaimer: "Please consider the environment before printing this email.",
    brandDirection: "Clean electric blue with subtle premium contrast.",
    renderMode: "desktop"
  };
}

export function getLayoutMeta(layout) {
  return TEMPLATE_META[normalizeLayoutValue(layout)] || TEMPLATE_META["professional-classic"];
}

export function generateSignatureArtifacts(draft) {
  const effectiveDraft = applyTierRules({
    ...getDefaultDraft(),
    ...draft
  });
  const includeBranding = effectiveDraft.tier === "free" ? true : Boolean(effectiveDraft.includeBranding);
  const exportHtml = generateSignatureHtml({
    draft: effectiveDraft,
    tier: effectiveDraft.tier,
    includeBranding
  });

  const ctaHref = resolveCtaHref(effectiveDraft);
  const plainText = [
    effectiveDraft.fullName,
    buildTitleLine(effectiveDraft),
    effectiveDraft.phone,
    effectiveDraft.email,
    effectiveDraft.website,
    effectiveDraft.location,
    ctaHref && effectiveDraft.ctaText ? `${effectiveDraft.ctaText}: ${ctaHref}` : "",
    effectiveDraft.disclaimer
  ]
    .filter(Boolean)
    .join("\n");

  return {
    exportHtml,
    previewHtml: exportHtml,
    exportHtmlDocument: `<!doctype html><html><body>${exportHtml}</body></html>`,
    plainText,
    includeBranding,
    effectiveDraft
  };
}

export function getLogoWidth(draft) {
  if (draft.logoSize === "custom") {
    return normalizeCustomLogoWidth(draft.customLogoWidth);
  }
  return LOGO_SIZES[draft.logoSize] || LOGO_SIZES.medium;
}

export function generateSignatureHtml({ draft, tier, includeBranding }) {
  const sanitized = applyTierRules({
    ...getDefaultDraft(),
    ...draft,
    tier,
    includeBranding
  });

  const familyMeta = getLayoutMeta(sanitized.resolvedLayout);
  const variantConfig = resolveVariantConfig(sanitized);
  const brandColor = normalizedColor(sanitized.brandColor);
  const logoMarkup = buildImageMarkup({
    source: sanitized.logoDataUrl,
    alt: sanitized.companyName || sanitized.fullName,
    size: variantConfig.logoSizeOverride || getLogoWidth(sanitized),
    brandColor,
    type: "logo",
    fit: sanitized.logoFit,
    shape: sanitized.logoShape
  });
  const photoMarkup = sanitized.photoDataUrl
    ? buildImageMarkup({
        source: sanitized.photoDataUrl,
        alt: sanitized.fullName,
        size: 48,
        brandColor,
        type: "photo",
        fit: "cover",
        shape: "circle"
      })
    : "";

  const showDivider = sanitized.showDivider && variantConfig.supportsDivider;
  const shouldIncludeBranding = sanitized.tier === "free" ? true : Boolean(sanitized.includeBranding);
  const contentHtml = renderVariantLayout({
    brandColor,
    familyMeta,
    logoMarkup,
    photoMarkup,
    sanitized,
    showDivider,
    variantConfig
  });

  const brandingRow = shouldIncludeBranding
    ? buildBrandingBlock({
        align: variantConfig.isStacked ? "center" : "left",
        brandColor,
        insideCard: variantConfig.wrapInCard
      })
    : "";

  return `${contentHtml}${brandingRow}`.trim();
}

function applyTierRules(draft) {
  const selectedLayout = normalizeLayoutValue(draft.layout);
  const tier = draft.tier === "pro" ? "pro" : "free";
  const resolvedBaseLayout = tier === "free" && !FREE_FAMILIES.has(selectedLayout) ? "professional-classic" : selectedLayout;
  const variant = normalizeVariant(draft.templateVariant);
  const renderMode = draft.renderMode === "mobile" ? "mobile" : "desktop";
  const titleLength = `${draft.jobTitle || ""} ${draft.companyName || ""}`.trim().length;
  const previewUsesMobileCompact = renderMode === "mobile" && resolvedBaseLayout !== "mobile-compact" && titleLength > 42;
  const resolvedLayout = previewUsesMobileCompact ? "mobile-compact" : resolvedBaseLayout;

  return {
    ...draft,
    tier,
    layout: resolvedBaseLayout,
    resolvedLayout,
    templateVariant: variant,
    includeBranding: tier === "free" ? true : Boolean(draft.includeBranding),
    renderMode,
    previewUsesMobileCompact,
    logoSize: tier === "free" && (draft.logoSize === "custom" || draft.logoSize === "extra-large") ? "large" : draft.logoSize,
    customLogoWidth: normalizeCustomLogoWidth(draft.customLogoWidth),
    showDivider: tier === "free" ? false : Boolean(draft.showDivider),
    showTemplateTags: Boolean(draft.showTemplateTags),
    ctaDestinationType: normalizeCtaDestinationType(draft.ctaDestinationType, tier),
    ctaUrl: String(draft.ctaUrl || "").trim(),
    photoDataUrl: tier === "free" ? "" : draft.photoDataUrl,
    linkedinUrl: tier === "free" ? "" : draft.linkedinUrl,
    facebookUrl: tier === "free" ? "" : draft.facebookUrl,
    instagramUrl: tier === "free" ? "" : draft.instagramUrl,
    twitterUrl: tier === "free" ? "" : draft.twitterUrl,
    youtubeUrl: tier === "free" ? "" : draft.youtubeUrl,
    variantLabel: `${getLayoutMeta(resolvedBaseLayout).name} - Variant ${variant} of 12`
  };
}

function normalizeLayoutValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  switch (normalized) {
    case "classic":
    case "executive":
      return "professional-classic";
    case "corporate":
      return "executive-corporate";
    case "minimal":
      return "minimal-clean";
    case "premium":
    case "premium-split":
      return "premium-consultant";
    case "contractor":
      return "contractor-bold";
    case "real-estate":
    case "real estate":
      return "real-estate";
    case "legal-finance":
    case "legal / finance":
      return "legal-finance";
    case "health-medical":
    case "health / medical":
      return "health-medical";
    case "creative-designer":
    case "creative / designer":
      return "creative-designer";
    case "tech-saas":
    case "tech / saas":
      return "tech-saas";
    case "mobile-compact":
      return "mobile-compact";
    case "signature-card":
      return "signature-card";
    case "corporate-card":
    case "corporate card":
      return "corporate-card";
    case "professional-classic":
    case "executive-corporate":
    case "minimal-clean":
    case "premium-consultant":
    case "contractor-bold":
    case "corporate-card":
      return normalized;
    default:
      return "professional-classic";
  }
}

function normalizeVariant(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.min(12, Math.max(1, Math.round(parsed)));
}

function normalizeCtaDestinationType(value, tier) {
  const normalized = String(value || "none").trim().toLowerCase();
  const supported = new Set(["none", "custom", "calendly", "teams", "google-meet", "zoom", "microsoft-bookings"]);
  const safeValue = supported.has(normalized) ? normalized : "none";
  if (tier !== "pro" && safeValue !== "none" && safeValue !== "custom") {
    return "custom";
  }
  return safeValue;
}

function buildTitleLine(draft) {
  return [draft.jobTitle, draft.companyName].filter(Boolean).join(" | ");
}

function buildThemedTitleLineMarkup(draft, brandColor, fontConfig, options = {}) {
  const {
    companyColor = "#374151",
    separatorColor = "#9ca3af",
    titleColor = "#6B7280"
  } = options;
  const parts = [];

  if (draft.jobTitle) {
    parts.push(
      `<span style="color:${titleColor};font-family:${fontConfig.identity};font-size:13px;font-weight:400;line-height:1.4;">${escapeHtml(draft.jobTitle)}</span>`
    );
  }
  if (draft.companyName) {
    parts.push(
      `<span style="color:${companyColor};font-family:${fontConfig.identity};font-size:14px;font-weight:600;line-height:1.4;">${escapeHtml(draft.companyName)}</span>`
    );
  }

  return parts.join(` <span style="color:${separatorColor};font-family:${fontConfig.identity};">|</span> `);
}

function resolveVariantConfig(draft) {
  const family = draft.resolvedLayout;
  const variant = normalizeVariant(draft.templateVariant);
  const variantIndex = variant - 1;

  const shared = {
    variant,
    logoSide: variantIndex % 2 === 0 ? "left" : "right",
    ctaStyle: variantIndex % 4 === 0 ? "button" : variantIndex % 4 === 1 ? "pill" : "link",
    contactMode: variantIndex % 3 === 0 ? "stacked" : variantIndex % 3 === 1 ? "inline" : "compact",
    headlineStyle: variantIndex % 2 === 0 ? "stacked" : "inline",
    supportsDivider: variantIndex % 2 === 0,
    topBadge: variantIndex % 3 === 0,
    accentBar: variantIndex % 4 === 0,
    dense: variantIndex % 5 === 0
  };

  switch (family) {
    case "executive-corporate":
      return { ...shared, structure: "banner", logoSide: "right", supportsDivider: false, topBadge: true, nameSize: 22, titleSize: 13, ctaStyle: "button" };
    case "minimal-clean":
      return { ...shared, structure: "minimal", logoSide: "left", supportsDivider: false, topBadge: false, nameSize: 19, titleSize: 12, ctaStyle: "link", dense: true };
    case "premium-consultant":
      return { ...shared, structure: "two-column-split", logoSide: "left", supportsDivider: false, topBadge: true, nameSize: 23, titleSize: 13, ctaStyle: "pill", wrapInCard: true };
    case "contractor-bold":
      return { ...shared, structure: "banner", logoSide: "right", supportsDivider: false, topBadge: true, accentBar: true, nameSize: 21, titleSize: 13, ctaStyle: "button" };
    case "real-estate":
      return { ...shared, structure: "split-right", logoSide: "right", supportsDivider: true, topBadge: true, nameSize: 22, titleSize: 13, ctaStyle: "button" };
    case "legal-finance":
      return { ...shared, structure: "two-column-split", logoSide: "left", supportsDivider: false, topBadge: true, nameSize: 21, titleSize: 12, ctaStyle: "pill" };
    case "health-medical":
      return {
        ...shared,
        structure: "bordered-card",
        isStacked: false,
        supportsDivider: false,
        topBadge: false,
        nameSize: 20,
        titleSize: 12,
        ctaStyle: "button",
        borderedCardOptions: {
          borderColor: "#e2e8f0",
          accentColor: "#4CAF93",
          bulletColor: "#4CAF93",
          footerColor: "#4CAF93",
          companyColor: "#4CAF93"
        }
      };
    case "creative-designer":
      return {
        ...shared,
        structure: "bordered-card",
        logoSide: "left",
        supportsDivider: false,
        topBadge: true,
        nameSize: 21,
        titleSize: 12,
        ctaStyle: "pill",
        borderedCardOptions: {
          borderColor: "theme",
          accentColor: "theme",
          bulletColor: "theme",
          footerColor: "theme",
          companyColor: "theme"
        }
      };
    case "tech-saas":
      return {
        ...shared,
        structure: "chip",
        logoSide: "left",
        supportsDivider: false,
        topBadge: true,
        nameSize: 15,
        titleSize: 12,
        ctaStyle: "pill",
        logoPosition: "top",
        logoSizeOverride: 32,
        companyPlacement: "above-name",
        companySmallCaps: true,
        contactPrefix: "→ "
      };
    case "mobile-compact":
      return { ...shared, structure: "mobile", isStacked: true, supportsDivider: false, topBadge: variantIndex % 2 === 0, nameSize: 19, titleSize: 12, ctaStyle: "button" };
    case "signature-card":
      return { ...shared, structure: "card", isStacked: true, supportsDivider: false, topBadge: true, nameSize: 20, titleSize: 12, ctaStyle: "pill", wrapInCard: true };
    case "corporate-card":
      return { ...shared, structure: "bordered-card", logoSide: "left", supportsDivider: false, topBadge: true, nameSize: 20, titleSize: 12, ctaStyle: "pill" };
    case "professional-classic":
    default:
      return { ...shared, structure: "split", logoSide: "left", supportsDivider: true, topBadge: variantIndex % 4 === 0, nameSize: 21, titleSize: 13, ctaStyle: "link" };
  }
}

function renderVariantLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, showDivider, variantConfig }) {
  switch (variantConfig.structure) {
    case "banner":
      return renderBannerLayout(
        {
          brandColor,
          familyMeta,
          logoMarkup,
          photoMarkup,
          sanitized,
          variantConfig
        },
        { showDivider }
      );
    case "minimal":
      return renderMinimalLayout({
        brandColor,
        photoMarkup,
        sanitized,
        variantConfig
      });
    case "bordered-card":
      return renderBorderedCardLayout(
        {
          brandColor,
          familyMeta,
          sanitized,
          variantConfig
        },
        {
          showDivider,
          ...(variantConfig.borderedCardOptions || {})
        }
      );
    case "two-column-split":
      return renderTwoColumnSplitLayout(
        {
          brandColor,
          familyMeta,
          logoMarkup,
          photoMarkup,
          sanitized,
          variantConfig
        },
        { showDivider }
      );
    case "stacked":
    case "mobile":
      return renderStackedLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, variantConfig });
    case "card":
      return renderCardLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, variantConfig });
    default:
      return renderSplitLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, showDivider, variantConfig });
  }
}

function renderSplitLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, showDivider, variantConfig }) {
  const infoBlock = buildInfoBlock({ brandColor, familyMeta, logoMarkup, sanitized, variantConfig });
  const visualBlock = buildVisualBlock({
    accentBar: sanitized.showTemplateTags && variantConfig.accentBar,
    badgeText: sanitized.showTemplateTags && variantConfig.topBadge ? familyMeta.name : "",
    brandColor,
    logoMarkup,
    photoMarkup,
    side: variantConfig.logoSide,
    showDivider
  });

  const isProfessionalClassic = sanitized.resolvedLayout === "professional-classic";
  const dividerMarkup = showDivider
    ? `<td valign="top" style="${cellResetStyle()}width:18px;padding:0 12px;"><div style="width:1px;height:100%;min-height:104px;background:${isProfessionalClassic ? "#E5E7EB" : brandColor};font-size:0;line-height:0;">&nbsp;</div></td>`
    : "";

  const firstCell = variantConfig.logoSide === "left" ? visualBlock : infoBlock;
  const secondCell = variantConfig.logoSide === "left" ? infoBlock : visualBlock;
  const isTechSaas = sanitized.resolvedLayout === "tech-saas";
  const isRealEstate = sanitized.resolvedLayout === "real-estate";
  const wrapperStyle = isTechSaas
    ? `width:100%;max-width:620px;padding:18px;border-radius:24px;border:1px solid ${fadeColor(brandColor, 0.16)};background:#f6f9ff;`
    : isRealEstate
      ? `width:100%;max-width:620px;padding:18px;border-radius:24px;border:1px solid ${fadeColor(brandColor, 0.14)};background:#f7fcfa;`
      : isProfessionalClassic
        ? `width:100%;max-width:620px;padding:16px 18px;border-left:4px solid ${brandColor};border-radius:18px;background:#ffffff;box-shadow:0 12px 24px rgba(15,23,42,0.05);`
        : variantConfig.wrapInCard
        ? `width:100%;max-width:620px;padding:16px;border-radius:20px;background:${fadeColor(brandColor, 0.05)};`
        : "width:100%;max-width:620px;";

  if (variantConfig.logoPosition === "top") {
    return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}${wrapperStyle}font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
    <tr>
      <td valign="top" style="${cellResetStyle()}padding:0;">${infoBlock}</td>
    </tr>
  </tbody>
</table>`.trim();
  }

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}${wrapperStyle}font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
    <tr>
      <td valign="top" style="${cellResetStyle()}padding:0;">${firstCell}</td>
      ${dividerMarkup}
      <td valign="top" style="${cellResetStyle()}padding:0 0 0 ${variantConfig.logoSide === "left" ? "12px" : "0"};">${secondCell}</td>
    </tr>
  </tbody>
</table>`.trim();
}

function renderBannerLayout(data, options = {}) {
  const {
    brandColor,
    familyMeta,
    photoMarkup,
    sanitized,
    variantConfig
  } = data;
  const { showDivider = false } = options;
  const fontConfig = getTemplateFontConfig(sanitized.resolvedLayout);
  const bannerLogoMarkup = buildBannerLogoMarkup({
    source: sanitized.logoDataUrl,
    alt: sanitized.companyName || sanitized.fullName,
    brandColor
  });
  const titleLine = buildThemedTitleLineMarkup(sanitized, brandColor, fontConfig, {
    titleColor: "#ffffff",
    companyColor: "#ffffff",
    separatorColor: fadeColor("#ffffff", 0.72)
  });
  const contactMarkup = buildBannerContactMarkup(sanitized, variantConfig.contactMode, brandColor);
  const socialRows = buildSocialRows(sanitized, brandColor, false);
  const ctaMarkup = buildBannerCtaMarkup({
    align: variantConfig.structure === "banner" && variantConfig.contactMode === "inline" ? "center" : "left",
    brandColor,
    text: sanitized.ctaText || familyMeta.label,
    url: resolveCtaHref(sanitized)
  });
  const badgeMarkup = sanitized.showTemplateTags && variantConfig.topBadge
    ? `<tr><td style="${cellResetStyle()}padding:0 0 8px 0;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;">${familyMeta.name}</span></td></tr>`
    : "";
  const accentBarMarkup = sanitized.showTemplateTags && variantConfig.accentBar
    ? `<tr><td style="${cellResetStyle()}padding:0 0 10px 0;"><div style="width:100%;max-width:120px;height:6px;border-radius:999px;background:${brandColor};font-size:0;line-height:0;">&nbsp;</div></td></tr>`
    : "";
  const isExecutive = sanitized.resolvedLayout === "executive-corporate";
  const isContractor = sanitized.resolvedLayout === "contractor-bold";
  const shellBorderColor = isExecutive
    ? fadeColor(brandColor, 0.18)
    : isContractor
      ? fadeColor(brandColor, 0.2)
      : "transparent";
  const bodySurface = isExecutive
    ? "#ffffff"
    : isContractor
      ? "#fffbf5"
      : "#ffffff";
  const bodyPadding = isExecutive ? "16px 20px" : isContractor ? "14px 16px 18px 16px" : "12px 0 0 0";
  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;max-width:620px;font-family:Arial,Helvetica,sans-serif;color:#111827;${isExecutive || isContractor ? `border:1px solid ${shellBorderColor};border-radius:22px;overflow:hidden;` : ""}">
  <tbody>
    ${badgeMarkup}
    ${accentBarMarkup}
    <tr>
      <td style="${cellResetStyle()}background-color:${brandColor};padding:0;height:52px;vertical-align:middle;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;background-color:${brandColor};">
          <tbody>
            <tr style="height:52px;">
              <td valign="middle" style="${cellResetStyle()}padding:0 14px;vertical-align:middle;background-color:${brandColor};">
                <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;background-color:${brandColor};">
                  <tbody>
                    <tr>
                      ${photoMarkup ? `<td valign="middle" style="${cellResetStyle()}padding:0 10px 0 0;vertical-align:middle;background-color:${brandColor};width:48px;">${photoMarkup}</td>` : ""}
                      <td valign="middle" style="${cellResetStyle()}vertical-align:middle;background-color:${brandColor};">
                        <div style="font-family:${fontConfig.identity};font-size:${isExecutive ? "20px" : "17px"};line-height:1.2;font-weight:700;color:#ffffff;">${escapeHtml(sanitized.fullName)}</div>
                        ${titleLine ? `<div style="padding-top:4px;font-size:13px;line-height:1.4;font-weight:400;color:#ffffff;${multilineTextStyle()}">${titleLine}</div>` : ""}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              ${bannerLogoMarkup ? `<td width="110" align="right" valign="middle" style="${cellResetStyle()}width:110px;padding:6px 10px;vertical-align:middle;background-color:${brandColor};">${bannerLogoMarkup}</td>` : ""}
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td style="${cellResetStyle()}padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;background-color:${bodySurface};">
          <tbody>
            <tr>
              <td style="${cellResetStyle()}padding:${bodyPadding};background-color:${bodySurface};">
                ${contactMarkup}
                ${socialRows}
                ${ctaMarkup}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function renderTwoColumnSplitLayout(data, options = {}) {
  const {
    brandColor,
    logoMarkup,
    photoMarkup,
    sanitized
  } = data;
  const { showDivider = false } = options;
  const fontConfig = getTemplateFontConfig(sanitized.resolvedLayout);
  const leftLogoMarkup = buildSplitColumnLogoMarkup({
    source: sanitized.logoDataUrl,
    alt: sanitized.companyName || sanitized.fullName,
    brandColor
  });
  const ctaMarkup = buildSplitColumnCtaMarkup({
    brandColor,
    text: sanitized.ctaText,
    url: resolveCtaHref(sanitized)
  });
  const contactRows = buildSplitColumnContactRows(sanitized, brandColor);
  const socialRows = buildSocialRows(sanitized, brandColor, false);
  const isPremiumConsultant = sanitized.resolvedLayout === "premium-consultant";
  const isLegalFinance = sanitized.resolvedLayout === "legal-finance";
  const rightColumnBackground = isPremiumConsultant ? "#ffffff" : isLegalFinance ? "#f7f9fc" : "#fafafa";
  const shellBorder = isPremiumConsultant || isLegalFinance ? `border:1px solid ${fadeColor(brandColor, 0.14)};border-radius:22px;overflow:hidden;` : "";
  const introRule = isPremiumConsultant
    ? `<tr><td style="${cellResetStyle()}padding:0 0 12px 0;"><div style="width:48px;height:3px;border-radius:999px;background:${brandColor};font-size:0;line-height:0;">&nbsp;</div></td></tr>`
    : isLegalFinance
      ? `<tr><td style="${cellResetStyle()}padding:0 0 12px 0;"><div style="width:38px;height:1px;background:${brandColor};font-size:0;line-height:0;">&nbsp;</div></td></tr>`
      : "";

  return `
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;max-width:${isPremiumConsultant ? "540px" : "500px"};font-family:Arial,Helvetica,sans-serif;color:#111827;${shellBorder}">
  <tbody>
    <tr>
      <td ${isPremiumConsultant ? 'width="140"' : 'width="35%"'} bgcolor="${brandColor}" valign="middle" style="${cellResetStyle()}background-color:${brandColor};${isPremiumConsultant ? "width:140px;" : "width:35%;"}padding:${isPremiumConsultant ? "20px 16px" : "16px"};">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;background-color:${brandColor};">
          <tbody>
            <tr>
              <td align="center" valign="middle" style="${cellResetStyle()}padding:0 0 10px 0;">${leftLogoMarkup}</td>
            </tr>
            ${photoMarkup ? `<tr><td align="center" valign="middle" style="${cellResetStyle()}padding:0 0 10px 0;">${photoMarkup}</td></tr>` : ""}
            <tr>
              <td align="center" style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:17px;line-height:1.2;letter-spacing:-0.3px;font-weight:700;color:#ffffff;padding:0 0 4px 0;">${escapeHtml(sanitized.fullName)}</td>
            </tr>
            ${sanitized.jobTitle ? `<tr><td align="center" style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:13px;line-height:1.4;font-weight:400;color:${fadeColor("#ffffff", 0.82)};padding:0;">${escapeHtml(sanitized.jobTitle)}</td></tr>` : ""}
          </tbody>
        </table>
      </td>
      <td width="65%" valign="top" style="${cellResetStyle()}background-color:${rightColumnBackground};width:65%;padding:${isPremiumConsultant ? "18px" : "16px"};">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;background-color:${rightColumnBackground};">
          <tbody>
            ${introRule}
            ${sanitized.companyName ? `<tr><td style="${cellResetStyle()}padding:0 0 10px 0;font-family:${fontConfig.identity};font-size:14px;line-height:1.4;font-weight:600;color:#374151;${isLegalFinance ? "letter-spacing:0.04em;text-transform:uppercase;" : ""}${multilineTextStyle()}">${escapeHtml(sanitized.companyName)}</td></tr>` : ""}
            ${contactRows}
            ${socialRows}
            ${ctaMarkup}
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function renderBorderedCardLayout(data, options = {}) {
  const { brandColor, familyMeta, photoMarkup, sanitized } = data;
  const {
    showDivider = false,
    borderColor = "theme",
    accentColor = "theme",
    bulletColor = "theme",
    footerColor = "theme",
    companyColor = "theme"
  } = options;
  const resolvedBorderColor = borderColor === "theme" ? brandColor : borderColor;
  const resolvedAccentColor = accentColor === "theme" ? brandColor : accentColor;
  const resolvedBulletColor = bulletColor === "theme" ? brandColor : bulletColor;
  const resolvedFooterColor = footerColor === "theme" ? brandColor : footerColor;
  const resolvedCompanyColor = companyColor === "theme" ? brandColor : companyColor;
  const fontConfig = getTemplateFontConfig(sanitized.resolvedLayout);
  const borderedLogoMarkup = buildBorderedCardLogoMarkup({
    source: sanitized.logoDataUrl,
    alt: sanitized.companyName || sanitized.fullName
  });
  const contactRows = buildBorderedCardContactRows(sanitized, resolvedBulletColor);
  const socialRows = buildSocialRows(sanitized, resolvedBulletColor, false);
  const ctaHref = resolveCtaHref(sanitized);
  const ctaText = sanitized.ctaText || familyMeta.label;
  const isCreativeDesigner = sanitized.resolvedLayout === "creative-designer";
  const isHealthMedical = sanitized.resolvedLayout === "health-medical";
  const leftColumnSurface = isCreativeDesigner
    ? "#faf5ff"
    : isHealthMedical
      ? "#f7fffb"
      : "#ffffff";
  const rightColumnSurface = isCreativeDesigner
    ? "#fcfbff"
    : isHealthMedical
      ? "#fbfffd"
      : "#ffffff";
  const descriptorMarkup = isCreativeDesigner
    ? `<tr><td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:10px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${resolvedAccentColor};padding:0 0 8px 0;">Brand identity studio</td></tr>`
    : isHealthMedical
      ? `<tr><td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:10px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${resolvedAccentColor};padding:0 0 8px 0;">Care coordination</td></tr>`
      : "";
  const footerMarkup = ctaHref && ctaText
    ? `
    <tr>
      <td bgcolor="${resolvedFooterColor}" align="center" style="${cellResetStyle()}background-color:${resolvedFooterColor};padding:10px;">
        <a href="${ctaHref}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(ctaHref)}" style="display:inline-block;font-size:12px;line-height:16px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(ctaText)}</a>
      </td>
    </tr>`
    : `
    <tr>
      <td bgcolor="${resolvedFooterColor}" style="${cellResetStyle()}background-color:${resolvedFooterColor};font-size:0;line-height:0;padding:0;height:4px;">&nbsp;</td>
    </tr>`;

  return `
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;max-width:520px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
    <tr>
      <td style="${cellResetStyle()}border-top:3px solid ${resolvedAccentColor};border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;">
          <tbody>
            <tr>
              <td style="${cellResetStyle()}padding:20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;">
                  <tbody>
                    <tr>
                      <td width="45%" valign="top" style="${cellResetStyle()}width:45%;padding:0 16px 0 0;background:${leftColumnSurface};">
                        ${borderedLogoMarkup ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;"><tbody><tr><td style="${cellResetStyle()}padding:0 0 12px 0;">${borderedLogoMarkup}</td></tr></tbody></table>` : ""}
                        ${photoMarkup ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;"><tbody><tr><td style="${cellResetStyle()}padding:0 0 12px 0;">${photoMarkup}</td></tr></tbody></table>` : ""}
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;">
                          <tbody>
                            ${descriptorMarkup}
                            <tr>
                              <td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:17px;line-height:1.2;letter-spacing:-0.3px;font-weight:700;color:${brandColor};padding:0 0 4px 0;">${escapeHtml(sanitized.fullName)}</td>
                            </tr>
                            ${sanitized.jobTitle ? `<tr><td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:13px;line-height:1.4;font-weight:400;color:#6B7280;padding:0 0 4px 0;">${escapeHtml(sanitized.jobTitle)}</td></tr>` : ""}
                            ${sanitized.companyName ? `<tr><td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:14px;line-height:1.4;color:${resolvedCompanyColor};font-weight:600;padding:0;${multilineTextStyle()}">${escapeHtml(sanitized.companyName)}</td></tr>` : ""}
                          </tbody>
                        </table>
                      </td>
                      <td width="55%" valign="top" style="${cellResetStyle()}width:55%;padding:0;background:${rightColumnSurface};">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;background:${rightColumnSurface};">
                          <tbody>
                            ${contactRows}
                            ${socialRows}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            ${footerMarkup}
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function renderMinimalLayout({ brandColor, photoMarkup, sanitized, variantConfig }) {
  const fontConfig = getTemplateFontConfig(sanitized.resolvedLayout);
  const titleLineMarkup = buildThemedTitleLineMarkup(sanitized, brandColor, fontConfig);
  const descriptor = getTemplateDescriptor(sanitized.resolvedLayout);
  const contactItems = [
    sanitized.phone ? `<span>${escapeHtml(sanitized.phone)}</span>` : "",
    sanitized.email ? `<span>${escapeHtml(sanitized.email)}</span>` : "",
    sanitized.website ? `<span>${escapeHtml(stripProtocol(sanitized.website))}</span>` : "",
    sanitized.location ? `<span>${escapeHtml(sanitized.location)}</span>` : ""
  ].filter(Boolean);
  const contactRows = contactItems.length
    ? `<tr><td style="${cellResetStyle()}padding:8px 0 0 0;font-size:13px;line-height:1.6;font-weight:400;color:#374151;">${contactItems.join(' <span style="color:#9ca3af;">&middot;</span> ')}</td></tr>`
    : "";
  const ctaHref = resolveCtaHref(sanitized);
  const ctaMarkup = ctaHref && sanitized.ctaText
    ? `<tr><td style="${cellResetStyle()}padding-top:10px;font-size:13px;line-height:16px;"><a href="${ctaHref}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(ctaHref)}" style="color:${brandColor};text-decoration:none;font-weight:700;">&rarr; ${escapeHtml(sanitized.ctaText)}</a></td></tr>`
    : "";
  const socialRows = buildSocialRows(sanitized, brandColor, false);

  return `
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;max-width:500px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
    <tr>
      <td style="${cellResetStyle()}padding:8px 0 0 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;">
          <tbody>
            <tr>
              <td width="2" bgcolor="${brandColor}" style="${cellResetStyle()}width:2px;background-color:${brandColor};font-size:0;line-height:0;">&nbsp;</td>
              <td style="${cellResetStyle()}padding:0 0 0 12px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;">
                  <tbody>
                    ${descriptor ? `<tr><td style="${cellResetStyle()}padding:0 0 8px 0;font-family:${fontConfig.identity};font-size:10px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${brandColor};">${escapeHtml(descriptor)}</td></tr>` : ""}
                    ${photoMarkup ? `<tr><td style="${cellResetStyle()}padding:0 0 10px 0;">${photoMarkup}</td></tr>` : ""}
                    <tr>
                      <td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:20px;line-height:1.2;letter-spacing:-0.3px;font-weight:700;color:#111827;padding:0 0 4px 0;">${escapeHtml(sanitized.fullName)}</td>
                    </tr>
                    ${titleLineMarkup ? `<tr><td style="${cellResetStyle()}font-size:13px;line-height:1.4;color:#6B7280;padding:0 0 6px 0;${multilineTextStyle()}">${titleLineMarkup}</td></tr>` : ""}
                    ${contactRows}
                    ${socialRows}
                    ${ctaMarkup}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function renderStackedLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, variantConfig }) {
  const fontConfig = getTemplateFontConfig(sanitized.resolvedLayout);
  const contactRows = buildContactRows(sanitized, variantConfig.contactMode, true);
  const socialRows = buildSocialRows(sanitized, brandColor, true);
  const descriptor = getTemplateDescriptor(sanitized.resolvedLayout);
  const isMobileCompact = sanitized.resolvedLayout === "mobile-compact";
  const ctaMarkup = buildCtaMarkup({
    align: "center",
    brandColor,
    ctaStyle: variantConfig.ctaStyle,
    text: sanitized.ctaText || familyMeta.label,
    url: resolveCtaHref(sanitized)
  });

  const badgeMarkup = sanitized.showTemplateTags && variantConfig.topBadge
    ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 10px 0;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;">${familyMeta.name}</span></td></tr>`
    : "";

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;max-width:${variantConfig.structure === "mobile" ? "340px" : "400px"};font-family:Arial,Helvetica,sans-serif;color:#111827;${isMobileCompact ? `background:#f8fbff;border:1px solid ${fadeColor(brandColor, 0.14)};border-radius:22px;` : ""}">
  <tbody>
    ${badgeMarkup}
    <tr>
      <td align="center" style="${cellResetStyle()}padding:${isMobileCompact ? "16px 16px 12px 16px" : "0 0 12px 0"};">${logoMarkup}</td>
    </tr>
    ${descriptor ? `<tr><td align="center" style="${cellResetStyle()}padding:0 16px 8px 16px;font-family:${fontConfig.identity};font-size:10px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${brandColor};">${escapeHtml(descriptor)}</td></tr>` : ""}
    ${photoMarkup ? `<tr><td align="center" style="${cellResetStyle()}padding:0 16px 10px 16px;">${photoMarkup}</td></tr>` : ""}
    <tr>
      <td align="center" style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:17px;line-height:1.2;letter-spacing:-0.3px;font-weight:700;color:${brandColor};padding:0 16px 4px 16px;">${escapeHtml(sanitized.fullName)}</td>
    </tr>
    <tr>
      <td align="center" style="${cellResetStyle()}font-size:13px;line-height:1.4;font-weight:400;color:#6B7280;padding:0 16px 10px 16px;${multilineTextStyle()}">${buildThemedTitleLineMarkup(sanitized, brandColor, fontConfig)}</td>
    </tr>
    ${contactRows}
    ${socialRows}
    ${ctaMarkup}
    <tr>
      <td align="center" style="${cellResetStyle()}padding:${isMobileCompact ? "8px 16px 16px 16px" : "8px 0 0 0"};font-size:10px;line-height:15px;color:#6b7280;">${escapeHtml(sanitized.disclaimer)}</td>
    </tr>
  </tbody>
</table>`.trim();
}

function renderCardLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, variantConfig }) {
  const fontConfig = getTemplateFontConfig(sanitized.resolvedLayout);
  const contactRows = buildContactRows(sanitized, variantConfig.contactMode, true);
  const socialRows = buildSocialRows(sanitized, brandColor, true);
  const descriptor = getTemplateDescriptor(sanitized.resolvedLayout);
  const isSignatureCard = sanitized.resolvedLayout === "signature-card";
  const ctaMarkup = buildCtaMarkup({
    align: "center",
    brandColor,
    ctaStyle: variantConfig.ctaStyle,
    text: sanitized.ctaText || familyMeta.label,
    url: resolveCtaHref(sanitized)
  });

  const badgeMarkup = sanitized.showTemplateTags
    ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 8px 0;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-size:11px;font-weight:700;">${familyMeta.name}</span></td></tr>`
    : "";

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;max-width:420px;font-family:Arial,Helvetica,sans-serif;color:#111827;background:${isSignatureCard ? "#faf8ff" : fadeColor(brandColor, 0.05)};border-radius:20px;border:${isSignatureCard ? `1px solid ${fadeColor(brandColor, 0.14)}` : "0"};">
  <tbody>
    <tr>
      <td style="${cellResetStyle()}padding:${isSignatureCard ? "18px" : "16px"};">
        <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;">
          <tbody>
            <tr>
              <td align="center" style="${cellResetStyle()}padding:0 0 12px 0;">${logoMarkup}</td>
            </tr>
            ${photoMarkup ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 10px 0;">${photoMarkup}</td></tr>` : ""}
            ${badgeMarkup}
            ${descriptor ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 8px 0;font-family:${fontConfig.identity};font-size:10px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${brandColor};">${escapeHtml(descriptor)}</td></tr>` : ""}
            <tr>
              <td align="center" style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:18px;line-height:1.2;letter-spacing:-0.3px;font-weight:700;color:${brandColor};padding:0 0 4px 0;">${escapeHtml(sanitized.fullName)}</td>
            </tr>
            <tr>
              <td align="center" style="${cellResetStyle()}font-size:13px;line-height:1.4;font-weight:400;color:#6B7280;padding:0 0 10px 0;${multilineTextStyle()}">${buildThemedTitleLineMarkup(sanitized, brandColor, fontConfig)}</td>
            </tr>
            ${contactRows}
            ${socialRows}
            ${ctaMarkup}
            <tr>
              <td align="center" style="${cellResetStyle()}padding-top:8px;font-size:10px;line-height:15px;color:#6b7280;">${escapeHtml(sanitized.disclaimer)}</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function buildInfoBlock({ brandColor, familyMeta, logoMarkup, sanitized, variantConfig }) {
  const fontConfig = getTemplateFontConfig(sanitized.resolvedLayout);
  const contactRows = buildContactRows(sanitized, variantConfig.contactMode, false, { ...variantConfig, unifiedHierarchy: true });
  const socialRows = buildSocialRows(sanitized, brandColor, false);
  const descriptor = getTemplateDescriptor(sanitized.resolvedLayout);
  const ctaMarkup = buildCtaMarkup({
    align: "left",
    brandColor,
    ctaStyle: variantConfig.ctaStyle,
    text: sanitized.ctaText || familyMeta.label,
    url: resolveCtaHref(sanitized)
  });
  const badgeMarkup = sanitized.showTemplateTags && variantConfig.topBadge
    ? `<tr><td style="${cellResetStyle()}padding:0 0 8px 0;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;">${familyMeta.name}</span></td></tr>`
    : "";
  const companyMarkup = sanitized.companyName
    ? `<tr><td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:14px;line-height:1.4;font-weight:600;color:#374151;${variantConfig.companySmallCaps ? "font-variant:small-caps;letter-spacing:0.06em;" : ""}${multilineTextStyle()}padding:0 0 4px 0;">${escapeHtml(sanitized.companyName)}</td></tr>`
    : "";
  const titleOnlyMarkup = sanitized.jobTitle
    ? `<tr><td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:13px;line-height:1.4;font-weight:400;color:#6B7280;padding:0 0 8px 0;${sanitized.resolvedLayout === "professional-classic" ? "letter-spacing:0.04em;text-transform:uppercase;" : ""}">${escapeHtml(sanitized.jobTitle)}</td></tr>`
    : "";
  const titleLineMarkup = `<tr><td style="${cellResetStyle()}font-size:13px;line-height:1.4;font-weight:400;color:#6B7280;padding:0 0 8px 0;${sanitized.resolvedLayout === "professional-classic" ? "letter-spacing:0.04em;text-transform:uppercase;" : ""}${multilineTextStyle()}">${buildThemedTitleLineMarkup(sanitized, brandColor, fontConfig)}</td></tr>`;
  const topLogoMarkup = variantConfig.logoPosition === "top" && logoMarkup
    ? `<tr><td style="${cellResetStyle()}padding:0 0 10px 0;">${logoMarkup}</td></tr>`
    : "";
  const photoDataMarkup = sanitized.photoDataUrl
    ? buildImageMarkup({
        source: sanitized.photoDataUrl,
        alt: sanitized.fullName,
        size: 48,
        brandColor,
        type: "photo",
        fit: "cover",
        shape: "circle"
      })
    : "";
  const titleBlockMarkup = `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;">
      <tbody>
        ${descriptor ? `<tr><td style="${cellResetStyle()}padding:0 0 8px 0;font-family:${fontConfig.identity};font-size:10px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${brandColor};">${escapeHtml(descriptor)}</td></tr>` : ""}
        ${variantConfig.companyPlacement === "above-name" ? companyMarkup : ""}
        <tr>
          <td style="${cellResetStyle()}font-family:${fontConfig.identity};font-size:${sanitized.resolvedLayout === "professional-classic" ? "18px" : "17px"};line-height:1.2;letter-spacing:-0.3px;font-weight:700;color:${brandColor};padding:4px 0 4px 0;">${escapeHtml(sanitized.fullName)}</td>
        </tr>
        ${variantConfig.companyPlacement === "above-name" ? titleOnlyMarkup : titleLineMarkup}
        ${variantConfig.companyPlacement === "above-name" ? "" : companyMarkup}
      </tbody>
    </table>`.trim();
  const profileAndTitleMarkup = photoDataMarkup
    ? `
    <tr>
      <td style="${cellResetStyle()}padding:0 0 2px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;">
          <tbody>
            <tr>
              <td valign="top" width="58" style="${cellResetStyle()}width:58px;padding:4px 10px 0 0;vertical-align:top;">${photoDataMarkup}</td>
              <td valign="top" style="${cellResetStyle()}padding:0;vertical-align:top;">${titleBlockMarkup}</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>`
    : titleBlockMarkup;

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
    ${badgeMarkup}
    ${topLogoMarkup}
    ${profileAndTitleMarkup}
    ${contactRows}
    ${socialRows}
    ${ctaMarkup}
    <tr>
      <td style="${cellResetStyle()}padding-top:8px;font-size:10px;line-height:1.4;font-weight:400;font-style:italic;color:#999999;">${escapeHtml(sanitized.disclaimer)}</td>
    </tr>
  </tbody>
</table>`.trim();
}

function buildVisualBlock({ accentBar, badgeText, brandColor, logoMarkup, photoMarkup, side }) {
  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}">
  <tbody>
    ${badgeText && side === "right" ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 10px 0;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-size:11px;font-weight:700;">${badgeText}</span></td></tr>` : ""}
    ${accentBar ? `<tr><td style="${cellResetStyle()}padding:0 0 10px 0;"><div style="width:100%;max-width:120px;height:6px;border-radius:999px;background:${brandColor};font-size:0;line-height:0;">&nbsp;</div></td></tr>` : ""}
    ${logoMarkup ? `<tr><td style="${cellResetStyle()}padding:0 0 10px 0;">${logoMarkup}</td></tr>` : ""}
  </tbody>
</table>`.trim();
}

function getTemplateDescriptor(layout) {
  switch (layout) {
    case "professional-classic":
      return "Client advisory";
    case "minimal-clean":
      return "Editorial format";
    case "contractor-bold":
      return "Field service";
    case "real-estate":
      return "Property advisory";
    case "legal-finance":
      return "Confidential planning";
    case "health-medical":
      return "Patient care";
    case "tech-saas":
      return "Product growth";
    case "mobile-compact":
      return "Mobile-first";
    case "signature-card":
      return "Founder profile";
    default:
      return "";
  }
}

function buildContactRows(draft, mode = "stacked", centered = false, variantConfig = {}) {
  const fontConfig = getTemplateFontConfig(draft.resolvedLayout);
  const items = [];
  const labelPrefix = variantConfig.contactPrefix || "";
  const useUnifiedHierarchy = Boolean(variantConfig.unifiedHierarchy);
  const valueLinkStyle = useUnifiedHierarchy
    ? "color:#374151;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;"
    : "color:#374151;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;";
  if (draft.phone) {
    items.push([`${labelPrefix}Phone`, `<a href="tel:${sanitizePhoneHref(draft.phone)}" style="${valueLinkStyle}">${escapeHtml(draft.phone)}</a>`]);
  }
  if (draft.email) {
    items.push([`${labelPrefix}Email`, `<a href="mailto:${escapeAttribute(draft.email)}" style="${valueLinkStyle}">${escapeHtml(draft.email)}</a>`]);
  }
  if (draft.website) {
    items.push([`${labelPrefix}Web`, `<a href="${ensureProtocol(draft.website)}" style="${valueLinkStyle}">${escapeHtml(stripProtocol(draft.website))}</a>`]);
  }
  if (draft.location) {
    items.push([`${labelPrefix}Location`, escapeHtml(draft.location)]);
  }

  if (mode === "inline") {
    const inlineValue = items
      .map(([label, value]) =>
        useUnifiedHierarchy
          ? `<span><strong style="color:${draft.brandColor};font-family:${fontConfig.label};font-size:12px;font-weight:600;">${label}:</strong> <span style="color:#374151;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;">${value}</span></span>`
          : `<span><strong style="color:${draft.brandColor};font-family:${fontConfig.label};font-size:12px;font-weight:600;">${label}:</strong> <span style="color:#374151;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;">${value}</span></span>`
      )
      .join(` <span style="color:#9ca3af;">|</span> `);
    return inlineValue
      ? `<tr><td ${centered ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:6px;font-size:13px;line-height:1.5;color:#374151;font-weight:400;">${inlineValue}</td></tr>`
      : "";
  }

  if (mode === "compact") {
    return items
      .map(
        ([label, value]) =>
          `<tr><td ${centered ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:4px;font-size:13px;line-height:1.5;color:#374151;font-weight:400;"><strong style="color:${draft.brandColor};font-family:${fontConfig.label};font-size:12px;font-weight:600;">${label}:</strong> <span style="color:#374151;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;">${value}</span></td></tr>`
      )
      .join("");
  }

  return items
    .map(
      ([label, value]) =>
        `<tr><td ${centered ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:4px;font-size:13px;line-height:1.5;color:#374151;font-weight:400;"><span style="display:inline-block;min-width:${centered ? "0" : "62px"};font-family:${fontConfig.label};font-size:12px;font-weight:600;color:${draft.brandColor};">${label}:</span> <span style="color:#374151;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;">${value}</span></td></tr>`
    )
    .join("");
}

function buildBannerContactMarkup(draft, mode = "inline", brandColor) {
  const items = [];
  if (draft.phone) {
    items.push(`<strong style="color:${brandColor};font-size:12px;font-weight:600;">Phone:</strong> <a href="tel:${sanitizePhoneHref(draft.phone)}" style="color:#374151;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;">${escapeHtml(draft.phone)}</a>`);
  }
  if (draft.email) {
    items.push(`<strong style="color:${brandColor};font-size:12px;font-weight:600;">Email:</strong> <a href="mailto:${escapeAttribute(draft.email)}" style="color:#374151;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;">${escapeHtml(draft.email)}</a>`);
  }
  if (draft.website) {
    items.push(`<strong style="color:${brandColor};font-size:12px;font-weight:600;">Web:</strong> <a href="${ensureProtocol(draft.website)}" style="color:#374151;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;">${escapeHtml(stripProtocol(draft.website))}</a>`);
  }
  if (draft.address) {
    items.push(`<strong style="color:${brandColor};font-size:12px;font-weight:600;">Address:</strong> <span style="color:#374151;font-size:13px;font-weight:400;">${escapeHtml(draft.address)}</span>`);
  }
  if (draft.location) {
    items.push(`<strong style="color:${brandColor};font-size:12px;font-weight:600;">Location:</strong> <span style="color:#374151;font-size:13px;font-weight:400;">${escapeHtml(draft.location)}</span>`);
  }

  if (!items.length) {
    return "";
  }

  if (mode === "stacked" || mode === "compact") {
    return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;">
  <tbody>
    ${items
      .map(
        (item) =>
          `<tr><td style="${cellResetStyle()}padding:0 0 4px 0;font-size:13px;line-height:1.5;font-weight:400;color:#374151;">${item}</td></tr>`
      )
      .join("")}
  </tbody>
</table>`.trim();
  }

  return `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;">
  <tbody>
    <tr>
      <td style="${cellResetStyle()}font-size:13px;line-height:1.5;font-weight:400;color:#374151;">
        ${items.join(' <span style="color:#6b7280;">&middot;</span> ')}
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function buildSplitColumnContactRows(draft, brandColor) {
  const fontConfig = getTemplateFontConfig(draft.resolvedLayout);
  const items = [];
  const valueLinkStyle = "color:#374151;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;";
  if (draft.phone) {
    items.push(["P:", `<a href="tel:${sanitizePhoneHref(draft.phone)}" style="${valueLinkStyle}">${escapeHtml(draft.phone)}</a>`]);
  }
  if (draft.email) {
    items.push(["E:", `<a href="mailto:${escapeAttribute(draft.email)}" style="${valueLinkStyle}">${escapeHtml(draft.email)}</a>`]);
  }
  if (draft.website) {
    items.push(["W:", `<a href="${ensureProtocol(draft.website)}" style="${valueLinkStyle}">${escapeHtml(stripProtocol(draft.website))}</a>`]);
  }
  if (draft.location) {
    items.push(["L:", escapeHtml(draft.location)]);
  }

  return items
    .map(
      ([label, value]) =>
        `<tr><td style="${cellResetStyle()}padding:0 0 6px 0;font-size:13px;line-height:1.5;color:#374151;font-weight:400;"><span style="display:inline-block;min-width:26px;font-family:${fontConfig.label};font-size:12px;font-weight:600;color:${brandColor};">${label}</span> <span style="color:#374151;font-family:Arial, Helvetica, sans-serif;font-size:13px;font-weight:400;">${value}</span></td></tr>`
    )
    .join("");
}

function buildBorderedCardContactRows(draft, brandColor) {
  const items = [];
  if (draft.phone) {
    items.push(escapeHtml(draft.phone));
  }
  if (draft.email) {
    items.push(escapeHtml(draft.email));
  }
  if (draft.website) {
    items.push(escapeHtml(stripProtocol(draft.website)));
  }
  if (draft.location) {
    items.push(escapeHtml(draft.location));
  }

  return items
    .map(
      (value) => `
<tr>
  <td style="${cellResetStyle()}padding:0 0 7px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="${tableResetStyle()}width:100%;">
      <tbody>
        <tr>
          <td width="6" height="6" bgcolor="${brandColor}" valign="middle" style="${cellResetStyle()}width:6px;height:6px;background-color:${brandColor};font-size:0;line-height:0;">&nbsp;</td>
          <td width="4" style="${cellResetStyle()}width:4px;font-size:0;line-height:0;">&nbsp;</td>
          <td valign="middle" style="${cellResetStyle()}font-size:13px;line-height:1.5;font-weight:400;color:#374151;">${value}</td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`
    )
    .join("");
}

function buildSocialRows(draft, brandColor, centered = false) {
  const links = Object.entries(SOCIAL_ICON_URLS)
    .map(([field, iconUrl]) => {
      const url = draft[field];
      return url
        ? {
            field,
            href: ensureProtocol(url),
            iconUrl
          }
        : null;
    })
    .filter(Boolean);

  if (!links.length) {
    return "";
  }

  return `
<tr>
  <td ${centered ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:8px;">
    <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}${centered ? "margin:0 auto;" : ""}">
      <tbody>
        <tr>
          ${links
            .map(
              (link, index) => `
          <td style="${cellResetStyle()}padding:${index === links.length - 1 ? "0" : "0 8px 0 0"};">
            <a href="${link.href}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(link.href)}" style="display:block;text-decoration:none;">
              <img src="${link.iconUrl}" alt="" width="18" height="18" style="display:block;width:18px;height:18px;border:0;border:none;outline:none;box-shadow:none;text-decoration:none;" />
            </a>
          </td>`
            )
            .join("")}
        </tr>
      </tbody>
    </table>
  </td>
</tr>`.trim();
}

function buildCtaMarkup({ align, brandColor, ctaStyle, text, url }) {
  if (!url || !text) {
    return "";
  }
  if (ctaStyle === "button") {
    return `<tr><td ${align === "center" ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:12px;"><a href="${url}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(url)}" style="display:inline-block;padding:8px 14px;border-radius:999px;background:${brandColor};color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;">${escapeHtml(text)}</a></td></tr>`;
  }
  if (ctaStyle === "pill") {
    return `<tr><td ${align === "center" ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:12px;"><a href="${url}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(url)}" style="display:inline-block;padding:6px 12px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};text-decoration:none;font-size:12px;font-weight:700;">${escapeHtml(text)}</a></td></tr>`;
  }
  return `<tr><td ${align === "center" ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:12px;font-size:12px;line-height:18px;color:#374151;"><a href="${url}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(url)}" style="color:${brandColor};text-decoration:none;font-weight:700;">${escapeHtml(text)}</a></td></tr>`;
}

function buildBannerCtaMarkup({ align, brandColor, text, url }) {
  if (!url || !text) {
    return "";
  }

  return `
<tr>
  <td ${align === "center" ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:12px;">
    <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}${align === "center" ? "margin:0 auto;" : ""}">
      <tbody>
        <tr>
          <td bgcolor="${brandColor}" style="${cellResetStyle()}background-color:${brandColor};padding:8px 14px;border-radius:999px;">
            <a href="${url}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(url)}" style="display:inline-block;font-size:12px;line-height:16px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(text)}</a>
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`.trim();
}

function buildSplitColumnCtaMarkup({ brandColor, text, url }) {
  if (!url || !text) {
    return "";
  }

  return `
<tr>
  <td style="${cellResetStyle()}padding-top:10px;">
    <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}">
      <tbody>
        <tr>
          <td bgcolor="${brandColor}" style="${cellResetStyle()}background-color:${brandColor};padding:7px 12px;border-radius:999px;">
            <a href="${url}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(url)}" style="display:inline-block;font-size:12px;line-height:16px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(text)}</a>
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`.trim();
}

function buildBrandingBlock({ align, brandColor, insideCard }) {
  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;max-width:${insideCard ? "420px" : "620px"};margin-top:12px;">
  <tbody>
    <tr>
      <td align="${align}" style="${cellResetStyle()}padding-top:12px;">
        <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;background:${fadeColor(brandColor, 0.06)};border-radius:12px;">
          <tbody>
            <tr>
              <td align="${align}" style="${cellResetStyle()}padding:10px 12px 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#6b7280;">
                Created with <a href="https://signature-forge-ai.vercel.app" style="color:${brandColor};text-decoration:none;font-weight:700;">Signature Pilot AI</a>
              </td>
            </tr>
            <tr>
              <td align="${align}" style="${cellResetStyle()}padding:2px 12px 10px 12px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:15px;color:#7b8498;">
                Free signature powered by <a href="https://signature-forge-ai.vercel.app" style="color:${brandColor};text-decoration:none;font-weight:700;">Signature Pilot AI</a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function buildImageMarkup({ source, alt, size, brandColor, type, fit = "contain", shape }) {
  const resolvedShape = shape || (type === "photo" ? "circle" : "rounded");
  const radius = resolvedShape === "circle" ? "999px" : resolvedShape === "square" ? "0" : "16px";
  if (source) {
    if (type === "photo") {
      return `
<img
  src="${source}"
  alt="${escapeAttribute(alt)}"
  width="48"
  height="48"
  style="display:block;width:48px;height:48px;max-width:48px;border:0;border:none;outline:none;box-shadow:none;text-decoration:none;border-radius:50%;object-fit:cover;"
/>`.trim();
    }

    return `
<img
  src="${source}"
  alt="${escapeAttribute(alt)}"
  width="${size}"
  style="display:block;width:${size}px;height:auto;max-width:${size}px;border:0;border:none;outline:none;box-shadow:none;text-decoration:none;border-radius:${radius};object-fit:${fit};"
/>`.trim();
  }

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}">
  <tbody>
    <tr>
      <td align="center" valign="middle" width="${size}" height="${size}" style="${cellResetStyle()}width:${size}px;height:${size}px;border-radius:${radius};background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:${Math.max(14, Math.round(size / 3.1))}px;font-weight:700;">
        ${escapeHtml(initialsFromAlt(alt))}
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function buildBannerLogoMarkup({ source, alt, brandColor }) {
  const maxHeight = 40;
  if (source) {
    return `<img src="${source}" alt="${escapeAttribute(alt)}" style="max-height:36px;max-width:100px;height:auto;width:auto;display:block;vertical-align:middle;border:0;border:none;outline:none;box-shadow:none;text-decoration:none;" />`;
  }

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}">
  <tbody>
    <tr>
      <td align="center" valign="middle" width="${maxHeight}" height="${maxHeight}" style="${cellResetStyle()}width:${maxHeight}px;height:${maxHeight}px;color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;vertical-align:middle;">
        ${escapeHtml(initialsFromAlt(alt))}
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function buildSplitColumnLogoMarkup({ source, alt, brandColor }) {
  const maxHeight = 48;
  if (source) {
    return `<img src="${source}" alt="${escapeAttribute(alt)}" style="display:block;max-height:${maxHeight}px;width:auto;border:0;border:none;outline:none;box-shadow:none;text-decoration:none;vertical-align:middle;background:#ffffff;" />`;
  }

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}">
  <tbody>
    <tr>
      <td align="center" valign="middle" width="${maxHeight}" height="${maxHeight}" style="${cellResetStyle()}width:${maxHeight}px;height:${maxHeight}px;background:#ffffff;border-radius:12px;color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;vertical-align:middle;">
        ${escapeHtml(initialsFromAlt(alt))}
      </td>
    </tr>
  </tbody>
</table>`.trim();
}

function buildBorderedCardLogoMarkup({ source, alt }) {
  if (!source) {
    return "";
  }

  return `<img src="${source}" alt="${escapeAttribute(alt)}" style="display:block;max-height:52px;max-width:120px;width:auto;height:auto;border:0;border:none;outline:none;box-shadow:none;text-decoration:none;" />`;
}

function initialsFromAlt(value) {
  return (
    String(value || "SP")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() || "")
      .join("") || "SP"
  );
}

function getTemplateFontConfig(layout) {
  return TEMPLATE_FONT_STACKS[normalizeLayoutValue(layout)] || TEMPLATE_FONT_STACKS["professional-classic"];
}

function normalizedColor(value) {
  const raw = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : "#2663ff";
}

function linkStyle(color) {
  return `color:${normalizedColor(color)};text-decoration:none;`;
}

function tableResetStyle() {
  return "border:0;border:none;outline:none;box-shadow:none;border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;";
}

function cellResetStyle() {
  return "border:0;border:none;outline:none;box-shadow:none;";
}

function multilineTextStyle() {
  return "white-space:normal;word-break:break-word;overflow-wrap:anywhere;";
}

function stripProtocol(value) {
  return String(value || "").replace(/^https?:\/\//i, "");
}

function ensureProtocol(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "https://signature-forge-ai.vercel.app";
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function resolveCtaHref(draft) {
  const destinationType = normalizeCtaDestinationType(draft.ctaDestinationType, draft.tier);
  if (destinationType === "none") {
    return "";
  }

  const trimmed = String(draft.ctaUrl || "").trim();
  if (!trimmed) {
    return "";
  }

  const normalized = ensureProtocol(trimmed);
  return isValidSchedulingUrl(normalized) ? normalized : "";
}

function isValidSchedulingUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function sanitizePhoneHref(value) {
  return String(value || "").replace(/[^+\d]/g, "");
}

function fadeColor(hex, alpha) {
  const normalized = normalizedColor(hex).slice(1);
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function tintHexColor(hex, amount = 0.9, fallback = "#e8f0fe") {
  const raw = String(hex || "").trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return fallback;
  }
  const normalized = raw.slice(1);
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const tint = (channel) => Math.max(0, Math.min(255, Math.round(channel + (255 - channel) * amount)));
  return `#${[tint(red), tint(green), tint(blue)].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function normalizeCustomLogoWidth(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 72;
  }
  return Math.min(180, Math.max(40, Math.round(parsed)));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "");
}

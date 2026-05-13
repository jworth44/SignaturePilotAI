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
  "signature-card": { name: "Signature Card", accentWeight: 700, label: "Open profile", pro: true }
};

const FREE_FAMILIES = new Set(["professional-classic", "minimal-clean", "contractor-bold", "mobile-compact"]);

const LOGO_SIZES = {
  small: 56,
  medium: 72,
  large: 96,
  "extra-large": 128
};

export function getDefaultDraft() {
  return {
    fullName: "Jordan Wells",
    jobTitle: "Founder",
    companyName: "Signature Pilot AI",
    phone: "+1 (555) 123-4567",
    email: "hello@signatureforge.ai",
    website: "signatureforge.ai",
    location: "Winnipeg, MB",
    linkedinUrl: "https://linkedin.com",
    facebookUrl: "",
    instagramUrl: "",
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

  const plainText = [
    effectiveDraft.fullName,
    buildTitleLine(effectiveDraft),
    effectiveDraft.phone,
    effectiveDraft.email,
    effectiveDraft.website,
    effectiveDraft.location,
    effectiveDraft.ctaText,
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
    source: sanitized.logoDataUrl || sanitized.photoDataUrl,
    alt: sanitized.companyName || sanitized.fullName,
    size: getLogoWidth(sanitized),
    brandColor,
    type: "logo",
    fit: sanitized.logoFit,
    shape: sanitized.logoShape
  });
  const photoMarkup = sanitized.photoDataUrl && sanitized.logoDataUrl
    ? buildImageMarkup({
        source: sanitized.photoDataUrl,
        alt: sanitized.fullName,
        size: 52,
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
    photoDataUrl: tier === "free" ? "" : draft.photoDataUrl,
    linkedinUrl: tier === "free" ? "" : draft.linkedinUrl,
    facebookUrl: tier === "free" ? "" : draft.facebookUrl,
    instagramUrl: tier === "free" ? "" : draft.instagramUrl,
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
    case "professional-classic":
    case "executive-corporate":
    case "minimal-clean":
    case "premium-consultant":
    case "contractor-bold":
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

function buildTitleLine(draft) {
  return [draft.jobTitle, draft.companyName].filter(Boolean).join(" | ");
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
      return { ...shared, structure: "split", logoSide: "right", supportsDivider: true, topBadge: true, nameSize: 22, titleSize: 13, ctaStyle: "button" };
    case "minimal-clean":
      return { ...shared, structure: "split", logoSide: "left", supportsDivider: false, topBadge: false, nameSize: 19, titleSize: 12, ctaStyle: "link", dense: true };
    case "premium-consultant":
      return { ...shared, structure: "split-card", logoSide: variantIndex % 2 === 0 ? "left" : "right", supportsDivider: true, topBadge: true, nameSize: 23, titleSize: 13, ctaStyle: "pill", wrapInCard: true };
    case "contractor-bold":
      return { ...shared, structure: "split-strong", logoSide: "left", supportsDivider: false, topBadge: true, accentBar: true, nameSize: 21, titleSize: 13, ctaStyle: "button" };
    case "real-estate":
      return { ...shared, structure: "split-right", logoSide: "right", supportsDivider: true, topBadge: true, nameSize: 22, titleSize: 13, ctaStyle: "button" };
    case "legal-finance":
      return { ...shared, structure: "structured", logoSide: "left", supportsDivider: true, topBadge: true, nameSize: 21, titleSize: 12, ctaStyle: "pill" };
    case "health-medical":
      return { ...shared, structure: "stacked", isStacked: true, supportsDivider: false, topBadge: false, nameSize: 20, titleSize: 12, ctaStyle: "button" };
    case "creative-designer":
      return { ...shared, structure: "creative", logoSide: variantIndex % 2 === 0 ? "right" : "left", supportsDivider: false, topBadge: true, nameSize: 21, titleSize: 12, ctaStyle: "pill" };
    case "tech-saas":
      return { ...shared, structure: "chip", logoSide: "left", supportsDivider: false, topBadge: true, nameSize: 21, titleSize: 12, ctaStyle: "pill" };
    case "mobile-compact":
      return { ...shared, structure: "mobile", isStacked: true, supportsDivider: false, topBadge: variantIndex % 2 === 0, nameSize: 19, titleSize: 12, ctaStyle: "button" };
    case "signature-card":
      return { ...shared, structure: "card", isStacked: true, supportsDivider: false, topBadge: true, nameSize: 20, titleSize: 12, ctaStyle: "pill", wrapInCard: true };
    case "professional-classic":
    default:
      return { ...shared, structure: "split", logoSide: "left", supportsDivider: true, topBadge: variantIndex % 4 === 0, nameSize: 21, titleSize: 13, ctaStyle: "link" };
  }
}

function renderVariantLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, showDivider, variantConfig }) {
  switch (variantConfig.structure) {
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
  const infoBlock = buildInfoBlock({ brandColor, familyMeta, sanitized, variantConfig });
  const visualBlock = buildVisualBlock({
    accentBar: variantConfig.accentBar,
    badgeText: sanitized.showTemplateTags && variantConfig.topBadge ? familyMeta.name : "",
    brandColor,
    logoMarkup,
    photoMarkup,
    side: variantConfig.logoSide,
    showDivider
  });

  const dividerMarkup = showDivider
    ? `<td valign="top" style="${cellResetStyle()}width:18px;padding:0 12px;"><div style="width:1px;height:100%;min-height:104px;background:${fadeColor(brandColor, 0.24)};font-size:0;line-height:0;">&nbsp;</div></td>`
    : "";

  const firstCell = variantConfig.logoSide === "left" ? visualBlock : infoBlock;
  const secondCell = variantConfig.logoSide === "left" ? infoBlock : visualBlock;
  const wrapperStyle = variantConfig.wrapInCard
    ? `width:100%;max-width:620px;padding:16px;border-radius:20px;background:${fadeColor(brandColor, 0.05)};`
    : "width:100%;max-width:620px;";

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

function renderStackedLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, variantConfig }) {
  const contactRows = buildContactRows(sanitized, variantConfig.contactMode, true);
  const socialRows = buildSocialRows(sanitized, brandColor, true);
  const ctaMarkup = buildCtaMarkup({
    align: "center",
    brandColor,
    ctaStyle: variantConfig.ctaStyle,
    text: sanitized.ctaText || familyMeta.label,
    url: ensureProtocol(sanitized.website)
  });

  const badgeMarkup = sanitized.showTemplateTags && variantConfig.topBadge
    ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 10px 0;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;">${familyMeta.name}</span></td></tr>`
    : "";

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;max-width:${variantConfig.structure === "mobile" ? "340px" : "400px"};font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
    ${badgeMarkup}
    <tr>
      <td align="center" style="${cellResetStyle()}padding:0 0 12px 0;">${logoMarkup}</td>
    </tr>
    ${photoMarkup ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 10px 0;">${photoMarkup}</td></tr>` : ""}
    <tr>
      <td align="center" style="${cellResetStyle()}font-size:${variantConfig.nameSize}px;line-height:${variantConfig.nameSize + 5}px;font-weight:700;color:#111827;padding:0 0 4px 0;">${escapeHtml(sanitized.fullName)}</td>
    </tr>
    <tr>
      <td align="center" style="${cellResetStyle()}font-size:${variantConfig.titleSize}px;line-height:${variantConfig.titleSize + 6}px;font-weight:${familyMeta.accentWeight};color:${brandColor};padding:0 0 10px 0;">${escapeHtml(buildTitleLine(sanitized))}</td>
    </tr>
    ${contactRows}
    ${socialRows}
    ${ctaMarkup}
    <tr>
      <td align="center" style="${cellResetStyle()}padding-top:8px;font-size:10px;line-height:15px;color:#6b7280;">${escapeHtml(sanitized.disclaimer)}</td>
    </tr>
  </tbody>
</table>`.trim();
}

function renderCardLayout({ brandColor, familyMeta, logoMarkup, photoMarkup, sanitized, variantConfig }) {
  const contactRows = buildContactRows(sanitized, variantConfig.contactMode, true);
  const socialRows = buildSocialRows(sanitized, brandColor, true);
  const ctaMarkup = buildCtaMarkup({
    align: "center",
    brandColor,
    ctaStyle: variantConfig.ctaStyle,
    text: sanitized.ctaText || familyMeta.label,
    url: ensureProtocol(sanitized.website)
  });

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;max-width:420px;font-family:Arial,Helvetica,sans-serif;color:#111827;background:${fadeColor(brandColor, 0.05)};border-radius:18px;">
  <tbody>
    <tr>
      <td style="${cellResetStyle()}padding:16px;">
        <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;">
          <tbody>
            <tr>
              <td align="center" style="${cellResetStyle()}padding:0 0 12px 0;">${logoMarkup}</td>
            </tr>
            ${photoMarkup ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 10px 0;">${photoMarkup}</td></tr>` : ""}
            <tr>
              <td align="center" style="${cellResetStyle()}padding:0 0 8px 0;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-size:11px;font-weight:700;">${familyMeta.name}</span></td>
            </tr>
            <tr>
              <td align="center" style="${cellResetStyle()}font-size:${variantConfig.nameSize}px;line-height:${variantConfig.nameSize + 5}px;font-weight:700;padding:0 0 4px 0;">${escapeHtml(sanitized.fullName)}</td>
            </tr>
            <tr>
              <td align="center" style="${cellResetStyle()}font-size:${variantConfig.titleSize}px;line-height:${variantConfig.titleSize + 6}px;font-weight:${familyMeta.accentWeight};color:${brandColor};padding:0 0 10px 0;">${escapeHtml(buildTitleLine(sanitized))}</td>
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

function buildInfoBlock({ brandColor, familyMeta, sanitized, variantConfig }) {
  const contactRows = buildContactRows(sanitized, variantConfig.contactMode, false);
  const socialRows = buildSocialRows(sanitized, brandColor, false);
  const ctaMarkup = buildCtaMarkup({
    align: "left",
    brandColor,
    ctaStyle: variantConfig.ctaStyle,
    text: sanitized.ctaText || familyMeta.label,
    url: ensureProtocol(sanitized.website)
  });
  const badgeMarkup = sanitized.showTemplateTags && variantConfig.topBadge
    ? `<tr><td style="${cellResetStyle()}padding:0 0 8px 0;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;">${familyMeta.name}</span></td></tr>`
    : "";

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
    ${badgeMarkup}
    <tr>
      <td style="${cellResetStyle()}font-size:${variantConfig.nameSize}px;line-height:${variantConfig.nameSize + 6}px;font-weight:700;padding:0 0 4px 0;">${escapeHtml(sanitized.fullName)}</td>
    </tr>
    <tr>
      <td style="${cellResetStyle()}font-size:${variantConfig.titleSize}px;line-height:${variantConfig.titleSize + 6}px;font-weight:${familyMeta.accentWeight};color:${brandColor};padding:0 0 8px 0;">${escapeHtml(buildTitleLine(sanitized))}</td>
    </tr>
    ${contactRows}
    ${socialRows}
    ${ctaMarkup}
    <tr>
      <td style="${cellResetStyle()}padding-top:8px;font-size:10px;line-height:15px;color:#6b7280;">${escapeHtml(sanitized.disclaimer)}</td>
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
    <tr>
      <td style="${cellResetStyle()}padding:0 0 10px 0;">${logoMarkup}</td>
    </tr>
    ${photoMarkup ? `<tr><td style="${cellResetStyle()}padding:0 0 8px 0;">${photoMarkup}</td></tr>` : ""}
  </tbody>
</table>`.trim();
}

function buildContactRows(draft, mode = "stacked", centered = false) {
  const rows = [];
  const items = [];
  if (draft.phone) {
    items.push(["Phone", `<a href="tel:${sanitizePhoneHref(draft.phone)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(draft.phone)}</a>`]);
  }
  if (draft.email) {
    items.push(["Email", `<a href="mailto:${escapeAttribute(draft.email)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(draft.email)}</a>`]);
  }
  if (draft.website) {
    items.push(["Web", `<a href="${ensureProtocol(draft.website)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(stripProtocol(draft.website))}</a>`]);
  }
  if (draft.location) {
    items.push(["Location", escapeHtml(draft.location)]);
  }

  if (mode === "inline") {
    const inlineValue = items
      .map(([label, value]) => `<span><strong style="color:#111827;">${label}:</strong> ${value}</span>`)
      .join(` <span style="color:#9ca3af;">|</span> `);
    return inlineValue
      ? `<tr><td ${centered ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:6px;font-size:12px;line-height:18px;color:#4b5563;">${inlineValue}</td></tr>`
      : "";
  }

  if (mode === "compact") {
    return items
      .map(
        ([label, value]) =>
          `<tr><td ${centered ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:4px;font-size:12px;line-height:17px;color:#4b5563;"><strong style="color:#111827;">${label}:</strong> ${value}</td></tr>`
      )
      .join("");
  }

  return items
    .map(
      ([label, value]) =>
        `<tr><td ${centered ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:4px;font-size:12px;line-height:18px;color:#4b5563;"><span style="display:inline-block;min-width:${centered ? "0" : "62px"};font-weight:700;color:#111827;">${label}:</span> ${value}</td></tr>`
    )
    .join("");
}

function buildSocialRows(draft, brandColor, centered = false) {
  const links = [
    ["LinkedIn", draft.linkedinUrl],
    ["Facebook", draft.facebookUrl],
    ["Instagram", draft.instagramUrl]
  ]
    .filter(([, url]) => url)
    .map(([label, url]) => `<a href="${ensureProtocol(url)}" style="${linkStyle(brandColor)}">${escapeHtml(label)}</a>`);

  if (!links.length) {
    return "";
  }

  return `<tr><td ${centered ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:6px;font-size:12px;line-height:18px;color:#4b5563;">${links.join(' <span style="color:#9ca3af;">|</span> ')}</td></tr>`;
}

function buildCtaMarkup({ align, brandColor, ctaStyle, text, url }) {
  if (ctaStyle === "button") {
    return `<tr><td ${align === "center" ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:12px;"><a href="${url}" style="display:inline-block;padding:8px 14px;border-radius:999px;background:${brandColor};color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;">${escapeHtml(text)}</a></td></tr>`;
  }
  if (ctaStyle === "pill") {
    return `<tr><td ${align === "center" ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:12px;"><a href="${url}" style="display:inline-block;padding:6px 12px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};text-decoration:none;font-size:12px;font-weight:700;">${escapeHtml(text)}</a></td></tr>`;
  }
  return `<tr><td ${align === "center" ? 'align="center"' : ""} style="${cellResetStyle()}padding-top:12px;font-size:12px;line-height:18px;color:#374151;"><a href="${url}" style="color:${brandColor};text-decoration:none;font-weight:700;">${escapeHtml(text)}</a></td></tr>`;
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
    return `
<img
  src="${source}"
  alt="${escapeAttribute(alt)}"
  width="${size}"
  style="display:block;width:${size}px;height:auto;max-width:${size}px;border:0;border:none;outline:none;box-shadow:none;text-decoration:none;border-radius:${radius};object-fit:${fit};background:#ffffff;"
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

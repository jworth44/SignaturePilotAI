const LAYOUT_META = {
  classic: { name: "Classic", accentWeight: 500, label: "Call" },
  modern: { name: "Modern", accentWeight: 600, label: "Connect" },
  compact: { name: "Compact", accentWeight: 500, label: "Reach" },
  "premium-split": { name: "Premium Split Line", accentWeight: 700, label: "Discover" }
};

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
    companyName: "SignatureForge AI",
    phone: "+1 (555) 123-4567",
    email: "hello@signatureforge.ai",
    website: "signatureforge.ai",
    location: "Winnipeg, MB",
    linkedinUrl: "https://linkedin.com",
    facebookUrl: "",
    instagramUrl: "",
    brandColor: "#2663ff",
    layout: "classic",
    tier: "free",
    includeBranding: true,
    logoSize: "medium",
    customLogoWidth: 72,
    showDivider: true,
    logoDataUrl: "",
    photoDataUrl: "",
    ctaText: "Book a quick call",
    disclaimer: "Please consider the environment before printing this email.",
    brandDirection: "Clean electric blue with subtle premium contrast."
  };
}

export function getLayoutMeta(layout) {
  return LAYOUT_META[layout] || LAYOUT_META.classic;
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
  const brandColor = normalizedColor(sanitized.brandColor);
  const contactRows = buildContactRows(sanitized);
  const socialRows = buildSocialRows(sanitized);
  const logoMarkup = buildImageMarkup({
    source: sanitized.logoDataUrl || sanitized.photoDataUrl,
    alt: sanitized.companyName || sanitized.fullName,
    size: getLogoWidth(sanitized),
    brandColor,
    type: "logo"
  });
  const photoMarkup = sanitized.photoDataUrl && sanitized.logoDataUrl
    ? buildImageMarkup({
        source: sanitized.photoDataUrl,
        alt: sanitized.fullName,
        size: 52,
        brandColor,
        type: "photo"
      })
    : "";
  const columnCount = sanitized.showDivider ? 3 : 2;
  const dividerMarkup = sanitized.showDivider
    ? `<td style="width:18px;padding:0 12px;border-left:1px solid ${fadeColor(brandColor, 0.32)};"></td>`
    : "";
  const meta = getLayoutMeta(sanitized.layout);
  const shouldIncludeBranding = sanitized.tier === "free" ? true : Boolean(sanitized.includeBranding);
  const brandingRow = shouldIncludeBranding
    ? `<tr><td colspan="${columnCount}" style="padding-top:12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#6b7280;">Created with <a href="https://signatureforge.ai" style="color:${brandColor};text-decoration:none;font-weight:700;">SignatureForge AI</a></td></tr>`
    : "";
  const premiumRibbon = sanitized.layout === "premium-split"
    ? `<tr><td colspan="${columnCount}" style="padding-bottom:10px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">Premium split layout</span></td></tr>`
    : "";

  return `
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-spacing:0;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  ${premiumRibbon}
  <tr>
    <td valign="top" style="padding:0;">
      ${logoMarkup}
      ${photoMarkup}
    </td>
    ${dividerMarkup}
    <td valign="top" style="padding:0 0 0 12px;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-spacing:0;">
        <tr>
          <td style="font-size:${sanitized.layout === "compact" ? 18 : 22}px;line-height:${sanitized.layout === "compact" ? 22 : 28}px;font-weight:700;color:#111827;padding:0 0 2px 0;">
            ${escapeHtml(sanitized.fullName)}
          </td>
        </tr>
        <tr>
          <td style="font-size:14px;line-height:20px;font-weight:${meta.accentWeight};color:${brandColor};padding:0 0 3px 0;">
            ${escapeHtml(buildTitleLine(sanitized))}
          </td>
        </tr>
        ${contactRows}
        ${socialRows}
        <tr>
          <td style="padding-top:10px;font-size:12px;line-height:18px;color:#374151;">
            <a href="${ensureProtocol(sanitized.website)}" style="color:${brandColor};text-decoration:none;font-weight:600;">${escapeHtml(sanitized.ctaText || meta.label)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding-top:8px;font-size:11px;line-height:16px;color:#6b7280;">
            ${escapeHtml(sanitized.disclaimer)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${brandingRow}
</table>`.trim();
}

function applyTierRules(draft) {
  if (draft.tier !== "pro") {
    return {
      ...draft,
      includeBranding: true,
      layout: "classic",
      logoSize: draft.logoSize === "custom" || draft.logoSize === "extra-large" ? "large" : draft.logoSize,
      customLogoWidth: normalizeCustomLogoWidth(draft.customLogoWidth),
      showDivider: false,
      photoDataUrl: "",
      location: "",
      linkedinUrl: "",
      facebookUrl: "",
      instagramUrl: ""
    };
  }

  return draft;
}

function buildTitleLine(draft) {
  return [draft.jobTitle, draft.companyName].filter(Boolean).join(" | ");
}

function buildContactRows(draft) {
  const rows = [];
  if (draft.phone) {
    rows.push(buildRow("Phone", `<a href="tel:${sanitizePhoneHref(draft.phone)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(draft.phone)}</a>`));
  }
  if (draft.email) {
    rows.push(buildRow("Email", `<a href="mailto:${escapeAttribute(draft.email)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(draft.email)}</a>`));
  }
  if (draft.website) {
    rows.push(buildRow("Web", `<a href="${ensureProtocol(draft.website)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(stripProtocol(draft.website))}</a>`));
  }
  if (draft.location) {
    rows.push(buildRow("Location", escapeHtml(draft.location)));
  }
  return rows.join("");
}

function buildSocialRows(draft) {
  const links = [
    ["LinkedIn", draft.linkedinUrl],
    ["Facebook", draft.facebookUrl],
    ["Instagram", draft.instagramUrl]
  ]
    .filter(([, url]) => url)
    .map(([label, url]) => `<a href="${ensureProtocol(url)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(label)}</a>`);

  if (!links.length) {
    return "";
  }

  return buildRow("Social", links.join(' <span style="color:#9ca3af;">|</span> '));
}

function buildRow(label, value) {
  return `
    <tr>
      <td style="padding-top:4px;font-size:12px;line-height:18px;color:#4b5563;">
        <span style="display:inline-block;min-width:62px;font-weight:700;color:#111827;">${label}:</span> ${value}
      </td>
    </tr>`;
}

function buildImageMarkup({ source, alt, size, brandColor, type }) {
  if (source) {
    return `
      <img
        src="${source}"
        alt="${escapeAttribute(alt)}"
        width="${size}"
        style="display:block;width:${size}px;height:auto;max-width:${size}px;border:0;outline:none;text-decoration:none;border-radius:${type === "photo" ? "999px" : "16px"};object-fit:cover;background:#ffffff;"
      />`;
  }

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-spacing:0;">
      <tr>
        <td align="center" valign="middle" width="${size}" height="${size}" style="width:${size}px;height:${size}px;border-radius:${type === "photo" ? "999px" : "16px"};background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:${Math.max(14, Math.round(size / 3.1))}px;font-weight:700;">
          ${escapeHtml(initialsFromAlt(alt))}
        </td>
      </tr>
    </table>`;
}

function initialsFromAlt(value) {
  return String(value || "SF")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() || "")
    .join("") || "SF";
}

function normalizedColor(value) {
  const raw = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : "#2663ff";
}

function linkStyle(color) {
  return `color:${normalizedColor(color)};text-decoration:none;`;
}

function stripProtocol(value) {
  return String(value || "").replace(/^https?:\/\//i, "");
}

function ensureProtocol(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "https://signatureforge.ai";
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

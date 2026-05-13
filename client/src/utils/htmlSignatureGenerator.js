const LAYOUT_META = {
  executive: { name: "Executive", accentWeight: 700, label: "Schedule a strategy call" },
  contractor: { name: "Contractor", accentWeight: 600, label: "Request a quote" },
  minimal: { name: "Minimal", accentWeight: 500, label: "Connect" },
  corporate: { name: "Corporate", accentWeight: 700, label: "Visit our website" },
  "mobile-compact": { name: "Mobile Compact", accentWeight: 600, label: "Tap to connect" },
  "premium-split": { name: "Corporate Split", accentWeight: 700, label: "Discover" },
  classic: { name: "Classic", accentWeight: 500, label: "Call" },
  modern: { name: "Modern", accentWeight: 600, label: "Connect" },
  compact: { name: "Compact", accentWeight: 500, label: "Reach" }
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
    companyName: "Signature Pilot AI",
    phone: "+1 (555) 123-4567",
    email: "hello@signatureforge.ai",
    website: "signatureforge.ai",
    location: "Winnipeg, MB",
    linkedinUrl: "https://linkedin.com",
    facebookUrl: "",
    instagramUrl: "",
    brandColor: "#2663ff",
    layout: "minimal",
    layoutManuallySelected: false,
    layoutAutoSelected: false,
    tier: "free",
    includeBranding: true,
    logoSize: "medium",
    logoFit: "contain",
    logoShape: "rounded",
    customLogoWidth: 72,
    showDivider: false,
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
  const layoutStyles = getLayoutStyles(sanitized.layout, brandColor);
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
  const isMobileCompact = sanitized.layout === "mobile-compact";
  const columnCount = sanitized.showDivider ? 3 : 2;
  const dividerMarkup = sanitized.showDivider
    ? `<td valign="top" style="${cellResetStyle()}width:18px;padding:0 12px;"><div style="width:1px;height:100%;min-height:96px;background:${fadeColor(brandColor, 0.24)};font-size:0;line-height:0;">&nbsp;</div></td>`
    : "";
  const meta = getLayoutMeta(sanitized.layout);
  const shouldIncludeBranding = sanitized.tier === "free" ? true : Boolean(sanitized.includeBranding);
  const brandingColumnCount = isMobileCompact ? 1 : columnCount;
  const brandingRow = shouldIncludeBranding
    ? `
      <tr>
        <td colspan="${brandingColumnCount}" style="${cellResetStyle()}padding-top:12px;">
          <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;background:${fadeColor(brandColor, 0.06)};border-radius:12px;">
            <tbody>
            <tr>
              <td align="${isMobileCompact ? "center" : "left"}" style="${cellResetStyle()}padding:10px 12px 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#6b7280;">
                Created with <a href="https://signature-forge-ai.vercel.app" style="color:${brandColor};text-decoration:none;font-weight:700;">Signature Pilot AI</a>
              </td>
            </tr>
            <tr>
              <td align="${isMobileCompact ? "center" : "left"}" style="${cellResetStyle()}padding:2px 12px 10px 12px;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:15px;color:#7b8498;">
                Free signature powered by <a href="https://signature-forge-ai.vercel.app" style="color:${brandColor};text-decoration:none;font-weight:700;">Signature Pilot AI</a>
              </td>
            </tr>
            </tbody>
          </table>
        </td>
      </tr>`
    : "";
  const premiumRibbon = sanitized.layout === "premium-split"
    ? `<tr><td colspan="${columnCount}" style="${cellResetStyle()}padding-bottom:10px;"><span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${fadeColor(brandColor, 0.12)};color:${brandColor};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">Premium split layout</span></td></tr>`
    : "";

  if (isMobileCompact) {
    const mobileContactRows = buildMobileCompactRows(sanitized);
    const mobileSocialRows = buildMobileCompactSocialRows(sanitized);
    return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;max-width:340px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
  <tr>
    <td align="center" valign="top" style="${cellResetStyle()}padding:0;">
      <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}width:100%;">
        <tbody>
        <tr>
          <td align="center" style="${cellResetStyle()}padding:0 0 12px 0;">
            ${logoMarkup}
          </td>
        </tr>
        ${photoMarkup ? `<tr><td align="center" style="${cellResetStyle()}padding:0 0 10px 0;">${photoMarkup}</td></tr>` : ""}
        <tr>
          <td align="center" style="${cellResetStyle()}font-size:19px;line-height:24px;font-weight:700;color:#111827;padding:0 0 4px 0;">
            ${escapeHtml(sanitized.fullName)}
          </td>
        </tr>
        <tr>
          <td align="center" style="${cellResetStyle()}font-size:12px;line-height:18px;font-weight:${meta.accentWeight};color:${brandColor};padding:0 0 10px 0;">
            ${escapeHtml(buildTitleLine(sanitized))}
          </td>
        </tr>
        ${mobileContactRows}
        ${mobileSocialRows}
        <tr>
          <td align="center" style="${cellResetStyle()}padding-top:12px;font-size:12px;line-height:18px;color:#374151;">
            <a href="${ensureProtocol(sanitized.website)}" style="color:${brandColor};text-decoration:none;font-weight:600;">${escapeHtml(sanitized.ctaText || meta.label)}</a>
          </td>
        </tr>
        <tr>
          <td align="center" style="${cellResetStyle()}padding-top:8px;font-size:10px;line-height:15px;color:#6b7280;">
            ${escapeHtml(sanitized.disclaimer)}
          </td>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>
  ${brandingRow}
  </tbody>
</table>`.trim();
  }

  return `
<table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <tbody>
  ${premiumRibbon}
  <tr>
    <td valign="top" style="${cellResetStyle()}padding:0;">
      ${logoMarkup}
      ${photoMarkup}
    </td>
    ${dividerMarkup}
    <td valign="top" style="${cellResetStyle()}padding:0 0 0 12px;">
      <table cellpadding="0" cellspacing="0" border="0" style="${tableResetStyle()}">
        <tbody>
        <tr>
          <td style="${cellResetStyle()}font-size:${layoutStyles.nameSize}px;line-height:${layoutStyles.nameLine}px;font-weight:700;color:#111827;padding:${layoutStyles.nameSpacing};">
            ${escapeHtml(sanitized.fullName)}
          </td>
        </tr>
        <tr>
          <td style="${cellResetStyle()}font-size:${layoutStyles.titleSize}px;line-height:${layoutStyles.titleLine}px;font-weight:${meta.accentWeight};color:${layoutStyles.titleColor};padding:0 0 3px 0;">
            ${escapeHtml(buildTitleLine(sanitized))}
          </td>
        </tr>
        ${contactRows}
        ${socialRows}
        <tr>
          <td style="${cellResetStyle()}padding-top:10px;font-size:12px;line-height:18px;color:#374151;">
            <a href="${ensureProtocol(sanitized.website)}" style="color:${brandColor};text-decoration:none;font-weight:${layoutStyles.ctaWeight};">${escapeHtml(sanitized.ctaText || meta.label)}</a>
          </td>
        </tr>
        <tr>
          <td style="${cellResetStyle()}padding-top:8px;font-size:11px;line-height:16px;color:#6b7280;">
            ${escapeHtml(sanitized.disclaimer)}
          </td>
        </tr>
        </tbody>
      </table>
    </td>
  </tr>
  ${brandingRow}
  </tbody>
</table>`.trim();
}

function applyTierRules(draft) {
  if (draft.tier !== "pro") {
    return {
      ...draft,
      includeBranding: true,
      layout: draft.layout === "mobile-compact" ? "mobile-compact" : draft.layout === "minimal" ? "minimal" : "executive",
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

function getLayoutStyles(layout, brandColor) {
  switch (layout) {
    case "executive":
      return {
        nameSize: 22,
        nameLine: 28,
        titleSize: 14,
        titleLine: 20,
        titleColor: brandColor,
        ctaWeight: 700,
        nameSpacing: "0 0 2px 0"
      };
    case "contractor":
      return {
        nameSize: 21,
        nameLine: 26,
        titleSize: 13,
        titleLine: 19,
        titleColor: "#8f4f0f",
        ctaWeight: 700,
        nameSpacing: "0 0 4px 0"
      };
    case "corporate":
    case "premium-split":
      return {
        nameSize: 22,
        nameLine: 28,
        titleSize: 13,
        titleLine: 19,
        titleColor: "#334155",
        ctaWeight: 700,
        nameSpacing: "0 0 3px 0"
      };
    case "minimal":
      return {
        nameSize: 19,
        nameLine: 24,
        titleSize: 12,
        titleLine: 18,
        titleColor: "#4b5563",
        ctaWeight: 600,
        nameSpacing: "0 0 4px 0"
      };
    default:
      return {
        nameSize: layout === "compact" ? 18 : 22,
        nameLine: layout === "compact" ? 22 : 28,
        titleSize: 14,
        titleLine: 20,
        titleColor: brandColor,
        ctaWeight: 600,
        nameSpacing: "0 0 2px 0"
      };
  }
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

function buildMobileCompactRows(draft) {
  const rows = [];
  if (draft.phone) {
    rows.push(buildMobileCompactRow(`<a href="tel:${sanitizePhoneHref(draft.phone)}" style="${linkStyle(draft.brandColor)}font-weight:600;">${escapeHtml(draft.phone)}</a>`));
  }
  if (draft.email) {
    rows.push(buildMobileCompactRow(`<a href="mailto:${escapeAttribute(draft.email)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(draft.email)}</a>`));
  }
  if (draft.website) {
    rows.push(buildMobileCompactRow(`<a href="${ensureProtocol(draft.website)}" style="${linkStyle(draft.brandColor)}">${escapeHtml(stripProtocol(draft.website))}</a>`));
  }
  if (draft.location) {
    rows.push(buildMobileCompactRow(escapeHtml(draft.location), "#4b5563"));
  }
  return rows.join("");
}

function buildMobileCompactSocialRows(draft) {
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

  return buildMobileCompactRow(links.join(' <span style="color:#9ca3af;">|</span> '));
}

function buildRow(label, value) {
  return `
    <tr>
      <td style="${cellResetStyle()}padding-top:4px;font-size:12px;line-height:18px;color:#4b5563;">
        <span style="display:inline-block;min-width:62px;font-weight:700;color:#111827;">${label}:</span> ${value}
      </td>
    </tr>`;
}

function buildMobileCompactRow(value, color = "#4b5563") {
  return `
    <tr>
      <td align="center" style="${cellResetStyle()}padding-top:6px;font-size:12px;line-height:18px;color:${color};">
        ${value}
      </td>
    </tr>`;
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
      />`;
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

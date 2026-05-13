import React, { useMemo } from "react";
import { generateSignatureArtifacts, getLayoutMeta } from "../utils/htmlSignatureGenerator";

const QUICK_LAYOUTS = [
  { value: "classic", label: "Classic", pro: false },
  { value: "corporate", label: "Corporate", pro: true },
  { value: "minimal", label: "Minimal", pro: false },
  { value: "premium-split", label: "Premium", pro: true },
  { value: "mobile-compact", label: "Mobile Compact", pro: false }
];

const LOGO_SIZE_OPTIONS = [
  { value: "small", label: "Small", pro: false },
  { value: "medium", label: "Medium", pro: false },
  { value: "large", label: "Large", pro: false },
  { value: "extra-large", label: "Extra Large", pro: true },
  { value: "custom", label: "Custom", pro: true }
];

export default function SignaturePreview({
  draft,
  effectiveDraft,
  onLayoutChange,
  onDividerToggle,
  onLogoSizeChange,
  onCustomLogoWidthChange,
  onBrandingToggle,
  onRevertToOriginal,
  showAutoLayoutNotice
}) {
  const artifacts = useMemo(() => generateSignatureArtifacts(draft), [draft]);
  const layoutMeta = getLayoutMeta(artifacts.effectiveDraft.layout);
  const isFree = effectiveDraft.tier === "free";
  const titleCompanyLength = `${effectiveDraft.jobTitle || ""} ${effectiveDraft.companyName || ""}`.trim().length;
  const showMobileWrapSuggestion = titleCompanyLength >= 36;

  return (
    <section className="panel preview-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Live preview</p>
          <h2>Email-safe signature</h2>
        </div>
        <span className={`tier-pill ${draft.tier === "pro" ? "tier-pill-pro" : ""}`}>
          {draft.tier === "pro" ? "Pro mode" : "Free mode"}
        </span>
      </div>

      <div className="preview-controls-card">
        <div className="preview-controls-header">
          <div>
            <h3>Preview quick controls</h3>
            <p className="support-copy">Adjust the live signature here, then copy the finished version below.</p>
          </div>
          <button className="button button-secondary button-inline" type="button" onClick={onRevertToOriginal}>
            Revert to Original
          </button>
        </div>

        <div className="field-grid field-grid-tight preview-controls-grid">
          <label className="field">
            <span>Layout</span>
            <select aria-label="Preview layout" value={artifacts.effectiveDraft.layout} onChange={(event) => onLayoutChange(event.target.value)}>
              {QUICK_LAYOUTS.map((option) => (
                <option key={option.value} disabled={isFree && option.pro} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="locked-copy">
              {isFree
                ? "Free Mode includes Classic, Minimal, and Mobile Compact. Corporate and Premium unlock with Pro."
                : "Use Mobile Compact if your signature looks squeezed in mobile email apps."}
            </small>
            {showAutoLayoutNotice ? <small className="support-copy">Mobile Compact selected for better mobile email compatibility.</small> : null}
            {showMobileWrapSuggestion ? <small className="locked-copy">Your title/company may wrap on mobile. Mobile Compact is recommended.</small> : null}
          </label>

          <label className="field">
            <span>Divider</span>
            <select
              aria-label="Preview divider"
              disabled={isFree || artifacts.effectiveDraft.layout === "mobile-compact"}
              value={artifacts.effectiveDraft.showDivider ? "on" : "off"}
              onChange={(event) => onDividerToggle(event.target.value === "on")}
            >
              <option value="off">Off</option>
              <option value="on">On</option>
            </select>
            <small className="locked-copy">
              {isFree || artifacts.effectiveDraft.layout === "mobile-compact"
                ? "Divider stays off in Free Mode and is not used in Mobile Compact."
                : "Optional Pro visual divider."}
            </small>
          </label>

          <label className="field">
            <span>Branding</span>
            <select
              aria-label="Preview branding"
              disabled={isFree}
              value={artifacts.includeBranding ? "include" : "remove"}
              onChange={(event) => onBrandingToggle(event.target.value === "include")}
            >
              <option value="include">Include</option>
              <option value="remove">Remove</option>
            </select>
            <small className="locked-copy">{isFree ? "Signature Pilot AI branding included." : "Pro can export clean unbranded HTML."}</small>
          </label>

          <label className="field">
            <span>Logo size</span>
            <select aria-label="Preview logo size" value={artifacts.effectiveDraft.logoSize} onChange={(event) => onLogoSizeChange(event.target.value)}>
              {LOGO_SIZE_OPTIONS.map((option) => (
                <option key={option.value} disabled={isFree && option.pro} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="locked-copy">
              {isFree ? "Free Mode supports Small, Medium, and Large. Extra Large and Custom are Pro features." : "Logo size updates the live preview and copied signature."}
            </small>
          </label>

          {artifacts.effectiveDraft.logoSize === "custom" ? (
            <label className="field">
              <span>Custom logo width</span>
              <input
                aria-label="Preview custom logo width"
                max="180"
                min="40"
                type="number"
                value={artifacts.effectiveDraft.customLogoWidth}
                onChange={(event) => onCustomLogoWidthChange(event.target.value)}
              />
              <small className="support-copy">Range: 40px to 180px.</small>
            </label>
          ) : null}
        </div>
      </div>

      <div className="preview-meta">
        <span>{layoutMeta.name}</span>
        <span>{artifacts.effectiveDraft.showDivider ? "Divider on" : "Divider off"}</span>
        <span>No visible borders</span>
        <span>{artifacts.includeBranding ? "Signature Pilot AI branding included" : "Branding removed"}</span>
      </div>

      <div className="signature-preview-surface" dangerouslySetInnerHTML={{ __html: artifacts.previewHtml }} />

      {draft.tier === "free" ? <div className="inline-banner">Signature Pilot AI branding included in Free Mode.</div> : null}
    </section>
  );
}

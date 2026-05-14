import React, { useMemo } from "react";
import { generateSignatureArtifacts, getLayoutMeta } from "../utils/htmlSignatureGenerator";

export default function SignaturePreview({
  draft,
  effectiveDraft,
  previewZoom,
  previewDevice,
  onPreviousVariant,
  onNextVariant,
  onPreviewZoomChange,
  onPreviewDeviceChange
}) {
  const artifacts = useMemo(() => generateSignatureArtifacts({ ...draft, renderMode: previewDevice }), [draft, previewDevice]);
  const layoutMeta = getLayoutMeta(artifacts.effectiveDraft.layout);
  const zoomFactor = Number(previewZoom) / 100;
  const previewShellMaxWidth = previewDevice === "mobile" ? Math.round(360 * zoomFactor) : Math.round(1100 * zoomFactor);
  const previewScaleStyle = {
    transform: `scale(${zoomFactor})`,
    transformOrigin: previewDevice === "mobile" ? "top center" : "top left",
    width: `${100 / zoomFactor}%`
  };

  return (
    <section className="workspace-preview-shell">
      <div className="workspace-preview-toolbar">
        <div className="workspace-preview-status">
          <div>
            <p className="eyebrow">Preview</p>
            <h2>Live email preview</h2>
          </div>
          <div className="workspace-preview-badges">
            <span className="tier-pill">{artifacts.effectiveDraft.variantLabel}</span>
          </div>
        </div>

        <div className="workspace-preview-actions">
          <div className="workspace-segmented-control" role="tablist" aria-label="Preview device">
            <button
              className={`workspace-segment-button ${previewDevice === "desktop" ? "workspace-segment-button-active" : ""}`}
              type="button"
              onClick={() => onPreviewDeviceChange("desktop")}
            >
              Desktop
            </button>
            <button
              className={`workspace-segment-button ${previewDevice === "mobile" ? "workspace-segment-button-active" : ""}`}
              type="button"
              onClick={() => onPreviewDeviceChange("mobile")}
            >
              Mobile
            </button>
          </div>

          <label className="workspace-zoom-select">
            <span>Zoom</span>
            <select aria-label="Preview zoom" value={previewZoom} onChange={(event) => onPreviewZoomChange(event.target.value)}>
              <option value="75">75%</option>
              <option value="90">90%</option>
              <option value="100">100%</option>
              <option value="125">125%</option>
            </select>
          </label>
        </div>
      </div>

        <div className="preview-meta">
          <span>{layoutMeta.name}</span>
          <span className="workspace-variant-switcher">
            <button
              aria-label="Previous variant"
              className="workspace-variant-arrow"
              type="button"
              onClick={onPreviousVariant}
            >
              ←
            </button>
            <span>{`Variant ${artifacts.effectiveDraft.templateVariant} of 12`}</span>
            <button aria-label="Next variant" className="workspace-variant-arrow" type="button" onClick={onNextVariant}>
              →
            </button>
          </span>
          <span>{artifacts.effectiveDraft.showDivider ? "Divider on" : "Divider off"}</span>
          <span>No visible borders</span>
          <span>{artifacts.includeBranding ? "Signature Pilot AI branding included" : "Branding removed"}</span>
        {artifacts.effectiveDraft.previewUsesMobileCompact ? <span>Mobile Compact recommended for this preview</span> : null}
      </div>

      <div
        className={`workspace-email-stage workspace-email-stage-${previewDevice}`}
        data-preview-device={previewDevice}
        data-preview-zoom={previewZoom}
      >
        <div className="workspace-email-shell" style={{ maxWidth: `${previewShellMaxWidth}px` }}>
          <div className="workspace-email-header">
            <div className="workspace-email-row">
              <strong>From</strong>
              <span>{effectiveDraft.fullName || "James Worthing"} &lt;{effectiveDraft.email || "James@signaturepilotai.com"}&gt;</span>
            </div>
            <div className="workspace-email-row">
              <strong>To</strong>
              <span>client@example.com</span>
            </div>
            <div className="workspace-email-row">
              <strong>Subject</strong>
              <span>Quick follow-up and next steps</span>
            </div>
          </div>

          <div className="workspace-email-body">
            <p>Hi there,</p>
            <p>I wanted to send over a quick follow-up with the contact details and next step link below.</p>
            <p>Best regards,</p>
            <div className="workspace-preview-scale" style={previewScaleStyle}>
              <div className="signature-preview-surface" dangerouslySetInnerHTML={{ __html: artifacts.previewHtml }} />
            </div>
          </div>
        </div>
      </div>

      {draft.tier === "free" ? <div className="inline-banner">Signature Pilot AI branding included in Free Mode.</div> : null}
    </section>
  );
}

import React, { useMemo } from "react";
import { generateSignatureArtifacts, getLayoutMeta } from "../utils/htmlSignatureGenerator";

export default function SignaturePreview({
  draft,
  effectiveDraft,
  previewZoom,
  previewDevice,
  onPreviewZoomChange,
  onPreviewDeviceChange
}) {
  const artifacts = useMemo(() => generateSignatureArtifacts(draft), [draft]);
  const layoutMeta = getLayoutMeta(artifacts.effectiveDraft.layout);
  const zoomFactor = Number(previewZoom) / 100;
  const previewShellMaxWidth = previewDevice === "mobile" ? Math.round(390 * zoomFactor) : Math.round(960 * zoomFactor);

  return (
    <section className="workspace-preview-shell">
      <div className="workspace-preview-toolbar">
        <div className="workspace-preview-status">
          <div>
            <p className="eyebrow">Preview</p>
            <h2>Live email preview</h2>
          </div>
          <div className="workspace-preview-badges">
            <span className="tier-pill">{layoutMeta.name}</span>
            <span className={`tier-pill ${effectiveDraft.tier === "pro" ? "tier-pill-pro" : ""}`}>
              {effectiveDraft.tier === "pro" ? "Pro mode" : "Free mode"}
            </span>
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
              <option value="80">80%</option>
              <option value="90">90%</option>
              <option value="100">100%</option>
              <option value="110">110%</option>
            </select>
          </label>
        </div>
      </div>

      <div className="preview-meta">
        <span>{layoutMeta.name}</span>
        <span>{artifacts.effectiveDraft.showDivider ? "Divider on" : "Divider off"}</span>
        <span>No visible borders</span>
        <span>{artifacts.includeBranding ? "Signature Pilot AI branding included" : "Branding removed"}</span>
      </div>

      <div className={`workspace-email-stage workspace-email-stage-${previewDevice}`}>
        <div className="workspace-email-shell" style={{ maxWidth: `${previewShellMaxWidth}px` }}>
          <div className="workspace-email-header">
            <div className="workspace-email-row">
              <strong>From</strong>
              <span>{effectiveDraft.fullName || "Jordan Wells"} &lt;{effectiveDraft.email || "hello@signatureforge.ai"}&gt;</span>
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
            <div className="workspace-preview-scale">
              <div className="signature-preview-surface" dangerouslySetInnerHTML={{ __html: artifacts.previewHtml }} />
            </div>
          </div>
        </div>
      </div>

      {draft.tier === "free" ? <div className="inline-banner">Signature Pilot AI branding included in Free Mode.</div> : null}
    </section>
  );
}

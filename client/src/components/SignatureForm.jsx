import React from "react";

const SAMPLE_OPTIONS = [
  { key: "founder", label: "Startup Founder", copy: "Fast-moving SaaS founder sample", template: "Minimal" },
  { key: "contractor", label: "Contractor", copy: "Service-first example with quote CTA", template: "Classic" },
  { key: "executive", label: "Executive", copy: "Boardroom-ready leadership example", template: "Corporate" }
];

const FIELD_SECTIONS = [
  {
    title: "Contact details",
    description: "Start with the essentials your recipients click first.",
    fields: [
      ["fullName", "Full name"],
      ["jobTitle", "Job title"],
      ["companyName", "Company name"],
      ["phone", "Phone number"],
      ["email", "Email"],
      ["website", "Website"],
      ["location", "Address or location"]
    ]
  },
  {
    title: "Social links",
    description: "Add trust-building destinations when Pro is enabled.",
    fields: [
      ["linkedinUrl", "LinkedIn URL"],
      ["facebookUrl", "Facebook URL"],
      ["instagramUrl", "Instagram URL"]
    ]
  }
];

const MESSAGE_FIELDS = [
  ["ctaText", "CTA text", "text"],
  ["disclaimer", "Disclaimer", "textarea"]
];

export default function SignatureForm({
  draft,
  onApplySampleProfile,
  onFieldChange,
  onColorChange,
  onTierChange,
  onFileSelect,
  onFileRemove
}) {
  const isFree = draft.tier === "free";

  return (
    <section className="panel builder-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Signature builder</p>
          <h2>Build your signature</h2>
        </div>
        <label className="tier-toggle">
          <span>Mode</span>
          <select value={draft.tier} onChange={(event) => onTierChange(event.target.value)}>
            <option value="free">Free Mode</option>
            <option value="pro">Pro Mode</option>
          </select>
        </label>
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <div>
            <h3>Start faster</h3>
            <p className="support-copy">Load polished sample data, then tailor it to your brand.</p>
          </div>
        </div>
        <div className="sample-grid">
          {SAMPLE_OPTIONS.map((sample) => (
            <button key={sample.key} className="sample-card" type="button" onClick={() => onApplySampleProfile(sample.key)}>
              <strong>{sample.label}</strong>
              <span>{sample.copy}</span>
              <small>{sample.template} sample</small>
            </button>
          ))}
        </div>
      </div>

      {FIELD_SECTIONS.map((section) => (
        <div key={section.title} className="form-section">
          <div className="form-section-heading">
            <div>
              <h3>{section.title}</h3>
              <p className="support-copy">{section.description}</p>
            </div>
          </div>
          <div className="field-grid">
            {section.fields.map(([key, label]) => {
              const locked = isFree && (key === "location" || key.endsWith("Url"));
              return (
                <label key={key} className="field">
                  <span>{label}</span>
                  <input disabled={locked} value={draft[key]} onChange={(event) => onFieldChange(key, event.target.value)} />
                  {locked ? <small className="locked-copy">Upgrade to Pro to unlock this field.</small> : null}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="form-section">
        <div className="form-section-heading">
          <div>
            <h3>Signature messaging</h3>
            <p className="support-copy">Everything shown in the signature stays editable here, including CTA and disclaimer copy.</p>
          </div>
        </div>
        <div className="field-grid">
          {MESSAGE_FIELDS.map(([key, label, type]) => (
            <label key={key} className="field">
              <span>{label}</span>
              {type === "textarea" ? (
                <textarea className="studio-textarea" rows="3" value={draft[key]} onChange={(event) => onFieldChange(key, event.target.value)} />
              ) : (
                <input value={draft[key]} onChange={(event) => onFieldChange(key, event.target.value)} />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <div>
            <h3>Brand styling</h3>
            <p className="support-copy">Set the brand color here, then fine-tune layout and exports beside the live preview.</p>
          </div>
        </div>
        <div className="field-grid">
          <label className="field">
            <span>Brand color</span>
            <input type="color" value={draft.brandColor} onChange={(event) => onColorChange(event.target.value)} />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <div>
            <h3>Brand assets</h3>
            <p className="support-copy">Upload a clean logo here, then adjust its size and layout beside the live preview.</p>
          </div>
        </div>
        <div className="upload-grid">
          <AssetUploader
            label="Logo upload"
            value={draft.logoDataUrl}
            inputId="logo-upload"
            onFileSelect={(file) => onFileSelect("logoDataUrl", file)}
            onFileRemove={() => onFileRemove("logoDataUrl")}
          />
          <div className="asset-uploader cross-sell-card">
            <div className="asset-uploader-header">
              <strong>Pilot AI Family</strong>
            </div>
            <p className="support-copy">Need a logo? Logo Pilot AI will help you create, refine, and blend logo concepts.</p>
            <a className="button button-secondary" href="#">
              Explore Logo Pilot AI
            </a>
          </div>
        </div>
        {isFree ? <p className="locked-banner">Free Mode: Signature Pilot AI branding included and advanced customization is locked until upgrade.</p> : null}
      </div>
    </section>
  );
}

function AssetUploader({ label, value, inputId, disabled = false, onFileSelect, onFileRemove }) {
  return (
    <div className="asset-uploader">
      <div className="asset-uploader-header">
        <strong>{label}</strong>
        {value && !disabled ? (
          <button className="text-button" type="button" onClick={onFileRemove}>
            Remove
          </button>
        ) : null}
      </div>
      <label className={`upload-dropzone ${disabled ? "upload-dropzone-disabled" : ""}`} htmlFor={inputId}>
        <input
          key={`${inputId}-${value ? "filled" : "empty"}`}
          id={inputId}
          accept="image/*"
          disabled={disabled}
          type="file"
          onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
        />
        <span>{disabled ? "Upgrade to unlock" : value ? "Replace image" : "Choose image"}</span>
      </label>
      {value ? <img alt={label} className="asset-preview" src={value} /> : <p className="support-copy">PNG, JPG, or SVG works well.</p>}
    </div>
  );
}

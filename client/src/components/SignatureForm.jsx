import React from "react";

const SAMPLE_OPTIONS = [
  { key: "founder", label: "Startup Founder", copy: "Fast-moving SaaS founder sample", template: "Minimal" },
  { key: "contractor", label: "Contractor", copy: "Service-first example with quote CTA", template: "Contractor" },
  { key: "executive", label: "Executive", copy: "Boardroom-ready leadership example", template: "Executive" }
];

const TEMPLATE_OPTIONS = [
  { value: "executive", label: "Executive", copy: "High-trust leadership signature", pro: false },
  { value: "minimal", label: "Minimal", copy: "Clean and modern for startups", pro: false },
  { value: "contractor", label: "Contractor", copy: "Built for service calls and quotes", pro: true },
  { value: "corporate", label: "Corporate", copy: "Brand-forward team presentation", pro: true },
  { value: "mobile-compact", label: "Mobile Compact", copy: "Best for narrow mobile email apps", pro: false }
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
  effectiveLayout,
  showAutoLayoutNotice,
  onApplySampleProfile,
  onFieldChange,
  onColorChange,
  onLayoutChange,
  onTierChange,
  onDividerToggle,
  onLogoSizeChange,
  onCustomLogoWidthChange,
  onBrandingToggle,
  onFileSelect,
  onFileRemove
}) {
  const isFree = draft.tier === "free";
  const customSizeLocked = isFree && (draft.logoSize === "custom" || draft.logoSize === "extra-large");
  const titleCompanyLength = `${draft.jobTitle || ""} ${draft.companyName || ""}`.trim().length;
  const showMobileWrapSuggestion = titleCompanyLength >= 36;

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

      <div className="form-section">
        <div className="form-section-heading">
          <div>
            <h3>Choose a template</h3>
            <p className="support-copy">Pick the look first, then refine the details below.</p>
          </div>
        </div>
        <div className="template-grid">
          {TEMPLATE_OPTIONS.map((template) => {
            const locked = isFree && template.pro;
            const active = effectiveLayout === template.value;
            return (
              <button
                key={template.value}
                className={`template-card ${active ? "template-card-active" : ""} ${locked ? "template-card-locked" : ""}`}
                disabled={locked}
                type="button"
                onClick={() => onLayoutChange(template.value)}
              >
                <div className={`template-thumb template-thumb-${template.value}`}>
                  <span className="template-thumb-bar" />
                  <span className="template-thumb-line template-thumb-line-strong" />
                  <span className="template-thumb-line" />
                  <span className="template-thumb-line template-thumb-line-short" />
                </div>
                <strong>{template.label}</strong>
                <span>{template.copy}</span>
                <small>{locked ? "Pro template" : active ? "Selected" : "Available"}</small>
              </button>
            );
          })}
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
            <h3>Visual controls</h3>
            <p className="support-copy">Tune spacing, logo size, and brand presentation without touching HTML.</p>
          </div>
        </div>
        <div className="field-grid">
          <label className="field">
            <span>Brand color</span>
            <input type="color" value={draft.brandColor} onChange={(event) => onColorChange(event.target.value)} />
          </label>

          <label className="field">
            <span>Layout</span>
            <select value={effectiveLayout} onChange={(event) => onLayoutChange(event.target.value)}>
              <option value="executive">Executive</option>
              <option value="minimal">Minimal</option>
              <option disabled={isFree} value="contractor">Contractor</option>
              <option disabled={isFree} value="corporate">Corporate</option>
              <option value="mobile-compact">Mobile Compact</option>
            </select>
            <small className="locked-copy">
              {isFree
                ? "Free Mode includes Executive, Minimal, and Mobile Compact. Contractor and Corporate unlock with Pro."
                : "Use Mobile Compact if your signature looks squeezed in mobile email apps."}
            </small>
            {showAutoLayoutNotice ? <small className="support-copy">Mobile Compact selected for better mobile email compatibility.</small> : null}
            {showMobileWrapSuggestion ? <small className="locked-copy">Your title/company may wrap on mobile. Mobile Compact is recommended.</small> : null}
          </label>

          <label className="field">
            <span>Logo size</span>
            <select value={draft.logoSize} onChange={(event) => onLogoSizeChange(event.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option disabled={isFree} value="extra-large">Extra Large</option>
              <option disabled={isFree} value="custom">Custom</option>
            </select>
            {isFree ? <small className="locked-copy">Free Mode supports Small, Medium, and Large. Extra Large and Custom are Pro features.</small> : null}
          </label>

          {draft.logoSize === "custom" ? (
            <label className="field">
              <span>Custom logo width</span>
              <input
                disabled={customSizeLocked}
                max="180"
                min="40"
                type="number"
                value={draft.customLogoWidth}
                onChange={(event) => onCustomLogoWidthChange(event.target.value)}
              />
              <small className="locked-copy">
                {customSizeLocked ? "Upgrade to Pro to set a custom width." : "Range: 40px to 180px."}
              </small>
            </label>
          ) : null}

          <label className="field field-checkbox">
            <span>Pro visual divider</span>
            <input disabled={isFree || draft.layout === "mobile-compact"} checked={draft.showDivider} type="checkbox" onChange={(event) => onDividerToggle(event.target.checked)} />
            {isFree || draft.layout === "mobile-compact" ? <small className="locked-copy">Advanced layout controls stay off in Free Mode and are not used in Mobile Compact.</small> : null}
          </label>

          <label className="field field-checkbox">
            <span>Remove Signature Pilot AI branding</span>
            <input
              checked={!draft.includeBranding}
              disabled={isFree}
              type="checkbox"
              onChange={(event) => onBrandingToggle(!event.target.checked)}
            />
            {isFree ? <small className="locked-copy">Signature Pilot AI branding included.</small> : null}
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <div>
            <h3>Brand assets</h3>
            <p className="support-copy">Add your logo now. Profile photos and deeper brand blending stay in Pro.</p>
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
          <AssetUploader
            disabled={isFree}
            label="Profile photo"
            value={draft.photoDataUrl}
            inputId="photo-upload"
            onFileSelect={(file) => onFileSelect("photoDataUrl", file)}
            onFileRemove={() => onFileRemove("photoDataUrl")}
          />
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
      {value ? <img alt={label} className="asset-preview" src={value} /> : <p className="support-copy">{disabled ? "Profile photos are a Pro feature." : "PNG, JPG, or SVG works well."}</p>}
    </div>
  );
}

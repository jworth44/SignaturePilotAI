import React from "react";

const FIELD_SECTIONS = [
  {
    title: "Contact details",
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
    fields: [
      ["linkedinUrl", "LinkedIn URL"],
      ["facebookUrl", "Facebook URL"],
      ["instagramUrl", "Instagram URL"]
    ]
  }
];

export default function SignatureForm({
  draft,
  effectiveLayout,
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

      {FIELD_SECTIONS.map((section) => (
        <div key={section.title} className="form-section">
          <h3>{section.title}</h3>
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
        <h3>Visual controls</h3>
        <div className="field-grid">
          <label className="field">
            <span>Brand color</span>
            <input type="color" value={draft.brandColor} onChange={(event) => onColorChange(event.target.value)} />
          </label>

          <label className="field">
            <span>Layout</span>
            <select disabled={isFree} value={effectiveLayout} onChange={(event) => onLayoutChange(event.target.value)}>
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="compact">Compact</option>
              <option value="premium-split">Premium Split Line</option>
            </select>
            {isFree ? <small className="locked-copy">Free Mode uses the basic SignatureForge AI layout.</small> : null}
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
            <span>Vertical divider</span>
            <input disabled={isFree} checked={draft.showDivider} type="checkbox" onChange={(event) => onDividerToggle(event.target.checked)} />
            {isFree ? <small className="locked-copy">Advanced layout controls are locked in Free Mode.</small> : null}
          </label>

          <label className="field field-checkbox">
            <span>Remove SignatureForge AI branding</span>
            <input
              checked={!draft.includeBranding}
              disabled={isFree}
              type="checkbox"
              onChange={(event) => onBrandingToggle(!event.target.checked)}
            />
            {isFree ? <small className="locked-copy">SignatureForge AI branding included.</small> : null}
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3>Brand assets</h3>
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
        {isFree ? <p className="locked-banner">Free Mode: SignatureForge AI branding included and advanced customization is locked until upgrade.</p> : null}
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

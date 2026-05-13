import React from "react";

const SAMPLE_OPTIONS = [
  { key: "founder", label: "Startup Founder", copy: "Fast-moving SaaS founder sample", template: "Minimal" },
  { key: "contractor", label: "Contractor", copy: "Service-first example with quote CTA", template: "Professional Classic" },
  { key: "executive", label: "Executive", copy: "Boardroom-ready leadership example", template: "Corporate" }
];

const CONTACT_FIELDS = [
  ["fullName", "Full name"],
  ["jobTitle", "Job title"],
  ["companyName", "Company name"],
  ["phone", "Phone number"],
  ["email", "Email"],
  ["website", "Website"],
  ["location", "Address or location"]
];

const SOCIAL_FIELDS = [
  ["linkedinUrl", "LinkedIn URL"],
  ["facebookUrl", "Facebook URL"],
  ["instagramUrl", "Instagram URL"]
];

export default function SignatureForm({
  compatibilityChecklist,
  draft,
  healthScore,
  smartSetup,
  smartSetupOptions,
  smartSetupPreview,
  onApplySampleProfile,
  onApplySmartSetup,
  onFieldChange,
  onGenerateSmartSetup,
  onTierChange,
  onSmartSetupChange
}) {
  const isFree = draft.tier === "free";

  return (
    <div className="workspace-form-stack">
      <section className="workspace-panel-section">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">Content</p>
            <h3>Signature details</h3>
          </div>
          <label className="tier-toggle">
            <span>Mode</span>
            <select value={draft.tier} onChange={(event) => onTierChange(event.target.value)}>
              <option value="free">Free Mode</option>
              <option value="pro">Pro Mode</option>
            </select>
          </label>
        </div>

        <div className="workspace-metrics-grid">
          <article className="workspace-metric-card workspace-metric-card-score">
            <span className="workspace-metric-label">Signature Health Score</span>
            <strong>{healthScore.score}/100</strong>
            <p className="support-copy">A quick quality check based on clarity, contact coverage, branding, and mobile friendliness.</p>
            <ul className="workspace-checklist">
              {healthScore.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </article>

          <article className="workspace-metric-card">
            <span className="workspace-metric-label">Client Compatibility Checklist</span>
            <ul className="workspace-checklist workspace-checklist-tight">
              {compatibilityChecklist.map((item) => (
                <li key={item.label} className={item.passed ? "workspace-checklist-pass" : "workspace-checklist-warn"}>
                  {item.label}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="form-section workspace-smart-setup">
          <div className="form-section-heading">
            <div>
              <h3>Smart Setup</h3>
              <p className="support-copy">Choose your industry, goal, and tone to preview a stronger starting direction before applying it.</p>
            </div>
          </div>
          <div className="field-grid">
            <label className="field">
              <span>Industry</span>
              <select value={smartSetup.industry} onChange={(event) => onSmartSetupChange("industry", event.target.value)}>
                {smartSetupOptions.industries.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Goal</span>
              <select value={smartSetup.goal} onChange={(event) => onSmartSetupChange("goal", event.target.value)}>
                {smartSetupOptions.goals.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tone</span>
              <select value={smartSetup.tone} onChange={(event) => onSmartSetupChange("tone", event.target.value)}>
                {smartSetupOptions.tones.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="button-row">
            <button className="button button-secondary" type="button" onClick={onGenerateSmartSetup}>
              Preview Smart Setup
            </button>
            {smartSetupPreview ? (
              <button className="button button-primary" type="button" onClick={onApplySmartSetup}>
                Apply Smart Setup
              </button>
            ) : null}
          </div>
          {smartSetupPreview ? (
            <div className="suggestion-card">
              <div>
                <span className="suggestion-label">Recommended template</span>
                <strong>{smartSetupPreview.templateLabel}</strong>
              </div>
              <div>
                <span className="suggestion-label">Suggested title</span>
                <p>{smartSetupPreview.titleLine}</p>
              </div>
              <div>
                <span className="suggestion-label">Suggested CTA</span>
                <p>{smartSetupPreview.ctaText}</p>
              </div>
              <div>
                <span className="suggestion-label">Suggested disclaimer</span>
                <p>{smartSetupPreview.disclaimer}</p>
              </div>
              <p className="support-copy">{smartSetupPreview.note}</p>
            </div>
          ) : null}
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
              <h3>Contact details</h3>
              <p className="support-copy">Keep the essentials easy to scan and easy to click.</p>
            </div>
          </div>
          <div className="field-grid">
            {CONTACT_FIELDS.map(([key, label]) => {
              const locked = isFree && key === "location";
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

        <div className="form-section">
          <div className="form-section-heading">
            <div>
              <h3>CTA and disclaimer</h3>
              <p className="support-copy">Tighten the action and the small print without leaving the builder.</p>
            </div>
          </div>
          <div className="field-grid">
            <label className="field">
              <span>CTA text</span>
              <input value={draft.ctaText} onChange={(event) => onFieldChange("ctaText", event.target.value)} />
            </label>
            <label className="field">
              <span>Disclaimer</span>
              <textarea className="studio-textarea" rows="3" value={draft.disclaimer} onChange={(event) => onFieldChange("disclaimer", event.target.value)} />
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <div>
              <h3>Social links</h3>
              <p className="support-copy">Useful trust-builders when Pro is enabled.</p>
            </div>
          </div>
          <div className="field-grid">
            {SOCIAL_FIELDS.map(([key, label]) => (
              <label key={key} className="field">
                <span>{label}</span>
                <input disabled={isFree} value={draft[key]} onChange={(event) => onFieldChange(key, event.target.value)} />
                {isFree ? <small className="locked-copy">Upgrade to Pro to unlock social links.</small> : null}
              </label>
            ))}
          </div>
        </div>
        {isFree ? <p className="locked-banner">Free Mode includes Signature Pilot AI branding and locks advanced customization until upgrade.</p> : null}
      </section>
    </div>
  );
}

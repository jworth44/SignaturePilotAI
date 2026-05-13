import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AiSuggestionPanel from "../components/AiSuggestionPanel";
import SignaturePreview from "../components/SignaturePreview";
import { generateSignatureArtifacts, getDefaultDraft } from "../utils/htmlSignatureGenerator";

const STORAGE_KEY = "signaturepilot.ai.draft";
const VERSION_STORAGE_KEY = "signaturepilot.ai.versions";
const MOBILE_LAYOUT_BREAKPOINT = 768;

const STARTER_PROFILES = {
  professional: {
    jobTitle: "Client Services Lead",
    companyName: "Northlight Studio",
    website: "northlightstudio.com",
    ctaText: "Schedule consultation",
    disclaimer: "Please let me know the best time to follow up with next steps.",
    layout: "professional-classic",
    tone: "Professional",
    industry: "General Professional",
    goal: "Show credibility",
    brandColor: "#2663ff"
  },
  senior_management: {
    jobTitle: "Senior Management Consultant",
    companyName: "Summit Ridge Advisory",
    website: "summitridgeadvisory.com",
    ctaText: "Schedule a leadership call",
    disclaimer: "Availability for strategy sessions may vary based on current advisory engagements.",
    layout: "executive-corporate",
    tone: "Premium",
    industry: "Finance / Insurance",
    goal: "Show credibility",
    brandColor: "#1d3557"
  },
  office_administration: {
    jobTitle: "Office Administration Coordinator",
    companyName: "Atlas Business Support",
    website: "atlasbusinesssupport.com",
    ctaText: "Book Teams meeting",
    disclaimer: "Response times may vary depending on current office support volume.",
    layout: "minimal-clean",
    tone: "Professional",
    industry: "General Professional",
    goal: "Book calls",
    brandColor: "#51667d"
  },
  contractor: {
    jobTitle: "Licensed General Contractor",
    companyName: "Ortiz Build Co.",
    website: "ortizbuildco.com",
    ctaText: "Request site walkthrough",
    disclaimer: "Estimates and scope recommendations are confirmed after a project review.",
    layout: "contractor-bold",
    tone: "Contractor",
    industry: "Contractor / Trades",
    goal: "Get quotes",
    brandColor: "#d97706"
  },
  entrepreneur: {
    jobTitle: "Founder & Operator",
    companyName: "Northlight Venture Lab",
    website: "northlightventurelab.com",
    ctaText: "Let's connect",
    disclaimer: "Partnership timelines and availability may change as the business evolves.",
    layout: "tech-saas",
    tone: "Friendly",
    industry: "Tech / SaaS",
    goal: "Drive website visits",
    brandColor: "#5b5bd6"
  }
};

const TEMPLATE_OPTIONS = [
  { value: "professional-classic", label: "Professional Classic", description: "Balanced, traditional, and easy to scan.", pro: false },
  { value: "executive-corporate", label: "Executive Corporate", description: "Structured leadership layout with stronger hierarchy.", pro: true },
  { value: "minimal-clean", label: "Minimal Clean", description: "Lighter, cleaner, and content-first.", pro: false },
  { value: "premium-consultant", label: "Premium Consultant", description: "Refined spacing with polished consultant styling.", pro: true },
  { value: "contractor-bold", label: "Contractor Bold", description: "Service-first layout with stronger CTA emphasis.", pro: false },
  { value: "real-estate", label: "Real Estate", description: "Listing-friendly structure with stronger profile framing.", pro: true },
  { value: "legal-finance", label: "Legal / Finance", description: "Credibility-forward layout for advisory and legal roles.", pro: true },
  { value: "health-medical", label: "Health / Medical", description: "Calm stacked layout for care-focused communication.", pro: true },
  { value: "creative-designer", label: "Creative / Designer", description: "Portfolio-ready layout with more visual contrast.", pro: true },
  { value: "tech-saas", label: "Tech / SaaS", description: "Modern product-forward layout with compact contact chips.", pro: true },
  { value: "mobile-compact", label: "Mobile Compact", description: "Stacked and centered for narrow mobile email clients.", pro: false },
  { value: "signature-card", label: "Signature Card", description: "Card-style presentation with contained profile framing.", pro: true }
];

const DETAILS_FIELDS = [
  ["fullName", "Full name", true],
  ["jobTitle", "Job title", true],
  ["companyName", "Company name", true],
  ["phone", "Office phone number", false],
  ["email", "Email address", true],
  ["website", "Website URL", false]
];

const SOCIAL_FIELDS = [
  ["linkedinUrl", "LinkedIn"],
  ["facebookUrl", "Facebook"],
  ["instagramUrl", "Instagram"]
];

const STEP_ITEMS = [
  {
    key: "details",
    label: "Details",
    eyebrow: "Step 1: Details",
    title: "Enter your signature details",
    copy: "Start with the essentials your recipients should see first."
  },
  {
    key: "images",
    label: "Images",
    eyebrow: "Step 2: Images",
    title: "Upload your logo or profile image",
    copy: "Use direct file uploads instead of hosted image URLs."
  },
  {
    key: "templates",
    label: "Templates",
    eyebrow: "Step 3: Templates",
    title: "Select your template",
    copy: "Choose a layout that matches how your signature should feel."
  },
  {
    key: "styles",
    label: "Styles",
    eyebrow: "Step 4: Styles",
    title: "Style your signature",
    copy: "Adjust the visual finish without breaking email-safe export."
  },
  {
    key: "export",
    label: "Export",
    eyebrow: "Step 5: Export",
    title: "Create and copy your signature",
    copy: "Export a finished signature for Gmail, Outlook, Apple Mail, and Yahoo."
  }
];

const INDUSTRY_OPTIONS = [
  "Contractor / Trades",
  "Safety Consulting",
  "Real Estate",
  "Law / Legal",
  "Finance / Insurance",
  "Medical / Health",
  "Fitness / Coaching",
  "Tech / SaaS",
  "Retail / Ecommerce",
  "Creative / Design",
  "General Professional"
];

const GOAL_OPTIONS = ["Book calls", "Get quotes", "Show credibility", "Drive website visits"];
const TONE_OPTIONS = ["Professional", "Friendly", "Premium", "Contractor", "Minimal"];
const CTA_DESTINATION_OPTIONS = [
  { value: "none", label: "None", pro: false },
  { value: "custom", label: "Custom URL", pro: false },
  { value: "calendly", label: "Calendly", pro: true },
  { value: "teams", label: "Microsoft Teams", pro: true },
  { value: "google-meet", label: "Google Meet", pro: true },
  { value: "zoom", label: "Zoom", pro: true },
  { value: "microsoft-bookings", label: "Microsoft Bookings", pro: true }
];

export default function BuilderPage() {
  const initialDraft = useMemo(() => loadInitialDraft(), []);
  const originalDraftRef = useRef(initialDraft);
  const [draft, setDraft] = useState(initialDraft);
  const [activeStep, setActiveStep] = useState("details");
  const [copyMessage, setCopyMessage] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewZoom, setPreviewZoom] = useState("100");
  const [smartSetup, setSmartSetup] = useState({
    industry: "General Professional",
    goal: "Show credibility",
    tone: "Professional"
  });
  const [smartSetupPreview, setSmartSetupPreview] = useState(null);
  const [polishPreview, setPolishPreview] = useState(null);
  const [savedVersions, setSavedVersions] = useState(() => {
    try {
      const stored = window.localStorage.getItem(VERSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(savedVersions));
  }, [savedVersions]);

  useEffect(() => {
    if (copyState === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  useEffect(() => {
    function syncLayoutForScreenWidth() {
      const isNarrowScreen = window.innerWidth < MOBILE_LAYOUT_BREAKPOINT;
      if (!isNarrowScreen) {
        return;
      }

      setDraft((current) => {
        if (current.layoutManuallySelected || current.layout === "mobile-compact") {
          return current;
        }

        return {
          ...current,
          layout: "mobile-compact",
          layoutAutoSelected: true
        };
      });
    }

    syncLayoutForScreenWidth();
    window.addEventListener("resize", syncLayoutForScreenWidth);
    return () => window.removeEventListener("resize", syncLayoutForScreenWidth);
  }, []);

  const artifacts = useMemo(() => generateSignatureArtifacts({ ...draft, renderMode: previewDevice }), [draft, previewDevice]);
  const isFree = artifacts.effectiveDraft.tier === "free";
  const ctaValidation = useMemo(() => validateCtaDestination(artifacts.effectiveDraft), [artifacts.effectiveDraft]);
  const healthScore = useMemo(() => evaluateSignatureHealth(artifacts.effectiveDraft), [artifacts.effectiveDraft]);
  const compatibilityChecklist = useMemo(() => buildCompatibilityChecklist(artifacts.effectiveDraft), [artifacts.effectiveDraft]);
  const templatePreviewMap = useMemo(
    () =>
      Object.fromEntries(
        TEMPLATE_OPTIONS.map((template) => {
          const previewDraft = buildTemplatePreviewDraft(template, draft);
          return [template.value, generateSignatureArtifacts(previewDraft)];
        })
      ),
    [draft]
  );

  const stepIndex = STEP_ITEMS.findIndex((step) => step.key === activeStep);
  const activeStepMeta = STEP_ITEMS[stepIndex] || STEP_ITEMS[0];
  const modeControl = (
    <label className="tier-toggle generator-mode-field">
      <span>Access</span>
      <select value={draft.tier} onChange={(event) => handleTierChange(event.target.value)}>
        <option value="free">Free Mode</option>
        <option value="pro">Pro Mode</option>
      </select>
    </label>
  );

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleCtaDestinationTypeChange(value) {
    setDraft((current) => ({
      ...current,
      ctaDestinationType: value,
      ctaUrl: value === "none" ? "" : current.ctaUrl
    }));
  }

  function saveCurrentVersion(reason = "Saved version") {
    setSavedVersions((current) => {
      const nextVersion = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        summary: `${reason} | ${draft.fullName || "Unnamed"} | ${draft.jobTitle || "No title"}`,
        draft: { ...draft }
      };
      return [nextVersion, ...current].slice(0, 5);
    });
  }

  function applySampleProfile(profileKey) {
    const profile = STARTER_PROFILES[profileKey];
    if (!profile) {
      return;
    }

    setDraft((current) => {
      const nextLayout =
        current.tier === "free" && !["professional-classic", "minimal-clean", "contractor-bold", "mobile-compact"].includes(profile.layout)
          ? "professional-classic"
          : profile.layout;

      return {
        ...current,
        jobTitle: current.jobTitle?.trim() ? current.jobTitle : profile.jobTitle,
        companyName: current.companyName?.trim() ? current.companyName : profile.companyName,
        website: current.website?.trim() ? current.website : profile.website,
        ctaText: profile.ctaText,
        disclaimer: profile.disclaimer,
        brandColor: profile.brandColor,
        layout: nextLayout,
        templateVariant: 1,
        layoutManuallySelected: true,
        layoutAutoSelected: false
      };
    });
    setSmartSetup((current) => ({
      ...current,
      tone: profile.tone,
      industry: profile.industry,
      goal: profile.goal
    }));
    setCopyMessage("Starter applied without replacing your existing contact details.");
    setCopyState("success");
  }

  function handleLayoutChange(value) {
    setDraft((current) => ({
      ...current,
      layout: value,
      templateVariant: current.layout === value ? current.templateVariant : 1,
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
  }

  function handleRegenerateTemplate() {
    setDraft((current) => ({
      ...current,
      templateVariant: current.templateVariant >= 12 ? 1 : current.templateVariant + 1
    }));
  }

  function handleRevertTemplate() {
    setDraft((current) => ({
      ...current,
      templateVariant: 1
    }));
    setCopyMessage("Template reverted to Variant 1.");
    setCopyState("success");
  }

  async function readFileAsDataUrl(targetField, file) {
    if (!file) {
      setDraft((current) => ({ ...current, [targetField]: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({ ...current, [targetField]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  async function handleCopy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(`${label} copied.`);
      setCopyState("success");
    } catch {
      setCopyMessage("Copy failed. Try again or use another browser.");
      setCopyState("error");
    }
  }

  async function handleCopySignature() {
    try {
      if (window.ClipboardItem && navigator.clipboard?.write) {
        const clipboardItem = new window.ClipboardItem({
          "text/html": new Blob([artifacts.exportHtml], { type: "text/html" }),
          "text/plain": new Blob([artifacts.plainText], { type: "text/plain" })
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        copyRenderedSignatureFallback(artifacts.exportHtml);
      }

      setCopyMessage("Signature copied. Paste it directly into Gmail, Outlook, Apple Mail, or Yahoo.");
      setCopyState("success");
      setActiveStep("export");
    } catch {
      try {
        copyRenderedSignatureFallback(artifacts.exportHtml);
        setCopyMessage("Signature copied using fallback mode.");
        setCopyState("success");
        setActiveStep("export");
      } catch {
        setCopyMessage("Copy failed. Try again or use another browser.");
        setCopyState("error");
      }
    }
  }

  function handleDownloadHtml() {
    const blob = new Blob([artifacts.exportHtmlDocument], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "signature-pilot-signature.html";
    link.click();
    URL.revokeObjectURL(url);
    setCopyMessage("HTML file downloaded.");
  }

  function handleReset() {
    setDraft(getDefaultDraft());
    setSavedVersions([]);
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(VERSION_STORAGE_KEY);
    setCopyMessage("Draft reset.");
  }

  function handleCreateSignature() {
    setActiveStep("export");
    setCopyMessage("Signature is ready to copy.");
    setCopyState("success");
  }

  function handleRevertToOriginal() {
    setDraft({ ...getDefaultDraft(), ...originalDraftRef.current });
    setCopyMessage("Reverted to the original signature.");
  }

  function handleTierChange(value) {
    setDraft((current) => ({
      ...current,
      tier: value,
      includeBranding: value === "free" ? true : current.includeBranding,
      layoutAutoSelected: false,
      logoSize: value === "free" && (current.logoSize === "custom" || current.logoSize === "extra-large") ? "large" : current.logoSize
    }));
  }

  function restoreVersion(version) {
    setDraft({ ...getDefaultDraft(), ...version.draft });
    setCopyMessage("Previous signature restored.");
  }

  function deleteVersion(versionId) {
    setSavedVersions((current) => current.filter((version) => version.id !== versionId));
  }

  function handleGenerateSmartSetup() {
    setSmartSetupPreview(buildSmartSetupRecommendation(draft, smartSetup));
  }

  function handleApplySmartSetup() {
    if (!smartSetupPreview) {
      return;
    }

    saveCurrentVersion("Before smart setup");
    setDraft((current) => ({
      ...current,
      jobTitle: smartSetupPreview.titleLine || current.jobTitle,
      ctaText: smartSetupPreview.ctaText || current.ctaText,
      disclaimer: smartSetupPreview.disclaimer || current.disclaimer,
      layout: resolveRecommendedLayout(current, smartSetupPreview.layout),
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
    setCopyMessage("Smart setup applied.");
  }

  function handleGeneratePolish() {
    setPolishPreview(buildPolishRecommendation(draft));
  }

  function handleApplyPolish() {
    if (!polishPreview || isFree) {
      return;
    }

    saveCurrentVersion("Before one-click polish");
    setDraft((current) => ({
      ...current,
      jobTitle: polishPreview.jobTitle,
      companyName: polishPreview.companyName,
      ctaText: polishPreview.ctaText,
      disclaimer: polishPreview.disclaimer,
      layout: resolveRecommendedLayout(current, polishPreview.layout),
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
    setCopyMessage("One-click polish applied.");
  }

  function renderDetailsStep() {
    return (
      <div className="generator-step-stack">
        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <p className="eyebrow">{activeStepMeta.eyebrow}</p>
              <h2>{activeStepMeta.title}</h2>
            </div>
            <div className="generator-card-header-side">
              {modeControl}
              <p className="generator-required-note">* Indicates a required field</p>
            </div>
          </div>

          <div className="generator-form-grid">
            {DETAILS_FIELDS.map(([key, label, required]) => (
              <label key={key} className={`field ${key === "location" ? "field-full" : ""}`}>
                <span>
                  {label}
                  {required ? "*" : ""}
                </span>
                <input value={draft[key]} onChange={(event) => updateField(key, event.target.value)} />
              </label>
            ))}

            <label className="field field-full">
              <span>Address</span>
              <textarea rows="4" value={draft.location} onChange={(event) => updateField("location", event.target.value)} />
            </label>
          </div>
        </section>

        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <h3>Enter your social links</h3>
              <p className="support-copy">Add the links recipients are most likely to click.</p>
            </div>
          </div>
          <div className="generator-form-grid">
            {SOCIAL_FIELDS.map(([key, label]) => (
              <label key={key} className="field">
                <span>{label}</span>
                <input disabled={isFree} value={draft[key]} onChange={(event) => updateField(key, event.target.value)} />
                {isFree ? <small className="locked-copy">Upgrade to Pro to unlock social links.</small> : null}
              </label>
            ))}
          </div>
        </section>

        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <h3>Start faster</h3>
              <p className="support-copy">Load a polished starter without replacing your existing contact details.</p>
            </div>
          </div>
          <div className="generator-sample-grid">
            <button className="generator-sample-card" type="button" onClick={() => applySampleProfile("professional")}>
              <strong>Professional</strong>
              <span>Balanced business-ready starter</span>
            </button>
            <button className="generator-sample-card" type="button" onClick={() => applySampleProfile("senior_management")}>
              <strong>Senior Management</strong>
              <span>Leadership-focused executive starter</span>
            </button>
            <button className="generator-sample-card" type="button" onClick={() => applySampleProfile("office_administration")}>
              <strong>Office Administration</strong>
              <span>Clean internal support starter</span>
            </button>
            <button className="generator-sample-card" type="button" onClick={() => applySampleProfile("contractor")}>
              <strong>Contractor</strong>
              <span>Quote-focused service starter</span>
            </button>
            <button className="generator-sample-card" type="button" onClick={() => applySampleProfile("entrepreneur")}>
              <strong>Entrepreneur</strong>
              <span>Fast-moving founder starter</span>
            </button>
          </div>
          {copyMessage.includes("Starter applied") ? <p className="copy-feedback copy-feedback-success">{copyMessage}</p> : null}
        </section>
      </div>
    );
  }

  function renderImagesStep() {
    return (
      <div className="generator-step-stack">
        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <p className="eyebrow">{activeStepMeta.eyebrow}</p>
              <h2>{activeStepMeta.title}</h2>
            </div>
          </div>

          <p className="support-copy">
            Add your profile photo or logo to enhance your email signature. Use direct file uploads here instead of image links.
          </p>

          <div className="generator-upload-grid">
            <UploadAssetCard
              description="Upload a logo from your computer for a cleaner branded signature."
              disabled={false}
              inputId="logo-upload"
              label="Company Logo"
              onFileRemove={() => updateField("logoDataUrl", "")}
              onFileSelect={(file) => readFileAsDataUrl("logoDataUrl", file)}
              value={draft.logoDataUrl}
            />
            <UploadAssetCard
              description={isFree ? "Profile photos unlock with Pro Mode." : "Upload a profile image for a more personal signature style."}
              disabled={isFree}
              inputId="photo-upload"
              label="Profile Picture"
              onFileRemove={() => updateField("photoDataUrl", "")}
              onFileSelect={(file) => readFileAsDataUrl("photoDataUrl", file)}
              value={draft.photoDataUrl}
            />
          </div>
        </section>

        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <h3>Need a logo?</h3>
              <p className="support-copy">Logo Pilot AI is our separate logo app for concept creation and refinement.</p>
            </div>
          </div>
          <a className="button button-secondary" href="#">
            Explore Logo Pilot AI
          </a>
        </section>
      </div>
    );
  }

  function renderTemplatesStep() {
    const selectedTemplateLabel = lookupTemplateLabel(artifacts.effectiveDraft.layout);
    return (
      <div className="generator-step-stack">
        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <p className="eyebrow">{activeStepMeta.eyebrow}</p>
              <h2>{activeStepMeta.title}</h2>
            </div>
          </div>

          <div className="generator-template-grid">
            {TEMPLATE_OPTIONS.map((template) => {
              const locked = isFree && template.pro;
              const active = artifacts.effectiveDraft.layout === template.value;
              const templatePreview = templatePreviewMap[template.value];

              return (
                <article
                  key={template.value}
                  className={`generator-template-card ${active ? "generator-template-card-active" : ""} ${locked ? "generator-template-card-locked" : ""}`}
                >
                  <div className="generator-template-label-row">
                    <strong>{template.label}</strong>
                    <span className={`generator-mini-badge ${template.pro ? "generator-mini-badge-pro" : "generator-mini-badge-free"}`}>
                      {template.pro ? "Pro" : "Free"}
                    </span>
                  </div>
                  <div className="generator-template-preview-frame">
                    <div className="generator-template-preview-canvas">
                      <div dangerouslySetInnerHTML={{ __html: templatePreview.previewHtml }} />
                    </div>
                  </div>
                  <p className="support-copy">{template.description}</p>
                  <div className="generator-button-row">
                    <button
                      className={`button ${active ? "button-primary" : locked ? "button-locked" : "button-secondary"}`}
                      disabled={locked}
                      type="button"
                      onClick={() => handleLayoutChange(template.value)}
                    >
                      {locked ? "Pro style" : active ? "Selected" : "Use this style"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="generator-template-toolbar">
            <div>
              <strong>{artifacts.effectiveDraft.variantLabel}</strong>
              <p className="support-copy">
                Selected family: {selectedTemplateLabel}. Regenerate to cycle through the 12 built-in structure variants.
              </p>
            </div>
            <div className="generator-button-row">
              <button className="button button-secondary" type="button" onClick={handleRegenerateTemplate}>
                Regenerate layout
              </button>
              <button className="button button-ghost" type="button" onClick={handleRevertTemplate}>
                Revert template
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function renderStylesStep() {
    const selectedTemplateLabel = lookupTemplateLabel(artifacts.effectiveDraft.layout);
    return (
      <div className="generator-step-stack">
        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <p className="eyebrow">{activeStepMeta.eyebrow}</p>
              <h2>{activeStepMeta.title}</h2>
            </div>
          </div>

          <div className="generator-form-grid">
            <label className="field">
              <span>Select theme colour</span>
              <input type="color" value={draft.brandColor} onChange={(event) => updateField("brandColor", event.target.value)} />
            </label>

            <label className="field">
              <span>Layout</span>
              <select value={artifacts.effectiveDraft.layout} onChange={(event) => handleLayoutChange(event.target.value)}>
                {TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.value} disabled={isFree && option.pro} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {draft.layout === "mobile-compact" && draft.layoutAutoSelected ? (
                <small className="support-copy">Mobile Compact selected for better mobile email compatibility.</small>
              ) : null}
              {artifacts.effectiveDraft.previewUsesMobileCompact ? (
                <small className="support-copy">This preview is temporarily showing Mobile Compact for cleaner phone-safe rendering.</small>
              ) : null}
            </label>

            <label className="field">
              <span>Logo size</span>
              <select value={artifacts.effectiveDraft.logoSize} onChange={(event) => updateField("logoSize", event.target.value)}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option disabled={isFree} value="extra-large">
                  Extra Large
                </option>
                <option disabled={isFree} value="custom">
                  Custom
                </option>
              </select>
            </label>

            {artifacts.effectiveDraft.logoSize === "custom" ? (
              <label className="field">
                <span>Custom logo width</span>
                <input
                  max="180"
                  min="40"
                  type="number"
                  value={artifacts.effectiveDraft.customLogoWidth}
                  onChange={(event) => updateField("customLogoWidth", event.target.value)}
                />
              </label>
            ) : null}

            <label className="field">
              <span>Divider</span>
              <select
                disabled={isFree || artifacts.effectiveDraft.layout === "mobile-compact"}
                value={artifacts.effectiveDraft.showDivider ? "on" : "off"}
                onChange={(event) => updateField("showDivider", event.target.value === "on")}
              >
                <option value="off">Off</option>
                <option value="on">On</option>
              </select>
            </label>

            <label className="field">
              <span>Branding</span>
              <select
                disabled={isFree}
                value={artifacts.includeBranding ? "include" : "remove"}
                onChange={(event) => updateField("includeBranding", event.target.value === "include")}
              >
                <option value="include">Include</option>
                <option value="remove">Remove</option>
              </select>
            </label>

            <label className="field">
              <span>Show template tags</span>
              <select value={artifacts.effectiveDraft.showTemplateTags ? "on" : "off"} onChange={(event) => updateField("showTemplateTags", event.target.value === "on")}>
                <option value="off">Off</option>
                <option value="on">On</option>
              </select>
            </label>

            <label className="field field-full">
              <span>CTA text</span>
              <input value={draft.ctaText} onChange={(event) => updateField("ctaText", event.target.value)} />
            </label>

            <label className="field">
              <span>CTA Destination Type</span>
              <select value={artifacts.effectiveDraft.ctaDestinationType} onChange={(event) => handleCtaDestinationTypeChange(event.target.value)}>
                {CTA_DESTINATION_OPTIONS.map((option) => (
                  <option key={option.value} disabled={isFree && option.pro} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small className="support-copy">Most business users use Teams or Calendly scheduling links.</small>
            </label>

            <label className="field">
              <span>CTA URL</span>
              <input
                placeholder={getCtaPlaceholder(artifacts.effectiveDraft.ctaDestinationType)}
                value={draft.ctaUrl}
                onChange={(event) => updateField("ctaUrl", event.target.value)}
              />
              <small className="support-copy">{getCtaHelpText(artifacts.effectiveDraft.ctaDestinationType, isFree)}</small>
              {ctaValidation.error ? <small className="locked-copy">{ctaValidation.error}</small> : null}
            </label>

            <label className="field field-full">
              <span>Disclaimer</span>
              <textarea rows="3" value={draft.disclaimer} onChange={(event) => updateField("disclaimer", event.target.value)} />
            </label>
          </div>

          <div className="generator-inline-note">
            <strong>{artifacts.effectiveDraft.variantLabel}</strong>
            <span>{selectedTemplateLabel} remains the selected family for export and copy actions.</span>
          </div>

          <div className="generator-button-row">
            <button className="button button-secondary" type="button" onClick={handleRevertToOriginal}>
              Revert to original
            </button>
            <button className={`button ${isFree ? "button-locked" : "button-primary"}`} disabled={isFree} type="button" onClick={handleGeneratePolish}>
              {isFree ? "Pro polish" : "Preview one-click polish"}
            </button>
          </div>

          {polishPreview ? (
            <div className="suggestion-card">
              <div>
                <span className="suggestion-label">Polished title line</span>
                <strong>{[polishPreview.jobTitle, polishPreview.companyName].filter(Boolean).join(" | ")}</strong>
              </div>
              <div>
                <span className="suggestion-label">Polished CTA</span>
                <p>{polishPreview.ctaText}</p>
              </div>
              <div>
                <span className="suggestion-label">Polished disclaimer</span>
                <p>{polishPreview.disclaimer}</p>
              </div>
              <div className="generator-button-row">
                <button className="button button-primary" type="button" onClick={handleApplyPolish}>
                  Apply one-click polish
                </button>
                <button className="button button-ghost" type="button" onClick={() => setPolishPreview(null)}>
                  Dismiss
                </button>
              </div>
              <p className="support-copy">{polishPreview.note}</p>
            </div>
          ) : null}
        </section>

        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <h3>Smart Setup</h3>
              <p className="support-copy">Get a stronger recommendation before applying any changes.</p>
            </div>
          </div>
          <div className="generator-form-grid">
            <label className="field">
              <span>Industry</span>
              <select value={smartSetup.industry} onChange={(event) => setSmartSetup((current) => ({ ...current, industry: event.target.value }))}>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Goal</span>
              <select value={smartSetup.goal} onChange={(event) => setSmartSetup((current) => ({ ...current, goal: event.target.value }))}>
                {GOAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tone</span>
              <select value={smartSetup.tone} onChange={(event) => setSmartSetup((current) => ({ ...current, tone: event.target.value }))}>
                {TONE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="generator-button-row">
            <button className="button button-secondary" type="button" onClick={handleGenerateSmartSetup}>
              Preview Smart Setup
            </button>
            {smartSetupPreview ? (
              <button className="button button-primary" type="button" onClick={handleApplySmartSetup}>
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
        </section>

        <AiSuggestionPanel
          draft={draft}
          onAfterGenerate={() => setCopyMessage("Suggestions ready to review.")}
          onApplySuggestions={({ mode, suggestions }) => {
            setDraft((current) => applySuggestedFields(current, suggestions, mode));
            setCopyMessage(`${mode} applied.`);
          }}
          onSaveVersion={saveCurrentVersion}
        />
      </div>
    );
  }

  function renderExportStep() {
    return (
      <div className="generator-step-stack">
        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <p className="eyebrow">{activeStepMeta.eyebrow}</p>
              <h2>{activeStepMeta.title}</h2>
            </div>
          </div>

          <div className="generator-status-grid">
            <article className="generator-status-card">
              <span className="generator-status-label">Signature Health Score</span>
              <strong>{healthScore.score}/100</strong>
              <ul className="workspace-checklist">
                {healthScore.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </article>

            <article className="generator-status-card">
              <span className="generator-status-label">Client Compatibility</span>
              <ul className="workspace-checklist workspace-checklist-tight">
                {compatibilityChecklist.map((item) => (
                  <li key={item.label} className={item.passed ? "workspace-checklist-pass" : "workspace-checklist-warn"}>
                    {item.label}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="generator-export-grid">
            <button
              className={`button button-primary ${copyState === "success" ? "button-success" : ""} ${copyState === "error" ? "button-error" : ""}`}
              type="button"
              onClick={handleCopySignature}
            >
              {copyState === "success" ? "Copied!" : "Copy Signature"}
            </button>
            {!isFree ? (
              <button className="button button-secondary" type="button" onClick={() => handleCopy(artifacts.exportHtml, "Raw HTML")}>
                Copy Raw HTML
              </button>
            ) : null}
            {!isFree ? (
              <button className="button button-secondary" type="button" onClick={() => handleCopy(artifacts.plainText, "Plain text signature")}>
                Copy Plain Text
              </button>
            ) : null}
            <button className={`button ${isFree ? "button-locked" : "button-secondary"}`} disabled={isFree} type="button" onClick={handleDownloadHtml}>
              Download HTML File
            </button>
          </div>

          <div className="generator-export-notes">
            <p>Copy Signature is best for Gmail, Outlook, Apple Mail, and Yahoo.</p>
            <p>Raw HTML is a Pro export for platforms that specifically ask for HTML code.</p>
            <p>Download HTML gives you a backup file for handoff or archiving.</p>
            {isFree ? <p>Free exports always include Signature Pilot AI branding inside the signature.</p> : null}
          </div>

          {copyMessage ? (
            <p className={`copy-feedback ${copyState === "error" ? "copy-feedback-error" : "copy-feedback-success"}`}>{copyMessage}</p>
          ) : null}
        </section>

        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <h3>Recent versions</h3>
              <p className="support-copy">Restore an earlier draft if you want to backtrack safely.</p>
            </div>
            <button className="button button-secondary" type="button" onClick={() => saveCurrentVersion("Manual save")}>
              Save current version
            </button>
          </div>

          {savedVersions.length ? (
            <div className="version-list">
              {savedVersions.map((version) => (
                <article key={version.id} className="version-card">
                  <div>
                    <strong>{version.summary}</strong>
                    <p className="support-copy">{new Date(version.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="generator-button-row">
                    <button className="button button-primary" type="button" onClick={() => restoreVersion(version)}>
                      Restore
                    </button>
                    <button className="button button-ghost" type="button" onClick={() => deleteVersion(version.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="support-copy">Apply suggestions or save the current draft to create recovery points.</p>
          )}
        </section>
      </div>
    );
  }

  function renderActiveStep() {
    switch (activeStep) {
      case "images":
        return renderImagesStep();
      case "templates":
        return renderTemplatesStep();
      case "styles":
        return renderStylesStep();
      case "export":
        return renderExportStep();
      default:
        return renderDetailsStep();
    }
  }

  return (
    <div className="generator-builder-page">
      <section className="generator-builder-topbar">
        <div className="generator-builder-topcopy">
          <p className="eyebrow">Signature Generator</p>
          <h1>Build once, paste anywhere.</h1>
          <p className="generator-version-marker">Step Studio v1</p>
        </div>
        <div className="generator-builder-topactions">
          <Link className="button button-secondary" to="/install">
            Install Guide
          </Link>
          <Link className="button button-primary" to="/upgrade">
            Upgrade
          </Link>
        </div>
      </section>

      <section className="generator-builder-shell">
        <aside className="generator-step-rail">
          {STEP_ITEMS.map((step) => {
            const active = step.key === activeStep;
            return (
              <button
                key={step.key}
                className={`generator-step-link ${active ? "generator-step-link-active" : ""}`}
                type="button"
                onClick={() => setActiveStep(step.key)}
              >
                <span className="generator-step-icon" aria-hidden="true">
                  {String(STEP_ITEMS.findIndex((item) => item.key === step.key) + 1).padStart(2, "0")}
                </span>
                <span className="generator-step-name">{step.label}</span>
              </button>
            );
          })}
        </aside>

        <section className="generator-editor-pane">
          <div className="generator-editor-scroll">{renderActiveStep()}</div>

          <div className="generator-editor-footer">
            <button
              className="button button-ghost"
              disabled={stepIndex === 0}
              type="button"
              onClick={() => setActiveStep(STEP_ITEMS[Math.max(0, stepIndex - 1)].key)}
            >
              Previous
            </button>
            <button
              className="button button-primary"
              disabled={stepIndex === STEP_ITEMS.length - 1}
              type="button"
              onClick={() => setActiveStep(STEP_ITEMS[Math.min(STEP_ITEMS.length - 1, stepIndex + 1)].key)}
            >
              Next
            </button>
          </div>
        </section>

        <aside className="generator-preview-pane">
          <div className="generator-preview-scroll">
            <SignaturePreview
              draft={draft}
              effectiveDraft={artifacts.effectiveDraft}
              previewDevice={previewDevice}
              previewZoom={previewZoom}
              onPreviewDeviceChange={setPreviewDevice}
              onPreviewZoomChange={setPreviewZoom}
            />
          </div>

          <div className="generator-preview-footer">
            <button className="generator-clear-button" type="button" onClick={handleReset}>
              Clear all input fields
            </button>
            <button className="generator-create-button" type="button" onClick={handleCreateSignature}>
              Create signature
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function UploadAssetCard({ description, disabled = false, inputId, label, onFileRemove, onFileSelect, value }) {
  return (
    <div className="generator-upload-card">
      <div className="generator-upload-copy">
        <h3>{label}</h3>
        <p className="support-copy">{description}</p>
      </div>
      {value ? <img alt={label} className="asset-preview" src={value} /> : <div className="asset-preview asset-preview-empty">No file uploaded yet.</div>}
      <div className="generator-button-row">
        <label className={`button button-secondary ${disabled ? "button-locked" : ""}`} htmlFor={inputId}>
          Upload
        </label>
        {value ? (
          <button className="button button-danger" disabled={disabled} type="button" onClick={onFileRemove}>
            Remove
          </button>
        ) : null}
      </div>
      <input
        key={`${inputId}-${value ? "filled" : "empty"}`}
        accept="image/*"
        disabled={disabled}
        hidden
        id={inputId}
        type="file"
        onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
      />
    </div>
  );
}

function buildTemplatePreviewDraft(template, draft) {
  const fallback = getDefaultDraft();
  const previewBase = {
    "professional-classic": { brandColor: "#2663ff", logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "executive-corporate": { brandColor: "#163a8a", logoSize: "medium", showDivider: true, includeBranding: false, templateVariant: 1 },
    "minimal-clean": { brandColor: "#64748b", logoSize: "small", showDivider: false, includeBranding: false, logoShape: "circle", templateVariant: 1 },
    "premium-consultant": { brandColor: "#6d4aff", logoSize: "medium", showDivider: true, includeBranding: false, templateVariant: 1 },
    "contractor-bold": { brandColor: "#d97706", logoSize: "large", showDivider: false, includeBranding: false, templateVariant: 1 },
    "real-estate": { brandColor: "#0f766e", logoSize: "medium", showDivider: true, includeBranding: false, templateVariant: 1 },
    "legal-finance": { brandColor: "#1f3b73", logoSize: "medium", showDivider: true, includeBranding: false, templateVariant: 1 },
    "health-medical": { brandColor: "#0d9488", logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "creative-designer": { brandColor: "#7c3aed", logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "tech-saas": { brandColor: "#4f46e5", logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "mobile-compact": { brandColor: "#0f766e", logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "signature-card": { brandColor: "#8b6dff", logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 }
  };

  return {
    ...fallback,
    ...draft,
    ...(previewBase[template.value] || {}),
    tier: template.pro ? "pro" : draft.tier,
    layout: template.value,
    templateVariant: 1,
    renderMode: "desktop"
  };
}

function resolveRecommendedLayout(draft, recommendedLayout) {
  const normalized = TEMPLATE_OPTIONS.find((template) => template.value === recommendedLayout)?.value || "professional-classic";
  const isLocked = draft.tier !== "pro" && TEMPLATE_OPTIONS.find((template) => template.value === normalized)?.pro;
  if (isLocked) {
    return "professional-classic";
  }
  return normalized;
}

function lookupTemplateLabel(layout) {
  return TEMPLATE_OPTIONS.find((template) => template.value === layout)?.label || "Professional Classic";
}

function buildSmartSetupRecommendation(draft, smartSetup) {
  const industryMap = {
    "Contractor / Trades": {
      layout: "contractor-bold",
      titleLine: draft.jobTitle || "Licensed General Contractor",
      ctaText: "Request a project quote",
      disclaimer: "Estimates and site recommendations are confirmed after a project review."
    },
    "Safety Consulting": {
      layout: "executive-corporate",
      titleLine: draft.jobTitle || "HSE Director",
      ctaText: "Book a compliance call",
      disclaimer: "Safety recommendations are tailored after a documented assessment."
    },
    "Real Estate": {
      layout: "real-estate",
      titleLine: draft.jobTitle || "Real Estate Advisor",
      ctaText: "View current listings",
      disclaimer: "Availability and listing details may change without notice."
    },
    "Law / Legal": {
      layout: "legal-finance",
      titleLine: draft.jobTitle || "Legal Counsel",
      ctaText: "Schedule a confidential consultation",
      disclaimer: "This email does not create a solicitor-client relationship."
    },
    "Finance / Insurance": {
      layout: "legal-finance",
      titleLine: draft.jobTitle || "Senior Advisor",
      ctaText: "Review coverage options",
      disclaimer: "Coverage and financial products are subject to review and approval."
    },
    "Medical / Health": {
      layout: "health-medical",
      titleLine: draft.jobTitle || "Patient Care Coordinator",
      ctaText: "Book an appointment",
      disclaimer: "Please do not send urgent medical concerns by email."
    },
    "Fitness / Coaching": {
      layout: "minimal-clean",
      titleLine: draft.jobTitle || "Performance Coach",
      ctaText: "Start your program",
      disclaimer: "Results vary based on commitment, training history, and health status."
    },
    "Tech / SaaS": {
      layout: "tech-saas",
      titleLine: draft.jobTitle || "Founder & CEO",
      ctaText: "See the platform in action",
      disclaimer: "Timelines and roadmap details may evolve as the product grows."
    },
    "Retail / Ecommerce": {
      layout: "signature-card",
      titleLine: draft.jobTitle || "Brand Manager",
      ctaText: "Shop the latest collection",
      disclaimer: "Inventory and promotional availability may change without notice."
    },
    "Creative / Design": {
      layout: "creative-designer",
      titleLine: draft.jobTitle || "Creative Director",
      ctaText: "Review our latest work",
      disclaimer: "Project timelines and availability depend on current production capacity."
    },
    "General Professional": {
      layout: "professional-classic",
      titleLine: draft.jobTitle || "Director",
      ctaText: "Book a quick introduction",
      disclaimer: "Response timelines may vary based on current client commitments."
    }
  };

  const base = industryMap[smartSetup.industry] || industryMap["General Professional"];
  const toneAdjustments = {
    Friendly: "with warm, approachable wording",
    Premium: "with more refined premium wording",
    Contractor: "with direct service-first wording",
    Minimal: "with lighter, cleaner copy",
    Professional: "with clear professional wording"
  };
  const goalAdjustments = {
    "Book calls": "Optimized to make booking the next conversation easier.",
    "Get quotes": "Optimized to encourage quote or estimate requests.",
    "Show credibility": "Optimized to reinforce trust and professionalism.",
    "Drive website visits": "Optimized to send recipients to the website first."
  };

  return {
    ...base,
    layout: smartSetup.goal === "Drive website visits" && base.layout === "professional-classic" ? "tech-saas" : base.layout,
    ctaText:
      smartSetup.goal === "Drive website visits"
        ? "Visit our website"
        : smartSetup.goal === "Book calls"
          ? "Schedule a quick call"
          : smartSetup.goal === "Get quotes"
            ? "Request a quote"
            : base.ctaText,
    note: `${toneAdjustments[smartSetup.tone]} ${goalAdjustments[smartSetup.goal]}`,
    templateLabel: lookupTemplateLabel(base.layout)
  };
}

function getCtaPlaceholder(type) {
  switch (type) {
    case "calendly":
      return "https://calendly.com/yourname";
    case "teams":
      return "https://teams.microsoft.com/l/meetup-join/...";
    case "google-meet":
      return "https://meet.google.com/...";
    case "zoom":
      return "https://zoom.us/j/...";
    case "microsoft-bookings":
      return "https://outlook.office.com/book/...";
    case "custom":
      return "https://your-company.com/book";
    default:
      return "No CTA destination selected";
  }
}

function getCtaHelpText(type, isFree) {
  if (type === "none") {
    return "Choose a destination type to attach a real scheduling link to your CTA.";
  }
  if (isFree && type === "custom") {
    return "Free Mode supports custom CTA URLs. Upgrade to Pro for Teams, Calendly, Zoom, Meet, and Bookings helpers.";
  }

  const labels = {
    custom: "Paste any meeting, quote, or scheduling URL you want recipients to open.",
    calendly: "Paste your public Calendly booking link.",
    teams: "Paste your Microsoft Teams meeting or scheduling URL.",
    "google-meet": "Paste your Google Meet invite URL.",
    zoom: "Paste your Zoom meeting URL.",
    "microsoft-bookings": "Paste your Microsoft Bookings scheduling page."
  };

  return labels[type] || "Paste a valid scheduling or meeting URL.";
}

function validateCtaDestination(draft) {
  const destinationType = String(draft.ctaDestinationType || "none");
  const url = String(draft.ctaUrl || "").trim();

  if (destinationType === "none") {
    return { valid: true, error: "", normalizedUrl: "" };
  }

  if (!url) {
    return { valid: false, error: "CTA URL is required when a destination type is selected.", normalizedUrl: "" };
  }

  const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  try {
    const parsed = new URL(normalizedUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "CTA URL must start with http:// or https://.", normalizedUrl: "" };
    }
  } catch {
    return { valid: false, error: "Enter a valid CTA URL for the selected destination type.", normalizedUrl: "" };
  }

  return { valid: true, error: "", normalizedUrl };
}

function evaluateSignatureHealth(draft) {
  const tips = [];
  let score = 0;

  if (draft.fullName?.trim()) {
    score += 18;
  } else {
    tips.push("Add a clear full name so the signature feels credible immediately.");
  }
  if (draft.jobTitle?.trim() && draft.companyName?.trim()) {
    score += 18;
  } else {
    tips.push("Include both a title and company so the signature reads more professional.");
  }
  if (draft.phone?.trim() && draft.email?.trim()) {
    score += 18;
  } else {
    tips.push("Include both phone and email to make contact easier across devices.");
  }
  if (draft.website?.trim() || draft.ctaText?.trim()) {
    score += 14;
  } else {
    tips.push("Add a website or CTA so the signature guides the next action.");
  }
  if (draft.logoDataUrl) {
    score += 12;
  } else {
    tips.push("A logo helps the signature feel more polished and brand-aware.");
  }

  const titleLength = `${draft.jobTitle || ""} ${draft.companyName || ""}`.trim().length;
  if (titleLength <= 52) {
    score += 10;
  } else {
    tips.push("Shorten the title/company line to keep the signature cleaner on mobile.");
  }
  if (draft.layout === "mobile-compact" || titleLength < 42) {
    score += 10;
  } else {
    tips.push("Mobile Compact is recommended when the title/company line starts to wrap.");
  }

  return {
    score: Math.min(100, score),
    tips: tips.slice(0, 3)
  };
}

function buildCompatibilityChecklist(draft) {
  return [
    { label: "Gmail ready", passed: true },
    { label: "Outlook ready", passed: true },
    { label: "Apple Mail ready", passed: true },
    { label: "Mobile compact available", passed: true },
    { label: "No visible borders", passed: true },
    { label: "Clickable links", passed: Boolean(draft.phone || draft.email || draft.website) }
  ];
}

function buildPolishRecommendation(draft) {
  const cleanedTitle = shortenCopy(draft.jobTitle, 34);
  const cleanedCompany = shortenCopy(draft.companyName, 28);
  const compactTitleLength = `${cleanedTitle} ${cleanedCompany}`.trim().length;

  return {
    jobTitle: cleanedTitle,
    companyName: cleanedCompany,
    ctaText: polishCta(draft.ctaText),
    disclaimer: shortenCopy(draft.disclaimer, 82),
    layout:
      compactTitleLength > 44
        ? "mobile-compact"
        : draft.layout === "professional-classic"
          ? "minimal-clean"
          : draft.layout,
    note:
      compactTitleLength > 44
        ? "This pass shortens the top line and recommends Mobile Compact for cleaner phone rendering."
        : "This pass tightens the title, CTA, and disclaimer while keeping the signature clean."
  };
}

function polishCta(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "Book a quick call";
  }
  if (/schedule|book/i.test(raw)) {
    return "Book a quick call";
  }
  if (/quote|estimate/i.test(raw)) {
    return "Request a quote";
  }
  if (/website|visit|work/i.test(raw)) {
    return "See our latest work";
  }
  return shortenCopy(raw, 28);
}

function shortenCopy(value, limit) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, limit - 1)).trim()}...`;
}

function loadInitialDraft() {
  const fallback = getDefaultDraft();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
  } catch {
    return fallback;
  }
}

function copyRenderedSignatureFallback(html) {
  const selection = window.getSelection();
  const previousRanges = [];
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index += 1) {
      previousRanges.push(selection.getRangeAt(index));
    }
  }

  const container = document.createElement("div");
  container.setAttribute("contenteditable", "true");
  container.setAttribute("aria-hidden", "true");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.innerHTML = html;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  selection?.removeAllRanges();
  selection?.addRange(range);
  document.execCommand("copy");
  selection?.removeAllRanges();
  previousRanges.forEach((previousRange) => selection?.addRange(previousRange));
  document.body.removeChild(container);
}

function applySuggestedFields(current, suggestions, mode = "Apply Suggestions") {
  switch (mode) {
    case "Apply Only Title":
      return {
        ...current,
        jobTitle: suggestions.suggestedTitleLine || current.jobTitle
      };
    case "Apply Only CTA":
      return {
        ...current,
        ctaText: suggestions.suggestedCta || current.ctaText
      };
    case "Apply Only Disclaimer":
      return {
        ...current,
        disclaimer: suggestions.suggestedDisclaimer || current.disclaimer
      };
    case "Apply Suggested Layout":
      return {
        ...current,
        layout: current.tier === "pro" ? suggestions.suggestedLayoutValue || current.layout : current.layout,
        layoutManuallySelected: true,
        layoutAutoSelected: false
      };
    default:
      return {
        ...current,
        jobTitle: suggestions.suggestedTitleLine || current.jobTitle,
        ctaText: suggestions.suggestedCta || current.ctaText,
        disclaimer: suggestions.suggestedDisclaimer || current.disclaimer,
        brandDirection: suggestions.suggestedColorDirection || current.brandDirection
      };
  }
}

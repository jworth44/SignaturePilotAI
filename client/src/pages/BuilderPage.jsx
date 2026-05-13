import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AiSuggestionPanel from "../components/AiSuggestionPanel";
import SignatureForm from "../components/SignatureForm";
import SignaturePreview from "../components/SignaturePreview";
import { generateSignatureArtifacts, getDefaultDraft } from "../utils/htmlSignatureGenerator";

const STORAGE_KEY = "signaturepilot.ai.draft";
const VERSION_STORAGE_KEY = "signaturepilot.ai.versions";
const MOBILE_LAYOUT_BREAKPOINT = 768;

const SAMPLE_PROFILES = {
  founder: {
    fullName: "Jordan Wells",
    jobTitle: "Founder & CEO",
    companyName: "Northlight Studio",
    phone: "+1 (555) 123-4567",
    email: "jordan@northlightstudio.com",
    website: "northlightstudio.com",
    location: "Winnipeg, MB",
    linkedinUrl: "https://linkedin.com/company/northlightstudio",
    brandColor: "#2663ff",
    layout: "minimal",
    ctaText: "See our latest work"
  },
  contractor: {
    fullName: "Mason Ortiz",
    jobTitle: "Licensed General Contractor",
    companyName: "Ortiz Build Co.",
    phone: "+1 (555) 241-8801",
    email: "mason@ortizbuildco.com",
    website: "ortizbuildco.com",
    location: "Dallas, TX",
    brandColor: "#d97706",
    layout: "classic",
    ctaText: "Request a project quote"
  },
  executive: {
    fullName: "Avery Chen",
    jobTitle: "VP, Strategic Partnerships",
    companyName: "Summit Ridge Capital",
    phone: "+1 (555) 880-4112",
    email: "avery@summitridgecapital.com",
    website: "summitridgecapital.com",
    location: "Chicago, IL",
    linkedinUrl: "https://linkedin.com/company/summitridgecapital",
    brandColor: "#0f172a",
    layout: "corporate",
    ctaText: "Schedule an introduction"
  }
};

const TEMPLATE_OPTIONS = [
  { value: "classic", label: "Professional Classic", description: "Balanced and polished for daily business email.", pro: false, tone: "blue", person: "Jordan Wells", title: "Founder | Northlight Studio", cta: "Book a quick call" },
  { value: "corporate", label: "Corporate", description: "Structured and brand-forward for teams and partnerships.", pro: true, tone: "charcoal", person: "Avery Chen", title: "VP, Strategic Partnerships", cta: "Schedule an introduction" },
  { value: "minimal", label: "Minimal", description: "Clean, modern, and founder-friendly.", pro: false, tone: "slate", person: "Jordan Wells", title: "Founder | Signature Pilot AI", cta: "See our latest work" },
  { value: "premium-split", label: "Premium", description: "A richer presentation with a stronger executive feel.", pro: true, tone: "violet", person: "Avery Chen", title: "Strategic Partnerships | Summit Ridge", cta: "Private client briefing" },
  { value: "mobile-compact", label: "Mobile Compact", description: "Built to stay readable in narrow mobile email apps.", pro: false, tone: "mobile", person: "Mason Ortiz", title: "Licensed General Contractor", cta: "Request a quote" }
];

const CONTROL_TABS = ["Content", "Style", "AI", "Export"];
const MOBILE_WORKSPACE_TABS = ["Templates", "Preview", "Edit", "Export"];

export default function BuilderPage() {
  const initialDraft = useMemo(() => loadInitialDraft(), []);
  const originalDraftRef = useRef(initialDraft);
  const [draft, setDraft] = useState(initialDraft);
  const [copyMessage, setCopyMessage] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [activeControlTab, setActiveControlTab] = useState("Content");
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState("Preview");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewZoom, setPreviewZoom] = useState("100");
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

  const artifacts = useMemo(() => generateSignatureArtifacts(draft), [draft]);
  const isFree = artifacts.effectiveDraft.tier === "free";
  const showAutoLayoutNotice = draft.layout === "mobile-compact" && draft.layoutAutoSelected;

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

  useEffect(() => {
    if (copyState === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
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
    const profile = SAMPLE_PROFILES[profileKey];
    if (!profile) {
      return;
    }

    setDraft((current) => ({
      ...current,
      ...profile,
      layout:
        current.tier === "free" && !["classic", "minimal", "mobile-compact"].includes(profile.layout)
          ? "classic"
          : profile.layout,
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
  }

  function handleLayoutChange(value) {
    setDraft((current) => ({
      ...current,
      layout: value,
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
    setMobileWorkspaceTab("Preview");
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
      setMobileWorkspaceTab("Preview");
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
      setMobileWorkspaceTab("Preview");
    } catch {
      try {
        copyRenderedSignatureFallback(artifacts.exportHtml);
        setCopyMessage("Signature copied using fallback mode.");
        setCopyState("success");
        setMobileWorkspaceTab("Preview");
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
    const fallback = getDefaultDraft();
    setDraft(fallback);
    window.localStorage.removeItem(STORAGE_KEY);
    setCopyMessage("Draft reset.");
  }

  function handleRevertToOriginal() {
    setDraft({ ...getDefaultDraft(), ...originalDraftRef.current });
    setCopyMessage("Reverted to the original signature.");
  }

  function restoreVersion(version) {
    setDraft({ ...getDefaultDraft(), ...version.draft });
    setCopyMessage("Previous signature restored.");
  }

  function deleteVersion(versionId) {
    setSavedVersions((current) => current.filter((version) => version.id !== versionId));
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

  const contentEditor = (
    <SignatureForm
      draft={draft}
      onApplySampleProfile={applySampleProfile}
      onFieldChange={updateField}
      onColorChange={(value) => updateField("brandColor", value)}
      onTierChange={handleTierChange}
      onFileSelect={readFileAsDataUrl}
      onFileRemove={(field) => updateField(field, "")}
    />
  );

  const styleEditor = (
    <section className="workspace-panel-section">
      <div className="workspace-section-heading">
        <div>
          <p className="eyebrow">Style</p>
          <h3>Fine-tune the signature</h3>
        </div>
      </div>
      <div className="field-grid">
        <label className="field">
          <span>Layout</span>
          <select aria-label="Preview layout" value={artifacts.effectiveDraft.layout} onChange={(event) => handleLayoutChange(event.target.value)}>
            {TEMPLATE_OPTIONS.map((option) => (
              <option key={option.value} disabled={isFree && option.pro} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="locked-copy">
            {isFree
              ? "Free Mode includes Professional Classic, Minimal, and Mobile Compact. Corporate and Premium unlock with Pro."
              : "Use Mobile Compact if your signature looks squeezed in mobile email apps."}
          </small>
          {showAutoLayoutNotice ? <small className="support-copy">Mobile Compact selected for better mobile email compatibility.</small> : null}
        </label>

        <label className="field">
          <span>Brand colour</span>
          <input type="color" value={draft.brandColor} onChange={(event) => updateField("brandColor", event.target.value)} />
        </label>

        <label className="field">
          <span>Logo size</span>
          <select aria-label="Preview logo size" value={artifacts.effectiveDraft.logoSize} onChange={(event) => updateField("logoSize", event.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option disabled={isFree} value="extra-large">Extra Large</option>
            <option disabled={isFree} value="custom">Custom</option>
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
              onChange={(event) => updateField("customLogoWidth", event.target.value)}
            />
            <small className="support-copy">Range: 40px to 180px.</small>
          </label>
        ) : null}

        <label className="field">
          <span>Divider</span>
          <select
            aria-label="Preview divider"
            disabled={isFree || artifacts.effectiveDraft.layout === "mobile-compact"}
            value={artifacts.effectiveDraft.showDivider ? "on" : "off"}
            onChange={(event) => updateField("showDivider", event.target.value === "on")}
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
            onChange={(event) => updateField("includeBranding", event.target.value === "include")}
          >
            <option value="include">Include</option>
            <option value="remove">Remove</option>
          </select>
          <small className="locked-copy">{isFree ? "Signature Pilot AI branding included." : "Pro can export clean unbranded HTML."}</small>
        </label>
      </div>
      <div className="workspace-inline-actions">
        <button className="button button-secondary button-inline" type="button" onClick={handleRevertToOriginal}>
          Revert to Original
        </button>
        {copyMessage ? <p className="support-copy">{copyMessage}</p> : null}
      </div>
    </section>
  );

  const aiEditor = (
    <div className="workspace-ai-grid">
      <AiSuggestionPanel
        draft={draft}
        onAfterGenerate={() => setMobileWorkspaceTab("Preview")}
        onApplySuggestions={({ mode, suggestions }) => {
          setDraft((current) => applySuggestedFields(current, suggestions, mode));
          setCopyMessage(`${mode} applied.`);
          setMobileWorkspaceTab("Preview");
        }}
        onSaveVersion={saveCurrentVersion}
      />

      <section className="panel workspace-history-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Recovery</p>
            <h2>Recent Signature Versions</h2>
          </div>
          <button className="button button-secondary button-inline" type="button" onClick={() => saveCurrentVersion("Manual save")}>
            Save Current Version
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
                <div className="button-row">
                  <button className="button button-primary" type="button" onClick={() => restoreVersion(version)}>
                    Restore
                  </button>
                  <button className="button button-ghost" type="button" onClick={() => deleteVersion(version.id)}>
                    Delete version
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="support-copy">Save current work or apply AI suggestions to build a recoverable version history.</p>
        )}
      </section>
    </div>
  );

  const exportEditor = (
    <section className="panel export-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Export</p>
          <h2>Copy or download your signature</h2>
        </div>
      </div>
      <div className="workspace-export-grid">
        <div className="export-action-card">
          <button
            className={`button button-primary ${copyState === "success" ? "button-success" : ""} ${copyState === "error" ? "button-error" : ""}`}
            type="button"
            onClick={handleCopySignature}
          >
            {copyState === "success" ? "Copied!" : "Copy Signature"}
          </button>
          <p className="support-copy">Copy Signature: best for Gmail, Outlook, Apple Mail, Yahoo. Copies the finished visual signature.</p>
        </div>

        {!isFree ? (
          <div className="export-action-card">
            <button className="button button-secondary" type="button" onClick={() => handleCopy(artifacts.exportHtml, "Raw HTML")}>
              Copy Raw HTML
            </button>
            <p className="support-copy">Copy Raw HTML: Pro only. For platforms that specifically ask for HTML code.</p>
          </div>
        ) : null}

        {!isFree ? (
          <div className="export-action-card">
            <button className="button button-secondary" type="button" onClick={() => handleCopy(artifacts.plainText, "Plain text signature")}>
              Copy Plain Text Signature
            </button>
            <p className="support-copy">Copy Plain Text Signature: copies a text-only fallback.</p>
          </div>
        ) : null}

        <div className="export-action-card">
          <button className="button button-secondary" disabled={isFree} type="button" onClick={handleDownloadHtml}>
            Download HTML File
          </button>
          <p className="support-copy">Download HTML File: Pro export/download backup.</p>
        </div>

        <div className="export-action-card">
          <button className="button button-ghost" type="button" onClick={handleReset}>
            Reset
          </button>
          <p className="support-copy">Reset: clears the current draft and starts over.</p>
        </div>
      </div>
      <p className="support-copy">
        Use Copy Signature for Gmail, Outlook, Apple Mail, and Yahoo. Do not paste raw HTML into your email settings unless the platform specifically asks for HTML.
      </p>
      {isFree ? <p className="locked-copy">Free signatures include Signature Pilot AI branding. Editing/removing branding is a Pro feature.</p> : null}
      {copyState === "success" ? <p className="copy-feedback copy-feedback-success">Signature copied. Paste it into Gmail, Outlook, Apple Mail, or Yahoo.</p> : null}
      {copyState === "error" ? <p className="copy-feedback copy-feedback-error">Copy failed. Try again or use another browser.</p> : null}
      {isFree ? <p className="locked-copy">Free signatures are branded and limited. Upgrade to Pro to remove branding, unlock advanced layout controls, and export clean editable HTML.</p> : null}
      <p className="support-copy">
        Why can I still edit after pasting? Email clients such as Outlook and Gmail allow users to edit pasted signature content. Signature Pilot AI controls what is generated and exported, but cannot lock third-party editors. Pro unlocks clean, editable, unbranded output.
      </p>
      {copyMessage ? <p className="support-copy">{copyMessage}</p> : null}
    </section>
  );

  return (
    <div className="page-stack workspace-page">
      <section className="workspace-topbar panel">
        <div className="workspace-topbar-copy">
          <p className="eyebrow">Builder workspace</p>
          <h1>Build once, paste anywhere.</h1>
          <p className="hero-subheadline">A focused workspace for professional email signatures that stay clean in Gmail, Outlook, Apple Mail, and Yahoo.</p>
        </div>
        <div className="workspace-topbar-actions">
          <label className="tier-toggle workspace-mode-control">
            <span>Mode</span>
            <select value={draft.tier} onChange={(event) => handleTierChange(event.target.value)}>
              <option value="free">Free Mode</option>
              <option value="pro">Pro Mode</option>
            </select>
          </label>
          <Link className="button button-secondary" to="/install">
            Install Guide
          </Link>
          <Link className="button button-primary" to="/upgrade">
            Upgrade
          </Link>
        </div>
      </section>

      <div className="workspace-mobile-tabs">
        {MOBILE_WORKSPACE_TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${mobileWorkspaceTab === tab ? "tab-button-active" : ""}`}
            type="button"
            onClick={() => {
              setMobileWorkspaceTab(tab);
              if (tab === "Export") {
                setActiveControlTab("Export");
              } else if (tab === "Edit" && activeControlTab === "Export") {
                setActiveControlTab("Content");
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="workspace-shell">
        <aside className={`panel workspace-templates ${mobileWorkspaceTab === "Templates" ? "workspace-mobile-active" : ""}`}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Templates</p>
              <h2>Pick a signature style</h2>
            </div>
          </div>
          <div className="workspace-template-list">
            {TEMPLATE_OPTIONS.map((template) => {
              const locked = isFree && template.pro;
              const active = artifacts.effectiveDraft.layout === template.value;
              return (
                <button
                  key={template.value}
                  className={`template-card workspace-template-card ${active ? "template-card-active" : ""} ${locked ? "template-card-locked" : ""}`}
                  disabled={locked}
                  type="button"
                  onClick={() => handleLayoutChange(template.value)}
                >
                  <div className={`template-mini-preview template-mini-preview-${template.tone}`}>
                    <div className="template-mini-logo" />
                    <div className="template-mini-copy">
                      <span className="template-mini-name">{template.person}</span>
                      <span className="template-mini-title">{template.title}</span>
                      <span className="template-mini-cta">{template.cta}</span>
                    </div>
                  </div>
                  <div className="workspace-template-copy">
                    <div className="workspace-template-title-row">
                      <strong>{template.label}</strong>
                      <span className={`workspace-badge ${locked ? "workspace-badge-pro" : "workspace-badge-free"}`}>{template.pro ? "Pro" : "Free"}</span>
                    </div>
                    <span>{template.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className={`panel workspace-preview ${mobileWorkspaceTab === "Preview" ? "workspace-mobile-active" : ""}`}>
          <SignaturePreview
            draft={draft}
            effectiveDraft={artifacts.effectiveDraft}
            previewZoom={previewZoom}
            previewDevice={previewDevice}
            onPreviewZoomChange={setPreviewZoom}
            onPreviewDeviceChange={setPreviewDevice}
          />
        </div>

        <div className={`panel workspace-controls ${mobileWorkspaceTab === "Edit" || mobileWorkspaceTab === "Export" ? "workspace-mobile-active" : ""}`}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Controls</p>
              <h2>Edit, refine, and export</h2>
            </div>
          </div>

          <div className="workspace-control-tabs">
            {CONTROL_TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeControlTab === tab ? "tab-button-active" : ""}`}
                type="button"
                onClick={() => {
                  setActiveControlTab(tab);
                  setMobileWorkspaceTab(tab === "Export" ? "Export" : "Edit");
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="workspace-control-body">
            <div className={`workspace-tab-panel ${activeControlTab === "Content" ? "workspace-tab-panel-active" : ""}`}>{contentEditor}</div>
            <div className={`workspace-tab-panel ${activeControlTab === "Style" ? "workspace-tab-panel-active" : ""}`}>{styleEditor}</div>
            <div className={`workspace-tab-panel ${activeControlTab === "AI" ? "workspace-tab-panel-active" : ""}`}>{aiEditor}</div>
            <div className={`workspace-tab-panel ${activeControlTab === "Export" ? "workspace-tab-panel-active" : ""}`}>{exportEditor}</div>
          </div>
        </div>
      </section>
    </div>
  );
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

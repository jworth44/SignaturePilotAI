import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AiSuggestionPanel from "../components/AiSuggestionPanel";
import AiLogoStudio from "../components/AiLogoStudio";
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
    layout: "contractor",
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
    layout: "executive",
    ctaText: "Schedule an introduction"
  }
};

export default function BuilderPage() {
  const [draft, setDraft] = useState(() => {
    const fallback = getDefaultDraft();
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
    } catch {
      return fallback;
    }
  });
  const [copyMessage, setCopyMessage] = useState("");
  const [copyState, setCopyState] = useState("idle");
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
  const isFree = draft.tier === "free";
  const showAutoLayoutNotice = draft.layout === "mobile-compact" && draft.layoutAutoSelected;

  useEffect(() => {
    function maybeAutoSelectMobileLayout() {
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

    maybeAutoSelectMobileLayout();
    window.addEventListener("resize", maybeAutoSelectMobileLayout);
    return () => window.removeEventListener("resize", maybeAutoSelectMobileLayout);
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
      layout: current.tier === "free" && profile.layout !== "mobile-compact" && profile.layout !== "minimal" ? "executive" : profile.layout,
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
  }

  function applySuggestions(payload) {
    setDraft((current) => applySuggestedFields(current, payload));
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
    } catch {
      try {
        copyRenderedSignatureFallback(artifacts.exportHtml);
        setCopyMessage("Signature copied using fallback mode.");
        setCopyState("success");
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
    link.download = "signatureforge-signature.html";
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

  function restoreVersion(version) {
    setDraft({ ...getDefaultDraft(), ...version.draft });
    setCopyMessage("Previous signature restored.");
  }

  function deleteVersion(versionId) {
    setSavedVersions((current) => current.filter((version) => version.id !== versionId));
  }

  return (
    <div className="page-stack">
      <section className="builder-hero">
        <div>
          <p className="eyebrow">Builder workspace</p>
          <h1>Build once, paste anywhere.</h1>
          <p className="hero-subheadline">
            Create a clean signature with professional spacing, clickable links, fixed image sizing, and zero visible table borders.
          </p>
        </div>
        <div className="builder-hero-links">
          <Link className="button button-secondary" to="/install">
            View Install Guide
          </Link>
          <Link className="button button-primary" to="/upgrade">
            Compare Pro plans
          </Link>
        </div>
      </section>

      <section className="builder-layout">
        <div className="builder-left-column">
          <SignatureForm
            draft={draft}
            effectiveLayout={artifacts.effectiveDraft.layout}
            showAutoLayoutNotice={showAutoLayoutNotice}
            onApplySampleProfile={applySampleProfile}
            onFieldChange={updateField}
            onColorChange={(value) => updateField("brandColor", value)}
            onLayoutChange={handleLayoutChange}
            onTierChange={(value) =>
              setDraft((current) => ({
                ...current,
                tier: value,
                includeBranding: value === "free" ? true : current.includeBranding,
                layoutAutoSelected: false,
                logoSize:
                  value === "free" && (current.logoSize === "custom" || current.logoSize === "extra-large")
                    ? "large"
                    : current.logoSize
              }))
            }
            onDividerToggle={(value) => updateField("showDivider", value)}
            onLogoSizeChange={(value) => updateField("logoSize", value)}
            onCustomLogoWidthChange={(value) => updateField("customLogoWidth", value)}
            onBrandingToggle={(value) => updateField("includeBranding", value)}
            onFileSelect={readFileAsDataUrl}
            onFileRemove={(field) => updateField(field, "")}
          />

          <section className="panel">
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
              <p className="support-copy">Save current work or apply AI/logo changes to build a recoverable version history.</p>
            )}
          </section>

          <AiLogoStudio
            draft={draft}
            onSelectLogo={(value) => {
              saveCurrentVersion("Before logo insert");
              updateField("logoDataUrl", value);
            }}
            onLogoStyleChange={updateField}
          />

          <AiSuggestionPanel
            draft={draft}
            onApplySuggestions={({ mode, suggestions }) => {
              setDraft((current) => applySuggestedFields(current, suggestions, mode));
              setCopyMessage(`${mode} applied.`);
            }}
            onSaveVersion={saveCurrentVersion}
          />
        </div>

        <div className="builder-right-column">
          <SignaturePreview draft={draft} />

          <section className="panel export-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">HTML export</p>
                <h2>Use it in your email client</h2>
              </div>
            </div>
            <div className="button-row">
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
            {isFree ? (
              <p className="locked-copy">
                Free signatures include Signature Pilot AI branding. Editing/removing branding is a Pro feature.
              </p>
            ) : null}
            {copyState === "success" ? <p className="copy-feedback copy-feedback-success">Signature copied. Paste it into Gmail, Outlook, Apple Mail, or Yahoo.</p> : null}
            {copyState === "error" ? <p className="copy-feedback copy-feedback-error">Copy failed. Try again or use another browser.</p> : null}
            {isFree ? <p className="locked-copy">Free signatures are branded and limited. Upgrade to Pro to remove branding, unlock advanced layout controls, and export clean editable HTML.</p> : null}
            <p className="support-copy">
              Why can I still edit after pasting? Email clients such as Outlook and Gmail allow users to edit pasted signature content. Signature Pilot AI controls what is generated and exported, but cannot lock third-party editors. Pro unlocks clean, editable, unbranded output.
            </p>
            {copyMessage ? <p className="support-copy">{copyMessage}</p> : null}
          </section>
        </div>
      </section>
    </div>
  );
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

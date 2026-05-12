import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AiSuggestionPanel from "../components/AiSuggestionPanel";
import SignatureForm from "../components/SignatureForm";
import SignaturePreview from "../components/SignaturePreview";
import { generateSignatureArtifacts, getDefaultDraft } from "../utils/htmlSignatureGenerator";

const STORAGE_KEY = "signatureforge.ai.draft";

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

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const artifacts = useMemo(() => generateSignatureArtifacts(draft), [draft]);
  const isFree = draft.tier === "free";

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

  function applySuggestions(payload) {
    setDraft((current) => ({
      ...current,
      jobTitle: payload.suggestedTitleLine || current.jobTitle,
      ctaText: payload.suggestedCta || current.ctaText,
      disclaimer: payload.suggestedDisclaimer || current.disclaimer,
      brandDirection: payload.suggestedColorDirection || current.brandDirection,
      layout: current.tier === "pro" ? payload.suggestedLayoutValue || current.layout : current.layout
    }));
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
            onFieldChange={updateField}
            onColorChange={(value) => updateField("brandColor", value)}
            onLayoutChange={(value) => updateField("layout", value)}
            onTierChange={(value) =>
              setDraft((current) => ({
                ...current,
                tier: value,
                includeBranding: value === "free" ? true : current.includeBranding,
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

          <AiSuggestionPanel draft={draft} onApplySuggestions={applySuggestions} />
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
                  Copy Plain Text Signature
                </button>
              ) : null}
              <button className="button button-secondary" disabled={isFree} type="button" onClick={handleDownloadHtml}>
                Download HTML File
              </button>
              <button className="button button-ghost" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
            <p className="support-copy">
              Use Copy Signature for Gmail, Outlook, Apple Mail, and Yahoo. Do not paste raw HTML into your email settings unless the platform specifically asks for HTML.
            </p>
            {copyState === "success" ? <p className="copy-feedback copy-feedback-success">Signature copied. Paste it into Gmail, Outlook, Apple Mail, or Yahoo.</p> : null}
            {copyState === "error" ? <p className="copy-feedback copy-feedback-error">Copy failed. Try again or use another browser.</p> : null}
            {isFree ? <p className="locked-copy">Free users can copy and paste the finished branded signature only. Raw HTML and plain text export are Pro options.</p> : null}
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

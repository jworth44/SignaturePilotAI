import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STYLE_OPTIONS = ["Modern", "Luxury", "Minimal", "Corporate", "Contractor", "Tech", "Bold"];

export default function AiLogoStudio({ draft, onSelectLogo, onLogoStyleChange }) {
  const isFree = draft.tier === "free";
  const [businessName, setBusinessName] = useState(draft.companyName || "Signature Pilot AI");
  const [industry, setIndustry] = useState("Professional services");
  const [style, setStyle] = useState("Modern");
  const [primaryColor, setPrimaryColor] = useState(draft.brandColor || "#2663ff");
  const [secondaryColor, setSecondaryColor] = useState("#8b6dff");
  const [instructions, setInstructions] = useState("Make it cleaner and more premium.");
  const [referenceImages, setReferenceImages] = useState([]);
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [logoAiEnabled, setLogoAiEnabled] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    setBusinessName(draft.companyName || "Signature Pilot AI");
  }, [draft.companyName]);

  useEffect(() => {
    setPrimaryColor(draft.brandColor || "#2663ff");
  }, [draft.brandColor]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/ai/logo-studio/status");
        const payload = await response.json();
        if (!cancelled) {
          setLogoAiEnabled(Boolean(payload.logoAiEnabled));
          setStatusMessage(payload.message || "");
          setStatusLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setLogoAiEnabled(false);
          setStatusMessage("AI image generation is not connected in this deployment.");
          setStatusLoaded(true);
        }
      }
    }

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleReferenceUpload(files) {
    const incoming = Array.from(files || []).slice(0, 3);
    const mapped = await Promise.all(
      incoming.map(async (file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        dataUrl: await readFileAsDataUrl(file)
      }))
    );

    setReferenceImages((current) => [...current, ...mapped].slice(0, 3));
    setStatusMessage(mapped.length ? "Reference image ready. You can use it as a visual guide once AI image generation is connected." : statusMessage);
  }

  function removeReferenceImage(id) {
    setReferenceImages((current) => current.filter((image) => image.id !== id));
  }

  async function runStudioAction(action) {
    if (!logoAiEnabled) {
      setError("AI image generation is not connected in this deployment.");
      setStatusMessage("");
      return;
    }

    if (action === "blend" && referenceImages.length === 0) {
      setError("Blend Uploaded Images needs at least one uploaded reference image.");
      setStatusMessage("");
      return;
    }

    if (action === "refine" && !draft.logoDataUrl) {
      setError("Select or upload a logo before refining it.");
      setStatusMessage("");
      return;
    }

    setLoadingAction(action);
    setError("");
    setStatusMessage("");
    try {
      const response = await fetch("/api/ai/logo-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          businessName,
          industry,
          style,
          primaryColor,
          secondaryColor,
          instructions,
          references: referenceImages.map((image) => image.dataUrl),
          selectedLogo: draft.logoDataUrl || ""
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to generate logo concepts.");
      }

      setStatusMessage(payload.message || "AI logo action completed.");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingAction("");
    }
  }

  if (isFree) {
    return (
      <section className="panel ai-logo-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">AI Logo Studio</p>
            <h2>Generate and refine logo concepts</h2>
          </div>
        </div>
        <div className="locked-banner">
          AI Logo Studio is included with Pro. Generate, upload, blend, and refine logo concepts for your signature.
        </div>
        <Link className="button button-primary button-inline" to="/upgrade">
          Upgrade to Pro
        </Link>
      </section>
    );
  }

  return (
    <section className="panel ai-logo-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">AI Logo Studio</p>
          <h2>Pro logo workflow</h2>
        </div>
      </div>

      <div className="field-grid field-grid-tight">
        <label className="field">
          <span>Business name</span>
          <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
        </label>
        <label className="field">
          <span>Industry</span>
          <input list="logo-studio-industries" value={industry} onChange={(event) => setIndustry(event.target.value)} />
          <datalist id="logo-studio-industries">
            <option value="Contractor / Trades" />
            <option value="Safety Consulting" />
            <option value="Real Estate" />
            <option value="Law / Legal" />
            <option value="Finance / Insurance" />
            <option value="Medical / Health" />
            <option value="Fitness / Coaching" />
            <option value="Tech / SaaS" />
            <option value="Retail / Ecommerce" />
            <option value="Creative / Design" />
            <option value="General Professional" />
          </datalist>
        </label>
        <label className="field">
          <span>Style</span>
          <select value={style} onChange={(event) => setStyle(event.target.value)}>
            {STYLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Primary color</span>
          <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
        </label>
        <label className="field">
          <span>Secondary color</span>
          <input type="color" value={secondaryColor} onChange={(event) => setSecondaryColor(event.target.value)} />
        </label>
      </div>

      <label className="field">
        <span>Refinement instructions</span>
        <textarea
          className="studio-textarea"
          rows="4"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
        />
      </label>

      <div className="form-section">
        <div className="form-section-heading">
          <div>
            <h3>Reference uploads</h3>
            <p className="support-copy">Upload up to 3 reference images or sketches now. These stay local to this browser for the MVP.</p>
          </div>
        </div>
        <label className="upload-dropzone studio-dropzone" htmlFor="ai-logo-references">
          <input
            id="ai-logo-references"
            accept="image/*"
            multiple
            type="file"
            onChange={(event) => handleReferenceUpload(event.target.files)}
          />
          <span>Upload reference images</span>
        </label>
        {referenceImages.length ? (
          <div className="studio-upload-grid">
            {referenceImages.map((image, index) => (
              <div key={image.id} className="studio-upload-card">
                <img alt={`Reference ${index + 1}`} className="studio-upload-preview" src={image.dataUrl} />
                <div className="studio-upload-meta">
                  <strong>{image.name}</strong>
                  <button className="text-button" type="button" onClick={() => removeReferenceImage(image.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="form-section">
        <div className="form-section-heading">
          <div>
            <h3>Logo cleanup controls</h3>
            <p className="support-copy">Pro users can still tune an uploaded logo in this deployment while live AI image generation is offline.</p>
          </div>
        </div>
        <div className="field-grid field-grid-tight">
          <label className="field">
            <span>Fit</span>
            <select value={draft.logoFit} onChange={(event) => onLogoStyleChange("logoFit", event.target.value)}>
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
            </select>
          </label>
          <label className="field">
            <span>Shape</span>
            <select value={draft.logoShape} onChange={(event) => onLogoStyleChange("logoShape", event.target.value)}>
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="circle">Circle</option>
            </select>
          </label>
          <label className="field">
            <span>Use current uploaded logo</span>
            <button className="button button-secondary button-inline" disabled={!draft.logoDataUrl} type="button" onClick={() => onSelectLogo(draft.logoDataUrl)}>
              Insert current logo into signature
            </button>
          </label>
        </div>
      </div>

      <div className="button-row">
        <button className="button button-primary" disabled={!logoAiEnabled || Boolean(loadingAction)} type="button" onClick={() => runStudioAction("generate")}>
          {loadingAction === "generate" ? "Generating..." : "Generate Logo Concepts"}
        </button>
        <button className="button button-secondary" disabled={!logoAiEnabled || Boolean(loadingAction)} type="button" onClick={() => runStudioAction("blend")}>
          {loadingAction === "blend" ? "Blending..." : "Blend Uploaded Images"}
        </button>
        <button className="button button-secondary" disabled={!logoAiEnabled || Boolean(loadingAction)} type="button" onClick={() => runStudioAction("refine")}>
          {loadingAction === "refine" ? "Refining..." : "Refine Selected Logo"}
        </button>
      </div>

      {!statusLoaded ? <p className="support-copy">Checking AI logo capability...</p> : null}
      {!logoAiEnabled && statusLoaded ? (
        <div className="locked-banner">
          AI logo generation is not configured yet. Pro Logo Studio will be available when live AI image generation is connected.
        </div>
      ) : null}
      {statusLoaded && !logoAiEnabled ? <p className="support-copy">AI image generation is not connected in this deployment.</p> : null}
      {error ? <p className="error-copy">{error}</p> : null}
      {statusMessage && logoAiEnabled ? <p className="support-copy">{statusMessage}</p> : null}
    </section>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the uploaded image."));
    reader.readAsDataURL(file);
  });
}

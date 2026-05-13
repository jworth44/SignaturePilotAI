import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const STYLE_OPTIONS = ["Modern", "Luxury", "Minimal", "Corporate", "Contractor", "Tech", "Bold"];

export default function AiLogoStudio({ draft, onSelectLogo }) {
  const isFree = draft.tier === "free";
  const [businessName, setBusinessName] = useState(draft.companyName || "Signature Pilot AI");
  const [industry, setIndustry] = useState("Professional services");
  const [style, setStyle] = useState("Modern");
  const [primaryColor, setPrimaryColor] = useState(draft.brandColor || "#2663ff");
  const [secondaryColor, setSecondaryColor] = useState("#8b6dff");
  const [instructions, setInstructions] = useState("Make it cleaner and more premium.");
  const [referenceImages, setReferenceImages] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [selectedConceptId, setSelectedConceptId] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    setBusinessName(draft.companyName || "Signature Pilot AI");
  }, [draft.companyName]);

  useEffect(() => {
    setPrimaryColor(draft.brandColor || "#2663ff");
  }, [draft.brandColor]);

  const selectedConcept = useMemo(
    () => concepts.find((concept) => concept.id === selectedConceptId) || null,
    [concepts, selectedConceptId]
  );

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
  }

  function removeReferenceImage(id) {
    setReferenceImages((current) => current.filter((image) => image.id !== id));
  }

  async function runStudioAction(action) {
    if (action === "blend" && referenceImages.length === 0) {
      setError("Blend Uploaded Images needs at least one uploaded reference image.");
      setStatusMessage("");
      return;
    }

    if (action === "refine" && !selectedConcept) {
      setError("Select a logo concept before refining it.");
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
          selectedLogo: selectedConcept?.dataUrl || ""
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to generate logo concepts.");
      }

      setConcepts(payload.concepts || []);
      setSource(payload.source || "");
      setStatusMessage(payload.message || "");
      if (!payload.concepts?.length) {
        setError("No logo concepts were returned. Try another prompt or style.");
      }
      if (payload.concepts?.[0]?.id) {
        setSelectedConceptId(payload.concepts[0].id);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingAction("");
    }
  }

  function handleSelectForSignature(concept) {
    setSelectedConceptId(concept.id);
    onSelectLogo(concept.dataUrl);
    setStatusMessage("Selected logo inserted into your signature.");
  }

  async function handleRefineConcept(concept) {
    setSelectedConceptId(concept.id);
    await runStudioAction("refine");
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
        <Link className="button button-primary" to="/upgrade">
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
          <h2>Generate, blend, and refine logo concepts</h2>
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
            <p className="support-copy">Upload up to 3 reference images, logos, or sketches for blend and refine actions.</p>
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

      <div className="button-row">
        <button className="button button-primary" disabled={Boolean(loadingAction)} type="button" onClick={() => runStudioAction("generate")}>
          {loadingAction === "generate" ? "Generating..." : "Generate Logo Concepts"}
        </button>
        <button
          className="button button-secondary"
          disabled={Boolean(loadingAction)}
          type="button"
          onClick={() => runStudioAction("blend")}
        >
          {loadingAction === "blend" ? "Blending..." : "Blend Uploaded Images"}
        </button>
        <button
          className="button button-secondary"
          disabled={Boolean(loadingAction)}
          type="button"
          onClick={() => runStudioAction("refine")}
        >
          {loadingAction === "refine" ? "Refining..." : "Refine Selected Logo"}
        </button>
      </div>

      {error ? <p className="error-copy">{error}</p> : null}
      {statusMessage ? <p className="support-copy">{statusMessage}</p> : null}
      {source === "fallback" ? (
        <p className="locked-copy">Demo logo concepts generated locally because AI image generation is not configured.</p>
      ) : null}

      {concepts.length ? (
        <div className="logo-concepts-grid">
          {concepts.map((concept) => (
            <article key={concept.id} className={`logo-concept-card ${selectedConceptId === concept.id ? "logo-concept-card-active" : ""}`}>
              <img alt={concept.label} className="logo-concept-image" src={concept.dataUrl} />
              <strong>{concept.label}</strong>
              <span>{concept.description}</span>
              <div className="button-row">
                <button className="button button-primary" type="button" onClick={() => handleSelectForSignature(concept)}>
                  Select for Signature
                </button>
                <button className="button button-secondary" type="button" onClick={() => handleRefineConcept(concept)}>
                  Refine
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
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

import React, { useEffect, useMemo, useState } from "react";

const TONE_OPTIONS = ["Professional", "Friendly", "Premium", "Contractor", "Minimal"];
const GOAL_OPTIONS = ["Book calls", "Get quotes", "Show credibility", "Drive website visits"];
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
  "General Professional",
  "Custom"
];

export default function AiSuggestionPanel({ autoGenerateKey = 0, compact = false, draft, filters = null, onApplySuggestions, onSaveVersion, onAfterGenerate }) {
  const isFree = draft.tier === "free";
  const [industry, setIndustry] = useState("General Professional");
  const [customIndustry, setCustomIndustry] = useState("");
  const [tone, setTone] = useState("Professional");
  const [goal, setGoal] = useState("Show credibility");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState(null);

  const resolvedIndustry = useMemo(
    () => ((filters?.industry || industry) === "Custom" ? customIndustry.trim() || "Custom business" : filters?.industry || industry),
    [customIndustry, filters?.industry, industry]
  );
  const resolvedTone = filters?.tone || tone;
  const resolvedGoal = filters?.goal || goal;

  useEffect(() => {
    if (!autoGenerateKey) {
      return;
    }
    handleGenerate();
  }, [autoGenerateKey]);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/signature-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: resolvedIndustry,
          tone: resolvedTone,
          goal: resolvedGoal,
          companyName: draft.companyName,
          fullName: draft.fullName
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to generate suggestions.");
      }
      setSuggestions(payload);
      onAfterGenerate?.();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function applySuggestion(mode) {
    if (!suggestions) {
      return;
    }

    onSaveVersion?.(`Before AI ${mode.toLowerCase()}`);
    onApplySuggestions({ mode, suggestions });
  }

  function discardSuggestions() {
    setSuggestions(null);
    setError("");
  }

  const content = (
    <>
      {!compact ? (
        <>
          <div className="panel-header">
            <div>
              <p className="eyebrow">AI assistant panel</p>
              <h2>Built-in smart suggestions</h2>
            </div>
          </div>

          <div className="field-grid field-grid-tight">
            <label className="field">
              <span>Business type / industry</span>
              <select disabled={isFree} value={industry} onChange={(event) => setIndustry(event.target.value)}>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {industry === "Custom" ? (
              <label className="field">
                <span>Custom industry</span>
                <input disabled={isFree} value={customIndustry} onChange={(event) => setCustomIndustry(event.target.value)} />
              </label>
            ) : null}

            <label className="field">
              <span>Desired tone</span>
              <select disabled={isFree} value={tone} onChange={(event) => setTone(event.target.value)}>
                {TONE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Goal</span>
              <select disabled={isFree} value={goal} onChange={(event) => setGoal(event.target.value)}>
                {GOAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className={`button ${isFree ? "button-locked" : "button-primary"} button-inline`} disabled={loading || isFree} type="button" onClick={handleGenerate}>
            {loading ? "Generating..." : "Generate Signature Suggestions"}
          </button>
        </>
      ) : null}

      {isFree ? <p className="locked-copy">Advanced AI suggestions are available in Pro Mode.</p> : <p className="support-copy">Built-in smart suggestions help you improve wording without auto-overwriting the current signature.</p>}
      {error ? <p className="error-copy">{error}</p> : null}

      {suggestions ? (
        <div className="suggestion-card">
          <div>
            <span className="suggestion-label">Suggested title line</span>
            <strong>{suggestions.suggestedTitleLine}</strong>
          </div>
          <div>
            <span className="suggestion-label">Suggested CTA</span>
            <p>{suggestions.suggestedCta}</p>
          </div>
          <div>
            <span className="suggestion-label">Suggested disclaimer</span>
            <p>{suggestions.suggestedDisclaimer}</p>
          </div>
          <div>
            <span className="suggestion-label">Suggested colour direction</span>
            <p>{suggestions.suggestedColorDirection}</p>
          </div>
          <div>
            <span className="suggestion-label">Suggested layout</span>
            <p>{suggestions.suggestedLayout}</p>
          </div>
          <p className="support-copy">Current layout will stay unchanged unless you explicitly apply the suggested layout.</p>
          <p className="support-copy">
            Source: {suggestions.source === "openai" ? "OpenAI API" : "Built-in smart suggestions"}
          </p>
          {suggestions.message ? <p className="support-copy">{suggestions.message}</p> : null}
          <div className="button-row">
            <button className="button button-primary" type="button" onClick={() => applySuggestion("Apply Suggestions")}>
              Apply Suggestions
            </button>
            <button className="button button-secondary" type="button" onClick={() => applySuggestion("Apply Only Title")}>
              Apply Only Title
            </button>
            <button className="button button-secondary" type="button" onClick={() => applySuggestion("Apply Only CTA")}>
              Apply Only CTA
            </button>
            <button className="button button-secondary" type="button" onClick={() => applySuggestion("Apply Only Disclaimer")}>
              Apply Only Disclaimer
            </button>
            <button className="button button-secondary" type="button" onClick={() => applySuggestion("Apply Suggested Layout")}>
              Apply Suggested Layout
            </button>
            <button className="button button-ghost" type="button" onClick={discardSuggestions}>
              Discard Suggestions
            </button>
          </div>
        </div>
      ) : null}
    </>
  );

  if (compact) {
    return <div className="generator-embedded-ai">{content}</div>;
  }

  return <section className="panel ai-panel">{content}</section>;
}

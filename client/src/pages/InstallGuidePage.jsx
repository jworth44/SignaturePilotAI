import React, { useState } from "react";

const GUIDES = {
  Gmail: [
    "Open Gmail and click Settings.",
    "Choose See all settings.",
    "Scroll to Signature and click Create new.",
    "Paste your copied signature into the editor.",
    "Assign it to new emails and replies if needed.",
    "Scroll down and click Save changes."
  ],
  "Outlook / Hotmail": [
    "Open Outlook and click Settings.",
    "Choose Mail, then Compose and reply.",
    "Find Email signature.",
    "Paste your copied signature into the signature box.",
    "Set your default signature preferences.",
    "Click Save."
  ],
  "Apple Mail": [
    "Open Mail and go to Mail, then Settings.",
    "Open the Signatures tab.",
    "Select the email account you want to edit.",
    "Click the plus button to add a signature.",
    "Paste the copied signature into the signature area.",
    "Close Settings to save."
  ],
  Yahoo: [
    "Open Yahoo Mail and click Settings.",
    "Choose More Settings.",
    "Open Writing email.",
    "Turn Signature on for the target account.",
    "Paste your copied signature into the editor.",
    "Yahoo saves automatically once the content is entered."
  ],
  "General HTML": [
    "Copy the generated signature HTML from the builder.",
    "Open your email client or CRM signature settings.",
    "Switch to HTML or rich-text editing mode if available.",
    "Paste the signature content.",
    "Send yourself a test email to confirm links, spacing, and image sizing.",
    "If the client strips formatting, try the downloaded HTML file or paste into a richer editor first."
  ]
};

const TABS = Object.keys(GUIDES);

export default function InstallGuidePage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="page-stack public-page-stack">
      <section className="public-hero public-hero-compact">
        <div className="public-hero-copy public-hero-copy-centered">
          <p className="eyebrow">Install guide</p>
          <h1>Paste your signature into the email client you already use.</h1>
          <p className="hero-subheadline public-hero-subheadline">
            Signature Pilot AI is built around copy-and-paste installation, with Universal layouts designed for the safest path across major email clients.
          </p>
        </div>
      </section>

      <section className="install-guide-layout">
        <article className="panel install-panel public-install-panel">
          <div className="tab-row public-tab-row" role="tablist" aria-label="Install guides">
            {TABS.map((tab) => (
              <button
                key={tab}
                aria-selected={activeTab === tab}
                className={`tab-button ${activeTab === tab ? "tab-button-active" : ""}`}
                role="tab"
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="install-guide-content">
            <div className="install-guide-main">
              <p className="pricing-name">{activeTab}</p>
              <h2>{activeTab} install steps</h2>
              <ol className="install-steps">
                {GUIDES[activeTab].map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="install-guide-side">
              <div className="comparison-card">
                <strong>Compatibility tip</strong>
                <p>Copy Signature is the safest export path for Gmail, Outlook, Apple Mail, and Yahoo.</p>
              </div>
              <div className="comparison-card">
                <strong>Troubleshooting</strong>
                <p>If formatting looks stripped, test the downloaded HTML file or paste into a richer signature editor first.</p>
              </div>
              <div className="comparison-card comparison-card-accent">
                <strong>Universal vs Modern</strong>
                <p>Universal layouts are the safest default. Modern layouts may need extra Outlook testing before broad rollout.</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

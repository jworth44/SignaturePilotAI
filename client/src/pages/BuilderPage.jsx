import React, { useEffect, useMemo, useRef, useState } from "react";
import { Lock } from "lucide-react";
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
  {
    value: "professional-classic",
    label: "Professional Classic",
    description: "Balanced, traditional, and designed for maximum email-client compatibility.",
    compatibility: "universal",
    pro: false
  },
  {
    value: "executive-corporate",
    label: "Executive Corporate",
    description: "Structured leadership layout with stronger hierarchy and a more modern header treatment.",
    compatibility: "modern",
    pro: true
  },
  {
    value: "minimal-clean",
    label: "Minimal Clean",
    description: "Lighter, cleaner, and compatibility-first when you want a minimal signature.",
    compatibility: "universal",
    pro: false
  },
  {
    value: "premium-consultant",
    label: "Premium Consultant",
    description: "Refined spacing with a premium consultant feel for polished client-facing signatures.",
    compatibility: "modern",
    pro: true
  },
  {
    value: "contractor-bold",
    label: "Contractor Bold",
    description: "Service-first layout with stronger CTA emphasis and bolder brand presence.",
    compatibility: "modern",
    pro: false
  },
  {
    value: "real-estate",
    label: "Real Estate",
    description: "Listing-friendly structure with stronger profile framing for property-focused outreach.",
    compatibility: "modern",
    pro: true
  },
  {
    value: "legal-finance",
    label: "Legal / Finance",
    description: "Credibility-forward layout for advisory, legal, and financial communication.",
    compatibility: "modern",
    pro: true
  },
  {
    value: "health-medical",
    label: "Health / Medical",
    description: "Calm, card-style presentation for care-focused communication.",
    compatibility: "modern",
    pro: true
  },
  {
    value: "creative-designer",
    label: "Creative / Designer",
    description: "Portfolio-ready layout with more visual contrast for brand-led signatures.",
    compatibility: "modern",
    pro: true
  },
  {
    value: "tech-saas",
    label: "Tech / SaaS",
    description: "Modern product-forward layout with compact contact chips and sharper hierarchy.",
    compatibility: "modern",
    pro: true
  },
  {
    value: "mobile-compact",
    label: "Mobile Compact",
    description: "Stacked and centered for narrow screens and safer mobile-email rendering.",
    compatibility: "universal",
    pro: false
  },
  {
    value: "signature-card",
    label: "Signature Card",
    description: "Contained card-style signature for polished personal branding.",
    compatibility: "modern",
    pro: true
  }
];

const TEMPLATE_DEFAULT_COLORS = {
  "professional-classic": "#2563EB",
  "executive-corporate": "#1E293B",
  "minimal-clean": "#374151",
  "premium-consultant": "#4F46E5",
  "contractor-bold": "#EA580C",
  "real-estate": "#059669",
  "legal-finance": "#1E3A5F",
  "health-medical": "#0D9488",
  "creative-designer": "#7C3AED",
  "tech-saas": "#0F172A",
  "mobile-compact": "#2563EB",
  "signature-card": "#6366F1",
  "corporate-card": "#334155"
};

const TEMPLATE_PREVIEW_PROFILES = {
  "professional-classic": {
    fullName: "Amelia Stone",
    jobTitle: "Client Services Director",
    companyName: "Northlight Advisory",
    phone: "+1 (204) 555-0148",
    email: "amelia@northlightadvisory.com",
    website: "northlightadvisory.com",
    location: "Winnipeg, MB",
    ctaText: "Book a review call",
    ctaUrl: "https://northlightadvisory.com/review",
    disclaimer: "Please let me know if there is anything you would like me to prepare in advance.",
    galleryNote: "Traditional, polished, and safest for broad client paste scenarios.",
    fit: "Consulting / Professional services",
    previewTag: "Outlook-safe classic",
    templateVariant: 2
  },
  "executive-corporate": {
    fullName: "Darius Cole",
    jobTitle: "Managing Partner",
    companyName: "Harbor Crest Capital",
    phone: "+1 (204) 555-0182",
    email: "darius@harborcrestcapital.com",
    website: "harborcrestcapital.com",
    location: "Toronto, ON",
    ctaText: "Schedule leadership call",
    ctaUrl: "https://harborcrestcapital.com/intro",
    disclaimer: "Confidential planning discussions are scheduled based on current advisory availability.",
    galleryNote: "Boardroom-ready hierarchy with a stronger executive header and cleaner prestige cues.",
    fit: "Executive / Corporate",
    previewTag: "Executive header",
    templateVariant: 5
  },
  "minimal-clean": {
    fullName: "Sophie Bennett",
    jobTitle: "Office Administration Lead",
    companyName: "Ledger Lane Support",
    phone: "+1 (204) 555-0195",
    email: "sophie@ledgerlane.ca",
    website: "ledgerlane.ca",
    location: "Calgary, AB",
    ctaText: "Reply with next steps",
    ctaUrl: "https://ledgerlane.ca/contact",
    disclaimer: "I am happy to coordinate timing and materials for your next follow-up.",
    galleryNote: "Quiet, editorial spacing with a more refined premium office feel.",
    fit: "Operations / Admin",
    previewTag: "Editorial minimal",
    templateVariant: 3
  },
  "premium-consultant": {
    fullName: "Elena Marlowe",
    jobTitle: "Principal Consultant",
    companyName: "Altitude Strategy Group",
    phone: "+1 (204) 555-0131",
    email: "elena@altitudestrategygroup.com",
    website: "altitudestrategygroup.com",
    location: "Vancouver, BC",
    ctaText: "Book strategy session",
    ctaUrl: "https://altitudestrategygroup.com/session",
    disclaimer: "Strategy sessions are tailored around current growth priorities and rollout timing.",
    galleryNote: "Premium advisory styling with richer contrast and a more composed two-column feel.",
    fit: "Consulting / Advisory",
    previewTag: "Premium two-column",
    templateVariant: 7
  },
  "contractor-bold": {
    fullName: "Marcus Ortiz",
    jobTitle: "Lead Project Estimator",
    companyName: "ForgePoint Build Co.",
    phone: "+1 (204) 555-0177",
    email: "marcus@forgepointbuild.com",
    website: "forgepointbuild.com",
    location: "Edmonton, AB",
    ctaText: "Request site walkthrough",
    ctaUrl: "https://forgepointbuild.com/quote",
    disclaimer: "Final scope and timing are confirmed after an on-site review and materials check.",
    galleryNote: "Bolder service-led layout with stronger CTA posture and higher-energy color use.",
    fit: "Trades / Contractor",
    previewTag: "Service-first bold",
    templateVariant: 4
  },
  "real-estate": {
    fullName: "Ava Sinclair",
    jobTitle: "Senior Realtor",
    companyName: "Bluehaven Properties",
    phone: "+1 (204) 555-0122",
    email: "ava@bluehavenproperties.com",
    website: "bluehavenproperties.com",
    location: "Kelowna, BC",
    ctaText: "View current listings",
    ctaUrl: "https://bluehavenproperties.com/listings",
    disclaimer: "Showing availability changes with active listing schedules and client bookings.",
    galleryNote: "Property-focused hierarchy with a stronger luxury-listing presentation.",
    fit: "Real estate / Listings",
    previewTag: "Luxury listing split",
    templateVariant: 8
  },
  "legal-finance": {
    fullName: "Nathan Clarke",
    jobTitle: "Private Wealth Advisor",
    companyName: "Clarke & Rowe Advisory",
    phone: "+1 (204) 555-0166",
    email: "nathan@clarkeroweadvisory.com",
    website: "clarkeroweadvisory.com",
    location: "Toronto, ON",
    ctaText: "Schedule consultation",
    ctaUrl: "https://clarkeroweadvisory.com/consult",
    disclaimer: "Availability for advisory reviews and planning sessions may vary by engagement schedule.",
    galleryNote: "Formal financial styling with calmer authority and a more private-advisory feel.",
    fit: "Legal / Finance",
    previewTag: "Private advisory",
    templateVariant: 10
  },
  "health-medical": {
    fullName: "Dr. Maya Patel",
    jobTitle: "Clinic Director",
    companyName: "Northview Wellness Clinic",
    phone: "+1 (204) 555-0113",
    email: "maya@northviewwellness.ca",
    website: "northviewwellness.ca",
    location: "Winnipeg, MB",
    ctaText: "Book appointment",
    ctaUrl: "https://northviewwellness.ca/book",
    disclaimer: "Please use the booking link for appointment requests and care coordination.",
    galleryNote: "Calm care-first treatment with clearer trust cues and better clinical balance.",
    fit: "Health / Medical",
    previewTag: "Care-first card",
    templateVariant: 5
  },
  "creative-designer": {
    fullName: "Jules Mercer",
    jobTitle: "Brand Designer",
    companyName: "Mercer Atelier",
    phone: "+1 (204) 555-0141",
    email: "jules@merceratelier.com",
    website: "merceratelier.com",
    location: "Montreal, QC",
    ctaText: "See latest work",
    ctaUrl: "https://merceratelier.com/work",
    disclaimer: "Project availability and lead times depend on current production windows.",
    galleryNote: "Portfolio-ready personality with richer contrast and more expressive card composition.",
    fit: "Creative / Design",
    previewTag: "Portfolio-forward",
    templateVariant: 8
  },
  "tech-saas": {
    fullName: "Owen Park",
    jobTitle: "Product Growth Lead",
    companyName: "SignalStack Cloud",
    phone: "+1 (204) 555-0189",
    email: "owen@signalstackcloud.com",
    website: "signalstackcloud.com",
    location: "Seattle, WA",
    ctaText: "See the platform",
    ctaUrl: "https://signalstackcloud.com/demo",
    disclaimer: "Platform walkthroughs are best scheduled around your current evaluation timeline.",
    galleryNote: "Sharper product-led layout with stronger contrast and a cleaner operator feel.",
    fit: "Tech / SaaS",
    previewTag: "Product-led modern",
    templateVariant: 11
  },
  "mobile-compact": {
    fullName: "Lauren Price",
    jobTitle: "Operations Manager",
    companyName: "Cedar Point Services",
    phone: "+1 (204) 555-0109",
    email: "lauren@cedarpointservices.com",
    website: "cedarpointservices.com",
    location: "Regina, SK",
    ctaText: "Tap to connect",
    ctaUrl: "https://cedarpointservices.com/connect",
    disclaimer: "For the fastest response, use the direct contact links above.",
    galleryNote: "Compact mobile-safe presentation that still feels polished instead of stripped down.",
    fit: "Mobile-first teams",
    previewTag: "Mobile-ready",
    templateVariant: 7
  },
  "signature-card": {
    fullName: "Camille Hart",
    jobTitle: "Founder",
    companyName: "Atelier Hart",
    phone: "+1 (204) 555-0154",
    email: "camille@atelierhart.com",
    website: "atelierhart.com",
    location: "Vancouver, BC",
    ctaText: "Open profile",
    ctaUrl: "https://atelierhart.com/profile",
    disclaimer: "Please share any project timing or launch targets when you reach out.",
    galleryNote: "Contained boutique card with a stronger founder-profile presentation.",
    fit: "Personal brand / Founder",
    previewTag: "Founder profile card",
    templateVariant: 9
  }
};

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
const LOGO_FORMAT_MESSAGES = {
  gif: {
    tone: "warning",
    text: "\u26A0 GIF format detected — limited color support. PNG is recommended for best quality."
  },
  jpeg: {
    tone: "warning",
    text:
      "\u26A0 JPEG format detected — JPEGs don't support transparency. Your logo may show a white box on dark or colored template backgrounds. Re-saving as PNG is recommended."
  },
  png: {
    tone: "success",
    text: "\u2713 PNG format — transparency supported"
  },
  webp: {
    tone: "success",
    text: "\u2713 WebP format — transparency supported"
  }
};
const LOGO_PANEL_DEFAULT = {
  fileType: "",
  formatStatus: null,
  transparencyStatus: null,
  toolStatus: null
};
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
  const [exportCopySuccessTarget, setExportCopySuccessTarget] = useState("");
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [aiSuggestionRequestKey, setAiSuggestionRequestKey] = useState(0);
  const [moreExportOptionsOpen, setMoreExportOptionsOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewZoom, setPreviewZoom] = useState("100");
  const [logoPanelState, setLogoPanelState] = useState(LOGO_PANEL_DEFAULT);
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
    if (!exportCopySuccessTarget) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setExportCopySuccessTarget("");
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [exportCopySuccessTarget]);

  useEffect(() => {
    if (activeStep !== "export" && exportCopySuccessTarget) {
      setExportCopySuccessTarget("");
    }
  }, [activeStep, exportCopySuccessTarget]);

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
      <span>Plan</span>
      <select value={draft.tier} onChange={(event) => handleTierChange(event.target.value)}>
        <option value="free">Free</option>
        <option value="pro">Pro Individual</option>
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
    setDraft((current) => {
      const nextBrandColor = resolveTemplateSelectionColor(current, value);
      return {
        ...current,
        brandColor: nextBrandColor,
        layout: value,
        templateVariant: current.layout === value ? current.templateVariant : 1,
        layoutManuallySelected: true,
        layoutAutoSelected: false
      };
    });
  }

  function handleRegenerateTemplate() {
    setDraft((current) => ({
      ...current,
      templateVariant: current.templateVariant >= 12 ? 1 : current.templateVariant + 1
    }));
  }

  function handlePreviousTemplateVariant() {
    setDraft((current) => ({
      ...current,
      templateVariant: current.templateVariant <= 1 ? 12 : current.templateVariant - 1
    }));
  }

  function handleNextTemplateVariant() {
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
      if (targetField === "logoDataUrl") {
        setLogoPanelState(LOGO_PANEL_DEFAULT);
      }
      return;
    }

    try {
      const dataUrl = await convertFileToDataUrl(file);
      setDraft((current) => ({ ...current, [targetField]: dataUrl }));

      if (targetField === "logoDataUrl") {
        const analysis = await analyzeLogoFile(file, dataUrl);
        setLogoPanelState(analysis);
      }
    } catch {
      if (targetField === "logoDataUrl") {
        setLogoPanelState({
          ...LOGO_PANEL_DEFAULT,
          toolStatus: {
            tone: "warning",
            text: "Logo analysis failed. Try uploading the file again."
          }
        });
      }
    }
  }

  async function handleConvertLogoToPng() {
    if (!draft.logoDataUrl) {
      return;
    }

    try {
      const pngDataUrl = await rasterizeImageAsPng(draft.logoDataUrl);
      setDraft((current) => ({ ...current, logoDataUrl: pngDataUrl }));
      const analysis = await analyzeImageDataUrl("image/png", pngDataUrl);
      setLogoPanelState({
        ...analysis,
        toolStatus: {
          tone: "success",
          text:
            "Converted to PNG — note: existing white background was not removed. Use Remove Background (Pro) to strip it."
        }
      });
    } catch {
      setLogoPanelState((current) => ({
        ...current,
        toolStatus: {
          tone: "warning",
          text: "PNG conversion failed. Try uploading the logo again."
        }
      }));
    }
  }

  async function handleOptimizeLogoForEmail() {
    if (!draft.logoDataUrl || isFree) {
      return;
    }

    try {
      const optimizedDataUrl = await rasterizeImageAsPng(draft.logoDataUrl, {
        maxWidth: 320,
        maxHeight: 120
      });
      setDraft((current) => ({ ...current, logoDataUrl: optimizedDataUrl }));
      const analysis = await analyzeImageDataUrl("image/png", optimizedDataUrl);
      setLogoPanelState({
        ...analysis,
        toolStatus: {
          tone: "success",
          text: "Optimized for email — your logo was converted to a lightweight PNG for cleaner signature rendering."
        }
      });
    } catch {
      setLogoPanelState((current) => ({
        ...current,
        toolStatus: {
          tone: "warning",
          text: "Logo optimization failed. Try again with a different file."
        }
      }));
    }
  }

  function handleBackgroundRemovalClick() {
    if (isFree) {
      return;
    }

    setLogoPanelState((current) => ({
      ...current,
      toolStatus: {
        tone: "success",
        text: "Background removal coming soon — you'll be notified when this feature launches."
      }
    }));
  }

  async function handleCopy(text, label, successTarget = "") {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(`${label} copied.`);
      setCopyState("success");
      setExportCopySuccessTarget(successTarget);
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
      setExportCopySuccessTarget("signature");
      setActiveStep("export");
    } catch {
      try {
        copyRenderedSignatureFallback(artifacts.exportHtml);
        setCopyMessage("Signature copied using fallback mode.");
        setCopyState("success");
        setExportCopySuccessTarget("signature");
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

  function handleGenerateAiSuggestions() {
    handleGenerateSmartSetup();
    if (!isFree) {
      setAiSuggestionRequestKey((current) => current + 1);
    }
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
              <div className="generator-step-title-row">
                <h2>{activeStepMeta.title}</h2>
                {!isFree ? <span className="generator-mini-badge generator-mini-badge-pro">Pro mode</span> : null}
              </div>
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
    const showFormatBanner = Boolean(logoPanelState.formatStatus);
    const showTransparencyBanner = Boolean(logoPanelState.transparencyStatus);
    const showToolBanner = Boolean(logoPanelState.toolStatus);
    const canConvertToPng = logoPanelState.fileType === "image/jpeg";
    const freeToolTitle = "Pro feature - upgrade to remove logo backgrounds automatically";
    const freeOptimizeTitle = "Pro feature - upgrade to optimize your logo for email";
    const noLogoTitle = "Upload a logo first";

    return (
      <div className="generator-step-stack">
        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <p className="eyebrow">{activeStepMeta.eyebrow}</p>
              <div className="generator-step-title-row">
                <h2>{activeStepMeta.title}</h2>
                {!isFree ? <span className="generator-mini-badge generator-mini-badge-pro">Pro mode</span> : null}
              </div>
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
              onFileRemove={() => {
                updateField("logoDataUrl", "");
                setLogoPanelState(LOGO_PANEL_DEFAULT);
              }}
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

          <p className="generator-quality-tip">Tip: Upload your logo as a PNG with a transparent background for best results across all templates.</p>
        </section>

        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <h3>Logo quality check</h3>
              <p className="support-copy">Review file format, transparency, and quick cleanup options before using the logo in your signature.</p>
            </div>
          </div>

          {!draft.logoDataUrl ? <p className="support-copy">Upload a logo above to run format and transparency checks.</p> : null}

          {showFormatBanner ? (
            <div className={`generator-quality-banner generator-quality-banner-${logoPanelState.formatStatus.tone}`}>
              {logoPanelState.formatStatus.text}
            </div>
          ) : null}

          {showTransparencyBanner ? (
            <div className={`generator-quality-banner generator-quality-banner-${logoPanelState.transparencyStatus.tone}`}>
              {logoPanelState.transparencyStatus.text}
            </div>
          ) : null}

          {showToolBanner ? (
            <div className={`generator-quality-banner generator-quality-banner-${logoPanelState.toolStatus.tone}`}>
              {logoPanelState.toolStatus.text}
            </div>
          ) : null}

          <div className="generator-quality-actions">
            {canConvertToPng ? (
              <button className="button button-secondary" type="button" onClick={handleConvertLogoToPng}>
                Convert to PNG
              </button>
            ) : null}

            <span className="generator-quality-action-wrap" title={isFree ? freeToolTitle : !draft.logoDataUrl ? noLogoTitle : ""}>
              <button
                className={`button button-secondary ${isFree ? "button-locked" : ""}`}
                disabled={isFree || !draft.logoDataUrl}
                type="button"
                onClick={handleBackgroundRemovalClick}
              >
                {isFree ? <Lock aria-hidden="true" size={14} strokeWidth={2.2} /> : null}
                <span>Remove background (Pro)</span>
              </button>
            </span>

            <span className="generator-quality-action-wrap" title={isFree ? freeOptimizeTitle : !draft.logoDataUrl ? noLogoTitle : ""}>
              <button
                className={`button button-secondary ${isFree ? "button-locked" : ""}`}
                disabled={isFree || !draft.logoDataUrl}
                type="button"
                onClick={handleOptimizeLogoForEmail}
              >
                {isFree ? <Lock aria-hidden="true" size={14} strokeWidth={2.2} /> : null}
                <span>Optimize for email</span>
              </button>
            </span>
          </div>

          <div className="generator-quality-footer">
            <div>
              <h3>Need a logo?</h3>
              <p className="support-copy">Logo Pilot AI is our separate logo app for concept creation and refinement.</p>
            </div>
            <p className="support-copy">Ask us about logo support if you need help refining brand assets before rollout.</p>
          </div>
        </section>
      </div>
    );
  }

  function renderTemplatesStep() {
    const selectedTemplate = lookupTemplateOption(artifacts.effectiveDraft.layout);
    const selectedTemplateLabel = selectedTemplate.label;
    return (
      <div className="generator-step-stack">
        <section className="generator-card">
          <div className="generator-card-header">
            <div>
              <p className="eyebrow">{activeStepMeta.eyebrow}</p>
              <div className="generator-step-title-row">
                <h2>{activeStepMeta.title}</h2>
                {!isFree ? <span className="generator-mini-badge generator-mini-badge-pro">Pro mode</span> : null}
              </div>
            </div>
          </div>

          <div className="generator-template-grid">
            {TEMPLATE_OPTIONS.map((template) => {
              const locked = isFree && template.pro;
              const active = artifacts.effectiveDraft.layout === template.value;
              const templatePreview = templatePreviewMap[template.value];
              const previewProfile = TEMPLATE_PREVIEW_PROFILES[template.value];

              return (
                <article
                  key={template.value}
                  className={`generator-template-card generator-template-card-${template.value} ${active ? "generator-template-card-active" : ""} ${locked ? "generator-template-card-locked" : ""}`}
                >
                  <div className="generator-template-heading">
                    <div className="generator-template-title-group">
                      <strong>{template.label}</strong>
                      <span className="generator-template-personality">{previewProfile?.galleryNote || template.description}</span>
                    </div>
                    <div className="generator-template-badge-stack">
                      <span
                        className={`generator-mini-badge ${
                          template.compatibility === "universal" ? "generator-mini-badge-universal" : "generator-mini-badge-modern"
                        }`}
                      >
                        {template.compatibility === "universal" ? "Universal" : "Modern"}
                      </span>
                    </div>
                  </div>
                  <div className="generator-template-preview-frame">
                    <span className={`generator-mini-badge ${template.pro ? "generator-mini-badge-pro" : "generator-mini-badge-free"}`}>
                      {template.pro ? "Pro" : "Free"}
                    </span>
                    <div className="generator-template-preview-scene">
                      <span className="generator-template-preview-kicker">{previewProfile?.previewTag || previewProfile?.fit || "Signature layout"}</span>
                      <div className="generator-template-preview-canvas">
                        <div dangerouslySetInnerHTML={{ __html: templatePreview.previewHtml }} />
                      </div>
                    </div>
                  </div>
                  <div className="generator-template-meta-row">
                    <span>{previewProfile?.fit || "Professional communication"}</span>
                    <span>{template.compatibility === "universal" ? "Compatibility-first" : "Higher visual polish"}</span>
                  </div>
                  <p className="support-copy">{template.description}</p>
                  <p className="support-copy generator-template-compatibility-note">
                    {template.compatibility === "universal"
                      ? "Best when Outlook-safe copy/paste is the priority."
                      : "More visual polish, but test in Outlook before broad rollout."}
                  </p>
                  <div className="generator-button-row">
                    <button
                      className={`button ${active ? "button-primary" : locked ? "button-locked" : "button-secondary"}`}
                      disabled={locked}
                      type="button"
                      onClick={() => handleLayoutChange(template.value)}
                    >
                      {locked ? "Pro style" : active ? "Selected" : "Select"}
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
              <p className="support-copy">
                {selectedTemplate.compatibility === "universal"
                  ? "Universal templates are the safest default for Gmail, Outlook, Apple Mail, and Yahoo."
                  : "Modern templates add stronger visual treatment, but Outlook may need extra paste testing."}
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
              <div className="generator-step-title-row">
                <h2>{activeStepMeta.title}</h2>
                {!isFree ? <span className="generator-mini-badge generator-mini-badge-pro">Pro mode</span> : null}
              </div>
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

          <div className="generator-section-divider" />

          <section className="generator-advanced-options">
            <button
              aria-expanded={advancedOptionsOpen}
              className="generator-disclosure-toggle"
              type="button"
              onClick={() => setAdvancedOptionsOpen((current) => !current)}
            >
              <span className="generator-disclosure-chevron" aria-hidden="true">
                {advancedOptionsOpen ? "[-]" : "[+]"}
              </span>
              <span>Advanced options</span>
            </button>

            {advancedOptionsOpen ? (
              <div className="generator-form-grid generator-form-grid-advanced">
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
              </div>
            ) : null}
          </section>

          <div className="generator-inline-note">
            <strong>{artifacts.effectiveDraft.variantLabel}</strong>
            <span>{selectedTemplateLabel} remains the selected family for export and copy actions.</span>
          </div>

          <div className="generator-button-row">
            <button className="button button-secondary" type="button" onClick={handleRevertToOriginal}>
              Revert to original
            </button>
            <button className={`button ${isFree ? "button-locked" : "button-secondary"}`} disabled={isFree} type="button" onClick={handleGeneratePolish}>
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
              <h3>AI suggestions</h3>
              <p className="support-copy">Use one set of prompts to generate smarter recommendations before you apply anything.</p>
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
            <button className={`button ${isFree ? "button-secondary" : "button-primary"}`} type="button" onClick={handleGenerateAiSuggestions}>
              Generate AI suggestions
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
          <AiSuggestionPanel
            compact
            draft={draft}
            filters={smartSetup}
            autoGenerateKey={aiSuggestionRequestKey}
            onAfterGenerate={() => setCopyMessage("Suggestions ready to review.")}
            onApplySuggestions={({ mode, suggestions }) => {
              setDraft((current) => applySuggestedFields(current, suggestions, mode));
              setCopyMessage(`${mode} applied.`);
            }}
            onSaveVersion={saveCurrentVersion}
          />
        </section>
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
              <div className="generator-step-title-row">
                <h2>{activeStepMeta.title}</h2>
                {!isFree ? <span className="generator-mini-badge generator-mini-badge-pro">Pro mode</span> : null}
              </div>
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

          <div className="generator-export-primary">
            <button
              className={`button button-primary ${exportCopySuccessTarget === "signature" ? "button-success" : ""} ${
                copyState === "error" ? "button-error" : ""
              }`}
              type="button"
              onClick={handleCopySignature}
            >
              <span className="button-feedback-label">
                <span className="button-feedback-icon" aria-hidden="true">
                  {exportCopySuccessTarget === "signature" ? "OK" : ""}
                </span>
                <span>{exportCopySuccessTarget === "signature" ? "Copied!" : "Copy Signature"}</span>
              </span>
            </button>
            <p className="support-copy generator-export-primary-note">Best for Gmail, Outlook, Apple Mail, and Yahoo.</p>
            <p className="support-copy generator-export-primary-note">
              {lookupTemplateOption(artifacts.effectiveDraft.layout).compatibility === "universal"
                ? "Universal templates are designed for maximum email-client compatibility."
                : "Modern templates look richer, but Outlook may need a quick paste test before rollout."}
            </p>
          </div>

          <section className="generator-export-disclosure">
            <button
              aria-expanded={moreExportOptionsOpen}
              className="generator-export-toggle"
              type="button"
              onClick={() => setMoreExportOptionsOpen((current) => !current)}
            >
              More export options {moreExportOptionsOpen ? "[-]" : "[+]"}
            </button>

            {moreExportOptionsOpen ? (
              <div className="generator-export-disclosure-body">
                <div className="generator-export-notes">
                  <p>Copy Signature is best for Gmail, Outlook, Apple Mail, and Yahoo.</p>
                  <p>Universal templates are designed for maximum email-client compatibility.</p>
                  <p>Modern templates may need extra Outlook testing before a broad rollout.</p>
                  <p>Raw HTML is a Pro export for platforms that specifically ask for HTML code.</p>
                  <p>Download HTML gives you a backup file for handoff or archiving.</p>
                  {isFree ? <p>Free exports keep Signature Pilot AI branding inside the signature. Upgrade to remove branding and unlock advanced export controls.</p> : null}
                </div>

                <div className="generator-export-grid">
                  {!isFree ? (
                    <button
                      className={`button button-secondary generator-export-secondary ${
                        exportCopySuccessTarget === "raw-html" ? "button-secondary-success" : ""
                      }`}
                      type="button"
                      onClick={() => handleCopy(artifacts.exportHtml, "Raw HTML", "raw-html")}
                    >
                      <span className="button-feedback-label">
                        <span className="button-feedback-icon" aria-hidden="true">
                          {exportCopySuccessTarget === "raw-html" ? "OK" : ""}
                        </span>
                        <span>{exportCopySuccessTarget === "raw-html" ? "Copied!" : "Copy Raw HTML"}</span>
                      </span>
                    </button>
                  ) : null}
                  {!isFree ? (
                    <button
                      className={`button button-secondary generator-export-secondary ${
                        exportCopySuccessTarget === "plain-text" ? "button-secondary-success" : ""
                      }`}
                      type="button"
                      onClick={() => handleCopy(artifacts.plainText, "Plain text signature", "plain-text")}
                    >
                      <span className="button-feedback-label">
                        <span className="button-feedback-icon" aria-hidden="true">
                          {exportCopySuccessTarget === "plain-text" ? "OK" : ""}
                        </span>
                        <span>{exportCopySuccessTarget === "plain-text" ? "Copied!" : "Copy Plain Text"}</span>
                      </span>
                    </button>
                  ) : null}
                  <button
                    className={`button generator-export-secondary ${isFree ? "button-locked" : "button-secondary"}`}
                    disabled={isFree}
                    type="button"
                    onClick={handleDownloadHtml}
                  >
                    Download HTML File
                  </button>
                </div>
              </div>
            ) : null}
          </section>

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
    <div
      className="generator-builder-page"
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0",
        padding: "0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <section className="generator-builder-topbar">
        <div className="generator-builder-topcopy">
          <p className="eyebrow">Signature Generator</p>
          <h1>Build once, paste anywhere.</h1>
          <p className="support-copy generator-builder-topnote">
            Create a clean signature, copy it safely, and install it in Gmail, Outlook, Apple Mail, or Yahoo without broken formatting or messy HTML.
          </p>
          <div className="generator-builder-badges">
            <span className="generator-builder-badge">Copy Signature is the safest default</span>
            <span className="generator-builder-badge">Universal templates are Outlook-safer</span>
          </div>
        </div>
        <div className="generator-builder-topactions">
          <Link className="button button-secondary" to="/install-guide">
            Install Guide
          </Link>
          <Link className="button button-primary" to="/upgrade">
            Upgrade
          </Link>
        </div>
      </section>

      <section className="generator-builder-shell" style={{ width: "100%", display: "flex", flexDirection: "row" }}>
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
              onPreviousVariant={handlePreviousTemplateVariant}
              onNextVariant={handleNextTemplateVariant}
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
  const previewProfile = TEMPLATE_PREVIEW_PROFILES[template.value] || {};
  const previewBase = {
    "professional-classic": { brandColor: TEMPLATE_DEFAULT_COLORS["professional-classic"], logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "executive-corporate": { brandColor: TEMPLATE_DEFAULT_COLORS["executive-corporate"], logoSize: "medium", showDivider: true, includeBranding: false, templateVariant: 1 },
    "minimal-clean": { brandColor: TEMPLATE_DEFAULT_COLORS["minimal-clean"], logoSize: "small", showDivider: false, includeBranding: false, logoShape: "circle", templateVariant: 1 },
    "premium-consultant": { brandColor: TEMPLATE_DEFAULT_COLORS["premium-consultant"], logoSize: "medium", showDivider: true, includeBranding: false, templateVariant: 1 },
    "contractor-bold": { brandColor: TEMPLATE_DEFAULT_COLORS["contractor-bold"], logoSize: "large", showDivider: false, includeBranding: false, templateVariant: 1 },
    "real-estate": { brandColor: TEMPLATE_DEFAULT_COLORS["real-estate"], logoSize: "medium", showDivider: true, includeBranding: false, templateVariant: 1 },
    "legal-finance": { brandColor: TEMPLATE_DEFAULT_COLORS["legal-finance"], logoSize: "medium", showDivider: true, includeBranding: false, templateVariant: 1 },
    "health-medical": { brandColor: TEMPLATE_DEFAULT_COLORS["health-medical"], logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "creative-designer": { brandColor: TEMPLATE_DEFAULT_COLORS["creative-designer"], logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "tech-saas": { brandColor: TEMPLATE_DEFAULT_COLORS["tech-saas"], logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "mobile-compact": { brandColor: TEMPLATE_DEFAULT_COLORS["mobile-compact"], logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 },
    "signature-card": { brandColor: TEMPLATE_DEFAULT_COLORS["signature-card"], logoSize: "medium", showDivider: false, includeBranding: false, templateVariant: 1 }
  };

  return {
    ...fallback,
    ...draft,
    ...previewProfile,
    ...(previewBase[template.value] || {}),
    tier: "pro",
    layout: template.value,
    showTemplateTags: true,
    ctaDestinationType: "custom",
    templateVariant: previewProfile.templateVariant || 1,
    renderMode: "desktop"
  };
}

function convertFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image-load-failed"));
    image.src = source;
  });
}

function normalizeImageMimeType(fileType) {
  const normalized = String(fileType || "").toLowerCase();
  return normalized === "image/jpg" ? "image/jpeg" : normalized;
}

async function analyzeLogoFile(file, dataUrl) {
  const normalizedType = normalizeImageMimeType(file?.type);
  return analyzeImageDataUrl(normalizedType, dataUrl);
}

async function analyzeImageDataUrl(fileType, dataUrl) {
  const normalizedType = normalizeImageMimeType(fileType);
  const formatStatus = resolveFormatStatus(normalizedType);
  let transparencyStatus = null;

  if (normalizedType === "image/png" || normalizedType === "image/webp") {
    const hasTransparency = await detectImageTransparency(dataUrl);
    transparencyStatus = hasTransparency
      ? {
          tone: "success",
          text: "\u2713 Transparent background detected"
        }
      : {
          tone: "warning",
          text:
            "\u26A0 No transparent background detected — your logo may show a white box on colored templates. Use the Remove Background tool (Pro) to fix this."
        };
  }

  return {
    fileType: normalizedType,
    formatStatus,
    transparencyStatus,
    toolStatus: null
  };
}

function resolveFormatStatus(fileType) {
  if (fileType === "image/jpeg") {
    return LOGO_FORMAT_MESSAGES.jpeg;
  }

  if (fileType === "image/png") {
    return LOGO_FORMAT_MESSAGES.png;
  }

  if (fileType === "image/webp") {
    return LOGO_FORMAT_MESSAGES.webp;
  }

  if (fileType === "image/gif") {
    return LOGO_FORMAT_MESSAGES.gif;
  }

  if (!fileType) {
    return null;
  }

  return {
    tone: "success",
    text: `\u2713 ${fileType.replace("image/", "").toUpperCase()} format detected`
  };
}

async function detectImageTransparency(dataUrl) {
  const image = await loadImageElement(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return false;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const samplePoints = buildTransparencySamplePoints(canvas.width, canvas.height);

  return samplePoints.some(([x, y]) => context.getImageData(x, y, 1, 1).data[3] < 255);
}

function buildTransparencySamplePoints(width, height) {
  const maxX = Math.max(width - 1, 0);
  const maxY = Math.max(height - 1, 0);
  const ratios = [0, 0.25, 0.5, 0.75, 1];
  const points = [];

  ratios.forEach((ratio) => {
    points.push([Math.round(maxX * ratio), 0]);
    points.push([Math.round(maxX * ratio), maxY]);
    points.push([0, Math.round(maxY * ratio)]);
    points.push([maxX, Math.round(maxY * ratio)]);
  });

  return Array.from(new Map(points.map(([x, y]) => [`${x}:${y}`, [x, y]])).values()).slice(0, 20);
}

async function rasterizeImageAsPng(dataUrl, options = {}) {
  const image = await loadImageElement(dataUrl);
  const canvas = document.createElement("canvas");
  const { width, height } = getConstrainedImageSize(image, options.maxWidth, options.maxHeight);

  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("canvas-unavailable");
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

function getConstrainedImageSize(image, maxWidth, maxHeight) {
  const originalWidth = image.naturalWidth || image.width || maxWidth || 1;
  const originalHeight = image.naturalHeight || image.height || maxHeight || 1;

  if (!maxWidth && !maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const widthRatio = maxWidth ? maxWidth / originalWidth : Infinity;
  const heightRatio = maxHeight ? maxHeight / originalHeight : Infinity;
  const scale = Math.min(widthRatio, heightRatio, 1);

  return {
    width: Math.max(1, Math.round(originalWidth * scale)),
    height: Math.max(1, Math.round(originalHeight * scale))
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

function resolveTemplateSelectionColor(current, nextLayout) {
  const currentColor = normalizeHexColor(current.brandColor);
  const currentLayoutDefault = normalizeHexColor(TEMPLATE_DEFAULT_COLORS[current.layout]);
  const nextLayoutDefault = normalizeHexColor(TEMPLATE_DEFAULT_COLORS[nextLayout]) || currentColor;
  const matchesAnyFamilyDefault = Object.values(TEMPLATE_DEFAULT_COLORS).some((color) => normalizeHexColor(color) === currentColor);

  if (!currentColor) {
    return nextLayoutDefault;
  }

  if (currentColor === currentLayoutDefault) {
    return nextLayoutDefault;
  }

  if (matchesAnyFamilyDefault && currentColor !== nextLayoutDefault) {
    return nextLayoutDefault;
  }

  return current.brandColor;
}

function normalizeHexColor(value) {
  return String(value || "").trim().toUpperCase();
}

function lookupTemplateOption(layout) {
  return TEMPLATE_OPTIONS.find((template) => template.value === layout) || TEMPLATE_OPTIONS[0];
}

function lookupTemplateLabel(layout) {
  return lookupTemplateOption(layout)?.label || "Professional Classic";
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
  const selectedTemplate = lookupTemplateOption(draft.layout);
  const isUniversal = selectedTemplate.compatibility === "universal";
  return [
    { label: "Gmail ready", passed: true },
    { label: isUniversal ? "Universal layout selected for maximum compatibility" : "Modern layout selected - test in Outlook before rollout", passed: isUniversal },
    { label: "Apple Mail ready", passed: true },
    { label: "Yahoo ready", passed: true },
    { label: "Copy Signature remains the safest paste path", passed: true },
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





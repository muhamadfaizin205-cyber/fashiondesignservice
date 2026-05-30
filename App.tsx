import React, { useState, useRef } from "react";
import "./styles.css";

// ─── Types ────────────────────────────────────────────────
interface Package {
  id: string;
  badge: string;
  name: string;
  basePrice: number;
  desc: string;
  features: string[];
  delivery: string;
  revisions: string;
  featured: boolean;
}

type Direction = "forward" | "back";
type AiPhase = "idle" | "asking" | "loading" | "done" | "error";

interface WizardState {
  service: "clothing" | "logo" | null;
  brandName: string;
  qty: number;
  brief: string;
}

// ─── Constants ────────────────────────────────────────────
// Use environment variable for API key. For Create React App prefix with REACT_APP_
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || "";

const PACKAGES: Package[] = [
  {
    id: "basic",
    badge: "BASIC",
    name: "Best for test drop single apparel",
    basePrice: 45,
    desc: "Best for testing one merch or apparel graphic before a bigger drop.",
    features: [
      "1 initial concept",
      "Include source file",
      "Printable resolution file",
      "Front & back design",
      "Include marketing tools",
      "Add enhanced detailing",
      "Commercial use",
    ],
    delivery: "3-day delivery",
    revisions: "2 Revisions",
    featured: false,
  },
  {
    id: "standard",
    badge: "STANDARD",
    name: "Most popular brand starter",
    basePrice: 95,
    desc: "Best value for artist merch, front & back apparel, and brand drops.",
    features: [
      "2 initial concepts",
      "Include source file",
      "Printable resolution file",
      "Front & back design",
      "Include marketing tools",
      "Add enhanced detailing",
      "Commercial use",
    ],
    delivery: "3-day delivery",
    revisions: "3 Revisions",
    featured: true,
  },
  {
    id: "premium",
    badge: "PREMIUM",
    name: "Full brand-ready apparel system",
    basePrice: 185,
    desc: "Complete apparel drop system with 3 matching graphics and mockup direction.",
    features: [
      "3 initial concepts",
      "Include source file",
      "Printable resolution file",
      "Front & back design",
      "Include marketing tools",
      "Add enhanced detailing",
      "Commercial use",
    ],
    delivery: "5-day delivery",
    revisions: "3 Revisions",
    featured: false,
  },
];

const FEATURES = [
  "CLOTHING DESIGN",
  "BRAND IDENTITY",
  "SOURCE FILES",
  "FAST DELIVERY",
];
const WA_NUMBER = "6282221994691";
const TOTAL_STEPS = 6;

// ─── WhatsApp Icon ─────────────────────────────────────────
function WaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="15"
      height="15"
      style={{ flexShrink: 0 }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────
function buildWAMessage(
  pkg: Package,
  state: WizardState,
  finalPrice: number
): string {
  const svcLabel =
    state.service === "clothing" ? "Clothing Design" : "Logo Brand Design";
  const briefText = state.brief.trim() || "(Brief not filled)";
  return [
    "Hello DEAN DESIGNERS! 👋",
    "",
    "I'd like to place a design order:",
    "",
    `🎨 Service: ${svcLabel}`,
    `🏷️ Brand Name: ${state.brandName}`,
    `📦 Package: ${pkg.badge} — ${pkg.name}`,
    `💡 Concepts: ${state.qty} Concept(s)`,
    `⏱️ Delivery: ${pkg.delivery}`,
    `🔄 Revisions: ${pkg.revisions}`,
    `💰 Total Price: US$${finalPrice}`,
    "",
    "📝 Design Brief:",
    briefText,
    "",
    "Please confirm, thank you!",
  ].join("\n");
}

function openWA(pkg: Package, state: WizardState): void {
  const finalPrice = pkg.basePrice * state.qty;
  const msg = buildWAMessage(pkg, state, finalPrice);
  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

// ─── Progress Bar ──────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="progress-bar">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const n = i + 1;
        const isDone = n < step;
        const isActive = n === step;
        const cls = isDone ? "done" : isActive ? "active" : "pending";
        return (
          <React.Fragment key={n}>
            {i > 0 && (
              <div className="progress-track">
                <div
                  className="progress-track-fill"
                  style={{ width: n <= step ? "100%" : "0%" }}
                />
              </div>
            )}
            <div className={`progress-dot ${cls}`}>{isDone ? "✓" : n}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1 ────────────────────────────────────────────────
function Step1({
  service,
  onSelect,
}: {
  service: WizardState["service"];
  onSelect: (s: "clothing" | "logo") => void;
}) {
  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 1 / 6</div>
        <h2 className="step-question">
          Choose Your <span>Service</span>
        </h2>
        <p className="step-hint">Tap one to continue to the next step.</p>
      </div>
      <div className="service-grid">
        <div
          className={`service-card ${service === "clothing" ? "active" : ""}`}
          onClick={() => onSelect("clothing")}
        >
          <div className="service-name">Clothing Design</div>
          <div className="service-sub">
            T-shirts, jackets, hoodies &amp; apparel design
          </div>
          {service === "clothing" && <div className="service-check">✓</div>}
        </div>
        <div
          className={`service-card ${service === "logo" ? "active" : ""}`}
          onClick={() => onSelect("logo")}
        >
          <div className="service-name">Logo Brand Design</div>
          <div className="service-sub">Professional brand visual identity</div>
          {service === "logo" && <div className="service-check">✓</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ────────────────────────────────────────────────
function Step2({
  brandName,
  onChange,
  onNext,
  onBack,
}: {
  brandName: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 2 / 6</div>
        <h2 className="step-question">
          What is Your <span>Brand Name</span>?
        </h2>
      </div>
      <input
        className="step-input"
        type="text"
        placeholder="e.g. KINARA, VORTEX, ASPHALT..."
        value={brandName}
        onChange={(e) => onChange(e.target.value)}
        maxLength={60}
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && onNext()}
      />
      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-next" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 ────────────────────────────────────────────────
function Step3({
  qty,
  onChange,
  onNext,
  onBack,
}: {
  qty: number;
  onChange: (q: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [inputVal, setInputVal] = useState<string>(String(qty));
  const clamp = (n: number) => Math.min(10, Math.max(1, n));

  const dec = () => {
    const next = clamp(qty - 1);
    onChange(next);
    setInputVal(String(next));
  };
  const inc = () => {
    const next = clamp(qty + 1);
    onChange(next);
    setInputVal(String(next));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputVal(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(clamp(n));
  };

  const handleBlur = () => {
    const n = parseInt(inputVal, 10);
    const clamped = isNaN(n) ? 1 : clamp(n);
    onChange(clamped);
    setInputVal(String(clamped));
  };

  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 3 / 6</div>
        <h2 className="step-question">
          How Many <span>Concepts</span> Do You Want?
        </h2>
        <p className="step-hint">
          Type a number or use the + / − buttons (max. 10)
        </p>
      </div>
      <div className="qty-counter-wrap">
        <button className="qty-btn" onClick={dec} disabled={qty <= 1}>
          −
        </button>
        <div className="qty-display">
          <input
            className="qty-input"
            type="number"
            min={1}
            max={10}
            value={inputVal}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          <span className="qty-label">Design Concepts</span>
        </div>
        <button className="qty-btn" onClick={inc} disabled={qty >= 10}>
          +
        </button>
      </div>
      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-next" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 ────────────────────────────────────────────────
function Step4({
  brief,
  onChange,
  onNext,
  onBack,
  wizardService,
  wizardBrand,
}: {
  brief: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  wizardService: "clothing" | "logo" | null;
  wizardBrand: string;
}) {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [phase, setPhase] = useState<AiPhase>("idle");
  const [answers, setAnswers] = useState({
    concept: "",
    colors: "",
    references: "",
  });
  const [aiError, setAiError] = useState("");

  const svcLabel =
    wizardService === "clothing" ? "Clothing Design" : "Logo Brand Design";

  const handleGenerate = async () => {
    setPhase("loading");
    setAiError("");
    const userContext = [
      `Brand name: ${wizardBrand || "not specified"}`,
      `Service type: ${svcLabel}`,
      `Design concept/theme: ${answers.concept || "-"}`,
      `Color references: ${answers.colors || "-"}`,
      `Brand/design references: ${answers.references || "-"}`,
    ].join("\n");
    const prompt = `You are a professional design brief copywriter. Write a clear, concise, and ready-to-use design brief for a designer based on the following information:\n\n${userContext}\n\nWrite the brief in English, 3-5 sentences. Get straight to the point without an intro. Do not repeat labels like "Brand name:" - narrate directly.`;

    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 400,
            temperature: 0.7,
          }),
        }
      );
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      if (!text) {
        const errMsg = data?.error?.message ?? "Empty response from AI";
        throw new Error(errMsg);
      }
      onChange(text.trim());
      setPhase("done");
    } catch (err: any) {
      setAiError(err?.message ?? "Failed to connect to AI.");
      setPhase("error");
    }
  };

  const switchToManual = () => {
    setMode("manual");
    setPhase("idle");
  };
  const switchToAi = () => {
    setMode("ai");
    if (phase === "idle" || phase === "error") setPhase("asking");
  };
  const handleRedo = () => {
    setPhase("asking");
    onChange("");
  };

  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 4 / 6</div>
        <h2 className="step-question">
          Share Your <span>Design Vision</span>
        </h2>
      </div>

      <div className="brief-mode-tabs">
        <button
          className={`brief-tab ${mode === "manual" ? "active-tab" : ""}`}
          onClick={switchToManual}
        >
          ✏️ Write Myself
        </button>
        <button
          className={`brief-tab ${mode === "ai" ? "active-tab" : ""}`}
          onClick={switchToAi}
        >
          ✨ Help with AI
        </button>
      </div>

      {mode === "ai" && (
        <div className="ai-panel">
          {phase === "asking" || phase === "loading" ? (
            <>
              <div className="ai-field">
                <label className="ai-label">Your design concept or theme</label>
                <input
                  className="step-input"
                  placeholder="e.g. minimalist bold, modern streetwear..."
                  value={answers.concept}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, concept: e.target.value }))
                  }
                  disabled={phase === "loading"}
                />
              </div>
              <div className="ai-field">
                <label className="ai-label">Color references</label>
                <input
                  className="step-input"
                  placeholder="e.g. black & cream, navy & gold..."
                  value={answers.colors}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, colors: e.target.value }))
                  }
                  disabled={phase === "loading"}
                />
              </div>
              <div className="ai-field">
                <label className="ai-label">
                  Brand / design references you like
                </label>
                <input
                  className="step-input"
                  placeholder="e.g. Supreme, Off-White, Palace..."
                  value={answers.references}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, references: e.target.value }))
                  }
                  disabled={phase === "loading"}
                />
              </div>
              <button
                className="btn-ai-generate"
                onClick={handleGenerate}
                disabled={phase === "loading"}
              >
                {phase === "loading" ? (
                  <>
                    <span className="ai-spinner" /> Generating brief...
                  </>
                ) : (
                  <>✨ Generate Brief Now</>
                )}
              </button>
            </>
          ) : phase === "done" ? (
            <div className="ai-success-note">
              ✅ Brief successfully generated! You can edit it below.
              <button className="ai-redo" onClick={handleRedo}>
                ↩ Regenerate
              </button>
            </div>
          ) : phase === "error" ? (
            <div className="ai-error-note">⚠️ {aiError}</div>
          ) : null}
        </div>
      )}

      {(mode === "manual" || phase === "done" || phase === "error") && (
        <>
          <textarea
            className="brief-ta"
            placeholder={`e.g. "KINARA" is a local streetwear brand targeting young adults aged 18-25. Bold minimalist concept with modern cultural touches...`}
            value={brief}
            onChange={(e) => onChange(e.target.value)}
            maxLength={1000}
          />
          <div className="brief-count">{brief.length} / 1000 characters</div>
        </>
      )}

      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button className="btn-next" onClick={onNext}>
          View Pricing →
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Choose Package ────────────────────────────────
function Step5({
  state,
  onBack,
  onSelectPkg,
}: {
  state: WizardState;
  onBack: () => void;
  onSelectPkg: (pkg: Package) => void;
}) {
  const svcLabel =
    state.service === "clothing" ? "Clothing Design" : "Logo Brand Design";

  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 5 / 6</div>
        <h2 className="step-question">
          Choose Your <span>Package</span>
        </h2>
        <p className="step-hint">Tap a package to continue to order confirmation.</p>
      </div>

      <div className="summary-box">
        <div className="summary-item">
          <div className="summary-lbl">Service</div>
          <div className="summary-val">{svcLabel}</div>
        </div>
        <div className="summary-item">
          <div className="summary-lbl">Brand Name</div>
          <div className="summary-val">{state.brandName}</div>
        </div>
        <div className="summary-item">
          <div className="summary-lbl">Concepts</div>
          <div className="summary-val">{state.qty} Concept(s)</div>
        </div>
      </div>

      <div className="pkg-grid">
        {PACKAGES.map((pkg) => {
          const finalPrice = pkg.basePrice * state.qty;
          return (
            <div
              key={pkg.id}
              className={`pkg-card ${pkg.featured ? "featured" : ""}`}
            >
              <div className="pkg-badge">{pkg.badge}</div>
              <div className="pkg-base-price">
                US${pkg.basePrice} × {state.qty} concept(s)
              </div>
              <div className="pkg-price">US${finalPrice}</div>
              <div className="pkg-name">{pkg.name}</div>
              <p className="pkg-desc">{pkg.desc}</p>
              <div className="pkg-meta">
                <span className="pkg-meta-item">⏱ {pkg.delivery}</span>
                <span className="pkg-meta-item">🔄 {pkg.revisions}</span>
              </div>
              <div className="pkg-divider" />
              <ul className="feat-list">
                {pkg.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <button className="btn-order" onClick={() => onSelectPkg(pkg)}>
                Choose This Package →
              </button>
            </div>
          );
        })}
      </div>

      <div className="step-nav">
        <button className="btn-back" onClick={onBack}>
          ← Edit Brief
        </button>
      </div>
    </div>
  );
}

// ─── Step 6: Order Confirmation ────────────────────────────
function Step6({
  state,
  pkg,
  onBack,
}: {
  state: WizardState;
  pkg: Package;
  onBack: () => void;
}) {
  const svcLabel =
    state.service === "clothing" ? "Clothing Design" : "Logo Brand Design";
  const finalPrice = pkg.basePrice * state.qty;

  return (
    <div className="step-panel">
      <div className="step-header">
        <div className="step-number">STEP 6 / 6</div>
        <h2 className="step-question">
          Confirm Your <span>Order</span>
        </h2>
        <p className="step-hint">
          Review your details before sending to WhatsApp.
        </p>
      </div>

      <div className="confirm-box">
        {/* Package header */}
        <div className="confirm-pkg-header">
          <div className="confirm-pkg-left">
            <div className="pkg-badge" style={{ marginBottom: 0 }}>
              {pkg.badge}
            </div>
            <div className="confirm-pkg-name">{pkg.name}</div>
          </div>
          <div className="confirm-pkg-right">
            <div className="confirm-price-note">
              US${pkg.basePrice} × {state.qty} concept(s)
            </div>
            <div className="confirm-price-total">US${finalPrice}</div>
          </div>
        </div>

        <div className="confirm-divider" />

        {/* Detail rows */}
        <div className="confirm-rows">
          <div className="confirm-row">
            <span className="confirm-lbl">🎨 Service</span>
            <span className="confirm-val">{svcLabel}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-lbl">🏷️ Brand Name</span>
            <span className="confirm-val">{state.brandName}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-lbl">💡 Concepts</span>
            <span className="confirm-val">{state.qty} Concept(s)</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-lbl">⏱️ Estimated Delivery</span>
            <span className="confirm-val">{pkg.delivery}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-lbl">🔄 Revisions</span>
            <span className="confirm-val">{pkg.revisions}</span>
          </div>
        </div>

        <div className="confirm-divider" />

        {/* Brief preview */}
        <div className="confirm-brief-wrap">
          <div className="confirm-brief-label">📝 Design Brief</div>
          <div className="confirm-brief-text">
            {state.brief.trim() || "(Brief not filled)"}
          </div>
        </div>

        <div className="confirm-divider" />

        {/* Total */}
        <div className="confirm-total-row">
          <span className="confirm-total-lbl">TOTAL PAYMENT</span>
          <span className="confirm-total-price">US${finalPrice}</span>
        </div>
      </div>

      <div
        className="step-nav"
        style={{ flexDirection: "column", gap: "12px" }}
      >
        <button
          className="btn-next"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
          onClick={() => openWA(pkg, state)}
        >
          <WaIcon />
          Send Order via WhatsApp
        </button>
        <button
          className="btn-back"
          style={{ width: "100%", textAlign: "center" }}
          onClick={onBack}
        >
          ← Change Package
        </button>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<Direction>("forward");
  const [animKey, setAnimKey] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [wizardState, setWizardState] = useState<WizardState>({
    service: null,
    brandName: "",
    qty: 1,
    brief: "",
  });

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const goTo = (next: number, dir: Direction = "forward") => {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setStep(next);
  };

  const handleSelectService = (s: "clothing" | "logo") => {
    setWizardState((p) => ({ ...p, service: s }));
    goTo(2, "forward");
  };
  const handleNextStep2 = () => {
    if (wizardState.brandName.trim().length < 2) {
      showToast("⚠️ Brand name must be at least 2 characters");
      return;
    }
    goTo(3, "forward");
  };
  const handleNextStep3 = () => goTo(4, "forward");
  const handleNextStep4 = () => {
    if (wizardState.brief.trim().length < 10) {
      showToast("⚠️ Brief must be at least 10 characters for best results");
      return;
    }
    goTo(5, "forward");
  };
  const handleSelectPkg = (pkg: Package) => {
    setSelectedPkg(pkg);
    goTo(6, "forward");
  };

  const panelClass = `step-panel${direction === "back" ? " from-back" : ""}`;

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-wrap">
          <a className="nav-logo" href="#home">
            DEAN DESIGNERS
          </a>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#wizard">Pricing</a>
            <a href="#wizard">Order</a>
          </div>
          <a
            className="nav-btn"
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noreferrer"
          >
            WHATSAPP US
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero s0" id="home">
        <div className="hero-badge">
          <div className="hero-dot" />
          Professional Design Studio
        </div>
        <h1 className="hero-title">
          DEAN
          <br />
          DESIGNERS
        </h1>
        <p className="hero-sub">Clothing · Brand · Identity</p>
        <p className="hero-desc">
          Bring your brand identity to life through professional clothing and
          logo design — distinctive, character-driven, and production-ready.
        </p>
        <a className="hero-cta" href="#wizard">
          Start Your Order Now →
        </a>
      </section>

      {/* FEATURE BAR */}
      <div className="feat-bar s1" id="services">
        <div className="feat-bar-wrap">
          {FEATURES.map((f, i) => (
            <React.Fragment key={f}>
              {i > 0 && <span className="feat-sep">·</span>}
              <span className="feat-lbl">{f}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* WIZARD */}
      <section className="wizard-section s2" id="wizard">
        <div className="wizard-wrap">
          <ProgressBar step={step} />
          <div className="step-outer">
            {step === 1 && (
              <div key={`s1-${animKey}`} className={panelClass}>
                <Step1
                  service={wizardState.service}
                  onSelect={handleSelectService}
                />
              </div>
            )}
            {step === 2 && (
              <div key={`s2-${animKey}`} className={panelClass}>
                <Step2
                  brandName={wizardState.brandName}
                  onChange={(v) =>
                    setWizardState((p) => ({ ...p, brandName: v }))
                  }
                  onNext={handleNextStep2}
                  onBack={() => goTo(1, "back")}
                />
              </div>
            )}
            {step === 3 && (
              <div key={`s3-${animKey}`} className={panelClass}>
                <Step3
                  qty={wizardState.qty}
                  onChange={(q) => setWizardState((p) => ({ ...p, qty: q }))}
                  onNext={handleNextStep3}
                  onBack={() => goTo(2, "back")}
                />
              </div>
            )}
            {step === 4 && (
              <div key={`s4-${animKey}`} className={panelClass}>
                <Step4
                  brief={wizardState.brief}
                  onChange={(v) => setWizardState((p) => ({ ...p, brief: v }))}
                  onNext={handleNextStep4}
                  onBack={() => goTo(3, "back")}
                  wizardService={wizardState.service}
                  wizardBrand={wizardState.brandName}
                />
              </div>
            )}
            {step === 5 && (
              <div key={`s5-${animKey}`} className={panelClass}>
                <Step5
                  state={wizardState}
                  onBack={() => goTo(4, "back")}
                  onSelectPkg={handleSelectPkg}
                />
              </div>
            )}
            {step === 6 && selectedPkg && (
              <div key={`s6-${animKey}`} className={panelClass}>
                <Step6
                  state={wizardState}
                  pkg={selectedPkg}
                  onBack={() => goTo(5, "back")}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer s4">
        <div className="footer-grid">
          <div>
            <span
              className="nav-logo"
              style={{ display: "inline-flex", cursor: "default" }}
            >
              DEAN DESIGNERS
            </span>
            <p className="footer-brand-text">
              Professional Clothing &amp; Brand Identity Design Studio. We help
              your brand stand out with confidence.
            </p>
          </div>
          <div>
            <div className="footer-col-head">MENU</div>
            <div className="footer-col">
              <a href="#home">Home</a>
              <a href="#services">Services</a>
              <a href="#wizard">Pricing</a>
              <a href="#wizard">Order</a>
            </div>
          </div>
          <div>
            <div className="footer-col-head">CONTACT</div>
            <div className="footer-col">
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <span>+62 822-2199-4691</span>
              <span>Clothing Design</span>
              <span>Logo Brand Design</span>
            </div>
          </div>
          <div className="footer-wa-box">
            <div className="footer-wa-title">💬 CONTACT US</div>
            <p className="footer-wa-desc">
              Free consultation first! Chat with us directly on WhatsApp to
              discuss your brand design needs.
            </p>
            <a
              className="footer-wa-btn"
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noreferrer"
            >
              <WaIcon />
              WhatsApp Us
            </a>
          </div>
        </div>
        <div className="footer-copy">
          COPYRIGHT 2025 © DEAN DESIGNERS — PROFESSIONAL CLOTHING &amp; BRAND
          DESIGN
        </div>
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
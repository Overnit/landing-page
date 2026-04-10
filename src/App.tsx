import { useState, useEffect, useRef } from "react";
import { useLang } from "./LangContext";
import { LangSwitcher } from "./LangSwitcher";
import QRCode from "qrcode";
import "./index.css";

/* ── QR Generator Section ── */
function QRGenerator() {
  const { t } = useLang();
  const [input, setInput] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrColor, setQrColor] = useState("#0A0F1E");
  const [qrBg, setQrBg] = useState("#FFFFFF");
  const [size, setSize] = useState(256);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = async (text: string, dark: string, light: string, px: number) => {
    if (!text.trim()) { setQrDataUrl(""); return; }
    try {
      const url = await QRCode.toDataURL(text, {
        width: px,
        margin: 2,
        color: { dark, light },
      });
      setQrDataUrl(url);
    } catch { setQrDataUrl(""); }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generate(input, qrColor, qrBg, size), 250);
  }, [input, qrColor, qrBg, size]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <section id="qr" className="tool-section fade-in-up delay-2">
      <div className="glass-card tool-card">
        <div className="tool-header">
          <span className="tool-badge">{t.qrWidget.badge}</span>
          <h2>{t.qrWidget.title}</h2>
          <p>{t.qrWidget.desc}</p>
        </div>

        <div className="qr-builder">
          <div className="qr-controls">
            <textarea
              className="glass-input qr-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.qrWidget.placeholder}
              rows={3}
            />
            <div className="qr-options">
              <label className="qr-option-label">
                <span>{t.qrWidget.color}</span>
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="color-picker"
                />
              </label>
              <label className="qr-option-label">
                <span>{t.qrWidget.bg}</span>
                <input
                  type="color"
                  value={qrBg}
                  onChange={(e) => setQrBg(e.target.value)}
                  className="color-picker"
                />
              </label>
              <label className="qr-option-label">
                <span>{t.qrWidget.size}: {size}px</span>
                <input
                  type="range"
                  min={128}
                  max={512}
                  step={64}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="size-slider"
                />
              </label>
            </div>
          </div>

          <div className="qr-preview-panel">
            {qrDataUrl ? (
              <>
                <img src={qrDataUrl} alt="QR Code" className="qr-preview-img" />
                <button onClick={handleDownload} className="btn btn-primary btn-download">
                  {t.qrWidget.download}
                </button>
              </>
            ) : (
              <div className="qr-placeholder">
                <span className="qr-placeholder-icon">▣</span>
                <p>{t.qrWidget.emptyHint}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Link Shortener Section ── */
function LinkShortener() {
  const { t } = useLang();
  const [urlInput, setUrlInput] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    setIsShortening(true);
    setErrorMsg("");
    setShortenedUrl("");
    setCopied(false);
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to shorten");
      setShortenedUrl(data.shortUrl);
      const qr = await QRCode.toDataURL(data.shortUrl, {
        width: 200, margin: 2,
        color: { dark: "#0A0F1E", light: "#FFFFFF" },
      });
      setQrCodeData(qr);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsShortening(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="shortener" className="tool-section fade-in-up delay-1">
      <div className="glass-card tool-card">
        <div className="tool-header">
          <span className="tool-badge">{t.shortener.badge}</span>
          <h2>{t.shortener.title}</h2>
          <p>{t.shortener.desc}</p>
        </div>

        <form onSubmit={handleShorten} className="shortener-form">
          <div className="input-group">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t.shortener.placeholder}
              required
              className="glass-input"
              disabled={isShortening}
            />
            <button type="submit" className="btn btn-primary" disabled={isShortening}>
              {isShortening ? t.shortener.btnGenerating : t.shortener.btnGenerate}
            </button>
          </div>
          {errorMsg && <div className="error-text">{errorMsg}</div>}
        </form>

        {shortenedUrl && (
          <div className="result-container">
            <div className="result-url-box">
              <a href={shortenedUrl} target="_blank" rel="noreferrer" className="result-link">
                {shortenedUrl}
              </a>
              <button onClick={handleCopy} className="btn-icon">
                {copied ? t.shortener.copied : t.shortener.copy}
              </button>
            </div>
            {qrCodeData && (
              <div className="qr-container">
                <img src={qrCodeData} alt="QR Code" className="qr-img" />
                <p className="qr-hint">{t.shortener.scanHint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Main App ── */
function App() {
  const { t } = useLang();

  return (
    <div className="page">
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      <nav className="glass-nav">
        <div className="nav-brand">Overnit<span className="dot">.</span></div>
        <div className="nav-right">
          <div className="nav-links">
            <a href="#shortener">{t.nav.shortener}</a>
            <a href="#qr">{t.nav.qr}</a>
            <a href="#features">{t.nav.features}</a>
          </div>
          <LangSwitcher />
        </div>
      </nav>

      <main className="main-content">
        <header className="hero fade-in-up">
          <div className="hero-badge">{t.heroBadge}</div>
          <h1 className="hero-title">
            {t.heroTitle1}<br />
            <span className="gradient-text">{t.heroTitleHighlight}</span>
          </h1>
          <p className="hero-subtitle">
            {t.heroSubtitle}
          </p>
          <div className="hero-actions">
            <a href="#shortener" className="btn btn-primary">{t.ctaShortener}</a>
            <a href="#qr" className="btn btn-ghost">{t.ctaQr}</a>
          </div>
        </header>

        <div className="tools-wrapper">
          <LinkShortener />
          <QRGenerator />
        </div>

        <section id="features" className="features scale-in delay-2">
          <h2 className="section-title">{t.featuresSection.title}</h2>
          <div className="features-grid">
            <div className="feature-card glass-card">
              <span className="feature-icon">⚡</span>
              <h3>{t.featuresSection.fastTitle}</h3>
              <p>{t.featuresSection.fastDesc}</p>
            </div>
            <div className="feature-card glass-card">
              <span className="feature-icon">🔒</span>
              <h3>{t.featuresSection.privateTitle}</h3>
              <p>{t.featuresSection.privateDesc}</p>
            </div>
            <div className="feature-card glass-card">
              <span className="feature-icon">📈</span>
              <h3>{t.featuresSection.scaleTitle}</h3>
              <p>{t.featuresSection.scaleDesc}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} {t.footerApp}</p>
      </footer>
    </div>
  );
}

export default App;

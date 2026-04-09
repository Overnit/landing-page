import { useState, useEffect, useRef } from "react";
import { useLang } from "./LangContext";
import { LangSwitcher } from "./LangSwitcher";
import QRCode from "qrcode";
import "./index.css";

/* ── QR Generator Section ── */
function QRGenerator() {
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
          <span className="tool-badge">Free Tool</span>
          <h2>📷 QR Code Generator</h2>
          <p>Type any URL or text to generate a custom QR Code instantly. No signup, no limits.</p>
        </div>

        <div className="qr-builder">
          <div className="qr-controls">
            <textarea
              className="glass-input qr-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://overnit.com  (or any text)"
              rows={3}
            />
            <div className="qr-options">
              <label className="qr-option-label">
                <span>QR Color</span>
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="color-picker"
                />
              </label>
              <label className="qr-option-label">
                <span>Background</span>
                <input
                  type="color"
                  value={qrBg}
                  onChange={(e) => setQrBg(e.target.value)}
                  className="color-picker"
                />
              </label>
              <label className="qr-option-label">
                <span>Size: {size}px</span>
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
                  ⬇ Download PNG
                </button>
              </>
            ) : (
              <div className="qr-placeholder">
                <span className="qr-placeholder-icon">▣</span>
                <p>Your QR will appear here</p>
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
          <span className="tool-badge">Free Tool</span>
          <h2>🔗 Link Shortener</h2>
          <p>Paste a long URL to instantly create a short branded link plus a scannable QR code.</p>
        </div>

        <form onSubmit={handleShorten} className="shortener-form">
          <div className="input-group">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-very-long-url.com/some/path..."
              required
              className="glass-input"
              disabled={isShortening}
            />
            <button type="submit" className="btn btn-primary" disabled={isShortening}>
              {isShortening ? "Generating…" : "Shorten URL"}
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
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
            {qrCodeData && (
              <div className="qr-container">
                <img src={qrCodeData} alt="QR Code" className="qr-img" />
                <p className="qr-hint">Scan to test</p>
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
            <a href="#shortener">Shortener</a>
            <a href="#qr">QR Code</a>
            <a href="#features">{t.nav.features}</a>
          </div>
          <LangSwitcher />
        </div>
      </nav>

      <main className="main-content">
        <header className="hero fade-in-up">
          <div className="hero-badge">🚀 Now running on KubeForge Proxmox K3s</div>
          <h1 className="hero-title">
            Free tools for<br />
            <span className="gradient-text">developers & creators.</span>
          </h1>
          <p className="hero-subtitle">
            Shorten links, generate QR codes, and ship faster — all served from a sovereign homelab.
          </p>
          <div className="hero-actions">
            <a href="#shortener" className="btn btn-primary">Try Link Shortener →</a>
            <a href="#qr" className="btn btn-ghost">Generate QR Code</a>
          </div>
        </header>

        <div className="tools-wrapper">
          <LinkShortener />
          <QRGenerator />
        </div>

        <section id="features" className="features scale-in delay-2">
          <h2 className="section-title">Built with True Sovereign Tech</h2>
          <div className="features-grid">
            <div className="feature-card glass-card">
              <span className="feature-icon">⚡</span>
              <h3>Lightning Fast</h3>
              <p>Served from a K3s Cluster on bare-metal Proxmox VMs with Redis caching.</p>
            </div>
            <div className="feature-card glass-card">
              <span className="feature-icon">🔒</span>
              <h3>Private by Default</h3>
              <p>All data lives inside your own homelab. Zero third-party tracking.</p>
            </div>
            <div className="feature-card glass-card">
              <span className="feature-icon">📈</span>
              <h3>Horizontally Scalable</h3>
              <p>Kubernetes deployments auto-scale to handle any traffic spike.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Overnit · Open-source homelab infrastructure</p>
      </footer>
    </div>
  );
}

export default App;

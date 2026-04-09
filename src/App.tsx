import { useState, useRef, useEffect } from "react";
import { useLang } from "./LangContext";
import { LangSwitcher } from "./LangSwitcher";
import QRCode from "qrcode";
import "./App.css";

function App() {
  const { t } = useLang();
  
  // Link Shortener specific state
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
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to shorten");
      
      setShortenedUrl(data.shortUrl);
      const qrDataUri = await QRCode.toDataURL(data.shortUrl, { width: 200, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } });
      setQrCodeData(qrDataUri);
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
    <div className="page dark-theme">
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      
      <nav className="nav glass-nav">
        <div className="nav-brand">Overnit<span className="dot">.</span></div>
        <div className="nav-right">
          <div className="nav-links">
            <a href="#shortener">Shortener</a>
            <a href="#features">{t.nav.features}</a>
            <a href="#about">{t.nav.about}</a>
          </div>
          <LangSwitcher />
        </div>
      </nav>

      <main className="main-content">
        <header className="hero fade-in-up">
          <div className="hero-badge">Now Open Source inside Proxmox K3s 🚀</div>
          <h1 className="hero-title">
            The Ultimate Infrastructure <br/>
            to <span className="gradient-text">Shorten Your Scope.</span>
          </h1>
          <p className="hero-subtitle">
            Deploy your code, share your links, and scale endlessly with the new KubeForge engine.
          </p>
        </header>

        {/* The Link Shortener Feature */}
        <section id="shortener" className="shortener-section fade-in-up delay-1">
          <div className="glass-card shortener-card">
            <h2>🔗 Supercharge your links</h2>
            <p>Paste a long, messy URL below to instantly create a branded short link and a dynamic QR code.</p>
            
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
                <button type="submit" className="btn btn-primary btn-glow" disabled={isShortening}>
                  {isShortening ? "Generating..." : "Shorten URL"}
                </button>
              </div>
              {errorMsg && <div className="error-text">{errorMsg}</div>}
            </form>

            {shortenedUrl && (
              <div className="result-container scale-in">
                <div className="result-url-box">
                  <a href={shortenedUrl} target="_blank" rel="noreferrer" className="result-link">{shortenedUrl}</a>
                  <button onClick={handleCopy} className="btn-icon" aria-label="Copy to clipboard">
                    {copied ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>
                <div className="qr-container">
                  {qrCodeData && <img src={qrCodeData} alt="QR Code" className="qr-img" />}
                  <p className="qr-hint">Scan to test</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="features" className="features scale-in delay-2">
          <h2 className="section-title">Built with True Sovereign Tech</h2>
          <div className="features-grid">
            <div className="feature-card glass-card">
              <div className="feature-icon gradient-text">⚡</div>
              <h3>Lighting Fast Node.js</h3>
              <p>Served natively from your K3s Cluster leveraging Express and Redis caches.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon gradient-text">🔒</div>
              <h3>On-Premise Privacy</h3>
              <p>All shortened URLs safely live within your local Homelab, totally independent.</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon gradient-text">📈</div>
              <h3>Infinite Scaling</h3>
              <p>Proxmox VMs orchestrating micro-containers for extreme auto-scaling potential.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer glass-footer">
        <p>&copy; {new Date().getFullYear()} Overnit. Empowering the open-source homelab community.</p>
      </footer>
    </div>
  );
}

export default App;

import { useState } from "react";
import { useLang } from "./LangContext";
import { LangSwitcher } from "./LangSwitcher";
import "./App.css";

function App() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-brand">Overnit</div>
        <div className="nav-right">
          <div className="nav-links">
            <a href="#features">{t.nav.features}</a>
            <a href="#tools">{t.nav.tools}</a>
            <a href="#about">{t.nav.about}</a>
            <a href="#contact">{t.nav.contact}</a>
          </div>
          <LangSwitcher />
        </div>
      </nav>

      <header className="hero">
        <h1>
          {t.hero.title1}<span className="gradient-text">{t.hero.titleHighlight}</span>{t.hero.title2}
        </h1>
        <p className="hero-subtitle">{t.hero.subtitle}</p>
        <div className="hero-actions">
          <a href="#contact" className="btn btn-primary">{t.hero.cta}</a>
          <a href="#features" className="btn btn-secondary">{t.hero.secondary}</a>
        </div>
      </header>

      <section id="tools" className="tools-hero">
        <div className="tools-hero-content">
          <div className="tools-hero-text">
            <span className="tools-badge">{t.tools.qr.badge} ✨</span>
            <h2>{t.tools.qr.title}</h2>
            <p>{t.tools.qr.desc}</p>
            <a href="/qr" className="btn btn-primary btn-lg">{t.hero.cta} →</a>
          </div>
          <div className="tools-hero-visual">
            <div className="qr-demo-card">
              <div className="qr-demo-grid">
                {Array.from({ length: 49 }, (_, i) => (
                  <div key={i} className={`qr-cell ${[0,1,2,5,6,7,8,14,16,20,21,22,24,26,28,30,32,34,35,36,40,42,43,44,47,48].includes(i) ? "filled" : ""}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2>{t.features.title}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{t.features.fast.title}</h3>
            <p>{t.features.fast.desc}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t.features.secure.title}</h3>
            <p>{t.features.secure.desc}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>{t.features.scale.title}</h3>
            <p>{t.features.scale.desc}</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <h2>{t.about.title}</h2>
        <p>{t.about.desc}</p>
      </section>

      <section id="contact" className="contact">
        <h2>{t.contact.title}</h2>
        {submitted ? (
          <p className="success-msg">{t.contact.success}</p>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="email"
              placeholder={t.contact.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">{t.contact.submit}</button>
          </form>
        )}
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Overnit. {t.footer}</p>
      </footer>
    </div>
  );
}

export default App;

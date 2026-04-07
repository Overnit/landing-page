import { useState } from "react";
import "./App.css";

function App() {
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
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <header className="hero">
        <h1>
          Build <span className="gradient-text">Infrastructure</span> That Scales
        </h1>
        <p className="hero-subtitle">
          Cloud-native solutions for modern teams. Deploy, manage, and scale
          your infrastructure with confidence.
        </p>
        <div className="hero-actions">
          <a href="#contact" className="btn btn-primary">Get Started</a>
          <a href="#features" className="btn btn-secondary">Learn More</a>
        </div>
      </header>

      <section id="features" className="features">
        <h2>Why Overnit?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Deploy infrastructure in minutes, not hours. Automated pipelines that just work.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure by Default</h3>
            <p>Zero-trust architecture with end-to-end encryption and automated compliance.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Auto Scaling</h3>
            <p>Kubernetes-native workloads that scale seamlessly with your demand.</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <h2>About Us</h2>
        <p>
          We're a team of infrastructure engineers passionate about making cloud-native
          technology accessible to everyone. From bare-metal homelab setups to production
          Kubernetes clusters, we build tools that simplify the complex.
        </p>
      </section>

      <section id="contact" className="contact">
        <h2>Stay in the Loop</h2>
        {submitted ? (
          <p className="success-msg">Thanks! We'll be in touch.</p>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        )}
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Overnit. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

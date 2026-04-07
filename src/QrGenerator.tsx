import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import "./QrGenerator.css";

type ErrorLevel = "L" | "M" | "Q" | "H";

function QrGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#0a0a0a");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const generate = useCallback(
    (value: string, w: number, ec: ErrorLevel, fg: string, bg: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setQrDataUrl(null);
        return;
      }
      debounceRef.current = setTimeout(() => {
        QRCode.toDataURL(value, {
          width: w,
          margin: 2,
          errorCorrectionLevel: ec,
          color: { dark: fg, light: bg },
        }).then(setQrDataUrl);
      }, 150);
    },
    []
  );

  const handleTextChange = (v: string) => {
    setText(v);
    generate(v, size, errorLevel, fgColor, bgColor);
  };

  const handleSizeChange = (v: number) => {
    setSize(v);
    generate(text, v, errorLevel, fgColor, bgColor);
  };

  const handleErrorLevelChange = (v: ErrorLevel) => {
    setErrorLevel(v);
    generate(text, size, v, fgColor, bgColor);
  };

  const handleFgChange = (v: string) => {
    setFgColor(v);
    generate(text, size, errorLevel, v, bgColor);
  };

  const handleBgChange = (v: string) => {
    setBgColor(v);
    generate(text, size, errorLevel, fgColor, v);
  };

  const download = (format: "png" | "svg") => {
    if (!text.trim()) return;
    if (format === "png") {
      const a = document.createElement("a");
      a.href = qrDataUrl!;
      a.download = "qrcode.png";
      a.click();
    } else {
      QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      }).then((svg) => {
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "qrcode.svg";
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }
  };

  return (
    <div className="qr-page">
      <nav className="nav">
        <a href="/" className="nav-brand">Overnit</a>
        <div className="nav-links">
          <a href="/">Home</a>
        </div>
      </nav>

      <div className="qr-container">
        <h1>
          QR Code <span className="gradient-text">Generator</span>
        </h1>
        <p className="qr-subtitle">Generate QR codes instantly. Free, no tracking, runs in your browser.</p>

        <div className="qr-layout">
          <div className="qr-controls">
            <label className="qr-label">
              Content
              <textarea
                className="qr-input"
                placeholder="Enter URL, text, email, phone..."
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={3}
              />
            </label>

            <label className="qr-label">
              Size: {size}px
              <input
                type="range"
                min={128}
                max={1024}
                step={32}
                value={size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="qr-range"
              />
            </label>

            <label className="qr-label">
              Error Correction
              <div className="qr-ec-group">
                {(["L", "M", "Q", "H"] as ErrorLevel[]).map((level) => (
                  <button
                    key={level}
                    className={`qr-ec-btn ${errorLevel === level ? "active" : ""}`}
                    onClick={() => handleErrorLevelChange(level)}
                    title={
                      level === "L" ? "Low (7%)"
                      : level === "M" ? "Medium (15%)"
                      : level === "Q" ? "Quartile (25%)"
                      : "High (30%)"
                    }
                  >
                    {level}
                  </button>
                ))}
              </div>
            </label>

            <div className="qr-color-row">
              <label className="qr-label qr-color-label">
                Foreground
                <div className="qr-color-picker">
                  <input type="color" value={fgColor} onChange={(e) => handleFgChange(e.target.value)} />
                  <span>{fgColor}</span>
                </div>
              </label>
              <label className="qr-label qr-color-label">
                Background
                <div className="qr-color-picker">
                  <input type="color" value={bgColor} onChange={(e) => handleBgChange(e.target.value)} />
                  <span>{bgColor}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="qr-preview">
            {qrDataUrl ? (
              <>
                <div className="qr-image-wrapper">
                  <img src={qrDataUrl} alt="QR Code" width={size > 400 ? 400 : size} height={size > 400 ? 400 : size} />
                </div>
                <div className="qr-download-row">
                  <button className="btn btn-primary" onClick={() => download("png")}>Download PNG</button>
                  <button className="btn btn-secondary" onClick={() => download("svg")}>Download SVG</button>
                </div>
              </>
            ) : (
              <div className="qr-placeholder">
                <span>📱</span>
                <p>Enter content to generate a QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Overnit. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default QrGenerator;

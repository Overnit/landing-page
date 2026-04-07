import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { useLang } from "./LangContext";
import { LangSwitcher } from "./LangSwitcher";
import "./QrGenerator.css";

type ErrorLevel = "L" | "M" | "Q" | "H";

function compositeWithLogo(
  qrDataUrl: string,
  logoDataUrl: string,
  size: number
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 0, 0, size, size);
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = Math.round(size * 0.22);
        const offset = Math.round((size - logoSize) / 2);
        const pad = 4;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(offset - pad, offset - pad, logoSize + pad * 2, logoSize + pad * 2, 6);
        ctx.fill();
        ctx.drawImage(logoImg, offset, offset, logoSize, logoSize);
        resolve(canvas.toDataURL("image/png"));
      };
      logoImg.src = logoDataUrl;
    };
    qrImg.src = qrDataUrl;
  });
}

function QrGenerator() {
  const { t } = useLang();
  const [text, setText] = useState("");
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("H");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#0a0a0a");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const generate = useCallback(
    (value: string, w: number, ec: ErrorLevel, fg: string, bg: string, logo: string | null) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value.trim()) {
        setQrDataUrl(null);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        const raw = await QRCode.toDataURL(value, {
          width: w,
          margin: 2,
          errorCorrectionLevel: ec,
          color: { dark: fg, light: bg },
        });
        if (logo) {
          const composited = await compositeWithLogo(raw, logo, w);
          setQrDataUrl(composited);
        } else {
          setQrDataUrl(raw);
        }
      }, 150);
    },
    []
  );

  const handleTextChange = (v: string) => {
    setText(v);
    generate(v, size, errorLevel, fgColor, bgColor, logoDataUrl);
  };

  const handleSizeChange = (v: number) => {
    setSize(v);
    generate(text, v, errorLevel, fgColor, bgColor, logoDataUrl);
  };

  const handleErrorLevelChange = (v: ErrorLevel) => {
    setErrorLevel(v);
    generate(text, size, v, fgColor, bgColor, logoDataUrl);
  };

  const handleFgChange = (v: string) => {
    setFgColor(v);
    generate(text, size, errorLevel, v, bgColor, logoDataUrl);
  };

  const handleBgChange = (v: string) => {
    setBgColor(v);
    generate(text, size, errorLevel, fgColor, v, logoDataUrl);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoDataUrl(dataUrl);
      generate(text, size, errorLevel, fgColor, bgColor, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoDataUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    generate(text, size, errorLevel, fgColor, bgColor, null);
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
        <div className="nav-right">
          <div className="nav-links">
            <a href="/">{t.nav.home}</a>
          </div>
          <LangSwitcher />
        </div>
      </nav>

      <div className="qr-container">
        <h1>
          {t.qrPage.title1}<span className="gradient-text">{t.qrPage.titleHighlight}</span>
        </h1>
        <p className="qr-subtitle">{t.qrPage.subtitle}</p>

        <div className="qr-layout">
          <div className="qr-controls">
            <label className="qr-label">
              {t.qrPage.content}
              <textarea
                className="qr-input"
                placeholder={t.qrPage.contentPlaceholder}
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={3}
              />
            </label>

            <label className="qr-label">
              {t.qrPage.size}: {size}px
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
              {t.qrPage.errorCorrection}
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
                {t.qrPage.foreground}
                <div className="qr-color-picker">
                  <input type="color" value={fgColor} onChange={(e) => handleFgChange(e.target.value)} />
                  <span>{fgColor}</span>
                </div>
              </label>
              <label className="qr-label qr-color-label">
                {t.qrPage.background}
                <div className="qr-color-picker">
                  <input type="color" value={bgColor} onChange={(e) => handleBgChange(e.target.value)} />
                  <span>{bgColor}</span>
                </div>
              </label>
            </div>

            <label className="qr-label">
              {t.qrPage.logo}
              <div className="qr-logo-row">
                {logoDataUrl ? (
                  <div className="qr-logo-preview">
                    <img src={logoDataUrl} alt="Logo" className="qr-logo-thumb" />
                    <button className="qr-logo-remove" onClick={removeLogo}>{t.qrPage.logoRemove}</button>
                  </div>
                ) : (
                  <button className="btn btn-secondary qr-logo-btn" onClick={() => fileRef.current?.click()}>
                    {t.qrPage.logoAdd}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  hidden
                />
              </div>
            </label>
          </div>

          <div className="qr-preview">
            {qrDataUrl ? (
              <>
                <div className="qr-image-wrapper">
                  <img src={qrDataUrl} alt="QR Code" width={size > 400 ? 400 : size} height={size > 400 ? 400 : size} />
                </div>
                <div className="qr-download-row">
                  <button className="btn btn-primary" onClick={() => download("png")}>{t.qrPage.downloadPng}</button>
                  <button className="btn btn-secondary" onClick={() => download("svg")}>{t.qrPage.downloadSvg}</button>
                </div>
              </>
            ) : (
              <div className="qr-placeholder">
                <span>📱</span>
                <p>{t.qrPage.placeholder}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Overnit. {t.footer}</p>
      </footer>
    </div>
  );
}

export default QrGenerator;

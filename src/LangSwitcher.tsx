import { useLang } from "./LangContext";
import type { Lang } from "./i18n";
import "./LangSwitcher.css";

const flags: Record<Lang, string> = { en: "🇺🇸", pt: "🇧🇷", es: "🇪🇸" };
const labels: Record<Lang, string> = { en: "EN", pt: "PT", es: "ES" };

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  const langs: Lang[] = ["en", "pt", "es"];

  return (
    <div className="lang-switcher">
      {langs.map((l) => (
        <button
          key={l}
          className={`lang-btn ${lang === l ? "active" : ""}`}
          onClick={() => setLang(l)}
          aria-label={labels[l]}
        >
          <span className="lang-flag">{flags[l]}</span>
          <span className="lang-label">{labels[l]}</span>
        </button>
      ))}
    </div>
  );
}

import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { LangProvider } from "./LangContext";
import App from "./App.tsx";
import QrGenerator from "./QrGenerator.tsx";

function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (path === "/qr") return <QrGenerator />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangProvider>
      <Router />
    </LangProvider>
  </StrictMode>
);

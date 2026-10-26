import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useProfile } from "./lib/data";
import { Portfolio } from "./Portfolio";
import { ProjectPage } from "./ProjectPage";

const THEME_KEY = "talentfolio:theme";

function useHashRoute() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const on = () => setHash(location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  // Only "#/…" hashes are routes; plain "#section" hashes are in-page anchors.
  return hash.startsWith("#/") ? hash.slice(1) : "/";
}

function useTheme(preferred: "dark" | "light" | "auto" | undefined) {
  const stored = (() => {
    try {
      return localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
    } catch {
      return null;
    }
  })();
  const system = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const initial = stored ?? (preferred && preferred !== "auto" ? preferred : system);
  const [theme, setTheme] = useState<"dark" | "light">(initial);
  useEffect(() => {
    if (!stored && preferred && preferred !== "auto") setTheme(preferred);
  }, [preferred]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode */
    }
  };
  return [theme, toggle] as const;
}

export default function App() {
  const route = useHashRoute();
  const state = useProfile();
  const [theme, toggleTheme] = useTheme(state.status === "ready" ? state.data.site.theme.mode : undefined);

  useEffect(() => {
    if (state.status !== "ready") return;
    const root = document.documentElement.style;
    root.setProperty("--accent", state.data.site.theme.accent);
    root.setProperty("--accent2", state.data.site.theme.accent2);
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass w-full max-w-lg rounded-3xl p-8">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-amber-500">
            <AlertTriangle /> Your profile JSON needs a fix
          </div>
          <p className="mt-2 text-sm text-muted">Source: {state.source}</p>
          <ul className="mt-4 space-y-1.5 rounded-xl bg-bg-soft p-4 font-mono text-xs">
            {state.errors.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (route.startsWith("/projects/"))
    return <ProjectPage data={state.data} slug={decodeURIComponent(route.slice("/projects/".length))} theme={theme} onToggleTheme={toggleTheme} />;

  return <Portfolio data={state.data} theme={theme} onToggleTheme={toggleTheme} />;
}

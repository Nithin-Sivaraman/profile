import { AlertTriangle, Pencil, X } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useProfile } from "./lib/data";
import { Portfolio } from "./Portfolio";
import { ProjectPage } from "./ProjectPage";
import { portfolioUrl } from "./lib/data";

const Studio = lazy(() => import("./Studio").then((m) => ({ default: m.Studio })));
const AuthGate = lazy(() => import("./components/AuthGate").then((m) => ({ default: m.AuthGate })));

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
  const isDraft = new URLSearchParams(location.search).has("draft");
  const state = useProfile(isDraft);
  const [theme, toggleTheme] = useTheme(state.status === "ready" ? state.data.site.theme.mode : undefined);

  useEffect(() => {
    if (state.status !== "ready") return;
    const root = document.documentElement.style;
    root.setProperty("--accent", state.data.site.theme.accent);
    root.setProperty("--accent2", state.data.site.theme.accent2);
  }, [state]);

  if (route === "/studio")
    return (
      <Suspense fallback={null}>
        <AuthGate>{(session, signOut) => <Studio session={session} onSignOut={signOut} />}</AuthGate>
      </Suspense>
    );

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
          <a href="#/studio" className="bg-gradient mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white">
            <Pencil size={14} /> Open Studio to fix it
          </a>
        </div>
      </div>
    );
  }

  const banner = isDraft ? (
    <div className="screen-only fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="glass flex items-center gap-3 rounded-full bg-bg-soft py-2 pl-4 pr-2 text-xs shadow-xl">
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
        Previewing your Studio draft
        <a href="#/studio" className="bg-gradient rounded-full px-3 py-1.5 font-semibold text-white">
          Back to Studio
        </a>
        <button
          aria-label="Exit preview"
          onClick={() => (location.href = portfolioUrl(false))}
          className="rounded-full p-1.5 hover:bg-line"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  ) : null;

  if (route.startsWith("/projects/"))
    return <ProjectPage data={state.data} slug={decodeURIComponent(route.slice("/projects/".length))} theme={theme} onToggleTheme={toggleTheme} />;

  return <Portfolio data={state.data} theme={theme} onToggleTheme={toggleTheme} banner={banner} />;
}

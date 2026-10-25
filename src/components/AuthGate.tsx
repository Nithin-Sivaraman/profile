import { AlertTriangle, ArrowLeft, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchAuthConfig, loadGoogleIdentity, readSession, saveSession, verifyToken, type AuthConfig, type Session } from "../lib/auth";
import { portfolioUrl } from "../lib/data";

/** Wraps the Studio: signed in with an allowed Google account, or nothing. */
export function AuthGate({ children }: { children: (session: Session | null, signOut: () => void) => React.ReactNode }) {
  const [cfg, setCfg] = useState<AuthConfig | null>(null);
  const [session, setSession] = useState<Session | null>(readSession);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAuthConfig().then(setCfg);
  }, []);

  const needsSignIn = !!cfg?.enabled && !session;
  const configured = !!cfg?.clientId;

  useEffect(() => {
    if (!needsSignIn || !configured || !cfg) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !btnRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: cfg.clientId,
          cancel_on_tap_outside: false,
          callback: ({ credential }) => {
            const r = verifyToken(credential, cfg);
            if (r.ok) {
              saveSession(r.session);
              setSession(r.session);
              setError("");
            } else {
              setError(r.reason);
            }
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, { theme: "filled_black", size: "large", shape: "pill", text: "signin_with" });
      })
      .catch((e: Error) => !cancelled && (setLoadFailed(true), setError(e.message)));
    return () => {
      cancelled = true;
    };
  }, [needsSignIn, configured, cfg]);

  const signOut = () => {
    window.google?.accounts.id.disableAutoSelect();
    setSession(null);
    import("../lib/auth").then((m) => m.clearSession());
  };

  if (!cfg) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    );
  }

  if (!needsSignIn) return <>{children(session, signOut)}</>;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass w-full max-w-md rounded-3xl p-8 text-center">
        <div className="bg-gradient mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white">
          <Lock size={24} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold">Studio is locked</h1>
        <p className="mt-2 text-sm text-muted">
          {configured ? "Sign in with the owner's Google account to edit this portfolio." : "Google sign-in hasn't been set up yet."}
        </p>

        {configured ? (
          <div className="mt-7 flex justify-center">
            <div ref={btnRef} />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-bg-soft p-4 text-left text-xs leading-relaxed text-muted">
            Add a Google OAuth <b className="text-fg">Client ID</b> to <code className="rounded bg-line px-1">site.auth.clientId</code> in{" "}
            <code className="rounded bg-line px-1">public/data/profile.json</code>. See the README section “Locking the Studio”. To unlock without Google, set{" "}
            <code className="rounded bg-line px-1">site.auth.enabled</code> to <code className="rounded bg-line px-1">false</code>.
          </div>
        )}

        {error && (
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
        {loadFailed && <p className="mt-3 text-xs text-muted">Offline? The portfolio itself still works without signing in.</p>}

        <a href={portfolioUrl(false)} className="mt-7 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft size={14} /> Back to the portfolio
        </a>
      </div>
    </div>
  );
}

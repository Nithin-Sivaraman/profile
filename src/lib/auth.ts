/**
 * Google sign-in gate for the Studio.
 *
 * IMPORTANT, and stated plainly: this runs entirely in the browser, so it is a
 * lock on the Studio *screen*, not on the data. The profile JSON is a public
 * file on a static site — anyone can read it, and the Studio only ever writes
 * to this browser's localStorage and downloads a file. Publishing still means
 * replacing the file on the server, which is protected by whatever guards your
 * hosting/git account. Treat this as "keep the edit screen out of the way of
 * visitors", not as a security boundary.
 */

export type AuthConfig = {
  enabled: boolean;
  provider: string;
  clientId: string;
  allowedEmails: string[];
};

export type Session = { email: string; name?: string; picture?: string; exp: number };

const SESSION_KEY = "talentfolio:session";
const GIS_SRC = "https://accounts.google.com/gsi/client";

/* ------------------------------- session -------------------------------- */

export function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s?.email || typeof s.exp !== "number" || s.exp * 1000 < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* private mode: the session simply won't survive a reload */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/* -------------------------------- config -------------------------------- */

const EMPTY: AuthConfig = { enabled: false, provider: "google", clientId: "", allowedEmails: [] };

/**
 * Always read the auth rules from the DEFAULT profile, never from the
 * ?profile=… one — otherwise pointing the URL at an unprotected profile would
 * be enough to walk past the gate.
 */
export async function fetchAuthConfig(): Promise<AuthConfig> {
  try {
    const res = await fetch("data/profile.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(String(res.status));
    const raw = (await res.json()) as { site?: { auth?: Partial<AuthConfig> } };
    const a = raw.site?.auth;
    if (!a?.enabled) return EMPTY;
    return {
      enabled: true,
      provider: a.provider ?? "google",
      clientId: a.clientId ?? "",
      allowedEmails: (a.allowedEmails ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean),
    };
  } catch {
    // Can't read the rules → stay locked rather than failing open.
    return { ...EMPTY, enabled: true, clientId: "" };
  }
}

/* --------------------------------- token -------------------------------- */

type IdTokenPayload = { iss?: string; aud?: string; exp?: number; email?: string; email_verified?: boolean | string; name?: string; picture?: string };

export function decodeIdToken(jwt: string): IdTokenPayload | null {
  try {
    const part = jwt.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json))) as IdTokenPayload;
  } catch {
    return null;
  }
}

export function verifyToken(jwt: string, cfg: AuthConfig): { ok: true; session: Session } | { ok: false; reason: string } {
  const p = decodeIdToken(jwt);
  if (!p) return { ok: false, reason: "That sign-in response could not be read." };
  if (p.iss !== "https://accounts.google.com" && p.iss !== "accounts.google.com") return { ok: false, reason: "Unexpected token issuer." };
  if (p.aud !== cfg.clientId) return { ok: false, reason: "This token was issued for a different app." };
  if (!p.exp || p.exp * 1000 < Date.now()) return { ok: false, reason: "That sign-in has expired — try again." };
  if (p.email_verified !== true && p.email_verified !== "true") return { ok: false, reason: "That Google account's email is not verified." };
  const email = (p.email ?? "").toLowerCase();
  if (!email) return { ok: false, reason: "Google did not return an email address." };
  if (cfg.allowedEmails.length > 0 && !cfg.allowedEmails.includes(email)) {
    return { ok: false, reason: `${email} is not allowed to edit this portfolio.` };
  }
  return { ok: true, session: { email, name: p.name, picture: p.picture, exp: p.exp } };
}

/* ------------------------- Google Identity script ------------------------ */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
          renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;

export function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = GIS_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      gisPromise = null;
      reject(new Error("Could not load Google sign-in. Check your connection."));
    };
    document.head.appendChild(el);
  });
  return gisPromise;
}

import { useEffect, useState } from "react";
import { formatIssues, profileSchema, type ProfileData } from "./schema";

export type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: ProfileData; source: string; raw: unknown }
  | { status: "error"; source: string; errors: string[] };

export function parseProfile(raw: unknown): { ok: true; data: ProfileData } | { ok: false; errors: string[] } {
  const r = profileSchema.safeParse(raw);
  return r.success ? { ok: true, data: r.data } : { ok: false, errors: formatIssues(r.error) };
}

/** Which JSON to load: ?profile=name → data/name.json, otherwise data/profile.json. */
export function profileSource() {
  const name = new URLSearchParams(location.search).get("profile");
  const safe = name && /^[\w-]+$/.test(name) ? name : "profile";
  return `data/${safe}.json`;
}

export function useProfile(): LoadState {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const source = profileSource();
    const finish = (raw: unknown, src: string) => {
      const r = parseProfile(raw);
      if (cancelled) return;
      setState(r.ok ? { status: "ready", data: r.data, source: src, raw } : { status: "error", source: src, errors: r.errors });
    };

    fetch(source, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${source} (HTTP ${res.status})`);
        return res.json();
      })
      .then((raw) => finish(raw, source))
      .catch((e: Error) => {
        if (!cancelled) setState({ status: "error", source, errors: [e.message] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

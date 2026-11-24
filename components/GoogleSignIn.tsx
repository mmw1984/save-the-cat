"use client";

import { useEffect, useRef, useState } from "react";

const GIS_SRC = "https://accounts.google.com/gsi/client";

type GisPromptNotification = { isNotDisplayed: () => boolean };

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    nonce?: string;
    hd?: string;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
    use_fedcm_for_button?: boolean;
  }) => void;
  prompt: (listener?: (notification: GisPromptNotification) => void) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
      button_auto_select?: boolean;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

let gisPromise: Promise<GoogleAccountsId | null> | null = null;

function loadGis(): Promise<GoogleAccountsId | null> {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    if (window.google?.accounts?.id) return resolve(window.google.accounts.id);
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google?.accounts?.id ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return gisPromise;
}

async function createNoncePair(): Promise<{ raw: string; hashed: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, hashed };
}

/**
 * Official Google sign-in: renders the GIS button and fires the floating
 * One Tap prompt. The returned ID token goes to /api/auth/google — it never
 * touches Supabase.
 */
export default function GoogleSignIn({
  clientId,
  domain,
  wrongDomain,
}: {
  clientId: string;
  domain: string;
  wrongDomain: string;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function onCredential(credential: string) {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ credential, nonce: nonceRef.current }),
        });
        if (res.ok) {
          window.location.reload();
          return;
        }
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(res.status === 403 ? wrongDomain : (data.error ?? "Sign-in failed. Try again."));
      } catch {
        setError("Sign-in failed. Try again.");
      } finally {
        setBusy(false);
      }
    }

    (async () => {
      const [gis, nonce] = await Promise.all([loadGis(), createNoncePair()]);
      if (cancelled || !gis || !buttonRef.current) return;
      nonceRef.current = nonce.raw;
      gis.initialize({
        client_id: clientId,
        nonce: nonce.hashed,
        hd: domain || undefined,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true,
        use_fedcm_for_button: true,
        callback: (response) => {
          if (response.credential) void onCredential(response.credential);
        },
      });
      gis.renderButton(buttonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: Math.min(buttonRef.current.clientWidth || 320, 400),
        button_auto_select: true,
      });
      // Floating One Tap prompt for returning users.
      gis.prompt();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, domain]);

  return (
    <div className="cta">
      <div ref={buttonRef} className="gis-btn" aria-busy={busy} />
      {error ? <div className="error-note">{error}</div> : null}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

import { useInAppBrowserEscaper } from "@jhrunning/inappbrowserescaper/react";

const EMOJI_PATTERN = /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]+\s*/u;

export default function InAppBrowserEscape({
  children,
}: {
  children: React.ReactNode;
}) {
  const { browserInfo, isInApp, escapeFromInApp } = useInAppBrowserEscaper();
  const escapedRef = useRef(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const heading = document.querySelector<HTMLElement>(
        'div[style*="z-index: 999999"] h3',
      );
      if (heading && EMOJI_PATTERN.test(heading.textContent ?? "")) {
        heading.textContent = (heading.textContent ?? "").replace(
          EMOJI_PATTERN,
          "",
        );
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInApp || browserInfo?.appName !== "instagram") return;
    if (escapedRef.current) return;
    escapedRef.current = true;
    escapeFromInApp({
      message:
        "For the best signing experience, please open this page in your browser",
      buttonText: "Open in Browser",
    });
  }, [isInApp, browserInfo, escapeFromInApp]);

  return <>{children}</>;
}

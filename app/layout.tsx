import type { Metadata } from "next";

import InAppBrowserEscape from "@/components/InAppBrowserEscape";

import "./globals.css";

export const metadata: Metadata = {
  title: "Save the Cat 聯署",
  description: "聯署平台 — 用學校 Google 帳號簽名支持",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-HK">
      <body>
        <InAppBrowserEscape>{children}</InAppBrowserEscape>
      </body>
    </html>
  );
}

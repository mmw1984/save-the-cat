import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

import InAppBrowserEscape from "@/components/InAppBrowserEscape";
import { brand, petitionClosed } from "@/lib/env";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const oasis = brand() === "oasis";
  const closed = petitionClosed();
  return {
    title: closed
      ? "網站已關閉"
      : oasis
        ? "Statement: Campus Cat Welfare and Demand for Public Accountability — 聯署"
        : "Save the Cat 聯署",
    description: "聯署平台 — 簽名支持校貓留低",
    icons: [{ url: oasis ? "/oasis-logo.png" : "/favicon.png" }],
    openGraph: closed
      ? { title: "網站已關閉", type: "website" }
      : {
          title: "Save the Cat 聯署",
          description: "兩隻貓喺我哋校園住咗一個月——簽名支持佢哋留低。",
          type: "website",
        },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-HK">
      <body>
        <InAppBrowserEscape>{children}</InAppBrowserEscape>
      </body>
    </html>
  );
}

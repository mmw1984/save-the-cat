import Link from "next/link";

import CatIcon from "@/components/CatIcon";

const sections: [string, string][] = [
  [
    "1. Who we are",
    "This petition platform is operated by Marco Wong in a personal capacity, not by any students' association or school body. The operator acts as the data controller for the personal information described below.",
  ],
  [
    "2. Information we collect",
    "When you sign in with your school Google account, Google provides your account name, email address, and profile picture. When you sign the petition we record your name, email address, and the time you signed. We do not collect your location, browsing history, device analytics, or any other information.",
  ],
  [
    "3. How we use your information",
    "Your information is used to: verify that you are eligible to sign, record your signature exactly once, and display the public signature list. The public list shows only your name and the time you signed — your email address is never published and is visible only to administrators. We never use your information for marketing, and we never sell or rent it to anyone.",
  ],
  [
    "4. Legal basis",
    "We process your information because it is necessary to provide the petition service you have requested and to keep the service secure. Where required we rely on the consent you give by signing in and signing the petition.",
  ],
  [
    "5. How we share information",
    "Your details may be processed by service providers who help run the system — Google (sign-in), Supabase (database), and Cloudflare (hosting). Data is not otherwise shared.",
  ],
  [
    "6. Google sign-in",
    'When you press "Continue with Google", Google shows you what information it shares with us (your name, email address, and basic profile linked to your school account). We only use that to verify your eligibility and record your signature. We do not store your password, and we do not access anything else in your Google account. You can sign out or revoke access at any time through Google\'s third-party app settings.',
  ],
  [
    "7. How long we keep information",
    "Signature records are kept for as long as the petition remains active, and are removed once the campaign concludes.",
  ],
  [
    "8. Your rights",
    "You may ask us to provide you with a copy of your information, correct it, or delete it at any time by contacting us at the email address in section 9. Deleting your information also removes your signature from the petition.",
  ],
  [
    "9. Contact us",
    "If you have any questions about this policy, please contact me@mmw1984.com.",
  ],
];

export default function PrivacyPage() {
  return (
    <div className="container">
      <header className="site-header">
        <div className="row">
          <div className="brand">
            <CatIcon />
            <Link href="/">Save the Cat</Link>
          </div>
        </div>
      </header>
      <main className="hero" style={{ textAlign: "left", padding: "32px 0 48px" }}>
        <h1 style={{ fontSize: 22 }}>Privacy Policy</h1>
        <p className="body">Save the Cat Petition Platform · Effective date: 24 November 2026</p>
        <div className="body" style={{ maxWidth: "none" }}>
          {sections.map(([title, body]) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, margin: "0 0 6px" }}>{title}</h2>
              <p style={{ margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

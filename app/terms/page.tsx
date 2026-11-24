import Link from "next/link";

import CatIcon from "@/components/CatIcon";

const sections: [string, string][] = [
  [
    "1. Acceptance of Terms",
    'By accessing or using the Save the Cat petition platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.',
  ],
  [
    "2. Description of Service",
    "The Service provides an online platform for eligible students to show support for a petition. The system allows users to sign in with their school Google account, sign the petition once, and view the public list of signatories.",
  ],
  [
    "3. Eligibility",
    "The Service is available only to students who hold a school Google account under the @ccchwc.edu.hk domain.",
  ],
  [
    "4. User Responsibilities",
    "You agree to sign only with your own school account, provide accurate information, maintain the confidentiality of your account credentials, not attempt to sign on behalf of others, not attempt to circumvent any security measures, and use the Service only for its intended purpose.",
  ],
  [
    "5. Signature Usage",
    "Each school Google account may sign the petition once. Your name and the time you signed are displayed publicly on the signature list. Administrators may remove signatures that violate these terms.",
  ],
  [
    "6. Intellectual Property",
    "All content, design, and code associated with the Service are owned by Marco Wong, who operates the Service in a personal capacity. You may not copy, modify, distribute, or reverse-engineer any part of the Service.",
  ],
  [
    "7. Limitation of Liability",
    'The Service is provided "as is" without warranties of any kind. We are not liable for any inability to access the Service due to technical issues, loss of signature data, any damages arising from use of the Service, or unauthorized access to your account due to your negligence.',
  ],
  [
    "8. Service Availability",
    "We reserve the right to modify, suspend, or discontinue the Service at any time without prior notice. We are not responsible for any interruption or unavailability of the Service.",
  ],
  [
    "9. Termination",
    "We may suspend or terminate your access to the Service if you violate these terms or engage in any conduct that we reasonably believe is harmful to other users or the Service.",
  ],
  [
    "10. Changes to Terms",
    "We may update these Terms of Service from time to time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of any changes.",
  ],
  [
    "11. Contact Us",
    "If you have any questions about these Terms of Service, please contact oasisccchwc@gmail.com.",
  ],
];

export default function TermsPage() {
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
        <h1 style={{ fontSize: 22 }}>Terms of Service</h1>
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

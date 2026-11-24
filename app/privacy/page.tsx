import Link from "next/link";

import CatIcon from "@/components/CatIcon";

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
        <h1 style={{ fontSize: 22 }}>私隱聲明</h1>
        <div className="body" style={{ maxWidth: "none" }}>
          <p>本聯署平台透過 Google 登入驗證身分，只限學校 Google 帳號。</p>
          <p>
            我哋會收集你 Google 帳號提供嘅姓名、電郵地址同頭像網址，用嚟記錄聯署同顯示登入狀態。
            公開聯署名單只會顯示你嘅姓名同簽名時間；電郵地址永遠唔會公開，只有管理員可以查閱。
          </p>
          <p>資料儲存喺 Supabase（PostgreSQL），網站由 Cloudflare 提供服務。</p>
          <p>如要刪除你嘅聯署同個人資料，請聯絡管理員。</p>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";

import CatIcon from "@/components/CatIcon";

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
        <h1 style={{ fontSize: 22 }}>服務條款</h1>
        <div className="body" style={{ maxWidth: "none" }}>
          <p>使用本平台即表示你同意以下條款：</p>
          <p>每個學校 Google 帳號只可以簽署一次。你嘅姓名同簽名時間會公開顯示喺聯署名單上。</p>
          <p>請勿嘗試干擾平台運作或冒充他人簽署。管理員保留刪除不當簽名嘅權利。</p>
          <p>本條款如有更改，會喺本頁更新。</p>
        </div>
      </main>
    </div>
  );
}

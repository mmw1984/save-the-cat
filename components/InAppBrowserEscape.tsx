"use client";

import { useEffect, useState } from "react";

import { EiabEscapeDialog, useIsInAppBrowser } from "eiab/react";

export default function InAppBrowserEscape({
  children,
}: {
  children: React.ReactNode;
}) {
  const isInApp = useIsInAppBrowser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && isInApp === true ? (
        <EiabEscapeDialog
          title="喺瀏覽器開啟"
          description="為咗最佳嘅簽名體驗，請喺你嘅瀏覽器開返呢一頁。"
          action="喺瀏覽器開啟"
          copy="複製連結"
          copied="已複製！"
          dismiss="繼續用內置瀏覽器"
        />
      ) : null}
    </>
  );
}

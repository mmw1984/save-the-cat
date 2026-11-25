# AGENTS.md

## Commit message 格式（Commit message format）

所有 commit message 必須：

1. **標題（Subject）**：英文一句總結 + 括號中文翻譯，例如：
   `Fix issuing animation so the signal stays on the server (修復發送動畫，令訊號停留喺伺服器)`

2. **內文（Body）**：非常詳細，分兩節 — 先英文，後中文翻譯。每一節都要交代：
   - 背景 / 問題係咩（What was wrong / background）
   - 點解會發生（Root cause）
   - 做咗咩改動（What changed，逐個檔案）
   - 點樣驗證（How it was verified）

   英文節同中文節內容對應，方便唔同語言嘅人睇。

## 其他規則（Other rules）

- 唔好 commit secrets（secret keys、token、`.env` 內容）
- 一個 commit 只做一件事，改動要聚焦
- 未經明確要求，唔好 commit / push

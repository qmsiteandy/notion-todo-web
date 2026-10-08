# notion-todo-web

以 Notion 資料庫為後端的個人待辦網頁。Notion 只當資料庫，介面在這個網站上。

目前進度：第一階段（密碼登入、唯讀顯示任務與月計畫）。

## 設定

1. 在 Notion 建立 Internal Integration，把「🚀 任務資料庫」與「🌕 月計畫」兩個**原始資料庫**分享給它。
2. 產生登入密碼的雜湊值：`npm run hash-password -- '你的密碼'`
3. 複製 `.env.example` 為 `.env.local` 並填入 `NOTION_TOKEN`、`APP_PASSWORD_HASH`、`SESSION_SECRET`（`openssl rand -hex 32`）。
4. `npm install && npm run dev`

部署到 Vercel 時，上面這些值設在專案的 Environment Variables。這個 repo 是公開的，**密碼與 token 不可寫進程式碼或提交進 git**（`.env*` 已被忽略）。

## 指令

- `npm run dev` / `npm run build` / `npm start`
- `npm run typecheck`
- `npm test`

# notion-todo-web

以 Notion 資料庫為後端的個人待辦網頁。Notion 只當資料庫，介面在這個網站上。

目前進度：第二階段。頁面有：

- **今天**：今天與逾期的任務，一鍵「移到今天」，點圓圈完成、點狀態切換，手機上往右滑完成。
- **規劃**：週曆，把還沒排日期的任務拖到某一天（手機改用選日期）。
- **全部任務**：依狀態分三欄，可用標籤與月計畫篩選。
- **月計畫**：點開看底下的任務、新增小任務、新增月計畫。

## 設定

1. 在 Notion 建立 Internal Integration，把「🚀 任務資料庫」與「🌕 月計畫」兩個**原始資料庫**分享給它。
2. 產生登入密碼的雜湊值：`npm run hash-password -- '你的密碼'`
3. 複製 `.env.example` 為 `.env.local` 並填入 `NOTION_TOKEN`、`APP_PASSWORD_HASH`、`SESSION_SECRET`（`openssl rand -hex 32`）。
4. `npm install && npm run dev`

部署到 Vercel 時，上面這些值設在專案的 Environment Variables。這個 repo 是公開的，**密碼與 token 不可寫進程式碼或提交進 git**（`.env*` 已被忽略）。

## 不連 Notion 試用

設定 `NOTION_MOCK=1` 會改用記憶體裡的範例資料（重開就重置），方便本機試介面。正式環境不要設。

## 指令

- `npm run dev` / `npm run build` / `npm start`
- `npm run typecheck`
- `npm test`

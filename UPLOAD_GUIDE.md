# GitHub 上傳說明

1. 解壓縮 ZIP。
2. 打開你們的 GitHub 專案，選 Code → Add file → Upload files。
3. 上傳解壓縮後的所有檔案，放在專案最外層，和既有 README.md 同一層。不要上傳 ZIP，也不要多包一層資料夾。
4. 確認首頁檔名完全是 index.html，再按 Commit changes。
5. 若 Pages 已設定從 main 分支的 / (root) 發布，等待部署完成後重新開啟原網站。若未設定，至 Settings → Pages → Deploy from a branch → main → / (root) → Save。
6. 開啟網站，確認 Logo、背景正常。按「聯絡督導」確認手機撥號畫面的電話；不需要實際撥出。未設定督導時，應顯示 02-8660-5972。
7. 首頁右上角「設定」可儲存這台裝置的督導電話；清空後儲存，回復機構總機。

## 本版調整
- Logo、圖示程式、背景圖片全放在同一專案，以相對路徑載入，不再依賴 chatgpt.site。
- 未設定督導時，聯絡按鈕預設撥打機構總機 02-8660-5972。
- 保留事件標題、搜尋別名及現有版面。
- 另一支總機為 02-2922-6100；若機構決定改用此號碼，請同步修改 app.js 的 AGENCY_PHONE_NUMBER 與 index.html 的預設 tel 連結、電話說明。
- 本說明不會取代你們既有的 README.md。

# CalenDai 開発ログ

**最終更新日：2026-05-27**

---

## 2026-05-27 作業記録

### 成果
- **AndroidPINリセット問題：解決**
- **LockScreen「PINを忘れた場合」ボタン：実装完了**
- **PIN設定後のUX改善：完了**
- **LoginScreen文言修正：完了**
- VPS版・Android実機版ビルド・動作確認完了

### 今日判明した重要な問題と解決

#### ① LoginScreen.jsxがv0.8.1コミット時点でLockScreenのコードになっていた
- **原因**：昨日（5/26）「Ctrl+A→貼り付け」でLoginScreen.jsxにLockScreenのコードを誤って上書きし、そのままv0.8.1としてコミットしていた
- **発見方法**：「ファイルを変更してビルドしても表示が変わらない」という現象から発覚
- **解決**：v0.8.0（afa1168）から正しいLoginScreen.jsxを復元
  ```powershell
  git show afa1168:src/components/LoginScreen.jsx > src/components/LoginScreen.jsx
  ```
- **教訓**：git restoreが効かない場合、そのコミット自体に誤ったコードが含まれている可能性がある。古いコミットからgit showで取得する

#### ② Service Workerが古いキャッシュを返していた
- devサーバー再起動・ハードリロードで解消
- DevTools → Application → Clear site dataも有効

### 実装内容

#### LockScreen「PINを忘れた場合」ボタン
- LockScreen.jsxに「PINを忘れた場合」ボタンを追加
- App.jsxのLockScreenにonResetプロップを渡す
- onReset：myd_pin・myd_settings・myd_userをlocalStorageから削除、Reactステートをリセット→ログイン画面へ遷移
- **AndroidPINリセット問題のコードによる解決策として採用**

#### PIN設定後のUX改善
- 設定後に即PINロック画面に遷移していた → トースト表示「🔒 PINコードを有効にしました」に変更
- トーストは縦横センター表示（`top: '50%', transform: 'translate(-50%, -50%)'`）

#### LoginScreen.jsx チェックボックス文言修正
- 「に同意して〜」から始まっていた文章を修正
- 「プライバシーポリシー」と「利用規約」のリンクをチェックボックス文章内に統合

---

## 2026-05-26 作業記録

### 発生したトラブルと原因

#### ① Manifest変更でアプリが真っ白になった（Claudeのミス）
- **原因**：`android:allowBackup="false"` と `android:fullBackupContent` / `android:dataExtractionRules` を同時指定したことで矛盾が生じた
- **教訓**：`allowBackup="false"` の場合、`fullBackupContent` / `dataExtractionRules` は不要・むしろ競合する
- **復旧手順**：
  1. AndroidManifest.xmlから問題の2行を削除
  2. 作成したbackup_rules.xml・data_extraction_rules.xmlを削除
  3. `npm run build:android` → `npx cap sync` → Android Studio Assemble → Run

#### ② アプリが真っ白のまま直らなかった原因
- `git restore src/App.jsx` でソースを戻したが、**`npm run build:android` を実行していなかった**
- dist/フォルダが古い（壊れた）ビルドのままAndroidに転送されていた
- **教訓**：`git restore` 後は必ず `npm run build:android` → `npx cap sync` を実行すること

#### ③ LoginScreen.jsxにLockScreen.jsxの内容を誤って上書き
- 「Ctrl+A → 貼り付け」の指示でファイルを間違えた
- **復旧**：`git restore src/components/LoginScreen.jsx`（ただし後日コミット自体に誤りが判明）

#### ④ LockScreen.jsxの修正が毎回元に戻る問題
- VS CodeでLockScreen.jsxを開いたままにしていたため、Claudeが直接書き込んだ内容をVS Codeが上書きした
- **教訓**：Claudeが直接ファイルを書き込む前はVS Codeでそのファイルを閉じておくこと

---

## 明日のタスク（優先順）

### 1. PINコード変更時のトースト表示
- PINが設定済みの状態でPINコードを変更した場合
- 「PINコードを変更しました」トーストを表示する
- 現状は「PINコードを有効にしました」と同じトーストが出てしまう

### 2. PinSetupScreenのキャンセルボタン改善
- 現状：キャンセルボタンの文字が改行されて縦長になることがある（画像参照）
- 修正：キャンセルボタンを数字ボタンとは独立した行に配置する

### 3. PINロック無効化時のクリア処理
- 設定画面でPINロックのチェックを外したとき
  - 「PINコードをクリアしました」または「PINコードを無効にしました」トーストを表示
  - localStorage の myd_pin を削除する
- 現状：チェックを外しても myd_pin が残り、再チェックすると前のPINが復活してしまう

### 4. サイレント再ログイン実装
- トークン期限切れ時に自動で再認証する
- Web版：useGoogleLogin の自動更新を活用
- Android版：GoogleAuth.refresh() を呼ぶ

---

## 現在の状態

### ファイルの状態（正常）
- `src/App.jsx`：PIN関連修正済み（onReset・pinSetupSuccessトースト）
- `src/components/LockScreen.jsx`：「PINを忘れた場合」ボタン実装済み
- `src/components/LoginScreen.jsx`：v0.8.0から復元・文言修正済み
- `android/app/src/main/AndroidManifest.xml`：`allowBackup="false"`のみ（正常）

### 注意：v0.8.1コミットの状態
- v0.8.1（189aaec）のコミットにはLoginScreen.jsxの誤ったコードが含まれている
- 本日の修正内容はまだコミットしていない
- 明日のタスク完了後にまとめてコミット・v0.8.2としてリリース予定

---

## 重要な運用メモ

| 操作 | コマンド |
|------|---------|
| Androidビルド | `npm run build:android` → `npx cap sync` → Android Studio ▶ Run |
| VPSビルド・転送 | `npm run build` → `scp -r dist debian@suneight-okayama.jp:/home/debian/` → SSH後 `sudo cp -r ~/dist/* /var/www/html/calendai/` |
| ローカル確認 | `npm run dev` → `http://localhost:5173/calendai/` |
| git restore後は必ず | `npm run build:android` を忘れずに |
| Gradleクリーン | Android Studio: Build > Clean Project → Assemble Project |

### ビルドトラブル時の切り分け手順
1. `npm run dev` でWeb版が動くか確認（動く→Android側の問題）
2. `npm run build:android` でビルドエラーがないか確認
3. `npx cap sync` を実行したか確認
4. Android Studio: Build > Clean Project → Assemble Project → Run
5. それでもダメ→ File > Invalidate Caches > Invalidate and Restart

### Claudeが直接ファイルを書き込む際のルール
- 書き込み前に必ず声をかける
- VS Codeで対象ファイルを閉じてから書き込む
- 書き込み後はVS Codeで開いて内容を確認する

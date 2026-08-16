# CLAUDE.md - CalenDai Project Guidelines

**CalenDai（かれんだい）** は、Googleカレンダーのデータを活用して同じ月日の過去の予定を
複数年並べて閲覧できる、連用日記（3年日記・5年日記）アプリです。
Google Play向けAndroid版（Capacitor）とWeb版（さくらVPS）の両方を提供します。

開発者ブランドは **Kamneko Labo（かむねこラボ）**。
コアコンセプト：「あなたのGoogleカレンダーは、もう5年日記でした。」

---

## 作業フロー（重要・必ず守る）

このプロジェクトは以下の分担で進行します。

1. 統括のClaude（別チャット・あつのりさんと直接対話する担当）が設計・指示をまとめ、
   Claude Code用のプロンプトを作成する
2. **Claude Code（あなた）は、指示を受けたら実装方針を簡潔に提示し、承認を得てから実装する**
3. 実装後は動作確認の上、コミット・プッシュまでをClaude Code側で行う
4. 進捗ドキュメント（`_local/CalenDai_Dev_note.md` および
   `D:\Data\10_Projects\dev\開発状況サマリー.md`）の更新は統括のClaude側が行う。
   **Claude Codeはこれらのドキュメントを編集しない**

**指示を受けたら即座にコードを書き始めないこと。**
不明点・矛盾・より良い代案があれば、実装前に必ず指摘してください。

**指示と実装が食い違うときは、回避策を実装せず、手を止めて報告すること。**
指示どおりに実装できない事情（既存コードとの衝突・技術的制約・仕様の矛盾など）が
判明した場合、独断で迂回策を書かずに、何がどう食い違っているかを報告して指示を仰ぐこと。

応答は**日本語**で行ってください。

---
## Environment

- OS: Windows 11 + VS Code
- プロジェクトルート: `D:\Data\10_Projects\dev\calendai`（2026-08-02にフォルダ管理方針変更により
  `D:\Data\10_Projects\calendai` から移動）
- `_local/` はGit管理対象外（開発ログ・引き継ぎメモ置き場）
- ローカル確認: `npm run dev` → `http://localhost:5173/calendai/`
- Web本番: `https://kamneko.com/calendai/`

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フロントエンド | React + Vite |
| 認証（Web版） | Google OAuth 2.0（@react-oauth/google） |
| 認証（Android版） | @codetrix-studio/capacitor-google-auth（--legacy-peer-deps） |
| データ取得・保存 | Google Calendar API（読み取り＋書き込み） |
| モバイル化 | Capacitor 8.3.4 |
| スタイリング | インラインスタイル（CSS-in-JS） |
| UIアイコン | Lucide React |
| デプロイ先（本番Web） | さくらVPS（Debian・Nginx・SSL） |
| バージョン管理 | Git + GitHub（`kamneko88/calendai`・パブリック） |

- データ保存に独自サーバーは使わない。日記エントリ・記念日はすべてGoogleカレンダーの終日イベントとして保存する
- アプリ設定・PIN・isPremiumフラグはlocalStorageのみで管理する

---
## Google Play / ビルドに関する厳格なルール

### AABビルド手順（順番厳守）

```
1. google-services.json を更新（変更がある場合）
2. npm run build:android
3. npx cap sync
4. versionCode（android/app/build.gradle）と APP_VERSION（src/constants.js）を更新
5. Android Studioで「Generate Signed App Bundle or APK」→ AABを選択
   → **calendai-upload-key2.jks**（alias: calendai-key2）を指定 → release選択 → Create
   ※旧`calendai-release.jks`は2026-07-31の漏洩インシデントで失効済み。使用禁止
   ※パスワードはKeePassの「CalenDai - Androidアップロード鍵」エントリに保管
   ※「Generate Bundles」は未署名のため使用禁止
6. エミュレーターまたは実機でバージョン表示を確認
7. Play ConsoleにAABをアップロード
```

- `git restore` 後は必ず `npm run build:android` → `npx cap sync` を実行し直すこと
  （distフォルダが古いままだと真っ白画面や古いバージョン表示の原因になる）
- 署名鍵（`*.jks` / `*.keystore`）・`.env`・`.env.*`・`_local/` は絶対にコミットしない
  （`.gitignore`で除外済み。2026-07-31に`calendai-release.jks`を公開リポジトリへ混入させた前例あり）
- versionCodeは毎回のビルドで必ずインクリメントする

### バージョン管理ルール

| 種別 | 上げ方 |
|------|--------|
| 機能追加 | 0.X.0 |
| バグ修正 | 0.0.X |
| リリース | 1.0.0 |

---
## 実機で踏んだ落とし穴（必読）

- **Xiaomi独自バックアップ問題**：Xiaomi端末はlocalStorage（`myd_pin`・`myd_settings`）を独自にバックアップ・復元するため、アンインストール後の再インストールでも前のPIN設定等が復元されてしまうことがある
- **Play App Signing**：GoogleがAABを再署名するため、Play Store経由インストール時のSHA-1はGoogleが管理するものになる。Googleログイン連携にはデバッグ用・リリース用・Play App Signing用の3種のSHA-1をFirebase等に登録する必要がある場合がある
- **AndroidのOAuthはAndroid用Google Cloudプロジェクト（calendai-android）が個別に管理する**。Web版プロジェクト（multi-year-diary）だけ設定してもAndroid版のログインには反映されない
- **IPアドレスが同じテスターはPlay Console上で1人としてカウントされる可能性がある**（クローズドテストのテスター評価に影響）
- Play Consoleの統計情報（インストール数・デバイス初回起動数）には、Google側の既知の不具合で正しく表示されないことがある

---

## コーディング規約

- マジックナンバーを避け、意味を持つ数値は`constants.js`等に定義する
- ネットワーク処理（ログイン・API呼び出し）は必ず`try/catch/finally`で保護し、
  失敗時に画面が固まったままにならないようにする（v0.10.15で実際に発生したバグ）
- 未使用になったコンポーネント・importは放置せず、気づいた時点で整理する

---

## 現在の状態（2026-08-11時点）

- バージョン：**v1.0.1（versionCode 17）がGoogle Playで公開中**（2026-08-11審査通過・自動公開）
- 2026-08-10にドメインを`suneight-okayama.jp/kamneko/calendai/` →
  **`kamneko.com/calendai/`** へ移行。公開メールも`support@kamneko.com`へ変更
- ストアに表示される連絡先は**アプリ単位（ストアの設定）とアカウント単位（デベロッパーの
  メールアドレス）の2系統**あり、両方を更新しないと古い情報が残る（2026-08-11に対応済み）
- `node_modules/`のGit追跡（4,270件）を解除済み（2026-08-11・b5f49f4）
- 積み残し：Play Console推奨事項3件（エッジツーエッジ表示・非推奨API・R8）の実機目視確認
- 詳細な作業履歴・引き継ぎ事項は `_local/CalenDai_Dev_note.md` を参照

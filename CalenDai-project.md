# CalenDai プロジェクト記録

**更新日：2026-05-23**　※更新したら必ずここの日付を変えること  
**プロジェクトオーナー：あつのり**

---

## 概要

物理の「3年日記・5年日記」をデジタルで再現するWebアプリ。  
Googleカレンダーのデータを活用して、同じ月日の過去のスケジュールを複数年並べて比較・閲覧できる。

**コアコンセプト：「あなたのGoogleカレンダーは、もう5年日記です。」**

---

## アプリ名（正式決定）

| 項目 | 内容 |
|------|------|
| 日本語名 | かれんだい |
| 英語名 | CalenDai |
| 詳細表記 | Calendar Diary |
| GitHubリポジトリ | https://github.com/cyabose/calendai |
| アプリID（パッケージ名） | jp.kamneko88.calendai |

---

## プラン名称（確定）

| プラン | 表示名 | 内容 |
|--------|--------|------|
| 無料版 | バッジなし | Googleカレンダー閲覧・3年/5年表示 |
| 有料版 | **NIKKI** | 日記入力・フォント・バナー等の書く機能 |

**棲み分けの軸：「見る」（無料）vs「書く・貯める」（NIKKI）**

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フロントエンド | React + Vite |
| 認証（Web版） | Google OAuth 2.0（@react-oauth/google） |
| 認証（Android版） | @codetrix-studio/capacitor-google-auth（--legacy-peer-deps） |
| データ取得・保存 | Google Calendar API（読み取り＋書き込み） |
| OAuthスコープ | `calendar`・`profile`・`email` |
| スタイリング | インラインスタイル（CSS-in-JS） |
| UIアイコン | Lucide React |
| モバイル化 | Capacitor 8.3.4 |
| デプロイ先（開発） | localhost:5173/calendai/ |
| デプロイ先（本番） | さくらVPS（Debian・Nginx・SSL） |
| 外部アクセス（本番） | https://suneight-okayama.jp/calendai/ |
| 開発環境 | Windows 11 + VS Code + Node.js v24 |
| バージョン管理 | Git + GitHub（プライベートリポジトリ） |

---

## アクセス方法

| 環境 | URL |
|------|-----|
| 開発（ローカル） | `http://localhost:5173/calendai/` |
| **テスト・本番** | `https://suneight-okayama.jp/calendai/` |
| **プライバシーポリシー** | `https://suneight-okayama.jp/privacy/calendai/` |
| **利用規約** | `https://suneight-okayama.jp/terms/calendai/` |

---

## ブランドカラー（確定）

| 用途 | カラー | 備考 |
|------|--------|------|
| **ブランドカラー（メイン）** | **#9e6b50** | スプラッシュ・ログイン画面背景・アイコン背景 |
| アプリ背景 | #f0e8d8 | コンテンツエリア |
| テラコッタ（アクセント） | #c8956a | ハイライト |
| クリーム（ページ） | #fdfaf5 | カードエリア |

---

## プラン設計

### 機能比較

| 機能 | 無料版 | NIKKI版 |
|------|--------|---------|
| 表示年数 | 3年・5年選択可 | 3年・5年選択可 |
| 同時表示日数 | 1・2日 | 1・2日 |
| カレンダー数 | 2つまで | 5つ＋日記枠 |
| 日記入力・編集 | なし | あり |
| フォント選択 | なし | あり |
| 「今日の○年前」バナー | なし | あり |
| 検索機能 | なし | あり（v1.1以降） |

**記念日カレンダー表示**：無料・NIKKI版ともに利用可能

### 価格方針（確定）
- **無料版**：無料
- **NIKKI版**：約250円・買い切り・永続利用

---

## データ保存設計

**独自サーバーなし。Googleアカウント1つで完結。**

| データ種別 | 保存先 | 方法 |
|-----------|--------|------|
| 日記エントリ | Googleカレンダー | 終日イベント |
| Anniversary | Googleカレンダー（記念日専用） | 毎年繰り返し終日イベント |
| アプリ設定 | Google Drive（隠しフォルダ・JSON） | drive.appdataスコープ |
| PINロック | localStorage | — |
| isPremium | localStorage（テスト用）→ Google Play課金API（リリース時） | — |
| 記念日カレンダー設定 | localStorage（myd_anniversary_cal） | — |
| 今日の○年前バナーフラグ | localStorage（myd_banner_shown） | 日付文字列・1日1回制御 |

---

## 実装済み機能

### コード構成
```
src/
├── App.jsx
├── constants.js         （APP_VERSION等）
├── api.js
├── hooks.js
└── components/
    ├── SplashScreen.jsx
    ├── LockScreen.jsx
    ├── PinSetupScreen.jsx
    ├── WelcomeScreen.jsx
    ├── LoginScreen.jsx
    ├── EventModal.jsx
    ├── SettingsPanel.jsx
    ├── DayPage.jsx
    ├── AnniversaryTab.jsx
    ├── DiaryModal.jsx
    └── TodayInPastBanner.jsx
```

### 主要機能一覧
- スプラッシュ画面（1.5秒・#9e6b50背景・web版のみ）
- ログイン画面（リデザイン・PP＋利用規約同意チェック付き）
- 連用日記スタイルの見開きレイアウト（3年/5年・1日/2日切替）
- ヘッダー2行レイアウト（モバイル：タイトル行＋ナビ行）
- 「○○さんのCalenDai」タイトル（太字）
- NIKKIバッジ（有料ユーザーのみ）
- 日付ヘッダー3列レイアウト
- 日付ナビゲーション・ジャンプ・スワイプ移動
- Anniversary一覧タブ
- 日記入力・編集機能（NIKKI限定）
- フォント選択（NIKKI限定）
- テーマ切り替え（5種類）
- 設定パネル
- PINロック機能
- 「今日の○年前」バナー（NIKKI限定）
- Lucide Reactアイコン
- バージョン管理（constants.jsのAPP_VERSION）
- ファビコン・アプリアイコン（#9e6b50背景・全サイズ）
- DEVメニュー（FREE/NIKKI切替・初期化ボタン）
- デフォルト表示年数：5年
- ウェルカム画面：「○○年から始まったあなたのカレンダーをかれんだいで表示します」
- Android Google Sign-In（@codetrix-studio/capacitor-google-auth）✅

### バージョン管理ルール
| 種別 | 上げ方 | 例 |
|------|--------|-----|
| 機能追加 | `0.X.0` | — |
| バグ修正 | `0.0.X` | — |
| リリース | `1.0.0` | Google Play申請時 |

現在のバージョン：**v0.7.1**

---

## Capacitor Android実装状況

### セットアップ済み
- `capacitor.config.json`（appId: jp.kamneko88.calendai）
- `android/` フォルダ生成済み
- `@codetrix-studio/capacitor-google-auth` インストール済み（--legacy-peer-deps）
- `AndroidManifest.xml` にDeepLink intent-filter追加済み
- `android/app/build.gradle` に manifestPlaceholders 追加済み
- `android/app/google-services.json` 配置済み（client_type:1 含む）
- `android/app/src/main/res/values/strings.xml` に server_client_id 追加済み
- `vite.config.js` にAndroid用ビルドモード追加（base: '/'）
- `package.json` に `build:android` スクリプト追加
- アプリアイコン設定済み（全mipmapサイズ・#9e6b50背景）

### Androidビルドコマンド
```powershell
npm run build:android
npx cap sync
# Android Studioで▶実行
```

### Google Cloud / Firebase 構成（確定）

| プロジェクト | 用途 |
|------------|------|
| multi-year-diary | CalenDai WebアプリのOAuth |
| CalenDai Android（calendai-android） | Firebase・Android用 |

**重要：2つは別プロジェクト。Androidは calendai-android を使用。**

#### 各クライアントID
| 種別 | クライアントID |
|------|--------------|
| Webクライアント（multi-year-diary） | 58255900917-v1t4s31s88697d0mbnderg6bdc5qghi0.apps.googleusercontent.com |
| Webクライアント（Firebase/calendai-android） | 690550080789-5k4483a7a5phqvu72q2iv1jtk8e9qe00.apps.googleusercontent.com |
| Androidクライアント（calendai-android） | ✅ 作成済み（SHA-1登録済み） |

#### デバッグSHA-1
```
00:ED:7D:C9:1C:41:36:16:71:79:04:95:EA:AE:72:F3:ED:63:A2:81
```

#### calendai-android OAuth設定
- 公開ステータス：**テスト中**
- テストユーザー：あつのり・妻のアカウント 登録済み
- Google Calendar API：**有効化済み**
- loginNativeのスコープ：`['profile', 'email', 'https://www.googleapis.com/auth/calendar']`

#### 解決済みエラー履歴
| エラー | 原因 | 対処 |
|--------|------|------|
| code:10 | google-services.jsonなし | Firebase作成→配置 |
| code:10 | oauth_client空 | SHA-1登録・Google Sign-In有効化 |
| code:12500 | client_type:1なし | Android OAuthクライアント手動作成→json再ダウンロード |
| 0年・カレンダーなし | calendarスコープ未指定 | scopesに追加 |
| 0年・カレンダーなし | Google Calendar API無効 | calendai-androidプロジェクトで有効化 |

---

## 開発ロードマップ

### 【フェーズ1：リリース準備】

| タスク | 状態 |
|--------|------|
| さくらVPS・Nginx・SSL | ✅ 完了 |
| ドメイン取得・DNS | ✅ 完了 |
| VPSセキュリティ設定 | ✅ 完了 |
| プライバシーポリシーページ公開 | ✅ 完了 |
| 利用規約ページ公開 | ✅ 完了 |
| さくらメール・Gmail転送・DKIM/SPF | ✅ 完了 |
| Google Search Console認証 | ✅ 完了 |
| Google Auth Platformブランディング設定 | ✅ 完了 |
| OAuth本番用クライアント作成（HTTPS専用） | ✅ 完了 |
| アプリ本番公開 | ✅ 完了 |
| ブランディング検証申請 | ✅ 申請済み（審査待ち） |
| 「今日の○年前」バナー実装 | ✅ 完了 |
| テスト環境VPS移行 | ✅ 完了 |
| Lucide ReactによるUIアイコン整備 | ✅ 完了 |
| アプリアイコン作成（#9e6b50・全サイズ） | ✅ 完了 |
| ファビコン設定・サイトタイトル変更 | ✅ 完了 |
| バージョン管理整備（constants.js） | ✅ 完了 |
| スプラッシュ画面実装 | ✅ 完了 |
| ログイン画面リデザイン（同意チェック付き） | ✅ 完了 |
| ログイン画面チェックボックス間隔改善 | ✅ 完了 |
| Capacitor初期セットアップ | ✅ 完了 |
| Android Google Sign-In実装 | ✅ 完了（2026-05-23） |
| Androidアプリアイコン設定 | ✅ 完了（2026-05-23） |
| PWA対応 | ⬜ 今後 |
| Google Play Developer登録（$25） | ⬜ Capacitor完了後 |

### 残りスケジュール（〜6/1）

| 日程 | 作業 |
|------|------|
| 5/24〜25 | 実機テスト・バグ修正 |
| 5/26〜27 | 妻のスマホでのテスト |
| 5/28 | 「今日の○年前」アニバーサリー表示 |
| 5/29〜30 | Google Play登録・ストア情報入力 |
| 5/31〜6/1 | 最終確認・申請 |

**難航時の代替案：** 6/1にWeb版（PWA）として申請、Android版は6月中旬以降

---

## 次回以降の実装予定

| タスク | 優先度 | 内容 |
|--------|--------|------|
| ウェルカム画面チラ見え修正 | 🔴 最優先 | ログイン後、ウェルカム画面表示前に一瞬メイン画面が映る問題の修正 |
| Google Play Developer登録 | 🔴 高 | $25・Capacitor完了後 |
| PWA対応 | 🟡 中 | manifest.json・Service Worker |
| 「今日の○年前」アニバーサリー表示 | 🟡 中 | 繰り返しイベントの扱い要検討 |
| 生体認証 | 🟡 中 | Capacitor化完了時に実装 |
| OSS使用許諾表示 | 🟢 低 | v1.1以降でAboutページに記載 |

---

## インフラ構成

### さくらVPS
- **IP**：49.212.132.237 / **OS**：Debian 12
- **月額**：671円（年払い）

### Nginx構成（VPS）
- `/` → トップページ
- `/calendai/` → CalenDaiアプリ
- `/privacy/calendai/` → プライバシーポリシー
- `/terms/calendai/` → 利用規約

### ドメイン・メール
- **ドメイン**：suneight-okayama.jp（お名前.com）
- **SSL**：Let's Encrypt（自動更新）
- **メール**：さくらのメールボックス（88円/月）
  - `contact38@suneight-okayama.jp`・`calendai@suneight-okayama.jp`
  - 転送先：cyabose@gmail.com

---

## 公開URL

| ページ | URL |
|--------|-----|
| トップページ | `https://suneight-okayama.jp` |
| **CalenDaiアプリ** | `https://suneight-okayama.jp/calendai/` |
| プライバシーポリシー | `https://suneight-okayama.jp/privacy/calendai/` |
| 利用規約 | `https://suneight-okayama.jp/terms/calendai/` |

---

## Google Cloud Console設定

| 項目 | 設定値 |
|------|--------|
| プロジェクト名 | multi-year-diary |
| OAuthアプリ名 | CalenDai |
| OAuthスコープ | calendar・profile・email |
| 公開ステータス | **本番環境**（ブランディング審査中） |

### OAuthクライアント（multi-year-diary）
| クライアント名 | 用途 | 承認済み生成元 |
|--------------|------|--------------|
| CalenDai 本番用 | 開発・本番共通 | `http://localhost:5173`・`https://suneight-okayama.jp` |

### 環境変数
- `.env.development`・`.env.production` ともに CalenDai本番用クライアントID
- `main.jsx` で `import.meta.env.VITE_GOOGLE_CLIENT_ID` として参照

---

## デプロイ構成

```powershell
# Web版
npm run build
scp -r dist debian@suneight-okayama.jp:/home/debian/
# VPS: sudo cp -r ~/dist/* /var/www/html/calendai/

# Android版
npm run build:android
npx cap sync
# Android Studioで▶実行
```

### GitHubへのpush手順
```powershell
git add .
git commit -m "変更内容の説明"
git pull --rebase
git push
```

---

## 設計上の判断・メモ

- **Capacitor採用方針**：React Nativeより今のコードを流用できるCapacitorでアプリ化
- **Capacitorの難所**：`@react-oauth/google`はWebView非対応→`@codetrix-studio/capacitor-google-auth`使用
- **vite base統一**：`base: mode === 'android' ? '/' : '/calendai/'`で分岐
- **ブランドカラー確定**：#9e6b50をスプラッシュ・ログイン・アイコン背景に統一
- **NIKKI命名理由**：CalenDaiにすでにDiaryの意味が含まれるため、有料プランのバッジ名として採用
- **年数設計**：FREE/NIKKI両方3年・5年選択可能。差別化は「書ける機能」
- **誕生日カレンダー**：calendarList APIに返ってこない特殊カレンダー→v1.1以降
- **サブスクなし・買い切り一択**：約250円で信頼を積む方針
- **生体認証**：Capacitor化完了時に`@capacitor-community/biometric-auth`で実装予定
- **web版とアプリ版の分岐**：`Capacitor.isNativePlatform()`でOAuth処理を分岐
- **Androidアイコン生成**：`@capacitor/assets`では自動生成されず。Pillowで手動リサイズして各mipmapに配置

---

## 検討・確認が必要な事項

| 項目 | 状態 | 内容 |
|------|------|------|
| ウェルカム画面チラ見え | 🔴 要修正 | ログイン後にメイン画面が0.3〜0.5秒チラ見えしてからウェルカム画面が表示される |
| 初回利用規約同意画面 | ✅ 実装済み | ログイン画面のチェックボックスで対応 |
| OSS使用許諾表示 | 🟢 低優先 | v1.1以降でAboutページに記載 |
| ストア申請前のウイルスチェック | ✅ 不要 | Google PlayがAPK/AABを自動スキャン |
| 「今日の○年前」アニバーサリー表示 | 🟡 要実装 | 繰り返しイベントの扱いを検討中 |
| suneight-okayama.jpトップページ | 🟢 低優先 | 本格的なページは将来対応 |
| calendai-android OAuthブランディング | 🟡 後回し | テストモードのまま進める。リリース時に本番化・審査申請 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-05-01 | プロジェクト開始・React + Vite環境構築・Google OAuth連携 |
| 2026-05-10〜19 | 各種機能実装（Anniversary・日記・設定・PINロック等） |
| 2026-05-19 | 価格方針確定・さくらVPS方針確定・ロードマップ策定 |
| 2026-05-20 | さくらVPS契約・Nginx・SSL・ドメイン・メール・PP完了 |
| 2026-05-21 | 今日の○年前バナー・Lucide React・VPS移行・アイコン完成・v0.5.0 |
| 2026-05-22 | FREE/NIKKI年数設計変更・タイトル変更・NIKKIバッジ・スプラッシュ画面 |
| 2026-05-22 | ログイン画面リデザイン・ブランドカラー確定・利用規約作成 |
| 2026-05-22 | OAuth本番クライアント作成・アプリ本番公開・ブランディング審査申請・v0.6.1 |
| 2026-05-23 | ヘッダー2行化・デフォルト5年・NIKKI表記統一・ウェルカム画面修正・v0.7.0 |
| 2026-05-23 | Android Google Sign-In解決（client_type:1追加・calendarスコープ追加・Calendar API有効化） |
| 2026-05-23 | ログイン画面チェックボックス間隔改善・Androidアプリアイコン設定・v0.7.1 |

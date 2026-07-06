# CalenDai（かれんだい）

**「去年の今日」が見える連用日記アプリ。Googleカレンダーがそのまま5年日記になります。**

> あなたのGoogleカレンダーは、もう5年日記でした。

[![Web App](https://img.shields.io/badge/Web-suneight--okayama.jp-9e6b50)](https://suneight-okayama.jp/kamneko/calendai/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-green)](https://suneight-okayama.jp/kamneko/)
[![Version](https://img.shields.io/badge/Version-v0.10.14-blue)](https://github.com/cyabose/calendai)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)](https://github.com/cyabose/calendai)

---

## 概要 / Overview

CalenDaiは、紙の「3年日記・5年日記」をデジタルで再現するAndroid＆Webアプリです。  
Googleカレンダーのデータをそのまま活用し、同じ日付の過去5年分の記録を縦に並べて表示します。

CalenDai is an Android & Web app that digitally recreates the experience of a physical "3-year / 5-year diary."  
It uses your existing Google Calendar data to display up to 5 years of the same date side by side.

**スケジュール確認アプリではありません。「振り返り・記録・記念日」に特化した連用日記アプリです。**

---

## スクリーンショット / Screenshots

| 5年表示（2日） | 日記入力 | 記念日一覧 | テーマ切り替え |
|:---:|:---:|:---:|:---:|
| 5-year 2-day view | Diary input | Anniversary list | Theme settings |

---

## 主な機能 / Features

- 📅 **連用日記レイアウト** — 同じ日付の過去5年分（または3年分）を縦に並べて表示
- ✏️ **日記入力** — Googleカレンダーに日記を書き込み・保存（データはGoogleカレンダーに保存）
- 🎉 **記念日管理** — 記念日専用カレンダーと連携し、何周年かを自動計算して表示
- 🔔 **今日の○年前バナー** — 初回起動時に「今日という日の積み重ね」を表示
- 🎨 **テーマ切り替え** — クラシック・ナイト・オーシャン・サクラ・モノクロームの5種類
- 🔒 **PINロック** — アプリにPINロックを設定可能
- ↺ **再読み込みボタン** — ネットワーク再接続後にキャッシュをクリアして再取得
- 📱 **横画面対応** — タブレット横向き含む全画面でスワイプナビゲーション対応
- 🌐 **PWA対応** — ブラウザからホーム画面に追加可能（iOS Safari対応）

---

## 技術スタック / Tech Stack

| カテゴリ | 技術 |
|---------|------|
| Frontend | React + Vite |
| Mobile | Capacitor 8.3.4 |
| Auth (Web) | Google OAuth 2.0 (@react-oauth/google) |
| Auth (Android) | @codetrix-studio/capacitor-google-auth |
| Data | Google Calendar API (read/write) |
| Styling | Inline styles (CSS-in-JS) |
| Icons | Lucide React |
| Hosting | さくらVPS (Debian + Nginx + SSL) |
| CI/CD | Git + GitHub |

---

## アーキテクチャ / Architecture

```
src/
├── App.jsx              # メインコンポーネント・状態管理
├── constants.js         # 定数・バージョン管理
├── api.js               # Google Calendar API呼び出し
├── hooks.js             # カスタムフック（スワイプ等）
└── components/
    ├── DayPage.jsx      # 連用日記ページ（コア機能）
    ├── DiaryModal.jsx   # 日記入力モーダル
    ├── EventModal.jsx   # 予定詳細モーダル
    ├── AnniversaryTab.jsx # 記念日一覧
    ├── SettingsPanel.jsx  # 設定パネル
    ├── LockScreen.jsx   # PINロック画面
    └── ...
```

**データフロー：**
```
Google Calendar API
    ↓ OAuth 2.0認証
App.jsx（月単位キャッシュ管理）
    ↓ props
DayPage.jsx × dayCount（1日 or 2日）
    ↓ yearCount年分
各年の予定・日記を縦に表示
```

---

## 開発のポイント / Technical Highlights

- **月単位イベントキャッシュ** — APIコールを最小化し、ナビゲーションを高速化
- **年またぎ表示** — 2日表示で12/31と1/1が並ぶ場合、各ページが独立して年を基準に表示
- **日記即時反映** — 保存後にそのページの月キャッシュのみをクリアして即座に反映
- **Capacitor + React** — 既存のWebアプリをそのままAndroidアプリ化
- **テーマ全対応** — 全モーダル・設定画面を含む全画面でテーマカラーに対応

---

## セットアップ / Setup

### 必要なもの / Requirements

- Node.js v18以上
- Google Cloud Projectとカレンダー権限のOAuthクライアント
- （Android版）Android Studio

### インストール / Installation

```bash
git clone https://github.com/cyabose/calendai.git
cd calendai
npm install --legacy-peer-deps
```

### 環境変数 / Environment Variables

`.env.development`を作成し、以下を設定してください：

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 開発サーバー起動 / Development

```bash
npm run dev
# → http://localhost:5173/kamneko/calendai/
```

### ビルド / Build

```bash
# Web版
npm run build

# Android版
npm run build:android
npx cap sync
```

---

## リリース状況 / Release Status

| プラットフォーム | 状況 |
|----------------|------|
| Web版 | 🟢 公開中 |
| Android版（Google Play） | 🔄 審査中 |
| iOS版 | ❌ 予定なし |

**Web版：** https://suneight-okayama.jp/kamneko/calendai/

---

## ロードマップ / Roadmap

- [x] v0.10.x — React + Capacitor版（現行）
- [ ] v1.0.0 — Google Play正式公開
- [ ] v2.0.0 — Kotlin Native版（ネイティブUI・生体認証・プッシュ通知）

---

## 開発者 / Developer

**Kamneko Labo（かむねこラボ）**  
https://suneight-okayama.jp/kamneko/

---

## ライセンス / License

© 2026 Kamneko Labo. All Rights Reserved.

本リポジトリのコードは著作権で保護されています。  
無断での使用・改変・配布・販売を禁止します。

This repository is protected by copyright.  
Unauthorized use, modification, distribution, or sale is prohibited.

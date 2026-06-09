// ========================================
// バージョン履歴
// v0.1.0 (2026-05-16): 初期実装・ログイン画面・ウェルカム画面
// v0.5.0 (2026-05-21): 今日の○年前バナー・Lucide Reactアイコン・VPS移行・アプリアイコン
// v0.6.0 (2026-05-22): スプラッシュ画面・ログイン画面リデザイン・NIKKIバッジ・FREE年数開放
// v0.6.1 → 追記してv0.7.0に
// v0.7.0 (2026-05-23): ヘッダー2行化・デフォルト5年・NIKKI表記統一
// v0.8.0 土曜青色・ウェルカムチラ見え修正・PWA対応・アニバーサリーバナー
// v0.8.1 オーシャンテーマ追加・ナイトTODAYバッジ改善・Aboutページ
// v0.10.8 (2026-06-09): イベント月単位キャッシュ実装（表示高速化・ APIコール大幅削減）
export const APP_VERSION = '0.10.8';
export const MONTHS_EN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
export const WDS = ['日', '月', '火', '水', '木', '金', '土'];
export const CAL_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const THEMES = {
  classic: { name: 'クラシック', bg: '#f0ebe0', headerBg: '#fdfaf5', headerBorder: '#ddd', pageBg: '#fdfaf5', pageBorder: '#e0d8cc', pageHeaderBorder: '#333', currentRowBg: '#f5f0e8', rowBorder: '#e8e0d0', dateColor: '#222', weekendColor: '#C0392B', saturdayColor: '#1a6fb5', monthColor: '#999', currentYearColor: '#222', pastYearColor: '#888', subColor: '#aaa', emptyColor: '#ccc', eventColor: '#333', btnActiveBg: '#333', btnActiveColor: '#fff', btnBorder: '#ccc', btnColor: '#555', navColor: '#888', todayBadgeBg: '#333', todayBadgeColor: '#fff' },
  night: { name: 'ナイト', bg: '#0d0d1a', headerBg: '#1a1a2e', headerBorder: '#2a2a3a', pageBg: '#16213e', pageBorder: '#2a2a4a', pageHeaderBorder: '#444', currentRowBg: '#1e2a4a', rowBorder: '#2a3a5a', dateColor: '#ddd', weekendColor: '#e94560', saturdayColor: '#4d9de0', monthColor: '#888', currentYearColor: '#e94560', pastYearColor: '#777', subColor: '#666', emptyColor: '#444', eventColor: '#bbb', btnActiveBg: '#e94560', btnActiveColor: '#fff', btnBorder: '#444', btnColor: '#888', navColor: '#666', todayBadgeBg: '#888', todayBadgeColor: '#fff' },
  ocean: { name: 'オーシャン', bg: '#e8f5f8', headerBg: '#d0edf5', headerBorder: '#b0d8e0', pageBg: '#edf8fb', pageBorder: '#90ccd8', pageHeaderBorder: '#0e7490', currentRowBg: '#c8eaf0', rowBorder: '#a0d4de', dateColor: '#0a3d48', weekendColor: '#e05050', saturdayColor: '#1a6fb5', monthColor: '#1a8a9e', currentYearColor: '#0e7490', pastYearColor: '#4a9aaa', subColor: '#5aacba', emptyColor: '#90ccd8', eventColor: '#0a3d48', btnActiveBg: '#0e7490', btnActiveColor: '#fff', btnBorder: '#90ccd8', btnColor: '#1a8a9e', navColor: '#4a9aaa', todayBadgeBg: '#0e7490', todayBadgeColor: '#fff' },
  sakura: { name: 'サクラ', bg: '#f5e8ec', headerBg: '#fdf0f3', headerBorder: '#e8c8d0', pageBg: '#fef7f8', pageBorder: '#f0d0d8', pageHeaderBorder: '#c0607a', currentRowBg: '#fde8ec', rowBorder: '#f0d0d8', dateColor: '#6a3040', weekendColor: '#C0392B', saturdayColor: '#4472c4', monthColor: '#c0a0a8', currentYearColor: '#c0607a', pastYearColor: '#c0a0a8', subColor: '#d8b8c0', emptyColor: '#d8b8c0', eventColor: '#6a3040', btnActiveBg: '#c0607a', btnActiveColor: '#fff', btnBorder: '#e0b8c8', btnColor: '#a08090', navColor: '#b09090', todayBadgeBg: '#c0607a', todayBadgeColor: '#fff' },
  mono: { name: 'モノクローム', bg: '#f0f0f0', headerBg: '#ffffff', headerBorder: '#d0d0d0', pageBg: '#fafafa', pageBorder: '#ddd', pageHeaderBorder: '#333', currentRowBg: '#f0f0f0', rowBorder: '#e8e8e8', dateColor: '#111', weekendColor: '#c0392b', saturdayColor: '#1a6fb5', monthColor: '#bbb', currentYearColor: '#111', pastYearColor: '#888', subColor: '#ccc', emptyColor: '#ccc', eventColor: '#222', btnActiveBg: '#333', btnActiveColor: '#fff', btnBorder: '#ccc', btnColor: '#888', navColor: '#aaa', todayBadgeBg: '#333', todayBadgeColor: '#fff' },
};

export const FS = {
  small: { date: 20, yearNum: 13, event: 11, evTime: 10, rowMin: 68 },
  medium: { date: 25, yearNum: 16, event: 14, evTime: 12, rowMin: 82 },
  large: { date: 30, yearNum: 19, event: 17, evTime: 14, rowMin: 96 },
};

export const FONTS = {
  gothic: { name: 'ゴシック', family: 'Hiragino Sans, Meiryo, sans-serif' },
  mincho: { name: '明朝', family: '"Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif' },
  rounded: { name: '丸ゴシック', family: '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", sans-serif' },
};
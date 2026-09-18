// 記念日表示テキストの生成ロジック（UI副作用なしの純粋関数）

// 周年表示キーワード定義（将来の追加は配列に1行追記するだけ）
export const ANNIV_KEYWORDS = [
  { words: ['誕生日', '生誕'],   fmt: (n) => `生誕${n}周年` },
  { words: ['没', '逝去', '死去'], fmt: (n) => `没後${n}年` },
  { words: ['結婚'],             fmt: (n) => `結婚${n}周年` },
  { words: ['交際'],             fmt: (n) => `交際${n}周年` },
  { words: ['創立'],             fmt: (n) => `創立${n}周年` },
  { words: ['設立'],             fmt: (n) => `設立${n}周年` },
  { words: ['開業'],             fmt: (n) => `開業${n}周年` },
  { words: ['開店'],             fmt: (n) => `開店${n}周年` },
  { words: ['結成'],             fmt: (n) => `結成${n}周年` },
  { words: ['デビュー'],         fmt: (n) => `デビュー${n}周年` },
  { words: ['公開'],             fmt: (n) => `公開${n}周年` },
  { words: ['発売'],             fmt: (n) => `発売${n}周年` },
  { words: ['放送開始'],         fmt: (n) => `放送開始${n}周年` },
];

// 詳細欄から起算年（1900〜2099の最初の4桁数字）を抽出
export function extractYear(description) {
  if (!description) return null;
  const m = description.match(/\b(1[4-9]\d{2}|20\d{2})\b/);
  return m ? parseInt(m[0], 10) : null;
}

// タイトルからキーワードマッチして周年テキストを生成
export function getAnnivText(title, description, displayYear) {
  const originYear = extractYear(description);
  const diff = originYear ? displayYear - originYear : null;
  if (diff !== null && diff < 0) return title; // 未来年は周年なし
  const matched = ANNIV_KEYWORDS.find(k => k.words.some(w => title.includes(w)));
  const suffix = diff !== null ? (matched ? matched.fmt(diff) : `${diff}周年`) : null;
  return suffix ? `${title}　${suffix}` : title;
}

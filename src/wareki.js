// 和暦変換ユーティリティ（UI副作用なしの純粋関数）
// Intl.DateTimeFormat('ja-JP-u-ca-japanese')は明治より前の日付でも慶応・安政等の
// 元号名を返してしまうため、明治〜令和の5元号のホワイトリストで判定しフォールバックする。

const WAREKI_FORMATTER = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'short', year: 'numeric' });

// 元号一覧（開始年＝西暦での元年）。年ジャンプ入力欄のセレクトボックスにも使う。
export const ERAS = [
  { name: '明治', startYear: 1868 },
  { name: '大正', startYear: 1912 },
  { name: '昭和', startYear: 1926 },
  { name: '平成', startYear: 1989 },
  { name: '令和', startYear: 2019 },
];

const ERA_NAMES = ERAS.map(e => e.name);

// Dateオブジェクト→和暦。明治より前（元号名がホワイトリスト外）の場合は
// { era: null, eraYear: null, text: '<西暦年>年' } を返す。
export function toWareki(date) {
  const parts = WAREKI_FORMATTER.formatToParts(date);
  const era = parts.find(p => p.type === 'era')?.value;
  const yearStr = parts.find(p => p.type === 'year')?.value;
  if (!era || !yearStr || !ERA_NAMES.includes(era)) {
    return { era: null, eraYear: null, text: `${date.getFullYear()}年` };
  }
  const eraYear = yearStr === '元' ? 1 : parseInt(yearStr, 10);
  return { era, eraYear, text: `${era}${eraYear === 1 ? '元' : eraYear}年` };
}

// 元号名＋和暦年→西暦年。不正な元号名・1未満の年はnullを返す。
export function warekiToSeireki(eraName, eraYear) {
  const era = ERAS.find(e => e.name === eraName);
  const y = typeof eraYear === 'string' ? parseInt(eraYear, 10) : eraYear;
  if (!era || !Number.isInteger(y) || y < 1) return null;
  return era.startYear + y - 1;
}

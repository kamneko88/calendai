// 年/月/日ジャンプ機能の日付解決・バリデーションロジック（UI副作用なしの純粋関数）
export function resolveJumpTarget(jumpYear, jumpMonth, jumpDay, right) {
  const y = jumpYear ? parseInt(jumpYear) : null;
  const m = jumpMonth ? parseInt(jumpMonth) - 1 : null;
  const d = jumpDay ? parseInt(jumpDay) : null;
  // バリデーション
  if (y !== null && (y < 1900 || y > 2100)) return { error: '年は1900〜2100の範囲で入力してください' };
  if (m !== null && (m < 0 || m > 11)) return { error: '月は1〜12の範囲で入力してください' };
  if (d !== null && (d < 1 || d > 31)) return { error: '日は1〜31の範囲で入力してください' };
  // 存在しない日付チェック（閏年対応）
  if (d !== null) {
    const checkY = y !== null ? y : right.getFullYear();
    const checkM = m !== null ? m : right.getMonth();
    const testDate = new Date(checkY, checkM, d);
    if (testDate.getDate() !== d) return { error: '存在しない日付です' };
  }
  let target;
  if (y !== null && m !== null && d !== null) target = new Date(y, m, d);
  else if (y !== null && m !== null) target = new Date(y, m, right.getDate());
  else if (y !== null) target = new Date(y, right.getMonth(), right.getDate());
  else if (m !== null && d !== null) target = new Date(right.getFullYear(), m, d);
  else if (m !== null) target = new Date(right.getFullYear(), m, right.getDate());
  else if (d !== null) target = new Date(right.getFullYear(), right.getMonth(), d);
  else return null;
  return { target, year: y !== null ? y : right.getFullYear() };
}

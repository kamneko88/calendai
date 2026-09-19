import { describe, it, expect } from 'vitest';
import { toWareki, warekiToSeireki, ERAS } from './wareki';

describe('toWareki - 改元境界（実測で確認済み）', () => {
  it('明治45年7月29日: まだ明治', () => {
    expect(toWareki(new Date(1912, 6, 29))).toEqual({ era: '明治', eraYear: 45, text: '明治45年' });
  });
  it('明治45年7月30日: 大正元年に切り替わる', () => {
    expect(toWareki(new Date(1912, 6, 30))).toEqual({ era: '大正', eraYear: 1, text: '大正元年' });
  });

  it('大正15年12月24日: まだ大正', () => {
    expect(toWareki(new Date(1926, 11, 24))).toEqual({ era: '大正', eraYear: 15, text: '大正15年' });
  });
  it('大正15年12月25日: 昭和元年に切り替わる', () => {
    expect(toWareki(new Date(1926, 11, 25))).toEqual({ era: '昭和', eraYear: 1, text: '昭和元年' });
  });

  it('昭和64年1月7日: まだ昭和', () => {
    expect(toWareki(new Date(1989, 0, 7))).toEqual({ era: '昭和', eraYear: 64, text: '昭和64年' });
  });
  it('昭和64年1月8日: 平成元年に切り替わる', () => {
    expect(toWareki(new Date(1989, 0, 8))).toEqual({ era: '平成', eraYear: 1, text: '平成元年' });
  });

  it('平成31年4月30日: まだ平成', () => {
    expect(toWareki(new Date(2019, 3, 30))).toEqual({ era: '平成', eraYear: 31, text: '平成31年' });
  });
  it('平成31年5月1日: 令和元年に切り替わる', () => {
    expect(toWareki(new Date(2019, 4, 1))).toEqual({ era: '令和', eraYear: 1, text: '令和元年' });
  });
});

describe('toWareki - 明治より前はフォールバック（西暦のまま）', () => {
  it('慶応3年（1867年）はフォールバックして西暦表示になる', () => {
    const result = toWareki(new Date(1867, 0, 1));
    expect(result.era).toBeNull();
    expect(result.eraYear).toBeNull();
    expect(result.text).toBe('1867年');
  });
  it('明治元年前日（1868年はまだ慶応4年）もフォールバックする', () => {
    // 実測：Intl側の改元日は1868-10-23（グレゴリオ暦換算）。それより前は慶応4年のまま。
    const result = toWareki(new Date(1868, 9, 22));
    expect(result.era).toBeNull();
    expect(result.text).toBe('1868年');
  });
});

describe('warekiToSeireki - 往復変換', () => {
  it.each([
    ['明治', 45, 1912],
    ['大正', 1, 1912],
    ['大正', 15, 1926],
    ['昭和', 1, 1926],
    ['昭和', 64, 1989],
    ['平成', 1, 1989],
    ['平成', 31, 2019],
    ['令和', 1, 2019],
    ['令和', 7, 2025],
  ])('%s%s年 → 西暦%s年', (era, eraYear, expected) => {
    expect(warekiToSeireki(era, eraYear)).toBe(expected);
  });

  it('不正な元号名はnullを返す', () => {
    expect(warekiToSeireki('存在しない元号', 1)).toBeNull();
  });
  it('0以下の和暦年はnullを返す', () => {
    expect(warekiToSeireki('令和', 0)).toBeNull();
    expect(warekiToSeireki('令和', -1)).toBeNull();
  });

  it('西暦→和暦→西暦の往復変換が一致する（改元境界を避けた日付で確認）', () => {
    [1950, 1970, 2000, 2010, 2023].forEach(year => {
      const date = new Date(year, 5, 15); // 6月15日：既知の改元境界から十分離れている
      const w = toWareki(date);
      expect(w.era).not.toBeNull();
      const back = warekiToSeireki(w.era, w.eraYear);
      expect(back).toBe(year);
    });
  });
});

describe('ERAS - 年ジャンプ入力欄セレクトボックス用定数', () => {
  it('明治・大正・昭和・平成・令和の5件が開始年昇順で並んでいる', () => {
    expect(ERAS.map(e => e.name)).toEqual(['明治', '大正', '昭和', '平成', '令和']);
    expect(ERAS.map(e => e.startYear)).toEqual([1868, 1912, 1926, 1989, 2019]);
  });
});

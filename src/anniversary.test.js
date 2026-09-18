import { describe, it, expect } from 'vitest';
import { extractYear, getAnnivText } from './anniversary';

describe('extractYear - 年境界', () => {
  it('1399はマッチしない', () => {
    expect(extractYear('1399年に起きた出来事')).toBeNull();
  });
  it('1400はマッチする', () => {
    expect(extractYear('1400年に起きた出来事')).toBe(1400);
  });
  it('2099はマッチする', () => {
    expect(extractYear('2099年に起きた出来事')).toBe(2099);
  });
  it('2100はマッチしない', () => {
    expect(extractYear('2100年に起きた出来事')).toBeNull();
  });
  it('該当年が無い場合はnullを返す', () => {
    expect(extractYear('特に年の記載がない文章')).toBeNull();
  });
  it('descriptionが空文字・未指定の場合もnullを返す', () => {
    expect(extractYear('')).toBeNull();
    expect(extractYear(undefined)).toBeNull();
    expect(extractYear(null)).toBeNull();
  });
});

describe('getAnnivText - ANNIV_KEYWORDS各カテゴリ', () => {
  it('誕生日/生誕 → 生誕N周年', () => {
    expect(getAnnivText('誕生日', '2000年生まれ', 2020)).toBe('誕生日　生誕20周年');
    expect(getAnnivText('生誕記念', '2000年', 2020)).toBe('生誕記念　生誕20周年');
  });
  it('没/逝去/死去 → 没後N年', () => {
    expect(getAnnivText('没', '2000年', 2020)).toBe('没　没後20年');
    expect(getAnnivText('逝去', '2000年', 2020)).toBe('逝去　没後20年');
    expect(getAnnivText('死去', '2000年', 2020)).toBe('死去　没後20年');
  });
  it('結婚 → 結婚N周年', () => {
    expect(getAnnivText('結婚記念日', '2000年', 2020)).toBe('結婚記念日　結婚20周年');
  });
  it('交際 → 交際N周年', () => {
    expect(getAnnivText('交際記念日', '2000年', 2020)).toBe('交際記念日　交際20周年');
  });
  it('創立 → 創立N周年', () => {
    expect(getAnnivText('創立記念日', '2000年', 2020)).toBe('創立記念日　創立20周年');
  });
  it('設立 → 設立N周年', () => {
    expect(getAnnivText('設立記念日', '2000年', 2020)).toBe('設立記念日　設立20周年');
  });
  it('開業 → 開業N周年', () => {
    expect(getAnnivText('開業記念日', '2000年', 2020)).toBe('開業記念日　開業20周年');
  });
  it('開店 → 開店N周年', () => {
    expect(getAnnivText('開店記念日', '2000年', 2020)).toBe('開店記念日　開店20周年');
  });
  it('結成 → 結成N周年', () => {
    expect(getAnnivText('結成記念日', '2000年', 2020)).toBe('結成記念日　結成20周年');
  });
  it('デビュー → デビューN周年', () => {
    expect(getAnnivText('デビュー記念日', '2000年', 2020)).toBe('デビュー記念日　デビュー20周年');
  });
  it('公開 → 公開N周年', () => {
    expect(getAnnivText('公開記念日', '2000年', 2020)).toBe('公開記念日　公開20周年');
  });
  it('発売 → 発売N周年', () => {
    expect(getAnnivText('発売記念日', '2000年', 2020)).toBe('発売記念日　発売20周年');
  });
  it('放送開始 → 放送開始N周年', () => {
    expect(getAnnivText('放送開始記念日', '2000年', 2020)).toBe('放送開始記念日　放送開始20周年');
  });
});

describe('getAnnivText - フォールバック・特殊系', () => {
  it('どのキーワードにもマッチしない場合はN周年のフォールバック表記になる', () => {
    expect(getAnnivText('記念日', '2000年', 2020)).toBe('記念日　20周年');
  });
  it('diffが負（未来年）の場合は元のタイトルをそのまま返す', () => {
    expect(getAnnivText('誕生日', '2030年', 2020)).toBe('誕生日');
  });
  it('diffが0（当年）の場合は0周年を表示する', () => {
    expect(getAnnivText('誕生日', '2020年', 2020)).toBe('誕生日　生誕0周年');
  });
  it('description未指定（起算年なし）の場合は元のタイトルをそのまま返す', () => {
    expect(getAnnivText('誕生日', '', 2020)).toBe('誕生日');
    expect(getAnnivText('誕生日', undefined, 2020)).toBe('誕生日');
    expect(getAnnivText('誕生日', null, 2020)).toBe('誕生日');
  });
});

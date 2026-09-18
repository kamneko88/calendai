import { describe, it, expect } from 'vitest';
import { resolveJumpTarget } from './dateJump';

// 表示右端の基準日（2024年はうるう年）
const right = new Date(2024, 5, 15); // 2024-06-15

describe('resolveJumpTarget - 7パターンの部分入力', () => {
  it('年のみ: 月日は右端基準日を引き継ぐ', () => {
    const result = resolveJumpTarget('2020', '', '', right);
    expect(result.error).toBeUndefined();
    expect(result.year).toBe(2020);
    expect(result.target).toEqual(new Date(2020, 5, 15));
  });

  it('月のみ: 年日は右端基準日を引き継ぐ', () => {
    const result = resolveJumpTarget('', '3', '', right);
    expect(result.error).toBeUndefined();
    expect(result.year).toBe(2024);
    expect(result.target).toEqual(new Date(2024, 2, 15));
  });

  it('日のみ: 年月は右端基準日を引き継ぐ', () => {
    const result = resolveJumpTarget('', '', '20', right);
    expect(result.error).toBeUndefined();
    expect(result.year).toBe(2024);
    expect(result.target).toEqual(new Date(2024, 5, 20));
  });

  it('年+月: 日は右端基準日を引き継ぐ', () => {
    const result = resolveJumpTarget('2022', '11', '', right);
    expect(result.error).toBeUndefined();
    expect(result.year).toBe(2022);
    expect(result.target).toEqual(new Date(2022, 10, 15));
  });

  it('年+日: 月は右端基準日を引き継ぐ（日は無視される＝既存挙動）', () => {
    const result = resolveJumpTarget('2022', '', '25', right);
    expect(result.error).toBeUndefined();
    expect(result.year).toBe(2022);
    // 既存ロジックでは y のみ指定時の分岐に入るため、日指定(25)は使われず right の日(15)になる
    expect(result.target).toEqual(new Date(2022, 5, 15));
  });

  it('月+日: 年は右端基準日を引き継ぐ', () => {
    const result = resolveJumpTarget('', '9', '9', right);
    expect(result.error).toBeUndefined();
    expect(result.year).toBe(2024);
    expect(result.target).toEqual(new Date(2024, 8, 9));
  });

  it('年+月+日: すべて指定どおり', () => {
    const result = resolveJumpTarget('2019', '12', '25', right);
    expect(result.error).toBeUndefined();
    expect(result.year).toBe(2019);
    expect(result.target).toEqual(new Date(2019, 11, 25));
  });

  it('すべて未入力: nullを返す（何もしない）', () => {
    const result = resolveJumpTarget('', '', '', right);
    expect(result).toBeNull();
  });
});

describe('resolveJumpTarget - バリデーション（範囲）', () => {
  it('年が1900未満はエラー', () => {
    expect(resolveJumpTarget('1899', '', '', right).error).toBe('年は1900〜2100の範囲で入力してください');
  });
  it('年が2100超はエラー', () => {
    expect(resolveJumpTarget('2101', '', '', right).error).toBe('年は1900〜2100の範囲で入力してください');
  });
  it('年1900・2100は境界としてOK', () => {
    expect(resolveJumpTarget('1900', '', '', right).error).toBeUndefined();
    expect(resolveJumpTarget('2100', '', '', right).error).toBeUndefined();
  });
  it('月が0以下はエラー', () => {
    expect(resolveJumpTarget('', '0', '', right).error).toBe('月は1〜12の範囲で入力してください');
  });
  it('月が13以上はエラー', () => {
    expect(resolveJumpTarget('', '13', '', right).error).toBe('月は1〜12の範囲で入力してください');
  });
  it('日が0以下はエラー', () => {
    expect(resolveJumpTarget('', '', '0', right).error).toBe('日は1〜31の範囲で入力してください');
  });
  it('日が32以上はエラー', () => {
    expect(resolveJumpTarget('', '', '32', right).error).toBe('日は1〜31の範囲で入力してください');
  });
});

describe('resolveJumpTarget - 存在しない日付（閏年含む）', () => {
  it('うるう年の2/29は有効（年指定あり）', () => {
    const result = resolveJumpTarget('2024', '2', '29', right);
    expect(result.error).toBeUndefined();
    expect(result.target).toEqual(new Date(2024, 1, 29));
  });

  it('平年の2/29は無効', () => {
    const result = resolveJumpTarget('2023', '2', '29', right);
    expect(result.error).toBe('存在しない日付です');
  });

  it('平年（右端基準日の年）で月未指定・日=29かつ右端月が2月の場合は無効', () => {
    const febRight = new Date(2023, 1, 10); // 2023-02-10（平年）
    const result = resolveJumpTarget('', '', '29', febRight);
    expect(result.error).toBe('存在しない日付です');
  });

  it('4月31日は存在しないため無効', () => {
    const result = resolveJumpTarget('2024', '4', '31', right);
    expect(result.error).toBe('存在しない日付です');
  });

  it('2月30日は存在しないため無効', () => {
    const result = resolveJumpTarget('2024', '2', '30', right);
    expect(result.error).toBe('存在しない日付です');
  });

  it('うるう年の2/29を月のみ指定（年は右端基準日=うるう年）で有効', () => {
    const febRight = new Date(2024, 1, 10); // 2024-02-10（うるう年）
    const result = resolveJumpTarget('', '2', '29', febRight);
    expect(result.error).toBeUndefined();
    expect(result.target).toEqual(new Date(2024, 1, 29));
  });
});

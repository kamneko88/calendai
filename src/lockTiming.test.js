import { describe, it, expect } from 'vitest';
import { shouldRelockOnResume, LOCK_GRACE_PERIOD_MS } from './lockTiming';

describe('shouldRelockOnResume', () => {
  it('4分59秒経過: 再ロックしない', () => {
    const backgroundedAt = 0;
    const resumedAt = 4 * 60 * 1000 + 59 * 1000;
    expect(shouldRelockOnResume(backgroundedAt, resumedAt)).toBe(false);
  });

  it('ちょうど5分00秒経過: 再ロックする（境界値は>=側）', () => {
    const backgroundedAt = 0;
    const resumedAt = LOCK_GRACE_PERIOD_MS;
    expect(shouldRelockOnResume(backgroundedAt, resumedAt)).toBe(true);
  });

  it('5分超経過: 再ロックする', () => {
    const backgroundedAt = 0;
    const resumedAt = LOCK_GRACE_PERIOD_MS + 1000;
    expect(shouldRelockOnResume(backgroundedAt, resumedAt)).toBe(true);
  });

  it('バックグラウンド未記録（null）: 再ロックしない', () => {
    expect(shouldRelockOnResume(null, Date.now())).toBe(false);
  });

  it('猶予ミリ秒を明示的に指定した場合はその値で判定する', () => {
    const backgroundedAt = 0;
    expect(shouldRelockOnResume(backgroundedAt, 999, 1000)).toBe(false);
    expect(shouldRelockOnResume(backgroundedAt, 1000, 1000)).toBe(true);
  });

  it('経過時間が0（即座に復帰）: 再ロックしない', () => {
    const backgroundedAt = 1000;
    expect(shouldRelockOnResume(backgroundedAt, 1000)).toBe(false);
  });
});

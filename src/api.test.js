import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchOldestEventYear } from './api';

function mockFetchOnce(items) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ items }),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchOldestEventYear', () => {
  it('通常イベント（start.dateTime）が存在する場合、その年が正しく返る', async () => {
    mockFetchOnce([
      { start: { dateTime: '2010-05-20T09:00:00+09:00' } },
    ]);
    expect(await fetchOldestEventYear('token')).toBe(2010);
  });

  it('通常イベントが無く、終日イベント（start.date）のみの場合、その年が返る', async () => {
    mockFetchOnce([
      { start: { date: '2012-07-15' } },
    ]);
    expect(await fetchOldestEventYear('token')).toBe(2012);
  });

  it('終日イベントの日付が1月1日でも、文字列分割で年が取得されタイムゾーンの影響を受けない', async () => {
    mockFetchOnce([
      { start: { date: '2015-01-01' } },
    ]);
    expect(await fetchOldestEventYear('token')).toBe(2015);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { draftKey, saveDraft, loadDraft, clearDraft } from './diaryDraft';

// vitestのデフォルト環境（node）にはlocalStorageが存在しないため、テスト用に最小限のin-memory実装を用意する
class MemoryStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}
globalThis.localStorage ??= new MemoryStorage();

describe('diaryDraft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('保存→読み込みで同じ内容が返る（roundtrip）', () => {
    const date = new Date(2026, 8, 22);
    saveDraft(date, null, 'タイトル', '本文');
    expect(loadDraft(date, null)).toEqual({ title: 'タイトル', description: '本文' });
  });

  it('新規作成と編集で別の日付・IDなら別キーになり、互いに干渉しない', () => {
    const date1 = new Date(2026, 8, 22);
    const date2 = new Date(2026, 8, 23);
    saveDraft(date1, null, '新規タイトル', '新規本文');
    saveDraft(date2, 'event123', '編集タイトル', '編集本文');

    expect(loadDraft(date1, null)).toEqual({ title: '新規タイトル', description: '新規本文' });
    expect(loadDraft(date2, 'event123')).toEqual({ title: '編集タイトル', description: '編集本文' });
    expect(draftKey(date1, null)).not.toBe(draftKey(date2, 'event123'));
  });

  it('clearDraft後はloadDraftがnullを返す', () => {
    const date = new Date(2026, 8, 22);
    saveDraft(date, null, 'タイトル', '本文');
    clearDraft(date, null);
    expect(loadDraft(date, null)).toBeNull();
  });

  it('存在しないキーでloadDraftを呼ぶとnullを返す（例外を投げない）', () => {
    const date = new Date(2026, 8, 22);
    expect(loadDraft(date, null)).toBeNull();
  });

  it('タイトル・本文が両方空文字でのsaveDraftは保存しない', () => {
    const date = new Date(2026, 8, 22);
    saveDraft(date, null, '  ', '');
    expect(loadDraft(date, null)).toBeNull();
  });

  it('localStorageに不正なJSON文字列が入っていてもloadDraftが例外を投げずnullを返す', () => {
    const date = new Date(2026, 8, 22);
    localStorage.setItem(draftKey(date, null), '{不正なJSON');
    expect(() => loadDraft(date, null)).not.toThrow();
    expect(loadDraft(date, null)).toBeNull();
  });
});

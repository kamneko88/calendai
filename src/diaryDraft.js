// 日記モーダルの未保存入力（下書き）の保存・読み込み・削除を行う純粋関数群（UI副作用なし）

const DRAFT_KEY_PREFIX = 'myd_diary_draft_';

// date: Dateオブジェクト、editEventId: 編集対象イベントのID（新規作成時はnull/undefined）
export function draftKey(date, editEventId) {
  const dateSegment = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return `${DRAFT_KEY_PREFIX}${dateSegment}_${editEventId || 'new'}`;
}

export function saveDraft(date, editEventId, title, description) {
  const key = draftKey(date, editEventId);
  if (!title.trim() && !description.trim()) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, JSON.stringify({ title, description, savedAt: Date.now() }));
}

export function loadDraft(date, editEventId) {
  const key = draftKey(date, editEventId);
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return { title: parsed.title, description: parsed.description };
  } catch {
    return null;
  }
}

export function clearDraft(date, editEventId) {
  localStorage.removeItem(draftKey(date, editEventId));
}

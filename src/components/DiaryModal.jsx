import { useState, useEffect, useRef } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import { createCalendarEvent, updateCalendarEvent } from "../api";
import { useModalAnimation } from "../hooks";
import { toWareki } from "../wareki";
import { saveDraft, loadDraft, clearDraft } from "../diaryDraft";

export default function DiaryModal({ date, year, accessToken, selectedCalendars, editEvent, onClose, onSaved, warekiDisplay, theme }) {
  const { close, overlayAnim, contentAnim } = useModalAnimation(onClose);
  const isEdit = !!editEvent;

  const targetDate = isEdit ? editEvent.date : new Date(year, date.getMonth(), date.getDate());
  const draft = loadDraft(targetDate, editEvent?.id);

  const [title, setTitle] = useState(draft ? draft.title : (isEdit ? editEvent.title : ''));
  const [description, setDescription] = useState(draft ? draft.description : (isEdit ? editEvent.description : ''));
  const [calendarId, setCalendarId] = useState(isEdit ? editEvent.calendarId : (selectedCalendars[0]?.id || ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [restoredFromDraft] = useState(!!draft);

  const yearLabel = warekiDisplay ? toWareki(targetDate).text : `${targetDate.getFullYear()}年`;
  const dateLabel = `${yearLabel}${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;

  const draftFieldsRef = useRef({ title, description });
  draftFieldsRef.current = { title, description };

  useEffect(() => {
    const listenerPromise = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) return;
      const { title: currentTitle, description: currentDescription } = draftFieldsRef.current;
      saveDraft(targetDate, editEvent?.id, currentTitle, currentDescription);
    });
    return () => { listenerPromise.then(listener => listener.remove()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    clearDraft(targetDate, editEvent?.id);
    close();
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('タイトルを入力してください'); return; }
    if (!calendarId) { setError('カレンダーを選択してください'); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateCalendarEvent(accessToken, editEvent.calendarId, editEvent.id, title.trim(), description.trim());
      } else {
        await createCalendarEvent(accessToken, calendarId, targetDate, title.trim(), description.trim());
      }
      clearDraft(targetDate, editEvent?.id);
      onSaved();
      onClose();
    } catch (e) {
      setError('保存に失敗しました。もう一度お試しください。');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', ...overlayAnim }}
      onClick={e => { if (e.target === e.currentTarget) handleCancel(); }}>
      <div style={{ background: theme.pageBg, borderRadius: '12px', width: '100%', maxWidth: '360px', border: `0.5px solid ${theme.pageBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden', ...contentAnim }}>

        {/* ヘッダー */}
        <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${theme.rowBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: theme.monthColor, letterSpacing: '.1em', textTransform: 'uppercase' }}>{isEdit ? 'edit diary' : 'diary'}</div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: theme.dateColor }}>{dateLabel}</div>
            {restoredFromDraft && (
              <div style={{ fontSize: '11px', color: theme.subColor, marginTop: '4px' }}>前回入力した内容を復元しました</div>
            )}
          </div>
          <button onClick={handleCancel} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.subColor, lineHeight: 1 }}>×</button>
        </div>

        {/* フォーム */}
        <div style={{ padding: '18px' }}>

          {/* タイトル */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: theme.subColor, marginBottom: '6px' }}>タイトル</div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="今日のひとこと"
              autoFocus
              style={{ width: '100%', padding: '8px 10px', fontSize: '14px', border: `0.5px solid ${theme.pageBorder}`, borderRadius: '6px', background: theme.headerBg, color: theme.dateColor, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* 本文 */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: theme.subColor, marginBottom: '6px' }}>本文（任意）</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="詳細を入力..."
              rows={4}
              style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: `0.5px solid ${theme.pageBorder}`, borderRadius: '6px', background: theme.headerBg, color: theme.dateColor, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
          </div>

          {/* カレンダー選択（新規作成時のみ） */}
          {!isEdit && selectedCalendars.length > 1 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: theme.subColor, marginBottom: '6px' }}>保存先カレンダー</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedCalendars.map(cal => (
                  <label key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="diaryCalendar" checked={calendarId === cal.id}
                      onChange={() => setCalendarId(cal.id)}
                      style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cal.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: theme.eventColor }}>{cal.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ fontSize: '12px', color: '#e74c3c', marginBottom: '10px' }}>{error}</div>}

          {/* ボタン */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCancel}
              style={{ flex: 1, padding: '10px', border: `0.5px solid ${theme.btnBorder}`, borderRadius: '7px', cursor: 'pointer', background: 'transparent', color: theme.btnColor, fontSize: '13px' }}>
              キャンセル
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, padding: '10px', border: 'none', borderRadius: '7px', cursor: saving ? 'not-allowed' : 'pointer', background: theme.pageHeaderBorder, color: theme.pageBg, fontSize: '13px', fontWeight: '500', opacity: saving ? 0.6 : 1 }}>
              {saving ? '保存中...' : isEdit ? '更新する' : '保存する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
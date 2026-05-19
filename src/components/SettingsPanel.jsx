import { useState, useRef } from "react";
import { CAL_COLORS, THEMES, FONTS } from "../constants";

export default function SettingsPanel({
  settings, onChange, onClose,
  calendars, selectedCalendars, onCalendarToggle, onDescriptionToggle,
  onCalendarReorder,
  onPinSetup, isPremium,
  anniversaryCalendarId, onAnniversaryCalendarChange,
}) {
  const [openSection, setOpenSection] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const longPressTimer = useRef(null);
  const listRef = useRef(null);
  const maxCals = isPremium ? 5 : 2;
  const isMobile = window.innerWidth < 640;

  const handleReorder = (from, to) => {
    if (from === null || to === null || from === to) return;
    const newList = [...selectedCalendars];
    const [removed] = newList.splice(from, 1);
    newList.splice(to, 0, removed);
    onCalendarReorder(newList);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getTouchIndex = (touchY) => {
    if (!listRef.current) return null;
    const items = Array.from(listRef.current.children);
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (touchY >= rect.top && touchY <= rect.bottom) return i;
    }
    return null;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '0.5px solid #ddd', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: '500', color: '#222' }}>設定</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '18px' }}>

          {/* ナビゲーション */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase' }}>ナビゲーション</div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.stepNav} onChange={e => onChange({ ...settings, stepNav: e.target.checked })} style={{ width: '16px', height: '16px', marginTop: '1px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', color: '#333' }}>◀ ▶ ボタンで1日ずつ移動する</div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>オフ：表示日数分まとめて移動<br />オン：1日ずつ移動</div>
              </div>
            </label>
          </div>

          {/* 文字サイズ */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase' }}>文字サイズ</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[['small', '小'], ['medium', '中'], ['large', '大']].map(([val, label]) => (
                <button key={val} onClick={() => onChange({ ...settings, fontSize: val })}
                  style={{ flex: 1, padding: '10px', border: `0.5px solid ${settings.fontSize === val ? '#333' : '#ddd'}`, borderRadius: '7px', cursor: 'pointer', fontSize: val === 'small' ? '12px' : val === 'medium' ? '15px' : '18px', background: settings.fontSize === val ? '#333' : '#fff', color: settings.fontSize === val ? '#fff' : '#555' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ロック機能 */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase' }}>ロック機能</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
              <input type="checkbox" checked={settings.lockEnabled || false}
                onChange={e => onChange({ ...settings, lockEnabled: e.target.checked })}
                style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#333' }}>起動時にPINロックする</span>
            </label>
            {settings.lockEnabled && (
              <div>
                <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                  {localStorage.getItem('myd_pin') ? '✅ PIN設定済み' : '⚠️ PINが未設定です'}
                </div>
                <button onClick={() => onPinSetup()}
                  style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  {localStorage.getItem('myd_pin') ? 'PINを変更する' : 'PINを設定する'}
                </button>
              </div>
            )}
          </div>

          {/* フォント選択（有料版のみ） */}
          {isPremium && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', marginBottom: '4px', textTransform: 'uppercase' }}>フォント</div>
              <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '10px' }}>日記・予定の表示フォントを選択</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.entries(FONTS).map(([key, f]) => (
                  <button key={key} onClick={() => onChange({ ...settings, fontFamily: key })}
                    style={{ padding: '10px 14px', border: `0.5px solid ${(settings.fontFamily || 'gothic') === key ? '#555' : '#ddd'}`, borderRadius: '7px', cursor: 'pointer', textAlign: 'left', background: (settings.fontFamily || 'gothic') === key ? '#333' : '#fff', color: (settings.fontFamily || 'gothic') === key ? '#fff' : '#333', fontSize: '14px', fontFamily: f.family }}>
                    {f.name}　<span style={{ fontSize: '12px', opacity: 0.7 }}>あいうえお ABC 123</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* テーマ */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase' }}>テーマ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => onChange({ ...settings, theme: key })}
                  style={{ padding: '10px 12px', border: `0.5px solid ${settings.theme === key ? '#555' : '#ddd'}`, borderRadius: '7px', cursor: 'pointer', textAlign: 'left', background: settings.theme === key ? '#333' : '#fff', color: settings.theme === key ? '#fff' : '#333', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t.pageBg, border: `2px solid ${t.pageBorder}`, flexShrink: 0 }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* 表示カレンダー（アコーディオン） */}
          {calendars.length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              {/* ヘッダー行 */}
              <button onClick={() => setOpenSection(o => o === 'cal' ? null : 'cal')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', textTransform: 'uppercase' }}>表示カレンダー</span>
                  <span style={{ fontSize: '10px', color: '#bbb' }}>（最大{maxCals}つ）</span>
                </div>
                <span style={{ fontSize: '10px', color: '#aaa' }}>{openSection === 'cal' ? '▲' : '▼'}</span>
              </button>

              {/* 選択中カレンダー：縦並びドラッグリスト */}
              {selectedCalendars.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '8px' }}>未選択</div>
              ) : (
                <>
                  <div ref={listRef} style={{ marginBottom: '6px' }}>
                    {selectedCalendars.map((cal, i) => (
                      <div
                        key={cal.id}
                        draggable={!isMobile}
                        onDragStart={() => setDragIndex(i)}
                        onDragOver={e => { e.preventDefault(); setDragOverIndex(i); }}
                        onDrop={() => handleReorder(dragIndex, i)}
                        onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                        onTouchStart={() => {
                          longPressTimer.current = setTimeout(() => {
                            setDragIndex(i);
                            if (navigator.vibrate) navigator.vibrate(40);
                          }, 500);
                        }}
                        onTouchMove={e => {
                          if (dragIndex === null) { clearTimeout(longPressTimer.current); return; }
                          e.preventDefault();
                          const idx = getTouchIndex(e.touches[0].clientY);
                          if (idx !== null) setDragOverIndex(idx);
                        }}
                        onTouchEnd={() => {
                          clearTimeout(longPressTimer.current);
                          handleReorder(dragIndex, dragOverIndex);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 10px', marginBottom: '4px',
                          borderRadius: '7px',
                          border: `1px solid ${dragIndex === i ? '#aaa' : dragOverIndex === i ? '#bbb' : '#eee'}`,
                          background: dragIndex === i ? '#f0f0f0' : dragOverIndex === i ? '#fafafa' : '#fff',
                          opacity: dragIndex === i ? 0.7 : 1,
                          cursor: isMobile ? 'default' : 'grab',
                          userSelect: 'none',
                          touchAction: dragIndex !== null ? 'none' : 'auto',
                          transition: 'background 0.1s, border 0.1s',
                        }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cal.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cal.name}</span>
                        {!isMobile && <span style={{ fontSize: '14px', color: '#ccc', cursor: 'grab', flexShrink: 0 }}>⠿</span>}
                      </div>
                    ))}
                  </div>
                  {selectedCalendars.length > 1 && (
                    <div style={{ fontSize: '10px', color: '#bbb', marginBottom: '8px' }}>
                      {isMobile ? '長押しで並べ替えられます' : 'ドラッグ（⠿）で並べ替えられます'}
                    </div>
                  )}
                </>
              )}

              {/* 展開リスト（追加・削除） */}
              {openSection === 'cal' && (
                <div style={{ border: '0.5px solid #eee', borderRadius: '8px', overflow: 'hidden', marginTop: '8px' }}>
                  {calendars.map((cal, i) => {
                    const isSelected = selectedCalendars.some(c => c.id === cal.id);
                    const selectedCal = selectedCalendars.find(c => c.id === cal.id);
                    const isDisabled = !isSelected && selectedCalendars.length >= maxCals;
                    return (
                      <div key={cal.id} style={{ borderBottom: '0.5px solid #f5f5f5', background: isSelected ? '#fafafa' : '#fff' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.4 : 1 }}>
                          <input type="checkbox" checked={isSelected} disabled={isDisabled} onChange={() => onCalendarToggle(cal)} style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: cal.backgroundColor || CAL_COLORS[i % CAL_COLORS.length] }} />
                          <span style={{ fontSize: '13px', color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cal.summary}</span>
                        </label>
                        {isSelected && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px 10px 37px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={selectedCal?.showDescription || false}
                              onChange={() => onDescriptionToggle(cal.id)}
                              style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', color: '#888' }}>説明欄を表示する</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 記念日カレンダー（アコーディオン） */}
          {calendars.length > 0 && (
            <div>
              <button onClick={() => setOpenSection(o => o === 'anniv' ? null : 'anniv')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 8px 0' }}>
                <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', textTransform: 'uppercase' }}>記念日カレンダー</span>
                <span style={{ fontSize: '10px', color: '#aaa' }}>{openSection === 'anniv' ? '▲' : '▼'}</span>
              </button>
              <div style={{ marginBottom: openSection === 'anniv' ? '10px' : '0' }}>
                {!anniversaryCalendarId ? (
                  <span style={{ fontSize: '11px', color: '#bbb' }}>未設定</span>
                ) : (() => {
                  const cal = calendars.find(c => c.id === anniversaryCalendarId);
                  return cal ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', background: '#f5f5f5', border: '0.5px solid #eee' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cal.backgroundColor || '#c0607a' }} />
                      <span style={{ fontSize: '11px', color: '#555' }}>{cal.summary}</span>
                    </div>
                  ) : null;
                })()}
              </div>
              {openSection === 'anniv' && (
                <div style={{ border: '0.5px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer', borderBottom: '0.5px solid #f5f5f5' }}>
                    <input type="radio" name="anniversaryCal" checked={!anniversaryCalendarId}
                      onChange={() => onAnniversaryCalendarChange(null)}
                      style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#aaa' }}>未設定</span>
                  </label>
                  {calendars.map((cal, i) => {
                    const isAnniv = /anniversary|記念日|birthday|誕生日/i.test(cal.summary);
                    return (
                      <label key={cal.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer', borderBottom: '0.5px solid #f5f5f5', background: anniversaryCalendarId === cal.id ? '#fafafa' : '#fff' }}>
                        <input type="radio" name="anniversaryCal" checked={anniversaryCalendarId === cal.id}
                          onChange={() => onAnniversaryCalendarChange(cal.id)}
                          style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: cal.backgroundColor || CAL_COLORS[i % CAL_COLORS.length] }} />
                        <span style={{ fontSize: '13px', color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cal.summary}</span>
                        {isAnniv && <span style={{ fontSize: '10px', color: '#fff', background: '#c0607a', borderRadius: '3px', padding: '1px 5px', flexShrink: 0 }}>推奨</span>}
                      </label>
                    );
                  })}
                  <div style={{ padding: '10px 12px' }}>
                    <button disabled style={{ fontSize: '12px', color: '#ccc', background: 'none', border: '0.5px dashed #ddd', borderRadius: '6px', padding: '6px 12px', cursor: 'not-allowed' }}>
                      ＋ 新しく記念日カレンダーを作成（近日実装）
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
        <div style={{ padding: '10px 18px 14px', textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '7px 22px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
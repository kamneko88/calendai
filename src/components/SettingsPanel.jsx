import { THEMES, CAL_COLORS } from "../constants";

export default function SettingsPanel({ settings, onChange, onClose, calendars, selectedCalendars, onCalendarToggle, onYearCountChange, onDayCountChange, onDescriptionToggle, onPinSetup, isPremium }) {
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

          {/* カレンダー選択 */}
          {calendars.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', marginBottom: '4px', textTransform: 'uppercase' }}>表示カレンダー（最大3つ）</div>
              <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '10px' }}>チェックしたカレンダーのデータを表示します</div>
              {calendars.map((cal, i) => {
                const isSelected = selectedCalendars.some(c => c.id === cal.id);
                const selectedCal = selectedCalendars.find(c => c.id === cal.id);
                const isDisabled = !isSelected && selectedCalendars.length >= 3;
                return (
                  <div key={cal.id} style={{ padding: '8px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.4 : 1 }}>
                      <input type="checkbox" checked={isSelected} disabled={isDisabled} onChange={() => onCalendarToggle(cal)} style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, background: cal.backgroundColor || CAL_COLORS[i % CAL_COLORS.length] }} />
                      <span style={{ fontSize: '13px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cal.summary}</span>
                    </label>
                    {isSelected && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginLeft: '25px', cursor: 'pointer' }}>
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
        <div style={{ padding: '10px 18px 14px', textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '7px 22px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>閉じる</button>
        </div>
      </div>
    </div>
  );
}
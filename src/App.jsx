import { useState, useRef, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";

const MONTHS_EN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const WDS = ['日', '月', '火', '水', '木', '金', '土'];
const THEMES = {
  classic: {
    name: 'クラシック',
    bg: '#f0ebe0',
    headerBg: '#fdfaf5',
    headerBorder: '#ddd',
    pageBg: '#fdfaf5',
    pageBorder: '#e0d8cc',
    pageHeaderBorder: '#333',
    currentRowBg: '#f5f0e8',
    rowBorder: '#e8e0d0',
    dateColor: '#222',
    weekendColor: '#C0392B',
    monthColor: '#999',
    currentYearColor: '#222',
    pastYearColor: '#888',
    subColor: '#aaa',
    emptyColor: '#ccc',
    eventColor: '#333',
    btnActiveBg: '#333',
    btnActiveColor: '#fff',
    btnBorder: '#ccc',
    btnColor: '#555',
    navColor: '#888',
  },
  night: {
    name: 'ナイト',
    bg: '#0d0d1a',
    headerBg: '#1a1a2e',
    headerBorder: '#2a2a3a',
    pageBg: '#16213e',
    pageBorder: '#2a2a4a',
    pageHeaderBorder: '#444',
    currentRowBg: '#1e2a4a',
    rowBorder: '#2a3a5a',
    dateColor: '#ddd',
    weekendColor: '#e94560',
    monthColor: '#555',
    currentYearColor: '#e94560',
    pastYearColor: '#666',
    subColor: '#444',
    emptyColor: '#444',
    eventColor: '#bbb',
    btnActiveBg: '#e94560',
    btnActiveColor: '#fff',
    btnBorder: '#444',
    btnColor: '#888',
    navColor: '#666',
  },
  forest: {
    name: 'フォレスト',
    bg: '#1a2e23',
    headerBg: '#1e3329',
    headerBorder: '#2d4a3e',
    pageBg: '#243d30',
    pageBorder: '#3d6b56',
    pageHeaderBorder: '#5a9e7a',
    currentRowBg: '#1e3329',
    rowBorder: '#3d6b56',
    dateColor: '#c8e0d0',
    weekendColor: '#f87171',
    monthColor: '#4a7a5a',
    currentYearColor: '#7dd4a8',
    pastYearColor: '#4a7a5a',
    subColor: '#3a5a45',
    emptyColor: '#3a5a45',
    eventColor: '#a8c5b5',
    btnActiveBg: '#5a9e7a',
    btnActiveColor: '#fff',
    btnBorder: '#3d6b56',
    btnColor: '#6a8f7a',
    navColor: '#5a7a6a',
  },
  sakura: {
    name: 'サクラ',
    bg: '#f5e8ec',
    headerBg: '#fdf0f3',
    headerBorder: '#e8c8d0',
    pageBg: '#fef7f8',
    pageBorder: '#f0d0d8',
    pageHeaderBorder: '#c0607a',
    currentRowBg: '#fde8ec',
    rowBorder: '#f0d0d8',
    dateColor: '#6a3040',
    weekendColor: '#C0392B',
    monthColor: '#c0a0a8',
    currentYearColor: '#c0607a',
    pastYearColor: '#c0a0a8',
    subColor: '#d8b8c0',
    emptyColor: '#d8b8c0',
    eventColor: '#6a3040',
    btnActiveBg: '#c0607a',
    btnActiveColor: '#fff',
    btnBorder: '#e0b8c8',
    btnColor: '#a08090',
    navColor: '#b09090',
  },
  mono: {
    name: 'モノクローム',
    bg: '#f0f0f0',
    headerBg: '#ffffff',
    headerBorder: '#d0d0d0',
    pageBg: '#fafafa',
    pageBorder: '#ddd',
    pageHeaderBorder: '#333',
    currentRowBg: '#f0f0f0',
    rowBorder: '#e8e8e8',
    dateColor: '#111',
    weekendColor: '#c0392b',
    monthColor: '#bbb',
    currentYearColor: '#111',
    pastYearColor: '#888',
    subColor: '#ccc',
    emptyColor: '#ccc',
    eventColor: '#222',
    btnActiveBg: '#333',
    btnActiveColor: '#fff',
    btnBorder: '#ccc',
    btnColor: '#888',
    navColor: '#aaa',
  },
};
const FS = {
  small: { date: 20, yearNum: 13, event: 11, evTime: 10, rowMin: 68 },
  medium: { date: 25, yearNum: 16, event: 14, evTime: 12, rowMin: 82 },
  large: { date: 30, yearNum: 19, event: 17, evTime: 14, rowMin: 96 },
};
const CAL_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function getInitials(name) { return name ? name.charAt(0).toUpperCase() : '?'; }

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return width;
}

function useSwipe(onSwipeLeft, onSwipeRight) {
  const startX = useRef(null);
  const handleTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onSwipeLeft();
      else onSwipeRight();
    }
    startX.current = null;
  };
  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };
}

async function fetchCalendarEvents(accessToken, calendarId, year, month, day, onTokenExpired) {
  const timeMin = new Date(year, month - 1, day, 0, 0, 0).toISOString();
  const timeMax = new Date(year, month - 1, day, 23, 59, 59).toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 401) { onTokenExpired && onTokenExpired(); return []; }
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map(ev => ({
    t: ev.summary || '（タイトルなし）',
    h: ev.start.dateTime
      ? new Date(ev.start.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      : '終日',
    description: ev.description || '',
    isAllDay: !ev.start.dateTime,
    calendarId,
    year, month, day,
  }));
}

async function fetchAllCalendars(accessToken) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

function LockScreen({ onUnlock, theme }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleInput = (num) => {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);
    if (newPin.length === 4) {
      const savedPin = localStorage.getItem('myd_pin');
      if (newPin === savedPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 800);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div style={{ minHeight: '100vh', background: '#f0ebe0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hiragino Sans, Meiryo, sans-serif' }}>
      <div style={{ background: '#fdfaf5', borderRadius: '16px', padding: '40px 32px', width: '320px', border: '0.5px solid #ddd', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '26px', marginBottom: '8px' }}>🔒</div>
        <div style={{ fontSize: '15px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>5年日記</div>
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '28px' }}>PINを入力してください</div>

        {/* PIN表示 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: i < pin.length ? (error ? '#e74c3c' : '#333') : 'transparent',
              border: `2px solid ${error ? '#e74c3c' : i < pin.length ? '#333' : '#ccc'}`,
              transition: 'all 0.1s'
            }} />
          ))}
        </div>

        {/* テンキー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '220px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handleInput(String(n))}
              style={{ padding: '16px', fontSize: '18px', fontWeight: '400', border: '0.5px solid #ddd', borderRadius: '10px', cursor: 'pointer', background: '#fff', color: '#333', transition: 'background 0.1s' }}
              onMouseDown={e => e.currentTarget.style.background = '#f0f0f0'}
              onMouseUp={e => e.currentTarget.style.background = '#fff'}>
              {n}
            </button>
          ))}
          <div />
          <button onClick={() => handleInput('0')}
            style={{ padding: '16px', fontSize: '18px', fontWeight: '400', border: '0.5px solid #ddd', borderRadius: '10px', cursor: 'pointer', background: '#fff', color: '#333' }}
            onMouseDown={e => e.currentTarget.style.background = '#f0f0f0'}
            onMouseUp={e => e.currentTarget.style.background = '#fff'}>
            0
          </button>
          <button onClick={handleDelete}
            style={{ padding: '16px', fontSize: '16px', border: '0.5px solid #ddd', borderRadius: '10px', cursor: 'pointer', background: '#fff', color: '#888' }}>
            ⌫
          </button>
        </div>

        {error && <div style={{ marginTop: '16px', fontSize: '12px', color: '#e74c3c' }}>PINが違います</div>}
      </div>
    </div>
  );
}

function PinSetupScreen({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleInput = (num) => {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);
    if (newPin.length === 4) {
      if (step === 1) {
        setFirstPin(newPin);
        setStep(2);
        setPin('');
      } else {
        if (newPin === firstPin) {
          localStorage.setItem('myd_pin', newPin);
          onComplete();
        } else {
          setError(true);
          setTimeout(() => { setPin(''); setError(false); setStep(1); setFirstPin(''); }, 800);
        }
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ background: '#fdfaf5', borderRadius: '16px', padding: '40px 32px', width: '320px', border: '0.5px solid #ddd', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔐</div>
        <div style={{ fontSize: '15px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>
          {step === 1 ? '新しいPINを入力' : 'もう一度入力して確認'}
        </div>
        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '24px' }}>4桁の数字を入力してください</div>

        {/* PIN表示 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: i < pin.length ? (error ? '#e74c3c' : '#333') : 'transparent',
              border: `2px solid ${error ? '#e74c3c' : i < pin.length ? '#333' : '#ccc'}`,
              transition: 'all 0.1s'
            }} />
          ))}
        </div>

        {/* テンキー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '220px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handleInput(String(n))}
              style={{ padding: '16px', fontSize: '18px', border: '0.5px solid #ddd', borderRadius: '10px', cursor: 'pointer', background: '#fff', color: '#333' }}
              onMouseDown={e => e.currentTarget.style.background = '#f0f0f0'}
              onMouseUp={e => e.currentTarget.style.background = '#fff'}>
              {n}
            </button>
          ))}
          <button onClick={onCancel}
            style={{ padding: '16px', fontSize: '11px', border: '0.5px solid #ddd', borderRadius: '10px', cursor: 'pointer', background: '#fff', color: '#aaa' }}>
            キャンセル
          </button>
          <button onClick={() => handleInput('0')}
            style={{ padding: '16px', fontSize: '18px', border: '0.5px solid #ddd', borderRadius: '10px', cursor: 'pointer', background: '#fff', color: '#333' }}
            onMouseDown={e => e.currentTarget.style.background = '#f0f0f0'}
            onMouseUp={e => e.currentTarget.style.background = '#fff'}>
            0
          </button>
          <button onClick={handleDelete}
            style={{ padding: '16px', fontSize: '16px', border: '0.5px solid #ddd', borderRadius: '10px', cursor: 'pointer', background: '#fff', color: '#888' }}>
            ⌫
          </button>
        </div>
        {error && <div style={{ marginTop: '16px', fontSize: '12px', color: '#e74c3c' }}>PINが一致しません。最初からやり直してください</div>}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f0ebe0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hiragino Sans, Meiryo, sans-serif' }}>
      <div style={{ background: '#fdfaf5', borderRadius: '14px', padding: '48px 40px', border: '0.5px solid #ddd', textAlign: 'center', width: '320px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '13px', letterSpacing: '.2em', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase' }}>Multi Year Diary</div>
        <div style={{ fontSize: '26px', fontWeight: '500', color: '#222', marginBottom: '6px', fontFamily: 'Georgia, serif' }}>5年日記</div>
        <div style={{ fontSize: '12px', color: '#bbb', marginBottom: '36px' }}>Googleカレンダーの記録を<br />過去と並べて振り返る</div>
        <button onClick={onLogin} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '0.5px solid #ddd', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '13px', color: '#333', fontWeight: '500', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Googleでログイン
        </button>
      </div>
    </div>
  );
}

function UserMenu({ user, onSettingsOpen, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const iconStyle = { width: '100%', height: '100%', objectFit: 'cover' };
  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <div onClick={() => setOpen(o => !o)} title={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', background: user.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '500', cursor: 'pointer', userSelect: 'none', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', overflow: 'hidden', padding: 0 }}>
        {user.picture ? <img src={user.picture} alt={user.name} style={iconStyle} /> : user.initials}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '44px', right: 0, width: '230px', background: '#fff', border: '0.5px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.13)', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: user.color, color: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: '500', overflow: 'hidden', padding: 0 }}>
              {user.picture ? <img src={user.picture} alt={user.name} style={iconStyle} /> : user.initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
          </div>

          <div style={{ padding: '6px 8px' }}>
            <button
              onClick={() => { setOpen(false); onSettingsOpen(); }}
              style={{
                width: '100%', padding: '8px 10px', textAlign: 'left',
                fontSize: '13px', color: '#333', background: 'transparent',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              ⚙️ 設定
            </button>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              style={{
                width: '100%', padding: '8px 10px', textAlign: 'left',
                fontSize: '13px', color: '#e74c3c', background: 'transparent',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              🚪 ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EventModal({ event, calendarName, onClose }) {
  if (!event) return null;
  const d = new Date(event.year, event.month - 1, event.day);
  const dateStr = `${event.year}年${event.month}月${event.day}日（${WDS[d.getDay()]}）`;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fdfaf5', borderRadius: '12px', width: '100%', maxWidth: '340px', border: '0.5px solid #ddd', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>予定の詳細</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 16px' }}>
          <div style={{ fontSize: '18px', fontWeight: '500', color: '#222', marginBottom: '16px', lineHeight: 1.4 }}>{event.t}</div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>📅 {dateStr}</div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>🕐 {event.h}</div>
          {calendarName && (
            <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: event.description ? '12px' : '0' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: event.color, flexShrink: 0 }} />
              {calendarName}
            </div>
          )}
          {event.description && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#f8f8f8', borderRadius: '8px', fontSize: '13px', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap', borderLeft: '3px solid #ddd' }}>
              {event.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onChange, onClose, calendars, selectedCalendars, onCalendarToggle, onYearCountChange, onDayCountChange, onDescriptionToggle, onPinSetup, isPremium }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '0.5px solid #ddd', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: '500', color: '#222' }}>設定</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '18px' }}>
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
                <button
                  onClick={() => onPinSetup()}
                  style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  {localStorage.getItem('myd_pin') ? 'PINを変更する' : 'PINを設定する'}
                </button>
              </div>
            )}
          </div>

          {/* テーマ選択 */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase' }}>テーマ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => onChange({ ...settings, theme: key })}
                  style={{
                    padding: '10px 12px', border: `0.5px solid ${settings.theme === key ? '#555' : '#ddd'}`,
                    borderRadius: '7px', cursor: 'pointer', textAlign: 'left',
                    background: settings.theme === key ? '#333' : '#fff',
                    color: settings.theme === key ? '#fff' : '#333',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontSize: '13px',
                  }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t.pageBg, border: `2px solid ${t.pageBorder}`, flexShrink: 0 }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
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

function DayPage({ date, yearCount, baseYear, fontSize, isLast, accessToken, selectedCalendars, isMobile, onEventClick, onTokenExpired, theme }) {
  const mo = date.getMonth();
  const dy = date.getDate();
  const wd = date.getDay();
  const isWe = wd === 0 || wd === 6;
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const fs = FS[fontSize];
  const years = Array.from({ length: yearCount }, (_, i) => baseYear - i);
  const [eventsMap, setEventsMap] = useState({});

  const [loadingYears, setLoadingYears] = useState({});

  useEffect(() => {
    if (!accessToken || selectedCalendars.length === 0) return;

    let cancelled = false;
    setEventsMap({});
    const initialLoading = {};
    years.forEach(y => { initialLoading[y] = true; });
    setLoadingYears(initialLoading);

    years.forEach(async (y) => {
      const allEvs = await Promise.all(
        selectedCalendars.map(cal =>
          fetchCalendarEvents(accessToken, cal.id, y, mo + 1, dy, onTokenExpired)
            .then(evs => evs.map(ev => ({ ...ev, color: cal.color })))
        )
      );
      if (cancelled) return;
      const merged = allEvs.flat().sort((a, b) => a.h.localeCompare(b.h));
      setEventsMap(prev => ({ ...prev, [y]: merged }));
      setLoadingYears(prev => ({ ...prev, [y]: false }));
    });

    return () => { cancelled = true; };
  }, [accessToken, mo, dy, yearCount, baseYear, selectedCalendars]);

return (
  <div style={{ flex: 1, padding: isMobile ? '10px' : '14px 16px', borderRight: isLast ? 'none' : `2px solid ${theme.pageBorder}`, minWidth: 0, background: theme.pageBg }}>
    <div style={{ paddingBottom: '8px', borderBottom: `1.5px solid ${theme.pageHeaderBorder}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: isMobile ? '32px' : '40px' }}>
          <div style={{ fontSize: `${isMobile ? fs.date * 1.4 : fs.date * 1.6}px`, fontWeight: '300', color: isWe ? theme.weekendColor : theme.dateColor, fontFamily: 'Georgia, serif', lineHeight: 1 }}>
            {dy}
          </div>
          <div style={{ fontSize: '9px', color: isWe ? theme.weekendColor : theme.subColor, marginTop: '2px', whiteSpace: 'nowrap' }}>
            {WDS[wd]}曜日
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: '2px', minWidth: isMobile ? '44px' : '52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '9px', color: theme.monthColor, letterSpacing: '.05em' }}>{mo + 1}月</span>
            <span style={{ fontSize: '8px', color: theme.monthColor, letterSpacing: '.1em' }}>{MONTHS_EN[mo].slice(0, 3)}</span>
          </div>
          {isToday && (
            <span style={{ fontSize: '8px', background: theme.pageHeaderBorder, color: theme.pageBg, borderRadius: '3px', padding: '0 4px', lineHeight: 1.8, marginTop: '2px', whiteSpace: 'nowrap' }}>TODAY</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: '2px', flex: 1 }}>
          <div style={{ fontSize: '8px', letterSpacing: '.14em', color: theme.monthColor }}>ANNIVERSARY</div>
        </div>
      </div>
      {!isMobile && (
        <div style={{ fontSize: '11px', color: theme.emptyColor, fontStyle: 'italic', minHeight: '10px', borderTop: `0.5px dashed ${theme.rowBorder}`, paddingTop: '3px', marginTop: '4px' }}>
        </div>
      )}
    </div>
    {years.map(y => {
      const pd = new Date(y, mo, dy);
      const pwd = WDS[pd.getDay()];
      const isCur = y === baseYear;
      const evs = eventsMap[y] || [];
      return (
        <div key={y} style={{ display: 'flex', minHeight: `${isMobile ? fs.rowMin * 0.85 : fs.rowMin}px`, borderBottom: `0.5px solid ${theme.rowBorder}`, background: isCur ? theme.currentRowBg : 'transparent', margin: isCur ? '0 -4px' : '0', padding: isCur ? '8px 4px' : '8px 0', borderRadius: isCur ? '4px' : '0' }}>
          <div style={{ width: isMobile ? '46px' : '64px', flexShrink: 0, paddingRight: '8px', paddingTop: '1px' }}>
            <span style={{ fontSize: `${isMobile ? fs.yearNum * 0.85 : fs.yearNum}px`, fontWeight: '500', color: isCur ? theme.currentYearColor : theme.pastYearColor, display: 'block', fontFamily: 'monospace' }}>{y}</span>
            <span style={{ fontSize: '9px', color: theme.subColor, display: 'block', marginTop: '2px' }}>{pwd}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loadingYears[y]
              ? <span style={{ fontSize: '11px', color: theme.subColor }}>読込中…</span>
              : evs.length === 0
                ? <span style={{ fontSize: `${fs.event}px`, color: theme.emptyColor }}>—</span>
                : evs.map((ev, i) => (
                  <div key={i} onClick={() => onEventClick(ev)} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', padding: '2px 0', cursor: 'pointer' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ev.color || '#3B82F6', marginTop: '4px', flexShrink: 0 }} />
                    <div style={{ fontSize: `${isMobile ? fs.event * 0.9 : fs.event}px`, color: theme.eventColor, lineHeight: 1.5, overflow: 'hidden', minWidth: 0, flex: 1, textAlign: 'left' }}>
                      {!isMobile && <span style={{ fontSize: `${fs.evTime}px`, color: theme.subColor, marginRight: '3px' }}>{ev.h}</span>}
                      {ev.t}
                      {ev.description && selectedCalendars.find(c => c.id === ev.calendarId)?.showDescription ? (
                        <div style={{ fontSize: `${fs.evTime}px`, color: theme.subColor, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? '120px' : '200px' }}>
                          {ev.description.slice(0, 30)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      );
    })}
  </div>
);
}

export default function App() {
  const today = new Date();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  useEffect(() => {
    if (isMobile && dayCount > 2) handleDayCountChange(2);
  }, [isMobile]);

  const swipeHandlers = useSwipe(
    () => navigate(1),
    () => navigate(-1)
  );

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('myd_settings');
      if (saved) return JSON.parse(saved);
    } catch { }
    return { stepNav: false, fontSize: 'small', defaultYearCount: 3, defaultDayCount: 2, theme: 'classic' };
  };

  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(loadSettings);
  const [dayCount, setDayCount] = useState(() => {
    const s = loadSettings();
    const maxDays = 2;
    return Math.min(s.defaultDayCount || 2, maxDays);
  });
  const [yearCount, setYearCount] = useState(() => loadSettings().defaultYearCount || 5);
  const [base, setBase] = useState(() => {
    const s = loadSettings();
    const dc = s.defaultDayCount || 2;
    const d = new Date(today);
    d.setDate(today.getDate() - (dc - 1));
    return d;
  });
  const [baseYear, setBaseYear] = useState(() => today.getFullYear());
  const [showSettings, setShowSettings] = useState(false);
  const theme = THEMES[settings.theme] || THEMES.classic;
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [slideDir, setSlideDir] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [jumpYear, setJumpYear] = useState('');
  const [jumpMonth, setJumpMonth] = useState('');
  const [jumpDay, setJumpDay] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinSetupStep, setPinSetupStep] = useState(1);
  const [pinSetupFirst, setPinSetupFirst] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const viewMenuRef = useRef(null);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('myd_premium') === 'true');

  useEffect(() => {
    const h = (e) => { if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) setShowViewMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('myd_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        const savedCals = localStorage.getItem('myd_selected_calendars');
        if (savedCals) setSelectedCalendars(JSON.parse(savedCals));
        fetchAllCalendars(userData.accessToken).then(cals => {
          if (cals.length > 0) setCalendars(cals);
        });
        // ロックが有効なら起動時にロック
        const savedSettings = localStorage.getItem('myd_settings');
        if (savedSettings) {
          const s = JSON.parse(savedSettings);
          if (s.lockEnabled && localStorage.getItem('myd_pin')) {
            setIsLocked(true);
          }
        }
      } catch { }
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('myd_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        const savedCals = localStorage.getItem('myd_selected_calendars');
        if (savedCals) setSelectedCalendars(JSON.parse(savedCals));
      } catch { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('myd_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (selectedCalendars.length > 0) {
      localStorage.setItem('myd_selected_calendars', JSON.stringify(selectedCalendars));
    }
  }, [selectedCalendars]);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.readonly profile email',
    onSuccess: async (tokenResponse) => {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      const profile = await res.json();
      const userData = { name: profile.name, email: profile.email, picture: profile.picture, accessToken: tokenResponse.access_token, initials: getInitials(profile.name), color: '#3B82F6' };
      setUser(userData);
      localStorage.setItem('myd_user', JSON.stringify(userData));
      const cals = await fetchAllCalendars(tokenResponse.access_token);
      setCalendars(cals);
      const saved = localStorage.getItem('myd_selected_calendars');
      if (saved) {
        setSelectedCalendars(JSON.parse(saved));
      } else {
        const primary = cals.find(c => c.primary) || cals[0];
        if (primary) setSelectedCalendars([{ id: primary.id, color: primary.backgroundColor || CAL_COLORS[0], name: primary.summary, showDescription: false }]);
      }
    },
    onError: (err) => console.error('ログイン失敗:', err),
  });

  const handleCalendarToggle = (cal) => {
    setSelectedCalendars(prev => {
      const exists = prev.some(c => c.id === cal.id);
      if (exists) return prev.filter(c => c.id !== cal.id);
      if (prev.length >= 3) return prev;
      return [...prev, { id: cal.id, color: cal.backgroundColor || CAL_COLORS[calendars.indexOf(cal) % CAL_COLORS.length], name: cal.summary, showDescription: false }];
    });
  };

  const days = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(base); d.setDate(base.getDate() + i); return d;
  });

  const navigate = (delta) => {
    if (animating) return;
    setSlideDir(delta);
    setAnimating(true);
    setTimeout(() => {
      const step = settings.stepNav ? 1 : dayCount;
      const d = new Date(base);
      d.setDate(base.getDate() + delta * step);
      setBase(d);
      setAnimating(false);
    }, 150);
  };

  const goToday = () => {
    const d = new Date(today); d.setDate(today.getDate() - (dayCount - 1));
    setBase(d); setBaseYear(today.getFullYear());
    setJumpYear(''); setJumpMonth(''); setJumpDay('');
  };

  const curRight = () => { const d = new Date(base); d.setDate(base.getDate() + dayCount - 1); return d; };

  const handleJump = () => {
    const right = curRight();
    const y = jumpYear ? parseInt(jumpYear) : null;
    const m = jumpMonth ? parseInt(jumpMonth) - 1 : null;
    const d = jumpDay ? parseInt(jumpDay) : null;
    let target;
    if (y !== null && m !== null && d !== null) target = new Date(y, m, d);
    else if (y !== null && m !== null) target = new Date(y, m, right.getDate());
    else if (y !== null) target = new Date(y, right.getMonth(), right.getDate());
    else if (m !== null && d !== null) target = new Date(right.getFullYear(), m, d);
    else if (m !== null) target = new Date(right.getFullYear(), m, right.getDate());
    else if (d !== null) target = new Date(right.getFullYear(), right.getMonth(), d);
    else return;
    setBaseYear(y !== null ? y : right.getFullYear());
    const newBase = new Date(target); newBase.setDate(target.getDate() - (dayCount - 1));
    setBase(newBase);
  };

  const handleJumpYearKey = (e) => {
    const cur = jumpYear ? parseInt(jumpYear) : curRight().getFullYear();
    if (e.key === 'ArrowUp') { e.preventDefault(); setJumpYear(String(cur + 1)); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setJumpYear(String(cur - 1)); }
    else if (e.key === 'Enter') handleJump();
  };
  const handleJumpMonthKey = (e) => {
    const cur = jumpMonth ? parseInt(jumpMonth) : curRight().getMonth() + 1;
    if (e.key === 'ArrowUp') { e.preventDefault(); setJumpMonth(String(Math.min(cur + 1, 12))); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setJumpMonth(String(Math.max(cur - 1, 1))); }
    else if (e.key === 'Enter') handleJump();
  };
  const handleJumpDayKey = (e) => {
    const cur = jumpDay ? parseInt(jumpDay) : curRight().getDate();
    if (e.key === 'ArrowUp') { e.preventDefault(); setJumpDay(String(Math.min(cur + 1, 31))); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setJumpDay(String(Math.max(cur - 1, 1))); }
    else if (e.key === 'Enter') handleJump();
  };

  const handleDayCountChange = (n) => {
    const right = curRight();
    const newBase = new Date(right); newBase.setDate(right.getDate() - (n - 1));
    setDayCount(n); setBase(newBase);
  };

  const formatRange = () => {
    const first = days[0], last = days[days.length - 1];
    if (dayCount === 1) return `${first.getMonth() + 1}月${first.getDate()}日`;
    return `${first.getMonth() + 1}/${first.getDate()} 〜 ${last.getMonth() + 1}/${last.getDate()}`;
  };

  const btnStyle = (active) => ({
    padding: isMobile ? '5px 7px' : '4px 10px', fontSize: '12px',
    border: `0.5px solid ${active ? theme.btnActiveBg : theme.btnBorder}`, borderRadius: '5px',
    cursor: 'pointer', fontWeight: '500',
    background: active ? theme.btnActiveBg : theme.headerBg,
    color: active ? theme.btnActiveColor : theme.btnColor,
  });

  const inputStyle = { padding: '4px 6px', fontSize: '12px', border: '0.5px solid #ccc', borderRadius: '5px', textAlign: 'center', outline: 'none', background: '#fff' };

  const calName = (ev) => { const cal = selectedCalendars.find(c => c.id === ev.calendarId); return cal ? cal.name : ''; };

  if (!user) return <LoginScreen onLogin={login} />;
  if (isLocked) return <LockScreen onUnlock={() => setIsLocked(false)} theme={theme} />;

  const jumpRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <input type="text" inputMode="numeric" placeholder="年" value={jumpYear} onChange={e => setJumpYear(e.target.value.replace(/[^0-9-]/g, ''))} onKeyDown={handleJumpYearKey} style={{ ...inputStyle, width: isMobile ? '58px' : '68px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <button onClick={() => { const cur = jumpYear ? parseInt(jumpYear) : curRight().getFullYear(); setJumpYear(String(cur + 1)); }} style={{ padding: '0 4px', fontSize: '9px', border: '0.5px solid #ccc', borderRadius: '3px', cursor: 'pointer', background: '#fff', color: '#555', lineHeight: '14px' }}>▲</button>
          <button onClick={() => { const cur = jumpYear ? parseInt(jumpYear) : curRight().getFullYear(); setJumpYear(String(cur - 1)); }} style={{ padding: '0 4px', fontSize: '9px', border: '0.5px solid #ccc', borderRadius: '3px', cursor: 'pointer', background: '#fff', color: '#555', lineHeight: '14px' }}>▼</button>
        </div>
      </div>
      <span style={{ fontSize: '11px', color: '#bbb' }}>年</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <input type="text" inputMode="numeric" placeholder="月" value={jumpMonth} onChange={e => setJumpMonth(e.target.value.replace(/[^0-9]/g, ''))} onKeyDown={handleJumpMonthKey} style={{ ...inputStyle, width: '42px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <button onClick={() => { const cur = jumpMonth ? parseInt(jumpMonth) : curRight().getMonth() + 1; setJumpMonth(String(Math.min(cur + 1, 12))); }} style={{ padding: '0 4px', fontSize: '9px', border: '0.5px solid #ccc', borderRadius: '3px', cursor: 'pointer', background: '#fff', color: '#555', lineHeight: '14px' }}>▲</button>
          <button onClick={() => { const cur = jumpMonth ? parseInt(jumpMonth) : curRight().getMonth() + 1; setJumpMonth(String(Math.max(cur - 1, 1))); }} style={{ padding: '0 4px', fontSize: '9px', border: '0.5px solid #ccc', borderRadius: '3px', cursor: 'pointer', background: '#fff', color: '#555', lineHeight: '14px' }}>▼</button>
        </div>
      </div>
      <span style={{ fontSize: '11px', color: '#bbb' }}>月</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <input type="text" inputMode="numeric" placeholder="日" value={jumpDay} onChange={e => setJumpDay(e.target.value.replace(/[^0-9]/g, ''))} onKeyDown={handleJumpDayKey} style={{ ...inputStyle, width: '42px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <button onClick={() => { const cur = jumpDay ? parseInt(jumpDay) : curRight().getDate(); setJumpDay(String(Math.min(cur + 1, 31))); }} style={{ padding: '0 4px', fontSize: '9px', border: '0.5px solid #ccc', borderRadius: '3px', cursor: 'pointer', background: '#fff', color: '#555', lineHeight: '14px' }}>▲</button>
          <button onClick={() => { const cur = jumpDay ? parseInt(jumpDay) : curRight().getDate(); setJumpDay(String(Math.max(cur - 1, 1))); }} style={{ padding: '0 4px', fontSize: '9px', border: '0.5px solid #ccc', borderRadius: '3px', cursor: 'pointer', background: '#fff', color: '#555', lineHeight: '14px' }}>▼</button>
        </div>
      </div>
      <span style={{ fontSize: '11px', color: '#bbb' }}>日</span>
      <button onClick={handleJump} style={{ ...btnStyle(false), padding: '4px 10px' }}>移動</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: 'Hiragino Sans, Meiryo, sans-serif', padding: isMobile ? '8px' : '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: isMobile ? '8px 10px' : '10px 14px', background: theme.headerBg, borderRadius: '8px', border: `0.5px solid ${theme.headerBorder}`, gap: '8px', flexWrap: 'wrap' }}>
        {/* タイトルロゴ */}
        <div ref={viewMenuRef} style={{ flexShrink: 0, marginRight: '8px', position: 'relative' }}>
          <div onClick={() => setShowViewMenu(o => !o)} style={{ cursor: 'pointer', userSelect: 'none' }}>
            {!isMobile && <div style={{ fontSize: '9px', letterSpacing: '.2em', color: theme.monthColor, textTransform: 'uppercase', lineHeight: 1 }}>Multi Year</div>}
            <div style={{ fontSize: isMobile ? '13px' : '16px', fontWeight: '600', color: theme.dateColor, fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>{yearCount}年日記 ▾</div>
          </div>
          {showViewMenu && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', background: '#fff', border: '0.5px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 1000, padding: '12px 16px', minWidth: '160px' }}>
              <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '8px', letterSpacing: '.1em' }}>表示設定</div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>年数</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(isPremium ? [3, 5] : [3]).map(n => (
                    <button key={n} onClick={() => {
                      setYearCount(n);
                      const newSettings = { ...settings, defaultYearCount: n };
                      setSettings(newSettings);
                      localStorage.setItem('myd_settings', JSON.stringify(newSettings));
                      if (n === 5 && dayCount > 2) handleDayCountChange(2);
                    }}
                      style={{ padding: '4px 12px', border: `0.5px solid ${yearCount === n ? theme.btnActiveBg : theme.btnBorder}`, borderRadius: '5px', cursor: 'pointer', fontSize: '13px', background: yearCount === n ? theme.btnActiveBg : '#fff', color: yearCount === n ? theme.btnActiveColor : theme.btnColor }}>
                      {n}年
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>日数</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2].map(n => (
                    <button key={n} onClick={() => {
                      handleDayCountChange(n);
                      const newSettings = { ...settings, defaultDayCount: n };
                      setSettings(newSettings);
                      localStorage.setItem('myd_settings', JSON.stringify(newSettings));
                    }}
                      style={{ padding: '4px 12px', border: `0.5px solid ${dayCount === n ? theme.btnActiveBg : theme.btnBorder}`, borderRadius: '5px', cursor: 'pointer', fontSize: '13px', background: dayCount === n ? theme.btnActiveBg : '#fff', color: dayCount === n ? theme.btnActiveColor : theme.btnColor }}>
                      {n}日
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => navigate(-1)} style={btnStyle(false)}>◀</button>
            <span style={{ fontSize: '12px', color: '#888', minWidth: isMobile ? '70px' : '96px', textAlign: 'center' }}>{formatRange()}</span>
            <button onClick={goToday} style={btnStyle(false)}>今日</button>
            <button onClick={() => navigate(1)} style={btnStyle(false)}>▶</button>
          </div>
          {!isMobile && jumpRow}
        </div>
        <UserMenu user={user} onSettingsOpen={() => setShowSettings(true)} onLogout={() => { setUser(null); setCalendars([]); setSelectedCalendars([]); setTokenExpired(false); localStorage.removeItem('myd_user'); }} />
      </div>

      {showSettings && <SettingsPanel
        settings={settings}
        onChange={setSettings}
        onClose={() => setShowSettings(false)}
        calendars={calendars}
        selectedCalendars={selectedCalendars}
        onCalendarToggle={handleCalendarToggle}
        onYearCountChange={setYearCount}
        onDayCountChange={handleDayCountChange}
        onDescriptionToggle={(id) => {
          setSelectedCalendars(prev => prev.map(c => c.id === id ? { ...c, showDescription: !c.showDescription } : c));
        }}
        onPinSetup={() => { setShowSettings(false); setShowPinSetup(true); }}
        isPremium={isPremium}
      />}
      {showPinSetup && <PinSetupScreen onComplete={() => { setShowPinSetup(false); setIsLocked(true); }} onCancel={() => setShowPinSetup(false)} />}

      {selectedEvent && <EventModal event={selectedEvent} calendarName={calName(selectedEvent)} onClose={() => setSelectedEvent(null)} />}
      {tokenExpired && <LoginScreen onLogin={login} />}


      {isMobile && (
        <div style={{ marginBottom: '8px', padding: '8px 10px', background: theme.headerBg, borderRadius: '8px', border: `0.5px solid ${theme.headerBorder}` }}>
          {jumpRow}
        </div>
      )}

      <div {...(isMobile ? swipeHandlers : {})} style={{ display: 'flex', border: '0.5px solid #ccc', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transform: animating ? `translateX(${slideDir > 0 ? '-30px' : '30px'})` : 'translateX(0)', opacity: animating ? 0 : 1, transition: 'transform 0.15s ease, opacity 0.15s ease' }}>
        {days.map((d, i) => (
          <DayPage key={i} date={d} yearCount={yearCount} baseYear={baseYear}
            fontSize={settings.fontSize} isLast={i === days.length - 1}
            accessToken={user.accessToken} selectedCalendars={selectedCalendars}
            isMobile={isMobile} onEventClick={setSelectedEvent}
            onTokenExpired={() => setTokenExpired(true)}
            theme={theme} />
        ))}
      </div>


      {tokenExpired && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px 24px', width: '100%', maxWidth: '320px', textAlign: 'center', border: '0.5px solid #ddd' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏰</div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>セッションが切れました</div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>再度ログインしてください</div>
            <button
              onClick={() => { setUser(null); setCalendars([]); setSelectedCalendars([]); setTokenExpired(false); localStorage.removeItem('myd_user'); }}
              style={{ width: '100%', padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
            >
              ログイン画面へ
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)}
          calendars={calendars} selectedCalendars={selectedCalendars} onCalendarToggle={handleCalendarToggle}
          onYearCountChange={setYearCount} onDayCountChange={handleDayCountChange}
          onDescriptionToggle={(calId) => {
            setSelectedCalendars(prev => prev.map(c =>
              c.id === calId ? { ...c, showDescription: !c.showDescription } : c
            ));
          }}
          onPinSetup={() => { setShowSettings(false); setShowPinSetup(true); }} isPremium={isPremium} />
      )}

      {selectedEvent && (
        <EventModal event={selectedEvent} calendarName={calName(selectedEvent)} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

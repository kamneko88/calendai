import { useState, useEffect, useRef } from "react";

export default function UserMenu({ user, onSettingsOpen, onLogout }) {
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
              style={{ width: '100%', padding: '8px 10px', textAlign: 'left', fontSize: '13px', color: '#333', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              ⚙️ 設定
            </button>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              style={{ width: '100%', padding: '8px 10px', textAlign: 'left', fontSize: '13px', color: '#e74c3c', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
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
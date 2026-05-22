import { useState, useEffect } from "react";

export default function LoginScreen({ onLogin }) {
  const [agreed, setAgreed] = useState(false);
  const [visible, setVisible] = useState(false);
  const gBlue   = agreed ? "#4285F4" : "rgba(255,255,255,0.6)";
  const gGreen  = agreed ? "#34A853" : "rgba(255,255,255,0.6)";
  const gYellow = agreed ? "#FBBC05" : "rgba(255,255,255,0.6)";
  const gRed    = agreed ? "#EA4335" : "rgba(255,255,255,0.6)";

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#9e6b50',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Hiragino Sans, Meiryo, sans-serif',
      padding: '40px 32px',
      opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease',
    }}>
      <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="CalenDai"
        style={{ width: '88px', height: '88px', borderRadius: '18px', marginBottom: '20px' }} />

      <div style={{ fontSize: '22px', fontWeight: '600', color: '#fdfaf5', marginBottom: '40px', letterSpacing: '.02em' }}>
        CalenDaiへようこそ
      </div>

      <button onClick={() => { if (agreed) onLogin(); }}
        style={{
          width: '100%', maxWidth: '280px', padding: '13px 20px',
          background: agreed ? '#fff' : 'rgba(255,255,255,0.4)',
          border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
          color: agreed ? '#333' : 'rgba(255,255,255,0.7)',
          cursor: agreed ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          transition: 'all 0.2s', marginBottom: '14px',
        }}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill={gBlue}   d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
          <path fill={gGreen}  d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
          <path fill={gYellow} d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
          <path fill={gRed}    d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" />
        </svg>
        Googleでログイン
      </button>

      <div style={{ fontSize: '12px', color: 'rgba(253,250,245,0.75)', textAlign: 'left', lineHeight: 1.8, marginBottom: '48px', maxWidth: '280px' }}>
        CalenDaiのご使用にはGoogleアカウントへのログインが必要です
      </div>

      <div style={{ maxWidth: '280px', width: '100%' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            style={{ width: '14px', height: '14px', marginTop: '3px', flexShrink: 0, cursor: 'pointer' }} />
          <div style={{ fontSize: '11px', color: 'rgba(253,250,245,0.85)', lineHeight: 1.8, textAlign: 'left' }}>
            <a href="https://suneight-okayama.jp/privacy/calendai/"
              target="_blank" rel="noopener noreferrer"
              style={{ color: '#fdfaf5', textDecoration: 'underline' }}>
              プライバシーポリシー
            </a>
            に同意してログインします。カレンダーデータはGoogleのサーバーとお使いのデバイス間で直接やり取りされます。CalenDaiのサーバーには保存されません。
          </div>
        </label>
      </div>
    </div>
  );
}
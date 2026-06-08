import { useState } from "react";
import { Lock } from 'lucide-react';

export default function LockScreen({ onUnlock, onReset, theme = {} }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const panelBg = theme.pageBg || '#fdfaf5';
  const panelBorder = theme.pageBorder || '#ddd';
  const outerBg = theme.bg || '#f0ebe0';
  const labelColor = theme.dateColor || '#333';
  const subLabelColor = theme.subColor || '#aaa';
  const btnBg = theme.headerBg || '#fff';
  const btnBorder = theme.btnBorder || '#ddd';
  const btnColor = theme.btnColor || '#333';

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
    <div style={{ minHeight: '100vh', background: outerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Hiragino Sans, Meiryo, sans-serif', animation: 'calFadeIn 0.35s ease' }}>
      <div style={{ background: panelBg, borderRadius: '16px', padding: '40px 32px', width: '320px', border: `0.5px solid ${panelBorder}`, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
          <Lock size={28} strokeWidth={1.5} color={labelColor} />
        </div>
        <div style={{ fontSize: '15px', fontWeight: '500', color: labelColor, marginBottom: '6px' }}>かれんだい CalenDai</div>
        <div style={{ fontSize: '12px', color: subLabelColor, marginBottom: '28px' }}>PINを入力してください</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: i < pin.length ? (error ? '#e74c3c' : labelColor) : 'transparent',
              border: `2px solid ${error ? '#e74c3c' : i < pin.length ? labelColor : btnBorder}`,
              transition: 'all 0.1s'
            }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '220px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handleInput(String(n))}
              style={{ padding: '16px', fontSize: '18px', fontWeight: '400', border: `0.5px solid ${btnBorder}`, borderRadius: '10px', cursor: 'pointer', background: btnBg, color: btnColor, transition: 'opacity 0.1s' }}
              onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
              onMouseUp={e => e.currentTarget.style.opacity = '1'}>
              {n}
            </button>
          ))}
          <div />
          <button onClick={() => handleInput('0')}
            style={{ padding: '16px', fontSize: '18px', fontWeight: '400', border: `0.5px solid ${btnBorder}`, borderRadius: '10px', cursor: 'pointer', background: btnBg, color: btnColor }}
            onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
            onMouseUp={e => e.currentTarget.style.opacity = '1'}>
            0
          </button>
          <button onClick={handleDelete}
            style={{ padding: '16px', fontSize: '16px', border: `0.5px solid ${btnBorder}`, borderRadius: '10px', cursor: 'pointer', background: btnBg, color: subLabelColor }}>
            ⌫
          </button>
        </div>
        {error && <div style={{ marginTop: '16px', fontSize: '12px', color: '#e74c3c' }}>PINが違います</div>}
        <button
          onClick={() => onReset()}
          style={{ marginTop: '24px', fontSize: '11px', color: subLabelColor, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          PINを忘れた場合
        </button>
      </div>
    </div>
  );
}

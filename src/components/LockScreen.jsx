import { useState } from "react";
export default function LockScreen({ onUnlock }) {
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
import { useState } from "react";
import { Lock } from 'lucide-react';
import { useModalAnimation } from "../hooks";

export default function PinSetupScreen({ onComplete, onCancel, theme = {} }) {
  const { close, overlayAnim, contentAnim } = useModalAnimation(onCancel);
  const panelBg = theme.pageBg || '#fdfaf5';
  const panelBorder = theme.pageBorder || '#ddd';
  const labelColor = theme.dateColor || '#333';
  const subLabelColor = theme.subColor || '#aaa';
  const btnBg = theme.headerBg || '#fff';
  const btnBorder = theme.btnBorder || '#ddd';
  const btnColor = theme.btnColor || '#333';
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
          const existingPin = localStorage.getItem('myd_pin');
          if (existingPin && existingPin === newPin) {
            onComplete('same');
          } else {
            localStorage.setItem('myd_pin', newPin);
            onComplete(existingPin ? 'changed' : 'new');
          }
        } else {
          setError(true);
          setTimeout(() => { setPin(''); setError(false); setStep(1); setFirstPin(''); }, 800);
        }
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', ...overlayAnim }}
      onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div style={{ background: panelBg, borderRadius: '16px', padding: '40px 32px', width: '320px', border: `0.5px solid ${panelBorder}`, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', ...contentAnim }}>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
          <Lock size={26} strokeWidth={1.5} color={step === 2 ? '#3B82F6' : labelColor} />
        </div>
        <div style={{ fontSize: '15px', fontWeight: '500', color: labelColor, marginBottom: '6px' }}>
          {step === 1 ? '新しいPINを入力' : 'もう一度入力して確認'}
        </div>
        <div style={{ fontSize: '11px', color: subLabelColor, marginBottom: '24px' }}>4桁の数字を入力してください</div>
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
              style={{ padding: '16px', fontSize: '18px', border: `0.5px solid ${btnBorder}`, borderRadius: '10px', cursor: 'pointer', background: btnBg, color: btnColor }}
              onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
              onMouseUp={e => e.currentTarget.style.opacity = '1'}>
              {n}
            </button>
          ))}
          <div />
          <button onClick={() => handleInput('0')}
            style={{ padding: '16px', fontSize: '18px', border: `0.5px solid ${btnBorder}`, borderRadius: '10px', cursor: 'pointer', background: btnBg, color: btnColor }}
            onMouseDown={e => e.currentTarget.style.opacity = '0.7'}
            onMouseUp={e => e.currentTarget.style.opacity = '1'}>
            0
          </button>
          <button onClick={handleDelete}
            style={{ padding: '16px', fontSize: '16px', border: `0.5px solid ${btnBorder}`, borderRadius: '10px', cursor: 'pointer', background: btnBg, color: subLabelColor }}>
            ⌫
          </button>
        </div>
        <button onClick={close}
          style={{ display: 'block', width: '100%', maxWidth: '220px', margin: '10px auto 0', padding: '12px', fontSize: '13px', border: `0.5px solid ${btnBorder}`, borderRadius: '10px', cursor: 'pointer', background: btnBg, color: subLabelColor }}>
          キャンセル
        </button>
        {error && <div style={{ marginTop: '16px', fontSize: '12px', color: '#e74c3c' }}>PINが一致しません。最初からやり直してください</div>}
      </div>
    </div>
  );
}
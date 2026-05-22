import { useState, useEffect } from "react";
import { THEMES } from "../constants";

export default function WelcomeScreen({ years, startYear, isFirst, skipWelcome, onSkipChange, onStart, theme }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);
  const t = theme || THEMES.classic;

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: '30vh',
      justifyContent: 'center',
      fontFamily: 'Hiragino Sans, Meiryo, sans-serif',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      <div style={{ width: '260px', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: t.monthColor, marginBottom: '16px', letterSpacing: '.05em' }}>
            あなたには
          </div>
          <div style={{ fontSize: '36px', fontWeight: '300', color: t.dateColor, fontFamily: 'Georgia, serif', lineHeight: 1.2, marginBottom: '4px' }}>
            {years}年分
          </div>
          <div style={{ fontSize: '13px', color: t.monthColor, letterSpacing: '.05em' }}>
            の記録があります
          </div>
          {isFirst && startYear && (
            <div style={{ marginTop: '24px', fontSize: '12px', color: t.subColor, lineHeight: 2, letterSpacing: '.05em' }}>
              <div>{startYear}年から始まった</div>
              <div>あなたのカレンダーが</div>
              <div>かれんだいになりました</div>
            </div>
          )}
        </div>
        <button onClick={onStart} style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: `1px solid ${t.dateColor}`,
          background: t.pageBg,
          cursor: 'pointer',
          fontSize: '13px',
          color: t.dateColor,
          letterSpacing: '.1em',
          marginBottom: '24px',
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          はじめる
        </button>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
          <input type="checkbox" checked={!skipWelcome}
            onChange={e => onSkipChange(!e.target.checked)}
            style={{ width: '12px', height: '12px' }} />
          <span style={{ fontSize: '11px', color: t.subColor }}>ログイン時にこの画面を表示する</span>
        </label>
      </div>
    </div>
  );
}
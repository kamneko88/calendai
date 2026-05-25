import { APP_VERSION } from '../constants';
import { X } from 'lucide-react';

export default function AboutPanel({ theme, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.pageBg,
        borderRadius: '16px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '320px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
        border: `0.5px solid ${theme.pageBorder}`,
        textAlign: 'center',
      }}>
        {/* 閉じるボタン */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: theme.subColor, padding: '4px',
        }}>
          <X size={18} />
        </button>

        {/* アイコン */}
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>📖</div>

        {/* アプリ名 */}
        <div style={{ fontSize: '22px', fontWeight: '600', color: theme.dateColor, letterSpacing: '.04em' }}>
          CalenDai
        </div>
        <div style={{ fontSize: '11px', color: theme.monthColor, letterSpacing: '.1em', marginTop: '2px' }}>
          Calendar Diary
        </div>

        {/* バージョン */}
        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: theme.currentRowBg,
          borderRadius: '8px',
          border: `0.5px solid ${theme.rowBorder}`,
        }}>
          <span style={{ fontSize: '12px', color: theme.subColor }}>Version </span>
          <span style={{ fontSize: '12px', color: theme.dateColor, fontWeight: '500', fontFamily: 'monospace' }}>{APP_VERSION}</span>
        </div>

        {/* リンク */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a href="https://suneight-okayama.jp/privacy/calendai/"
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: theme.currentYearColor, textDecoration: 'none' }}>
            プライバシーポリシー
          </a>
          <a href="https://suneight-okayama.jp/terms/calendai/"
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: theme.currentYearColor, textDecoration: 'none' }}>
            利用規約
          </a>
        </div>

        {/* 閉じるボタン */}
        <button onClick={onClose} style={{
          width: '100%', marginTop: '24px',
          padding: '11px',
          background: theme.btnActiveBg, color: theme.btnActiveColor,
          border: 'none', borderRadius: '8px',
          fontSize: '13px', cursor: 'pointer', fontWeight: '500',
        }}>
          閉じる
        </button>
      </div>
    </div>
  );
}
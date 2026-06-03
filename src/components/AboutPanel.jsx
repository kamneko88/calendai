import { APP_VERSION } from '../constants';
import { X } from 'lucide-react';
import { useModalAnimation } from '../hooks';
import appIcon from '../assets/icon-192.png';

export default function AboutPanel({ theme, onClose }) {
  const { close, overlayAnim, contentAnim } = useModalAnimation(onClose);
  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      ...overlayAnim,
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
        ...contentAnim,
      }}>
        {/* 閉じるボタン */}
        <button onClick={close} style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: theme.subColor, padding: '4px',
        }}>
          <X size={18} />
        </button>

        {/* アイコン */}
        <div style={{ marginBottom: '12px' }}>
          <img src={appIcon} alt="CalenDai" style={{ width: '72px', height: '72px', borderRadius: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }} />
        </div>

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
          <a href="https://suneight-okayama.jp/kamneko/privacy/calendai/"
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: theme.currentYearColor, textDecoration: 'none' }}>
            プライバシーポリシー
          </a>
          <a href="https://suneight-okayama.jp/kamneko/terms/calendai/"
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: theme.currentYearColor, textDecoration: 'none' }}>
            利用規約
          </a>
        </div>

        {/* 閉じるボタン */}
        <button onClick={close} style={{
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

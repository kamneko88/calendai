import { useModalAnimation } from '../hooks';

export default function TodayInPastBanner({ data, today, theme, onClose }) {
  const { close, overlayAnim, contentAnim } = useModalAnimation(onClose);
  const currentYear = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const pastEvents = Array.isArray(data) ? data : (data.pastEvents || []);
  const anniversaries = Array.isArray(data) ? [] : (data.anniversaries || []);

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        ...overlayAnim,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.pageBg,
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '360px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          border: `0.5px solid ${theme.pageBorder}`,
          ...contentAnim,
        }}
      >
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '30px', marginBottom: '8px' }}>📖</div>
          <div style={{ fontSize: '10px', letterSpacing: '.18em', color: theme.monthColor, marginBottom: '6px', textTransform: 'uppercase' }}>
            Today in History
          </div>
          <div style={{ fontSize: '19px', fontWeight: '600', color: theme.dateColor }}>
            {month}月{day}日の記録
          </div>
          <div style={{ fontSize: '11px', color: theme.subColor, marginTop: '4px' }}>
            過去の同じ日のできごと
          </div>
        </div>

        {/* 記念日セクション */}
        {anniversaries.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '.1em', color: theme.monthColor, marginBottom: '8px', textTransform: 'uppercase' }}>
              🎂 Anniversary
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {anniversaries.map((ann, i) => (
                <div key={i} style={{
                  background: theme.currentRowBg,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: `0.5px solid ${theme.rowBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ fontSize: '13px', color: theme.eventColor, fontWeight: '500' }}>
                    {ann.title}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: theme.currentYearColor, flexShrink: 0, marginLeft: '12px' }}>
                    {ann.years}周年 🎉
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 過去イベントセクション */}
        {pastEvents.length > 0 && (
          <div>
            {anniversaries.length > 0 && (
              <div style={{ fontSize: '10px', letterSpacing: '.1em', color: theme.monthColor, marginBottom: '8px', textTransform: 'uppercase' }}>
                📅 Past Events
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pastEvents.map(({ year, events }) => (
                <div key={year} style={{
                  background: theme.currentRowBg,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: `0.5px solid ${theme.rowBorder}`,
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700',
                    color: theme.currentYearColor,
                    letterSpacing: '.06em',
                    marginBottom: '8px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <span>{year}年</span>
                    <span style={{ fontSize: '10px', fontWeight: '500', color: theme.subColor, fontFamily: 'monospace' }}>
                      {currentYear - year}年前
                    </span>
                  </div>
                  {events.map((ev, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                      paddingTop: i > 0 ? '7px' : '0',
                      marginTop: i > 0 ? '7px' : '0',
                      borderTop: i > 0 ? `0.5px solid ${theme.rowBorder}` : 'none',
                    }}>
                      <div style={{ fontSize: '10px', color: theme.subColor, flexShrink: 0, paddingTop: '2px', minWidth: '34px' }}>
                        {ev.h === '終日' ? '終日' : ev.h}
                      </div>
                      <div style={{ fontSize: '13px', color: theme.eventColor, lineHeight: 1.45, flex: 1 }}>
                        {ev.t}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 閉じるボタン */}
        <button
          onClick={close}
          style={{
            width: '100%', marginTop: '18px',
            padding: '11px',
            background: theme.btnActiveBg, color: theme.btnActiveColor,
            border: 'none', borderRadius: '8px',
            fontSize: '13px', cursor: 'pointer', fontWeight: '500',
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { fetchYearEvents } from "../api";
import { WDS } from "../constants";
import { useModalAnimation } from "../hooks";

const MONTHS_JA = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

export default function AnniversaryTab({ accessToken, calendars, anniversaryCalendarId, currentYear, onJump, onClose, theme }) {
  const { close, overlayAnim, contentAnim } = useModalAnimation(onClose);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState(null);

  const annivCal = calendars?.find(c => c.id === anniversaryCalendarId) || null;

  useEffect(() => {
    if (!accessToken || !anniversaryCalendarId) { setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const evs = await fetchYearEvents(accessToken, anniversaryCalendarId, currentYear);
      if (cancelled) return;
      const colored = evs.map(ev => ({ ...ev, color: annivCal?.backgroundColor || '#c0607a' }));
      setEvents(colored.sort((a, b) => a.date.localeCompare(b.date)));
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [accessToken, anniversaryCalendarId, currentYear]);

  const grouped = {};
  events.forEach(ev => {
    const month = parseInt(ev.date.slice(5, 7)) - 1;
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(ev);
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', ...overlayAnim }}
      onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div style={{ background: theme.pageBg, borderRadius: '12px', width: '100%', maxWidth: '420px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: `0.5px solid ${theme.pageBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', ...contentAnim }}>

        {/* ヘッダー */}
        <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${theme.rowBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '8px', letterSpacing: '.2em', color: theme.monthColor, textTransform: 'uppercase' }}>ANNIVERSARY</div>
            <div style={{ fontSize: '16px', fontWeight: '300', color: theme.dateColor, fontFamily: 'Georgia, serif' }}>記念日一覧</div>
            {annivCal && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: annivCal.backgroundColor || '#c0607a' }} />
                <span style={{ fontSize: '10px', color: theme.subColor }}>{annivCal.summary}</span>
              </div>
            )}
          </div>
          <button onClick={close} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.subColor, lineHeight: 1 }}>×</button>
        </div>

        {/* リスト */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {!anniversaryCalendarId ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: theme.subColor, marginBottom: '8px' }}>記念日カレンダーが未設定です</div>
              <div style={{ fontSize: '11px', color: theme.emptyColor }}>設定 → 記念日カレンダーから選択してください</div>
            </div>
          ) : loading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: theme.subColor }}>読込中…</div>
          ) : events.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: theme.subColor, marginBottom: '8px' }}>記念日が見つかりません</div>
              <div style={{ fontSize: '11px', color: theme.emptyColor }}>選択中のカレンダーに終日イベントを追加してください</div>
            </div>
          ) : (
            Object.entries(grouped).map(([monthIdx, evs]) => (
              <div key={monthIdx}>
                <div style={{ padding: '8px 18px 4px', fontSize: '10px', fontWeight: '600', color: theme.monthColor, letterSpacing: '.1em', borderBottom: `0.5px solid ${theme.rowBorder}` }}>
                  {MONTHS_JA[parseInt(monthIdx)]}
                </div>
                {evs.map((ev, i) => {
                  const key = `${monthIdx}-${i}`;
                  const isExpanded = expandedKey === key;
                  const d = new Date(ev.date + 'T00:00:00');
                  const day = d.getDate();
                  const wd = WDS[d.getDay()];
                  const isWe = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div key={i} style={{ borderBottom: `0.5px solid ${theme.rowBorder}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px' }}>
                        {/* 日付 */}
                        <div style={{ width: '40px', flexShrink: 0, textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '300', color: isWe ? theme.weekendColor : theme.dateColor, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{day}</div>
                          <div style={{ fontSize: '9px', color: isWe ? theme.weekendColor : theme.subColor }}>{wd}</div>
                        </div>
                        {/* タイトル（タップで説明欄展開） */}
                        <div onClick={() => ev.description && setExpandedKey(isExpanded ? null : key)}
                          style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', cursor: ev.description ? 'pointer' : 'default' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                          <div style={{ fontSize: '13px', color: theme.eventColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ev.t}</div>
                          {ev.description && (
                            <span style={{ fontSize: '10px', color: theme.subColor, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
                          )}
                        </div>
                        {/* ジャンプボタン */}
                        <button
                          onClick={() => { onJump(d.getMonth() + 1, day); close(); }}
                          style={{ flexShrink: 0, padding: '4px 10px', fontSize: '11px', border: `0.5px solid ${theme.btnBorder}`, borderRadius: '5px', cursor: 'pointer', background: theme.headerBg, color: theme.btnColor, whiteSpace: 'nowrap' }}
                          onMouseEnter={e => e.currentTarget.style.background = theme.currentRowBg}
                          onMouseLeave={e => e.currentTarget.style.background = theme.headerBg}>
                          この日へ
                        </button>
                      </div>
                      {/* 説明欄（展開時） */}
                      {isExpanded && ev.description && (
                        <div style={{ margin: '0 18px 10px', padding: '10px 12px', background: theme.currentRowBg, borderRadius: '6px', fontSize: '12px', color: theme.eventColor, lineHeight: 1.7, whiteSpace: 'pre-wrap', borderLeft: `3px solid ${ev.color}` }}>
                          {ev.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
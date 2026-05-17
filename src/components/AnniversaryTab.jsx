import { useState, useEffect } from "react";
import { fetchYearEvents } from "../api";
import { WDS } from "../constants";

const MONTHS_JA = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

export default function AnniversaryTab({ accessToken, calendars, anniversaryCalendarId, currentYear, onJump, onClose, theme }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 選択中の記念日カレンダー情報
  const annivCal = calendars?.find(c => c.id === anniversaryCalendarId) || null;

  useEffect(() => {
    if (!accessToken || !anniversaryCalendarId) { setLoading(false); return; }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const evs = await fetchYearEvents(accessToken, anniversaryCalendarId, currentYear);
      if (cancelled) return;
      const colored = evs.map(ev => ({
        ...ev,
        color: annivCal?.backgroundColor || '#c0607a',
      }));
      setEvents(colored.sort((a, b) => a.date.localeCompare(b.date)));
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [accessToken, anniversaryCalendarId, currentYear]);

  // 月ごとにグループ化
  const grouped = {};
  events.forEach(ev => {
    const month = parseInt(ev.date.slice(5, 7)) - 1;
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(ev);
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: theme.pageBg, borderRadius: '12px', width: '100%', maxWidth: '420px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: `0.5px solid ${theme.pageBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>

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
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.subColor, lineHeight: 1 }}>×</button>
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
                  const d = new Date(ev.date + 'T00:00:00');
                  const day = d.getDate();
                  const wd = WDS[d.getDay()];
                  const isWe = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderBottom: `0.5px solid ${theme.rowBorder}` }}>
                      <div style={{ width: '40px', flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '300', color: isWe ? theme.weekendColor : theme.dateColor, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{day}</div>
                        <div style={{ fontSize: '9px', color: isWe ? theme.weekendColor : theme.subColor }}>{wd}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', color: theme.eventColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.t}</div>
                      </div>
                      <button
                        onClick={() => { onJump(d.getMonth() + 1, day); onClose(); }}
                        style={{ flexShrink: 0, padding: '4px 10px', fontSize: '11px', border: `0.5px solid ${theme.btnBorder}`, borderRadius: '5px', cursor: 'pointer', background: theme.headerBg, color: theme.btnColor, whiteSpace: 'nowrap' }}
                        onMouseEnter={e => e.currentTarget.style.background = theme.currentRowBg}
                        onMouseLeave={e => e.currentTarget.style.background = theme.headerBg}>
                        この日へ
                      </button>
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
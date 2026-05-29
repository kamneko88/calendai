import { useState, useEffect } from "react";
import { WDS, FS } from "../constants";
import { fetchCalendarEvents } from "../api";
import DiaryModal from "./DiaryModal";

export default function DayPage({ date, yearCount, baseYear, fontSize, isLast, accessToken, selectedCalendars, anniversaryCalendarId, isPremium, isMobile, onEventClick, onTokenExpired, tokenExpired, theme }) {
  const mo = date.getMonth();
  const dy = date.getDate();
  const wd = date.getDay();
  const isWe = wd === 0 || wd === 6;
  const isSat = wd === 6;
  const dayColor = isSat ? theme.saturdayColor : isWe ? theme.weekendColor : theme.dateColor;
  const daySubColor = isSat ? theme.saturdayColor : isWe ? theme.weekendColor : theme.subColor;
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const fs = FS[fontSize];
  const years = Array.from({ length: yearCount }, (_, i) => baseYear - i);
  const [eventsMap, setEventsMap] = useState({});
  const [loadingYears, setLoadingYears] = useState({});
  const [anniversaryEvents, setAnniversaryEvents] = useState([]);
  const [expandedAnniv, setExpandedAnniv] = useState(null);
  const [diaryModal, setDiaryModal] = useState({ show: false, year: null });
  const [refreshKey, setRefreshKey] = useState(0);

  const MONTHS_EN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  useEffect(() => {
    if (!accessToken || selectedCalendars.length === 0) return;
    if (tokenExpired) return;
    let cancelled = false;
    setEventsMap({});
    const initialLoading = {};
    years.forEach(y => { initialLoading[y] = true; });
    setLoadingYears(initialLoading);

    years.forEach(async (y) => {
      const allEvs = await Promise.all(
        selectedCalendars.map(cal =>
          fetchCalendarEvents(accessToken, cal.id, y, mo + 1, dy, onTokenExpired)
            .then(evs => evs.map(ev => ({ ...ev, color: cal.color })))
        )
      );
      if (cancelled) return;
      const merged = allEvs.flat().sort((a, b) => a.h.localeCompare(b.h));
      setEventsMap(prev => ({ ...prev, [y]: merged }));
      setLoadingYears(prev => ({ ...prev, [y]: false }));
    });

    return () => { cancelled = true; };
  }, [accessToken, mo, dy, yearCount, baseYear, selectedCalendars, refreshKey]);

  useEffect(() => {
    if (!accessToken || !anniversaryCalendarId) { setAnniversaryEvents([]); return; }
    if (tokenExpired) return;
    let cancelled = false;
    fetchCalendarEvents(accessToken, anniversaryCalendarId, today.getFullYear(), mo + 1, dy, onTokenExpired)
      .then(evs => { if (!cancelled) setAnniversaryEvents(evs.filter(ev => ev.isAllDay)); });
    return () => { cancelled = true; };
  }, [accessToken, anniversaryCalendarId, mo, dy]);

  return (
    <div style={{ flex: 1, padding: isMobile ? '10px' : '14px 16px', borderRight: isLast ? 'none' : `2px solid ${theme.pageBorder}`, minWidth: 0, background: theme.pageBg }}>
      <div style={{ paddingBottom: '8px', borderBottom: `1.5px solid ${theme.pageHeaderBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: isMobile ? '32px' : '40px' }}>
            <div style={{ fontSize: `${isMobile ? fs.date * 1.4 : fs.date * 1.6}px`, fontWeight: '300', color: dayColor, fontFamily: 'Georgia, serif', lineHeight: 1 }}>{dy}</div>
            <div style={{ fontSize: '9px', color: daySubColor, marginTop: '2px', whiteSpace: 'nowrap' }}>{WDS[wd]}曜日</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: '2px', minWidth: isMobile ? '44px' : '52px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ fontSize: '9px', color: theme.monthColor, letterSpacing: '.05em' }}>{mo + 1}月</span>
              <span style={{ fontSize: '8px', color: theme.monthColor, letterSpacing: '.1em' }}>{MONTHS_EN[mo].slice(0, 3)}</span>
            </div>
            {isToday && (
              <span style={{ fontSize: '8px', background: theme.todayBadgeBg, color: theme.todayBadgeColor, borderRadius: '3px', padding: '0 4px', lineHeight: 1.8, marginTop: '2px', whiteSpace: 'nowrap' }}>TODAY</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: '2px', flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '8px', letterSpacing: '.14em', color: theme.monthColor, marginBottom: '3px' }}>ANNIVERSARY</div>
            {anniversaryEvents.length > 0 ? (
              anniversaryEvents.map((ev, i) => (
                <div key={i} style={{ minWidth: 0, width: '100%' }}>
                  <div onClick={() => ev.description && setExpandedAnniv(expandedAnniv === i ? null : i)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, cursor: ev.description ? 'pointer' : 'default' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#c0607a', flexShrink: 0 }} />
                    <div style={{ fontSize: '10px', color: theme.eventColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ev.t}</div>
                    {ev.description && <span style={{ fontSize: '8px', color: theme.subColor, flexShrink: 0 }}>{expandedAnniv === i ? '▲' : '▼'}</span>}
                  </div>
                  {expandedAnniv === i && ev.description && (
                    <div style={{ fontSize: '10px', color: theme.subColor, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginTop: '3px', paddingLeft: '8px', borderLeft: '2px solid #c0607a' }}>{ev.description}</div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '9px', color: theme.emptyColor }}>—</div>
            )}
          </div>
        </div>
        {!isMobile && <div style={{ fontSize: '11px', color: theme.emptyColor, fontStyle: 'italic', minHeight: '10px', borderTop: `0.5px dashed ${theme.rowBorder}`, paddingTop: '3px', marginTop: '4px' }} />}
      </div>

      {years.map(y => {
        const pd = new Date(y, mo, dy);
        const pwd = WDS[pd.getDay()];
        const isCur = y === baseYear;
        const evs = eventsMap[y] || [];
        return (
          <div key={y} style={{ display: 'flex', minHeight: `${isMobile ? fs.rowMin * 0.85 : fs.rowMin}px`, borderBottom: `0.5px solid ${theme.rowBorder}`, background: isCur ? theme.currentRowBg : 'transparent', margin: isCur ? '0 -4px' : '0', padding: isCur ? '8px 4px' : '8px 0', borderRadius: isCur ? '4px' : '0' }}>

            {/* 左：年・曜日・✏アイコン（PRO・baseYearのみタップ可） */}
            <div
              onClick={() => isPremium && isCur && setDiaryModal({ show: true, year: y })}
              style={{ width: isMobile ? '46px' : '64px', flexShrink: 0, paddingRight: '8px', paddingTop: '1px', cursor: isPremium && isCur ? 'pointer' : 'default' }}>
              <span style={{ fontSize: `${isMobile ? fs.yearNum * 0.85 : fs.yearNum}px`, fontWeight: '500', color: isCur ? theme.currentYearColor : theme.pastYearColor, display: 'block', fontFamily: 'monospace' }}>{y}</span>
              <span style={{ fontSize: '9px', color: theme.subColor, display: 'block', marginTop: '2px' }}>{pwd}</span>
              {isPremium && isCur && (
                <span style={{ fontSize: '9px', color: theme.subColor, display: 'block', marginTop: '3px', opacity: 0.5 }}>✏</span>
              )}
            </div>

            {/* 右：イベント一覧 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {loadingYears[y]
                ? <span style={{ fontSize: '11px', color: theme.subColor }}>読込中…</span>
                : evs.length === 0
                  ? <span style={{ fontSize: `${fs.event}px`, color: theme.emptyColor }}>—</span>
                  : evs.map((ev, i) => (
                    <div key={i} onClick={() => onEventClick(ev)} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', padding: '2px 0', cursor: 'pointer' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ev.color || '#3B82F6', marginTop: '4px', flexShrink: 0 }} />
                      <div style={{ fontSize: `${isMobile ? fs.event * 0.9 : fs.event}px`, color: theme.eventColor, lineHeight: 1.5, overflow: 'hidden', minWidth: 0, flex: 1, textAlign: 'left' }}>
                        {!isMobile && <span style={{ fontSize: `${fs.evTime}px`, color: theme.subColor, marginRight: '3px' }}>{ev.h}</span>}
                        {ev.t}
                        {ev.description && selectedCalendars.find(c => c.id === ev.calendarId)?.showDescription && (
                          <div style={{ fontSize: `${fs.evTime}px`, color: theme.subColor, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? '120px' : '200px' }}>
                            {ev.description.slice(0, 30)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        );
      })}

      {/* 日記入力モーダル */}
      {diaryModal.show && (
        <DiaryModal
          date={date}
          year={diaryModal.year}
          accessToken={accessToken}
          selectedCalendars={selectedCalendars}
          onClose={() => setDiaryModal({ show: false, year: null })}
          onSaved={() => setRefreshKey(k => k + 1)}
          theme={theme}
        />
      )}
    </div>
  );
}
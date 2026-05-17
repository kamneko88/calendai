export async function fetchCalendarEvents(accessToken, calendarId, year, month, day, onTokenExpired) {
  const timeMin = new Date(year, month - 1, day, 0, 0, 0).toISOString();
  const timeMax = new Date(year, month - 1, day, 23, 59, 59).toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 401) { onTokenExpired && onTokenExpired(); return []; }
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map(ev => ({
    t: ev.summary || '（タイトルなし）',
    h: ev.start.dateTime
      ? new Date(ev.start.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      : '終日',
    description: ev.description || '',
    isAllDay: !ev.start.dateTime,
    calendarId,
    year, month, day,
  }));
}

export async function fetchAllCalendars(accessToken) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function fetchOldestEventYear(accessToken) {
  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&maxResults=20&timeMin=2006-04-01T00:00:00Z',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const nonRecurring = data.items.filter(ev => !ev.recurringEventId);
      if (nonRecurring.length > 0) {
        const oldest = nonRecurring[0].start.dateTime || nonRecurring[0].start.date;
        return new Date(oldest).getFullYear();
      }
    }
  } catch { }
  return null;
}

export async function fetchYearEvents(accessToken, calendarId, year, onTokenExpired) {
  const timeMin = new Date(year, 0, 1).toISOString();
  const timeMax = new Date(year, 11, 31, 23, 59, 59).toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=250`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 401) { onTokenExpired && onTokenExpired(); return []; }
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || [])
    .filter(ev => ev.start.date) // 終日イベントのみ
    .map(ev => ({
      t: ev.summary || '（タイトルなし）',
      date: ev.start.date, // "2026-05-15" 形式
      calendarId,
    }));
}
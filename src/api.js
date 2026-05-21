export async function fetchCalendarEvents(accessToken, calendarId, year, month, day, onTokenExpired) {
  const timeMin = new Date(year, month - 1, day, 0, 0, 0).toISOString();
  const timeMax = new Date(year, month - 1, day, 23, 59, 59).toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (res.status === 401) { onTokenExpired && onTokenExpired(); return []; }
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map(ev => ({
    id: ev.id,
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
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?showHidden=true', {
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
      date: ev.start.date,
      description: ev.description || '',
      calendarId,
    }));
}

export async function createCalendarEvent(accessToken, calendarId, date, title, description) {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);
  const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: title,
        description: description || '',
        start: { date: dateStr },
        end: { date: endStr },
      }),
    }
  );
  if (!res.ok) throw new Error('イベントの作成に失敗しました');
  return await res.json();
}

export async function updateCalendarEvent(accessToken, calendarId, eventId, title, description) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: title,
        description: description || '',
      }),
    }
  );
  if (!res.ok) throw new Error('イベントの更新に失敗しました');
  return await res.json();
}

// 今日の○年前：同じ月日の過去イベントを取得
export async function fetchTodayPastEvents(accessToken, calendarIds, month, day, currentYear, maxYearsBack) {
  const yearPromises = [];
  for (let i = 1; i <= maxYearsBack; i++) {
    const year = currentYear - i;
    if (year < 2006) break;
    yearPromises.push(
      Promise.all(
        calendarIds.map(calId =>
          fetchCalendarEvents(accessToken, calId, year, month, day, null).catch(() => [])
        )
      ).then(results => {
        const allEvents = results.flat();
        return allEvents.length > 0 ? { year, events: allEvents } : null;
      })
    );
  }
  const results = await Promise.all(yearPromises);
  return results.filter(Boolean);
}
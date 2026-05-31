import DiaryModal from "./components/DiaryModal";
import TodayInPastBanner from "./components/TodayInPastBanner";
import { useState, useEffect, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { THEMES, CAL_COLORS, FONTS, APP_VERSION } from "./constants";
import { fetchAllCalendars, fetchOldestEventYear, fetchTodayPastEvents, fetchAnniversaryToday } from "./api";
import { getInitials, useWindowWidth, useSwipe } from "./hooks";
import SplashScreen from "./components/SplashScreen";
import LockScreen from "./components/LockScreen";
import PinSetupScreen from "./components/PinSetupScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import LoginScreen from "./components/LoginScreen";
import UserMenu from "./components/UserMenu";
import EventModal from "./components/EventModal";
import SettingsPanel from "./components/SettingsPanel";
import DayPage from "./components/DayPage";
import AnniversaryTab from "./components/AnniversaryTab";
import { Settings, LogOut, Star, Clock } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

export default function App() {
  const today = new Date();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('myd_settings');
      if (saved) return JSON.parse(saved);
    } catch { }
    return { stepNav: false, fontSize: 'small', defaultYearCount: 5, defaultDayCount: 2, theme: 'classic', fontFamily: 'gothic', todayBanner: true };
  };

  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(loadSettings);
  const [dayCount, setDayCount] = useState(() => Math.min(loadSettings().defaultDayCount || 2, 2));
  const [yearCount, setYearCount] = useState(() => {
    return loadSettings().defaultYearCount || 3;
  });
  const [base, setBase] = useState(() => {
    const dc = loadSettings().defaultDayCount || 2;
    const d = new Date(today);
    d.setDate(today.getDate() - (dc - 1));
    return d;
  });
  const [baseYear, setBaseYear] = useState(() => today.getFullYear());
  const [showSettings, setShowSettings] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [slideDir, setSlideDir] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [jumpYear, setJumpYear] = useState('');
  const [jumpMonth, setJumpMonth] = useState('');
  const [jumpDay, setJumpDay] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [isPremium, setIsPremium] = useState(true);
  const [showAnniversary, setShowAnniversary] = useState(false);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeYears, setWelcomeYears] = useState(0);
  const [welcomeStartYear, setWelcomeStartYear] = useState(null);
  const [skipWelcome, setSkipWelcome] = useState(() => localStorage.getItem('myd_skip_welcome') === 'true');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [downgradeNotice, setDowngradeNotice] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [anniversaryCalendarId, setAnniversaryCalendarId] = useState(
    () => localStorage.getItem('myd_anniversary_cal') || null
  );
  const [showTodayBanner, setShowTodayBanner] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [todayBannerData, setTodayBannerData] = useState([]);
  const bannerCheckedRef = useRef(false);
  const theme = THEMES[settings.theme] || THEMES.classic;
  const viewMenuRef = useRef(null);
  const [pinToastType, setPinToastType] = useState(null);
  const [pinClearSuccess, setPinClearSuccess] = useState(false);
  const [showTokenExpiredDialog, setShowTokenExpiredDialog] = useState(false);

  useEffect(() => {
    if (isMobile && dayCount > 2) handleDayCountChange(2);
  }, [isMobile]);

  useEffect(() => {
    const h = (e) => { if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) setShowViewMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    (async () => {
      const savedUser = localStorage.getItem('myd_user');
      if (!savedUser) return;
      try {
        const userData = JSON.parse(savedUser);
        // 起動時にトークン有効性を検証
        const testRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${userData.accessToken}` }
        });
        if (testRes.status === 401) {
          // トークン切れ：ユーザー情報だけセットして再ログイン画面を表示
          setUser(userData);
          setTokenExpired(true);
          setShowTokenExpiredDialog(true);
          return;
        }
        setUser(userData);
        const savedCals = localStorage.getItem('myd_selected_calendars');
        if (savedCals) setSelectedCalendars(JSON.parse(savedCals));
        fetchAllCalendars(userData.accessToken).then(cals => {
          if (cals.length > 0) setCalendars(cals);
        });
        const savedSettings = localStorage.getItem('myd_settings');
        if (savedSettings) {
          const s = JSON.parse(savedSettings);
          if (s.lockEnabled && localStorage.getItem('myd_pin')) setIsLocked(true);
        }
      } catch { }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('myd_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (selectedCalendars.length > 0) {
      localStorage.setItem('myd_selected_calendars', JSON.stringify(selectedCalendars));
    }
  }, [selectedCalendars]);

  // 「今日の○年前」バナー（PRO限定・起動時1回）
  useEffect(() => {
    if (!user || showWelcome || isProcessingLogin) return;
    if (!isPremium) return;
    if (settings.todayBanner === false) return;
    if (bannerCheckedRef.current) return;
    if (selectedCalendars.length === 0) return;

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (localStorage.getItem('myd_banner_shown') === todayKey) return;

    bannerCheckedRef.current = true;

    Promise.all([
      fetchTodayPastEvents(
        user.accessToken,
        selectedCalendars.map(c => c.id),
        today.getMonth() + 1,
        today.getDate(),
        today.getFullYear(),
        yearCount - 1
      ),
      fetchAnniversaryToday(
        user.accessToken,
        anniversaryCalendarId,
        today.getMonth() + 1,
        today.getDate(),
        today.getFullYear()
      ),
    ]).then(([pastEvents, anniversaries]) => {
      if (pastEvents.length > 0 || anniversaries.length > 0) {
        setTodayBannerData({ pastEvents, anniversaries });
        setShowTodayBanner(true);
        localStorage.setItem('myd_banner_shown', todayKey);
      }
    }).catch(() => { });
  }, [user, showWelcome, isProcessingLogin, isPremium, selectedCalendars]);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar profile email',
    onSuccess: async (tokenResponse) => {
      setIsProcessingLogin(true);
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      const profile = await res.json();
      const userData = { name: profile.name, email: profile.email, picture: profile.picture, accessToken: tokenResponse.access_token, initials: getInitials(profile.name), color: '#3B82F6' };
      const cals = await fetchAllCalendars(tokenResponse.access_token);
      const saved = localStorage.getItem('myd_selected_calendars');
      let newSelectedCals;
      if (saved) {
        newSelectedCals = JSON.parse(saved);
      } else {
        const primary = cals.find(c => c.primary) || cals[0];
        newSelectedCals = primary ? [{ id: primary.id, color: primary.backgroundColor || CAL_COLORS[0], name: primary.summary, showDescription: false }] : [];
      }
      const isFirst = !localStorage.getItem('myd_welcomed');
      const shouldShowWelcome = !localStorage.getItem('myd_skip_welcome');
      let oldestYear = null;
      if (shouldShowWelcome) oldestYear = await fetchOldestEventYear(tokenResponse.access_token);
      localStorage.setItem('myd_user', JSON.stringify(userData));
      setUser(userData);
      setCalendars(cals);
      setSelectedCalendars(newSelectedCals);
      setIsFirstLogin(isFirst);
      if (shouldShowWelcome && oldestYear) {
        setWelcomeStartYear(oldestYear);
        setWelcomeYears(today.getFullYear() - oldestYear + 1);
      }

      // 記念日カレンダーを自動検出（未設定の場合のみ）
      if (!localStorage.getItem('myd_anniversary_cal')) {
        const autoAnniv = cals.find(c => /anniversary|記念日|birthday|誕生日/i.test(c.summary));
        if (autoAnniv) {
          localStorage.setItem('myd_anniversary_cal', autoAnniv.id);
          setAnniversaryCalendarId(autoAnniv.id);
        }
      }

      setShowWelcome(shouldShowWelcome);
      setIsProcessingLogin(false);
    },
    onError: (err) => console.error('ログイン失敗:', err),
  });

  const handleTokenExpired = () => {
    if (tokenExpired) return;
    setTokenExpired(true);
    setShowTokenExpiredDialog(true);
  };

  const loginNative = async () => {
    try {
      await GoogleAuth.initialize({
        clientId: '690550080789-5k4483a7a5phqvu72q2iv1jtk8e9qe00.apps.googleusercontent.com',
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
        grantOfflineAccess: false,
      });
      const googleUser = await GoogleAuth.signIn();
      const accessToken = googleUser.authentication.accessToken;
      setIsProcessingLogin(true);
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const profile = await res.json();

      const userData = {
        name: profile.name || googleUser.displayName,
        email: profile.email || googleUser.email,
        picture: profile.picture || googleUser.imageUrl,
        accessToken,
        initials: getInitials(profile.name || googleUser.displayName || ''),
        color: '#3B82F6'
      };

      const cals = await fetchAllCalendars(accessToken);
      const saved = localStorage.getItem('myd_selected_calendars');
      const primary = cals.find(c => c.primary) || cals[0];
      const newSelectedCals = saved ? JSON.parse(saved)
        : primary ? [{ id: primary.id, color: primary.backgroundColor || CAL_COLORS[0], name: primary.summary, showDescription: false }] : [];

      localStorage.setItem('myd_user', JSON.stringify(userData));
      setUser(userData);
      setCalendars(cals);
      setSelectedCalendars(newSelectedCals);
      setIsFirstLogin(!localStorage.getItem('myd_welcomed'));

      const shouldShowWelcome = !localStorage.getItem('myd_skip_welcome');
      if (shouldShowWelcome) {
        const oldestYear = await fetchOldestEventYear(accessToken);
        if (oldestYear) {
          setWelcomeStartYear(oldestYear);
          setWelcomeYears(today.getFullYear() - oldestYear + 1);
        }
      }
      setShowWelcome(shouldShowWelcome);
      setIsProcessingLogin(false);
    } catch (e) {
      console.error('Native login error:', e);
      setIsProcessingLogin(false);
    }
  };

  const handleLogout = () => {
    setShowSplash(false);
    setUser(null); setCalendars([]); setSelectedCalendars([]); setTokenExpired(false);
    setIsLocked(false);
    localStorage.removeItem('myd_user');
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    localStorage.setItem('myd_premium', 'true');
    setUpgradeNotice(true);
    setTimeout(() => setUpgradeNotice(false), 5000);
  };

  const handleJumpToDate = (month, day) => {
    const target = new Date(today.getFullYear(), month - 1, day);
    setBaseYear(today.getFullYear());
    const newBase = new Date(target);
    newBase.setDate(target.getDate() - (dayCount - 1));
    setBase(newBase);
  };

  const handleCalendarToggle = (cal) => {
    setSelectedCalendars(prev => {
      const exists = prev.some(c => c.id === cal.id);
      if (exists) return prev.filter(c => c.id !== cal.id);
      if (prev.length >= (isPremium ? 5 : 2)) return prev;
      return [...prev, { id: cal.id, color: cal.backgroundColor || CAL_COLORS[calendars.indexOf(cal) % CAL_COLORS.length], name: cal.summary, showDescription: false }];
    });
  };

  const days = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(base); d.setDate(base.getDate() + i); return d;
  });

  const navigate = (delta) => {
    if (animating) return;
    setSlideDir(delta);
    setAnimating(true);
    setTimeout(() => {
      const step = settings.stepNav ? 1 : dayCount;
      const d = new Date(base);
      d.setDate(base.getDate() + delta * step);
      setBase(d);
      setAnimating(false);
    }, 150);
  };

  const goToday = () => {
    const d = new Date(today); d.setDate(today.getDate() - (dayCount - 1));
    setBase(d); setBaseYear(today.getFullYear());
    setJumpYear(''); setJumpMonth(''); setJumpDay('');
  };

  const curRight = () => { const d = new Date(base); d.setDate(base.getDate() + dayCount - 1); return d; };

  const handleJump = () => {
    const right = curRight();
    const y = jumpYear ? parseInt(jumpYear) : null;
    const m = jumpMonth ? parseInt(jumpMonth) - 1 : null;
    const d = jumpDay ? parseInt(jumpDay) : null;
    let target;
    if (y !== null && m !== null && d !== null) target = new Date(y, m, d);
    else if (y !== null && m !== null) target = new Date(y, m, right.getDate());
    else if (y !== null) target = new Date(y, right.getMonth(), right.getDate());
    else if (m !== null && d !== null) target = new Date(right.getFullYear(), m, d);
    else if (m !== null) target = new Date(right.getFullYear(), m, right.getDate());
    else if (d !== null) target = new Date(right.getFullYear(), right.getMonth(), d);
    else return;
    setBaseYear(y !== null ? y : right.getFullYear());
    const newBase = new Date(target); newBase.setDate(target.getDate() - (dayCount - 1));
    setBase(newBase);
  };

  const handleJumpYearKey = (e) => {
    const cur = jumpYear ? parseInt(jumpYear) : curRight().getFullYear();
    if (e.key === 'ArrowUp') { e.preventDefault(); setJumpYear(String(cur + 1)); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setJumpYear(String(cur - 1)); }
    else if (e.key === 'Enter') handleJump();
  };
  const handleJumpMonthKey = (e) => {
    const cur = jumpMonth ? parseInt(jumpMonth) : curRight().getMonth() + 1;
    if (e.key === 'ArrowUp') { e.preventDefault(); setJumpMonth(String(Math.min(cur + 1, 12))); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setJumpMonth(String(Math.max(cur - 1, 1))); }
    else if (e.key === 'Enter') handleJump();
  };
  const handleJumpDayKey = (e) => {
    const cur = jumpDay ? parseInt(jumpDay) : curRight().getDate();
    if (e.key === 'ArrowUp') { e.preventDefault(); setJumpDay(String(Math.min(cur + 1, 31))); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setJumpDay(String(Math.max(cur - 1, 1))); }
    else if (e.key === 'Enter') handleJump();
  };

  const handleDayCountChange = (n) => {
    const right = curRight();
    const newBase = new Date(right); newBase.setDate(right.getDate() - (n - 1));
    setDayCount(n); setBase(newBase);
  };

  const formatRange = () => {
    const first = days[0], last = days[days.length - 1];
    if (dayCount === 1) return `${first.getMonth() + 1}月${first.getDate()}日`;
    return `${first.getMonth() + 1}/${first.getDate()} 〜 ${last.getMonth() + 1}/${last.getDate()}`;
  };

  const swipeHandlers = useSwipe(() => navigate(1), () => navigate(-1));

  const btnStyle = (active) => ({
    padding: isMobile ? '5px 7px' : '4px 10px', fontSize: '12px',
    border: `0.5px solid ${active ? theme.btnActiveBg : theme.btnBorder}`, borderRadius: '5px',
    cursor: 'pointer', fontWeight: '500',
    background: active ? theme.btnActiveBg : theme.headerBg,
    color: active ? theme.btnActiveColor : theme.btnColor,
  });

  const inputStyle = { padding: '4px 6px', fontSize: '12px', border: '0.5px solid #ccc', borderRadius: '5px', textAlign: 'center', outline: 'none', background: '#fff' };

  const calName = (ev) => { const cal = selectedCalendars.find(c => c.id === ev.calendarId); return cal ? cal.name : ''; };

  // 画面の出し分け
  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (isProcessingLogin) return <div style={{ minHeight: '100vh', background: '#9e6b50' }} />;
  if (!user) return <LoginScreen onLogin={Capacitor.isNativePlatform() ? loginNative : login} />;
  if (showWelcome) return (
    <WelcomeScreen
      years={welcomeYears} startYear={welcomeStartYear} isFirst={isFirstLogin}
      skipWelcome={skipWelcome}
      onSkipChange={(val) => { setSkipWelcome(val); localStorage.setItem('myd_skip_welcome', val ? 'true' : 'false'); }}
      onStart={() => { localStorage.setItem('myd_welcomed', 'true'); setShowWelcome(false); }}
      theme={theme}
    />
  );
  if (isLocked) return <LockScreen
    onUnlock={() => setIsLocked(false)}
    onReset={() => {
      localStorage.removeItem('myd_pin');
      localStorage.removeItem('myd_settings');
      localStorage.removeItem('myd_user');
      setIsLocked(false);
      setUser(null);
      setSettings(loadSettings());
    }}
  />;

  const jumpRow = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
      {[
        { val: jumpYear, set: setJumpYear, placeholder: '年', width: isMobile ? '58px' : '68px', onKey: handleJumpYearKey, max: null, min: null, getVal: () => jumpYear ? parseInt(jumpYear) : curRight().getFullYear() },
        { val: jumpMonth, set: setJumpMonth, placeholder: '月', width: '42px', onKey: handleJumpMonthKey, max: 12, min: 1, getVal: () => jumpMonth ? parseInt(jumpMonth) : curRight().getMonth() + 1 },
        { val: jumpDay, set: setJumpDay, placeholder: '日', width: '42px', onKey: handleJumpDayKey, max: 31, min: 1, getVal: () => jumpDay ? parseInt(jumpDay) : curRight().getDate() },
      ].map(({ val, set, placeholder, width, onKey, max, min, getVal }) => (
        <div key={placeholder} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input type="text" inputMode="numeric" placeholder={placeholder} value={val}
            onChange={e => set(e.target.value.replace(/[^0-9-]/g, ''))}
            onKeyDown={onKey}
            style={{ ...inputStyle, width }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <button onClick={() => set(String(max ? Math.min(getVal() + 1, max) : getVal() + 1))}
              style={{ padding: '0 4px', fontSize: '9px', border: '0.5px solid #ccc', borderRadius: '3px', cursor: 'pointer', background: '#fff', color: '#555', lineHeight: '14px' }}>▲</button>
            <button onClick={() => set(String(min ? Math.max(getVal() - 1, min) : getVal() - 1))}
              style={{ padding: '0 4px', fontSize: '9px', border: '0.5px solid #ccc', borderRadius: '3px', cursor: 'pointer', background: '#fff', color: '#555', lineHeight: '14px' }}>▼</button>
          </div>
          <span style={{ fontSize: '11px', color: '#bbb' }}>{placeholder}</span>
        </div>
      ))}
      <button onClick={handleJump} style={{ ...btnStyle(false), padding: '4px 10px' }}>移動</button>
    </div>
  );

  const navButtons = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
      <button onClick={() => navigate(-1)} style={btnStyle(false)}>◀</button>
      <button onClick={goToday} style={btnStyle(false)}>今日</button>
      <button onClick={() => navigate(1)} style={btnStyle(false)}>▶</button>
    </div>
  );

  const anniversaryButton = (
    <button onClick={() => setShowAnniversary(true)} style={{ ...btnStyle(false), flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Star size={14} strokeWidth={1.8} />{!isMobile && ' 記念日'}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: FONTS[settings.fontFamily || 'gothic']?.family || FONTS.gothic.family, padding: isMobile ? '8px' : '14px' }}>

      {/* ヘッダー */}
      <div style={{ marginBottom: '10px', padding: isMobile ? '8px 10px' : '10px 14px', background: theme.headerBg, borderRadius: '8px', border: `0.5px solid ${theme.headerBorder}` }}>

        {/* 行1：タイトル＋バッジ（デスクトップはナビ・記念日も同じ行） */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: isMobile ? '8px' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>

            {/* 統合タイトルメニュー */}
            <div ref={viewMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <div onClick={() => setShowViewMenu(o => !o)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '700', color: theme.dateColor, fontFamily: 'Georgia, serif', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  {user.name}さんのCalenDai ▾
                </div>
              </div>

              {showViewMenu && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', background: '#fff', border: '0.5px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.14)', zIndex: 1000, minWidth: '260px', overflow: 'hidden', animation: 'calDropdownIn 0.18s ease forwards' }}>

                  {/* アカウントセクション */}
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '0.5px solid #eee' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: user.color, color: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '500', overflow: 'hidden' }}>
                      {user.picture ? <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} /> : user.initials}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                    {/* NIKKIバッジ：将来の有料化に備えてコードは残すが現在は非表示
                    {isPremium && (
                      <div style={{ fontSize: '8px', fontWeight: '700', padding: '2px 6px', borderRadius: '3px', flexShrink: 0, background: theme.currentYearColor, color: '#fff', fontFamily: 'monospace' }}>
                        NIKKI
                      </div>
                    )}
                    */}
                  </div>

                  {/* 表示設定セクション */}
                  <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #eee' }}>
                    <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase' }}>表示設定</div>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px' }}>年数</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[3, 5].map(n => (
                          <button key={n} onClick={() => {
                            setYearCount(n);
                            setSettings(s => ({ ...s, defaultYearCount: n }));
                            if (n === 5 && dayCount > 2) handleDayCountChange(2);
                          }}
                            style={{ padding: '4px 14px', border: `0.5px solid ${yearCount === n ? theme.btnActiveBg : theme.btnBorder}`, borderRadius: '5px', cursor: 'pointer', fontSize: '13px', background: yearCount === n ? theme.btnActiveBg : '#fff', color: yearCount === n ? theme.btnActiveColor : theme.btnColor }}>
                            {n}年
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px' }}>日数</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 2].map(n => (
                          <button key={n} onClick={() => {
                            handleDayCountChange(n);
                            setSettings(s => ({ ...s, defaultDayCount: n }));
                          }}
                            style={{ padding: '4px 14px', border: `0.5px solid ${dayCount === n ? theme.btnActiveBg : theme.btnBorder}`, borderRadius: '5px', cursor: 'pointer', fontSize: '13px', background: dayCount === n ? theme.btnActiveBg : '#fff', color: dayCount === n ? theme.btnActiveColor : theme.btnColor }}>
                            {n}日
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 設定・ログアウト */}
                  <div style={{ padding: '6px 8px' }}>
                    <button onClick={() => { setShowViewMenu(false); setShowSettings(true); }}
                      style={{ width: '100%', padding: '8px 10px', textAlign: 'left', fontSize: '13px', color: '#333', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Settings size={14} strokeWidth={1.8} style={{ flexShrink: 0 }} /> 設定
                    </button>
                    <button onClick={() => { setShowViewMenu(false); handleLogout(); }}
                      style={{ width: '100%', padding: '8px 10px', textAlign: 'left', fontSize: '13px', color: '#e74c3c', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <LogOut size={14} strokeWidth={1.8} style={{ flexShrink: 0 }} /> ログアウト
                    </button>
                    <div style={{ borderTop: '0.5px solid #eee', margin: '6px 0' }} />
                  </div>
                </div>
              )}
            </div>

            {/* NIKKIバッジ：将来の有料化に備えてコードは残すが現在は非表示
            {isPremium && (
              <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '.05em', padding: '1px 5px', borderRadius: '3px', flexShrink: 0, background: theme.currentYearColor, color: theme.pageBg, opacity: 0.85, fontFamily: 'monospace' }}>
                NIKKI
              </div>
            )}
            */}

            {/* デスクトップのみ：ナビ */}
            {!isMobile && navButtons}

            {/* デスクトップのみ：ジャンプ行 */}
            {!isMobile && jumpRow}
          </div>

          {/* デスクトップのみ：記念日ボタン */}
          {!isMobile && anniversaryButton}
        </div>

        {/* 行2（モバイルのみ）：ナビ＋記念日 */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navButtons}
            <div style={{ flex: 1 }} />
            {anniversaryButton}
          </div>
        )}
      </div>

      {/* スマホ用ジャンプ行 */}
      {
        isMobile && (
          <div style={{ marginBottom: '8px', padding: '8px 10px', background: theme.headerBg, borderRadius: '8px', border: `0.5px solid ${theme.headerBorder}` }}>
            {jumpRow}
          </div>
        )
      }

      {/* メインコンテンツ */}
      <div {...(isMobile ? swipeHandlers : {})} style={{ display: 'flex', border: '0.5px solid #ccc', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transform: animating ? `translateX(${slideDir > 0 ? '-30px' : '30px'})` : 'translateX(0)', opacity: animating ? 0 : 1, transition: 'transform 0.15s ease, opacity 0.15s ease' }}>
        {days.map((d, i) => (
          <DayPage key={i} date={d} yearCount={yearCount} baseYear={baseYear}
            fontSize={settings.fontSize} isLast={i === days.length - 1}
            accessToken={user.accessToken} selectedCalendars={selectedCalendars}
            anniversaryCalendarId={anniversaryCalendarId}
            isPremium={isPremium}
            isMobile={isMobile} onEventClick={setSelectedEvent}
            onTokenExpired={handleTokenExpired}
            tokenExpired={tokenExpired}
            theme={theme} />
        ))}
      </div>

      {/* ダウングレード通知トースト */}
      {downgradeNotice && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', zIndex: 5000, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', animation: 'calBottomToastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
          通常版では表示カレンダーは2つまでです。
        </div>
      )}

      {upgradeNotice && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#2ecc71', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', zIndex: 5000, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'calBottomToastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
          🎉 NIKKI版になりました！全機能が使えます。
        </div>
      )}

      {pinToastType && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#333', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', zIndex: 5000, maxWidth: '300px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', animation: 'calCenterToastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
          {pinToastType === 'new' && '🔒 PINコードを有効にしました'}
          {pinToastType === 'changed' && '🔒 PINコードを変更しました'}
          {pinToastType === 'same' && '⚠️ 入力されたコードが同じです。PINコードは変更されませんでした'}
        </div>
      )}

      {/* フッター */}
      <div style={{ textAlign: 'center', padding: '12px', fontSize: '10px', color: theme.subColor, letterSpacing: '.1em' }}>
        CalenDai v{APP_VERSION}
      </div>

      {/* モーダル類 */}
      {
        showAnniversary && (
          <AnniversaryTab
            accessToken={user.accessToken}
            anniversaryCalendarId={anniversaryCalendarId}
            calendars={calendars}
            currentYear={today.getFullYear()}
            onJump={handleJumpToDate}
            onClose={() => setShowAnniversary(false)}
            theme={theme}
          />
        )
      }
      {
        showSettings && (
          <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)}
            calendars={calendars} selectedCalendars={selectedCalendars} onCalendarToggle={handleCalendarToggle}
            onYearCountChange={setYearCount} onDayCountChange={handleDayCountChange}
            onDescriptionToggle={(calId) => setSelectedCalendars(prev => prev.map(c => c.id === calId ? { ...c, showDescription: !c.showDescription } : c))}
            onCalendarReorder={(newOrder) => {
              setSelectedCalendars(newOrder);
              localStorage.setItem('myd_selected_calendars', JSON.stringify(newOrder));
            }}
            onPinSetup={() => { setShowSettings(false); setShowPinSetup(true); }}
            isPremium={isPremium}
            onPinClear={() => {
              setPinClearSuccess(true);
              setTimeout(() => setPinClearSuccess(false), 3000);
            }}
            anniversaryCalendarId={anniversaryCalendarId}
            onAnniversaryCalendarChange={(id) => {
              setAnniversaryCalendarId(id);
              if (id) localStorage.setItem('myd_anniversary_cal', id);
              else localStorage.removeItem('myd_anniversary_cal');
            }}
            onDevCommand={(cmd) => {
              if (cmd === 'toggle') {
                const next = !isPremium;
                setIsPremium(next);
                if (next) {
                  handleUpgrade();
                } else {
                  localStorage.removeItem('myd_premium');
                  if (yearCount > 3) { setYearCount(3); setSettings(s => ({ ...s, defaultYearCount: 3 })); }
                  if (selectedCalendars.length > 2) {
                    const reduced = selectedCalendars.slice(0, 2);
                    setSelectedCalendars(reduced);
                    localStorage.setItem('myd_selected_calendars', JSON.stringify(reduced));
                  }
                  setSettings(s => ({ ...s, fontFamily: 'gothic' }));
                  setDowngradeNotice(true);
                  setTimeout(() => setDowngradeNotice(false), 4000);
                }
              } else if (cmd === 'reset') {
                localStorage.removeItem('myd_welcomed');
                localStorage.removeItem('myd_skip_welcome');
                localStorage.removeItem('myd_banner_shown');
                localStorage.removeItem('myd_settings');
                localStorage.removeItem('myd_selected_calendars');
                localStorage.removeItem('myd_anniversary_cal');
                localStorage.removeItem('myd_pin');
                window.location.reload();
              }
            }}
            theme={theme} />
        )
      }

      {editEvent && (
        <DiaryModal
          date={editEvent.date}
          year={editEvent.date.getFullYear()}
          accessToken={user.accessToken}
          selectedCalendars={selectedCalendars}
          editEvent={editEvent}
          onClose={() => setEditEvent(null)}
          onSaved={() => { setEditEvent(null); }}
          theme={theme} />
      )}

      {showPinSetup && (
        <PinSetupScreen
          onComplete={(type) => {
            setShowPinSetup(false);
            setPinToastType(type);
            setTimeout(() => setPinToastType(null), 3000);
          }}
          onCancel={() => {
            setShowPinSetup(false);
            if (!localStorage.getItem('myd_pin')) {
              setSettings(s => ({ ...s, lockEnabled: false }));
            }
          }}
        />
      )}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          calendarName={calName(selectedEvent)}
          isPremium={isPremium}
          onEdit={() => {
            setEditEvent({
              id: selectedEvent.id,
              calendarId: selectedEvent.calendarId,
              title: selectedEvent.t,
              description: selectedEvent.description,
              date: new Date(selectedEvent.year, selectedEvent.month - 1, selectedEvent.day),
            });
            setSelectedEvent(null);
          }}
          onClose={() => setSelectedEvent(null)} />
      )}

      {/* 今日の○年前バナー（PRO限定） */}
      {showTodayBanner && (
        <TodayInPastBanner
          data={todayBannerData}
          today={today}
          theme={theme}
          onClose={() => setShowTodayBanner(false)}
        />
      )}

      {pinClearSuccess && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#333', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', zIndex: 5000, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', animation: 'calCenterToastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
          🔓 PINコードをクリアしました
        </div>
      )}

      {showTokenExpiredDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'calOverlayIn 0.2s ease forwards' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px 24px', width: '100%', maxWidth: '320px', textAlign: 'center', border: '0.5px solid #ddd', animation: 'calModalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <Clock size={36} strokeWidth={1.5} color="#9e6b50" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '10px' }}>長時間のご利用ありがとうございます</div>
            <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.8, marginBottom: '24px' }}>Googleの仕様により、一定時間が経過すると<br />再ログインが必要になります。</div>
            <button
              onClick={() => {
                setShowTokenExpiredDialog(false);
                setTokenExpired(false);
                if (Capacitor.isNativePlatform()) {
                  loginNative();
                } else {
                  login();
                }
              }}
              style={{ width: '100%', padding: '13px', background: '#9e6b50', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#fff" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
                <path fill="rgba(255,255,255,0.8)" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
                <path fill="rgba(255,255,255,0.6)" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
                <path fill="rgba(255,255,255,0.9)" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" />
              </svg>
              Googleで再ログイン
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";

export default function SplashScreen({ onComplete }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // フェードイン
    const t1 = setTimeout(() => setOpacity(1), 50);
    // フェードアウト開始
    const t2 = setTimeout(() => setOpacity(0), 1400);
    // 完了
    const t3 = setTimeout(() => onComplete(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#9e6b50',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity,
      transition: 'opacity 0.6s ease',
    }}>
      <img
        src={`${import.meta.env.BASE_URL}icon-192.png`}
        alt="CalenDai"
        style={{ width: '120px', height: '120px', borderRadius: '24px' }}
      />
    </div>
  );
}
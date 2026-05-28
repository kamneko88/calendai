import { Calendar, Clock, Pencil } from 'lucide-react';
import { WDS } from "../constants";
import { useModalAnimation } from "../hooks";

export default function EventModal({ event, calendarName, onClose, onEdit, isPremium }) {
  const { close, overlayAnim, contentAnim } = useModalAnimation(onClose);
  if (!event) return null;
  const d = new Date(event.year, event.month - 1, event.day);
  const dateStr = `${event.year}年${event.month}月${event.day}日（${WDS[d.getDay()]}）`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', ...overlayAnim }}
      onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div style={{ background: '#fdfaf5', borderRadius: '12px', width: '100%', maxWidth: '340px', border: '0.5px solid #ddd', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', ...contentAnim }}>
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>予定の詳細</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isPremium && onEdit && (
              <button onClick={onEdit}
                style={{ fontSize: '12px', color: '#666', background: '#f5f5f5', border: '0.5px solid #ddd', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Pencil size={12} strokeWidth={1.8} /> 編集
              </button>
            )}
            <button onClick={close} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
          </div>
        </div>
        <div style={{ padding: '20px 16px' }}>
          <div style={{ fontSize: '18px', fontWeight: '500', color: '#222', marginBottom: '16px', lineHeight: 1.4 }}>{event.t}</div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={13} strokeWidth={1.8} color="#888" />
            {dateStr}
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} strokeWidth={1.8} color="#888" />
            {event.h}
          </div>
          {calendarName && (
            <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: event.description ? '12px' : '0' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: event.color, flexShrink: 0 }} />
              {calendarName}
            </div>
          )}
          {event.description && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#f8f8f8', borderRadius: '8px', fontSize: '13px', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap', borderLeft: '3px solid #ddd' }}>
              {event.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
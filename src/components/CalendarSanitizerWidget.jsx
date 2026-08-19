import React, { useState } from 'react';
import { Calendar, ShieldCheck, Eye, EyeOff, Sparkles, Copy, Check, Filter, Heart, Users, Clock, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_CALENDAR_EVENTS = [
  { id: 'e1', time: '09:00 AM', title: '🚀 Team Standup & Sync', type: 'meeting', isMicroRoutine: false },
  { id: 'e2', time: '10:15 AM', title: '🥤 Hydration Sip & 5-Min Eye Break', type: 'micro_routine', isMicroRoutine: true },
  { id: 'e3', time: '11:00 AM', title: '💻 Deep Work: Code Refactoring', type: 'work', isMicroRoutine: false },
  { id: 'e4', time: '12:30 PM', title: '🍱 EAT LUNCH & Step Away From Screen', type: 'micro_routine', isMicroRoutine: true },
  { id: 'e5', time: '01:45 PM', title: '☕ Coffee & Gastrocolic Reset Break', type: 'micro_routine', isMicroRoutine: true },
  { id: 'e6', time: '02:30 PM', title: '📞 Client Strategy Call', type: 'meeting', isMicroRoutine: false },
  { id: 'e7', time: '04:15 PM', title: '🧘 5-Min Deep Breathing & Stretch', type: 'micro_routine', isMicroRoutine: true },
  { id: 'e8', time: '05:00 PM', title: '🏠 EOD GO HOME & SHUT DOWN LAPTOP', type: 'micro_routine', isMicroRoutine: true }
];

export default function CalendarSanitizerWidget({
  isPinned,
  onTogglePin
}) {
  const [isFamilySafeView, setIsFamilySafeView] = useState(true); // Default sanitized for family!
  const [isCopied, setIsCopied] = useState(false);

  const displayedEvents = isFamilySafeView
    ? SAMPLE_CALENDAR_EVENTS.filter(e => !e.isMicroRoutine)
    : SAMPLE_CALENDAR_EVENTS;

  const hiddenCount = SAMPLE_CALENDAR_EVENTS.filter(e => e.isMicroRoutine).length;

  const handleCopySanitizedICS = () => {
    const familyViewText = displayedEvents.map(e => `• ${e.time} - ${e.title}`).join('\n');
    navigator.clipboard.writeText(`👨‍👩‍👧 Family-Safe Day Schedule:\n${familyViewText}`);
    setIsCopied(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className={`glass-panel ${isPinned ? 'pinned-tape' : ''}`} style={{ padding: '1.2rem', position: 'relative' }}>
      {/* Sticky Tape Pin Indicator */}
      {isPinned && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(251, 191, 36, 0.4)',
          border: '1px dashed #fbbf24',
          color: '#fef08a',
          fontSize: '0.65rem',
          fontWeight: '700',
          padding: '0.15rem 0.8rem',
          borderRadius: '2px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          letterSpacing: '0.05em'
        }}>
          📌 STICKY TAPE PINNED
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              👨‍👩‍👧 Calendar Sanitizer & Family-Safe View
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Filters out terrifying Gemini micro-reminders ("Eat Lunch", "Go Home") for family sharing
            </p>
          </div>
        </div>

        <button
          onClick={onTogglePin}
          className="btn-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
          title="Pin panel side-by-side with sticky tape"
        >
          📌 {isPinned ? 'Unpin' : 'Pin Tape'}
        </button>
      </div>

      {/* View Switcher Toggle Bar */}
      <div className="glass-card" style={{ padding: '0.75rem', marginBottom: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button
              onClick={() => setIsFamilySafeView(true)}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.73rem',
                borderColor: isFamilySafeView ? '#34d399' : 'var(--border-color)',
                background: isFamilySafeView ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                color: isFamilySafeView ? '#34d399' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Users size={14} />
              <span>👨‍👩‍👧 Family-Safe View (Calm)</span>
            </button>

            <button
              onClick={() => setIsFamilySafeView(false)}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.73rem',
                borderColor: !isFamilySafeView ? '#60a5fa' : 'var(--border-color)',
                background: !isFamilySafeView ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                color: !isFamilySafeView ? '#93c5fd' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Eye size={14} />
              <span>🤖 Full Gemini Micro-Schedule ({SAMPLE_CALENDAR_EVENTS.length} Blocks)</span>
            </button>
          </div>

          <button
            onClick={handleCopySanitizedICS}
            className="btn-primary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.73rem', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {isCopied ? <Check size={13} /> : <Copy size={13} />}
            <span>{isCopied ? 'Copied Family View!' : 'Copy Family-Safe Schedule'}</span>
          </button>
        </div>

        {isFamilySafeView && (
          <div style={{ fontSize: '0.73rem', color: '#a7f3d0', marginTop: '0.4rem' }}>
            ✨ <strong>Sanitizer Active</strong>: Automatically hidden <strong>{hiddenCount} micro-routine blocks</strong> ("Eat Lunch", "5-Min Eye Break", "EOD Go Home"). Your family sees a clean, calm 2-meeting day!
          </div>
        )}
      </div>

      {/* Calendar Event Blocks Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
        {displayedEvents.map(event => (
          <div
            key={event.id}
            className="glass-card"
            style={{
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: event.isMicroRoutine ? 'rgba(236, 72, 153, 0.06)' : 'rgba(255, 255, 255, 0.04)',
              borderLeft: event.isMicroRoutine ? '3px solid #ec4899' : '3px solid #3b82f6'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {event.time}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: event.isMicroRoutine ? '#f472b6' : '#fff' }}>
                {event.title}
              </span>
            </div>

            {event.isMicroRoutine && (
              <span style={{ fontSize: '0.68rem', color: '#ec4899', background: 'rgba(236, 72, 153, 0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                Gemini Micro-Reminder
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

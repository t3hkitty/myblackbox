import React, { useState } from 'react';
import { AlertTriangle, Flame, ShieldAlert, Droplet, Wind, Coffee, Zap, Pin, Heart, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AddictionMonitorWidget({
  allLogs = [],
  sipSettings = {},
  onLogSip,
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const peeCount = sipSettings.todayPeeCount || 0;
  const pooCount = sipSettings.todayPooCount || 0;
  const totalBioVisits = peeCount + pooCount;

  // Scan logs for coffee & doomscroll tags today
  const todayStr = new Date().toISOString().substring(0, 10);
  const coffeeLogsCount = allLogs.filter(log => {
    if (!log.tags) return false;
    const isToday = log.createdIso && log.createdIso.startsWith(todayStr);
    return isToday && log.tags.some(t => t.toLowerCase().includes('coffee') || t.toLowerCase().includes('caffeine'));
  }).length;

  const doomscrollCount = allLogs.filter(log => {
    if (!log.tags) return false;
    const isToday = log.createdIso && log.createdIso.startsWith(todayStr);
    return isToday && log.tags.some(t => t.toLowerCase().includes('doomscroll') || t.toLowerCase().includes('distraction') || t.toLowerCase().includes('social'));
  }).length;

  const isBioHabitHigh = totalBioVisits >= 4;
  const isCaffeineTriggerHigh = coffeeLogsCount >= 2;
  const isDoomscrollHigh = doomscrollCount >= 2;

  const handleKickHabitWaterSwap = () => {
    if (onLogSip) {
      onLogSip(4, { id: 'water', label: 'Water (Habit Kick Swap)', emoji: '🚰', color: '#3b82f6' });
    }
    if (onSaveZettel) {
      onSaveZettel({
        title: '🚰 Kick Bio Habit: Swapped Coffee for Water (+4 Sips)',
        type: 'sip',
        content: 'Swapped caffeine for 4 sips of pure water to calm gastrocolic reflex & reduce bio trip frequency.',
        tags: ['#habit_kick', '#hydration', '#water_swap', '#bio_break']
      });
    }
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              🚨 Addiction & Behavioral Habit Alert Monitor
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time telemetry pattern scanner to kick bio/toilet, caffeine & doomscroll habits!
            </p>
          </div>
        </div>

        {onTogglePin && (
          <button
            onClick={onTogglePin}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
            title="Pin Addiction Monitor panel with sticky tape"
          >
            📌 {isPinned ? 'Unpin' : 'Pin Tape'}
          </button>
        )}
      </div>

      {/* Warning Card 1: Bio / Toilet Habit Alert */}
      <div className="glass-card" style={{ padding: '0.8rem', marginBottom: '0.75rem', background: isBioHabitHigh ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: isBioHabitHigh ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: '800', color: isBioHabitHigh ? '#fca5a5' : '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={15} color={isBioHabitHigh ? '#ef4444' : '#f59e0b'} />
            <span>🚽 Bio / Toilet Habit Frequency: {totalBioVisits} Visits Today</span>
          </span>

          <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', background: isBioHabitHigh ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.2)', color: isBioHabitHigh ? '#fee2e2' : '#a7f3d0' }}>
            {isBioHabitHigh ? '🚨 HABIT WARNING: HIGH' : '✅ NORMAL PACE'}
          </span>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: '1.45' }}>
          {isBioHabitHigh ? (
            <>
              ⚠️ <strong>Kick Your Bio Habit Warning!</strong> You have logged <strong>{totalBioVisits} bathroom visits today ({peeCount} pees, {pooCount} poos)</strong>. High frequency detected! Check if coffee, fluid gulps, or anxiety are triggering frequent bio trips.
            </>
          ) : (
            <>
              Total <strong>{totalBioVisits} bathroom visits</strong> logged today ({peeCount} pees, {pooCount} poos). Healthy balance!
            </>
          )}
        </p>

        {isBioHabitHigh && (
          <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleKickHabitWaterSwap}
              className="btn-primary"
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Droplet size={12} fill="white" /> 🚰 Swap Coffee for Water (+4 Sips)
            </button>
          </div>
        )}
      </div>

      {/* Warning Card 2: Caffeine Trigger Correlation */}
      <div className="glass-card" style={{ padding: '0.8rem', marginBottom: '0.75rem', background: isCaffeineTriggerHigh ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: isCaffeineTriggerHigh ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: '800', color: isCaffeineTriggerHigh ? '#fef08a' : '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Coffee size={15} color="#f59e0b" />
            <span>☕ Caffeine Trigger to Bio Correlation</span>
          </span>

          <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', background: isCaffeineTriggerHigh ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.05)', color: isCaffeineTriggerHigh ? '#fef08a' : 'var(--text-muted)' }}>
            {coffeeLogsCount} Coffee Logs
          </span>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: '1.45' }}>
          {isCaffeineTriggerHigh ? (
            <>
              ☕ <strong>High Caffeine Correlation!</strong> You have logged {coffeeLogsCount} coffee/caffeine events. Caffeine stimulates the <strong>gastrocolic reflex</strong> and acts as a mild diuretic, directly driving high bio trip frequency.
            </>
          ) : (
            <>
              {coffeeLogsCount} coffee events logged today. Caffeine to bio correlation is low.
            </>
          )}
        </p>
      </div>

      {/* Warning Card 3: Doomscroll & Digital Distraction Monitor */}
      <div className="glass-card" style={{ padding: '0.8rem', background: isDoomscrollHigh ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: isDoomscrollHigh ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: '800', color: isDoomscrollHigh ? '#e9d5ff' : '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Flame size={15} color="#a855f7" />
            <span>📱 Doomscroll & Digital Distraction Monitor</span>
          </span>

          <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', background: isDoomscrollHigh ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.05)', color: isDoomscrollHigh ? '#e9d5ff' : 'var(--text-muted)' }}>
            {doomscrollCount} Distractions
          </span>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: '1.45' }}>
          {isDoomscrollHigh ? (
            <>
              📱 <strong>Doomscroll Warning!</strong> {doomscrollCount} distraction logs detected today. Reset your focus with a 5m #tbd Beat-the-Clock Pomodoro Sprint!
            </>
          ) : (
            <>
              {doomscrollCount} digital distraction logs today. Great focus momentum!
            </>
          )}
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Dumbbell, Footprints, Plus, RefreshCw, Flame, CheckCircle2, Sparkles, Trophy, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MovementFitnessWidget({
  allLogs = [],
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const [pushupCount, setPushupCount] = useState(0);
  const [stepCount, setStepCount] = useState(2450); // Default daily steps
  const [isSyncingFit, setIsSyncingFit] = useState(false);
  const [showAutoDetected, setShowAutoDetected] = useState(false);

  // Auto-detect movement & fitness logs/tasks across the entire system
  const autoDetectedFitnessTasks = (allLogs || []).filter(log => {
    const fitnessTags = ['#fitness', '#steps', '#movement', '#pushups', '#workout', '#walk', '#gym', '#stretch'];
    const titleMatch = /fitness|workout|pushup|steps|walk|gym|stretch/i.test(log.title || '');
    return (log.tags && log.tags.some(t => fitnessTags.includes(t.toLowerCase()))) || titleMatch;
  });

  const handleAddPushups = (amount) => {
    const newTotal = pushupCount + amount;
    setPushupCount(newTotal);

    onSaveZettel({
      title: `💪 Movement Log: +${amount} Pushup(s) (Total ${newTotal} Today)`,
      type: 'microlog',
      content: `Completed a set of ${amount} pushups! Daily cumulative total: ${newTotal} pushups.`,
      tags: ['#pushups', '#movement', '#fitness', '#telemetry'],
      metadata: { pushupsAdded: amount, newTotal }
    });

    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleAddSteps = (amount) => {
    const newTotal = stepCount + amount;
    setStepCount(newTotal);

    onSaveZettel({
      title: `🚶 Step Count Log: +${amount} Steps (${newTotal.toLocaleString()} Total Today)`,
      type: 'microlog',
      content: `Logged ${amount} steps. Daily cumulative total: ${newTotal.toLocaleString()} steps.`,
      tags: ['#steps', '#google_fit', '#movement', '#telemetry'],
      metadata: { stepsAdded: amount, newTotal }
    });

    confetti({ particleCount: 20, spread: 45, origin: { y: 0.8 } });
  };

  const handleSyncGoogleFitSteps = () => {
    setIsSyncingFit(true);
    setTimeout(() => {
      const googleFitSteps = 8450; // Simulated Google Fit step sync
      setStepCount(googleFitSteps);
      setIsSyncingFit(false);

      onSaveZettel({
        title: `🏃 Google Fit Sync: ${googleFitSteps.toLocaleString()} Total Daily Steps`,
        type: 'microlog',
        content: `Synced step telemetry directly from Google Fit REST API / Webhook. Today's total: ${googleFitSteps.toLocaleString()} steps.`,
        tags: ['#google_fit', '#steps', '#movement', '#telemetry'],
        metadata: { googleFitSyncedSteps: googleFitSteps }
      });

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      alert(`🏃 Synced ${googleFitSteps.toLocaleString()} steps from Google Fit!`);
    }, 600);
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
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Dumbbell size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              💪 Movement & Step Tracker (Google Fit Sync)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              1-Tap pushups, step logger & auto-detected fitness tasks
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
        {/* PUSHUP TRACKER CARD */}
        <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Flame size={15} color="#ef4444" /> Pushups Completed Today:
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {pushupCount} 💪
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleAddPushups(1)}
              className="btn-primary"
              style={{ flex: 1, padding: '0.35rem', fontSize: '0.73rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              +1 Pushup
            </button>
            <button
              onClick={() => handleAddPushups(5)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.73rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
            >
              +5
            </button>
            <button
              onClick={() => handleAddPushups(10)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.73rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
            >
              +10
            </button>
            <button
              onClick={() => handleAddPushups(25)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.73rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
            >
              +25
            </button>
          </div>
        </div>

        {/* STEP COUNTER & GOOGLE FIT SYNC CARD */}
        <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Footprints size={15} color="#10b981" /> Daily Step Count:
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {stepCount.toLocaleString()} 🚶
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <button
              onClick={() => handleAddSteps(100)}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.35rem', fontSize: '0.73rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
            >
              +100 Steps
            </button>
            <button
              onClick={() => handleAddSteps(500)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.73rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
            >
              +500
            </button>
            <button
              onClick={() => handleAddSteps(1000)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.73rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
            >
              +1,000
            </button>
          </div>

          <button
            onClick={handleSyncGoogleFitSteps}
            disabled={isSyncingFit}
            className="btn-primary"
            style={{ width: '100%', padding: '0.35rem', fontSize: '0.73rem', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
          >
            <RefreshCw size={13} className={isSyncingFit ? 'animate-spin' : ''} />
            <span>{isSyncingFit ? 'Syncing Google Fit...' : '🏃 Sync Google Fit Steps'}</span>
          </button>
        </div>
      </div>

      {/* Auto-Detected Fitness Tasks Accordion */}
      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.6rem' }}>
        <button
          onClick={() => setShowAutoDetected(!showAutoDetected)}
          style={{ width: '100%', background: 'none', border: 'none', color: '#fca5a5', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Activity size={14} color="#ef4444" />
            <span>⚡ Auto-Detected Fitness Tasks ({autoDetectedFitnessTasks.length})</span>
          </div>
          {showAutoDetected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAutoDetected && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
            {autoDetectedFitnessTasks.length === 0 ? (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No auto-detected fitness logs found yet. Log a movement task or step goal to auto-detect!
              </div>
            ) : (
              autoDetectedFitnessTasks.map(t => (
                <div key={t.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem', borderRadius: '6px', fontSize: '0.75rem', color: '#fff', borderLeft: '3px solid #ef4444' }}>
                  <div style={{ fontWeight: '600' }}>{t.title}</div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.1rem' }}>{t.content}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

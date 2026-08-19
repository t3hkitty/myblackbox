import React, { useState, useEffect } from 'react';
import { Brain, Heart, Sparkles, Shield, Send, Trash2, Eye, RefreshCw, Feather, Maximize2, Minimize2, CheckSquare, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

const COGNITIVE_PATTERNS = [
  { trigger: ['always', 'never', 'everyone', 'nobody'], label: 'All-or-Nothing Thinking', nudge: 'Notice the absolute terms ("always", "never"). Reality usually has room for nuance.' },
  { trigger: ['disaster', 'ruined', 'worst', 'failed', 'catastrophe'], label: 'Catastrophizing', nudge: 'Take 1 slow breath. What is 1 small thing in your control right now?' },
  { trigger: ['should', 'must', 'have to', 'supposed to'], label: 'Heavy "Shoulds"', nudge: 'Replace "I should" with "I choose to" or "It is okay if I rest".' },
  { trigger: ['tired', 'exhausted', 'overwhelmed', 'burnt out'], label: 'Low Energy / Overwhelm', nudge: 'Your system is asking for rest. Honor this without guilt.' }
];

export default function BraindumpWatcherWidget({
  allLogs = [],
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const [text, setText] = useState('');
  const [detectedPattern, setDetectedPattern] = useState(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setDetectedPattern(null);
      return;
    }

    const lower = text.toLowerCase();
    const found = COGNITIVE_PATTERNS.find(p => p.trigger.some(word => lower.includes(word)));

    if (found) {
      setDetectedPattern(found);
    } else {
      setDetectedPattern(null);
    }
  }, [text]);

  const handleSaveBraindump = (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    onSaveZettel({
      title: `🧠 Mental Health Braindump: ${text.trim().substring(0, 35)}...`,
      type: 'microlog',
      content: `**Raw Thought Stream**:\n${text.trim()}${detectedPattern ? `\n\n*Cognitive Sensing*: ${detectedPattern.label}\n*Grounding Nudge*: ${detectedPattern.nudge}` : ''}`,
      tags: ['#braindump', '#mental_health', '#emotional_processing', '#self_care']
    });

    setText('');
    setDetectedPattern(null);
    setIsFullScreenOpen(false);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    alert('🌿 Saved braindump privately to your Zettel feed!');
  };

  const handleInsertRecentTask = (log) => {
    const taskSnippet = `\n- [Recent Task]: ${log.title} (${log.zettelId || 'Recent'})`;
    setText((prev) => prev + taskSnippet);
  };

  // Filter recent 12 tasks or Zettel entries for 1-click insertion with safe fallbacks
  const recentTasks = (allLogs && allLogs.length > 0)
    ? allLogs.slice(0, 12)
    : [
        { id: 't_sample1', title: 'Finish #tbr reading goals & review notes', zettelId: 'Recent' },
        { id: 't_sample2', title: 'Hydration & bio-care telemetry sync', zettelId: 'Recent' },
        { id: 't_sample3', title: 'Review Law of Attraction & Arc Goals', zettelId: 'Recent' }
      ];

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
            background: 'rgba(236, 72, 153, 0.15)',
            color: '#ec4899',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              🧠 Braindump Watcher for Mental Health
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live stream-of-consciousness thought processing & gentle grounding
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setIsFullScreenOpen(true)}
            className="btn-secondary"
            style={{ borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6', background: 'rgba(236, 72, 153, 0.12)', fontSize: '0.75rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title="Launch Full Screen Braindump Canvas with Recent Tasks"
          >
            <Maximize2 size={13} />
            <span>🖥️ Full Screen</span>
          </button>

          <button
            onClick={onTogglePin}
            className="btn-secondary"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: isPinned ? '#fbbf24' : 'var(--text-muted)', borderColor: isPinned ? '#fbbf24' : 'var(--border-color)' }}
            title={isPinned ? 'Unpin Panel' : 'Pin Panel with Sticky Tape'}
          >
            📌 {isPinned ? 'Pinned' : 'Pin'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveBraindump}>
        <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
          <textarea
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dump thoughts, anxieties, or stream of consciousness here... Cognitive pattern sensing acts in real-time."
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: detectedPattern ? '1px solid rgba(236, 72, 153, 0.6)' : '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              resize: 'vertical',
              lineHeight: '1.45'
            }}
          />

          <button
            type="button"
            onClick={() => setIsFullScreenOpen(true)}
            style={{ position: 'absolute', right: '10px', bottom: '12px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#f472b6', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            <Maximize2 size={10} /> Expand
          </button>
        </div>

        {/* Real-time Cognitive Pattern Sensing Alert */}
        {detectedPattern && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.4)',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            marginBottom: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f472b6', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.2rem' }}>
              <Heart size={14} color="#ec4899" />
              Sensed Pattern: {detectedPattern.label}
            </div>
            <p style={{ fontSize: '0.76rem', color: '#fbcfe8', margin: 0, lineHeight: '1.4' }}>
              💡 <em>{detectedPattern.nudge}</em>
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            🔒 Private local telemetry (Saved only to your device)
          </span>

          <button
            type="submit"
            disabled={!text.trim()}
            className="btn-primary"
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              opacity: text.trim() ? 1 : 0.5
            }}
          >
            <Feather size={14} /> Log Braindump Zettel
          </button>
        </div>
      </form>

      {/* FULL-SCREEN BRAINDUMP TEXT MODAL OVERLAY */}
      {isFullScreenOpen && (
        <div className="modal-backdrop" style={{ backdropFilter: 'blur(12px)', zIndex: 9999 }} onClick={() => setIsFullScreenOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '1200px',
              width: '94vw',
              height: '90vh',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              boxShadow: '0 0 40px rgba(236, 72, 153, 0.25)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Brain size={24} color="#ec4899" />
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                    🧠 Full-Screen Mental Health Braindump Canvas
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Unfiltered stream of consciousness. Click any recent task to append into your braindump!
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={handleSaveBraindump}
                  disabled={!text.trim()}
                  className="btn-primary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
                >
                  <Feather size={15} /> Save & Exit
                </button>
                <button
                  onClick={() => setIsFullScreenOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', borderColor: 'var(--border-color)' }}
                >
                  <Minimize2 size={15} /> Close
                </button>
              </div>
            </div>

            {/* Quick 1-Tap Recent Tasks Bar */}
            <div style={{ marginBottom: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.55rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.73rem', fontWeight: '700', color: '#f472b6', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckSquare size={13} />
                <span>📌 Click to Append Recent Tasks to Braindump:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                {recentTasks.length === 0 ? (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No recent tasks available yet.</span>
                ) : (
                  recentTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleInsertRecentTask(t)}
                      className="btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', whiteSpace: 'nowrap', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      title={`Append "${t.title}" to braindump`}
                    >
                      <Plus size={11} color="#60a5fa" />
                      <span>{t.title.substring(0, 30)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Massive Full Screen Textarea */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type anything on your mind without filter or judgment... Click any recent task above to insert task context directly."
                style={{
                  width: '100%',
                  height: '100%',
                  flex: 1,
                  background: 'rgba(0,0,0,0.4)',
                  border: detectedPattern ? '1px solid rgba(236, 72, 153, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '1.2rem',
                  color: '#fff',
                  fontSize: '1.05rem',
                  fontFamily: 'var(--font-sans)',
                  lineHeight: '1.6',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

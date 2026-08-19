import React, { useState } from 'react';
import { Heart, Sparkles, RefreshCw, Feather, CheckCircle2, ShieldAlert, Compass, Coffee, Utensils, MessageSquare, BookOpen, PenTool, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

const TOUGH_LOVE_REFRAMES = [
  {
    harsh: "You're being lazy and falling behind!",
    kind: "Your battery is low; taking a strategic rest break now empowers your next build cycle.",
    tag: "#self_compassion"
  },
  {
    harsh: "You should have finished this task hours ago!",
    kind: "Pacing yourself prevents burnout; making today a non-zero day is more than enough.",
    tag: "#pacing"
  },
  {
    harsh: "Why can't you just focus and stop procrastinating?!",
    kind: "Sensory overload is real; let's reduce environment friction and take 1 small micro-step.",
    tag: "#low_friction"
  },
  {
    harsh: "You completely wasted today!",
    kind: "Every micro-entry counts. Logging 1 sip, task, or thought keeps your momentum alive.",
    tag: "#non_zero_day"
  }
];

const C4_CREATOR_CYCLES = [
  { id: 'create', label: '🎨 Create', icon: PenTool, color: '#10b981', desc: 'Write Zettel cards, code apps, design interfaces, build ideas.' },
  { id: 'consume', label: '📚 Consume', icon: BookOpen, color: '#60a5fa', desc: 'Read #tbr backlog books, watch shows, listen to music.' },
  { id: 'chat', label: '💬 Chat', icon: MessageSquare, color: '#ec4899', desc: 'Live micro-tweet, vent in braindump, converse with Gemini AI.' },
  { id: 'collaborate', label: '🤝 Collaborate', icon: Users, color: '#a78bfa', desc: 'Pair-program, export posts to Blogger/WordPress, share work.' },
  { id: 'chow_down', label: '🍱 Chow Down', icon: Utensils, color: '#f59e0b', desc: 'Fuel the body with hydration, nutrients, sips, and bio-care.' },
  { id: 'calm', label: '🧘 Calm', icon: Heart, color: '#34d399', desc: 'Reset, allow low-stimulation processing time, honor rest.' }
];

export default function SelfCompassionC4EngineWidget({
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const [activeReframeIdx, setActiveReframeIdx] = useState(0);
  const [customHarshText, setCustomHarshText] = useState('');
  const [activeCycle, setActiveCycle] = useState(C4_CREATOR_CYCLES[0]);

  const handleNextReframe = () => {
    setActiveReframeIdx((prev) => (prev + 1) % TOUGH_LOVE_REFRAMES.length);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const handleLogC4Phase = (cycle) => {
    onSaveZettel({
      title: `🔄 Creator Cycle Phase: ${cycle.label}`,
      type: 'microlog',
      content: `**Current Cycle Focus**: ${cycle.label}\n**Guidance**: ${cycle.desc}`,
      tags: ['#c4_engine', `#${cycle.id}`, '#creator_cycle']
    });
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    alert(`🔄 Logged creator cycle phase ${cycle.label} to Zettel timeline!`);
  };

  const currentReframe = TOUGH_LOVE_REFRAMES[activeReframeIdx];

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
            color: '#f472b6',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Heart size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              ❤️ Self-Compassion & C4 Creator Cycle Engine
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Kind self-talk reframer & Create/Consume/Chat/Collaborate/Chow Down/Calm cycle
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

      {/* SECTION 1: Tough Love Phrase Re-framer */}
      <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1rem', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f472b6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} color="#ec4899" />
            <span>Kindness Reminder: Replace "Tough Love" Self-Talk</span>
          </div>

          <button
            onClick={handleNextReframe}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6' }}
          >
            <RefreshCw size={12} /> Next Reframe
          </button>
        </div>

        <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
          <span style={{ textDecoration: 'line-through', color: '#fca5a5', opacity: 0.8, display: 'block' }}>
            ❌ Harsh Self-Talk: "{currentReframe.harsh}"
          </span>
          <strong style={{ color: '#34d399', display: 'block', marginTop: '0.2rem', fontSize: '0.82rem' }}>
            🟢 Kind Alternative: "{currentReframe.kind}"
          </strong>
        </div>
      </div>

      {/* SECTION 2: The C4 Creator & Maker Cycle Engine */}
      <div style={{ marginBottom: '0.4rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Compass size={16} color="#60a5fa" />
          <span>🔄 The C4 Creator & Maker Cycle Engine:</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.4rem' }}>
          {C4_CREATOR_CYCLES.map(c => {
            const Icon = c.icon;
            const isSelected = activeCycle.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCycle(c);
                  handleLogC4Phase(c);
                }}
                className="btn-secondary"
                style={{
                  padding: '0.5rem 0.4rem',
                  fontSize: '0.73rem',
                  borderColor: isSelected ? c.color : 'var(--border-color)',
                  background: isSelected ? `${c.color}25` : 'rgba(0,0,0,0.25)',
                  color: isSelected ? c.color : 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  textAlign: 'center'
                }}
              >
                <Icon size={16} color={c.color} />
                <span style={{ fontWeight: '700' }}>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Cycle Description Card */}
        <div style={{ fontSize: '0.74rem', color: '#e2e8f0', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', marginTop: '0.5rem', border: `1px solid ${activeCycle.color}44` }}>
          <strong style={{ color: activeCycle.color }}>Active Phase: {activeCycle.label}</strong> — {activeCycle.desc}
        </div>
      </div>
    </div>
  );
}

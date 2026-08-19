import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Brain, Lightbulb, Sparkles, CheckCircle2, Shield, RefreshCw, Key, ExternalLink, Zap, Flame, Wind, Play, Pause, RotateCcw, Compass, PenTool, MessageSquare, Users, Utensils } from 'lucide-react';
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

export default function BestPracticesWidget({
  onOpenSettings,
  onSaveZettel
}) {
  const [activeTab, setActiveTab] = useState('protocol'); // 'protocol' | 'c4_compassion' | 'mental_health' | 'integrations'
  
  // Interactive 1-Minute Grounding Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Breathe In... 🫁');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(60);

  // Self Compassion & C4 State
  const [activeReframeIdx, setActiveReframeIdx] = useState(0);
  const [activeCycle, setActiveCycle] = useState(C4_CREATOR_CYCLES[0]);

  useEffect(() => {
    let ticker = null;
    if (isBreathingActive && breathSecondsLeft > 0) {
      ticker = setInterval(() => {
        setBreathSecondsLeft(prev => {
          const nextSec = prev - 1;
          const cycleSec = (60 - nextSec) % 12;
          if (cycleSec < 4) setBreathPhase('Inhale Slowly... 🌬️ (4s)');
          else if (cycleSec < 8) setBreathPhase('Hold Breath... ⏸️ (4s)');
          else setBreathPhase('Exhale Gently... 💨 (4s)');

          if (nextSec <= 0) {
            clearInterval(ticker);
            setIsBreathingActive(false);
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
            setBreathPhase('✨ Grounding Break Complete! Feel Restored.');
            return 0;
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(ticker);
  }, [isBreathingActive, breathSecondsLeft]);

  const handleStartBreathing = () => {
    setBreathSecondsLeft(60);
    setBreathPhase('Inhale Slowly... 🌬️ (4s)');
    setIsBreathingActive(true);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const handleNextReframe = () => {
    setActiveReframeIdx((prev) => (prev + 1) % TOUGH_LOVE_REFRAMES.length);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const handleLogC4Phase = (cycle) => {
    if (onSaveZettel) {
      onSaveZettel({
        title: `🔄 Creator Cycle Phase: ${cycle.label}`,
        type: 'microlog',
        content: `**Current Cycle Focus**: ${cycle.label}\n**Guidance**: ${cycle.desc}`,
        tags: ['#c4_engine', `#${cycle.id}`, '#creator_cycle']
      });
    }
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const currentReframe = TOUGH_LOVE_REFRAMES[activeReframeIdx];

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
            <BookOpen size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              myBlackbox Protocol Guide & Mental Health Companion
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Creation timestamp pairs, C4 Creator Cycle, Self-Compassion & Mental Health
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.04)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('protocol')}
            style={{
              background: activeTab === 'protocol' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: activeTab === 'protocol' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.73rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📖 Protocol
          </button>

          <button
            onClick={() => setActiveTab('c4_compassion')}
            style={{
              background: activeTab === 'c4_compassion' ? 'rgba(236, 72, 153, 0.25)' : 'transparent',
              color: activeTab === 'c4_compassion' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.73rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ❤️ C4 & Compassion
          </button>

          <button
            onClick={() => setActiveTab('mental_health')}
            style={{
              background: activeTab === 'mental_health' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: activeTab === 'mental_health' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.73rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            💚 Mental Health
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            style={{
              background: activeTab === 'integrations' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: activeTab === 'integrations' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.73rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ⚙️ Integrations
          </button>
        </div>
      </div>

      {/* Tab 1: Protocol Cheat Sheet */}
      {activeTab === 'protocol' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Protocol 1: Creation Timestamp Pairs */}
          <div className="glass-card" style={{ padding: '0.8rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#93c5fd', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>⏱️ 1. Zero-Timer Protocol: Creation Timestamp Pairs ($T_2 - T_1$)</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
              Task pairs require <strong>zero ticking stopwatch timers</strong>! Simply log a <code>Start Task</code> event ($T_1$) and a <code>Complete Task</code> event ($T_2$). Duration is calculated automatically from creation timestamps:
              {"$$\\Delta t = \\text{Date}(T_2) - \\text{Date}(T_1)$$" }
            </p>
          </div>

          {/* Protocol 2: Toilet Excretion Auto-Classifier */}
          <div className="glass-card" style={{ padding: '0.8rem', background: 'rgba(180, 83, 9, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fef08a', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>💩 ➔ 🚽 2. Single-Tap Bio Break Telemetry (Pee 🚽 & Poop 💩)</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
              Biological breaks are logged via <strong>1-tap confirmations</strong> without complex task pairing over-engineering! Tracks frequency, hydration, and excretion health seamlessly.
            </p>
          </div>

          {/* Protocol 3: 5m Beat-The-Clock Pomodoro Sprint */}
          <div className="glass-card" style={{ padding: '0.8rem', background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fcd34d', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🔥 3. #tbd 5-Minute "Beat The Clock" Dopamine Pomodoro Sprint</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
              Ideas in your <strong>💡 #tbd Backlog</strong> do NOT need pairing! Click <strong>🔥 5m Sprint</strong> to launch a 5-minute gamified countdown timer. Finish before time expires for a <strong>+50 Dopamine Victory Points</strong> boost!
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Integrated C4 Creator & Self-Compassion Engine */}
      {activeTab === 'c4_compassion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {/* SECTION 1: Tough Love Phrase Re-framer */}
          <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '8px' }}>
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
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Compass size={16} color="#60a5fa" />
              <span>🔄 The C4 Creator & Maker Cycle Engine:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem' }}>
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
                      padding: '0.45rem 0.35rem',
                      fontSize: '0.72rem',
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
                    <Icon size={15} color={c.color} />
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
      )}

      {/* Tab 3: Mental Health Companion & Grounding Break */}
      {activeTab === 'mental_health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#a7f3d0', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Heart size={18} color="#10b981" />
              <span>Remind to Be Kind: Gentle Self-Awareness Principle</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#e2e8f0', margin: 0, lineHeight: '1.5' }}>
              Telemetry logging and blackbox micrologging exist purely for <strong>gentle self-awareness, pattern discovery, and mental clarity</strong> — <em>never self-judgment or guilt!</em> Track your day as a compassionate observer.
            </p>
          </div>

          {/* Interactive 1-Min Grounding Breathing Box */}
          <div className="glass-card" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 165, 233, 0.25) 100%)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#67e8f9', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Wind size={18} color="#06b6d4" />
              <span>🧘 1-Minute Grounding & Deep Breathing Break</span>
            </div>

            {isBreathingActive ? (
              <div style={{ padding: '0.8rem 0' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.4rem' }}>
                  {breathPhase}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#67e8f9', fontFamily: 'monospace' }}>
                  00:{String(breathSecondsLeft).padStart(2, '0')}
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <button onClick={() => setIsBreathingActive(false)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#f87171' }}>
                    Pause Break
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.76rem', color: '#cffaff', marginBottom: '0.8rem' }}>
                  Feeling overwhelmed or stuck? Take 60 seconds to regulate your vagus nerve with 4-second box breathing!
                </p>
                <button
                  onClick={handleStartBreathing}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Wind size={15} /> 🧘 Start 1-Min Grounding Break
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Integrations & Google Sync Cheat Sheet */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#e9d5ff', marginBottom: '0.4rem' }}>
              ⚙️ Google Tasks REST API & OAuth 2.0 Integration
            </div>
            <p style={{ fontSize: '0.76rem', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
              • <strong>OAuth Token</strong>: Requires a valid Google OAuth Access Token with <code>https://www.googleapis.com/auth/tasks</code> scope.
              <br />
              • <strong>1-Click Token Refresh</strong>: Click <strong>⚡ 1-Click Token</strong> on the task widget to generate a fresh token via Google OAuth Playground.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#93c5fd', marginBottom: '0.4rem' }}>
              📁 Google Drive Flat-File .md Backup & Google Keep Clipboard Sync
            </div>
            <p style={{ fontSize: '0.76rem', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
              • <strong>Google Drive /Drive/Apps/myBlackbox/</strong>: All Zettel notes are auto-converted to flat markdown (<code>.md</code>) files.
              <br />
              • <strong>Google Keep Sync</strong>: Formats note text, copies to your clipboard (<code>Ctrl+V</code>), and launches <code>keep.google.com</code> in 1 click!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

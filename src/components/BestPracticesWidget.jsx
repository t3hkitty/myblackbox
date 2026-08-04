import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, AlertCircle, Calendar, Clock, ArrowDownUp, Zap, Sparkles, AlertTriangle, Settings, Heart, Brain, Lightbulb, RefreshCw, Dices, Bookmark } from 'lucide-react';
import { getZettelTimestamp, formatDuration } from '../utils/timeUtils';
import { getTaskListConfig } from '../services/blackboxStorage';
import confetti from 'canvas-confetti';

export default function BestPracticesWidget({
  onStartBlackboxTask,
  onOpenSettings
}) {
  const [activeTab, setActiveTab] = useState('roundtoit'); // 'roundtoit' | 'best_practices' | 'mental_health'
  const [listConfig, setListConfig] = useState({ liveListName: 'blackbox', backlogListName: 'roundtoit' });
  const [suggestedIdea, setSuggestedIdea] = useState(null);

  useEffect(() => {
    setListConfig(getTaskListConfig());
  }, []);

  const oldestFirstTasks = [
    {
      id: 'r_task_1',
      title: 'Audit obsidian vault & update zettel index',
      createdPT: '20260701-0900',
      category: 'Zettel Maintenance',
      ageDays: 33,
      tags: ['#roundtoit', '#zettel']
    },
    {
      id: 'r_task_2',
      title: 'Review home water filter replacement specs',
      createdPT: '20260710-1400',
      category: 'Home Projects',
      ageDays: 24,
      tags: ['#roundtoit', '#home']
    },
    {
      id: 'r_task_3',
      title: 'Clean out digital downloads folder & archive .md backups',
      createdPT: '20260718-1630',
      category: 'Digital Housekeeping',
      ageDays: 16,
      tags: ['#roundtoit', '#maintenance']
    },
    {
      id: 'r_task_4',
      title: 'Read Chapter 5 of Andy Weir sci-fi book',
      createdPT: '20260725-1100',
      category: 'Reading & Curiosity',
      ageDays: 9,
      tags: ['#roundtoit', '#reading']
    }
  ];

  const handleSuggestBoredomIdea = () => {
    const randomPick = oldestFirstTasks[Math.floor(Math.random() * oldestFirstTasks.length)];
    setSuggestedIdea(randomPick);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.75 } });
  };

  const dueSoonTasks = oldestFirstTasks.filter(t => t.dueDatePT && t.dueDatePT.startsWith(getZettelTimestamp().substring(0, 8)));

  const handleConvertRoundtoitToActive = (task) => {
    onStartBlackboxTask(task.title);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

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
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Protocol Guide & Mental Health Best Practices
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Micrologging protocol, mental health impact & Google Tasks integration
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.04)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('roundtoit')}
            style={{
              background: activeTab === 'roundtoit' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: activeTab === 'roundtoit' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📋 Backlog ({oldestFirstTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('best_practices')}
            style={{
              background: activeTab === 'best_practices' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: activeTab === 'best_practices' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📖 Micrologging
          </button>
          <button
            onClick={() => setActiveTab('mental_health')}
            style={{
              background: activeTab === 'mental_health' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: activeTab === 'mental_health' ? '#34d399' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            💚 Mental Health
          </button>
        </div>
      </div>

      {/* Remind to Be Kind Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Heart size={18} color="#34d399" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.78rem', color: '#ecfdf5', lineHeight: '1.3' }}>
          <strong>Remind to Be Kind</strong>: Telemetry logging is for gentle self-awareness, pattern discovery, and mental clarity — <em>never self-judgment!</em>
        </div>
      </div>

      {/* Google Tasks Lists Detection Banner */}
      <div className="glass-card" style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1rem', padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.78rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={14} color="#34d399" />
            "{listConfig.liveListName}" List: <strong style={{ color: '#fff' }}>ACTIVE ✓</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={14} color="#34d399" />
            "{listConfig.backlogListName}" List: <strong style={{ color: '#fff' }}>ACTIVE ✓</strong>
          </div>
        </div>

        <button onClick={onOpenSettings} className="btn-secondary" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }} title="Configure custom list names">
          <Settings size={12} />
          <span>Switch Lists</span>
        </button>
      </div>

      {activeTab === 'roundtoit' ? (
        <div>
          {/* Idea Storage & Timeless Backlog Header */}
          <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Bookmark size={15} color="#a78bfa" />
                💡 Idea Storage Vault ("{listConfig.backlogListName}")
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                No Strict Due Dates Required!
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.6rem' }}>
              Roundtoits are timeless ideas, curious backlog projects, and boredom cures — zero pressure, zero deadlines. Use when looking for inspiration!
            </p>

            <button
              onClick={handleSuggestBoredomIdea}
              className="btn-primary"
              style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Dices size={15} /> 🎲 I'm Bored! Suggest a "{listConfig.backlogListName}" Idea
            </button>
          </div>

          {/* Boredom Picked Idea Card */}
          {suggestedIdea && (
            <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', marginBottom: '0.8rem', padding: '0.8rem' }}>
              <div style={{ fontSize: '0.73rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                ✨ Boredom Picked Idea:
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>
                {suggestedIdea.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#a78bfa', background: 'rgba(139, 92, 246, 0.2)', padding: '2px 8px', borderRadius: '10px' }}>
                  {suggestedIdea.category} • {suggestedIdea.ageDays}d old
                </span>
                <button
                  onClick={() => handleConvertRoundtoitToActive(suggestedIdea)}
                  className="btn-primary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <Zap size={12} /> Start Idea
                </button>
              </div>
            </div>
          )}

          {/* Oldest-First Backlog Overview Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowDownUp size={12} /> Oldest-First Idea Vault:
            </span>
          </div>

          {/* Oldest-First Tasks Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
            {oldestFirstTasks.map(t => (
              <div key={t.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.7rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{t.title}</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '1px 6px', borderRadius: '4px' }}>
                      {t.ageDays}d old
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Created: {t.createdPT} PT
                  </div>
                </div>

                <button
                  onClick={() => handleConvertRoundtoitToActive(t)}
                  className="btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                  title="Start task in Blackbox live tracker"
                >
                  <Zap size={12} color="#60a5fa" /> Start Task
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'mental_health' ? (
        /* Mental Health & Self-Care Guide */
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontWeight: '700', color: '#34d399', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Brain size={14} /> 🧠 Impact on Mental Health & Focus
            </div>
            Micrologging removes cognitive friction. By logging micro-events (+1 sip, #meds, mood tick) in 2 seconds, you offload working memory strain without interrupting your flow.
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.06)', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ fontWeight: '700', color: '#60a5fa', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Lightbulb size={14} /> 🗑️ The Power of the Brain Dump
            </div>
            Unprocessed thoughts create background anxiety ("open cognitive loops"). Instant micrologging acts as a mental release valve, safely archiving thoughts into flat-file Zettel cards.
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.06)', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontWeight: '700', color: '#fcd34d', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Heart size={14} /> 💚 Gentle Pattern Discovery
            </div>
            The Airplane Blackbox Corollary Engine correlates past low states (`😭`, `😔`) with missing factors (`#sip`, `#meds`, `#chocolate`) to help you care for your body proactively.
          </div>
        </div>
      ) : (
        /* Protocol Best Practices Guide */
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#fff' }}>1. Zettelkasten Timestamping Protocol</strong>: Every microlog begins with Pacific Time serialization (`YYYYMMDD-HHMM`) for flat-file indexing.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#fff' }}>2. Low-Friction Telemetry</strong>: Use 1-tap triggers (+1 Sip, #meds, #chocolate) to maintain continuous logging flow without breaking focus.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#fff' }}>3. Decoupled Flat-File Architecture</strong>: Your data belongs to you — stored in standard Notion/Obsidian Markdown formats.
          </div>
        </div>
      )}
    </div>
  );
}

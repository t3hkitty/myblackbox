import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, BookOpen, Tv, Film, Sparkles, Zap, Clock, Pin, Bookmark, Copy, Check, Share2, HelpCircle, X, GraduationCap, Briefcase, Heart, Coffee, Shield, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';

const ASSOCIATION_TYPES = [
  { id: 'general', label: '⚡ General / Mind', icon: Zap, tag: '#litany', defaultTitle: 'General Thought & Focus' },
  { id: 'school', label: '🎓 School / Class', icon: GraduationCap, tag: '#school', defaultTitle: 'Biology 101' },
  { id: 'work', label: '💼 Work / Project', icon: Briefcase, tag: '#work', defaultTitle: 'Code Sprint & Build' },
  { id: 'reading', label: '📖 Book / Ebook', icon: BookOpen, tag: '#reading', defaultTitle: 'The Crafting of Chess' },
  { id: 'plushie', label: '🧸 Plushie / Relic', icon: Heart, tag: '#plushie', defaultTitle: 'Loki God of Stories Statue' },
  { id: 'media', label: '📺 TV / Movie / VOD', icon: Tv, tag: '#media', defaultTitle: 'Severance Season 2' },
  { id: 'routine', label: '☕ Routine / Sustenance', icon: Coffee, tag: '#routine', defaultTitle: 'Matcha & Electrolyte Break' },
  { id: 'account', label: '💳 Account / Ledger', icon: Shield, tag: '#account', defaultTitle: 'Google Workspace Sub' }
];

const PRESET_ENTITIES = [
  { id: 'ent_1', title: 'Biology 101 - Cell Membrane Task', type: 'school', tag: '#school' },
  { id: 'ent_2', title: 'Sovereign Code Refactor & FTP Deploy', type: 'work', tag: '#work' },
  { id: 'ent_3', title: 'The Crafting of Chess - Chapter 14', type: 'reading', tag: '#reading' },
  { id: 'ent_4', title: 'Loki God of Stories Mint Statue', type: 'plushie', tag: '#plushie' },
  { id: 'ent_5', title: 'Morning Hydration & Circadian Fuel', type: 'routine', tag: '#routine' }
];

export default function RunningLitanyBar({
  allLogs = [],
  activeBookTitle,
  populatedMediaItem,
  onSaveTweet,
  onPostMicroTweet,
  onStartBlackboxTask,
  isPinned,
  onTogglePin
}) {
  const [assocType, setAssocType] = useState('general'); // 'general' | 'school' | 'work' | 'reading' | 'plushie' | 'media' | 'routine' | 'account'
  const [assocTitle, setAssocTitle] = useState(activeBookTitle || '');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [headlineText, setHeadlineText] = useState('');
  const [reactionComment, setReactionComment] = useState('');
  const [isTaskActive, setIsTaskActive] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    if (populatedMediaItem && populatedMediaItem.title) {
      setAssocTitle(populatedMediaItem.title);
      if (populatedMediaItem.type) {
        if (populatedMediaItem.type === 'book') setAssocType('reading');
        else if (populatedMediaItem.type === 'plushie') setAssocType('plushie');
        else if (populatedMediaItem.type === 'school') setAssocType('school');
        else if (populatedMediaItem.type === 'work') setAssocType('work');
        else setAssocType('media');
      }
    }
  }, [populatedMediaItem]);

  const activeAssocObj = ASSOCIATION_TYPES.find(m => m.id === assocType) || ASSOCIATION_TYPES[0];

  // Filter posted litany entries from allLogs
  const litanyEntries = allLogs.filter(log => {
    if (!log.tags || !Array.isArray(log.tags)) return false;
    return log.tags.includes('#litany') || log.tags.includes('#running_litany') || log.tags.includes('#micro_tweet') || log.type === 'microlog';
  });

  const handleSelectEntityPreset = (e) => {
    const val = e.target.value;
    setSelectedEntity(val);
    if (!val) return;

    const found = PRESET_ENTITIES.find(r => r.id === val || r.title === val);
    if (found) {
      setAssocTitle(found.title);
      if (found.type) setAssocType(found.type);
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
    }
  };

  const handleStartLitanyTask = () => {
    const currentTitle = assocTitle.trim() || activeAssocObj.defaultTitle;
    if (onStartBlackboxTask) {
      onStartBlackboxTask(`[${activeAssocObj.label}] ${currentTitle}`);
    }
    setIsTaskActive(true);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handlePostLitanyPulse = (e) => {
    e.preventDefault();
    if (!headlineText.trim() && !reactionComment.trim()) return;

    const currentTitle = assocTitle.trim() || activeAssocObj.defaultTitle;
    const litanyObj = {
      title: `⚡ Litany: ${currentTitle}`,
      type: 'microlog',
      content: `> "${headlineText.trim()}"\n\n**Litany Pulse Reaction**: ${reactionComment.trim()}`,
      tags: ['#litany', '#running_litany', activeAssocObj.tag, '#telemetry'],
      metadata: { entityTitle: currentTitle, entityType: assocType, headline: headlineText.trim(), reaction: reactionComment.trim() }
    };

    if (onPostMicroTweet) onPostMicroTweet(litanyObj);
    else if (onSaveTweet) onSaveTweet(litanyObj);

    setHeadlineText('');
    setReactionComment('');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleCopyLitanyText = (t) => {
    const textToCopy = `${t.title}\n${t.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="glass-panel" style={{ margin: '0 1rem 1.5rem 1rem', padding: '1rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.4rem', borderRadius: '10px' }}>
            <Zap size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>⚡ Running Litany Stream</span>
              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}>
                ASSOCIATED WITH ANYTHING
              </span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Log live thoughts, sprint telemetry, or reactions associated with any school task, work project, plushie, or book
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className="btn-secondary"
              style={{
                padding: '0.3rem 0.6rem',
                fontSize: '0.72rem',
                color: isPinned ? '#f59e0b' : 'var(--text-muted)',
                borderColor: isPinned ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)',
                background: isPinned ? 'rgba(245, 158, 11, 0.15)' : 'transparent'
              }}
            >
              <Pin size={12} /> {isPinned ? 'Pinned' : 'Pin Bar'}
            </button>
          )}

          <button
            onClick={() => setShowHelpModal(true)}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#93c5fd' }}
          >
            <HelpCircle size={13} /> Help
          </button>
        </div>
      </div>

      {/* Association Type Selector Chips */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        {ASSOCIATION_TYPES.map(a => {
          const IconComp = a.icon;
          const isSelected = assocType === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setAssocType(a.id)}
              className="btn-secondary"
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.72rem',
                whiteSpace: 'nowrap',
                borderColor: isSelected ? '#f59e0b' : 'var(--border-color)',
                background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(0,0,0,0.2)',
                color: isSelected ? '#fcd34d' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: isSelected ? '800' : '500'
              }}
            >
              <IconComp size={13} />
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Entity Title Input & Preset Quick Picker */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={assocTitle}
          onChange={(e) => setAssocTitle(e.target.value)}
          placeholder={`Associated Item / Entity Name (e.g. ${activeAssocObj.defaultTitle})...`}
          style={{
            flex: 1,
            minWidth: '220px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.4rem 0.6rem',
            color: '#fff',
            fontSize: '0.78rem'
          }}
        />

        <select
          value={selectedEntity}
          onChange={handleSelectEntityPreset}
          style={{
            width: '200px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.4rem',
            color: '#fcd34d',
            fontSize: '0.75rem'
          }}
        >
          <option value="">⚡ Select Quick Preset...</option>
          {PRESET_ENTITIES.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <button
          onClick={handleStartLitanyTask}
          className="btn-primary"
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.75rem',
            background: isTaskActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Clock size={13} />
          <span>{isTaskActive ? '🔥 Sprint Active' : 'Start Focus Sprint'}</span>
        </button>
      </div>

      {/* Post Litany Pulse Form */}
      <form onSubmit={handlePostLitanyPulse} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={headlineText}
          onChange={(e) => setHeadlineText(e.target.value)}
          placeholder="Quote, Headline, or Primary Litany Pulse Thought..."
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.45rem 0.6rem',
            color: '#fff',
            fontSize: '0.78rem'
          }}
        />

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input
            type="text"
            value={reactionComment}
            onChange={(e) => setReactionComment(e.target.value)}
            placeholder="Private Reaction / Telemetry Subtext..."
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.4rem 0.6rem',
              color: '#fff',
              fontSize: '0.75rem'
            }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.75rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: '800'
            }}
          >
            <Send size={13} />
            <span>Post Litany Pulse</span>
          </button>
        </div>
      </form>

      {/* Recent Litany Stream Log */}
      {litanyEntries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            📜 Recent Litany Pulses ({litanyEntries.length}):
          </div>

          {litanyEntries.map(entry => (
            <div key={entry.id} className="glass-card" style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>
                  {entry.title}
                </div>
                <button
                  onClick={() => handleCopyLitanyText(entry)}
                  className="btn-secondary"
                  style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                >
                  {copiedId === entry.id ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                  <span>{copiedId === entry.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                {entry.content}
              </div>

              {entry.tags && (
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }}>
                  {entry.tags.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', fontFamily: 'var(--font-mono)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-backdrop" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fcd34d', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={18} /> Running Litany & Universal Association Guide
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              The <strong>Running Litany Stream</strong> is your real-time continuous thought logger. Unlike legacy single-media micro-tweets, a <strong>Litany Pulse</strong> can be associated with <em>anything</em>:
            </p>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 0.8rem 1.2rem', padding: 0, lineHeight: '1.5' }}>
              <li>🎓 <strong>School</strong>: Class notes, teacher prompts, and homework tasks.</li>
              <li>💼 <strong>Work</strong>: Sprint tickets, code refactor breakthroughs, and meetings.</li>
              <li>🧸 <strong>Plushies & Collectibles</strong>: Relic notes and photo scene logs.</li>
              <li>📖 <strong>Books & Ebooks</strong>: Reading chapter reactions and quotes.</li>
              <li>☕ <strong>Routines & Sustenance</strong>: Matcha breaks, hydration, and circadian fuel.</li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowHelpModal(false)} className="btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

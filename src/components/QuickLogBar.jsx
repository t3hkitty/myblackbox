import React, { useState } from 'react';
import { Droplet, Smile, Pill, Cookie, BookOpen, CheckSquare, PlusCircle, Zap, Sparkles, MessageSquare, Tag, Check, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAutoTagSuggestions } from '../services/autoTagEngine';

export default function QuickLogBar({
  onLogSip,
  onLogPee,
  onOpenMoodModal,
  onQuickTagLog,
  onOpenEbookModal,
  onOpenQuickNoteModal,
  onOpenTaskModal,
  onOpenJournalModal,
  onOpenPhotoModal
}) {
  const [quickText, setQuickText] = useState('');
  const [acceptedTags, setAcceptedTags] = useState([]);

  const suggestions = getAutoTagSuggestions(quickText, acceptedTags);

  const triggerConfetti = () => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.85 }
    });
  };

  const handleAcceptSingleTag = (tag) => {
    if (!acceptedTags.includes(tag)) {
      setAcceptedTags([...acceptedTags, tag]);
    }
  };

  const handleAcceptAllSuggestions = () => {
    setAcceptedTags([...acceptedTags, ...suggestions]);
    triggerConfetti();
  };

  const handleSipClick = (count) => {
    onLogSip(count);
    triggerConfetti();
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickText.trim()) return;

    const finalTags = Array.from(new Set(['#telemetry', '#quick_note', ...acceptedTags]));

    onQuickTagLog({
      title: quickText.trim(),
      type: 'microlog',
      tags: finalTags
    });
    setQuickText('');
    setAcceptedTags([]);
    triggerConfetti();
  };

  return (
    <div className="glass-panel" style={{ margin: '0 1rem 1.5rem 1rem', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="#f59e0b" />
          <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#f3f4f6' }}>
            Low-Friction Microlog Triggers
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            (1-Tap Telemetry Logging)
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
        
        {/* Sip Quick Buttons */}
        <button className="btn-quick" onClick={() => handleSipClick(1)} style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <Droplet size={15} color="#06b6d4" />
          <span>+1 Sip</span>
        </button>

        <button className="btn-quick" onClick={() => handleSipClick(2)} style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <Droplet size={15} color="#06b6d4" />
          <span>+2 Sips</span>
        </button>

        <button className="btn-quick" onClick={() => handleSipClick(10)} style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <span>🍾 Bottle Refill</span>
        </button>

        {/* Pee Excretion Logger */}
        <button className="btn-quick" onClick={() => { onLogPee(); triggerConfetti(); }} style={{ borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)' }}>
          <span>🚽 +1 Pee Log</span>
        </button>

        {/* Mood Logger */}
        <button className="btn-quick" onClick={onOpenMoodModal} style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <Smile size={15} color="#f59e0b" />
          <span>Log Mood & State</span>
        </button>

        {/* Quick Tag Shortcuts */}
        <button className="btn-quick" onClick={() => { onQuickTagLog({ title: 'Meds / Medication Taken', tags: ['#meds', '#health'], type: 'microlog' }); triggerConfetti(); }}>
          <Pill size={15} color="#ec4899" />
          <span>💊 #meds</span>
        </button>

        <button className="btn-quick" onClick={() => { onQuickTagLog({ title: 'Chocolate / Sweet Snack Boost', tags: ['#chocolate', '#snack'], type: 'microlog' }); triggerConfetti(); }}>
          <Cookie size={15} color="#d97706" />
          <span>🍫 #chocolate</span>
        </button>

        {/* Google Task Blackbox Tracker */}
        <button className="btn-quick" onClick={onOpenTaskModal} style={{ borderColor: 'rgba(139, 92, 246, 0.4)' }}>
          <CheckSquare size={15} color="#8b5cf6" />
          <span>☑️ Task Blackbox</span>
        </button>

        {/* Ebook Session */}
        <button className="btn-quick" onClick={onOpenEbookModal} style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}>
          <BookOpen size={15} color="#3b82f6" />
          <span>📚 Ebook Tracker</span>
        </button>

        {/* Photo Scene Intake */}
        <button className="btn-quick" onClick={onOpenPhotoModal} style={{ borderColor: 'rgba(236, 72, 153, 0.4)' }}>
          <Camera size={15} color="#ec4899" />
          <span>📷 Photo Scene</span>
        </button>

        {/* Synthesize Daily Journal */}
        <button className="btn-quick" onClick={onOpenJournalModal} style={{ borderColor: 'rgba(167, 139, 250, 0.5)', background: 'rgba(139, 92, 246, 0.12)' }}>
          <Sparkles size={15} color="#a78bfa" />
          <span style={{ color: '#c4b5fd', fontWeight: '700' }}>✨ Synthesize Daily Journal</span>
        </button>

      </div>

      {/* Inline Quick Text Form */}
      <form onSubmit={handleQuickSubmit} style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder="Instant microlog entry... (e.g. 'Took Advil for headache during book reading session')"
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.9rem',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem' }}>
            <PlusCircle size={15} />
            <span>Append</span>
          </button>
        </div>

        {/* Auto Tag Suggestions Bar */}
        {(suggestions.length > 0 || acceptedTags.length > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.73rem', color: '#a78bfa', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag size={12} /> Auto Tags:
            </span>

            {/* Accepted Tags Badges */}
            {acceptedTags.map(t => (
              <span key={t} style={{ fontSize: '0.73rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '1px 7px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Check size={11} /> {t}
              </span>
            ))}

            {/* Suggested Tags Chips */}
            {suggestions.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAcceptSingleTag(tag)}
                style={{ fontSize: '0.73rem', background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: '1px border rgba(139, 92, 246, 0.4)', padding: '1px 7px', borderRadius: '12px', cursor: 'pointer', outline: 'none' }}
                title="Click to add tag"
              >
                + {tag}
              </button>
            ))}

            {/* Accept All Suggestions Button */}
            {suggestions.length > 0 && (
              <button
                type="button"
                onClick={handleAcceptAllSuggestions}
                style={{ fontSize: '0.73rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Sparkles size={11} /> Accept All Suggestions ({suggestions.length})
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

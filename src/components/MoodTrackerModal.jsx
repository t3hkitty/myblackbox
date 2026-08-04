import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check, Plus, Tag, HelpCircle, Layers } from 'lucide-react';
import { analyzeMoodPattern } from '../services/patternMatcher';

const AVAILABLE_TAGS = [
  '#meds', '#chocolate', '#caffeine', '#water', '#sleep_deprived', '#stress', '#exercise', '#deep_work', '#headache', '#meal'
];

export default function MoodTrackerModal({
  isOpen,
  onClose,
  activeMoodSet,
  allLogs,
  onSaveMoodLog,
  onOpenMoodSetManager
}) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [journalNote, setJournalNote] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [troubleshootingResult, setTroubleshootingResult] = useState(null);

  useEffect(() => {
    if (activeMoodSet && activeMoodSet.moods.length > 0) {
      setSelectedMood(activeMoodSet.moods[1] || activeMoodSet.moods[0]);
    }
  }, [activeMoodSet]);

  useEffect(() => {
    if (selectedMood) {
      const analysis = analyzeMoodPattern(selectedMood, selectedTags, allLogs);
      setTroubleshootingResult(analysis);
    }
  }, [selectedMood, selectedTags, allLogs]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    onSaveMoodLog({
      title: journalNote.trim() || `Mood State: ${selectedMood.emoji} ${selectedMood.label}`,
      type: 'mood',
      mood: selectedMood,
      content: journalNote.trim(),
      tags: ['#mood', '#telemetry', ...selectedTags],
      metadata: {
        troubleshootingPattern: troubleshootingResult?.message || null
      }
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
              Daylio Mood & Journal Capture
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Set active state & correlate against blackbox historical telemetry
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Active Mood Set Indicator & Preset Switcher link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.04)', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Active Mood Set: <strong style={{ color: '#fff' }}>{activeMoodSet?.name}</strong>
          </div>
          <button className="btn-secondary" onClick={onOpenMoodSetManager} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
            <Layers size={13} />
            <span>Customize Mood Sets</span>
          </button>
        </div>

        {/* Configurable Emojis Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeMoodSet?.moods.length || 5}, 1fr)`, gap: '0.5rem', marginBottom: '1.2rem' }}>
          {activeMoodSet?.moods.map((m) => {
            const isSelected = selectedMood?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m)}
                style={{
                  background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? `2px solid ${m.color || '#3b82f6'}` : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0.75rem 0.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'scale(1.05)' : 'none'
                }}
              >
                <span style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{m.emoji}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isSelected ? '#fff' : 'var(--text-muted)' }}>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Blackbox Troubleshooting Pattern Match Alert */}
        {troubleshootingResult && troubleshootingResult.hasMatch && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '0.9rem',
            marginBottom: '1.2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f87171', marginBottom: '0.2rem' }}>
                  Blackbox Troubleshooting Correlation Alert
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#fecaca', lineHeight: '1.4' }}>
                  {troubleshootingResult.message}
                </p>
                
                {troubleshootingResult.suggestedActions.length > 0 && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f87171', marginBottom: '0.3rem' }}>
                      Recommended Action Checklist:
                    </div>
                    {troubleshootingResult.suggestedActions.map((action, idx) => (
                      <div key={idx} style={{ fontSize: '0.75rem', color: '#fee2e2', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>•</span> {action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Context Tag Selection */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Context & Action Tags (e.g. #meds, #chocolate):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {AVAILABLE_TAGS.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    background: active ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: active ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                    color: active ? '#60a5fa' : 'var(--text-muted)',
                    borderRadius: '20px',
                    padding: '0.3rem 0.7rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {tag} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Journal Entry Note */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Journal / Telemetry Notes:
          </label>
          <textarea
            rows={3}
            value={journalNote}
            onChange={(e) => setJournalNote(e.target.value)}
            placeholder="Detail factors leading to current state (e.g. slept late, skipped breakfast, completed deep work block)..."
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.7rem',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            <Check size={16} />
            <span>Save Zettel Log</span>
          </button>
        </div>

      </div>
    </div>
  );
}

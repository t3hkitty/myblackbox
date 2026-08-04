import React, { useState } from 'react';
import { Activity, AlertCircle, Sparkles, CheckCircle2, Filter, Zap, Flame, Lightbulb } from 'lucide-react';
import { analyzeMoodCorollary } from '../services/patternMatcher';

const MOOD_EMOJI_FILTERS = [
  { emoji: 'ALL', label: 'All Moods' },
  { emoji: '😍', label: 'Super Happy' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😐', label: 'Meh' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😭', label: 'Distress' },
  { emoji: '😡', label: 'Frustrated' }
];

export default function TroubleshootingPanel({
  allLogs,
  onQuickTagLog
}) {
  const [selectedEmojiFilter, setSelectedEmojiFilter] = useState('ALL');

  const corollaryResult = analyzeMoodCorollary(selectedEmojiFilter, allLogs);

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Airplane Blackbox Corollary Engine
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Selectable mood filtering & statistical factor correlation
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <Sparkles size={12} /> Live Corollary Analysis
        </span>
      </div>

      {/* Selectable Mood Emoji Filter Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
        {MOOD_EMOJI_FILTERS.map(m => {
          const isSelected = selectedEmojiFilter === m.emoji;
          return (
            <button
              key={m.emoji}
              onClick={() => setSelectedEmojiFilter(m.emoji)}
              style={{
                background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid #ef4444' : '1px solid var(--border-color)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                borderRadius: '20px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Corollary Report Banner */}
      <div className="glass-card" style={{
        background: corollaryResult.insightType === 'positive' ? 'rgba(16, 185, 129, 0.08)' : corollaryResult.insightType === 'troubleshooting' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
        border: corollaryResult.insightType === 'positive' ? '1px solid rgba(16, 185, 129, 0.3)' : corollaryResult.insightType === 'troubleshooting' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
        marginBottom: '0.8rem',
        padding: '0.9rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: corollaryResult.insightType === 'positive' ? '#34d399' : '#fca5a5', fontWeight: '700' }}>
            COROLLARY REPORT: {selectedEmojiFilter === 'ALL' ? 'ALL TELEMETRY' : `MOOD ${selectedEmojiFilter}`} ({corollaryResult.matchedLogs ? corollaryResult.matchedLogs.length : 0} Entries)
          </span>
          {corollaryResult.mostRecentMatch && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Most Recent: {corollaryResult.mostRecentMatch.zettelId} PT
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', marginBottom: '0.4rem', lineHeight: '1.4' }}>
          {corollaryResult.summaryMessage}
        </div>

        {/* Actionable Suggestion */}
        {corollaryResult.suggestion && (
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.7rem', borderRadius: '6px', marginTop: '0.5rem', borderLeft: '3px solid #f59e0b', fontSize: '0.78rem', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lightbulb size={14} color="#f59e0b" />
            <span><strong>Suggested Protocol Action</strong>: {corollaryResult.suggestion}</span>
          </div>
        )}

        {/* Top Correlated Factors Badges */}
        {corollaryResult.topFactors && corollaryResult.topFactors.length > 0 && (
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600' }}>Top Factors:</span>
            {corollaryResult.topFactors.map(f => (
              <span key={f.tag} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '10px', color: '#fff', border: '1px solid var(--border-color)' }}>
                {f.tag} <strong>{f.percent}%</strong>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

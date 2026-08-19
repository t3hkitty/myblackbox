import React, { useState } from 'react';
import { Activity, AlertCircle, Sparkles, CheckCircle2, Filter, Zap, Flame, Lightbulb, Coffee, Heart, Terminal, Key, RefreshCw, Trash2 } from 'lucide-react';
import { analyzeMoodCorollary } from '../services/patternMatcher';
import { getSyncDiagnostics, getStoredAccessToken, saveAccessToken, clearSyncDiagnostics } from '../services/googleDriveAuthEngine';
import confetti from 'canvas-confetti';

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
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsList, setDiagnosticsList] = useState(getSyncDiagnostics());

  const corollaryResult = analyzeMoodCorollary(selectedEmojiFilter, allLogs);
  const currentToken = getStoredAccessToken();

  const handleRefreshLogs = () => {
    setDiagnosticsList(getSyncDiagnostics());
  };

  const handlePasteToken = () => {
    const token = window.prompt('🔑 Enter your Google OAuth Access Token:', currentToken || '');
    if (token && token.trim()) {
      saveAccessToken(token.trim());
      setDiagnosticsList(getSyncDiagnostics());
      alert('✅ OAuth Access Token saved!');
    }
  };

  const handleLogCoffeeRelief = () => {
    onQuickTagLog({
      title: '☕ Bio-Relief Event: Coffee for Constipation & Headache Relief',
      type: 'microlog',
      content: 'Logged hot coffee intake to stimulate gastrocolic reflex & ease tension headache.',
      tags: ['#coffee', '#constipation_relief', '#headache_relief', '#bio_telemetry', '#gut_health']
    });
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    alert('☕ Logged Coffee Bowel & Headache Relief event as Zettel!');
  };

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
              Airplane Blackbox Corollary & API Diagnostics Console
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Selectable mood corollary analysis & Google Tasks API error logs
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setShowDiagnostics(!showDiagnostics);
            handleRefreshLogs();
          }}
          className="btn-secondary"
          style={{ padding: '0.25rem 0.65rem', fontSize: '0.73rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
        >
          <Terminal size={13} /> {showDiagnostics ? 'Hide Logs' : '📋 API Error Log'}
        </button>
      </div>

      {/* Sync Diagnostics Error Console */}
      {showDiagnostics && (
        <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1rem', background: '#090d16', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Terminal size={14} color="#60a5fa" />
              <span>Google API Sync Diagnostic Console</span>
            </div>

            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button onClick={handlePasteToken} className="btn-secondary" style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: '#fcd34d' }}>
                <Key size={11} /> {currentToken ? '🔑 Active Token' : '⚠️ Paste OAuth Token'}
              </button>
              <button onClick={handleRefreshLogs} className="btn-secondary" style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: '#60a5fa' }}>
                <RefreshCw size={11} /> Refresh
              </button>
              <button onClick={() => { clearSyncDiagnostics(); setDiagnosticsList([]); }} className="btn-secondary" style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: '#f87171' }}>
                <Trash2 size={11} /> Clear
              </button>
            </div>
          </div>

          {!currentToken && (
            <div style={{ padding: '0.5rem', marginBottom: '0.6rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '0.74rem', color: '#fca5a5' }}>
              ⚠️ <strong>Missing OAuth Token</strong>: Google Tasks REST API requests will return empty without a valid Google OAuth Access Token. Click <strong>"⚠️ Paste OAuth Token"</strong> above or connect in Settings ⚙️.
            </div>
          )}

          <div style={{ maxHeight: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {diagnosticsList.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                No API diagnostic entries yet. Click "🔄 Pull Google Tasks" on the task widget to trigger a request.
              </div>
            ) : (
              diagnosticsList.map(d => (
                <div key={d.id} style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', background: d.type === 'ERROR' ? 'rgba(239, 68, 68, 0.12)' : d.type === 'SUCCESS' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${d.type === 'ERROR' ? '#ef4444' : d.type === 'SUCCESS' ? '#10b981' : '#3b82f6'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>[{d.action}]</span>
                    <span>{new Date(d.timestampIso).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ color: d.type === 'ERROR' ? '#fca5a5' : d.type === 'SUCCESS' ? '#a7f3d0' : '#dbeafe', marginTop: '0.1rem' }}>
                    {d.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bio-Telemetry Insight Card: Constipation + Headache Coffee Reliever */}
      <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1rem', background: 'rgba(180, 83, 9, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Coffee size={18} color="#f59e0b" />
            <span>💩 ➔ ☕ Constipation & Headache Relief Correlation</span>
          </div>

          <button
            onClick={handleLogCoffeeRelief}
            className="btn-primary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Coffee size={13} />
            <span>+1 Log Coffee Bio-Relief</span>
          </button>
        </div>

        <p style={{ fontSize: '0.76rem', color: '#fef2f2', margin: 0, lineHeight: '1.45' }}>
          💡 <strong>Bio-Telemetry Pattern</strong>: Constipation & tension headaches frequently co-occur due to fluid retention and reduced intestinal motility. Drinking hot coffee stimulates the <strong>gastrocolic reflex</strong> (promoting bowel movement) while caffeine acts as a vasoconstrictor to clear headaches simultaneously!
        </p>
      </div>

      {/* Selectable Mood Emoji Filter Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
        {MOOD_EMOJI_FILTERS.map(m => {
          const isSelected = selectedEmojiFilter === m.emoji;
          return (
            <button
              key={m.emoji}
              onClick={() => setSelectedEmojiFilter(m.emoji)}
              className="btn-secondary"
              style={{
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                borderColor: isSelected ? '#f87171' : 'var(--border-color)',
                background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: isSelected ? '#fff' : 'var(--text-muted)'
              }}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Corollary Results Output */}
      {corollaryResult.hasData ? (
        <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lightbulb size={16} color="#fbbf24" />
            <span>Corollary Factor Match ({corollaryResult.matchedLogs.length} Entries Filtered)</span>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: '1.45', marginBottom: '0.6rem' }}>
            {corollaryResult.summaryMessage}
          </p>

          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.76rem', color: '#a7f3d0' }}>
            💡 <strong>Actionable Corollary Recommendation</strong>: {corollaryResult.suggestion}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {corollaryResult.message} {corollaryResult.suggestion}
        </div>
      )}
    </div>
  );
}

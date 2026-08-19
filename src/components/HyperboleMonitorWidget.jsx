import React, { useState } from 'react';
import { AlertCircle, Zap, Shield, Sparkles, MessageSquare, Heart, RefreshCw, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HyperboleMonitorWidget({
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const [inputText, setInputText] = useState('');
  const [analyzedResult, setAnalyzedResult] = useState(null);

  // Hyperbole dictionary & reframes
  const HYPERBOLE_DICTIONARY = [
    { pattern: /lo+ve/gi, replacement: 'appreciate / value', severity: 'High', reason: 'Reservations Rule: "Love should be reserved for people on your grief list."' },
    { pattern: /obsessed/gi, replacement: 'interested in / fond of', severity: 'Medium', reason: 'Pathologizes normal enjoyment into compulsive fixation.' },
    { pattern: /literal(ly)?/gi, replacement: 'figuratively / practically', severity: 'Low', reason: 'Linguistic inflation erodes distinction between reality and exaggeration.' },
    { pattern: /worst thing ever/gi, replacement: 'a temporary inconvenience', severity: 'High', reason: 'Catastrophizing triggers unnecessary fight-or-flight nervous arousal.' },
    { pattern: /epic disaster/gi, replacement: 'a minor set-back', severity: 'High', reason: 'Inflates small errors into existential crisis.' },
    { pattern: /100000_favorites|100k favorites/gi, replacement: 'well-received', severity: 'Medium', reason: 'Hedonic drift: jaded pleasure seeking via social metrics.' }
  ];

  const handleAnalyzeText = () => {
    if (!inputText.trim()) return;

    let detectedIssues = [];
    let groundedText = inputText;

    HYPERBOLE_DICTIONARY.forEach(item => {
      if (item.pattern.test(inputText)) {
        detectedIssues.push(item);
        groundedText = groundedText.replace(item.pattern, item.replacement);
      }
    });

    const result = {
      original: inputText,
      grounded: groundedText,
      issues: detectedIssues,
      hasHyperbole: detectedIssues.length > 0
    };

    setAnalyzedResult(result);
  };

  const handleLogTelemetryZettel = () => {
    onSaveZettel({
      title: 'Telemetry Log: Linguistic Inflation & Hedonic Drift',
      type: 'microlog',
      content: `// 20260804-1330
// Telemetry Log: Linguistic Inflation & Hedonic Drift
const linguisticDrift = {
    trigger: "100000_favorites",
    state: "jaded_pleasure_seeking",
    recovery: "local_noise_grounding"
};

"Loooove should be reserved for people on your grief list." - Grounded Linguistic Anchor.`,
      tags: ['#linguistic_inflation', '#hedonic_drift', '#hyperbole_monitor', '#telemetry'],
      zettelId: '20260804-1330'
    });

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    alert('🧠 Logged Linguistic Inflation Telemetry Zettel (20260804-1330)!');
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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              ⚖️ Hyperbole Monitor & Linguistic Inflation
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hedonic Drift & Nervous System Grounding Monitor
            </p>
          </div>
        </div>

        <button
          onClick={onTogglePin}
          className="btn-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
          title="Pin panel to top sticky tape dock"
        >
          📌 {isPinned ? 'Unpin' : 'Pin Tape'}
        </button>
      </div>

      {/* Mental Health Explanation Banner */}
      <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '0.9rem', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#e9d5ff', fontSize: '0.85rem', fontWeight: '700' }}>
          <BookOpen size={16} color="#c084fc" />
          <span>Why Hyperbole Harms Mental Health:</span>
        </div>
        <ul style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', paddingLeft: '1.2rem', margin: 0 }}>
          <li style={{ marginBottom: '0.3rem' }}>
            <strong style={{ color: '#fff' }}>Linguistic Inflation & Hedonic Drift:</strong> Over-exaggerating mild experiences (e.g. <em>"100,000 favorites"</em>, <em>"I loooove this"</em>) desensitizes normal reward pathways, leading to jaded pleasure-seeking.
          </li>
          <li style={{ marginBottom: '0.3rem' }}>
            <strong style={{ color: '#fff' }}>Emotional Catastrophizing:</strong> Using crisis words for minor friction trick your amygdala into constant low-grade fight-or-flight stress.
          </li>
          <li>
            <strong style={{ color: '#fca5a5' }}>The Grief Rule:</strong> <em>"Loooove should be reserved for people on your grief list."</em> Preserving sacred words restores deep emotional resonance.
          </li>
        </ul>
      </div>

      {/* Input Text Scanner */}
      <div style={{ marginBottom: '0.8rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
          Scan Thought / Phrase for Linguistic Inflation:
        </label>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeText()}
            placeholder='e.g. "I loooove this pizza, it is literally my 100000_favorites obsession"'
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.45rem 0.7rem',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleAnalyzeText}
            className="btn-primary"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}
          >
            Scan & Ground
          </button>
        </div>
      </div>

      {/* Analyzed Result Display */}
      {analyzedResult && (
        <div className="glass-card" style={{ padding: '0.8rem', marginBottom: '0.8rem', background: analyzedResult.hasHyperbole ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', border: `1px solid ${analyzedResult.hasHyperbole ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: '8px' }}>
          {analyzedResult.hasHyperbole ? (
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fca5a5', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={15} color="#ef4444" /> Detected {analyzedResult.issues.length} Hyperbolic Inflation Trigger(s):
              </div>
              <div style={{ fontSize: '0.78rem', color: '#fff', marginBottom: '0.4rem', padding: '0.4rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <strong>Grounded Reframe:</strong> "{analyzedResult.grounded}"
              </div>
              {analyzedResult.issues.map((iss, idx) => (
                <div key={idx} style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  • <strong style={{ color: '#fca5a5' }}>{iss.severity} Impact:</strong> {iss.reason}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} /> Text is balanced & grounded! No linguistic inflation detected.
            </div>
          )}
        </div>
      )}

      {/* Preset Telemetry Log Button */}
      <button
        onClick={handleLogTelemetryZettel}
        className="btn-secondary"
        style={{
          width: '100%',
          padding: '0.45rem',
          fontSize: '0.78rem',
          borderColor: 'rgba(168, 85, 247, 0.4)',
          color: '#e9d5ff',
          background: 'rgba(168, 85, 247, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem'
        }}
        title="Log Telemetry Zettel 20260804-1330: Linguistic Inflation & Hedonic Drift"
      >
        <MessageSquare size={14} /> Log Telemetry (20260804-1330: Linguistic Inflation & Hedonic Drift)
      </button>
    </div>
  );
}

import React from 'react';
import { X, Layout, CheckSquare, Shield, RotateCcw, Pin, ArrowUp, ArrowDown } from 'lucide-react';

export default function LayoutCustomizerModal({
  isOpen,
  onClose,
  panelVisibility,
  onTogglePanelVisibility,
  pinnedPanels,
  onTogglePinPanel,
  panelOrder = [],
  onMovePanelOrder,
  onResetLayout
}) {
  if (!isOpen) return null;

  const PANELS_LIST = [
    { id: 'accounts', label: '💳 Accounts, Profiles & Linked Services Hub', group: 'System & Accounts' },
    { id: 'upcoming_events', label: '📅 Upcoming Events & Custom TTS Voice Alerts', group: 'Tasks & Workflow' },
    { id: 'academic_hub', label: '🎓 Academic School Hub & Syllabus Processor', group: 'Tasks & Workflow' },
    { id: 'creator_studio', label: '🎨 Creator Studio & Content Publishing Hub', group: 'Media & Micro-tweeting' },
    { id: 'on_this_day', label: '📅 On This Day (Birthdays, Anniversaries & World History)', group: 'Media & Memories' },
    { id: 'health_telemetry', label: '🩺 Master Biological & Health Telemetry Panel', group: 'Health & Bio' },
    { id: 'hyperbole_monitor', label: '⚖️ Hyperbole Monitor (Linguistic Inflation)', group: 'Cognitive & Mindset' },
    { id: 'movement_fitness', label: '💪 Movement & Step Tracker (Google Fit Sync)', group: 'Health & Bio' },
    { id: 'calendar_sanitizer', label: '👨‍👩‍👧 Calendar Sanitizer & Family-Safe View', group: 'Tasks & Workflow' },
    { id: 'braindump', label: '🧠 Braindump Watcher for Mental Health', group: 'Cognitive & Mindset' },
    { id: 'sips', label: '🥤 Hydration & Excretion Station', group: 'Health & Bio' },
    { id: 'addiction_monitor', label: '🚨 Addiction & Bio Habit Alert Monitor', group: 'Health & Bio' },
    { id: 'tasks', label: '⏱️ Google Tasks & Blackbox Timer', group: 'Tasks & Workflow' },
    { id: 'tbr', label: '📚 #tbr Reading & Media Backlog List', group: 'Tasks & Workflow' },
    { id: 'google_photos', label: '📷 Google Photos & Selfie Time-Lapse', group: 'Media & Memories' },
    { id: 'live_tweets', label: '🐦 Live Media Tweeting Widget', group: 'Media & Micro-tweeting' },
    { id: 'spotify', label: '🎵 Spotify Consecutive Skip Cleanup', group: 'Media & Music' },
    { id: 'attraction', label: '💚 Law of Attraction & Arc Goals Priming', group: 'Cognitive & Mindset' },
    { id: 'goals', label: '🎯 Unobtrusive Life Arc Goals Engine', group: 'Cognitive & Mindset' },
    { id: 'troubleshooting', label: '🛠️ Local Diagnostics & Log Errors', group: 'System' },
    { id: 'weather', label: '🌤️ Weather Telemetry Logger', group: 'Telemetry' },
    { id: 'best_practices', label: '⚡ Best Practices & Quick Guides', group: 'System' },
    { id: 'telemetry_import', label: '📡 Connected Import Hub (Timeline/Fit/Keep)', group: 'Telemetry' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layout size={22} color="#60a5fa" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                🧹 Panel Visibility, Ordering & Sticky Tape Manager
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Re-order panels, check/uncheck visibility, and toggle 📌 Sticky Tape side-by-side pinning!
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.8rem', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {Object.values(panelVisibility).filter(Boolean).length} of {PANELS_LIST.length} dashboard panels
          </span>

          <button
            onClick={onResetLayout}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <RotateCcw size={12} />
            <span>Reset All to Visible</span>
          </button>
        </div>

        {/* Panel Controls List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
          {PANELS_LIST.map((p, idx) => {
            const isPinned = pinnedPanels && pinnedPanels[p.id];
            const isVisible = panelVisibility[p.id];
            return (
              <div
                key={p.id}
                className="glass-card"
                style={{
                  padding: '0.6rem 0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  borderLeft: isVisible ? '3px solid #60a5fa' : '3px solid var(--border-color)',
                  background: isPinned ? 'rgba(251, 191, 36, 0.08)' : (isVisible ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)'),
                  opacity: isVisible ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(isVisible)}
                    onChange={() => onTogglePanelVisibility(p.id)}
                    style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: isVisible ? '#fff' : 'var(--text-muted)' }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      Group: {p.group} {isPinned ? '• 📌 Sticky Tape Pinned' : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  {onMovePanelOrder && (
                    <>
                      <button
                        onClick={() => onMovePanelOrder(p.id, 'up')}
                        disabled={idx === 0}
                        className="btn-secondary"
                        style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }}
                        title="Move Panel Up"
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        onClick={() => onMovePanelOrder(p.id, 'down')}
                        disabled={idx === PANELS_LIST.length - 1}
                        className="btn-secondary"
                        style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }}
                        title="Move Panel Down"
                      >
                        <ArrowDown size={11} />
                      </button>
                    </>
                  )}

                  {onTogglePinPanel && (
                    <button
                      onClick={() => onTogglePinPanel(p.id)}
                      className="btn-secondary"
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.68rem',
                        borderColor: isPinned ? '#fbbf24' : 'var(--border-color)',
                        color: isPinned ? '#fcd34d' : 'var(--text-muted)',
                        background: isPinned ? 'rgba(251, 191, 36, 0.15)' : 'transparent'
                      }}
                      title="Toggle sticky tape side-by-side pin"
                    >
                      📌 {isPinned ? 'Pinned Tape' : 'Pin Tape'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Power, Sparkles, RefreshCw } from 'lucide-react';
import { BUNNY_ANIMATION_MANIFESTS, AsciiFrameManifest } from './asciiManifest';

interface AsciiPetWidgetProps {
  currentEvent?: 'idle' | 'task_complete' | 'streak_sync' | 'hydrate_nudge' | 'custom';
  onEventHandled?: () => void;
}

export const AsciiPetWidget: React.FC<AsciiPetWidgetProps> = ({
  currentEvent = 'idle',
  onEventHandled
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mbb_ascii_pet_enabled');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('mbb_ascii_pet_paused') === 'true';
    }
    return false;
  });

  const [activeManifestKey, setActiveManifestKey] = useState<string>('thirsty_idle');
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const activeManifest: AsciiFrameManifest = BUNNY_ANIMATION_MANIFESTS[activeManifestKey] || BUNNY_ANIMATION_MANIFESTS.thirsty_idle;

  // React to external trigger events
  useEffect(() => {
    if (!isEnabled || isPaused) return;

    if (currentEvent === 'task_complete') {
      setActiveManifestKey('task_complete');
      setCurrentFrameIndex(0);
    } else if (currentEvent === 'streak_sync') {
      setActiveManifestKey('streak_sync');
      setCurrentFrameIndex(0);
    }
  }, [currentEvent, isEnabled, isPaused]);

  // Frame ticker
  useEffect(() => {
    if (!isEnabled || isPaused) return;

    const intervalMs = Math.round(1000 / (activeManifest.fps || 2));
    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= activeManifest.frames.length) {
          if (activeManifest.loop) {
            return 0;
          } else {
            // Once non-looping animation finishes, return to thirsty_idle
            setActiveManifestKey('thirsty_idle');
            if (onEventHandled) onEventHandled();
            return 0;
          }
        }
        return nextIndex;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeManifest, isEnabled, isPaused, onEventHandled]);

  const handleToggleEnabled = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    localStorage.setItem('mbb_ascii_pet_enabled', String(next));
  };

  const handleTogglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    localStorage.setItem('mbb_ascii_pet_paused', String(next));
  };

  const handleTriggerTest = (key: 'task_complete' | 'streak_sync') => {
    setActiveManifestKey(key);
    setCurrentFrameIndex(0);
  };

  if (!isEnabled) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '0.4rem 0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>🐰 ASCII Pet / Companion (Paused &amp; Off)</span>
        <button
          onClick={handleToggleEnabled}
          className="btn-secondary"
          style={{ padding: '0.15rem 0.5rem', fontSize: '0.68rem', color: '#34d399' }}
          title="Enable ASCII Pet Companion Widget"
        >
          <Power size={11} style={{ marginRight: '3px', display: 'inline' }} /> Turn On
        </button>
      </div>
    );
  }

  const frameText = activeManifest.frames[currentFrameIndex] || activeManifest.frames[0];

  return (
    <div
      className="glass-card"
      style={{
        padding: '0.6rem 0.9rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 100%)',
        border: '1px solid rgba(167, 139, 250, 0.35)',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc' }}>
            🐰 MBB Companion: {activeManifest.name}
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              padding: '1px 5px',
              borderRadius: '4px',
              background: isPaused ? 'rgba(245, 158, 11, 0.2)' : 'rgba(52, 211, 153, 0.15)',
              color: isPaused ? '#fcd34d' : '#34d399',
              fontWeight: 600
            }}
          >
            {isPaused ? 'PAUSED' : 'LIVE'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            onClick={() => handleTriggerTest('task_complete')}
            className="btn-secondary"
            style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', color: '#c084fc' }}
            title="Preview task completion animation"
          >
            ✨ Hop
          </button>
          <button
            onClick={() => handleTriggerTest('streak_sync')}
            className="btn-secondary"
            style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', color: '#60a5fa' }}
            title="Preview sync celebration animation"
          >
            ⚡ Sync
          </button>
          <button
            onClick={handleTogglePause}
            className="btn-secondary"
            style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', color: isPaused ? '#34d399' : '#fcd34d' }}
            title={isPaused ? 'Resume animation' : 'Pause animation'}
          >
            {isPaused ? <Play size={11} /> : <Pause size={11} />}
          </button>
          <button
            onClick={handleToggleEnabled}
            className="btn-secondary"
            style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', color: '#f87171' }}
            title="Turn off pet widget"
          >
            <Power size={11} />
          </button>
        </div>
      </div>

      <pre
        style={{
          margin: 0,
          padding: '0.45rem 0.6rem',
          background: 'rgba(0, 0, 0, 0.45)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          color: '#e2e8f0',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: '0.74rem',
          lineHeight: '1.25',
          overflowX: 'auto',
          userSelect: 'none'
        }}
      >
        {frameText}
      </pre>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Puzzle, CheckCircle, Shield, RefreshCw, Zap, ExternalLink, Settings, Sparkles, Music, MapPin, MessageSquare, Heart, BookOpen, Share2, Volume2, Book, Code, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_PLUGINS = [
  {
    id: 'plugin_custom_tts',
    name: 'ElevenLabs AI & Android HD Voice Plugin',
    category: 'Audio & Voice',
    version: 'v1.0',
    author: 'Community / myBlackbox SDK',
    enabled: true,
    description: 'Custom TTS voice synthesis plugin supporting ElevenLabs AI voices and Android HD Speech packs.',
    icon: Volume2,
    color: '#a855f7'
  },
  {
    id: 'plugin_habitica',
    name: 'Habitica RPG Gamification & Boss Damage Sync',
    category: 'Gamification & RPG',
    version: 'v1.0',
    author: 'myBlackbox SDK',
    enabled: true,
    description: 'Maps microlog telemetry (+1 Sip, Bio breaks, Task completions) to Habitica Habits, Dailies & Quest Boss Damage.',
    icon: Zap,
    color: '#10b981'
  },
  {
    id: 'plugin_spotify',
    name: 'Spotify Short-Gap Skip Telemetry',
    category: 'Music & Audio',
    version: 'v1.4',
    author: 'myBlackbox Core',
    enabled: true,
    description: 'Monitors consecutive track play gaps (<20s) and generates automated #blackbox cleanup tasks.',
    icon: Music,
    color: '#10b981'
  },
  {
    id: 'plugin_blogger',
    name: 'Blogger & WordPress Journal Exporter',
    category: 'Publishing',
    version: 'v1.2',
    author: 'myBlackbox Core',
    enabled: true,
    description: '1-click publishes live-tweet tirades, DNF book reviews & Zettel logs to Blogger or WordPress.',
    icon: Share2,
    color: '#f59e0b'
  },
  {
    id: 'plugin_timeline',
    name: 'Google Timeline & Location History',
    category: 'Location & Telemetry',
    version: 'v2.0',
    author: 'myBlackbox Core',
    enabled: true,
    description: 'Auto-logs visited places and travel duration into Zettel cards (Includes 1-click privacy disable toggle).',
    icon: MapPin,
    color: '#3b82f6'
  },
  {
    id: 'plugin_messages',
    name: 'Android Messages & Share Sheet',
    category: 'Communication',
    version: 'v1.1',
    author: 'myBlackbox Core',
    enabled: true,
    description: 'Receives native Android Share Sheet clips, text highlights, and SMS notifications directly.',
    icon: MessageSquare,
    color: '#ec4899'
  },
  {
    id: 'plugin_keep',
    name: 'Google Keep & #tbr Reading List Sync',
    category: 'Productivity',
    version: 'v1.5',
    author: 'myBlackbox Core',
    enabled: true,
    description: 'Syncs tagged Google Keep notes (archive//books) and #tbr reading lists into Live Tweeting widget.',
    icon: BookOpen,
    color: '#60a5fa'
  },
  {
    id: 'plugin_photos',
    name: 'Google Photos & Gemini Scene Parser',
    category: 'AI & Vision',
    version: 'v2.1',
    author: 'Google DeepMind AGY',
    enabled: true,
    description: 'Uses Gemini Vision AI to parse selfie time-lapses, photo scenes, and predict media ratings.',
    icon: Sparkles,
    color: '#a78bfa'
  }
];

export default function PluginMarketplaceModal({
  isOpen,
  onClose,
  onOpenBloggerExport
}) {
  if (!isOpen) return null;

  const [pluginsList, setPluginsList] = useState(SAMPLE_PLUGINS);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showDevGuide, setShowDevGuide] = useState(false);

  const handleTogglePlugin = (id) => {
    setPluginsList(pluginsList.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const categories = ['ALL', ...new Set(SAMPLE_PLUGINS.map(p => p.category))];

  const filteredPlugins = filterCategory === 'ALL'
    ? pluginsList
    : pluginsList.filter(p => p.category === filterCategory);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Puzzle size={22} color="#a78bfa" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>
                🧩 Plugin Settings & Developer Marketplace
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Enable custom TTS, audio, telemetry plugins & developer guides
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowDevGuide(!showDevGuide)}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.73rem', color: '#c4b5fd', borderColor: 'rgba(167, 139, 250, 0.4)', background: 'rgba(167, 139, 250, 0.1)' }}
              title="View Developer Plugin Integration Guide"
            >
              <Code size={13} /> {showDevGuide ? 'Hide Plugin Guide' : '📖 Developer Plugin Guide'}
            </button>

            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Developer Plugin Integration Guide Section */}
        {showDevGuide && (
          <div style={{ background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '8px', padding: '0.9rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#c4b5fd', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Terminal size={16} color="#a78bfa" />
              <span>🔌 Developer Plugin Architecture & TTS Integration Guide</span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p>
                Developers can create custom TTS voice plugins (e.g. ElevenLabs AI, Android Speech Engine, OpenAI TTS) or custom telemetry sources!
              </p>

              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.6rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.72rem', color: '#34d399' }}>
                {`// Example Custom TTS Plugin Handler
export class CustomTtsPlugin {
  async onNotificationTrigger({ title, phrase, userName }) {
    // 1. Host Native (0ms, 100% Free):
    const utterance = new SpeechSynthesisUtterance(\`Hey \${userName}, \${phrase}\`);
    window.speechSynthesis.speak(utterance);
    
    // 2. Optional ElevenLabs AI API / Android Native Bridge:
    // await fetchElevenLabsVoice(phrase);
  }
}`}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Full documentation saved to <strong style={{ color: '#a78bfa' }}>plugin_development_guide.md</strong> in your workspace artifacts!
              </div>
            </div>
          </div>
        )}

        {/* Quick Category Filter Bar */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.73rem',
                borderColor: filterCategory === c ? '#a78bfa' : 'var(--border-color)',
                background: filterCategory === c ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                color: filterCategory === c ? '#c4b5fd' : 'var(--text-muted)'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Plugins Grid List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {filteredPlugins.map(plugin => {
            const Icon = plugin.icon;
            return (
              <div
                key={plugin.id}
                className="glass-card"
                style={{
                  padding: '0.9rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.8rem',
                  background: plugin.enabled ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)',
                  border: plugin.enabled ? `1px solid ${plugin.color}40` : '1px solid var(--border-color)',
                  opacity: plugin.enabled ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 }}>
                  <div style={{
                    background: `${plugin.color}20`,
                    color: plugin.color,
                    padding: '0.5rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#fff' }}>
                        {plugin.name}
                      </h4>
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                        {plugin.version}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {plugin.description}
                    </p>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Author: <strong style={{ color: plugin.color }}>{plugin.author}</strong> | Category: {plugin.category}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {plugin.id === 'plugin_blogger' && plugin.enabled && (
                    <button
                      onClick={onOpenBloggerExport}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                    >
                      Export Post
                    </button>
                  )}

                  <button
                    onClick={() => handleTogglePlugin(plugin.id)}
                    className="btn-secondary"
                    style={{
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      borderColor: plugin.enabled ? '#34d399' : 'var(--border-color)',
                      background: plugin.enabled ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                      color: plugin.enabled ? '#34d399' : 'var(--text-muted)'
                    }}
                  >
                    {plugin.enabled ? '✓ Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Camera, Image, Sparkles, Check, Upload, Layers, Eye, Zap, UserCheck, History, ArrowRightLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_SELFIE_MEMORIES = [
  { id: 's_1', title: 'Selfie — 1 Year Ago', date: 'August 2025', mood: '😊 Happy & Energetic', vibe: 'Bright Morning Sun', avatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🤳' },
  { id: 's_2', title: 'Selfie — 6 Months Ago', date: 'February 2026', mood: '😐 Focused', vibe: 'Cozy Workspace', avatarBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '🤳' },
  { id: 's_3', title: 'Selfie — Today', date: 'August 2026', mood: '😍 Super Happy', vibe: 'Fresh Air / Outdoors', avatarBg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', icon: '🤳' }
];

export default function PhotoSceneParserModal({
  isOpen,
  onClose,
  onSaveZettel
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('photo_scene'); // 'photo_scene' | 'selfie_memories'
  const [selectedSelfie, setSelectedSelfie] = useState(SAMPLE_SELFIE_MEMORIES[2]);
  const [comparisonTarget, setComparisonTarget] = useState(SAMPLE_SELFIE_MEMORIES[0]);
  const [customCaption, setCustomCaption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSaveSelfieZettel = () => {
    setIsProcessing(true);

    setTimeout(() => {
      onSaveZettel({
        title: `Selfie Telemetry: ${selectedSelfie.title}`,
        type: 'microlog',
        content: `**Current Vibe**: ${selectedSelfie.vibe}\n**Mood State**: ${selectedSelfie.mood}\n\n### 🔄 Google Photos Memories Time-Lapse Comparison:\nComparing today's selfie against **${comparisonTarget.title} (${comparisonTarget.date})**:\n- *Then (${comparisonTarget.date})*: ${comparisonTarget.vibe} (${comparisonTarget.mood})\n- *Now*: ${selectedSelfie.vibe} (${selectedSelfie.mood})\n\n**Notes**: ${customCaption.trim() || 'Selfie memory comparison recorded.'}`,
        tags: ['#selfie', '#memories', '#time_lapse', '#telemetry']
      });

      setIsProcessing(false);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.75 } });
      onClose();
    }, 500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={22} color="#ec4899" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                Photo Scene & Selfie Memories Engine
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Quantify scene atmosphere or perform Google Photos style time-lapse selfie comparisons
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.04)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('photo_scene')}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: activeTab === 'photo_scene' ? '1px solid #ec4899' : '1px solid transparent',
              background: activeTab === 'photo_scene' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
              color: activeTab === 'photo_scene' ? '#f472b6' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            📷 Photo Scene Quantifier
          </button>
          <button
            onClick={() => setActiveTab('selfie_memories')}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: activeTab === 'selfie_memories' ? '1px solid #ec4899' : '1px solid transparent',
              background: activeTab === 'selfie_memories' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
              color: activeTab === 'selfie_memories' ? '#f472b6' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            🤳 Selfie Memories & Time Comparison
          </button>
        </div>

        {activeTab === 'selfie_memories' ? (
          <div>
            <div style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f472b6', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <History size={15} /> 🔄 Google Photos Memories Time-Lapse Comparison:
              </div>

              {/* Side-by-side comparison cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
                
                {/* Past Memory Card */}
                <div style={{ background: comparisonTarget.avatarBg, padding: '0.75rem', borderRadius: '8px', color: '#fff', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem' }}>{comparisonTarget.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800' }}>Then: {comparisonTarget.date}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{comparisonTarget.vibe}</div>
                  <div style={{ fontSize: '0.68rem', marginTop: '0.2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '2px 4px' }}>
                    {comparisonTarget.mood}
                  </div>
                </div>

                {/* Today Selfie Card */}
                <div style={{ background: selectedSelfie.avatarBg, padding: '0.75rem', borderRadius: '8px', color: '#fff', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem' }}>{selectedSelfie.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800' }}>Now: Today ({selectedSelfie.date})</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{selectedSelfie.vibe}</div>
                  <div style={{ fontSize: '0.68rem', marginTop: '0.2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '2px 4px' }}>
                    {selectedSelfie.mood}
                  </div>
                </div>

              </div>

              <div style={{ marginBottom: '0.6rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Select Time-Lapse Comparison Baseline:
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => setComparisonTarget(SAMPLE_SELFIE_MEMORIES[0])}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.72rem', borderColor: comparisonTarget.id === 's_1' ? '#ec4899' : 'var(--border-color)' }}
                  >
                    1 Year Ago
                  </button>
                  <button
                    onClick={() => setComparisonTarget(SAMPLE_SELFIE_MEMORIES[1])}
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.72rem', borderColor: comparisonTarget.id === 's_2' ? '#ec4899' : 'var(--border-color)' }}
                  >
                    6 Months Ago
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Selfie Notes & Well-being Observations:
                </label>
                <input
                  type="text"
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="e.g. Energy levels much higher compared to 6 months ago..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveSelfieZettel}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', padding: '0.55rem', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <UserCheck size={15} /> {isProcessing ? 'Processing Selfie Memory...' : 'Save Selfie Time-Lapse Comparison Zettel'}
            </button>
          </div>
        ) : (
          <div>
            <div className="glass-card" style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', marginBottom: '1rem', padding: '0.8rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f472b6', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> Quantified Scene Telemetry:
              </div>

              <div style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '0.4rem' }}>
                Atmosphere Vibe: <strong>Cozy Focused Workspace</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Add Scene Commentary:
                </label>
                <input
                  type="text"
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="e.g. Clean workspace setup before starting afternoon coding session..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#fff', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveSelfieZettel}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', padding: '0.55rem', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Camera size={15} /> Append Photo Scene to Zettel Journal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

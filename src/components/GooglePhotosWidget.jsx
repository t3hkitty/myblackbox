import React from 'react';
import { Camera, Sparkles, Image, RefreshCw, Layers, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_PHOTOS_MEMORIES = [
  { id: 'p1', title: 'Selfie Memory: 6 Months Ago', date: 'Feb 4, 2026', vibe: '🌟 Energetic & Calm', mood: '#peaceful' },
  { id: 'p2', title: 'Selfie Memory: 1 Year Ago', date: 'Aug 4, 2025', vibe: '⚡ Focused Flow', mood: '#focus' },
  { id: 'p3', title: 'Hydration Station Photo Scene', date: 'Today 09:15 PT', vibe: '🥤 64oz Water Pallet', mood: '#hydration' }
];

export default function GooglePhotosWidget({
  onOpenPhotoModal,
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const handleQuickImportPhotoScene = (photo) => {
    onSaveZettel({
      title: `Google Photos Scene: ${photo.title}`,
      type: 'microlog',
      content: `**Google Photos Memory Import** (${photo.date}):\n- *Vibe*: ${photo.vibe}\n- *Mood Tag*: ${photo.mood}`,
      tags: ['#google_photos', '#selfie', '#memories', '#telemetry']
    });
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(236, 72, 153, 0.15)',
            color: '#ec4899',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Camera size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Google Photos & Selfie Time-Lapse
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Selfie time-lapse comparison & Photo Scene Zettel Parser
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={onTogglePin}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
            title="Pin panel side-by-side with sticky tape"
          >
            📌 {isPinned ? 'Unpin' : 'Pin Tape'}
          </button>
        </div>
      </div>

      <button
        onClick={onOpenPhotoModal}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '0.55rem',
          fontSize: '0.82rem',
          marginBottom: '0.8rem',
          background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem'
        }}
      >
        <Sparkles size={15} />
        <span>📷 Open Google Photos Scene & Selfie Time-Lapse Parser</span>
      </button>

      {/* Sample Memories Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {SAMPLE_PHOTOS_MEMORIES.map(photo => (
          <div key={photo.id} className="glass-card" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>{photo.title}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{photo.date} • {photo.vibe}</div>
            </div>

            <button
              onClick={() => handleQuickImportPhotoScene(photo)}
              className="btn-secondary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#f472b6', borderColor: 'rgba(244, 114, 182, 0.4)' }}
            >
              + Quick Log
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

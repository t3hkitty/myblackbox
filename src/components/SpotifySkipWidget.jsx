import React, { useState } from 'react';
import { Music, SkipForward, Play, Radio, Volume2, Sparkles, RefreshCw, Trash2, CheckSquare, Zap, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_SHORT_GAP_SKIPS = [
  { id: 's_1', title: 'Heavy Bass Noise', artist: 'Beat Laboratory', gapSeconds: 8, playlist: 'Focus Beats', recommendRemoval: true },
  { id: 's_2', title: 'Over-dramatic Intro', artist: 'Echo Sound', gapSeconds: 14, playlist: 'Focus Beats', recommendRemoval: true }
];

export default function SpotifySkipWidget({
  onLogSpotifyZettel
}) {
  const [skipItems, setSkipItems] = useState(SAMPLE_SHORT_GAP_SKIPS);
  const [trackName, setTrackName] = useState('');
  const [gapSecs, setGapSecs] = useState(12);

  const handleLogConsecutiveSkip = (e) => {
    e.preventDefault();
    if (!trackName.trim()) return;

    const newSkip = {
      id: `skip_${Date.now()}`,
      title: trackName.trim(),
      artist: 'Playlist Track',
      gapSeconds: Number(gapSecs),
      playlist: 'Focus Beats',
      recommendRemoval: Number(gapSecs) < 20
    };

    setSkipItems([newSkip, ...skipItems]);
    setTrackName('');

    // Dispatches Zettel log + Google Tasks #blackbox auto-task
    onLogSpotifyZettel({
      title: `🎵 Spotify Consecutive Short-Gap Skip: "${newSkip.title}" (${newSkip.gapSeconds}s gap)`,
      type: 'task',
      content: `**Track**: ${newSkip.title}\n**Play Gap**: ${newSkip.gapSeconds} seconds (consecutive skip)\n**Recommendation**: ${newSkip.recommendRemoval ? '🗑️ Flagged to remove from playlist due to short-gap skip frequency.' : 'Logged.'}`,
      tags: ['#spotify', '#music_telemetry', '#blackbox_task', '#roundtoit'],
      metadata: { trackTitle: newSkip.title, gapSeconds: newSkip.gapSeconds }
    });

    confetti({ particleCount: 25, spread: 50, origin: { y: 0.85 } });
  };

  const handleRemoveTrackFromPlaylist = (id, title) => {
    setSkipItems(skipItems.filter(i => i.id !== id));
    onLogSpotifyZettel({
      title: `🗑️ Spotify Playlist Cleanup: Flagged "${title}" for removal`,
      type: 'task',
      content: `Added task to #blackbox Google Tasks list: Remove "${title}" from Focus Beats playlist.`,
      tags: ['#blackbox_task', '#spotify_cleanup', '#playlist']
    });
    alert(`🗑️ Added removal task for "${title}" to your #blackbox Google Tasks list & IFTTT webhook!`);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Music size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Spotify Consecutive Skip & Playlist Cleanup
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Detects short play gaps (under 20s) to auto-flag tracks to remove from playlists
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          🎵 {skipItems.length} Short-Gap Skips
        </span>
      </div>

      {/* Short Gap Skip Intake Form */}
      <form onSubmit={handleLogConsecutiveSkip} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
          placeholder="Song title skipped quickly..."
          style={{ flex: 1, minWidth: '160px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gap:</span>
          <input
            type="number"
            value={gapSecs}
            onChange={(e) => setGapSecs(e.target.value)}
            style={{ width: '45px', background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700' }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>s</span>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
          <SkipForward size={14} /> Log Short Gap Skip
        </button>
      </form>

      {/* Flagged Tracks for Removal List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {skipItems.map(item => (
          <div key={item.id} className="glass-card" style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '3px solid #10b981' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Skipped after <strong>{item.gapSeconds}s</strong> gap • <span>{item.playlist}</span>
              </div>
            </div>

            <button
              onClick={() => handleRemoveTrackFromPlaylist(item.id, item.title)}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Add task to #blackbox Google Tasks to remove this song from playlist"
            >
              <Trash2 size={13} />
              <span>Flag to Remove</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

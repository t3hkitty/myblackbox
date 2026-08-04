import React, { useState } from 'react';
import { MessageSquare, Send, BookOpen, Tv, Film, Sparkles, Zap, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const MEDIA_TYPES = [
  { id: 'book', label: 'Ebook / Reading', icon: BookOpen, tag: '#reading', defaultTitle: 'Project Hail Mary' },
  { id: 'tv', label: 'TV Show', icon: Tv, tag: '#tv_show', defaultTitle: 'House of the Dragon S2E4' },
  { id: 'movie', label: 'Movie', icon: Film, tag: '#movie', defaultTitle: 'Dune: Part Two' }
];

export default function LiveMicroTweetBar({
  activeBookTitle,
  onPostMicroTweet,
  onStartBlackboxTask
}) {
  const [mediaType, setMediaType] = useState('book'); // 'book' | 'tv' | 'movie'
  const [mediaTitle, setMediaTitle] = useState(activeBookTitle || '');
  const [quoteText, setQuoteText] = useState('');
  const [reactionComment, setReactionComment] = useState('');
  const [isTaskActive, setIsTaskActive] = useState(false);

  const activeMediaObj = MEDIA_TYPES.find(m => m.id === mediaType) || MEDIA_TYPES[0];

  const handleStartMediaBlackboxTask = () => {
    const currentTitle = mediaTitle.trim() || activeMediaObj.defaultTitle;
    onStartBlackboxTask(`${activeMediaObj.label}: ${currentTitle}`);
    setIsTaskActive(true);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handlePostTweet = (e) => {
    e.preventDefault();
    if (!quoteText.trim() && !reactionComment.trim()) return;

    const currentTitle = mediaTitle.trim() || activeMediaObj.defaultTitle;

    onPostMicroTweet({
      title: `Live Reaction: ${currentTitle}`,
      type: 'microlog',
      content: `> "${quoteText.trim()}"\n\n**Private Reaction**: ${reactionComment.trim()}`,
      tags: ['#micro_tweet', activeMediaObj.tag, '#telemetry']
    });

    setQuoteText('');
    setReactionComment('');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(29, 155, 240, 0.15)',
            color: '#1d9bf0',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Private "Micro-Tweet" Live Reaction Bar
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live-comment on books, TV shows & movies with 1-tap Blackbox task timer
            </p>
          </div>
        </div>

        {/* Media Type Switcher */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.04)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {MEDIA_TYPES.map(m => {
            const Icon = m.icon;
            const isSelected = mediaType === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMediaType(m.id)}
                style={{
                  background: isSelected ? 'rgba(29, 155, 240, 0.25)' : 'transparent',
                  color: isSelected ? '#1d9bf0' : 'var(--text-muted)',
                  border: isSelected ? '1px solid #1d9bf0' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Icon size={13} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title Input & Blackbox Task Start Control */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={mediaTitle}
          onChange={(e) => setMediaTitle(e.target.value)}
          placeholder={`${activeMediaObj.label} Title... (e.g. ${activeMediaObj.defaultTitle})`}
          style={{ flex: 1, minWidth: '180px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.7rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
        />

        <button
          onClick={handleStartMediaBlackboxTask}
          className="btn-secondary"
          style={{
            padding: '0.45rem 0.75rem',
            fontSize: '0.78rem',
            borderColor: isTaskActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)',
            color: isTaskActive ? '#34d399' : '#60a5fa'
          }}
          title="Start live Blackbox task session for this media"
        >
          <Zap size={14} color={isTaskActive ? '#34d399' : '#60a5fa'} />
          <span>{isTaskActive ? '⏱️ Session Active' : '⏱️ Start Blackbox Session'}</span>
        </button>
      </div>

      {/* Micro-Tweet Composer Form */}
      <form onSubmit={handlePostTweet} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          type="text"
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          placeholder={`Quote / Moment... (e.g. "That plot twist in scene 3 was insane")`}
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.7rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={reactionComment}
            onChange={(e) => setReactionComment(e.target.value)}
            placeholder="Your private reaction / thought..."
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.7rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #1d9bf0 0%, #0c85d0 100%)' }}>
            <Send size={14} /> Tweet
          </button>
        </div>
      </form>
    </div>
  );
}

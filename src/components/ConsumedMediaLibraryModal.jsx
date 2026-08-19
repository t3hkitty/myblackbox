import React, { useState } from 'react';
import { X, BookOpen, Tv, Film, Star, MessageSquare, Tag, Calendar, Sparkles, Maximize2, Minimize2, Plus, Info, CheckCircle2, HelpCircle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_CONSUMED_ITEMS = [
  {
    id: 'media_1',
    title: 'The F*ck It Diet',
    author: 'Caroline Dooner',
    type: 'book',
    moodBefore: '😐 Anxious',
    moodAfter: '😍 Empowered & Relieved',
    change: 'Discontinue all calorie tracking apps',
    readMore: 'Yes, absolutely',
    comments: 'Ditch the shame and honor natural appetite cues. A total paradigm shift.',
    predictedRating: 4.9,
    datePT: '20260804-0930'
  },
  {
    id: 'media_2',
    title: 'Severance (Season 2)',
    author: 'Ben Stiller / Apple TV+',
    type: 'tv',
    moodBefore: '⚡ Curious',
    moodAfter: '🤯 Mind Blown',
    change: 'Pacing in episode 4 was masterclass',
    readMore: 'Yes, looking forward to next season',
    comments: 'Incredible workplace psychological thriller.',
    predictedRating: 4.8,
    datePT: '20260803-2115'
  }
];

export default function ConsumedMediaLibraryModal({
  isOpen,
  onClose,
  allLogs = [],
  onSaveZettel
}) {
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'book' | 'tv' | 'movie'
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // New item form state
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customType, setCustomType] = useState('book');
  const [customRating, setCustomRating] = useState(5.0);
  const [customComments, setCustomComments] = useState('');

  // Dynamically extract media Zettels from allLogs
  const extractedMediaZettels = (allLogs || []).filter(l => {
    const isMediaTag = l.tags && l.tags.some(t => ['#book_review', '#media_vault', '#review', '#reading', '#dnf', '#movie', '#tv'].includes(t.toLowerCase()));
    const isBookType = l.type === 'book_review' || l.type === 'media';
    return isMediaTag || isBookType;
  }).map(l => ({
    id: l.id,
    title: l.title.replace(/^Finished & Reviewed:\s*/i, '').replace(/^DNF \(Did Not Finish\):\s*/i, ''),
    author: l.metadata?.author || 'User Logged Review',
    type: l.tags && l.tags.includes('#movie') ? 'movie' : l.tags && l.tags.includes('#tv') ? 'tv' : 'book',
    moodBefore: l.metadata?.moodBefore || '😐 Baseline',
    moodAfter: l.metadata?.moodAfter || '😊 Satisfied',
    change: l.metadata?.change || 'Recorded in Zettel feed',
    readMore: 'Yes',
    comments: l.content.substring(0, 140) + '...',
    predictedRating: l.metadata?.rating || 4.5,
    datePT: l.zettelId || 'Recent'
  }));

  // Combine sample items and dynamic Zettels
  const combinedItems = [...extractedMediaZettels];
  SAMPLE_CONSUMED_ITEMS.forEach(sample => {
    if (!combinedItems.some(item => item.title.toLowerCase() === sample.title.toLowerCase())) {
      combinedItems.push(sample);
    }
  });

  const filteredItems = activeFilter === 'ALL'
    ? combinedItems
    : combinedItems.filter(i => i.type === activeFilter);

  const handleAddCustomMedia = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    if (onSaveZettel) {
      onSaveZettel({
        title: `Finished & Reviewed: ${customTitle.trim()}`,
        type: 'book_review',
        content: `### 🌟 Media Vault Review: ${customTitle.trim()}\n**Author / Creator**: ${customAuthor.trim() || 'Unknown'}\n**Type**: ${customType}\n**Rating**: ${customRating} / 5.0 ⭐\n\n### 📝 Review Notes:\n> "${customComments.trim() || 'Logged directly to Consumed Media Vault.'}"`,
        tags: ['#media_vault', `#${customType}`, '#review', '#book_review', '#telemetry'],
        metadata: { author: customAuthor, rating: customRating }
      });
    }

    setCustomTitle('');
    setCustomAuthor('');
    setCustomComments('');
    setIsAddFormOpen(false);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="modal-backdrop" style={{ backdropFilter: 'blur(10px)' }} onClick={onClose}>
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: isFullScreen ? '95vw' : '720px',
          width: isFullScreen ? '95vw' : '100%',
          height: isFullScreen ? '92vh' : 'auto',
          maxHeight: isFullScreen ? '92vh' : '88vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={22} color="#a78bfa" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                📚 Consumed Media Vault & Response Library ({filteredItems.length} Titles)
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tracked responses, before/after moods, and ratings for books, TV shows & movies
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="btn-secondary"
              style={{ borderColor: 'rgba(167, 139, 250, 0.4)', color: '#c4b5fd', background: 'rgba(167, 139, 250, 0.12)', fontSize: '0.75rem', padding: '0.25rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title={isFullScreen ? 'Minimize View' : 'Full Screen Grid View'}
            >
              {isFullScreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isFullScreen ? 'Minimize' : '🖥️ Full Screen'}</span>
            </button>

            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* How Items are Added Explanation Card */}
        {showExplanation && (
          <div className="glass-card" style={{ padding: '0.75rem', marginBottom: '0.9rem', background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '8px', position: 'relative' }}>
            <button
              onClick={() => setShowExplanation(false)}
              style={{ position: 'absolute', right: '8px', top: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c4b5fd', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={15} color="#a78bfa" />
              💡 How Items Are Added to the Media Vault:
            </div>
            <ul style={{ fontSize: '0.74rem', color: '#e2e8f0', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.5' }}>
              <li>
                <strong>1. Finish a Book in Currently Reading</strong>: Clicking <code>CheckCircle Finish</code> on any book in the <em>Currently Reading Shelf</em> opens the Review Modal and saves it directly here.
              </li>
              <li>
                <strong>2. Log a DNF Tirade</strong>: Ranting about abandoning a book moves your DNF Zettel directly into the Vault archive.
              </li>
              <li>
                <strong>3. Auto-Zettel Tagging</strong>: Any log tagged <code>#book_review</code>, <code>#media_vault</code>, or <code>#reading</code> automatically streams into this library.
              </li>
              <li>
                <strong>4. Manual Entry</strong>: Click the <code>+ Add Review</code> button below to log any movie, TV series, or book immediately!
              </li>
            </ul>
          </div>
        )}

        {/* Filter Bar & Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['ALL', 'book', 'tv', 'movie'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="btn-secondary"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderColor: activeFilter === f ? '#a78bfa' : 'var(--border-color)',
                  background: activeFilter === f ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                  color: activeFilter === f ? '#c4b5fd' : 'var(--text-muted)'
                }}
              >
                {f === 'ALL' ? '🌟 All Media' : f === 'book' ? '📖 Books' : f === 'tv' ? '📺 TV Shows' : '🎬 Movies'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={14} />
            <span>+ Add Review</span>
          </button>
        </div>

        {/* Manual Add Custom Review Form */}
        {isAddFormOpen && (
          <form onSubmit={handleAddCustomMedia} className="glass-card" style={{ padding: '0.85rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167, 139, 250, 0.4)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#c4b5fd' }}>
              ✍️ Log Custom Media Vault Entry
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Title (e.g. Dune Part 2)..."
                style={{ flex: 1, minWidth: '160px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}
              />
              <input
                type="text"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                placeholder="Director / Author..."
                style={{ width: '140px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}
              />
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                style={{ width: '100px', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}
              >
                <option value="book">📖 Book</option>
                <option value="tv">📺 TV Show</option>
                <option value="movie">🎬 Movie</option>
              </select>
            </div>

            <textarea
              rows="2"
              value={customComments}
              onChange={(e) => setCustomComments(e.target.value)}
              placeholder="Your thoughts, review commentary, or key takeaways..."
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem', outline: 'none' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
              <button type="button" onClick={() => setIsAddFormOpen(false)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.73rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.73rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                Save to Vault
              </button>
            </div>
          </form>
        )}

        {/* Media Items Grid / Detail View */}
        {selectedMedia ? (
          <div className="glass-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {/* Header Navigation Bar with Back Arrow and Close X */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setSelectedMedia(null)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.65rem', fontSize: '0.78rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
              >
                <ArrowLeft size={14} /> ← Back to Library Results
              </button>

              <button
                onClick={() => setSelectedMedia(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                title="Close Item Detail"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selected Item Full Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{selectedMedia.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {selectedMedia.author}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#fcd34d', fontSize: '0.9rem', fontWeight: '800' }}>
                <Star size={16} fill="#fcd34d" />
                <span>{selectedMedia.predictedRating}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.78rem', background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '6px' }}>
              <div>Mood Before: <strong style={{ color: '#fff' }}>{selectedMedia.moodBefore}</strong></div>
              <div>Mood After: <strong style={{ color: '#34d399' }}>{selectedMedia.moodAfter}</strong></div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              <strong>Review & Takeaways:</strong>
              <blockquote style={{ margin: '0.4rem 0', paddingLeft: '0.6rem', borderLeft: '3px solid #a78bfa', fontStyle: 'italic', color: '#c4b5fd' }}>
                "{selectedMedia.comments}"
              </blockquote>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
              <span>📅 Logged: {selectedMedia.datePT} PT</span>
              <span>💡 Action: {selectedMedia.change}</span>
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: isFullScreen ? 'grid' : 'flex',
            flexDirection: isFullScreen ? 'none' : 'column',
            gridTemplateColumns: isFullScreen ? 'repeat(auto-fit, minmax(320px, 1fr))' : 'none',
            gap: '0.75rem',
            maxHeight: isFullScreen ? '100%' : '440px',
            overflowY: 'auto',
            paddingRight: '0.3rem'
          }}>
            {filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No media vault items match this filter yet.
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="glass-card"
                  style={{
                    padding: '0.85rem',
                    borderLeft: item.type === 'book' ? '4px solid #a78bfa' : item.type === 'tv' ? '4px solid #3b82f6' : '4px solid #f59e0b',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  title="Click to view full detail & return via Back Arrow"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div>
                      <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#fff' }}>{item.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>by {item.author}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#fcd34d', fontSize: '0.8rem', fontWeight: '700' }}>
                      <Star size={14} fill="#fcd34d" />
                      <span>{item.predictedRating}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    <div>Mood Before: <strong style={{ color: '#fff' }}>{item.moodBefore}</strong></div>
                    <div>Mood After: <strong style={{ color: '#34d399' }}>{item.moodAfter}</strong></div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#e2e8f0', margin: '0 0 0.4rem 0', lineHeight: '1.45', fontStyle: 'italic' }}>
                    "{item.comments}"
                  </p>

                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                    <span>📅 Logged: {item.datePT} PT</span>
                    <span style={{ color: '#60a5fa', fontWeight: '700' }}>🔍 Click to Inspect →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

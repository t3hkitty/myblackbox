import React, { useState } from 'react';
import { X, Sparkles, Star, Download, Check } from 'lucide-react';
import { calculateAiBookRating, generateEbookReviewZettel } from '../services/ratingEngine';
import { downloadMarkdownFile } from '../services/zettelEngine';
import confetti from 'canvas-confetti';

export default function BookReviewModal({
  isOpen,
  onClose,
  sessionData,
  activeMoodSet,
  onCompleteReview
}) {
  const moods = activeMoodSet?.moods || [];
  
  const [moodBefore, setMoodBefore] = useState(sessionData.moodBefore || moods[1] || null);
  const [moodAfter, setMoodAfter] = useState(moods[0] || null);
  const [changeOneThing, setChangeOneThing] = useState('');
  const [wouldReadMore, setWouldReadMore] = useState('yes');
  const [hasReadAuthorBefore, setHasReadAuthorBefore] = useState(false);
  const [additionalComments, setAdditionalComments] = useState('');

  if (!isOpen || !sessionData) return null;

  // Real-time rating preview
  const aiRating = calculateAiBookRating({
    title: sessionData.title,
    author: sessionData.author,
    isWebnovel: sessionData.isWebnovel,
    seriesName: sessionData.seriesName,
    moodBefore,
    moodAfter,
    changeOneThing,
    wouldReadMore,
    hasReadAuthorBefore,
    additionalComments
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const fullReviewData = {
      ...sessionData,
      moodBefore,
      moodAfter,
      changeOneThing,
      wouldReadMore,
      hasReadAuthorBefore,
      additionalComments
    };

    const reviewZettel = generateEbookReviewZettel(fullReviewData);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    onCompleteReview(reviewZettel);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
              📖 Quick Ebook Review Protocol
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              "{sessionData.title}" by {sessionData.author}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* AI Rating Prediction Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: '#93c5fd' }}>
              <Sparkles size={16} /> AI Rating Guesstimate for Reader:
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#facc15', fontFamily: 'var(--font-mono)' }}>
              {aiRating.stars} ({aiRating.rating} / 5.0)
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Calculated from author familiarity, mood shift & feedback
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Question 1: Mood Before & After */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#fff', marginBottom: '0.5rem' }}>
              1. Mood (Before & After Reading):
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Before:</span>
                <select
                  value={moodBefore?.id || ''}
                  onChange={(e) => setMoodBefore(moods.find(m => m.id === e.target.value))}
                  style={{ width: '100%', background: '#111827', color: '#fff', border: '1px solid var(--border-color)', padding: '0.4rem', borderRadius: '6px' }}
                >
                  {moods.map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>After:</span>
                <select
                  value={moodAfter?.id || ''}
                  onChange={(e) => setMoodAfter(moods.find(m => m.id === e.target.value))}
                  style={{ width: '100%', background: '#111827', color: '#fff', border: '1px solid var(--border-color)', padding: '0.4rem', borderRadius: '6px' }}
                >
                  {moods.map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Question 2: 1 thing to change */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#fff', marginBottom: '0.4rem' }}>
              2. One thing you'd change about the book:
            </label>
            <input
              type="text"
              value={changeOneThing}
              onChange={(e) => setChangeOneThing(e.target.value)}
              placeholder="e.g. Better pacing in middle chapters, different ending..."
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Question 3: Would read more like this? */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#fff', marginBottom: '0.4rem' }}>
              3. Would you read more books like this?
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', color: '#fff' }}>
                <input
                  type="radio"
                  name="wouldReadMore"
                  value="yes"
                  checked={wouldReadMore === 'yes'}
                  onChange={(e) => setWouldReadMore(e.target.value)}
                />
                Yes, absolutely
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', color: '#fff' }}>
                <input
                  type="radio"
                  name="wouldReadMore"
                  value="maybe"
                  checked={wouldReadMore === 'maybe'}
                  onChange={(e) => setWouldReadMore(e.target.value)}
                />
                Maybe / Depends
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', color: '#fff' }}>
                <input
                  type="radio"
                  name="wouldReadMore"
                  value="no"
                  checked={wouldReadMore === 'no'}
                  onChange={(e) => setWouldReadMore(e.target.value)}
                />
                No
              </label>
            </div>
          </div>

          {/* Question 4: Additional comments & author history */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hasReadAuthorBefore}
                onChange={(e) => setHasReadAuthorBefore(e.target.checked)}
              />
              I have read other books by <strong>{sessionData.author}</strong> before
            </label>

            <textarea
              rows={2}
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Additional comments or key takeaway quotes..."
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>Generate Zettel Book Review Card</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

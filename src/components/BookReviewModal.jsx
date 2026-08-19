import React, { useState, useEffect } from 'react';
import { X, Sparkles, Star, Download, Check, MessageSquare, Quote } from 'lucide-react';
import { calculateAiBookRating, generateEbookReviewZettel } from '../services/ratingEngine';
import confetti from 'canvas-confetti';

export default function BookReviewModal({
  isOpen,
  onClose,
  sessionData,
  activeMoodSet,
  allLogs = [],
  onCompleteReview
}) {
  const moods = activeMoodSet?.moods || [];
  
  const [moodBefore, setMoodBefore] = useState(sessionData?.moodBefore || moods[1] || null);
  const [moodAfter, setMoodAfter] = useState(moods[0] || null);
  const [changeOneThing, setChangeOneThing] = useState('');
  const [wouldReadMore, setWouldReadMore] = useState('yes');
  const [hasReadAuthorBefore, setHasReadAuthorBefore] = useState(false);
  const [additionalComments, setAdditionalComments] = useState('');
  const [selectedTweetIds, setSelectedTweetIds] = useState([]);

  // Find live micro-tweets matching this book title
  const matchingMicroTweets = (allLogs || []).filter(l => {
    if (!sessionData || !sessionData.title) return false;
    const isMicroTweet = l.tags && (l.tags.includes('#micro_tweet') || l.tags.includes('#reading'));
    const titleMatch = (l.title || '').toLowerCase().includes(sessionData.title.toLowerCase()) || 
                       (l.content || '').toLowerCase().includes(sessionData.title.toLowerCase());
    return isMicroTweet && titleMatch;
  });

  useEffect(() => {
    if (matchingMicroTweets.length > 0) {
      setSelectedTweetIds(matchingMicroTweets.map(t => t.id));
    }
  }, [sessionData]);

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

  const handleToggleTweetSelect = (id) => {
    if (selectedTweetIds.includes(id)) {
      setSelectedTweetIds(selectedTweetIds.filter(i => i !== id));
    } else {
      setSelectedTweetIds([...selectedTweetIds, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const appendedMicroTweets = matchingMicroTweets.filter(t => selectedTweetIds.includes(t.id));

    const fullReviewData = {
      ...sessionData,
      moodBefore,
      moodAfter,
      changeOneThing,
      wouldReadMore,
      hasReadAuthorBefore,
      additionalComments,
      appendedMicroTweets
    };

    const reviewZettel = generateEbookReviewZettel(fullReviewData);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    onCompleteReview(reviewZettel);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
              📖 Complete Book & Review Protocol
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              "{sessionData.title}" by {sessionData.author || 'Unknown Author'}
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
              I have read other books by <strong>{sessionData.author || 'this author'}</strong> before
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

          {/* Question 5: Appended Live Micro-Tweets & Quotes */}
          {matchingMicroTweets.length > 0 && (
            <div style={{ background: 'rgba(29, 155, 240, 0.08)', border: '1px solid rgba(29, 155, 240, 0.3)', borderRadius: '8px', padding: '0.8rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#60a5fa', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Quote size={14} color="#60a5fa" />
                <span>📱 Append Posted Live Micro-Tweets ({matchingMicroTweets.length}) into Final Review:</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
                {matchingMicroTweets.map(tw => (
                  <label key={tw.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '6px' }}>
                    <input
                      type="checkbox"
                      checked={selectedTweetIds.includes(tw.id)}
                      onChange={() => handleToggleTweetSelect(tw.id)}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{tw.title}</div>
                      <div style={{ fontStyle: 'italic', fontSize: '0.72rem' }}>{tw.content}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Check size={16} />
              <span>Complete & Move to Media Vault</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

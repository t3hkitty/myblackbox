import React, { useState } from 'react';
import { BookOpen, Star, Plus, Play, CheckCircle, Clock, Trash2, XCircle, Flame, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EbookTracker({
  activeMoodSet,
  onSaveBookReviewZettel
}) {
  const [currentlyReading, setCurrentlyReading] = useState([
    { id: 'b_1', title: 'Project Hail Mary', author: 'Andy Weir', progress: 'Chapter 5 (p. 142)', category: 'Sci-Fi' },
    { id: 'b_2', title: 'The Design of Everyday Things', author: 'Don Norman', progress: 'Page 88', category: 'Design' }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [dnfBook, setDnfBook] = useState(null);
  const [dnfReason, setDnfReason] = useState('');
  const [dnfTirade, setDnfTirade] = useState('');

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const book = {
      id: `b_${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Unknown Author',
      progress: 'Just Started',
      category: 'General'
    };

    setCurrentlyReading([...currentlyReading, book]);
    setNewTitle('');
    setNewAuthor('');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleOpenDnfModal = (book) => {
    setDnfBook(book);
    setDnfReason('Boring / Pacing issues');
    setDnfTirade('');
  };

  const handleConfirmDnfTirade = (e) => {
    e.preventDefault();
    if (!dnfBook) return;

    onSaveBookReviewZettel({
      title: `DNF (Did Not Finish): ${dnfBook.title}`,
      type: 'book_review',
      content: `### 🚫 Cancelled Reading / DNF Tirade\n**Book**: ${dnfBook.title} by ${dnfBook.author}\n**Abandoned At**: ${dnfBook.progress}\n**Primary Reason**: ${dnfReason}\n\n### 🤬 DNF Tirade Commentary:\n> "${dnfTirade.trim() || 'Decided to stop reading. Life is too short for bad books!'}"`,
      tags: ['#dnf', '#tirade', '#reading_cancelled', '#reading']
    });

    setCurrentlyReading(currentlyReading.filter(b => b.id !== dnfBook.id));
    setDnfBook(null);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Currently Reading & Media Shelf
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Active reading sessions with DNF (Did Not Finish) tirade logger
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          {currentlyReading.length} In Progress
        </span>
      </div>

      {/* Add New Book Form */}
      <form onSubmit={handleAddBook} style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Book title..."
          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
        />
        <input
          type="text"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          placeholder="Author..."
          style={{ width: '110px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem' }}>
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Currently Reading List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {currentlyReading.map(book => (
          <div key={book.id} className="glass-card" style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{book.title}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>by {book.author}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#60a5fa' }}>
                Progress: {book.progress}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                onClick={() => handleOpenDnfModal(book)}
                className="btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                title="Cancel reading & log DNF (Did Not Finish) tirade"
              >
                <XCircle size={13} /> DNF Tirade
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DNF Tirade Modal */}
      {dnfBook && (
        <div className="modal-backdrop" onClick={() => setDnfBook(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <XCircle size={18} /> Cancel Reading / DNF Tirade: {dnfBook.title}
              </div>
              <button onClick={() => setDnfBook(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDnfTirade} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Why are you abandoning this book? (Primary DNF Reason):
                </label>
                <select
                  value={dnfReason}
                  onChange={(e) => setDnfReason(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.82rem' }}
                >
                  <option value="Boring / Slow Pacing">Boring / Slow Pacing</option>
                  <option value="Unlikable Characters">Unlikable Characters</option>
                  <option value="Terrible Plot Twist">Terrible Plot Twist</option>
                  <option value="Bad Writing Style">Bad Writing Style</option>
                  <option value="Life is Too Short for Bad Books">Life is Too Short for Bad Books!</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#fca5a5', fontWeight: '700', marginBottom: '0.3rem' }}>
                  🤬 DNF Tirade (Vent your true thoughts!):
                </label>
                <textarea
                  rows={3}
                  value={dnfTirade}
                  onChange={(e) => setDnfTirade(e.target.value)}
                  placeholder="Vent about why you are stopping... (e.g. 'Chapter 4 completely ruined the protagonist character arc. DNFing right here.')"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '0.5rem' }}>
                <Flame size={15} /> Log DNF Tirade to Zettel Journal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

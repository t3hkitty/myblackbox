import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Plus, Play, CheckCircle, Clock, Trash2, XCircle, Flame, MessageSquare, ChevronDown, ChevronUp, Quote, CheckSquare, Square, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import BookReviewModal from './BookReviewModal';
import LibraryMediaPickerModal from './LibraryMediaPickerModal';

const DISASSOCIATED_BOOKS_KEY = 'blackbox_disassociated_books_v1';
const STORED_READING_SHELF_KEY = 'blackbox_stored_reading_shelf_v1';

export default function EbookTracker({
  allLogs = [],
  activeMoodSet,
  onSaveBookReviewZettel
}) {
  const [currentlyReading, setCurrentlyReading] = useState(() => {
    const data = localStorage.getItem(STORED_READING_SHELF_KEY);
    if (data) {
      try { return JSON.parse(data); } catch (e) {}
    }
    return [
      { id: 'b_1', title: 'The F*ck It Diet', author: 'Caroline Dooner', progress: 'Chapter 5 (p. 142)', category: '#reading' },
      { id: 'b_2', title: 'The Design of Everyday Things', author: 'Don Norman', progress: 'Page 88', category: '#reading' }
    ];
  });

  const [removedBookIds, setRemovedBookIds] = useState(() => {
    const stored = localStorage.getItem(DISASSOCIATED_BOOKS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [];
  });

  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [activeReadingBookId, setActiveReadingBookId] = useState(() => {
    return localStorage.getItem('blackbox_active_reading_book_v1') || 'b_1';
  });

  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [dnfBook, setDnfBook] = useState(null);
  const [dnfReason, setDnfReason] = useState('');
  const [dnfTirade, setDnfTirade] = useState('');
  const [expandedTweetBookId, setExpandedTweetBookId] = useState(null);
  const [reviewingBook, setReviewingBook] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);

  const handleSelectVaultItem = (item) => {
    const newBook = {
      id: item.id || `b_${Date.now()}`,
      title: item.title,
      author: item.author,
      progress: item.progress || 'Active Vault Item',
      category: item.category || '#reading'
    };

    setCurrentlyReading(prev => {
      if (prev.some(b => b.id === newBook.id || b.title.toLowerCase() === newBook.title.toLowerCase())) {
        return prev;
      }
      return [newBook, ...prev];
    });

    setActiveReadingBookId(newBook.id);
    localStorage.setItem('blackbox_active_reading_book_v1', newBook.id);

    onSaveBookReviewZettel({
      title: `Displayed Vault Item: ${newBook.title}`,
      type: 'book_review',
      content: `Linked and displayed vault item "${newBook.title}" by ${newBook.author} directly in myBlackbox Media Vault.`,
      tags: ['#reading', '#vault', '#blackbox', '#media_picker'],
      metadata: { author: newBook.author, progress: newBook.progress }
    });

    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
  };

  const handleSetActiveBook = (id) => {
    setActiveReadingBookId(id);
    localStorage.setItem('blackbox_active_reading_book_v1', id);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const handleLogBookSession = (book) => {
    onSaveBookReviewZettel({
      title: `Reading Session: ${book.title}`,
      type: 'book_review',
      content: `**Active Reading Session**: ${book.title} by ${book.author}\n**Progress**: ${book.progress}\n\nLogged reading sprint session telemetry.`,
      tags: ['#reading', '#ebook', '#book', '#telemetry'],
      metadata: { author: book.author, progress: book.progress }
    });
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    alert(`📖 Reading Session logged for "${book.title}"!`);
  };

  // Save changes to localStorage whenever currentlyReading or removedBookIds update
  useEffect(() => {
    localStorage.setItem(DISASSOCIATED_BOOKS_KEY, JSON.stringify(removedBookIds));
  }, [removedBookIds]);

  useEffect(() => {
    localStorage.setItem(STORED_READING_SHELF_KEY, JSON.stringify(currentlyReading));
  }, [currentlyReading]);

  // Cleanly filter allLogs for explicit reading entries ONLY (not generic #zettel)
  const logReadingEntries = (allLogs || []).filter(l => {
    const isExplicitReadingTag = l.tags && l.tags.some(t => ['#reading', '#ebook', '#book', '#tbr'].includes(t.toLowerCase()));
    const isReadingType = l.type === 'book_review';
    return isExplicitReadingTag || isReadingType;
  }).map(l => ({
    id: l.id,
    title: l.title.replace(/^Started (Reading|Task):\s*/i, '').replace(/^Reading:\s*/i, '').replace(/^Finished & Reviewed:\s*/i, ''),
    author: l.metadata?.author || 'Logged Telemetry Session',
    progress: l.metadata?.progress || `Logged: ${l.zettelId || 'Recent'}`,
    category: '#reading',
    fromLog: true
  }));

  // Combine items safely
  const combinedReadingList = [...currentlyReading].filter(b => !removedBookIds.includes(b.id));
  logReadingEntries.forEach(logItem => {
    if (!removedBookIds.includes(logItem.id) && !combinedReadingList.some(b => b.title.toLowerCase() === logItem.title.toLowerCase() || b.id === logItem.id)) {
      combinedReadingList.push(logItem);
    }
  });

  const handleToggleSelectBook = (id) => {
    if (selectedBookIds.includes(id)) {
      setSelectedBookIds(selectedBookIds.filter(i => i !== id));
    } else {
      setSelectedBookIds([...selectedBookIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedBookIds.length === combinedReadingList.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(combinedReadingList.map(b => b.id));
    }
  };

  const handleRemoveSingle = (book) => {
    const updatedRemoved = Array.from(new Set([...removedBookIds, book.id]));
    setRemovedBookIds(updatedRemoved);
    setCurrentlyReading(currentlyReading.filter(b => b.id !== book.id));
    if (selectedBookIds.includes(book.id)) {
      setSelectedBookIds(selectedBookIds.filter(i => i !== book.id));
    }
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const handleEraseSelected = () => {
    if (selectedBookIds.length === 0) return;
    if (window.confirm(`Disassociate ${selectedBookIds.length} selected book(s) from shelf?`)) {
      const updatedRemoved = Array.from(new Set([...removedBookIds, ...selectedBookIds]));
      setRemovedBookIds(updatedRemoved);
      setCurrentlyReading(currentlyReading.filter(b => !selectedBookIds.includes(b.id)));
      setSelectedBookIds([]);
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleWipeAll = () => {
    if (window.confirm('⚠️ Are you sure you want to Wipe / Erase ALL books from the Currently Reading shelf?')) {
      const allIds = combinedReadingList.map(b => b.id);
      const updatedRemoved = Array.from(new Set([...removedBookIds, ...allIds]));
      setRemovedBookIds(updatedRemoved);
      setCurrentlyReading([]);
      setSelectedBookIds([]);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const cleanTitle = newTitle.trim();
    const cleanAuthor = newAuthor.trim() || 'Unknown Author';

    const book = {
      id: `b_${Date.now()}`,
      title: cleanTitle,
      author: cleanAuthor,
      progress: 'Just Started',
      category: '#reading'
    };

    setCurrentlyReading([...currentlyReading, book]);

    onSaveBookReviewZettel({
      title: `Started Reading: ${cleanTitle}`,
      type: 'book_review',
      content: `Started reading "${cleanTitle}" by ${cleanAuthor}. Added to Currently Reading shelf.`,
      tags: ['#reading', '#ebook', '#book', '#telemetry'],
      metadata: { author: cleanAuthor, progress: 'Just Started' }
    });

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
      title: `DNF Tirade: ${dnfBook.title}`,
      type: 'dnf_rant',
      content: `**Abandoned Book**: ${dnfBook.title} by ${dnfBook.author}\n**Reason**: ${dnfReason}\n\n**Rant & Tirade**:\n${dnfTirade || 'No further notes.'}`,
      tags: ['#dnf', '#book_rant', '#reading', '#telemetry'],
      metadata: { author: dnfBook.author, reason: dnfReason }
    });

    handleRemoveSingle(dnfBook);
    setDnfBook(null);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ margin: '0 1rem 1.5rem 1rem', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color="#a78bfa" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>
              📚 Currently Reading Shelf ({combinedReadingList.length} Active Titles)
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Track active books, log DNF rants, or complete full reviews
            </p>
          </div>
        </div>

        {/* Multi-Select & Wipe Controls */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsLibraryPickerOpen(true)}
            className="btn-primary"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: '800'
            }}
            title="Open Sovereign Library Picker to display any book, plushie, or journal vault item"
          >
            <BookOpen size={13} />
            <span>📚 Launch Library Picker</span>
          </button>

          {combinedReadingList.length > 0 && (
            <>
              <button onClick={handleSelectAll} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#c4b5fd' }}>
                {selectedBookIds.length === combinedReadingList.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedBookIds.length > 0 && (
                <button onClick={handleEraseSelected} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.15)' }}>
                  <Trash2 size={13} /> Erase Selected ({selectedBookIds.length})
                </button>
              )}
              <button onClick={handleWipeAll} className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.5)' }}>
                🧹 Wipe / Erase All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info explanation card */}
      <div className="glass-card" style={{ padding: '0.6rem 0.8rem', marginBottom: '0.8rem', background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '6px', fontSize: '0.74rem', color: '#e2e8f0', lineHeight: '1.4' }}>
        <strong>💡 How Books Enter & Leave this Shelf:</strong>
        <ul style={{ margin: '0.2rem 0 0 1rem', padding: 0 }}>
          <li><strong>Added</strong>: Via Google Tasks <code>#tbr</code> list, Kindle sessions, or manual form below.</li>
          <li><strong>Disassociate (❌)</strong>: Click <code>❌ Disassociate</code> or check boxes to erase items permanently without logging a review or DNF rant.</li>
        </ul>
      </div>

      {/* Manual Add Form */}
      <form onSubmit={handleAddBook} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Book Title (e.g. Project Hail Mary)..."
          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}
        />
        <input
          type="text"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          placeholder="Author..."
          style={{ width: '130px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' }}>
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Currently Reading Books List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem' }}>
        {combinedReadingList.map(book => {
          const isActive = activeReadingBookId === book.id;
          const isSelected = selectedBookIds.includes(book.id);

          return (
            <div
              key={book.id}
              className="glass-card"
              style={{
                padding: '0.8rem',
                border: isSelected ? '1px solid #fca5a5' : isActive ? '1px solid #a78bfa' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(239, 68, 68, 0.1)' : isActive ? 'rgba(167, 139, 250, 0.15)' : 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifySpace: 'between',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelectBook(book.id)}
                    style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                      {book.title}
                    </h4>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      by {book.author}
                    </div>
                  </div>
                </div>

                {isActive && (
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(167, 139, 250, 0.3)', color: '#c4b5fd', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Flame size={12} color="#f59e0b" /> ACTIVE SPRINT
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.72rem', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={12} /> Progress: <strong>{book.progress}</strong>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleSetActiveBook(book.id)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: '0.25rem 0.4rem',
                    fontSize: '0.7rem',
                    borderColor: isActive ? '#a78bfa' : 'var(--border-color)',
                    color: isActive ? '#c4b5fd' : 'var(--text-muted)'
                  }}
                >
                  {isActive ? '🔥 Active Book' : 'Set Active'}
                </button>

                <button
                  onClick={() => handleLogBookSession(book)}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.7rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  title="Log reading sprint progress telemetry to Zettel"
                >
                  <Play size={11} /> Sprint Session
                </button>

                <button
                  onClick={() => setReviewingBook(book)}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.7rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                  title="Review book"
                >
                  <Star size={11} /> Review
                </button>

                <button
                  onClick={() => handleOpenDnfModal(book)}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.7rem', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  title="Abandon book & log DNF tirade"
                >
                  🚫 DNF
                </button>

                <button
                  onClick={() => handleRemoveSingle(book)}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.7rem', color: '#94a3b8' }}
                  title="Disassociate from shelf without review"
                >
                  ❌
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {reviewingBook && (
        <BookReviewModal
          book={reviewingBook}
          isOpen={!!reviewingBook}
          onClose={() => setReviewingBook(null)}
          onSaveReview={(reviewZettel) => {
            onSaveBookReviewZettel(reviewZettel);
            handleRemoveSingle(reviewingBook);
            setReviewingBook(null);
          }}
        />
      )}

      {/* DNF Modal */}
      {dnfBook && (
        <div className="modal-backdrop" onClick={() => setDnfBook(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fca5a5', marginBottom: '0.5rem' }}>
              🚫 DNF (Did Not Finish) Tirade: {dnfBook.title}
            </h3>
            <form onSubmit={handleConfirmDnfTirade} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Primary Abandonment Reason:
                <select value={dnfReason} onChange={(e) => setDnfReason(e.target.value)} style={{ width: '100%', marginTop: '0.2rem', padding: '0.4rem', background: '#111827', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <option>Boring / Pacing issues</option>
                  <option>Annoying Characters / MC</option>
                  <option>Bad Writing / Plot holes</option>
                  <option>Too Slow / Lost Interest</option>
                </select>
              </label>

              <textarea
                rows="3"
                value={dnfTirade}
                onChange={(e) => setDnfTirade(e.target.value)}
                placeholder="Rant about why you stopped reading..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                <button type="button" onClick={() => setDnfBook(null)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>Log DNF Tirade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sovereign Library & Media Vault Picker Modal */}
      <LibraryMediaPickerModal
        isOpen={isLibraryPickerOpen}
        onClose={() => setIsLibraryPickerOpen(false)}
        onSelectVaultItem={handleSelectVaultItem}
      />
    </div>
  );
}

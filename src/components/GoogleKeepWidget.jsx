import React, { useState } from 'react';
import { Bookmark, Plus, Pin, Trash2, ArrowRight, Check, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GoogleKeepWidget({
  onConvertToZettel
}) {
  const [keepNotes, setKeepNotes] = useState([
    {
      id: 'keep_archive_books',
      title: 'archive//books',
      content: `• The F*ck It Diet: Eating Should Be Easy (Caroline Dooner)
• Intuitive Eating, 4th Edition (Evelyn Tribole & Elyse Resch)
• The Body Keeps the Score (Bessel van der Kolk)
• The Sexual Healing Journey: A Guide for Survivors of Sexual Abuse (Wendy Maltz)
• Atomic Habits (James Clear)
• The Law of Attraction (Esther & Jerry Hicks)
• Dale Carnegie (mostly as a warning for what to look out for)`,
      isPinned: true,
      color: '#fef3c7',
      createdPT: '20260804-1033'
    },
    {
      id: 'keep_1',
      title: 'Ideas for myBlackbox Zettel protocol',
      content: 'Store everything in flat-file markdown under /Drive/Apps/myBlackbox/ for maximum developer decoupling.',
      isPinned: false,
      color: '#dbeafe',
      createdPT: '20260803-1845'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddKeepNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;

    const note = {
      id: `keep_${Date.now()}`,
      title: newTitle.trim() || 'Untitled Keep Note',
      content: newContent.trim(),
      isPinned: false,
      color: '#fef3c7',
      createdPT: '20260803-1849'
    };

    setKeepNotes([note, ...keepNotes]);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id) => {
    setKeepNotes(keepNotes.filter(n => n.id !== id));
  };

  const handleTogglePin = (id) => {
    setKeepNotes(keepNotes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const handleConvert = (note) => {
    onConvertToZettel({
      title: `Keep Note: ${note.title}`,
      type: 'microlog',
      content: note.content,
      tags: ['#keep', '#note', '#telemetry']
    });
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const filteredNotes = keepNotes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bookmark size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Google Keep Live Note Widget
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Daily driver scratchpad with 1-tap Zettel conversion
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          {keepNotes.length} Notes
        </span>
      </div>

      {/* Explanation Banner */}
      <div className="glass-card" style={{ padding: '0.75rem', marginBottom: '0.9rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fcd34d', marginBottom: '0.3rem' }}>
          💡 How "Save to Keep" Works:
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
          1. <strong>1-Click Clipboard Sync:</strong> Clicking <em>"Save to Keep"</em> copies the formatted note text to your clipboard and launches <code>keep.google.com</code>. Click <em>"+ Take a note..."</em> and press <code>Ctrl+V</code> to paste!
          <br />
          2. <strong>JSON Schema:</strong> The <code>.json</code> download is Google Keep's Takeout/API schema used by automated import scripts.
        </p>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAddKeepNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Note title..."
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
        />
        <textarea
          rows={2}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Take a note..."
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', alignSelf: 'flex-end' }}>
          <Plus size={14} /> Add Keep Note
        </button>
      </form>

      {/* Keep Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
        {filteredNotes.map(n => (
          <div key={n.id} className="glass-card" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.6rem 0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {n.isPinned && <Pin size={12} color="#f59e0b" fill="#f59e0b" />}
                {n.title}
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button onClick={() => handleTogglePin(n.id)} style={{ background: 'none', border: 'none', color: n.isPinned ? '#f59e0b' : 'var(--text-muted)', cursor: 'pointer' }}>
                  <Pin size={12} />
                </button>
                <button onClick={() => handleConvert(n)} className="btn-secondary" style={{ padding: '0.15rem 0.4rem', fontSize: '0.68rem', color: '#34d399' }} title="Convert Keep Note to Zettel Microlog">
                  + Zettel
                </button>
                <button onClick={() => handleDelete(n.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
              {n.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

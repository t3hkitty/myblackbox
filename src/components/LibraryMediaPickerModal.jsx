import React, { useState } from 'react';
import { BookOpen, Search, X, Check, Filter, Sparkles, Plus, ExternalLink, HardDrive } from 'lucide-react';

const DEFAULT_VAULT_ITEMS = [
  { id: 'book-crafting-chess', title: 'The Crafting of Chess', author: 'Mark Sehestedt', category: 'LitRPG & Fantasy', format: 'EPUB', icon: '📖', mediaType: 'book', progress: 'Chapter 14 (p. 210)' },
  { id: 'book-svsss', title: 'The Scum Villain\'s Self-Saving System (SVSSS)', author: 'Mo Xiang Tong Xiu', category: 'Danmei & Cultivation', format: 'EPUB', icon: '📖', mediaType: 'book', progress: 'Volume 1 (Chapter 8)' },
  { id: 'book-dungeon-crawler-carl', title: 'Dungeon Crawler Carl', author: 'Matt Dinniman', category: 'LitRPG', format: 'PDF', icon: '📖', mediaType: 'book', progress: 'Chapter 22' },
  { id: 'journal-today', title: '📓 BlackBox Daily Journal • Today', author: 'MyBlackBox Captain\'s Log', category: 'Journal Vault', format: 'MD', icon: '📓', mediaType: 'journal', progress: 'Active Pulse Stream' },
  { id: 'book-loki-pop', title: 'Loki God of Stories Special Edition Statue', author: 'Marvel Relics Vault', category: 'Plushie & Collectibles', format: 'PHYSICAL', icon: '🧸', mediaType: 'plushie', progress: 'Mint in Box (Shelf 1)' },
  { id: 'book-charizard', title: '1999 Base Set 1st Edition Charizard PSA 10', author: 'Pokémon TCG Vault', category: 'TCG Grails', format: 'SLAB', icon: '🃏', mediaType: 'tcg', progress: 'Vault Slab #09812' },
  { id: 'book-black-lotus', title: 'Alpha Black Lotus BGS 9.5 Subgrades', author: 'Magic: The Gathering', category: 'TCG Grails', format: 'SLAB', icon: '🃏', mediaType: 'tcg', progress: 'Vault Slab #00001' },
  { id: 'b_design', title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design & UX', format: 'EPUB', icon: '📖', mediaType: 'book', progress: 'Page 88' }
];

export default function LibraryMediaPickerModal({
  isOpen,
  onClose,
  onSelectVaultItem
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all'); // 'all' | 'book' | 'journal' | 'plushie' | 'tcg'

  if (!isOpen) return null;

  const filteredItems = DEFAULT_VAULT_ITEMS.filter(item => {
    if (activeType !== 'all' && item.mediaType !== activeType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthor = item.author.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchCat) return false;
    }
    return true;
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        background: '#0f172a',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📚 Sovereign Library & Vault Picker</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', fontFamily: 'var(--font-mono)' }}>
                  {filteredItems.length} VAULT ITEMS
                </span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Browse &amp; pick items from your Grand Library, Journal Vault, Plushie Vault, and TCG Grails to display in myBlackbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(2, 6, 23, 0.4)' }}>
          
          <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', flex: 1 }}>
            <button
              onClick={() => setActiveType('all')}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: activeType === 'all' ? '#6366f1' : 'transparent', color: activeType === 'all' ? '#fff' : 'var(--text-muted)' }}
            >
              🌟 All Items
            </button>
            <button
              onClick={() => setActiveType('book')}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: activeType === 'book' ? '#6366f1' : 'transparent', color: activeType === 'book' ? '#fff' : 'var(--text-muted)' }}
            >
              📖 Books
            </button>
            <button
              onClick={() => setActiveType('journal')}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: activeType === 'journal' ? '#10b981' : 'transparent', color: activeType === 'journal' ? '#fff' : 'var(--text-muted)' }}
            >
              📓 Journal Vault
            </button>
            <button
              onClick={() => setActiveType('plushie')}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: activeType === 'plushie' ? '#ec4899' : 'transparent', color: activeType === 'plushie' ? '#fff' : 'var(--text-muted)' }}
            >
              🧸 Plushie Vault
            </button>
            <button
              onClick={() => setActiveType('tcg')}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: activeType === 'tcg' ? '#f59e0b' : 'transparent', color: activeType === 'tcg' ? '#fff' : 'var(--text-muted)' }}
            >
              🃏 TCG Cards
            </button>
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem 0.4rem 2rem',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.75rem'
              }}
            />
          </div>
        </div>

        {/* Item List Grid */}
        <div style={{ padding: '1.2rem 1.5rem', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.8rem' }}>
          {filteredItems.map(item => (
            <div key={item.id} className="glass-card" style={{
              padding: '0.8rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              gap: '0.6rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                    {item.format}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff', margin: '0 0 0.2rem 0', lineHeight: 1.2 }}>
                  {item.title}
                </h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {item.author}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#818cf8', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                  {item.category} &bull; {item.progress}
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectVaultItem(item);
                  onClose();
                }}
                className="btn-primary"
                style={{
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                }}
              >
                <Plus size={14} />
                <span>Display in Blackbox</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.8rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(2, 6, 23, 0.95)'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Connected to Sovereign Grand Library &bull; Local Bi-Directional Linking
          </span>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

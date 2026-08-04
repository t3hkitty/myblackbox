import React, { useState } from 'react';
import { Tag, Hash, Sparkles, Filter, BarChart3, Layers } from 'lucide-react';

export default function TagTallyWidget({
  allLogs = [],
  onSelectTagFilter
}) {
  const [selectedTag, setSelectedTag] = useState(null);

  // Compute tag tally counts
  const tagTallyMap = {};
  allLogs.forEach(log => {
    if (log.tags && Array.isArray(log.tags)) {
      log.tags.forEach(tag => {
        const cleanTag = tag.trim();
        if (cleanTag) {
          tagTallyMap[cleanTag] = (tagTallyMap[cleanTag] || 0) + 1;
        }
      });
    }
  });

  const sortedTags = Object.entries(tagTallyMap).sort((a, b) => b[1] - a[1]);
  const totalTagsLogged = Object.values(tagTallyMap).reduce((a, b) => a + b, 0);

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
      if (onSelectTagFilter) onSelectTagFilter(null);
    } else {
      setSelectedTag(tag);
      if (onSelectTagFilter) onSelectTagFilter(tag);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(167, 139, 250, 0.15)',
            color: '#a78bfa',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Tag size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Telemetry Tag Tally & Frequency Matrix
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live tally of all Zettel tags — click any tag to filter timeline
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
          {sortedTags.length} Unique Tags ({totalTagsLogged} total)
        </span>
      </div>

      {/* Active Filter Indicator */}
      {selectedTag && (
        <div style={{ background: 'rgba(167, 139, 250, 0.12)', border: '1px solid rgba(167, 139, 250, 0.4)', borderRadius: '6px', padding: '0.4rem 0.7rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: '#c4b5fd', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={13} /> Filtering timeline by: <strong style={{ color: '#fff' }}>{selectedTag}</strong>
          </span>
          <button
            onClick={() => handleTagClick(selectedTag)}
            style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Tag Tally Pills */}
      {sortedTags.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {sortedTags.map(([tag, count]) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                style={{
                  background: isSelected ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected ? '1px solid #a78bfa' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Hash size={12} color={isSelected ? '#a78bfa' : 'var(--text-dim)'} />
                <span>{tag.replace('#', '')}</span>
                <span style={{
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fcd34d',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          No tags logged yet. Add micrologs with #tags to see your tag tally matrix!
        </p>
      )}
    </div>
  );
}

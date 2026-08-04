import React, { useState } from 'react';
import { Search, Tag, Download, Trash2, Eye, Filter, CheckSquare, Square, AlertOctagon, Edit3, ArrowUp, ArrowDown, Bomb } from 'lucide-react';
import { downloadMarkdownFile } from '../services/zettelEngine';
import LogDetailModal from './LogDetailModal';

export default function LogTimeline({
  logs,
  onDeleteLog,
  onMassDeleteLogs,
  onBulkUpdateLogs,
  onDeleteAllSampleLogs,
  externalTagFilter = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [activeDetailLog, setActiveDetailLog] = useState(null);
  const [selectedLogIds, setSelectedLogIds] = useState([]);

  const activeFilterTag = externalTagFilter || selectedTagFilter;

  // Extract unique tags across logs
  const allTagsSet = new Set(['ALL']);
  logs.forEach(l => {
    if (l.tags) l.tags.forEach(t => allTagsSet.add(t));
  });
  const uniqueTags = Array.from(allTagsSet);

  // Filter logs
  const filteredLogs = logs.filter(l => {
    const matchesSearch = (l.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.zettelId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = activeFilterTag === 'ALL' || (l.tags && l.tags.includes(activeFilterTag));

    return matchesSearch && matchesTag;
  });

  const isAllSelected = filteredLogs.length > 0 && filteredLogs.every(l => selectedLogIds.includes(l.id));

  const handleToggleSelect = (id) => {
    if (selectedLogIds.includes(id)) {
      setSelectedLogIds(selectedLogIds.filter(i => i !== id));
    } else {
      setSelectedLogIds([...selectedLogIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(filteredLogs.map(l => l.id));
    }
  };

  const handleMassDelete = () => {
    if (selectedLogIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedLogIds.length} selected Zettel log(s)?`)) {
      onMassDeleteLogs(selectedLogIds);
      setSelectedLogIds([]);
    }
  };

  const handleMassAddTag = () => {
    if (selectedLogIds.length === 0) return;
    const tag = window.prompt(`Enter tag to add to ${selectedLogIds.length} selected entries (e.g. #project1):`);
    if (tag && tag.trim()) {
      onBulkUpdateLogs(selectedLogIds, { addTag: tag.trim() });
      setSelectedLogIds([]);
    }
  };

  const handleMassPrepend = () => {
    if (selectedLogIds.length === 0) return;
    const text = window.prompt(`Enter text to PREPEND to top of ${selectedLogIds.length} selected entries:`);
    if (text && text.trim()) {
      onBulkUpdateLogs(selectedLogIds, { prependText: text.trim() });
      setSelectedLogIds([]);
    }
  };

  const handleMassAppend = () => {
    if (selectedLogIds.length === 0) return;
    const text = window.prompt(`Enter text to APPEND to bottom of ${selectedLogIds.length} selected entries:`);
    if (text && text.trim()) {
      onBulkUpdateLogs(selectedLogIds, { appendText: text.trim() });
      setSelectedLogIds([]);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>
            Zettelkasten Telemetry Journal ({filteredLogs.length} Entries)
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Chronological Pacific Time Serialization Logs (`YYYYMMDD-HHMM`)
          </p>
        </div>

        {/* Search & Tag Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Zettel logs..."
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.4rem 0.6rem 0.4rem 2rem',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                width: '180px'
              }}
            />
          </div>

          <select
            value={selectedTagFilter}
            onChange={(e) => setSelectedTagFilter(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            {uniqueTags.map(t => (
              <option key={t} value={t} style={{ background: '#111827' }}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-Select Bulk Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.8rem', borderRadius: '8px', marginBottom: '0.8rem', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          onClick={handleToggleSelectAll}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {isAllSelected ? <CheckSquare size={16} color="#3b82f6" /> : <Square size={16} />}
          <span>{isAllSelected ? 'Deselect All' : 'Select All Filtered'}</span>
        </button>

        {selectedLogIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Selected: <strong style={{ color: '#fff' }}>{selectedLogIds.length}</strong>
            </span>

            {/* Bomb Button to Nuke Sample Data */}
            {onDeleteAllSampleLogs && (
              <button
                onClick={() => {
                  if (window.confirm('💣 Delete all pre-populated sample/test data entries?')) {
                    onDeleteAllSampleLogs();
                  }
                }}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.12)' }}
                title="Delete all pre-populated sample entries"
              >
                <Bomb size={13} color="#fca5a5" /> 💣 Nuke Sample Entries
              </button>
            )}

            {/* Mass Add Tag */}
            <button
              onClick={handleMassAddTag}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}
              title="Add a tag to all selected entries"
            >
              <Tag size={13} /> Mass Tag
            </button>

            {/* Mass Prepend */}
            <button
              onClick={handleMassPrepend}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(167, 139, 250, 0.4)', color: '#c4b5fd' }}
              title="Prepend text to top of selected entries"
            >
              <ArrowUp size={13} /> Prepend
            </button>

            {/* Mass Append */}
            <button
              onClick={handleMassAppend}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
              title="Append text to bottom of selected entries"
            >
              <ArrowDown size={13} /> Append
            </button>

            {/* Mass Delete */}
            <button
              onClick={handleMassDelete}
              className="btn-primary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              <Trash2 size={13} /> Delete ({selectedLogIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Logs Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => {
            const isSelected = selectedLogIds.includes(log.id);
            return (
              <div key={log.id} className="glass-card" style={{ border: isSelected ? '1px solid #ef4444' : '1px solid var(--border-color)', background: isSelected ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.03)', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleSelect(log.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {isSelected ? <CheckSquare size={16} color="#ef4444" /> : <Square size={16} color="var(--text-muted)" />}
                    </button>

                    <span className="zettel-badge">{log.zettelId} PT</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                      {log.title}
                    </span>
                    {log.mood && (
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '12px', color: '#fff' }}>
                        {log.mood.emoji} {log.mood.label}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setActiveDetailLog(log)}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      title="View Zettel Detail & Markdown"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => downloadMarkdownFile(log)}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      title="Download Markdown (.md)"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => onDeleteLog(log.id)}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#f87171' }}
                      title="Delete Entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {log.content && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                    {log.content}
                  </p>
                )}

                {/* Tags list */}
                {log.tags && log.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {log.tags.map(tag => (
                      <span key={tag} className="tag-pill" onClick={() => setSelectedTagFilter(tag)} style={{ cursor: 'pointer' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No telemetry entries matching filter. Use the Quick Trigger Bar to append new Zettel logs!
          </div>
        )}
      </div>

      <LogDetailModal
        isOpen={Boolean(activeDetailLog)}
        onClose={() => setActiveDetailLog(null)}
        log={activeDetailLog}
      />
    </div>
  );
}

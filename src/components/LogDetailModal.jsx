import React from 'react';
import { X, Download, Tag, Clock, FileText, Cloud, Bookmark, Archive, Inbox } from 'lucide-react';
import { exportToMarkdown, downloadMarkdownFile, exportToGoogleKeep, exportToGoogleDrive } from '../services/zettelEngine';

export default function LogDetailModal({ log, isOpen, onClose, onToggleArchiveLog }) {
  if (!isOpen || !log) return null;

  const markdownText = exportToMarkdown(log);
  const isArchived = log.tags && log.tags.includes('#archive');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="zettel-badge" style={{ fontSize: '0.85rem' }}>{log.zettelId} PT</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>
              {log.title}
            </h2>
            {isArchived && (
              <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.18)', color: '#fca5a5', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                📦 Archived
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Action Buttons: Markdown, Keep, Drive, Archive */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => downloadMarkdownFile(log)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Download size={14} /> Download .md
          </button>

          {onToggleArchiveLog && (
            <button
              className="btn-secondary"
              onClick={() => {
                onToggleArchiveLog(log.id);
                onClose();
              }}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: isArchived ? '#34d399' : 'rgba(239, 68, 68, 0.4)', color: isArchived ? '#34d399' : '#fca5a5' }}
              title={isArchived ? 'Un-archive Zettel log' : 'Archive Zettel log with #archive tag'}
            >
              {isArchived ? <Inbox size={14} /> : <Archive size={14} />}
              <span>{isArchived ? 'Un-archive Log' : 'Archive Log (#archive)'}</span>
            </button>
          )}

          <button
            className="btn-secondary"
            onClick={() => exportToGoogleKeep(log)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}
            title="Export to Google Keep Note JSON"
          >
            <Bookmark size={14} /> Save to Keep
          </button>

          <button
            className="btn-secondary"
            onClick={() => exportToGoogleDrive(log)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#93c5fd' }}
            title="Save / Sync Zettel to Google Drive"
          >
            <Cloud size={14} /> Save to Drive
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigator.clipboard.writeText(markdownText)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <FileText size={14} /> Copy Markdown
          </button>
        </div>

        {/* Markdown Source Preview */}
        <div style={{ background: '#0a0d14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', overflowX: 'auto' }}>
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#e5e7eb', whitespace: 'pre-wrap', lineHeight: '1.5' }}>
            {markdownText}
          </pre>
        </div>

      </div>
    </div>
  );
}

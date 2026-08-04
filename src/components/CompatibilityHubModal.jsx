import React from 'react';
import { X, Download, ExternalLink, ShieldCheck, AlertCircle, FileSpreadsheet, FileCode, Package } from 'lucide-react';
import { COMPATIBLE_TOOLS, exportNotionCSV, exportRoamJSON } from '../services/toolExportEngine';
import { downloadAllMarkdownZIP } from '../services/zettelEngine';

export default function CompatibilityHubModal({
  isOpen,
  onClose,
  allLogs
}) {
  if (!isOpen) return null;

  const handleToolExport = (toolId) => {
    switch (toolId) {
      case 'obsidian':
      case 'joplin':
      case 'logseq':
      case 'readwise':
        downloadAllMarkdownZIP(allLogs);
        break;
      case 'notion':
      case 'daylio':
        exportNotionCSV(allLogs);
        break;
      case 'roam':
        exportRoamJSON(allLogs);
        break;
      case 'google_keep':
        downloadAllMarkdownZIP(allLogs);
        break;
      default:
        downloadAllMarkdownZIP(allLogs);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🌐 Tool Interoperability & Export Matrix
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              All-in-One download hub for Obsidian, Joplin, Notion, Logseq, Roam & more
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Disclaimer Banner for Untested / Schema Compatibility */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '10px',
          padding: '0.8rem',
          marginBottom: '1.2rem',
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.78rem', color: '#fef3c7', lineHeight: '1.4' }}>
            <strong>Untested Schema Compatibility Disclaimer</strong>: These export formats follow standard Markdown, YAML frontmatter, CSV, and JSON specifications designed for maximum interoperability. External app imports are provided on a best-effort, decoupled schema basis and have not been manually verified against third-party proprietary app builds.
          </div>
        </div>

        {/* Top Tools Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '0.8rem' }}>
          {COMPATIBLE_TOOLS.map(tool => (
            <div key={tool.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{tool.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                        {tool.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {tool.statusBadge}
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  {tool.description}
                </p>

                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.08)', padding: '0.3rem 0.5rem', borderRadius: '4px', marginBottom: '0.8rem' }}>
                  File Format: {tool.fileType}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {tool.formatNote}
                </span>

                <button
                  className="btn-primary"
                  onClick={() => handleToolExport(tool.id)}
                  style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                >
                  <Download size={13} /> Export for {tool.name.split('.')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

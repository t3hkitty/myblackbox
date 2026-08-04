import React, { useState } from 'react';
import { Share2, RefreshCw, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { INTEGRATION_SOURCES, fetchMockConnectionData } from '../services/mockIntegrations';
import confetti from 'canvas-confetti';

export default function DataImportHub({
  onImportLogs
}) {
  const [selectedSource, setSelectedSource] = useState(INTEGRATION_SOURCES[0].id);
  const [importedItems, setImportedItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = (sourceId) => {
    setIsSyncing(true);
    setTimeout(() => {
      const items = fetchMockConnectionData(sourceId);
      setImportedItems(items);
      setIsSyncing(false);
    }, 400);
  };

  const handleImportSingle = (item) => {
    onImportLogs({
      title: item.title,
      type: 'microlog',
      content: item.detail || item.title,
      tags: item.tags || ['#telemetry', '#import'],
      metadata: { source: item.source }
    });
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Share2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Connected Telemetry Import Hub
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Google Timeline, Google Fit, Photos, Messages, Keep & Gemini
            </p>
          </div>
        </div>

        <button
          className="btn-secondary"
          onClick={() => handleSync(selectedSource)}
          disabled={isSyncing}
          style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
          <span>Sync Connector</span>
        </button>
      </div>

      {/* Sources Grid Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem', marginBottom: '1rem' }}>
        {INTEGRATION_SOURCES.map(src => {
          const isSelected = selectedSource === src.id;
          return (
            <button
              key={src.id}
              onClick={() => { setSelectedSource(src.id); handleSync(src.id); }}
              style={{
                background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? '1px solid #10b981' : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.5rem',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>{src.icon}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{src.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Sync Items Preview List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {importedItems.length > 0 ? (
          importedItems.map(item => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.detail || item.source}
                </div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => handleImportSingle(item)}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#34d399' }}
              >
                + Import to Zettel
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '0.8rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Select a connection channel above and click "Sync Connector" to pull telemetry.
          </div>
        )}
      </div>
    </div>
  );
}

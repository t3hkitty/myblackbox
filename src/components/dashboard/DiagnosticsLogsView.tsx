import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Key,
  Shield,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  getSyncDiagnostics,
  clearSyncDiagnostics,
  getStoredAccessToken,
  getGoogleAuthSession
} from '../../services/googleDriveAuthEngine';

export const DiagnosticsLogsView: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any[]>(getSyncDiagnostics());
  const [token, setToken] = useState<string | null>(getStoredAccessToken());
  const [session, setSession] = useState<any>(getGoogleAuthSession());
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const refreshLogs = () => {
    setDiagnostics(getSyncDiagnostics());
    setToken(getStoredAccessToken());
    setSession(getGoogleAuthSession());
  };

  const handleClear = () => {
    if (window.confirm('Clear all diagnostic logs?')) {
      clearSyncDiagnostics();
      setDiagnostics([]);
    }
  };

  const copyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const copyRawSession = () => {
    const raw = JSON.stringify({ session, tokenPreview: token ? `${token.substring(0, 15)}...` : null, diagnosticsCount: diagnostics.length }, null, 2);
    navigator.clipboard.writeText(raw);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header & Controls */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.6rem',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={18} color="#60a5fa" />
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Diagnostics &amp; Token Telemetry Workspace
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
              Raw JSON payloads, token debug output, and verbose activity logs isolated from workspace
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={refreshLogs}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#60a5fa' }}
          >
            <RefreshCw size={12} style={{ marginRight: '3px', display: 'inline' }} /> Refresh
          </button>
          <button
            onClick={copyRawSession}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#93c5fd' }}
          >
            {copiedJson ? <Check size={12} /> : <Copy size={12} />}
            <span style={{ marginLeft: '3px' }}>Copy JSON</span>
          </button>
          <button
            onClick={handleClear}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#f87171' }}
          >
            <Trash2 size={12} style={{ marginRight: '3px', display: 'inline' }} /> Clear Logs
          </button>
        </div>
      </div>

      {/* 2. Token & Session Debug Box */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          background: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Key size={14} /> Active OAuth Token Debug Inspector
          </div>
          {token && (
            <button
              onClick={copyToken}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              {copiedToken ? <Check size={11} /> : <Copy size={11} />} Copy Token
            </button>
          )}
        </div>

        <pre
          style={{
            margin: 0,
            padding: '0.6rem',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            color: '#cbd5e1',
            overflowX: 'auto',
            maxHeight: '130px'
          }}
        >
          {JSON.stringify(
            {
              sessionStatus: session?.status || 'NOT_CONNECTED',
              userEmail: session?.userEmail || null,
              hasRealToken: !!token,
              tokenPrefix: token ? `${token.substring(0, 16)}...` : null,
              activePresets: session?.activePresets || []
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* 3. Verbose Diagnostic Entries List */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          background: '#090d16',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#93c5fd' }}>
            Activity &amp; API Error Log ({diagnostics.length} entries)
          </span>
        </div>

        {diagnostics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            No diagnostic entries recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '420px', overflowY: 'auto' }}>
            {diagnostics.map((diag) => {
              const typeColor =
                diag.type === 'ERROR'
                  ? '#f87171'
                  : diag.type === 'WARNING'
                  ? '#fcd34d'
                  : diag.type === 'SUCCESS'
                  ? '#34d399'
                  : '#60a5fa';

              return (
                <div
                  key={diag.id}
                  style={{
                    padding: '0.45rem 0.6rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderLeft: `3px solid ${typeColor}`,
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: typeColor, fontFamily: 'monospace' }}>
                      [{diag.type}] {diag.action}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
                      {diag.timestampPT || diag.timestampIso}
                    </span>
                  </div>
                  <div style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>
                    {diag.message}
                  </div>
                  {diag.data && (
                    <pre
                      style={{
                        margin: '2px 0 0 0',
                        padding: '4px',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        color: '#94a3b8',
                        overflowX: 'auto'
                      }}
                    >
                      {JSON.stringify(diag.data, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

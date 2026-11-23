import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Globe,
  Activity,
  Heart,
  MapPin,
  Users,
  CheckSquare
} from 'lucide-react';
import {
  PROJECT_ID,
  DEFAULT_CLIENT_ID,
  SCOPE_PRESETS,
  getGoogleCredentials,
  saveGoogleCredentials,
  getGoogleAuthSession,
  getStoredAccessToken,
  saveAccessToken,
  connectGoogleAccount,
  reauthenticateGoogleAccount,
  openOAuthPlaygroundHelper,
  extractOAuthTokenFromUrl,
  getActiveScopePresets,
  saveActiveScopePresets
} from '../../services/googleDriveAuthEngine';

export const GoogleAuthAIOCard: React.FC = () => {
  const [activeScopeTab, setActiveScopeTab] = useState<'gtasks' | 'contacts' | 'timeline' | 'fitness'>('gtasks');
  const [authSession, setAuthSession] = useState(getGoogleAuthSession());
  const [accessToken, setAccessTokenState] = useState(getStoredAccessToken());
  const [creds, setCreds] = useState(getGoogleCredentials());
  const [activePresets, setActivePresets] = useState<string[]>(getActiveScopePresets());
  const [copiedPort, setCopiedPort] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');

  const isConnected = !!(authSession && (authSession.hasRealToken || accessToken));

  const handleToggleScope = (presetKey: string) => {
    let next: string[];
    if (activePresets.includes(presetKey)) {
      next = activePresets.filter((p) => p !== presetKey);
    } else {
      next = [...activePresets, presetKey];
    }
    setActivePresets(next);
    saveActiveScopePresets(next);
  };

  const handleApplyToken = (val: string) => {
    if (!val.trim()) return;
    const token = extractOAuthTokenFromUrl(val);
    if (token) {
      setAccessTokenState(token);
      setAuthSession(getGoogleAuthSession());
      setManualTokenInput('');
      alert('🟢 Successfully connected Google OAuth token bundle!');
    } else {
      alert('⚠️ Could not extract token from input. Please paste a valid ya29... token or JSON bundle.');
    }
  };

  const copyLoopbackCmd = () => {
    navigator.clipboard.writeText('python scripts/google_oauth_loopback.py');
    setCopiedPort(true);
    setTimeout(() => setCopiedPort(false), 2000);
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.2rem',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* 1. Shared Credential & Token Status Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.8rem',
          paddingBottom: '0.9rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isConnected ? '#34d399' : '#60a5fa'
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Google Cloud Desktop Auth (AIO)
              </h3>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#93c5fd',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                {PROJECT_ID}
              </span>
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              Desktop App Loopback: <code style={{ color: '#38bdf8' }}>http://127.0.0.1:&lt;port&gt;</code>
            </div>
          </div>
        </div>

        {/* Global Connection Badge & Re-auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isConnected ? '#34d399' : '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            {isConnected ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {isConnected ? 'AUTHENTICATED' : 'DISCONNECTED'}
          </span>

          <button
            onClick={() => {
              reauthenticateGoogleAccount(activePresets);
              setTimeout(() => {
                setAuthSession(getGoogleAuthSession());
                setAccessTokenState(getStoredAccessToken());
              }, 1000);
            }}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#60a5fa' }}
            title="Launch OAuth popup to authenticate"
          >
            <Key size={12} style={{ marginRight: '3px', display: 'inline' }} /> Connect / Reauth
          </button>
        </div>
      </div>

      {/* 2. Sub-Tabs: Google Tasks (Primary), Contacts, Timeline, Fitness */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          margin: '0.8rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '0.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveScopeTab('gtasks')}
          style={{
            padding: '0.35rem 0.7rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeScopeTab === 'gtasks' ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
            color: activeScopeTab === 'gtasks' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <CheckSquare size={13} /> Google Tasks (gtasks)
          <span
            style={{
              fontSize: '0.62rem',
              background: 'rgba(16, 185, 129, 0.3)',
              color: '#a7f3d0',
              padding: '1px 5px',
              borderRadius: '4px'
            }}
          >
            PRIMARY
          </span>
        </button>

        <button
          onClick={() => setActiveScopeTab('contacts')}
          style={{
            padding: '0.35rem 0.7rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeScopeTab === 'contacts' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
            color: activeScopeTab === 'contacts' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Users size={13} /> Contacts
          <span
            style={{
              fontSize: '0.62rem',
              background: activePresets.includes('contacts') ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: activePresets.includes('contacts') ? '#34d399' : 'var(--text-dim)',
              padding: '1px 5px',
              borderRadius: '4px'
            }}
          >
            {activePresets.includes('contacts') ? 'ENABLED' : 'OPT-IN'}
          </span>
        </button>

        <button
          onClick={() => setActiveScopeTab('timeline')}
          style={{
            padding: '0.35rem 0.7rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeScopeTab === 'timeline' ? '#0ea5e9' : 'rgba(255, 255, 255, 0.05)',
            color: activeScopeTab === 'timeline' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <MapPin size={13} /> Timeline
          <span
            style={{
              fontSize: '0.62rem',
              background: activePresets.includes('timeline') ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: activePresets.includes('timeline') ? '#34d399' : 'var(--text-dim)',
              padding: '1px 5px',
              borderRadius: '4px'
            }}
          >
            {activePresets.includes('timeline') ? 'ENABLED' : 'OPT-IN'}
          </span>
        </button>

        <button
          onClick={() => setActiveScopeTab('fitness')}
          style={{
            padding: '0.35rem 0.7rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeScopeTab === 'fitness' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
            color: activeScopeTab === 'fitness' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Heart size={13} /> Fitness
          <span
            style={{
              fontSize: '0.62rem',
              background: activePresets.includes('fitness') ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: activePresets.includes('fitness') ? '#34d399' : 'var(--text-dim)',
              padding: '1px 5px',
              borderRadius: '4px'
            }}
          >
            {activePresets.includes('fitness') ? 'ENABLED' : 'OPT-IN'}
          </span>
        </button>
      </div>

      {/* 3. Tab Body Content */}
      <div style={{ fontSize: '0.78rem', color: '#e2e8f0', minHeight: '120px' }}>
        {activeScopeTab === 'gtasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontWeight: 700, color: '#93c5fd', marginBottom: '0.2rem' }}>
                📋 Google Tasks Two-Way Sync Engine (gtasks)
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Primary integration channel: synchronizes tasks between MBB Frontmatter AST (<code style={{ color: '#fcd34d' }}>types.ts</code> / <code style={{ color: '#fcd34d' }}>frontmatter.ts</code>) and Google Tasks lists (<code style={{ color: '#38bdf8' }}>blackbox</code>, <code style={{ color: '#38bdf8' }}>roundtoit</code>, <code style={{ color: '#38bdf8' }}>tbr</code>).
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-dim)' }}>
              <span>Scope: <code>https://www.googleapis.com/auth/tasks</code></span>
              <span style={{ color: '#34d399' }}>✓ Core Scope (Always Active)</span>
            </div>
          </div>
        )}

        {activeScopeTab === 'contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div style={{ fontWeight: 700, color: '#c4b5fd', marginBottom: '0.2rem' }}>
                👥 Google Contacts (Read-Only Context)
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Optional contact lookup for interaction tagging, relationship telemetry, and fast mention auto-complete. If disabled, degrades cleanly without breaking task management.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                Scope: <code>https://www.googleapis.com/auth/contacts.readonly</code>
              </span>
              <button
                onClick={() => handleToggleScope('contacts')}
                className="btn-secondary"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  color: activePresets.includes('contacts') ? '#f87171' : '#34d399'
                }}
              >
                {activePresets.includes('contacts') ? 'Disable Contacts Scope' : 'Enable Contacts Scope'}
              </button>
            </div>
          </div>
        )}

        {activeScopeTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.08)', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
              <div style={{ fontWeight: 700, color: '#7dd3fc', marginBottom: '0.2rem' }}>
                📍 Timeline &amp; Geofence Context
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Optional location and geofence zone telemetry for automated routine triggering. If disabled, Tasker location triggers still function locally without cloud scope dependency.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                Scope: <code>https://www.googleapis.com/auth/fitness.location.read</code>
              </span>
              <button
                onClick={() => handleToggleScope('timeline')}
                className="btn-secondary"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  color: activePresets.includes('timeline') ? '#f87171' : '#34d399'
                }}
              >
                {activePresets.includes('timeline') ? 'Disable Timeline Scope' : 'Enable Timeline Scope'}
              </button>
            </div>
          </div>
        )}

        {activeScopeTab === 'fitness' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontWeight: 700, color: '#6ee7b7', marginBottom: '0.2rem' }}>
                🏃 Google Fit &amp; Somatic Telemetry
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Optional step count, activity duration, and energy expenditure telemetry. Gracefully degrades to zero telemetry impact when unselected.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                Scope: <code>https://www.googleapis.com/auth/fitness.activity.read</code>
              </span>
              <button
                onClick={() => handleToggleScope('fitness')}
                className="btn-secondary"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  color: activePresets.includes('fitness') ? '#f87171' : '#34d399'
                }}
              >
                {activePresets.includes('fitness') ? 'Disable Fitness Scope' : 'Enable Fitness Scope'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Desktop Loopback & Token Ingestion Footer */}
      <div
        style={{
          marginTop: '0.9rem',
          paddingTop: '0.8rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Paste ya29... token or JSON bundle (~/.config/anymd/google_oauth_token.json)"
            value={manualTokenInput}
            onChange={(e) => setManualTokenInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApplyToken(manualTokenInput);
            }}
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#fff',
              fontSize: '0.73rem',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={() => handleApplyToken(manualTokenInput)}
            className="btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.73rem' }}
          >
            Apply Token
          </button>
          <button
            onClick={() => openOAuthPlaygroundHelper(activePresets)}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.73rem', color: '#60a5fa' }}
            title="Open Google OAuth Playground with active scopes"
          >
            <ExternalLink size={12} style={{ marginRight: '3px', display: 'inline' }} /> Playground
          </button>
          <button
            onClick={copyLoopbackCmd}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.73rem', color: '#fcd34d' }}
            title="Copy Python loopback listener command"
          >
            {copiedPort ? <Check size={12} /> : <Copy size={12} />}
            <span style={{ marginLeft: '3px' }}>CLI Loopback</span>
          </button>
        </div>
      </div>
    </div>
  );
};

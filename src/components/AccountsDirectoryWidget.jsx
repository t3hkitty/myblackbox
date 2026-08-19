import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Key, Sparkles, CheckCircle2, XCircle, Cloud, CreditCard, RefreshCw, Mail, Phone, ExternalLink } from 'lucide-react';
import { getGoogleAuthSession, disconnectGoogleAccount, triggerGoogleAuthPopup, extractOAuthTokenFromUrl, openOAuthPlaygroundHelper } from '../services/googleDriveAuthEngine';

import { getStoredGeminiKey, saveGeminiKey } from '../services/geminiService';
import { getContacts } from '../services/contactEngine';

export default function AccountsDirectoryWidget({
  onOpenSettings,
  onOpenGeminiSettings,
  onSaveZettel
}) {
  const [gSession, setGSession] = useState(null);
  const [geminiKey, setGeminiKey] = useState(getStoredGeminiKey() || '');
  const [contactsList, setContactsList] = useState([]);
  const [activeTab, setActiveTab] = useState('connected_services'); // 'connected_services' | 'user_contacts' | 'financial_subs'

  useEffect(() => {
    setGSession(getGoogleAuthSession());
    setContactsList(getContacts());
  }, []);

  const handleGoogleConnect = () => {
    if (gSession) {
      if (window.confirm('Disconnect current Google OAuth Account?')) {
        disconnectGoogleAccount();
        setGSession(null);
      }
    } else {
      const sess = triggerGoogleAuthPopup();
      if (sess) setGSession(sess);
    }
  };

  const handleSaveGemini = (e) => {
    e.preventDefault();
    saveGeminiKey(geminiKey);
    alert('🔑 Gemini AI API Key saved locally!');
  };

  const MOCK_FINANCIAL_SUBS = [
    { name: 'Google Workspace / Drive', cost: '$12/mo', status: 'Active', category: 'Cloud Storage & Auth' },
    { name: 'Spotify Premium', cost: '$10.99/mo', status: 'Active', category: 'Music & Audio Telemetry' },
    { name: 'IFTTT Pro+', cost: '$5/mo', status: 'Active', category: 'Webhook Integrations' },
    { name: 'Gemini AI API (Pay-as-you-go)', cost: 'Usage-based', status: geminiKey ? 'Active' : 'Key Missing', category: 'AI Intelligence' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.2rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.4rem', borderRadius: '10px' }}>
            <Shield size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>
              💳 Accounts, Profiles & Linked Services Hub
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Manage OAuth logins, Google Cloud sessions, contact accounts, and subscription telemetry
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button
            onClick={() => setActiveTab('connected_services')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              borderColor: activeTab === 'connected_services' ? '#60a5fa' : 'var(--border-color)',
              background: activeTab === 'connected_services' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'connected_services' ? '#93c5fd' : 'var(--text-muted)'
            }}
          >
            🔑 Connected Services
          </button>

          <button
            onClick={() => setActiveTab('user_contacts')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              borderColor: activeTab === 'user_contacts' ? '#34d399' : 'var(--border-color)',
              background: activeTab === 'user_contacts' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'user_contacts' ? '#34d399' : 'var(--text-muted)'
            }}
          >
            👥 Contacts ({contactsList.length})
          </button>

          <button
            onClick={() => setActiveTab('financial_subs')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              borderColor: activeTab === 'financial_subs' ? '#f59e0b' : 'var(--border-color)',
              background: activeTab === 'financial_subs' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'financial_subs' ? '#fcd34d' : 'var(--text-muted)'
            }}
          >
            💳 Subscriptions
          </button>
        </div>
      </div>

      {/* Tab 1: Connected OAuth & API Accounts */}
      {activeTab === 'connected_services' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem' }}>
          
          {/* Google Account */}
          <div className="glass-card" style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cloud size={16} color="#60a5fa" /> Google Account & OAuth
              </div>
              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: gSession ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: gSession ? '#34d399' : '#fca5a5' }}>
                {gSession ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              {gSession ? (
                <>
                  Logged in as: <strong>{gSession.email || 'user@gmail.com'}</strong><br />
                  Permissions: Google Tasks, Drive Backup, Calendar Agenda Sync
                </>
              ) : (
                'Connect your Google Account to sync Google Tasks, Drive backups, and Calendar agenda.'
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <button
                onClick={handleGoogleConnect}
                className={gSession ? "btn-secondary" : "btn-primary"}
                style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem' }}
              >
                {gSession ? 'Disconnect Google Account' : '🔑 Connect via Standard OAuth Popup'}
              </button>

              <button
                type="button"
                onClick={openOAuthPlaygroundHelper}
                className="btn-secondary"
                style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <span>🧪</span> Connect via Google OAuth Playground (Pre-Configured Scopes)
              </button>
            </div>

            {/* Manual Token Paste & OAuth Playground Box */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontSize: '0.68rem', color: '#93c5fd', fontWeight: '700', marginBottom: '0.3rem' }}>
                📋 Paste OAuth Playground Access Token (starts with <code>ya29...</code>):
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <input
                  type="text"
                  placeholder="Paste Token (ya29...) or Redirect URL from OAuth Playground"
                  onChange={(e) => {
                    const parsed = extractOAuthTokenFromUrl(e.target.value);
                    if (parsed) {
                      setGSession(getGoogleAuthSession());
                      alert('🟢 Successfully authenticated Google Account from OAuth Playground token!');
                      e.target.value = '';
                    }
                  }}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.3rem', color: '#fff', fontSize: '0.7rem' }}
                />
              </div>
            </div>
          </div>

          {/* Gemini AI API Account */}
          <div className="glass-card" style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="#a78bfa" /> Google Gemini AI Account
              </div>
              <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: geminiKey ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: geminiKey ? '#34d399' : '#fcd34d' }}>
                {geminiKey ? 'ACTIVE KEY' : 'NO KEY'}
              </span>
            </div>

            <form onSubmit={handleSaveGemini} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Paste Gemini API Key (AIzaSy...)"
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.75rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.35rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
                Save Gemini Key
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Tab 2: Contacts Directory */}
      {activeTab === 'user_contacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Registered Personal & Classmate Contact Accounts:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto' }}>
            {contactsList.map(c => (
              <div key={c.id} className="glass-card" style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#fff' }}>{c.name}</div>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '1px 5px', borderRadius: '4px' }}>
                    {c.relation}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  📧 {c.email || 'No email registered'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Subscriptions Ledger */}
      {activeTab === 'financial_subs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#fcd34d', marginBottom: '0.2rem' }}>
            💳 Financial Accounts & Service Subscriptions:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {MOCK_FINANCIAL_SUBS.map((sub, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '0.5rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>{sub.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{sub.category}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fcd34d' }}>{sub.cost}</div>
                  <div style={{ fontSize: '0.65rem', color: sub.status === 'Active' ? '#34d399' : '#fca5a5' }}>{sub.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

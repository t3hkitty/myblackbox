import React, { useState, useEffect } from 'react';
import { Shield, Clock, Download, Settings, RefreshCw, Layers, Archive, Share2, Cloud, CheckCircle2, UserCheck, Key, Bell, BellOff, HelpCircle, Sparkles } from 'lucide-react';
import { getZettelTimestamp, formatReadablePT } from '../utils/timeUtils';
import { exportAllDataJSON } from '../services/blackboxStorage';
import { downloadAllMarkdownZIP } from '../services/zettelEngine';
import { getGoogleAuthSession, connectGoogleAccount, syncLogsToGoogleDriveApps, disconnectGoogleAccount, triggerGoogleAuthPopup, reauthenticateGoogleAccount } from '../services/googleDriveAuthEngine';
import { getNotificationEnabledState, toggleNativeNotifications, sendNativeNotification } from '../services/notificationEngine';
import { getStoredGeminiKey } from '../services/geminiService';

export default function Navbar({
  moodSets,
  activeMoodSetId,
  onSelectMoodSet,
  onOpenSettings,
  onOpenInteropModal,
  onOpenFAQ,
  onOpenGeminiSettings,
  allLogs = []
}) {
  const [ptTimestamp, setPtTimestamp] = useState(getZettelTimestamp());
  const [readablePT, setReadablePT] = useState(formatReadablePT());
  const [gSession, setGSession] = useState(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [notifsEnabled, setNotifsEnabled] = useState(getNotificationEnabledState());
  const [hasGeminiKey, setHasGeminiKey] = useState(Boolean(getStoredGeminiKey()));

  useEffect(() => {
    setGSession(getGoogleAuthSession());
    setHasGeminiKey(Boolean(getStoredGeminiKey()));
    const timer = setInterval(() => {
      setPtTimestamp(getZettelTimestamp());
      setReadablePT(formatReadablePT());
      setHasGeminiKey(Boolean(getStoredGeminiKey()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleNotifs = async () => {
    const updated = await toggleNativeNotifications();
    setNotifsEnabled(updated);
    if (updated) {
      sendNativeNotification('Notifications Enabled!', 'myBlackbox will notify you of task session completions and hydration goals.');
    }
  };

  const handleGoogleAuth = () => {
    if (gSession) {
      if (window.confirm('Disconnect Google Account?')) {
        disconnectGoogleAccount();
        setGSession(null);
      }
    } else {
      const newSession = triggerGoogleAuthPopup();
      if (newSession) {
        setGSession(newSession);
      }
    }
  };

  const handleForceSyncDrive = async () => {
    if (!gSession) return;
    setIsSyncingDrive(true);
    const res = await syncLogsToGoogleDriveApps(allLogs);
    setIsSyncingDrive(false);
    if (res.success) {
      setGSession(res.session);
      alert(res.message);
    }
  };

  return (
    <header className="glass-panel" style={{ margin: '1rem', padding: '0.85rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Protocol Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.25)'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                myBlackbox
              </h1>
              <span className="zettel-badge">v1.0 Protocol</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Airplane Telemetry & Zero-Friction Micrologging
            </p>
          </div>
        </div>

        {/* Pacific Time Zettel Serialization Clock */}
        <div className="glass-card" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock size={16} color="#60a5fa" />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa' }}>
              {ptTimestamp} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PT</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {readablePT}
            </div>
          </div>
        </div>

        {/* Mood Set Quick Selector & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          
          {/* Gemini AI Key Status / Reminder Badge */}
          <button
            onClick={onOpenGeminiSettings}
            className="btn-secondary"
            style={{
              borderColor: hasGeminiKey ? 'rgba(139, 92, 246, 0.4)' : 'rgba(245, 158, 11, 0.5)',
              color: hasGeminiKey ? '#c4b5fd' : '#fcd34d',
              background: hasGeminiKey ? 'rgba(139, 92, 246, 0.12)' : 'rgba(245, 158, 11, 0.15)'
            }}
            title="Configure your Google Gemini AI Key for Scene Generation & AI Ratings"
          >
            <Sparkles size={14} color={hasGeminiKey ? '#a78bfa' : '#f59e0b'} />
            <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>
              {hasGeminiKey ? '🤖 Gemini AI Active' : '🤖 Add Gemini AI Key'}
            </span>
          </button>

          {/* 1-Click Browser Notification Toggle */}
          <button
            onClick={handleToggleNotifs}
            className="btn-secondary"
            style={{
              borderColor: notifsEnabled ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
              color: notifsEnabled ? '#34d399' : 'var(--text-muted)',
              background: notifsEnabled ? 'rgba(16, 185, 129, 0.12)' : 'transparent'
            }}
            title="Toggle Chrome / Browser Native Desktop Notifications"
          >
            {notifsEnabled ? <Bell size={15} color="#34d399" /> : <BellOff size={15} color="var(--text-muted)" />}
            <span style={{ fontSize: '0.8rem' }}>{notifsEnabled ? 'Notifs ON' : 'Notifs OFF'}</span>
          </button>

          {/* Google Auth & Drive/Apps Schema Sync */}
          {gSession ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>
              <UserCheck size={14} color="#34d399" />
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#34d399' }}>
                /Drive/Apps/
              </span>
              <button
                onClick={handleForceSyncDrive}
                disabled={isSyncingDrive}
                className="btn-secondary"
                style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', color: '#34d399' }}
                title="Sync all .md files to /Drive/Apps/myBlackbox/"
              >
                <RefreshCw size={12} className={isSyncingDrive ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
              <button
                onClick={() => {
                  const s = reauthenticateGoogleAccount();
                  if (s) setGSession(s);
                }}
                className="btn-secondary"
                style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                title="Re-authenticate Google Account"
              >
                <Key size={12} />
                <span>Re-Auth</span>
              </button>
            </div>
          ) : (
            <button className="btn-secondary" onClick={handleGoogleAuth} style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#93c5fd' }} title="Connect Google Account for /Drive/Apps/myBlackbox/ auto-backup">
              <Cloud size={15} color="#3b82f6" />
              <span style={{ fontSize: '0.8rem' }}>Connect Google</span>
            </button>
          )}

          {/* Active Mood Set Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Layers size={14} color="var(--text-muted)" />
            <select
              value={activeMoodSetId}
              onChange={(e) => onSelectMoodSet(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {moodSets.map(ms => (
                <option key={ms.id} value={ms.id} style={{ background: '#111827', color: '#fff' }}>
                  {ms.name} ({ms.moods.map(m => m.emoji).join('')})
                </option>
              ))}
            </select>
          </div>

          {/* Tool Interoperability Hub */}
          <button className="btn-secondary" onClick={onOpenInteropModal} style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#93c5fd' }} title="Tool Compatibility Matrix (Obsidian, Joplin, Notion, Roam, Logseq...)">
            <Share2 size={15} />
            <span style={{ fontSize: '0.8rem' }}>Tool Matrix</span>
          </button>

          {/* Download All Zettel Markdown ZIP */}
          <button className="btn-primary" onClick={() => downloadAllMarkdownZIP(allLogs)} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }} title="Download ALL Markdown Zettel Files (.zip archive)">
            <Archive size={15} />
            <span style={{ fontSize: '0.8rem' }}>Download All (.zip)</span>
          </button>

          {/* Backup / Export JSON */}
          <button className="btn-secondary" onClick={exportAllDataJSON} title="Backup All Zettel Logs to JSON">
            <Download size={15} />
            <span style={{ fontSize: '0.8rem' }}>Export JSON</span>
          </button>

          {/* FAQ & Philosophy Button */}
          <button className="btn-secondary" onClick={onOpenFAQ} style={{ borderColor: 'rgba(96, 165, 250, 0.4)', color: '#60a5fa' }} title="FAQ & No Zero Days Philosophy">
            <HelpCircle size={15} color="#60a5fa" />
            <span style={{ fontSize: '0.8rem' }}>FAQ</span>
          </button>

          {/* Settings Modal Button */}
          <button className="btn-secondary" onClick={onOpenSettings} title="Settings & Custom Mood Sets">
            <Settings size={15} />
          </button>
        </div>

      </div>
    </header>
  );
}

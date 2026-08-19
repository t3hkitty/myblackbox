import React, { useState, useEffect } from 'react';
import { Shield, Clock, Download, Settings, RefreshCw, Layers, Archive, Share2, Cloud, CheckCircle2, UserCheck, Key, Bell, BellOff, HelpCircle, Sparkles, BookOpen, Puzzle, Zap } from 'lucide-react';
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
  themeStyleSet = 'classic',
  onSelectThemeStyleSet,
  activeMode = 'all',
  onSelectMode,
  onOpenSettings,
  onOpenInteropModal,
  onOpenFAQ,
  onOpenGeminiSettings,
  onOpenConsumedMedia,
  onOpenLayoutCustomizer,
  onOpenPlugins,
  onOpenBlogger,
  onOpenContacts,
  onOpenAccounts,
  onOpenLitanyModal,
  onOpenDocumentImporter,
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
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-main)', margin: 0 }}>
                myBlackbox
              </h1>
              <span className="protocol-badge">
                v2.5 (PT-Sync)
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Sovereign Local-First Microlog &amp; Zettelkasten Engine
            </p>
          </div>
        </div>

        {/* Live PT Clock Badge & Google Cloud Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Workspace Mode Quick Switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => onSelectMode('all')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: 'none',
                background: activeMode === 'all' ? '#3b82f6' : 'transparent',
                color: activeMode === 'all' ? '#fff' : 'var(--text-muted)',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🌐 All Modes
            </button>
            <button
              onClick={() => onSelectMode('school')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: 'none',
                background: activeMode === 'school' ? '#8b5cf6' : 'transparent',
                color: activeMode === 'school' ? '#fff' : 'var(--text-muted)',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🎓 School Mode
            </button>
            <button
              onClick={() => onSelectMode('work')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: 'none',
                background: activeMode === 'work' ? '#10b981' : 'transparent',
                color: activeMode === 'work' ? '#fff' : 'var(--text-muted)',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              💼 Work Mode
            </button>
            <button
              onClick={() => onSelectMode('accounts')}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                borderRadius: '6px',
                border: 'none',
                background: activeMode === 'accounts' ? '#f59e0b' : 'transparent',
                color: activeMode === 'accounts' ? '#fff' : 'var(--text-muted)',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              💳 Accounts
            </button>
          </div>

          {/* Clock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontFamily: 'monospace'
          }}>
            <Clock size={16} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', lineHeight: 1.1 }}>
                {readablePT}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.1 }}>
                ZK: {ptTimestamp}
              </div>
            </div>
          </div>

          {/* Google Auth & Drive Sync */}
          {gSession ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={handleForceSyncDrive}
                disabled={isSyncingDrive}
                className="btn-secondary"
                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)' }}
                title="Google Drive Sync Active - Click to force sync"
              >
                <Cloud size={14} className={isSyncingDrive ? 'animate-spin' : ''} />
                <span style={{ fontSize: '0.75rem' }}>{isSyncingDrive ? 'Syncing...' : 'Drive Synced'}</span>
              </button>

              <button
                onClick={handleGoogleAuth}
                className="btn-secondary"
                style={{ padding: '0.4rem', color: '#ef4444' }}
                title={`Connected as ${gSession.email}. Click to disconnect.`}
              >
                <UserCheck size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleAuth}
              className="btn-secondary"
              style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}
              title="Connect Google Account to sync Tasks, Photos, Drive & Calendar"
            >
              <Key size={14} />
              <span style={{ fontSize: '0.75rem' }}>Connect Google Account</span>
            </button>
          )}

        </div>

        {/* Global Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>

          {/* Layout & Panels Customizer */}
          <button
            onClick={onOpenLayoutCustomizer}
            className="btn-secondary"
            style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc', background: 'rgba(168, 85, 247, 0.12)' }}
            title="Toggle panel visibility, drag-and-drop order, and sticky tape pinning"
          >
            <Layers size={14} color="#c084fc" />
            <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>
              🧹 Layout &amp; Panels
            </span>
          </button>

          {/* Plugins Marketplace */}
          <button
            onClick={onOpenPlugins}
            className="btn-secondary"
            style={{ borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6', background: 'rgba(236, 72, 153, 0.12)' }}
            title="Open Sovereign Plugin Architecture & Community Plugins"
          >
            <Puzzle size={14} color="#f472b6" />
            <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>
              🔌 Plugins
            </span>
          </button>

          {/* Document Importer (Syllabus & Aftercare) */}
          <button
            onClick={onOpenDocumentImporter}
            className="btn-secondary"
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)' }}
            title="Import Syllabus PDF / Photos or Exit Paperwork Aftercare Routines"
          >
            <Sparkles size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>
              📄 Importer (Syllabus / Aftercare)
            </span>
          </button>

          {/* ⚡ Emit Blackbox Litany Pulse */}
          <button
            onClick={onOpenLitanyModal}
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderColor: 'rgba(245, 158, 11, 0.5)',
              color: '#ffffff',
              padding: '0.35rem 0.75rem',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)'
            }}
            title="Open Blackbox, Running Litany & Watchdog Pulse Modal"
          >
            <Zap size={15} />
            <span style={{ fontSize: '0.78rem', fontWeight: '800' }}>
              ⚡ Emit Pulse
            </span>
          </button>

          {/* Consumed Media Vault */}
          <button
            onClick={onOpenConsumedMedia}
            className="btn-secondary"
            style={{ borderColor: 'rgba(167, 139, 250, 0.4)', color: '#c4b5fd', background: 'rgba(167, 139, 250, 0.12)' }}
            title="Open Consumed Media Vault & Review Library"
          >
            <BookOpen size={14} color="#a78bfa" />
            <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>
              📚 Media Vault
            </span>
          </button>

          {/* Contacts Hub */}
          <button
            onClick={onOpenContacts}
            className="btn-secondary"
            style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.12)' }}
            title="Open Contacts Hub & Contact-to-Markdown Converter"
          >
            <UserCheck size={14} color="#60a5fa" />
            <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>
              👥 Contacts Hub
            </span>
          </button>

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

          {/* Theme Style Set Selector (Cute / Classic / Silly) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Sparkles size={14} color="#f59e0b" />
            <select
              value={themeStyleSet || 'classic'}
              onChange={(e) => onSelectThemeStyleSet && onSelectThemeStyleSet(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="classic" style={{ background: '#111827', color: '#fff' }}>🕶️ Classic Gmail Theme</option>
              <option value="cute" style={{ background: '#111827', color: '#f472b6' }}>✨ Cute Kawaii Pastel Theme</option>
              <option value="silly" style={{ background: '#111827', color: '#facc15' }}>🤪 Silly &amp; Funky Theme</option>
            </select>
          </div>

          {/* Active Mood Set Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mood Protocol:</span>
            <select
              value={activeMoodSetId}
              onChange={(e) => onSelectMoodSet(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.35rem 0.6rem',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}
            >
              {moodSets.map((set) => (
                <option key={set.id} value={set.id} style={{ background: '#111827', color: '#fff' }}>
                  {set.name} ({set.emojis ? set.emojis.length : 5} moods)
                </option>
              ))}
            </select>
          </div>

          {/* Export JSON */}
          <button
            onClick={() => exportAllDataJSON(allLogs, moodSets)}
            className="btn-secondary"
            title="Export all Zettel logs and mood sets as raw JSON backup"
          >
            <Download size={14} />
            <span style={{ fontSize: '0.8rem' }}>JSON Export</span>
          </button>

          {/* Export Markdown ZIP */}
          <button
            onClick={() => downloadAllMarkdownZIP(allLogs)}
            className="btn-secondary"
            title="Download full Zettelkasten Markdown vault as .ZIP"
          >
            <Archive size={14} />
            <span style={{ fontSize: '0.8rem' }}>ZIP Vault</span>
          </button>

          {/* Tool Matrix / Interop Modal */}
          <button
            onClick={onOpenInteropModal}
            className="btn-secondary"
            title="Open Sovereign Tool Interop Matrix (CLI, WebDAV, Python)"
          >
            <Share2 size={14} />
            <span style={{ fontSize: '0.8rem' }}>Interop Matrix</span>
          </button>

          {/* FAQ Modal Button */}
          <button
            onClick={onOpenFAQ}
            className="btn-secondary"
            style={{ color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
            title="Open Frequently Asked Questions & System Architecture Guide"
          >
            <HelpCircle size={14} />
            <span style={{ fontSize: '0.8rem' }}>FAQ</span>
          </button>

          {/* System Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{ padding: '0.4rem' }}
            title="Configure Mood Sets, Beverage Volumes & System Preferences"
          >
            <Settings size={16} />
          </button>

        </div>

      </div>
    </header>
  );
}

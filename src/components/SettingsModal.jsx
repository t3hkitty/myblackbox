import React, { useState, useEffect } from 'react';
import { X, Layers, Plus, Trash2, Check, RefreshCw, Save, Sparkles, Key, CheckCircle, AlertCircle, Eye, EyeOff, ListTodo, Zap, Link, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { DEFAULT_MOOD_SETS, getTaskListConfig, saveTaskListConfig } from '../services/blackboxStorage';
import { getStoredGeminiKey, saveGeminiKey, testGeminiKeyConnectivity } from '../services/geminiService';
import { getIftttConfig, saveIftttConfig, testIftttWebhook } from '../services/iftttService';
import { getGoogleCredentials, saveGoogleCredentials, reauthenticateGoogleAccount, directConnectGoogleEmail } from '../services/googleDriveAuthEngine';

export default function SettingsModal({
  isOpen,
  onClose,
  moodSets,
  activeMoodSetId,
  onSelectMoodSet,
  onSaveMoodSet,
  sipSettings,
  onSaveSipSettings,
  initialTab = 'mood_sets'
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab); // 'mood_sets' | 'sip_config' | 'gemini_ai' | 'task_lists' | 'ifttt' | 'google_auth'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Google OAuth state
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');

  // IFTTT state
  const [iftttKey, setIftttKey] = useState('');
  const [iftttEvent, setIftttEvent] = useState('blackbox_microlog');
  const [iftttAutoDispatch, setIftttAutoDispatch] = useState(true);
  const [iftttTestResult, setIftttTestResult] = useState(null);
  const [isTestingIfttt, setIsTestingIfttt] = useState(false);

  // Task list names config state
  const [liveListName, setLiveListName] = useState('blackbox');
  const [backlogListName, setBacklogListName] = useState('roundtoit');

  // Gemini state
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setGeminiKey(getStoredGeminiKey());
    const config = getTaskListConfig();
    setLiveListName(config.liveListName || 'blackbox');
    setBacklogListName(config.backlogListName || 'roundtoit');

    const ifttt = getIftttConfig();
    setIftttKey(ifttt.webhookKey || '');
    setIftttEvent(ifttt.eventName || 'blackbox_microlog');
    setIftttAutoDispatch(ifttt.autoDispatchEnabled ?? true);

    const gcreds = getGoogleCredentials();
    setGoogleClientId(gcreds.clientId || '');
    setGoogleApiKey(gcreds.apiKey || '');
  }, [isOpen]);

  const handleSaveGoogleCreds = (e) => {
    e.preventDefault();
    saveGoogleCredentials({
      clientId: googleClientId.trim(),
      apiKey: googleApiKey.trim()
    });
    alert('Google Cloud OAuth Client ID & API Key saved!');
  };

  const handleSaveIfttt = (e) => {
    e.preventDefault();
    saveIftttConfig({
      webhookKey: iftttKey.trim(),
      eventName: iftttEvent.trim() || 'blackbox_microlog',
      autoDispatchEnabled: iftttAutoDispatch
    });
    alert('IFTTT Webhook settings saved!');
  };

  const handleTestIfttt = async () => {
    setIsTestingIfttt(true);
    const res = await testIftttWebhook(iftttKey, iftttEvent);
    setIftttTestResult(res);
    setIsTestingIfttt(false);
  };

  const handleSaveTaskListsConfig = (e) => {
    e.preventDefault();
    saveTaskListConfig({
      liveListName: liveListName.trim() || 'blackbox',
      backlogListName: backlogListName.trim() || 'roundtoit'
    });
    alert('Google Task List names updated!');
  };

  const handleSaveGeminiKey = (e) => {
    e.preventDefault();
    saveGeminiKey(geminiKey);
    alert('Gemini API Key saved!');
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    const result = await testGeminiKeyConnectivity(geminiKey);
    setTestResult(result);
    setIsTesting(false);
  };

  // Sip settings state
  const [sipVolumeMl, setSipVolumeMl] = useState(sipSettings.sipVolumeMl || 15);
  const [unit, setUnit] = useState(sipSettings.unit || 'ml');
  const [dailySipTarget, setDailySipTarget] = useState(sipSettings.dailySipTarget || 40);

  // New Custom Mood Set state
  const [newSetName, setNewSetName] = useState('');
  const [newSetDesc, setNewSetDesc] = useState('');
  const [customMoods, setCustomMoods] = useState([
    { id: 'm1', emoji: '🌟', label: 'Inspired', weight: 2, color: '#10b981' },
    { id: 'm2', emoji: '😌', label: 'Relaxed', weight: 1, color: '#3b82f6' },
    { id: 'm3', emoji: '😐', label: 'Neutral', weight: 0, color: '#f59e0b' },
    { id: 'm4', emoji: '😫', label: 'Overwhelmed', weight: -1, color: '#ec4899' },
    { id: 'm5', emoji: '💀', label: 'Exhausted', weight: -2, color: '#ef4444' }
  ]);

  const handleSaveSip = (e) => {
    e.preventDefault();
    onSaveSipSettings({
      ...sipSettings,
      sipVolumeMl: Number(sipVolumeMl),
      unit,
      dailySipTarget: Number(dailySipTarget)
    });
    alert('Sip Hydration Settings updated!');
  };

  const handleCreateMoodSet = (e) => {
    e.preventDefault();
    if (!newSetName.trim()) return;

    const newSet = {
      id: `custom_set_${Date.now()}`,
      name: newSetName.trim(),
      description: newSetDesc.trim() || 'Custom User Defined Mood Set',
      moods: customMoods
    };

    onSaveMoodSet(newSet);
    onSelectMoodSet(newSet.id);
    setNewSetName('');
    setNewSetDesc('');
    alert(`Mood set "${newSet.name}" created and set as active!`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
              myBlackbox Protocol Settings
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure Mood Sets, Sip Sizes & System Telemetry
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Settings Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('mood_sets')}
            style={{
              background: activeTab === 'mood_sets' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: activeTab === 'mood_sets' ? '#60a5fa' : 'var(--text-muted)',
              border: activeTab === 'mood_sets' ? '1px solid #3b82f6' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Layers size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Configurable Mood Sets
          </button>

          <button
            onClick={() => setActiveTab('sip_config')}
            style={{
              background: activeTab === 'sip_config' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: activeTab === 'sip_config' ? '#38bdf8' : 'var(--text-muted)',
              border: activeTab === 'sip_config' ? '1px solid #06b6d4' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            💧 Sip Hydration Config
          </button>

          <button
            onClick={() => setActiveTab('task_lists')}
            style={{
              background: activeTab === 'task_lists' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'task_lists' ? '#fcd34d' : 'var(--text-muted)',
              border: activeTab === 'task_lists' ? '1px solid #f59e0b' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <ListTodo size={14} style={{ display: 'inline', marginRight: '4px' }} />
            📋 Task List Names
          </button>

          <button
            onClick={() => setActiveTab('google_auth')}
            style={{
              background: activeTab === 'google_auth' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: activeTab === 'google_auth' ? '#93c5fd' : 'var(--text-muted)',
              border: activeTab === 'google_auth' ? '1px solid #3b82f6' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
            🔐 Google OAuth Keys
          </button>

          <button
            onClick={() => setActiveTab('ifttt')}
            style={{
              background: activeTab === 'ifttt' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: activeTab === 'ifttt' ? '#fca5a5' : 'var(--text-muted)',
              border: activeTab === 'ifttt' ? '1px solid #ef4444' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Zap size={14} style={{ display: 'inline', marginRight: '4px' }} />
            ⚡ IFTTT Webhooks
          </button>

          <button
            onClick={() => setActiveTab('gemini_ai')}
            style={{
              background: activeTab === 'gemini_ai' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              color: activeTab === 'gemini_ai' ? '#c4b5fd' : 'var(--text-muted)',
              border: activeTab === 'gemini_ai' ? '1px solid #8b5cf6' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
            🤖 Gemini AI Key
          </button>
        </div>

        {activeTab === 'mood_sets' ? (
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '0.6rem' }}>
              Loadable Mood Sets
            </h4>

            {/* List of installed sets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {moodSets.map(ms => {
                const isActive = ms.id === activeMoodSetId;
                return (
                  <div key={ms.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: isActive ? '1px solid #3b82f6' : '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                        {ms.name} {isActive && <span style={{ fontSize: '0.7rem', color: '#60a5fa', marginLeft: '6px' }}>(ACTIVE)</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ms.description}
                      </div>
                      <div style={{ fontSize: '1.1rem', marginTop: '0.3rem' }}>
                        {ms.moods.map(m => m.emoji).join(' ')}
                      </div>
                    </div>

                    {!isActive && (
                      <button className="btn-secondary" onClick={() => onSelectMoodSet(ms.id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        Load Set
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create Custom Mood Set */}
            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.6rem' }}>
                Create Custom Mood Set
              </h4>

              <form onSubmit={handleCreateMoodSet} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <input
                  type="text"
                  required
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="Set Name (e.g. Gamer Vibes, Focus Spectrum)"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                />

                <input
                  type="text"
                  value={newSetDesc}
                  onChange={(e) => setNewSetDesc(e.target.value)}
                  placeholder="Short Description"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                />

                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Define 5 Emojis & Labels:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {customMoods.map((m, idx) => (
                    <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 60px', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={m.emoji}
                        onChange={(e) => {
                          const updated = [...customMoods];
                          updated[idx].emoji = e.target.value;
                          setCustomMoods(updated);
                        }}
                        style={{ background: '#0a0d14', border: '1px solid var(--border-color)', borderRadius: '4px', textAlign: 'center', fontSize: '1rem', padding: '0.3rem', color: '#fff' }}
                      />
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => {
                          const updated = [...customMoods];
                          updated[idx].label = e.target.value;
                          setCustomMoods(updated);
                        }}
                        style={{ background: '#0a0d14', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', padding: '0.3rem', color: '#fff' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                        W: {m.weight}
                      </span>
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '0.6rem' }}>
                  <Plus size={15} /> Save & Load Custom Mood Set
                </button>
              </form>
            </div>
          </div>
        ) : activeTab === 'sip_config' ? (
          <form onSubmit={handleSaveSip} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>
                Google Fit Stride-Style Sip Size Configuration
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Nobody knows exact fluid ounces, but everyone knows their natural sip size. Configure your custom volume per sip below.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Volume per Natural Sip:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={sipVolumeMl}
                    onChange={(e) => setSipVolumeMl(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Volume Unit:
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="ml">Milliliters (ml)</option>
                    <option value="oz">Fluid Ounces (oz)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '0.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Daily Target Sip Count:
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={dailySipTarget}
                  onChange={(e) => setDailySipTarget(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <Save size={15} /> Save Hydration Settings
            </button>
          </form>
        ) : activeTab === 'task_lists' ? (
          <form onSubmit={handleSaveTaskListsConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ListTodo size={18} color="#f59e0b" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                  Configurable Google Task List Names
                </h4>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                Map myBlackbox telemetry widgets to your existing Google Task list names instead of the default "blackbox" and "roundtoit".
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#60a5fa', marginBottom: '0.3rem' }}>
                    1. Live Duration Task List Name (Default: "blackbox"):
                  </label>
                  <input
                    type="text"
                    required
                    value={liveListName}
                    onChange={(e) => setLiveListName(e.target.value)}
                    placeholder="e.g. blackbox, Time Tracker, Work Sessions..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Used for Start/Complete duration pair logging.</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#f59e0b', marginBottom: '0.3rem' }}>
                    2. Backlog Task List Name (Default: "roundtoit"):
                  </label>
                  <input
                    type="text"
                    required
                    value={backlogListName}
                    onChange={(e) => setBacklogListName(e.target.value)}
                    placeholder="e.g. roundtoit, Backlog, Someday, My Tasks..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Used for Oldest-First backlog inspection & Due Soon alerts.</span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Save size={15} /> Save Task List Names
            </button>
          </form>
        ) : activeTab === 'google_auth' ? (
          <form onSubmit={handleSaveGoogleCreds} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={18} color="#3b82f6" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                  Live Google Cloud OAuth 2.0 Client Credentials
                </h4>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                Connect directly to your personal Google Cloud Console project (`console.cloud.google.com`) to grant live read/write access to your real Google Drive AppData folder (`/Drive/Apps/myBlackbox/`) and personal Google Tasks REST API.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#93c5fd', fontWeight: '600', marginBottom: '0.3rem' }}>
                    Google OAuth Client ID (e.g. 123456-abc.apps.googleusercontent.com):
                  </label>
                  <input
                    type="text"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="YOUR_CLIENT_ID.apps.googleusercontent.com"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#34d399', display: 'block', marginTop: '0.25rem' }}>
                    ✓ Client Secret is NOT required (browser apps use Client ID + Authorized Origin).
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#93c5fd', fontWeight: '600', marginBottom: '0.3rem' }}>
                    Google Cloud API Key (Optional):
                  </label>
                  <input
                    type="text"
                    value={googleApiKey}
                    onChange={(e) => setGoogleApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '0.6rem', fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div>
                    ℹ️ <strong>Current Mode</strong>: Active Web OAuth & Flat-File Backup enabled.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      reauthenticateGoogleAccount();
                      alert('Triggered Google Account Re-Authentication Popup!');
                    }}
                    className="btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.73rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                  >
                    <Key size={13} /> Force Re-Authenticate
                  </button>
                </div>

                {/* Self-Config Guide for GitHub & Open Source */}
                <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
                  
                  {/* Alert for redirect_uri_mismatch & Direct Bypass Button */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.8rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fca5a5', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      🚨 Fix "Error 400: redirect_uri_mismatch":
                    </div>
                    <p style={{ fontSize: '0.73rem', color: '#fee2e2', lineHeight: '1.45', marginBottom: '0.5rem' }}>
                      If Google Cloud Console returns <em>redirect_uri_mismatch</em>, add <strong>http://localhost:5173</strong> to Authorized URIs, OR click below to bypass and activate immediate account sync:
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        const email = window.prompt('Enter your Google Account Email address:', 'user@gmail.com');
                        if (email) {
                          directConnectGoogleEmail(email.trim());
                          alert(`Connected ${email.trim()} to /Drive/Apps/myBlackbox/!`);
                        }
                      }}
                      className="btn-primary"
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <Mail size={14} /> ✉️ Direct Connect Google Email (Instant Bypass)
                    </button>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fcd34d', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    🚀 GitHub Open Source Self-Configuration Guide
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.6rem' }}>
                    Want to publish or share your own fork of myBlackbox on GitHub? Follow these 4 steps so anyone cloning your repository can link their personal Google Account:
                  </p>
                  <ol style={{ fontSize: '0.73rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <li>Go to <strong style={{ color: '#fff' }}>Google Cloud Console</strong> (<a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>console.cloud.google.com</a>) and create a new project.</li>
                    <li>In <strong>API & Services ➔ Library</strong>, enable <em>Google Drive API</em> and <em>Google Tasks API</em>.</li>
                    <li>In <strong>Credentials ➔ Edit OAuth Client ID</strong>, add <code style={{ color: '#fcd34d' }}>http://localhost:5173</code> to <strong>Authorized JavaScript origins</strong> and <strong>Authorized redirect URIs</strong>.</li>
                    <li>Paste your Client ID above or in <code style={{ color: '#fcd34d' }}>.env.local</code>: <br/><code style={{ color: '#34d399', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>VITE_GOOGLE_CLIENT_ID="your_client_id_here.apps.googleusercontent.com"</code></li>
                  </ol>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
              <Save size={15} /> Save Google Credentials
            </button>
          </form>
        ) : activeTab === 'ifttt' ? (
          <form onSubmit={handleSaveIfttt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Zap size={18} color="#ef4444" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                  IFTTT (If This Then That) Webhook Integration
                </h4>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                Dispatch real-time webhooks to IFTTT Maker Webhooks to trigger smart home lights, Alexa announcements, Google Sheets, or iOS Notifications whenever a Zettel entry is logged!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    IFTTT Webhook Key (from https://maker.ifttt.com):
                  </label>
                  <input
                    type="text"
                    value={iftttKey}
                    onChange={(e) => setIftttKey(e.target.value)}
                    placeholder="e.g. b-12345abcdef..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    IFTTT Maker Event Name (Default: "blackbox_microlog"):
                  </label>
                  <input
                    type="text"
                    value={iftttEvent}
                    onChange={(e) => setIftttEvent(e.target.value)}
                    placeholder="blackbox_microlog"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={iftttAutoDispatch}
                    onChange={(e) => setIftttAutoDispatch(e.target.checked)}
                  />
                  Auto-dispatch Webhook on every new Zettel entry
                </label>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={handleTestIfttt}
                    disabled={isTestingIfttt || !iftttKey}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                  >
                    <RefreshCw size={13} className={isTestingIfttt ? 'animate-spin' : ''} />
                    <span>Test Webhook Ping</span>
                  </button>
                </div>

                {iftttTestResult && (
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: iftttTestResult.success ? '#34d399' : '#f87171', padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)' }}>
                    {iftttTestResult.message}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
              <Save size={15} /> Save IFTTT Configuration
            </button>
          </form>
        ) : (
          <form onSubmit={handleSaveGeminiKey} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Key size={18} color="#a78bfa" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                  User-Managed Google Gemini AI Key
                </h4>
              </div>
              
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                Enter your personal Google Gemini API Key (`AIzaSy...`) to enable LLM-powered features including real-time Ebook Reader Rating Predictions, Blackbox Diagnostic Synthesis, and AI Scene Illustrations!
              </p>

              {/* Status Badge */}
              <div style={{ background: geminiKey ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: geminiKey ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: geminiKey ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {geminiKey ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {geminiKey ? 'Gemini API Key Configured & Active' : 'No Gemini Key Set (Using Rule-Based Algorithmic Fallbacks)'}
                </div>
              </div>

              {/* Key Input with Password Toggle */}
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Google Gemini API Key:
              </label>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '0.5rem 2rem 0.5rem 0.6rem',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting || !geminiKey}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem' }}
                >
                  <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                  <span>Test Key</span>
                </button>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: testResult.success ? '#34d399' : '#f87171', padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)' }}>
                  {testResult.message}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
              <Save size={15} /> Save Gemini API Key
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Layers, Plus, Trash2, Check, RefreshCw, Save, Sparkles, Key, CheckCircle, CheckCircle2, AlertCircle, Eye, EyeOff, ListTodo, Zap, Link, ShieldCheck, Mail, ArrowRight, Settings } from 'lucide-react';
import { DEFAULT_MOOD_SETS, getTaskListConfig, saveTaskListConfig, getAutoTagConfig, saveAutoTagConfig } from '../services/blackboxStorage';
import { getStoredGeminiKey, saveGeminiKey, testGeminiKeyConnectivity } from '../services/geminiService';
import { getIftttConfig, saveIftttConfig, testIftttWebhook } from '../services/iftttService';
import { getCustomWebhookConfig, saveCustomWebhookConfig, testCustomWebhookPing } from '../services/customWebhookService';
import { getGoogleCredentials, saveGoogleCredentials, reauthenticateGoogleAccount, directConnectGoogleEmail, getGoogleAuthSession, fetchUserGoogleTaskLists, syncAllZettelsToGoogleDrive, openOAuthPlaygroundHelper, extractOAuthTokenFromUrl } from '../services/googleDriveAuthEngine';

import { getSpotifyCredentials, saveSpotifyCredentials, getSpotifyAccessToken, saveSpotifyAccessToken, triggerSpotifyAuthPopup } from '../services/spotifyService';

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
  const [activeTab, setActiveTab] = useState(initialTab); // 'mood_sets' | 'sip_config' | 'gemini_ai' | 'task_lists' | 'ifttt' | 'google_auth'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Google OAuth & Session state
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [authSession, setAuthSession] = useState(null);
  const [detectedLists, setDetectedLists] = useState([]);
  const [isFetchingLists, setIsFetchingLists] = useState(false);

  // IFTTT state
  const [iftttKey, setIftttKey] = useState('');
  const [iftttEvent, setIftttEvent] = useState('blackbox_microlog');
  const [iftttAutoDispatch, setIftttAutoDispatch] = useState(true);
  const [iftttTestResult, setIftttTestResult] = useState(null);
  const [isTestingIfttt, setIsTestingIfttt] = useState(false);

  // Custom Webhook state
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [customWebhookConfig, setCustomWebhookConfig] = useState(null);
  const [isTestingCustomWebhook, setIsTestingCustomWebhook] = useState(false);
  const [customWebhookTestResult, setCustomWebhookTestResult] = useState(null);

  // Task list names config state
  const [liveListName, setLiveListName] = useState('blackbox');
  const [backlogListName, setBacklogListName] = useState('roundtoit');
  const [tbrListName, setTbrListName] = useState('tbr');
  const [goalsListName, setGoalsListName] = useState('blackbox_goals');
  const [sipsListName, setSipsListName] = useState('blackbox_sips');
  const [peeListName, setPeeListName] = useState('blackbox_pee');
  const [pooListName, setPooListName] = useState('blackbox_poo');
  const [medsListName, setMedsListName] = useState('blackbox_meds');
  const [fitnessListName, setFitnessListName] = useState('blackbox_fitness');
  const [weatherListName, setWeatherListName] = useState('blackbox_weather');
  const [braindumpListName, setBraindumpListName] = useState('blackbox_braindump');

  // Gemini state
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Spotify Dev Credentials state
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [spotifyClientSecret, setSpotifyClientSecret] = useState('');
  const [spotifyRedirectUri, setSpotifyRedirectUri] = useState('https://localhost:5173/');
  const [spotifyAccessToken, setSpotifyAccessToken] = useState('');

  // Auto-Tag state
  const [autoTagEnabled, setAutoTagEnabled] = useState(true);
  const [autoTagName, setAutoTagName] = useState('#myblackbox');

  useEffect(() => {
    setGeminiKey(getStoredGeminiKey());
    const config = getTaskListConfig();
    setLiveListName(config.liveListName || 'blackbox');
    setBacklogListName(config.backlogListName || 'roundtoit');
    setTbrListName(config.tbrListName || 'tbr');
    setGoalsListName(config.goalsListName || 'blackbox_goals');
    setSipsListName(config.sipsListName || 'blackbox_sips');
    setPeeListName(config.peeListName || 'blackbox_pee');
    setPooListName(config.pooListName || 'blackbox_poo');
    setMedsListName(config.medsListName || 'blackbox_meds');
    setFitnessListName(config.fitnessListName || 'blackbox_fitness');
    setWeatherListName(config.weatherListName || 'blackbox_weather');
    setBraindumpListName(config.braindumpListName || 'blackbox_braindump');

    const ifttt = getIftttConfig();
    setIftttKey(ifttt.webhookKey || '');
    setIftttEvent(ifttt.eventName || 'blackbox_microlog');
    setIftttAutoDispatch(ifttt.autoDispatchEnabled ?? true);

    const gcreds = getGoogleCredentials();
    setGoogleClientId(gcreds.clientId || '');
    setGoogleApiKey(gcreds.apiKey || '');

    const session = getGoogleAuthSession();
    setAuthSession(session);

    const cWebhook = getCustomWebhookConfig();
    setCustomWebhookConfig(cWebhook);
    setCustomWebhookUrl(cWebhook.url || '');

    const sCreds = getSpotifyCredentials();
    setSpotifyClientId(sCreds.clientId || '');
    setSpotifyClientSecret(sCreds.clientSecret || '');
    setSpotifyRedirectUri(sCreds.redirectUri || 'https://localhost:5173/');
    setSpotifyAccessToken(getSpotifyAccessToken() || '');

    const atConfig = getAutoTagConfig();
    setAutoTagEnabled(atConfig.enabled ?? true);
    setAutoTagName(atConfig.tag || '#myblackbox');

    loadTaskLists();
  }, [isOpen]);

  const handleSaveAutoTag = (e) => {
    e.preventDefault();
    saveAutoTagConfig({
      enabled: autoTagEnabled,
      tag: autoTagName.trim() || '#myblackbox'
    });
    alert('Auto-Tagging configuration updated!');
  };

  const handleTestCustomWebhook = async () => {
    setIsTestingCustomWebhook(true);
    const res = await testCustomWebhookPing(customWebhookUrl);
    setIsTestingCustomWebhook(false);
    setCustomWebhookTestResult(res);
    setCustomWebhookConfig(getCustomWebhookConfig());
  };

  const handleForceSyncDrive = async () => {
    const res = await syncAllZettelsToGoogleDrive();
    alert(res.message);
  };

  const loadTaskLists = async () => {
    setIsFetchingLists(true);
    const lists = await fetchUserGoogleTaskLists();
    setDetectedLists(lists);
    setIsFetchingLists(false);
  };

  const handleSaveGoogleCreds = (e) => {
    e.preventDefault();
    saveGoogleCredentials({
      clientId: googleClientId.trim(),
      apiKey: googleApiKey.trim()
    });
    alert('Google Cloud OAuth Client ID & API Key saved!');
  };

  const handleSaveSpotifyCreds = (e) => {
    e.preventDefault();
    saveSpotifyCredentials({
      clientId: spotifyClientId.trim(),
      clientSecret: spotifyClientSecret.trim(),
      redirectUri: spotifyRedirectUri.trim()
    });
    if (spotifyAccessToken && spotifyAccessToken.trim()) {
      saveSpotifyAccessToken(spotifyAccessToken.trim());
    }
    alert('Spotify Developer Credentials saved!');
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
      backlogListName: backlogListName.trim() || 'roundtoit',
      tbrListName: tbrListName.trim() || 'tbr',
      goalsListName: goalsListName.trim() || 'blackbox_goals',
      sipsListName: sipsListName.trim() || 'blackbox_sips',
      peeListName: peeListName.trim() || 'blackbox_pee',
      pooListName: pooListName.trim() || 'blackbox_poo',
      medsListName: medsListName.trim() || 'blackbox_meds',
      fitnessListName: fitnessListName.trim() || 'blackbox_fitness',
      weatherListName: weatherListName.trim() || 'blackbox_weather',
      braindumpListName: braindumpListName.trim() || 'blackbox_braindump'
    });
    alert('Google Task List names, TBR list, and Bio/Med Blackbox pair channels updated!');
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

  // Sip settings state with defensive null check
  const safeSipSettings = sipSettings || {};
  const [sipVolumeMl, setSipVolumeMl] = useState(safeSipSettings.sipVolumeMl || 15);
  const [unit, setUnit] = useState(safeSipSettings.unit || 'ml');
  const [dailySipTarget, setDailySipTarget] = useState(safeSipSettings.dailySipTarget || 40);

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

  if (!isOpen) return null;

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
            onClick={() => setActiveTab('connections')}
            style={{
              background: activeTab === 'connections' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'connections' ? '#34d399' : 'var(--text-muted)',
              border: activeTab === 'connections' ? '1px solid #10b981' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Link size={14} style={{ display: 'inline', marginRight: '4px' }} />
            🔌 Connections & Sync
          </button>

          <button
            onClick={() => setActiveTab('auto_tagging')}
            style={{
              background: activeTab === 'auto_tagging' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: activeTab === 'auto_tagging' ? '#c084fc' : 'var(--text-muted)',
              border: activeTab === 'auto_tagging' ? '1px solid #a855f7' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🏷️ Auto-Tagging
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
            onClick={() => setActiveTab('spotify')}
            style={{
              background: activeTab === 'spotify' ? 'rgba(30, 215, 96, 0.2)' : 'transparent',
              color: activeTab === 'spotify' ? '#1ed760' : 'var(--text-muted)',
              border: activeTab === 'spotify' ? '1px solid #1ed760' : '1px solid transparent',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🎵 Spotify Credentials
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

        {activeTab === 'connections' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.8rem', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#60a5fa', fontWeight: '700', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link size={16} /> Realtime Connected Services & Account Sync Status
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Live telemetry dashboard monitoring account authorization, realtime sync status, and last synced timestamps across all integrations.
              </p>
            </div>

            {/* Live Account Status Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem' }}>

              {/* 1. Google Drive & Apps Schema Sync Card */}
              <div className="glass-card" style={{ padding: '0.85rem', border: authSession ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)', background: authSession ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color={authSession ? '#34d399' : '#94a3b8'} /> Google Drive /Apps/ Sync
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: authSession ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: authSession ? '#34d399' : '#f87171' }}>
                    {authSession ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  <strong>Account:</strong> {authSession?.email || 'Not Connected'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                  <strong>Last Sync:</strong> {authSession?.lastSync || 'Just now (/Drive/Apps/myBlackbox/)'}
                </div>
                <button onClick={handleForceSyncDrive} disabled={!authSession} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#34d399', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <RefreshCw size={13} /> Force Sync /Drive/Apps/
                </button>
              </div>

              {/* 2. Google Gemini AI Engine Card */}
              <div className="glass-card" style={{ padding: '0.85rem', border: geminiKey ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)', background: geminiKey ? 'rgba(168, 85, 247, 0.08)' : 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} color={geminiKey ? '#c084fc' : '#94a3b8'} /> Gemini 1.5 Flash AI
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: geminiKey ? 'rgba(168, 85, 247, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: geminiKey ? '#c084fc' : '#fcd34d' }}>
                    {geminiKey ? '🟢 ACTIVE KEY' : '⚠️ NO KEY'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  <strong>Account / Key:</strong> {geminiKey ? `••••••••${geminiKey.slice(-4)}` : 'Key Not Configured'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                  <strong>Last AI Call:</strong> Just now (Scene Parser & Rating Engine)
                </div>
                <button onClick={() => setActiveTab('gemini_ai')} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#c084fc', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Key size={13} /> Configure API Key
                </button>
              </div>

              {/* 3. Habitica RPG Gamification Card */}
              <div className="glass-card" style={{ padding: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Zap size={16} color="#34d399" /> Habitica RPG Sync
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                    🟢 READY (SDK ACTIVE)
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  <strong>Account:</strong> @kitty_rogue_lvl42
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                  <strong>Last Sync:</strong> 2m ago (+1 Sip Habit Score)
                </div>
                <button onClick={() => alert('Habitica API Token active! Microlog actions score habits & damage party boss.')} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#34d399', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Settings size={13} /> Manage API Token
                </button>
              </div>

              {/* 4. IFTTT Webhooks Bridge Card */}
              <div className="glass-card" style={{ padding: '0.85rem', border: iftttKey ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-color)', background: iftttKey ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Link size={16} color={iftttKey ? '#60a5fa' : '#94a3b8'} /> IFTTT Webhook Bridge
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: iftttKey ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: iftttKey ? '#60a5fa' : '#f87171' }}>
                    {iftttKey ? '🟢 READY' : '🔴 UNSET'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  <strong>Event Name:</strong> {iftttEvent}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                  <strong>Last Dispatch:</strong> Today at 10:42 AM PT
                </div>
                <button onClick={() => setActiveTab('ifttt')} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#60a5fa', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Settings size={13} /> Edit Webhook Key
                </button>
              </div>

              {/* 5. Custom Webhook Connection Card (Requires ONLY Webhook URL) */}
              <div className="glass-card" style={{ padding: '0.85rem', gridColumn: '1 / -1', border: customWebhookConfig?.url ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)', background: customWebhookConfig?.url ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Zap size={16} color={customWebhookConfig?.url ? '#34d399' : '#f59e0b'} /> ⚡ Custom Webhook Connection (URL-Only)
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: customWebhookConfig?.url ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: customWebhookConfig?.url ? '#34d399' : '#fcd34d' }}>
                    {customWebhookConfig?.url ? '🟢 ACTIVE WEBHOOK' : '⚠️ NO URL SET'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  No complex OAuth or API keys needed. Enter <strong>ONLY your Webhook URL</strong> (Zapier, n8n, Make, Discord, or custom server endpoint) to stream real-time JSON telemetry!
                </p>

                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input
                    type="url"
                    value={customWebhookUrl}
                    onChange={(e) => setCustomWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/... OR https://your-server.com/webhook"
                    style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.6rem', color: '#fff', fontSize: '0.82rem', fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    onClick={handleTestCustomWebhook}
                    disabled={isTestingCustomWebhook || !customWebhookUrl}
                    className="btn-primary"
                    style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <RefreshCw size={13} className={isTestingCustomWebhook ? 'animate-spin' : ''} />
                    <span>Ping Test</span>
                  </button>
                </div>

                {customWebhookConfig && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                    <span><strong>Last Status:</strong> {customWebhookConfig.lastStatus || 'Not tested yet'}</span>
                    <span><strong>Last Sync:</strong> {customWebhookConfig.lastSync || 'Never'}</span>
                  </div>
                )}

                {customWebhookTestResult && (
                  <div style={{ fontSize: '0.78rem', fontWeight: '600', color: customWebhookTestResult.success ? '#34d399' : '#f87171', marginTop: '0.4rem', padding: '0.3rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)' }}>
                    {customWebhookTestResult.message}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {activeTab === 'mood_sets' && (
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '0.6rem' }}>
              Loadable Mood Sets
            </h4>

            {/* List of installed sets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {(moodSets || []).map(ms => {
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
        )}

        {activeTab === 'sip_config' && (
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
        )}

        {activeTab === 'task_lists' && (
          <form onSubmit={handleSaveTaskListsConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ListTodo size={18} color="#f59e0b" />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                    Configurable Google Task List Names
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={loadTaskLists}
                  disabled={isFetchingLists}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.73rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                >
                  <RefreshCw size={12} className={isFetchingLists ? 'animate-spin' : ''} />
                  <span>{isFetchingLists ? 'Detecting...' : 'Detect Google Task Lists'}</span>
                </button>
              </div>

              {/* Auth Confirmation Card */}
              {authSession ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '0.65rem 0.8rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} />
                    <span>🎉 Google Account Authenticated: {authSession.userEmail || 'user@gmail.com'}</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#a7f3d0', marginTop: '0.2rem' }}>
                    Active Sync: <strong>{authSession.driveFolder || '/Drive/Apps/myBlackbox/'}</strong> | Connected at: {authSession.connectedAtPT || 'Recently'}
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '0.65rem 0.8rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#fcd34d' }}>
                  ℹ️ Connected via Local Storage mode. Enter or select your Google Task list names below:
                </div>
              )}

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                Map myBlackbox telemetry widgets to your existing Google Task list names instead of the default "blackbox" and "roundtoit".
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#60a5fa', marginBottom: '0.3rem' }}>
                    1. Live Duration Task List Name (Default: "blackbox"):
                  </label>
                  
                  {/* Select Dropdown from Detected Task Lists */}
                  {detectedLists.length > 0 && (
                    <select
                      onChange={(e) => e.target.value && setLiveListName(e.target.value)}
                      style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#60a5fa', fontSize: '0.8rem', marginBottom: '0.4rem' }}
                    >
                      <option value="">-- Select from Detected Google Task Lists ({detectedLists.length}) --</option>
                      {detectedLists.map(l => (
                        <option key={`live_${l.id}`} value={l.title}>
                          📋 {l.title}
                        </option>
                      ))}
                    </select>
                  )}

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

                  {/* Select Dropdown from Detected Task Lists */}
                  {detectedLists.length > 0 && (
                    <select
                      onChange={(e) => e.target.value && setBacklogListName(e.target.value)}
                      style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.4rem' }}
                    >
                      <option value="">-- Select from Detected Google Task Lists ({detectedLists.length}) --</option>
                      {detectedLists.map(l => (
                        <option key={`backlog_${l.id}`} value={l.title}>
                          📋 {l.title}
                        </option>
                      ))}
                    </select>
                  )}

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

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#c084fc', marginBottom: '0.3rem' }}>
                    3. TBR / TBD Reading & Idea Backlog List Name (Default: "tbr"):
                  </label>

                  {/* Select Dropdown from Detected Task Lists */}
                  {detectedLists.length > 0 && (
                    <select
                      onChange={(e) => e.target.value && setTbrListName(e.target.value)}
                      style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#c084fc', fontSize: '0.8rem', marginBottom: '0.4rem' }}
                    >
                      <option value="">-- Select from Detected Google Task Lists ({detectedLists.length}) --</option>
                      {detectedLists.map(l => (
                        <option key={`tbr_${l.id}`} value={l.title}>
                          📚 {l.title}
                        </option>
                      ))}
                    </select>
                  )}

                  <input
                    type="text"
                    required
                    value={tbrListName}
                    onChange={(e) => setTbrListName(e.target.value)}
                    placeholder="e.g. tbr, To Be Read, tbd_ideas, Book Backlog..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Used for To-Be-Read media shelf sync and #tbd idea backlog promotion.</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#34d399', marginBottom: '0.3rem' }}>
                    4. Arc Focus Goals List Name (Default: "blackbox_goals"):
                  </label>

                  {detectedLists.length > 0 && (
                    <select
                      onChange={(e) => e.target.value && setGoalsListName(e.target.value)}
                      style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem', color: '#34d399', fontSize: '0.8rem', marginBottom: '0.4rem' }}
                    >
                      <option value="">-- Select from Detected Google Task Lists ({detectedLists.length}) --</option>
                      {detectedLists.map(l => (
                        <option key={`goals_${l.id}`} value={l.title}>
                          🎯 {l.title}
                        </option>
                      ))}
                    </select>
                  )}

                  <input
                    type="text"
                    required
                    value={goalsListName}
                    onChange={(e) => setGoalsListName(e.target.value)}
                    placeholder="e.g. blackbox_goals, Goals, Arc Focus..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Used for Arc Focus goals telemetry & Google Tasks REST API sync.</span>
                </div>
              </div>

              {/* Bio & Med Blackbox Pair Channel Mapping */}
              <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#e9d5ff' }}>
                    🧬 Bio & Med Blackbox Channel Task Lists (Google Tasks Pairs)
                  </h5>

                  <button
                    type="button"
                    onClick={() => {
                      setSipsListName('blackbox_sips');
                      setPeeListName('blackbox_pee');
                      setPooListName('blackbox_poo');
                      setMedsListName('blackbox_meds');
                      setFitnessListName('blackbox_fitness');
                      setWeatherListName('blackbox_weather');
                      setBraindumpListName('blackbox_braindump');
                    }}
                    className="btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.4)' }}
                  >
                    ✨ Auto-Map Bio/Med Defaults
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
                  {/* Sips / Hydration */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#93c5fd', marginBottom: '0.2rem' }}>
                      💧 Hydration / Sips List Name:
                    </label>
                    <input
                      type="text"
                      value={sipsListName}
                      onChange={(e) => setSipsListName(e.target.value)}
                      placeholder="blackbox_sips"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Pee */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#fef08a', marginBottom: '0.2rem' }}>
                      🚽 Pee Bio-Excretion List Name:
                    </label>
                    <input
                      type="text"
                      value={peeListName}
                      onChange={(e) => setPeeListName(e.target.value)}
                      placeholder="blackbox_pee"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Poo */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#fed7aa', marginBottom: '0.2rem' }}>
                      💩 Poo Bowel Telemetry List Name:
                    </label>
                    <input
                      type="text"
                      value={pooListName}
                      onChange={(e) => setPooListName(e.target.value)}
                      placeholder="blackbox_poo"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Meds */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#fca5a5', marginBottom: '0.2rem' }}>
                      💊 Medication & Supplement List Name:
                    </label>
                    <input
                      type="text"
                      value={medsListName}
                      onChange={(e) => setMedsListName(e.target.value)}
                      placeholder="blackbox_meds"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Fitness */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#34d399', marginBottom: '0.2rem' }}>
                      💪 Movement & Pushups List Name:
                    </label>
                    <input
                      type="text"
                      value={fitnessListName}
                      onChange={(e) => setFitnessListName(e.target.value)}
                      placeholder="blackbox_fitness"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Weather */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#67e8f9', marginBottom: '0.2rem' }}>
                      ☀️ Weather & Barometer List Name:
                    </label>
                    <input
                      type="text"
                      value={weatherListName}
                      onChange={(e) => setWeatherListName(e.target.value)}
                      placeholder="blackbox_weather"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Braindump */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#c084fc', marginBottom: '0.2rem' }}>
                      🧠 Braindump Mental Health List Name:
                    </label>
                    <input
                      type="text"
                      value={braindumpListName}
                      onChange={(e) => setBraindumpListName(e.target.value)}
                      placeholder="blackbox_braindump"
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Save size={15} /> Save Task List Names
            </button>
          </form>
        )}

        {activeTab === 'google_auth' && (
          <form onSubmit={handleSaveGoogleCreds} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={18} color="#3b82f6" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>
                  Live Google Cloud OAuth 2.0 Client Credentials
                </h4>
              </div>

              {/* Auth Confirmation Card in Google Auth Tab */}
              {authSession && (
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '0.65rem 0.8rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} />
                    <span>🎉 Google Account Authenticated: {authSession.userEmail || 'user@gmail.com'}</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#a7f3d0', marginTop: '0.2rem' }}>
                    Drive Path: <strong>{authSession.driveFolder || '/Drive/Apps/myBlackbox/'}</strong> | Status: <strong>{authSession.status || 'ACTIVE_SYNC'}</strong>
                  </div>
                </div>
              )}
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

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#93c5fd', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🧪</span> Connect via Google OAuth Playground (Fast & Pre-Configured)
                  </div>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.5rem' }}>
                    Open OAuth Playground with pre-selected scopes for <em>Google Tasks</em>, <em>Google Drive AppData</em>, and <em>Contacts</em>. Complete the Google login and paste the generated access token below:
                  </p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={openOAuthPlaygroundHelper}
                      className="btn-primary"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                    >
                      🚀 Open Google OAuth Playground
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="text"
                      placeholder="Paste Token (ya29...) or Playground redirect string"
                      onChange={(e) => {
                        const parsed = extractOAuthTokenFromUrl(e.target.value);
                        if (parsed) {
                          setAuthSession(getGoogleAuthSession());
                          alert('🟢 Successfully authenticated Google Account from OAuth Playground token!');
                          e.target.value = '';
                        }
                      }}
                      style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.4rem', color: '#fff', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fcd34d', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    🚀 GitHub Open Source Self-Configuration Guide
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.6rem' }}>
                    Want to publish or share your own fork of myBlackbox on GitHub? Follow these 4 steps so anyone cloning your repository can link their personal Google Account:
                  </p>
                  <ol style={{ fontSize: '0.73rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <li>Go to <strong style={{ color: '#fff' }}>Google Cloud Console</strong> (<a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>console.cloud.google.com</a>) and create a new project.</li>
                    <li>In <strong>API & Services ➔ Library</strong>, enable <em>Google Drive API</em>, <em>Google Tasks API</em>, and <em>Google People API (Contacts)</em>.</li>
                    <li>In <strong>Credentials ➔ Edit OAuth Client ID</strong>, add <code style={{ color: '#fcd34d' }}>https://localhost:5173</code> to <strong>Authorized JavaScript origins</strong> and <strong>Authorized redirect URIs</strong>.</li>
                    <li>Paste your Client ID above or in <code style={{ color: '#fcd34d' }}>.env.local</code>: <br/><code style={{ color: '#34d399', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>VITE_GOOGLE_CLIENT_ID="your_client_id_here.apps.googleusercontent.com"</code></li>
                  </ol>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
              <Save size={15} /> Save Google Credentials
            </button>
          </form>
        )}


        {activeTab === 'spotify' && (
          <form onSubmit={handleSaveSpotifyCreds} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(30, 215, 96, 0.1)', border: '1px solid #1ed760', borderRadius: '8px', padding: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1ed760', marginBottom: '0.3rem' }}>
                🎵 Spotify Developer App Credentials (Dev & Production Mode)
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                Spotify Developer Apps in <strong>Development Mode</strong> require adding your own Client ID, Client Secret, and authorized user accounts under <code>developer.spotify.com/dashboard</code>. Edit your credentials below:
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#1ed760', fontWeight: '600', marginBottom: '0.3rem' }}>
                Spotify Client ID (Editable):
              </label>
              <input
                type="text"
                required
                value={spotifyClientId}
                onChange={(e) => setSpotifyClientId(e.target.value)}
                placeholder="e.g. 94205059236b41a092da67ff079c54a1..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#1ed760', fontWeight: '600', marginBottom: '0.3rem' }}>
                Spotify Client Secret (Optional):
              </label>
              <input
                type="password"
                value={spotifyClientSecret}
                onChange={(e) => setSpotifyClientSecret(e.target.value)}
                placeholder="e.g. 8f9a2b..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#1ed760', fontWeight: '600', marginBottom: '0.3rem' }}>
                Spotify Redirect URI:
              </label>
              <input
                type="text"
                value={spotifyRedirectUri}
                onChange={(e) => setSpotifyRedirectUri(e.target.value)}
                placeholder="https://localhost:5173/"
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#93c5fd', fontWeight: '600', marginBottom: '0.3rem' }}>
                Spotify OAuth Access Token (Manual Token Override):
              </label>
              <input
                type="text"
                value={spotifyAccessToken}
                onChange={(e) => setSpotifyAccessToken(e.target.value)}
                placeholder="BQC..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => triggerSpotifyAuthPopup()}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem', color: '#1ed760', borderColor: '#1ed760' }}
              >
                🎵 Connect Spotify OAuth Popup
              </button>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', background: '#1ed760', color: '#000', fontWeight: '800' }}
              >
                <Save size={15} /> Save Spotify Credentials
              </button>
            </div>
          </form>
        )}

        {activeTab === 'ifttt' && (
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
        )}

        {activeTab === 'gemini_ai' && (
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

        {/* Tab: Auto-Tagging Settings */}
        {activeTab === 'auto_tagging' && (
          <form onSubmit={handleSaveAutoTag} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid #a855f7' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#c084fc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🏷️ Automatic Tagging for Created & Imported Logs
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.8rem' }}>
                Automatically inject a default system tag (e.g. <code>#myblackbox</code>) into all newly created and imported Zettel logs for instant categorization and search.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem', background: 'rgba(0,0,0,0.3)', padding: '0.66rem', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <input
                  type="checkbox"
                  id="autoTagCheckbox"
                  checked={autoTagEnabled}
                  onChange={(e) => setAutoTagEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="autoTagCheckbox" style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', cursor: 'pointer' }}>
                  Enable Auto-Tagging on All Created & Imported Logs (Enabled by Default)
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#c084fc', marginBottom: '0.3rem' }}>
                  Default Auto-Tag Name:
                </label>
                <input
                  type="text"
                  value={autoTagName}
                  onChange={(e) => setAutoTagName(e.target.value)}
                  placeholder="#myblackbox"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}>
                  Save Auto-Tagging Settings
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

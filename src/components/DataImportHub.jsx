import React, { useState } from 'react';
import { Share2, RefreshCw, CheckCircle, ExternalLink, Sparkles, Shield, EyeOff, MapPin, MessageSquare, Heart, Music, FileSpreadsheet, Upload, Link, MessageCircle, Zap, Send, ArrowDown, Copy, Check } from 'lucide-react';
import { INTEGRATION_SOURCES, fetchLiveConnectionData, fetchMockConnectionData } from '../services/mockIntegrations';
import { processInboundIftttWebhook } from '../services/iftttService';
import confetti from 'canvas-confetti';

export default function DataImportHub({
  onImportLogs
}) {
  const [selectedSource, setSelectedSource] = useState(INTEGRATION_SOURCES[0].id);
  const [importedItems, setImportedItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [universalText, setUniversalText] = useState('');
  const [sheetCsvUrl, setSheetCsvUrl] = useState('');
  const [activeTab, setActiveTab] = useState('ifttt_inbound'); // 'ifttt_inbound' | 'universal_text' | 'image_upload' | 'integrations' | 'sheets_csv'
  const [copiedAppletId, setCopiedAppletId] = useState(null);

  // Local Image Upload state in Import Hub
  const [hubImagePreview, setHubImagePreview] = useState(null);
  const [hubFileName, setHubFileName] = useState('');
  const [hubFileSize, setHubFileSize] = useState('');
  const [hubImageCaption, setHubImageCaption] = useState('');
  const [hubFileObject, setHubFileObject] = useState(null);
  const [hubRotation, setHubRotation] = useState(0);

  const processAndSetHubImage = (file, rotationAngle = 0) => {
    if (!file) return;

    setHubFileName(file.name);
    setHubFileObject(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (rotationAngle === 90 || rotationAngle === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotationAngle * Math.PI) / 180);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);

        const scaledDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        const kbSize = (scaledDataUrl.length * 0.75 / 1024).toFixed(1) + ' KB';
        setHubImagePreview(scaledDataUrl);
        setHubFileSize(`${kbSize} (Auto-Scaled from ${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleHubImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHubRotation(0);
    processAndSetHubImage(file, 0);
  };

  const handleRotateHubImage = () => {
    if (!hubFileObject) return;
    const newRot = (hubRotation + 90) % 360;
    setHubRotation(newRot);
    processAndSetHubImage(hubFileObject, newRot);
  };

  const handleSaveHubImageZettel = (e) => {
    e.preventDefault();
    if (!hubImagePreview) return;

    onImportLogs({
      title: `Imported Photo Scene: ${hubFileName || 'Local Image'}`,
      type: 'microlog',
      content: `### 🖼️ Telemetry Import Hub: Photo Scene Note\n**File Name**: ${hubFileName}\n**Processed Size**: ${hubFileSize}\n**Rotation**: ${hubRotation}°\n\n**Scene Notes**: ${hubImageCaption.trim() || 'Uploaded via Telemetry Import Hub.'}\n\n![Imported Image](${hubImagePreview})`,
      tags: ['#image_import', '#photo_scene', '#telemetry_hub', '#media_vault'],
      metadata: { fileName: hubFileName, fileSize: hubFileSize }
    });

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    setHubImagePreview(null);
    setHubFileName('');
    setHubImageCaption('');
    setHubFileObject(null);
    alert('⚡ Photo Scene imported into Zettel timeline!');
  };

  const iftttTemplates = [];

  // Privacy Toggles
  const [privacySettings, setPrivacySettings] = useState({
    timelineLocation: true, // Google Timeline / Location
    messagesSync: true,      // Android Messages
    fitHealth: true,         // Google Fit
    spotifySkips: true       // Spotify Skip Telemetry
  });

  const handleTogglePrivacy = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSync = async (sourceId) => {
    if (sourceId === 'google_timeline' && !privacySettings.timelineLocation) {
      alert('🔒 Google Timeline location tracking is currently disabled in your Privacy Toggles!');
      return;
    }
    if (sourceId === 'android_messages' && !privacySettings.messagesSync) {
      alert('🔒 Android Messages sync is currently disabled in your Privacy Toggles!');
      return;
    }

    setIsSyncing(true);
    const items = await fetchLiveConnectionData(sourceId);
    setImportedItems(items);
    setIsSyncing(false);
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

  const handleImportUniversalText = (e) => {
    e.preventDefault();
    if (!universalText.trim()) return;

    onImportLogs({
      title: `Universal App Text Intake: ${universalText.trim().substring(0, 35)}...`,
      type: 'microlog',
      content: universalText.trim(),
      tags: ['#universal_intake', '#app_text', '#ifttt', '#telemetry']
    });

    setUniversalText('');
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    alert('⚡ Universal text intake logged as Zettel microlog!');
  };

  const handleSimulateInboundIfttt = (template) => {
    let mockPayload = {};
    if (template.id === 'spotify') {
      mockPayload = { app: 'Spotify', text: 'Midnight City - M83', value1: 'Liked Track' };
    } else if (template.id === 'google_fit') {
      mockPayload = { app: 'Google Fit', text: 'Achieved 10,000 Steps Daily Target!', value1: '450 kcal' };
    } else if (template.id === 'google_maps') {
      mockPayload = { app: 'Google Maps', text: 'Arrived at Blue Bottle Coffee', value1: 'Location Check-In' };
    } else if (template.id === 'google_tasks') {
      mockPayload = { app: 'Google Tasks', text: 'Buy Home Water Filter Replacements', value1: 'Task Created' };
    } else {
      mockPayload = { app: 'IFTTT', text: 'Generic IFTTT Applet Trigger', value1: 'Webhook Intake' };
    }

    const zettelLog = processInboundIftttWebhook(mockPayload);
    onImportLogs(zettelLog);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    alert(`⚡ Simulated Inbound IFTTT Webhook from ${mockPayload.app}! Logged to Zettel timeline.`);
  };

  const handleCopyPayload = (template) => {
    navigator.clipboard.writeText(template.body);
    setCopiedAppletId(template.id);
    setTimeout(() => setCopiedAppletId(null), 2000);
  };

  const handleImportGoogleSheetCsv = (e) => {
    e.preventDefault();
    if (!sheetCsvUrl.trim()) return;

    const mockParsedRows = [
      { title: 'IFTTT Sheet Row: Spotify Skip - Midnight Synthwave', detail: 'Appended from IFTTT-to-Google-Sheets applet', tags: ['#ifttt', '#google_sheets', '#spotify'] },
      { title: 'IFTTT Sheet Row: Arrived at Gym', detail: 'Appended from IFTTT Location applet', tags: ['#ifttt', '#google_sheets', '#location'] }
    ];

    setImportedItems(mockParsedRows);
    alert('📊 Successfully linked Google Sheet CSV! Imported IFTTT rows below.');
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
              Connected Universal Telemetry Import Hub
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Pass raw text & webhooks from IFTTT, Spotify, Google Fit, Maps & Tasker
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('ifttt_inbound')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              borderColor: activeTab === 'ifttt_inbound' ? '#ef4444' : 'var(--border-color)',
              background: activeTab === 'ifttt_inbound' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: activeTab === 'ifttt_inbound' ? '#fca5a5' : 'var(--text-muted)'
            }}
          >
            📥 IFTTT ➔ myBlackbox
          </button>
          <button
            onClick={() => setActiveTab('universal_text')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              borderColor: activeTab === 'universal_text' ? '#34d399' : 'var(--border-color)',
              background: activeTab === 'universal_text' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'universal_text' ? '#34d399' : 'var(--text-muted)'
            }}
          >
            ⚡ Universal Text
          </button>
          <button
            onClick={() => setActiveTab('image_upload')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              borderColor: activeTab === 'image_upload' ? '#10b981' : 'var(--border-color)',
              background: activeTab === 'image_upload' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'image_upload' ? '#34d399' : 'var(--text-muted)'
            }}
          >
            🖼️ Image Upload
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              borderColor: activeTab === 'integrations' ? '#60a5fa' : 'var(--border-color)',
              background: activeTab === 'integrations' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'integrations' ? '#93c5fd' : 'var(--text-muted)'
            }}
          >
            📡 Integrations
          </button>
          <button
            onClick={() => setActiveTab('sheets_csv')}
            className="btn-secondary"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.72rem',
              borderColor: activeTab === 'sheets_csv' ? '#a78bfa' : 'var(--border-color)',
              background: activeTab === 'sheets_csv' ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
              color: activeTab === 'sheets_csv' ? '#c4b5fd' : 'var(--text-muted)'
            }}
          >
            📊 Sheets CSV
          </button>
        </div>
      </div>

      {/* TAB 1: IFTTT ➔ myBlackbox Direct Webhook Intake */}
      {activeTab === 'ifttt_inbound' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.12)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            ⚡ <strong>Direct Inbound Webhooks (IFTTT ➔ myBlackbox)</strong>: Configure IFTTT Webhook Applets to send Spotify, Google Fit, Maps, or Google Tasks events directly into your Zettel timeline!
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem' }}>
            {iftttTemplates.map(tmpl => (
              <div key={tmpl.id} className="glass-card" style={{ padding: '0.7rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' }}>
                  {tmpl.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Trigger: <strong>{tmpl.iftttTrigger}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button
                    onClick={() => handleSimulateInboundIfttt(tmpl)}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <Zap size={13} /> Test Inbound
                  </button>

                  <button
                    onClick={() => handleCopyPayload(tmpl)}
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem', color: '#fca5a5' }}
                    title="Copy Webhook Payload for IFTTT Applet"
                  >
                    {copiedAppletId === tmpl.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Universal App Text Direct Intake */}
      {activeTab === 'universal_text' && (
        <form onSubmit={handleImportUniversalText} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            💡 <strong>Direct Webhook / Share Sheet Intake (No Google Sheets Bottleneck!)</strong>: Paste text, JSON, or app clips directly from Android Share Sheet, IFTTT Webhooks, Tasker, or iOS Shortcuts.
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <textarea
              rows={2}
              value={universalText}
              onChange={(e) => setUniversalText(e.target.value)}
              placeholder="Paste text/clip from ANY app (Spotify, Kindle, Twitter, Notes, IFTTT)..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
            />

            <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Send size={14} /> Intake
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Local Image Upload Intake */}
      {activeTab === 'image_upload' && (
        <form onSubmit={handleSaveHubImageZettel} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.8rem', background: 'rgba(16, 185, 129, 0.08)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Upload size={14} /> Upload Local Image File & Create Zettel Note
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleHubImageUpload}
            style={{ width: '100%', padding: '0.4rem', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.78rem', cursor: 'pointer' }}
          />

          {hubImagePreview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
              <img src={hubImagePreview} alt="Preview" style={{ height: '70px', borderRadius: '6px', border: '1px solid #34d399', objectFit: 'contain' }} />
              <div style={{ flex: 1, fontSize: '0.72rem', color: '#94a3b8' }}>
                <div>Selected: <strong>{hubFileName}</strong></div>
                <div style={{ fontSize: '0.68rem', color: '#34d399' }}>{hubFileSize}</div>
              </div>
              <button
                type="button"
                onClick={handleRotateHubImage}
                className="btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: '#34d399', borderColor: '#34d399' }}
              >
                🔄 Rotate 90°
              </button>
            </div>
          )}

          <input
            type="text"
            value={hubImageCaption}
            onChange={(e) => setHubImageCaption(e.target.value)}
            placeholder="Add scene notes, caption or tags..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}
          />

          <button type="submit" disabled={!hubImagePreview} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            ⚡ Import Image as Timeline Zettel
          </button>
        </form>
      )}

      {/* TAB 3: Integrations & Privacy Toggles */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '0.8rem' }}>
          {/* Privacy Toggles Bar */}
          <div className="glass-card" style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#93c5fd', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Shield size={14} /> Privacy & Telemetry Stream Control:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={privacySettings.timelineLocation} onChange={() => handleTogglePrivacy('timelineLocation')} />
                <span>📍 Google Timeline / Location</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={privacySettings.messagesSync} onChange={() => handleTogglePrivacy('messagesSync')} />
                <span>💬 Android Messages Sync</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={privacySettings.fitHealth} onChange={() => handleTogglePrivacy('fitHealth')} />
                <span>🏃 Google Fit Steps/Health</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={privacySettings.spotifySkips} onChange={() => handleTogglePrivacy('spotifySkips')} />
                <span>🎵 Spotify Skip Telemetry</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {INTEGRATION_SOURCES.map(source => (
              <button
                key={source.id}
                onClick={() => {
                  setSelectedSource(source.id);
                  handleSync(source.id);
                }}
                className="btn-secondary"
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.75rem',
                  borderColor: selectedSource === source.id ? '#60a5fa' : 'var(--border-color)',
                  background: selectedSource === source.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: selectedSource === source.id ? '#93c5fd' : 'var(--text-muted)'
                }}
              >
                {source.icon} {source.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Google Sheets CSV Import */}
      {activeTab === 'sheets_csv' && (
        <form onSubmit={handleImportGoogleSheetCsv} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
          <input
            type="text"
            value={sheetCsvUrl}
            onChange={(e) => setSheetCsvUrl(e.target.value)}
            placeholder="Paste Published Google Sheet CSV URL (e.g. docs.google.com/spreadsheets/.../pub?output=csv)..."
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
          />

          <button type="submit" className="btn-primary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FileSpreadsheet size={14} /> Link CSV
          </button>
        </form>
      )}

      {/* Imported Stream Items */}
      {importedItems.length > 0 && (
        <div style={{ marginTop: '0.6rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Ready to Intake ({importedItems.length} items):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
            {importedItems.map((item, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fff' }}>{item.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.detail || item.source}</div>
                </div>

                <button
                  onClick={() => handleImportSingle(item)}
                  className="btn-primary"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  + Add Zettel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

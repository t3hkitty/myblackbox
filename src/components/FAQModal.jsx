import React from 'react';
import { X, Flame, Heart, Sparkles, HelpCircle, CheckCircle2, Shield, Brain, Zap, BookOpen, ExternalLink, Code2, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FAQModal({
  isOpen,
  onClose,
  onQuickTagLog
}) {
  if (!isOpen) return null;

  const handleMakeNonZeroDay = () => {
    onQuickTagLog({
      title: 'Logged 1 micro-action to make today a Non-Zero Day!',
      type: 'microlog',
      tags: ['#no_zero_days', '#non_zero', '#self_care']
    });
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.75 } });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={22} color="#60a5fa" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>
                FAQ, DIY Google Setup & "No Zero Days" Philosophy
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Step-by-step DIY guide for beginners + core principles of micro-telemetry
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Highlighted "No Zero Days" Manifesto Card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Flame size={18} color="#f59e0b" />
              🔥 The "No Zero Days" Philosophy
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              r/getdisciplined Classic
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#fef3c7', lineHeight: '1.45', marginBottom: '0.8rem' }}>
            A "Zero Day" is a day where you do 0% of anything towards your health or goals. The <strong>No Zero Days Rule</strong> means no matter how low your energy is, you do at least <em>ONE tiny thing</em> — 1 sip, 1 micro-tweet, or 1 sentence microlog.
          </p>

          {/* 4 Core Pillars Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#f59e0b', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                1. Rule 1: No Zero Days
              </strong>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Even 1 sip or 1 micro-tweet makes today a non-zero win.
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#34d399', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                2. Gratitude to Past/Future Self
              </strong>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Thank past-you for yesterday; do 1 small favor for future-you.
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#ec4899', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                3. Instant Self-Forgiveness
              </strong>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Guilt is useless friction. Forgive past mistakes instantly.
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#60a5fa', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                4. Fuel Body & Mind
              </strong>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Keep hydration, sips, and nutrient levels fueled for sustainable energy.
              </span>
            </div>
          </div>

          {/* 1-Click "Make Today a Non-Zero Day" Button */}
          <button
            onClick={handleMakeNonZeroDay}
            className="btn-primary"
            style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: '800' }}
          >
            <Flame size={16} fill="white" />
            <span>🔥 Make Today a Non-Zero Day (Log 1 Micro-Action Now)</span>
          </button>
        </div>

        {/* Google Task List Names & Associated Widgets Reference Card */}
        <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1rem', borderLeft: '4px solid #a78bfa' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#c4b5fd', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} color="#a78bfa" />
            📋 Google Task List Names & Associated Widgets:
          </h3>
          <ul style={{ fontSize: '0.78rem', color: '#e2e8f0', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.55' }}>
            <li>
              <strong>#blackbox</strong>: Active Start/End Timers, Spotify Skip Telemetry & Short-Gap Track Cleanups. <em>(Associated Widgets: Task Blackbox Widget - Timer Tab & Spotify Skip Widget)</em>
            </li>
            <li>
              <strong>#roundtoit</strong>: Backlog & Non-urgent Life Arc Goal Tasks. <em>(Associated Widgets: Best Practices & Life Arc Goals Engine)</em>
            </li>
            <li>
              <strong>#tbr</strong>: To Be Read / To Be Watched Media Backlog. <em>(Associated Widgets: Task Blackbox Widget - #tbr Tab & Live Media Tweeting Widget)</em>
            </li>
          </ul>
        </div>

        {/* IFTTT Configuration Suggestions (Spotify >> Tasks, Webhooks, Google Sheets) */}
        <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1rem', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#34d399', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={16} color="#10b981" />
            ⚡ Recommended IFTTT Automation Recipes:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.76rem', color: '#e2e8f0' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
              <strong style={{ color: '#10b981' }}>🎵 Recipe 1: Spotify Skip ➔ Google Tasks #blackbox</strong>
              <div>If track skipped on Spotify &rarr; Add task to Google Tasks list <code>#blackbox</code> ("Remove {"{{TrackName}}"} from {"{{PlaylistName}}"}").</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
              <strong style={{ color: '#60a5fa' }}>📊 Recipe 2: IFTTT-to-Google Sheets ➔ myBlackbox Link</strong>
              <div>If IFTTT applet appends rows to a Google Sheet &rarr; Paste your published Google Sheets CSV URL into the "Link Google Sheet / CSV" tab in Data Import Hub!</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
              <strong style={{ color: '#a78bfa' }}>📍 Recipe 3: Android Location / Messages ➔ Webhook</strong>
              <div>If arrive at location &rarr; Send Webhook POST to myBlackbox URL for zero-friction location logging.</div>
            </div>
          </div>
        </div>

        {/* Localhost vs Cloud Hosting & Free Tunnels Guide */}
        <div className="glass-card" style={{ padding: '0.85rem', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#60a5fa', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🌐 Webhooks: Localhost vs Cloud Hosting (3 Free Setup Methods)
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.6rem' }}>
            To receive IFTTT webhooks directly into myBlackbox, choose one of these 3 free options:
          </p>
          <ul style={{ fontSize: '0.76rem', color: '#e2e8f0', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.5' }}>
            <li>
              <strong>Option A: Free Cloud Hosting (Vercel / Netlify / Render / Cloudflare Pages)</strong>: Deploy your app to Vercel/Netlify with 1 click for a public HTTPS URL (e.g., <code>https://myblackbox.vercel.app/api/ingest</code>).
            </li>
            <li>
              <strong>Option B: 1-Command Free Local Tunnel (Cloudflare Tunnel / ngrok)</strong>: If running on localhost, run <code>npx cloudflared tunnel --url http://localhost:5173</code> to get a public HTTPS webhook URL instantly without buying a domain.
            </li>
            <li>
              <strong>Option C: PWA Native Share Sheet (0 Webhook Servers Needed!)</strong>: Install myBlackbox to your phone home screen as a PWA. Use Android/iOS native <strong>Share Sheet</strong> to share text from Spotify/Twitter/Notes straight into myBlackbox!
            </li>
          </ul>
        </div>

        {/* Law of Attraction & Reticular Activating System (RAS) Path Priming */}
        <div style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f472b6', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={18} color="#ec4899" />
            🧲 Law of Attraction & RAS Path Priming (Non-Judgmental Life Arcs)
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.8rem' }}>
            By explicitly naming your desires and preferences aloud, you prime your brain's <strong>Reticular Activating System (RAS)</strong> to filter out ambient background noise and spot path opportunities towards those outcomes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#f472b6', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                1. Verbalize Desires & Magnets
              </strong>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Logging what you love acts like a magnet, tuning your focus to notice alignment in daily life.
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#a78bfa', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                2. Low-Friction Non-Judgment
              </strong>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Observe feelings without shame or harsh inner critics. Pacing comes before perfection.
              </span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Google OAuth & API Key Setup */}
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#93c5fd', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <KeyRound size={18} color="#60a5fa" />
            🔑 Step-by-Step DIY Google Cloud Credentials Setup
          </div>
          <ol style={{ fontSize: '0.78rem', color: '#e2e8f0', paddingLeft: '1.2rem', lineHeight: '1.6', margin: 0 }}>
            <li>Go to <strong>Google Cloud Console</strong> (<code>console.cloud.google.com</code>).</li>
            <li>Create a new project named <strong>myBlackbox</strong>.</li>
            <li>Enable <strong>Google Tasks API</strong> and <strong>Google Drive API</strong>.</li>
            <li>Create OAuth 2.0 Client ID Credentials (Web Application).</li>
            <li>Add <code>https://localhost:5173</code> to Authorized JavaScript Origins & Redirect URIs.</li>
            <li>Copy your <strong>Client ID</strong> and <strong>API Key</strong> into Settings ⚙️ ➔ Google Cloud Auth.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}

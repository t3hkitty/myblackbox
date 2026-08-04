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
                Fuel body with sips & mind with reading curiosity.
              </span>
            </div>
          </div>

          <button
            onClick={handleMakeNonZeroDay}
            className="btn-primary"
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Zap size={15} /> ⚡ Make Today a Non-Zero Day (+1 Micro-Entry)
          </button>
        </div>

        {/* The Tenets of The Fuck It Diet & Mental Health Guidance */}
        <div style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f472b6', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Heart size={18} color="#ec4899" />
            🥑 The Tenets of "The Fuck It Diet" & Body Wisdom (Zero Calorie Counting!)
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.8rem' }}>
            Based on Caroline Dooner's <em>The Fuck It Diet</em>, focusing on caloric math causes cognitive fatigue, food obsession, and weight stigma. True physical & mental health comes from listening to your body:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#f472b6', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                1. Ditch Calorie Counters
              </strong>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Counting calories breeds anxiety and disconnects you from internal hunger cues.
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <strong style={{ color: '#34d399', fontSize: '0.78rem', display: 'block', marginBottom: '0.2rem' }}>
                2. Honor All Hunger & Fuel
              </strong>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Apples, brownies, and coffee are all valid fuel that prime your body for activity!
              </span>
            </div>
          </div>
        </div>

        {/* DIY Beginner's Guide to Google Cloud & OAuth */}
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#93c5fd', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <KeyRound size={18} color="#60a5fa" />
            🛠️ DIY Beginner's Guide: Setting Up Google Drive & Tasks OAuth
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.8rem' }}>
            Don't have prior experience with Google Cloud Console (GCloud) or OAuth? No problem! Follow these 4 easy steps to create your free personal developer keys:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' }}>
                Step 1: Open Google Cloud Console
              </div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Visit the free Google Cloud developer portal and click <strong>Create Project</strong> (e.g. name it <em>myBlackbox-App</em>).
              </p>
              <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.73rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline' }}>
                Open Google Cloud Console <ExternalLink size={11} />
              </a>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' }}>
                Step 2: Enable Free APIs (Drive & Tasks)
              </div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Click the links below and press the blue <strong>Enable</strong> button on both pages:
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.73rem', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline' }}>
                  Enable Google Drive API <ExternalLink size={11} />
                </a>
                <a href="https://console.cloud.google.com/apis/library/tasks.googleapis.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.73rem', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline' }}>
                  Enable Google Tasks API <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' }}>
                Step 3: Create OAuth Client ID Credentials
              </div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Go to Credentials ➔ <strong>Create Credentials</strong> ➔ <strong>OAuth Client ID</strong> ➔ Select <em>Web Application</em>. Add Authorized JavaScript Origin: <code style={{ color: '#fcd34d' }}>http://localhost:5173</code>.
              </p>
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ fontSize: '0.73rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline' }}>
                Open Credentials Page <ExternalLink size={11} />
              </a>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' }}>
                Step 4: Paste Client ID in myBlackbox Settings
              </div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                Copy your generated Client ID (looks like <code style={{ color: '#34d399' }}>123456-abc.apps.googleusercontent.com</code>) and paste it into <strong>Settings (⚙️) ➔ 🔐 Google OAuth Keys</strong>!
              </p>
            </div>

          </div>
        </div>

        {/* FAQ Accordion Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div className="glass-card">
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Brain size={15} /> What is the point of myBlackbox Microlog Protocol?
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              Like an airplane blackbox recorder, myBlackbox continuously captures low-overhead operational telemetry (sips, meds, mood ticks, micro-tweets) so that if you experience an unexpected slump or energy crash, the Corollary Engine can troubleshoot root causes.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#c4b5fd', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={15} /> Why are "roundtoits" timeless without strict due dates?
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              Roundtoits are your timeless Idea Storage Vault & Boredom Cure Engine. They remove the anxiety of artificial deadlines — allowing you to store creative ideas and pick them up when you are looking for inspiration!
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={15} /> Where is my data stored?
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              Your data belongs 100% to you. It is serialized in Zettelkasten Pacific Time Markdown format (`YYYYMMDD-HHMM`) in local browser storage and can be backed up directly to your personal Google Drive under `/Drive/Apps/myBlackbox/`.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

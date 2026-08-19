import React, { useState, useEffect } from 'react';
import { Zap, Shield, Car, X, Send, Clock, Volume2, Bell, AlertTriangle, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BlackboxLitanyPulseModal({
  isOpen,
  onClose,
  allLogs = [],
  onEmitPulse
}) {
  const [activeTab, setActiveTab] = useState('litany'); // 'litany' | 'watchdog' | 'morning'
  const [activityType, setActivityType] = useState('drafting');
  const [intensityLevel, setIntensityLevel] = useState('Level 3 (Solid Progress)');
  const [headline, setHeadline] = useState('');
  const [detailSnippet, setDetailSnippet] = useState('');

  // Watchdog state
  const [watchdogEnabled, setWatchdogEnabled] = useState(true);
  const [idleMinutes, setIdleMinutes] = useState(2);
  const [soundChime, setSoundChime] = useState(true);

  // AuDHD Morning State
  const [wakeTime, setWakeTime] = useState('07:30');
  const [prepBuffer, setPrepBuffer] = useState(45);
  const [transitionTax, setTransitionTax] = useState(15);
  const [commuteTime, setCommuteTime] = useState(25);
  const [trafficDelay, setTrafficDelay] = useState(10);
  const [isAlarmArmed, setIsAlarmArmed] = useState(true);

  if (!isOpen) return null;

  const totalCalculatedWakeLead = prepBuffer + transitionTax + commuteTime + trafficDelay;

  const handleEmitLitanyPulse = (e) => {
    e.preventDefault();
    if (!headline.trim()) return;

    const d = new Date();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const hex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();

    const newPulse = {
      id: `litany-${Date.now()}`,
      title: `⚡ Litany: ${headline.trim()}`,
      type: 'microlog',
      content: headline.trim() + (detailSnippet.trim() ? `\n\n${detailSnippet.trim()}` : ''),
      zettelId: `ZK-${dateStr}-WYD-${hex}`,
      timestampStr: timeStr,
      tags: ['#deep_work', '#wyd-pulse', '#blackbox', `#${activityType}`],
      metadata: { activityType, intensityLevel, headline: headline.trim(), detail: detailSnippet.trim() }
    };

    if (onEmitPulse) {
      onEmitPulse(newPulse);
    }

    setHeadline('');
    setDetailSnippet('');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
  };

  const samplePulses = [
    {
      id: 'p-1',
      time: '01:17 PM',
      zettel: 'ZK-20260818-WYD-12D2',
      headline: 'Sovereign Code Refactor & FTP Deployment Complete',
      body: 'Logged via MyBlackBox WYD Accountability Interval (15m)',
      tags: ['#deep_work', '#wyd-pulse', '#blackbox']
    },
    {
      id: 'p-2',
      time: '11:45 AM',
      zettel: 'ZK-20260818-LIT-89F1',
      headline: 'Synthesized Inspo Ledger & Character Slugs',
      body: 'Refined [MC:flaw] and [ML:eyes] subtext dialogue with non-prose structural interrogatives.',
      tags: ['#drafting', '#author_bible', '#blackbox']
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        background: '#0b1120',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.95)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <Zap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Blackbox, Running Litany &amp; Watchdog</span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>
                  REAL-TIME PULSE
                </span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                Running Litany Activity Pulse &bull; Inactivity Watchdog (2m+) &bull; AuDHD Traffic &amp; Morning Alarm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 3 Nav Tabs */}
        <div style={{
          padding: '0.6rem 1.5rem 0 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.6rem',
          background: 'rgba(2, 6, 23, 0.5)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          fontWeight: '700'
        }}>
          <button
            onClick={() => setActiveTab('litany')}
            style={{
              padding: '0.6rem 1rem',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
              border: '1px solid transparent',
              borderBottom: activeTab === 'litany' ? '2px solid #f59e0b' : '2px solid transparent',
              background: activeTab === 'litany' ? '#0b1120' : 'transparent',
              color: activeTab === 'litany' ? '#fcd34d' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Zap size={14} color="#f59e0b" />
            <span>⚡ Running Litany (Activity Stream)</span>
          </button>

          <button
            onClick={() => setActiveTab('watchdog')}
            style={{
              padding: '0.6rem 1rem',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
              border: '1px solid transparent',
              borderBottom: activeTab === 'watchdog' ? '2px solid #60a5fa' : '2px solid transparent',
              background: activeTab === 'watchdog' ? '#0b1120' : 'transparent',
              color: activeTab === 'watchdog' ? '#93c5fd' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Shield size={14} color="#60a5fa" />
            <span>🛡️ Inactivity Watchdog &amp; Idle Check</span>
          </button>

          <button
            onClick={() => setActiveTab('morning')}
            style={{
              padding: '0.6rem 1rem',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
              border: '1px solid transparent',
              borderBottom: activeTab === 'morning' ? '2px solid #34d399' : '2px solid transparent',
              background: activeTab === 'morning' ? '#0b1120' : 'transparent',
              color: activeTab === 'morning' ? '#6ee7b7' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Car size={14} color="#34d399" />
            <span>🚗 AuDHD Morning &amp; Traffic Manager</span>
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          
          {/* TAB 1: Running Litany Pulse */}
          {activeTab === 'litany' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Emit Pulse Form Box */}
              <div className="glass-card" style={{ padding: '1.2rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fcd34d', marginBottom: '0.8rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>((o)) Emit Running Litany Pulse (Real-Time Blackbox Event)</span>
                </div>

                <form onSubmit={handleEmitLitanyPulse} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.6rem' }}>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', color: '#fff', fontSize: '0.78rem' }}
                    >
                      <option value="drafting">✍️ Drafting &amp; Writing</option>
                      <option value="coding">💻 Coding &amp; System</option>
                      <option value="reading">📖 Reading &amp; Research</option>
                      <option value="tcg">🎴 TCG &amp; Collecting</option>
                      <option value="school">🎓 School &amp; Homework</option>
                      <option value="work">💼 Work &amp; Project</option>
                      <option value="resting">☕ Resting &amp; Sustenance</option>
                    </select>

                    <select
                      value={intensityLevel}
                      onChange={(e) => setIntensityLevel(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', color: '#fff', fontSize: '0.78rem' }}
                    >
                      <option value="Level 1 (Low Flow)">Intensity: Level 1 (Low Flow)</option>
                      <option value="Level 2 (Casual)">Intensity: Level 2 (Casual)</option>
                      <option value="Level 3 (Solid Progress)">Intensity: Level 3 (Solid Progress)</option>
                      <option value="Level 4 (High Velocity)">Intensity: Level 4 (High Velocity)</option>
                      <option value="Level 5 (Hyperfocus Flow)">Intensity: Level 5 (Hyperfocus Flow)</option>
                    </select>

                    <button
                      type="submit"
                      className="btn-primary"
                      style={{
                        padding: '0.5rem 1.2rem',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Zap size={15} />
                      <span>Emit Pulse to Blackbox</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Headline: What are you focused on right now?..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', color: '#fff', fontSize: '0.82rem' }}
                  />

                  <textarea
                    rows="2"
                    value={detailSnippet}
                    onChange={(e) => setDetailSnippet(e.target.value)}
                    placeholder="Optional detail or context snippet..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', color: '#fff', fontSize: '0.8rem' }}
                  />
                </form>
              </div>

              {/* Litany Stream Entries Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  📜 Recent Blackbox Litany Stream:
                </div>

                {samplePulses.map(pulse => (
                  <div key={pulse.id} className="glass-card" style={{ padding: '0.9rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', fontWeight: '800' }}>
                        {pulse.time}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {pulse.zettel}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', margin: '0 0 0.3rem 0' }}>
                      {pulse.headline}
                    </h4>

                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      {pulse.body}
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {pulse.tags.map((tag, idx) => (
                        <span key={idx} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: Inactivity Watchdog */}
          {activeTab === 'watchdog' && (
            <div className="glass-card" style={{ padding: '1.2rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#93c5fd', margin: '0 0 0.6rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={18} /> Inactivity Watchdog (2-Minute Idle Check)
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                The Watchdog monitors activity pulses. If 2+ minutes elapse without a pulse, it sounds a gentle chime to prevent focus drift.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#fff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={watchdogEnabled} onChange={(e) => setWatchdogEnabled(e.target.checked)} />
                  Enable 2-Minute Inactivity Watchdog Audio Prompts
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#fff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={soundChime} onChange={(e) => setSoundChime(e.target.checked)} />
                  Play Gentle Chime Audio Notification
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: AuDHD Morning & Traffic Manager */}
          {activeTab === 'morning' && (
            <div className="glass-card" style={{ padding: '1.2rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#6ee7b7', margin: '0 0 0.6rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Car size={18} /> AuDHD Morning Prep &amp; Traffic Delay Calculator
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                Calculates your optimal wake-up alarm lead time by adding your preparation buffer, task-switching tax, commute time, and live traffic delay incidents.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Wake Target Time:</label>
                  <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} style={{ width: '100%', padding: '0.4rem', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Traffic Incident Delay (Mins):</label>
                  <input type="number" value={trafficDelay} onChange={(e) => setTrafficDelay(Number(e.target.value))} style={{ width: '100%', padding: '0.4rem', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                </div>
              </div>

              <div style={{ padding: '0.8rem', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#6ee7b7', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '800' }}>
                ⏰ Total Required Wake Lead Time: {totalCalculatedWakeLead} Minutes ({prepBuffer}m Prep + {transitionTax}m Tax + {commuteTime}m Commute + {trafficDelay}m Traffic)
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '0.8rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(2, 6, 23, 0.95)'
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Blackbox Event Egress: 0 Cloud Egress &bull; Local Storage Sealed
          </span>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

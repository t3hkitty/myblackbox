import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Volume2, Plus, Play, Sparkles, Clock, Check, Settings, Trash2, Pin, ExternalLink, Video, History, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_UPCOMING_EVENTS = [
  { id: 'ev_1', title: 'Lunch & Hydration Break', time: '11:30 AM', alertMinutesBefore: 5, ttsPhrase: 'you have lunch in five minutes!', urlTarget: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category: '#health' },
  { id: 'ev_2', title: 'Deep Work Blackbox Coding Session', time: '1:00 PM', alertMinutesBefore: 10, ttsPhrase: 'deep work coding session starts in ten minutes.', urlTarget: '', category: '#work' },
  { id: 'ev_3', title: 'Evening Meds & Stretch', time: '5:30 PM', alertMinutesBefore: 5, ttsPhrase: 'time for evening meds and stretching!', urlTarget: '', category: '#meds' }
];

const INITIAL_NOTIFICATION_HISTORY = [
  { id: 'notif_101', title: 'Morning Meds Confirmation', ttsPhrase: 'time for morning meds!', timestampPT: '8:00 AM PT', status: 'Triggered (Ignored/Dismissed)', urlTarget: '' },
  { id: 'notif_102', title: 'Breakfast Telemetry Check', ttsPhrase: 'did you eat breakfast Kitty?', timestampPT: '9:30 AM PT', status: 'Acknowledged', urlTarget: '' }
];

export default function UpcomingEventsWidget({
  allLogs = [],
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('myblackbox_upcoming_events');
    return saved ? JSON.parse(saved) : SAMPLE_UPCOMING_EVENTS;
  });

  const [notificationHistory, setNotificationHistory] = useState(() => {
    const saved = localStorage.getItem('myblackbox_notification_history');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_HISTORY;
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('myblackbox_user_callsign') || 'Kitty';
  });

  const [soundType, setSoundType] = useState('tts_chime'); // 'tts' | 'chime' | 'tts_chime'
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [alertMins, setAlertMins] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    localStorage.setItem('myblackbox_upcoming_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('myblackbox_notification_history', JSON.stringify(notificationHistory));
  }, [notificationHistory]);

  useEffect(() => {
    localStorage.setItem('myblackbox_user_callsign', userName);
  }, [userName]);

  // Synthesizes pleasant Web Audio chime tone
  const playWebAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Web Audio chime unavailable:', e);
    }
  };

  // Speaks customized TTS voice alert
  const speakTtsAlert = (phrase) => {
    if (!('speechSynthesis' in window)) {
      alert('Browser TTS Speech Synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const fullText = `Hey ${userName}, ${phrase}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const handleLaunchUrlTarget = (url) => {
    if (!url) return;
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }
    window.open(target, '_blank');
  };

  const handleTestNotification = (customPhrase = null, targetUrl = null, title = 'Event Alert') => {
    const phrase = customPhrase || 'you have lunch in five minutes!';

    if (soundType === 'chime' || soundType === 'tts_chime') {
      playWebAudioChime();
    }

    if (soundType === 'tts' || soundType === 'tts_chime') {
      setTimeout(() => {
        speakTtsAlert(phrase);
      }, soundType === 'tts_chime' ? 400 : 0);
    }

    if (targetUrl) {
      setTimeout(() => {
        handleLaunchUrlTarget(targetUrl);
      }, 800);
    }

    // Log to Notification History Audit Log
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' PT';
    const newNotifItem = {
      id: `notif_${Date.now()}`,
      title: title || 'Event Alert',
      ttsPhrase: phrase,
      timestampPT: nowStr,
      status: 'Triggered (Ignored/Dismissed)',
      urlTarget: targetUrl || ''
    };

    setNotificationHistory(prev => [newNotifItem, ...prev]);

    if (onSaveZettel) {
      onSaveZettel({
        title: `🔔 Notification Fired: ${title}`,
        type: 'microlog',
        content: `Voice alert triggered for ${userName}: "Hey ${userName}, ${phrase}". Status: Triggered.`,
        tags: ['#notification', '#voice_alert', '#telemetry']
      });
    }

    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTime.trim()) return;

    const newEv = {
      id: `ev_${Date.now()}`,
      title: newTitle.trim(),
      time: newTime.trim(),
      alertMinutesBefore: Number(alertMins) || 5,
      ttsPhrase: `${newTitle.trim()} starts in ${alertMins} minutes!`,
      urlTarget: newUrl.trim(),
      category: '#event'
    };

    setEvents([...events, newEv]);

    onSaveZettel({
      title: `📅 Scheduled Event: ${newEv.title} at ${newEv.time}`,
      type: 'event',
      content: `Scheduled upcoming event: "${newEv.title}" at ${newEv.time} with a ${newEv.alertMinutesBefore}-min TTS alert for ${userName}.${newEv.urlTarget ? ` Target URL: ${newEv.urlTarget}` : ''}`,
      tags: ['#event', '#upcoming', '#reminder', '#telemetry']
    });

    setNewTitle('');
    setNewTime('');
    setNewUrl('');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleClearHistory = () => {
    setNotificationHistory([]);
  };

  return (
    <div className={`glass-panel ${isPinned ? 'pinned-tape' : ''}`} style={{ padding: '1.2rem', position: 'relative' }}>
      {/* Sticky Tape Pin Indicator */}
      {isPinned && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(251, 191, 36, 0.4)',
          border: '1px dashed #fbbf24',
          color: '#fef08a',
          fontSize: '0.65rem',
          fontWeight: '700',
          padding: '0.15rem 0.8rem',
          borderRadius: '2px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          letterSpacing: '0.05em'
        }}>
          📌 STICKY TAPE PINNED
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#c084fc',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              📅 Upcoming Events & Missed Notifications Audit
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Call-sign alerts for {userName} + Missed alerts audit feed
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.4)' }}
            title="Configure TTS Name Call-Sign & Voice Alert Settings"
          >
            <Settings size={12} /> Config
          </button>

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
              title="Pin panel side-by-side with sticky tape"
            >
              📌 {isPinned ? 'Unpin' : 'Pin Tape'}
            </button>
          )}
        </div>
      </div>

      {/* TTS Call-Sign & Audio Settings Modal/Panel */}
      {showSettings && (
        <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c084fc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Volume2 size={15} color="#c084fc" />
            <span>⚙️ Custom TTS Voice & Audio Notification Config:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Your Preferred Name / Call-sign:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Kitty, Lorik..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.35rem 0.5rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Audio & Sound Mode:
              </label>
              <select
                value={soundType}
                onChange={(e) => setSoundType(e.target.value)}
                style={{ width: '100%', background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.35rem', color: '#fff', fontSize: '0.8rem' }}
              >
                <option value="tts_chime">🔔 Chime + 🗣️ TTS Voice Alert</option>
                <option value="tts">🗣️ TTS Voice Alert Only</option>
                <option value="chime">🔔 Audio Chime Only</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => handleTestNotification('you have lunch in five minutes!', null, 'Test Voice Alert')}
              className="btn-primary"
              style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Volume2 size={13} />
              <span>🔊 Test TTS Alert ("Hey {userName}...")</span>
            </button>
          </div>
        </div>
      )}

      {/* Add New Event Form */}
      <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Upcoming Event (e.g. Team Sync, Lunch)..."
            style={{ flex: 2, minWidth: '160px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
          />
          <input
            type="text"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            placeholder="Time (e.g. 11:30 AM)..."
            style={{ flex: 1, minWidth: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Target URL / Loud YouTube Video (e.g. https://youtube.com/watch?v=...)"
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0.4rem 0.88rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            <Plus size={14} /> Add Event
          </button>
        </div>
      </form>

      {/* Upcoming Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem' }}>
        {events.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.4rem 0' }}>
            No upcoming events scheduled. Add an event above to enable TTS alerts & YouTube video launches!
          </div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="glass-card" style={{ padding: '0.65rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                    {ev.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                    ⏰ {ev.time}
                  </span>
                  {ev.urlTarget && (
                    <span style={{ fontSize: '0.65rem', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.15)', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Video size={10} color="#fcd34d" /> Loud URL Target
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  TTS Alert: "Hey {userName}, {ev.ttsPhrase || `you have ${ev.title} coming up!`}"
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                {ev.urlTarget && (
                  <button
                    onClick={() => handleLaunchUrlTarget(ev.urlTarget)}
                    className="btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    title="Launch Target YouTube Video / URL in new tab"
                  >
                    <ExternalLink size={11} /> Launch URL
                  </button>
                )}

                <button
                  onClick={() => handleTestNotification(ev.ttsPhrase || `${ev.title} is starting!`, ev.urlTarget, ev.title)}
                  className="btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                  title="Trigger TTS Voice Alert & Launch URL"
                >
                  <Volume2 size={11} /> Speak
                </button>

                <button
                  onClick={() => handleDeleteEvent(ev.id)}
                  className="btn-secondary"
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: '#fca5a5' }}
                  title="Remove event"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Notifications & Missed Alerts History Feed */}
      <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '8px', padding: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{ background: 'none', border: 'none', color: '#c084fc', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
          >
            <History size={14} color="#c084fc" />
            <span>🔔 Recent Notifications History & Ignored Alerts Audit ({notificationHistory.length})</span>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {notificationHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.65rem', cursor: 'pointer' }}
              title="Clear notification audit history"
            >
              Clear
            </button>
          )}
        </div>

        {showHistory && (
          <div style={{ marginTop: '0.55rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
            {notificationHistory.length === 0 ? (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No notifications logged yet. Trigger an alert to log missed & fired notifications!
              </div>
            ) : (
              notificationHistory.map(n => (
                <div key={n.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: '#fff', borderLeft: '3px solid #c084fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>{n.title}</span>
                      <span style={{ fontSize: '0.65rem', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                        {n.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
                      "Hey {userName}, {n.ttsPhrase}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {n.timestampPT}
                    </span>
                    <button
                      onClick={() => handleTestNotification(n.ttsPhrase, n.urlTarget, n.title)}
                      className="btn-secondary"
                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', color: '#c084fc' }}
                      title="Replay Voice Alert"
                    >
                      <Volume2 size={10} /> Replay
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

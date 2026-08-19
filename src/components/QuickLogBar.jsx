import React, { useState, useEffect } from 'react';
import { Droplet, Smile, Pill, Cookie, BookOpen, CheckSquare, PlusCircle, Zap, Sparkles, MessageSquare, Tag, Check, Camera, Compass, PenTool, Users, Utensils, Heart, Layers, Clock, Volume2, VolumeX, Bell, Briefcase, Coffee, Sun, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAutoTagSuggestions } from '../services/autoTagEngine';
import { speakTtsAnnouncement, getTtsMuteState, toggleTtsMute, sendNativeNotification } from '../services/notificationEngine';

const C4_SCENES = [
  { id: 'all', label: '🌐 All Scenes', color: '#94a3b8' },
  { id: 'work', label: '💼 Work Shift Mode', tag: '#work', color: '#3b82f6', desc: 'Switches 0-friction buttons to Work Shift presets' },
  { id: 'create', label: '🎨 Create Mode', tag: '#create', color: '#10b981', desc: 'Focus on coding, building, writing Zettels' },
  { id: 'consume', label: '📚 Consume Mode', tag: '#consume', color: '#60a5fa', desc: 'Focus on reading #tbr, books, watching shows' },
  { id: 'chat', label: '💬 Chat Mode', tag: '#chat', color: '#ec4899', desc: 'Focus on live micro-tweeting & braindump' },
  { id: 'collaborate', label: '🤝 Collaborate Mode', tag: '#collaborate', color: '#a78bfa', desc: 'Focus on pairing tasks & exporting posts' },
  { id: 'chow_down', label: '🍱 Chow Down Mode', tag: '#chow_down', color: '#f59e0b', desc: 'Focus on meals, sips, hydration & bio-care' },
  { id: 'calm', label: '🧘 Calm Mode', tag: '#calm', color: '#34d399', desc: 'Focus on 1-min grounding & rest' }
];

export default function QuickLogBar({
  onLogSip,
  onLogPee,
  onLogPoo,
  onOpenMoodModal,
  onQuickTagLog,
  onOpenEbookModal,
  onOpenQuickNoteModal,
  onOpenTaskModal,
  onOpenJournalModal,
  onOpenPhotoModal,
  activeC4Scene = 'all',
  onSelectC4Scene
}) {
  const [quickText, setQuickText] = useState('');
  const [acceptedTags, setAcceptedTags] = useState([]);
  const [isTtsMuted, setIsTtsMuted] = useState(getTtsMuteState());

  // Work Shift & Reminder Alert Timers
  const [workStartTime, setWorkStartTime] = useState(null);
  const [popcornTimerMsg, setPopcornTimerMsg] = useState(null);

  // Active Timer Countdown State
  const [activeTimer, setActiveTimer] = useState(null); // { name, durationMs, startTime, endTime, endTimeStr }
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!activeTimer) {
      setRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const diffMs = activeTimer.endTime - Date.now();
      if (diffMs <= 0) {
        setRemainingSeconds(0);
        const endMsg = `⏰ Timer Finished: "${activeTimer.name}" has completed!`;
        speakTtsAnnouncement(endMsg, '⏰ Reminder Timer Expired');
        sendNativeNotification('⏰ Timer Expired', endMsg);
        confetti({ particleCount: 50, spread: 80, origin: { y: 0.8 } });
        setActiveTimer(null);
        clearInterval(interval);
      } else {
        setRemainingSeconds(Math.ceil(diffMs / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const currentSceneObj = C4_SCENES.find(s => s.id === activeC4Scene) || C4_SCENES[0];
  const suggestions = getAutoTagSuggestions(quickText, acceptedTags);

  const triggerConfetti = () => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.85 }
    });
  };

  const handleToggleMute = () => {
    const muted = toggleTtsMute();
    setIsTtsMuted(muted);
  };

  const handleSelectScene = (sceneId) => {
    if (onSelectC4Scene) onSelectC4Scene(sceneId);

    const found = C4_SCENES.find(s => s.id === sceneId);
    if (found && found.tag && !acceptedTags.includes(found.tag)) {
      setAcceptedTags([...acceptedTags, found.tag]);
    }
    triggerConfetti();
  };

  const handleAcceptSingleTag = (tag) => {
    if (!acceptedTags.includes(tag)) {
      setAcceptedTags([...acceptedTags, tag]);
    }
  };

  const handleAcceptAllSuggestions = () => {
    setAcceptedTags([...acceptedTags, ...suggestions]);
    triggerConfetti();
  };

  // Work Quick Action Buttons Handler
  const handleWorkQuickAction = (actionLabel, actionTag) => {
    const now = Date.now();
    if (actionTag === '#work_clockin' || actionTag === '#work_late') {
      setWorkStartTime(now);
    }

    const title = quickText.trim() ? `💼 Work Log: ${actionLabel} — "${quickText.trim()}"` : `💼 Work Log: ${actionLabel}`;
    
    onQuickTagLog({
      title,
      type: 'task',
      tags: ['#work', actionTag, '#telemetry']
    });

    speakTtsAnnouncement(`Logged: ${actionLabel}`, '💼 Work Shift Action');
    if (quickText.trim()) setQuickText('');
    triggerConfetti();
  };

  // Regular Quick Action Buttons with Integrated Typed Text
  const handleSipClick = (count, label = 'Sip') => {
    onLogSip(count);
    if (quickText.trim()) {
      onQuickTagLog({
        title: `${label} Log: +${count} Sip(s) — "${quickText.trim()}"`,
        type: 'sip',
        tags: ['#sip', '#hydration', '#telemetry']
      });
      setQuickText('');
    }
    triggerConfetti();
  };

  const handlePeeClick = () => {
    onLogPee();
    if (quickText.trim()) {
      onQuickTagLog({
        title: `Pee Log: +1 🚽 — "${quickText.trim()}"`,
        type: 'microlog',
        tags: ['#pee', '#hydration', '#telemetry']
      });
      setQuickText('');
    }
    triggerConfetti();
  };

  const handlePooClick = () => {
    onLogPoo();
    if (quickText.trim()) {
      onQuickTagLog({
        title: `Poo Log: +1 💩 — "${quickText.trim()}"`,
        type: 'microlog',
        tags: ['#poo', '#bio_event', '#telemetry']
      });
      setQuickText('');
    }
    triggerConfetti();
  };

  function formatCountdown(totalSec) {
    if (totalSec <= 0) return '0m 00s';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }

  const handleStartActiveTimer = (name, minutes) => {
    const durationMs = minutes * 60 * 1000;
    const startTime = Date.now();
    const endTime = startTime + durationMs;
    const endTimeStr = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const timerObj = {
      name,
      durationMs,
      startTime,
      endTime,
      endTimeStr
    };

    setActiveTimer(timerObj);
    const msg = `🍿 Active Timer Started: ${name} (${minutes}m). Specific End Time: ${endTimeStr}`;
    setPopcornTimerMsg(msg);
    speakTtsAnnouncement(`Timer set for ${name}. Countdown started for ${minutes} minutes. Ends at ${endTimeStr}`, '🍿 Active Timer');
    sendNativeNotification('🍿 Active Timer Started', `Timer: ${name} (${minutes}m). Ends at ${endTimeStr}`);
    triggerConfetti();
  };

  const handleOnTheHourTimer = () => {
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
    const diffMinutes = Math.max(1, Math.ceil((nextHour.getTime() - now.getTime()) / 60000));
    handleStartActiveTimer('🔔 On The Hour Notice', diffMinutes);
  };
  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickText.trim()) return;

    const sceneTag = currentSceneObj.tag ? [currentSceneObj.tag] : [];
    const finalTags = Array.from(new Set(['#telemetry', '#quick_note', ...sceneTag, ...acceptedTags]));

    onQuickTagLog({
      title: quickText.trim(),
      type: 'microlog',
      tags: finalTags
    });
    setQuickText('');
    setAcceptedTags([]);
    triggerConfetti();
  };

  return (
    <div className="glass-panel" style={{ margin: '0 1rem 1.5rem 1rem', padding: '1rem' }}>
      {/* Header & Work Scene Selector & TTS Mute Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="#f59e0b" />
          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f3f4f6' }}>
            Low-Friction Microlog Triggers & Dynamic Scene Modes
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={handleToggleMute}
            className="btn-secondary"
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.72rem',
              borderColor: isTtsMuted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
              color: isTtsMuted ? '#fca5a5' : '#34d399',
              background: isTtsMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'
            }}
            title={isTtsMuted ? 'Unmute TTS Voice Announcements' : 'Mute TTS Voice Announcements'}
          >
            {isTtsMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{isTtsMuted ? 'TTS Muted' : 'TTS Voice ON'}</span>
          </button>
        </div>
      </div>

      {/* C4 Work Scene Selector Pills */}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {C4_SCENES.map(scene => {
          const isSelected = activeC4Scene === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => handleSelectScene(scene.id)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: '700',
                borderRadius: '6px',
                border: isSelected ? `1px solid ${scene.color}` : '1px solid var(--border-color)',
                background: isSelected ? `${scene.color}25` : 'rgba(0,0,0,0.3)',
                color: isSelected ? scene.color : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {scene.label}
            </button>
          );
        })}
      </div>

      {/* Popcorn Interval Announcer & Work Shift Reminder Alerts Bar */}
      <div className="glass-card" style={{ padding: '0.6rem', marginBottom: '0.8rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>🍿 Popcorn TTS Announcer & Work Reminder Alerts:</span>
          </div>
          {popcornTimerMsg && (
            <span style={{ fontSize: '0.7rem', color: '#a7f3d0', fontFamily: 'monospace' }}>{popcornTimerMsg}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button onClick={handleOnTheHourTimer} className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
            🔔 On The Hour
          </button>
          <button onClick={() => handleStartActiveTimer('Every 15m Meeting Snooze', 15)} className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.4)' }}>
            ⏱️ Every 15m Snooze
          </button>
          <button onClick={() => handleStartActiveTimer('In 5m Notice', 5)} className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', color: '#c4b5fd', borderColor: 'rgba(167, 139, 250, 0.4)' }}>
            ⏰ In 5m Notice
          </button>
          <button onClick={() => handleStartActiveTimer('In 10m Notice', 10)} className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            ⏳ In 10m Notice
          </button>

          {/* Work Shift Alerts */}
          <button onClick={() => handleStartActiveTimer('🍱 Work Lunch Break', 300)} className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', color: '#fb923c', borderColor: 'rgba(249, 115, 22, 0.4)' }} title="Lunch 5 hours from start work log">
            🍱 Lunch (5h)
          </button>
          <button onClick={() => handleStartActiveTimer('🏁 Work Shift EOD', 480)} className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.4)' }} title="EOD alert 8 hours later">
            🏁 EOD (8h)
          </button>
          <button onClick={() => handleStartActiveTimer('☕ 15m Work Break', 120)} className="btn-secondary" style={{ padding: '0.18rem 0.45rem', fontSize: '0.7rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }} title="15m breaks with 2 hour gaps">
            ☕ 15m Break (2h gap)
          </button>
        </div>

        {/* ACTIVE TIMER COUNTDOWN BANNER */}
        {activeTimer && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '6px', padding: '0.45rem 0.6rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#34d399" />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>
                  ⏱️ Active Timer: <span style={{ color: '#34d399' }}>{activeTimer.name}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                  🎯 Specific End Time: <strong>{activeTimer.endTimeStr}</strong> (PT)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: '900', color: '#fcd34d', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                ⏳ {formatCountdown(remainingSeconds)}
              </span>
              <button onClick={() => setActiveTimer(null)} className="btn-secondary" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.15)' }}>
                ⏹️ Cancel Timer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DYNAMIC QUICK ACTION TRIGGERS ROW (Switches Buttons Based on Scene) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '0.8rem' }}>
        {activeC4Scene === 'work' ? (
          /* WORK SHIFT DYNAMIC BUTTONS */
          <>
            <button
              className="btn-quick"
              onClick={() => handleWorkQuickAction('Clocked In Right On Time', '#work_clockin')}
              style={{ borderColor: 'rgba(59, 130, 246, 0.5)', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontWeight: '700' }}
            >
              <Briefcase size={15} />
              <span>💼 Clocked In On Time</span>
            </button>

            <button
              className="btn-quick"
              onClick={() => handleWorkQuickAction('Oops 5m Late to Work', '#work_late')}
              style={{ borderColor: 'rgba(245, 158, 11, 0.5)', background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', fontWeight: '700' }}
            >
              <Clock size={15} />
              <span>⏰ Oops 5m Late</span>
            </button>

            <button
              className="btn-quick"
              onClick={() => handleWorkQuickAction('Took 15-Minute Rest Break', '#work_break')}
              style={{ borderColor: 'rgba(167, 139, 250, 0.5)', background: 'rgba(167, 139, 250, 0.15)', color: '#c4b5fd', fontWeight: '700' }}
            >
              <Coffee size={15} />
              <span>☕ Took 15m Break</span>
            </button>

            <button
              className="btn-quick"
              onClick={() => handleWorkQuickAction('Took Lunch Meal Break', '#work_lunch')}
              style={{ borderColor: 'rgba(249, 115, 22, 0.5)', background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', fontWeight: '700' }}
            >
              <Utensils size={15} />
              <span>🍱 Took Lunch</span>
            </button>

            <button
              className="btn-quick"
              onClick={() => handleWorkQuickAction('Clocked Out Shift (EOD)', '#work_eod')}
              style={{ borderColor: 'rgba(236, 72, 153, 0.5)', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', fontWeight: '700' }}
            >
              <LogOut size={15} />
              <span>🏁 Clocked Out (EOD)</span>
            </button>

            <button className="btn-quick" onClick={onOpenTaskModal} style={{ borderColor: 'rgba(16, 185, 129, 0.5)', color: '#34d399' }}>
              <CheckSquare size={15} />
              <span>⏱️ Start Work Task</span>
            </button>
          </>
        ) : (
          /* REGULAR DOMAIN 0-FRICTION BUTTONS */
          <>
            <button className="btn-quick" onClick={() => handleSipClick(1, 'Water Sip')} style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
              <Droplet size={15} color="#06b6d4" />
              <span>+1 Sip</span>
            </button>

            <button className="btn-quick" onClick={() => handleSipClick(2, '2 Sips')} style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
              <Droplet size={15} color="#06b6d4" />
              <span>+2 Sips</span>
            </button>

            <button className="btn-quick" onClick={() => handleSipClick(10, 'Bottle Refill')} style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              <span>🍾 Bottle Refill</span>
            </button>

            <button className="btn-quick" onClick={() => handleSipClick(12, 'Finished 12oz Can')} style={{ borderColor: 'rgba(236, 72, 153, 0.5)', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', fontWeight: '700' }} title="Log 12 sips for finished 12oz can">
              <span>🥫 Finished Can (+12)</span>
            </button>

            <button className="btn-quick" onClick={() => handleSipClick(10, 'Refreshed Drink')} style={{ borderColor: 'rgba(6, 182, 212, 0.5)', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', fontWeight: '700' }}>
              <span>🔄 Refreshed Drink</span>
            </button>

            {/* Pee & Poo Excretion Loggers */}
            <button className="btn-quick" onClick={handlePeeClick} style={{ borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)' }}>
              <span>🚽 +1 Pee</span>
            </button>

            <button className="btn-quick" onClick={handlePooClick} style={{ borderColor: 'rgba(167, 139, 250, 0.4)', background: 'rgba(167, 139, 250, 0.1)' }}>
              <span>💩 +1 Poo</span>
            </button>

            {/* Task Start Trigger */}
            <button className="btn-quick" onClick={onOpenTaskModal} style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}>
              <CheckSquare size={15} />
              <span>⏱️ Start Task (T1)</span>
            </button>

            {/* Ebook / TBR Trigger */}
            <button className="btn-quick" onClick={onOpenEbookModal} style={{ borderColor: 'rgba(192, 132, 252, 0.4)', color: '#c084fc' }}>
              <BookOpen size={15} />
              <span>📚 #tbr Media Shelf</span>
            </button>

            {/* Live Tweet Trigger */}
            <button className="btn-quick" onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })} style={{ borderColor: 'rgba(29, 155, 240, 0.4)', color: '#60a5fa' }}>
              <MessageSquare size={15} />
              <span>💬 Live Tweet</span>
            </button>

            {/* Camera / Photo Trigger */}
            <button className="btn-quick" onClick={onOpenPhotoModal} style={{ borderColor: 'rgba(167, 139, 250, 0.4)', color: '#c4b5fd' }}>
              <Camera size={15} />
              <span>📷 Photo Selfie</span>
            </button>

            {/* Mood Checkin Trigger */}
            <button className="btn-quick" onClick={onOpenMoodModal} style={{ borderColor: 'rgba(236, 72, 153, 0.4)' }}>
              <Smile size={15} color="#ec4899" />
              <span>Mood Log</span>
            </button>
          </>
        )}
      </div>

      {/* Quick Microlog Input Form with Scene Tag Injection */}
      <form onSubmit={handleQuickSubmit}>
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <input
            type="text"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            placeholder={`Type text here before tapping action buttons or hit enter (Auto-tagged ${currentSceneObj.label})...`}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${currentSceneObj.color}50`,
              borderRadius: '6px',
              padding: '0.45rem 0.6rem',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: `linear-gradient(135deg, ${currentSceneObj.color} 0%, #1e293b 100%)` }}
          >
            <PlusCircle size={15} /> Log Entry
          </button>
        </div>

        {/* Auto Tag Suggestions Bar */}
        {(suggestions.length > 0 || acceptedTags.length > 0) && (
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Tag size={12} /> Auto Tags:
            </span>

            {acceptedTags.map(tag => (
              <span key={tag} style={{ background: `${currentSceneObj.color}30`, color: currentSceneObj.color, border: `1px solid ${currentSceneObj.color}`, padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                {tag} ✓
              </span>
            ))}

            {suggestions.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAcceptSingleTag(tag)}
                style={{ background: 'rgba(255,255,255,0.05)', color: '#93c5fd', border: '1px dashed #3b82f6', padding: '1px 6px', borderRadius: '4px', cursor: 'pointer' }}
              >
                + {tag}
              </button>
            ))}

            {suggestions.length > 1 && (
              <button
                type="button"
                onClick={handleAcceptAllSuggestions}
                style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '1px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
              >
                + Accept All
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

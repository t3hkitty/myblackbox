import React, { useState, useEffect } from 'react';
import { CheckSquare, Play, Square, Clock, Plus, Calendar, BookOpen, Send, Pin, Lightbulb, Sparkles, ArrowRight, RefreshCw, CheckCircle2, Zap, Flame, Trophy, Pause, RotateCcw } from 'lucide-react';
import { getZettelTimestamp, formatDuration } from '../utils/timeUtils';
import { getTaskListConfig } from '../services/blackboxStorage';
import { syncTaskToGoogleTasks, fetchTasksFromGoogleTasks, openOAuthPlaygroundHelper, getStoredAccessToken, saveAccessToken } from '../services/googleDriveAuthEngine';
import { autoPairTasksFromList, createZettelFromAutoPair, isBioTask } from '../services/taskPairingEngine';
import confetti from 'canvas-confetti';

const SAMPLE_TBR_ITEMS = [
  { id: 'tbr_1', title: 'The F*ck It Diet - Caroline Dooner', type: 'book', author: 'Caroline Dooner' },
  { id: 'tbr_2', title: 'Intuitive Eating - Evelyn Tribole', type: 'book', author: 'Evelyn Tribole' },
  { id: 'tbr_3', title: 'The Body Keeps the Score - Bessel van der Kolk', type: 'book', author: 'Bessel van der Kolk' },
  { id: 'tbr_4', title: 'Severance Season 2 Episode 5', type: 'tv', author: 'Apple TV+' }
];

const SAMPLE_TBD_IDEAS = [
  { id: 'tbd_1', title: 'PWA Web Share Target API for zero-server Android share sheet intake', tag: '#app_idea' },
  { id: 'tbd_2', title: 'Offline-first SQLite Zettel syncing over local WebSockets', tag: '#architecture' },
  { id: 'tbd_3', title: 'AI-assisted micro-tweet thread builder from daily Zettel logs', tag: '#tooling' }
];

export default function TaskBlackboxWidget({
  onSaveTaskLog,
  onConnectGoogle,
  onSendToLiveTweet,
  isPinned,
  onTogglePin
}) {
  const [startPairTask, setStartPairTask] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [activeListTab, setActiveListTab] = useState('blackbox'); // 'blackbox' | 'tbr' | 'tbd'
  const [tbrList, setTbrList] = useState(SAMPLE_TBR_ITEMS);
  const [newTbrTitle, setNewTbrTitle] = useState('');
  const [tbdList, setTbdList] = useState(SAMPLE_TBD_IDEAS);
  const [newTbdTitle, setNewTbdTitle] = useState('');
  const [listConfig, setListConfig] = useState({ liveListName: 'blackbox', backlogListName: 'roundtoit', tbrListName: 'tbr' });
  const [googleTasksLive, setGoogleTasksLive] = useState([]);
  const [isSyncingTasks, setIsSyncingTasks] = useState(false);

  // #tbd 5-Min "Beat The Clock" Dopamine Pomodoro Sprint State
  const [tbdSprintItem, setTbdSprintItem] = useState(null);
  const [tbdSecondsLeft, setTbdSecondsLeft] = useState(300); // 5 minutes = 300s
  const [isTbdSprintActive, setIsTbdSprintActive] = useState(false);
  const [tbdSprintInitialSeconds, setTbdSprintInitialSeconds] = useState(300);

  // Paired calculated tasks history derived purely from creation timestamps
  const [completedPairLogs, setCompletedPairLogs] = useState([
    {
      id: 'task_pair_1',
      title: 'Google Tasks #blackbox: Deep Architecture Coding',
      startIso: new Date(Date.now() - 5400 * 1000).toISOString(),
      completeIso: new Date().toISOString(),
      startPT: `${getZettelTimestamp().split('-')[0]}-1000`,
      endPT: `${getZettelTimestamp().split('-')[0]}-1130`,
      durationSeconds: 5400,
      tags: ['#blackbox_task', '#deep_work']
    },
    {
      id: 'task_pair_2',
      title: 'Google Tasks #blackbox: Reading Philosophy Chapter 3',
      startIso: new Date(Date.now() - 8100 * 1000).toISOString(),
      completeIso: new Date(Date.now() - 5400 * 1000).toISOString(),
      startPT: `${getZettelTimestamp().split('-')[0]}-1400`,
      endPT: `${getZettelTimestamp().split('-')[0]}-1445`,
      durationSeconds: 2700,
      tags: ['#blackbox_task', '#reading', '#philosophy']
    }
  ]);

  // #tbd 5-Min Countdown Timer Ticker
  useEffect(() => {
    let ticker = null;
    if (isTbdSprintActive && tbdSecondsLeft > 0) {
      ticker = setInterval(() => {
        setTbdSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(ticker);
            setIsTbdSprintActive(false);
            confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ticker);
  }, [isTbdSprintActive, tbdSecondsLeft]);

  const handleStartTbdSprint = (item, customMinutes = 5) => {
    setTbdSprintItem(item);
    const secs = customMinutes * 60;
    setTbdSecondsLeft(secs);
    setTbdSprintInitialSeconds(secs);
    setIsTbdSprintActive(true);
    setActiveListTab('tbd');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleCompleteTbdSprint = () => {
    if (!tbdSprintItem) return;

    const elapsed = tbdSprintInitialSeconds - tbdSecondsLeft;
    const elapsedFormatted = formatDuration(Math.max(1, elapsed));
    const wasBeatTheClock = tbdSecondsLeft > 0;

    // Save Zettel Dopamine Victory Entry
    onSaveTaskLog({
      title: `🔥 Beat The Clock Victory: ${tbdSprintItem.title}`,
      type: 'task',
      content: `### 🔥 5-Min Beat The Clock Sprint Completed!\n- **#tbd Idea**: ${tbdSprintItem.title}\n- **Sprint Time Taken**: ${elapsedFormatted} (${elapsed}s)\n- **Clock Status**: ${wasBeatTheClock ? `🎉 BEAT THE CLOCK with ${formatDuration(tbdSecondsLeft)} to spare!` : '⏰ Completed at Sprint Finish Line!'}\n- **Dopamine Multiplier**: +50 Dopamine Victory Points`,
      tags: ['#tbd_sprint', '#beat_the_clock', '#dopamine_victory', '#pomodoro_5m'],
      metadata: { tbdTitle: tbdSprintItem.title, timeTakenSeconds: elapsed, wasBeatTheClock }
    });

    // Remove item from #tbd list or mark done
    setTbdList(tbdList.filter(i => i.id !== tbdSprintItem.id));
    syncTaskToGoogleTasks(`Completed #tbd Sprint: ${tbdSprintItem.title} in ${elapsedFormatted}`, listConfig.backlogListName || 'roundtoit');

    setIsTbdSprintActive(false);
    setTbdSprintItem(null);
    confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
    alert(`🎉 BEAT THE CLOCK VICTORY! Finished "${tbdSprintItem.title}" in ${elapsedFormatted}!`);
  };

  const handleAddFiveMinBoost = () => {
    setTbdSecondsLeft(prev => prev + 300);
    setTbdSprintInitialSeconds(prev => prev + 300);
    setIsTbdSprintActive(true);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const fetchLiveTasksForActiveTab = async (targetListName = null) => {
    setIsSyncingTasks(true);
    const config = getTaskListConfig();
    setListConfig(config);

    let listToFetch = targetListName;
    if (!listToFetch) {
      if (activeListTab === 'tbr') listToFetch = config.tbrListName || 'tbr';
      else if (activeListTab === 'tbd') listToFetch = config.backlogListName || 'roundtoit';
      else listToFetch = config.liveListName || 'blackbox';
    }

    const fetched = await fetchTasksFromGoogleTasks(listToFetch);
    if (fetched && fetched.length > 0) {
      setGoogleTasksLive(fetched);

      // Automated Task & Bio Timestamp Pairing Engine!
      const { pairs, unpairedStarts } = autoPairTasksFromList(fetched);
      if (pairs.length > 0) {
        setCompletedPairLogs(prev => [...pairs, ...prev]);

        // Auto-save Zettel entries for newly auto-detected pairs (including bio poop vs pee!)
        pairs.forEach(p => {
          const zettel = createZettelFromAutoPair(p);
          onSaveTaskLog(zettel);
        });
      }

      if (unpairedStarts.length > 0) {
        setStartPairTask(unpairedStarts[unpairedStarts.length - 1]);
      }
    }
    setIsSyncingTasks(false);
  };

  useEffect(() => {
    fetchLiveTasksForActiveTab();
  }, [activeListTab]);

  // 1. Log START Task Event (Record Creation Timestamp T1)
  const handleLogStartPair = (e) => {
    if (e) e.preventDefault();
    if (!taskName.trim()) return;

    const cleanTitle = taskName.trim();
    const nowIso = new Date().toISOString();
    const startPT = getZettelTimestamp();

    const startTaskObj = {
      id: `start_${Date.now()}`,
      title: cleanTitle,
      startIso: nowIso,
      startPT
    };

    setStartPairTask(startTaskObj);

    // Sync start task pair event to Google Tasks REST API with creation timestamp
    syncTaskToGoogleTasks(`Start Task: ${cleanTitle}`, listConfig.liveListName || 'blackbox', `Creation Timestamp T1: ${nowIso}`);

    setTaskName('');
  };

  // 2. Log COMPLETE Task Event (Record Creation Timestamp T2 & Calculate Duration T2 - T1)
  const handleLogCompletePair = () => {
    if (!startPairTask) return;

    const completeIso = new Date().toISOString();
    const endPT = getZettelTimestamp();

    // Pure timestamp creation difference calculation (No Timers!)
    const t1 = new Date(startPairTask.startIso).getTime();
    const t2 = new Date(completeIso).getTime();
    const durationSeconds = Math.max(1, Math.round((t2 - t1) / 1000));

    const isBio = isBioTask(startPairTask.title);
    let detectedBioType = null;

    if (isBio) {
      // If duration >= 180s (3m), auto-detect as Poop! Otherwise Pee!
      detectedBioType = durationSeconds >= 180 ? 'POOP' : 'PEE';
    }

    const completedPair = {
      id: `pair_${Date.now()}`,
      title: startPairTask.title,
      startIso: startPairTask.startIso,
      completeIso,
      startPT: startPairTask.startPT,
      endPT,
      durationSeconds,
      isToiletPair: isBio,
      detectedBioType,
      tags: isBio
        ? (detectedBioType === 'POOP' ? ['#poo', '#bio_event', '#excretion', '#telemetry'] : ['#pee', '#hydration', '#excretion', '#telemetry'])
        : ['#blackbox_task', '#creation_time_pair', '#google_tasks']
    };

    setCompletedPairLogs([completedPair, ...completedPairLogs]);

    // Save Zettel Telemetry Log
    if (isBio) {
      if (detectedBioType === 'POOP') {
        onSaveTaskLog({
          title: `💩 Auto-Detected Bowel Excretion (Poop): ${formatDuration(durationSeconds)}`,
          type: 'microlog',
          content: `### 💩 Automated Toilet Telemetry Pair:\n- **Start Creation (T1)**: ${startPairTask.startIso} (${completedPair.startPT} PT)\n- **Complete Creation (T2)**: ${completeIso} (${endPT} PT)\n- **Elapsed Toilet Time**: ${formatDuration(durationSeconds)} (${durationSeconds}s)\n- **Classification**: 💩 **Poop / Bowel Movement** (Duration ≥ 3 mins)`,
          tags: ['#poo', '#bio_event', '#excretion', '#telemetry'],
          metadata: { bioType: 'poop', durationSeconds }
        });
      } else {
        onSaveTaskLog({
          title: `🚽 Auto-Detected Urination (Pee): ${formatDuration(durationSeconds)}`,
          type: 'microlog',
          content: `### 🚽 Automated Toilet Telemetry Pair:\n- **Start Creation (T1)**: ${startPairTask.startIso} (${completedPair.startPT} PT)\n- **Complete Creation (T2)**: ${completeIso} (${endPT} PT)\n- **Elapsed Toilet Time**: ${formatDuration(durationSeconds)} (${durationSeconds}s)\n- **Classification**: 🚽 **Pee / Urination** (Duration < 3 mins)`,
          tags: ['#pee', '#hydration', '#excretion', '#telemetry'],
          metadata: { bioType: 'pee', durationSeconds }
        });
      }
    } else {
      onSaveTaskLog({
        title: `Task Pair Complete: ${completedPair.title}`,
        type: 'task',
        content: `### ⏱️ Task Duration Calculated from Creation Timestamps:\n- **Start Creation (T1)**: ${startPairTask.startIso} (${completedPair.startPT} PT)\n- **Complete Creation (T2)**: ${completeIso} (${endPT} PT)\n- **Calculated Duration**: ${formatDuration(durationSeconds)} (${durationSeconds}s)`,
        tags: ['#blackbox_task', '#creation_time_pair', '#google_tasks'],
        metadata: {
          taskTitle: completedPair.title,
          t1Iso: startPairTask.startIso,
          t2Iso: completeIso,
          durationSeconds
        }
      });
    }

    // Sync completion task pair to Google Tasks REST API
    syncTaskToGoogleTasks(`Completed Task: ${completedPair.title} (Duration: ${formatDuration(durationSeconds)})`, listConfig.liveListName || 'blackbox', `Creation Timestamp T2: ${completeIso}`);

    setStartPairTask(null);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
  };

  const handleAddTbr = (e) => {
    e.preventDefault();
    if (!newTbrTitle.trim()) return;

    const cleanTitle = newTbrTitle.trim();
    const newItem = {
      id: `tbr_${Date.now()}`,
      title: cleanTitle,
      type: 'media',
      author: 'User Added'
    };
    setTbrList([newItem, ...tbrList]);
    syncTaskToGoogleTasks(`TBR Item: ${cleanTitle}`, listConfig.tbrListName || 'tbr');
    setNewTbrTitle('');
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const handleAddTbd = (e) => {
    e.preventDefault();
    if (!newTbdTitle.trim()) return;

    const cleanTitle = newTbdTitle.trim();
    const newItem = {
      id: `tbd_${Date.now()}`,
      title: cleanTitle,
      tag: '#idea'
    };
    setTbdList([newItem, ...tbdList]);
    syncTaskToGoogleTasks(`TBD Idea: ${cleanTitle}`, listConfig.backlogListName || 'roundtoit');
    setNewTbdTitle('');
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const minsLeft = Math.floor(tbdSecondsLeft / 60);
  const secsLeft = tbdSecondsLeft % 60;
  const timerStr = `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`;
  const sprintProgress = Math.max(0, Math.min(100, ((tbdSprintInitialSeconds - tbdSecondsLeft) / tbdSprintInitialSeconds) * 100));

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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(139, 92, 246, 0.15)',
            color: '#a78bfa',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Google Tasks & Creation Timestamp Pair Engine
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Creation timestamp pairs for tasks + 5m Beat-the-Clock Pomodoro for #tbd!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              openOAuthPlaygroundHelper();
              setTimeout(() => {
                const token = window.prompt('Paste your generated Access Token (starts with ya29...):');
                if (token && token.trim()) {
                  saveAccessToken(token.trim());
                  fetchLiveTasksForActiveTab();
                }
              }, 1200);
            }}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem', color: '#fcd34d', borderColor: 'rgba(251, 191, 36, 0.4)', background: 'rgba(251, 191, 36, 0.1)' }}
            title="Generate fresh Google OAuth Access Token via OAuth Playground"
          >
            ⚡ 1-Click Token
          </button>

          <button
            type="button"
            onClick={() => fetchLiveTasksForActiveTab()}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.1)' }}
            title="Fetch and pull live tasks from connected Google Tasks account"
          >
            {isSyncingTasks ? '🔄 Syncing...' : '🔄 Pull Google Tasks'}
          </button>

          <button
            onClick={onTogglePin}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
            title="Pin panel side-by-side with sticky tape"
          >
            📌 {isPinned ? 'Unpin' : 'Pin Tape'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveListTab('blackbox')}
          style={{
            padding: '0.35rem 0.7rem',
            fontSize: '0.78rem',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeListTab === 'blackbox' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
            color: activeListTab === 'blackbox' ? '#fff' : 'var(--text-muted)'
          }}
        >
          ⏱️ Creation Timestamp Pairs
        </button>

        <button
          onClick={() => setActiveListTab('tbr')}
          style={{
            padding: '0.35rem 0.7rem',
            fontSize: '0.78rem',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeListTab === 'tbr' ? '#c084fc' : 'rgba(255,255,255,0.05)',
            color: activeListTab === 'tbr' ? '#fff' : 'var(--text-muted)'
          }}
        >
          📚 TBR Media Shelf ({tbrList.length})
        </button>

        <button
          onClick={() => setActiveListTab('tbd')}
          style={{
            padding: '0.35rem 0.7rem',
            fontSize: '0.78rem',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeListTab === 'tbd' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
            color: activeListTab === 'tbd' ? '#fff' : 'var(--text-muted)'
          }}
        >
          🔥 #tbd 5m Beat-The-Clock Sprint ({tbdList.length})
        </button>
      </div>

      {/* Tab Content 1: Creation Timestamp Pairs */}
      {activeListTab === 'blackbox' && (
        <>
          {/* Active Pending Start Pair Box */}
          {startPairTask ? (
            <div className="glass-card" style={{ padding: '0.9rem', marginBottom: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🟢 PAIR T1 LOGGED: {startPairTask.startPT} PT
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {new Date(startPairTask.startIso).toLocaleTimeString()}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', marginBottom: '0.8rem' }}>
                "{startPairTask.title}"
              </h4>
              <button
                onClick={handleLogCompletePair}
                className="btn-primary"
                style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <CheckCircle2 size={16} fill="white" /> 🏁 LOG PAIR T2 & CALCULATE DURATION FROM CREATION TIMES
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogStartPair} style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Log new Task Start Event (T1 creation time)..."
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.45rem 0.6rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <Play size={14} fill="white" /> LOG T1 START
              </button>
            </form>
          )}

          {/* Synced Google Tasks items */}
          {googleTasksLive.length > 0 && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#60a5fa', marginBottom: '0.3rem' }}>
                📋 Synced Google Tasks from "{listConfig.liveListName || 'blackbox'}":
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {googleTasksLive.map(gt => (
                  <div key={gt.id} className="glass-card" style={{ padding: '0.45rem 0.65rem', background: 'rgba(59, 130, 246, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '600' }}>{gt.title}</div>
                      {gt.updated && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Created: {new Date(gt.updated).toLocaleString()}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setTaskName(gt.title);
                        handleLogStartPair();
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: '#60a5fa' }}
                    >
                      <Play size={10} /> Pair T1
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calculated Task Pair History (No Timers!) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c084fc' }}>
              📊 Calculated Task Pairs (Duration derived purely from T2 - T1 creation times):
            </div>
            {completedPairLogs.map(t => (
              <div key={t.id} className="glass-card" style={{ padding: '0.6rem 0.8rem', background: t.isToiletPair ? (t.detectedBioType === 'POOP' ? 'rgba(180, 83, 9, 0.15)' : 'rgba(59, 130, 246, 0.15)') : 'rgba(255, 255, 255, 0.03)', border: t.isToiletPair ? (t.detectedBioType === 'POOP' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)') : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {t.isToiletPair ? (
                      t.detectedBioType === 'POOP' ? (
                        <span style={{ color: '#fef08a' }}>💩 Auto-Detected Poop ({t.durationFormatted || formatDuration(t.durationSeconds)})</span>
                      ) : (
                        <span style={{ color: '#93c5fd' }}>🚽 Auto-Detected Pee ({t.durationFormatted || formatDuration(t.durationSeconds)})</span>
                      )
                    ) : (
                      <span>{t.title || t.topic}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#93c5fd', marginTop: '0.2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <span>⏱️ Duration: <strong>{t.durationFormatted || formatDuration(t.durationSeconds)}</strong></span>
                    {t.startPT && <span>T1 Start: {t.startPT}</span>}
                    {t.endPT && <span>T2 Complete: {t.endPT}</span>}
                  </div>
                </div>
                {onSendToLiveTweet && (
                  <button
                    onClick={() => onSendToLiveTweet(`Finished task: ${t.title} in ${formatDuration(t.durationSeconds)} (calculated from creation times) #workflow`)}
                    className="btn-secondary"
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.68rem', color: '#60a5fa' }}
                    title="Send task victory to Live Tweets Stream"
                  >
                    <Send size={11} /> Tweet
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab Content 2: TBR Media Shelf */}
      {activeListTab === 'tbr' && (
        <div>
          <form onSubmit={handleAddTbr} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
            <input
              type="text"
              value={newTbrTitle}
              onChange={(e) => setNewTbrTitle(e.target.value)}
              placeholder="Add book, article, or show to TBR list..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}>
              <Plus size={14} /> Add TBR
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '200px', overflowY: 'auto' }}>
            {tbrList.map(item => (
              <div key={item.id} className="glass-card" style={{ padding: '0.55rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={14} color="#c084fc" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fff' }}>
                    {item.title}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTaskName(`Reading: ${item.title}`);
                    setActiveListTab('blackbox');
                  }}
                  className="btn-secondary"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                >
                  <Play size={10} /> Pair T1 Reading
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: #tbd 5-Min Dopamine Pomodoro Sprint */}
      {activeListTab === 'tbd' && (
        <div>
          {/* Active 5-Min Sprint Display Box */}
          {tbdSprintItem ? (
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.28) 100%)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase' }}>
                  <Flame size={16} color="#f59e0b" />
                  <span>🔥 BEAT THE CLOCK: 5m Dopamine Competition</span>
                </span>

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button onClick={handleAddFiveMinBoost} className="btn-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem', color: '#fcd34d' }}>
                    +5m Boost
                  </button>
                  <button onClick={() => { setIsTbdSprintActive(false); setTbdSprintItem(null); }} className="btn-secondary" style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem', color: '#f87171' }}>
                    Cancel
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.6rem' }}>
                "{tbdSprintItem.title}"
              </h3>

              {/* Countdown Digital Timer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '0.8rem' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: tbdSecondsLeft < 60 ? '#ef4444' : '#fbbf24', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  ⏱️ {timerStr}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#fef08a', fontWeight: '700' }}>
                    {tbdSecondsLeft > 0 ? '⚡ CAN YOU BEAT THE CLOCK?' : '⏰ TIME EXPIRED!'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Target: 5 Minutes Pomodoro Sprint
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.9rem' }}>
                <div style={{ width: `${sprintProgress}%`, background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)', height: '100%', transition: 'width 1s linear' }} />
              </div>

              <button
                onClick={handleCompleteTbdSprint}
                className="btn-primary"
                style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '0.6rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '800' }}
              >
                <Trophy size={18} fill="white" /> 🏆 BEAT THE CLOCK & LOG DOPAMINE VICTORY!
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddTbd} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
              <input
                type="text"
                value={newTbdTitle}
                onChange={(e) => setNewTbdTitle(e.target.value)}
                placeholder="Add feature idea to #tbd backlog..."
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Plus size={14} /> Add Idea
              </button>
            </form>
          )}

          {/* #tbd Backlog Items List with 1-Click 5m Pomodoro Sprint Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '220px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>💡 #tbd Backlog Ideas (No pairing needed! Launch 5m Pomodoro Sprint):</span>
            </div>
            {tbdList.map(item => (
              <div key={item.id} className="glass-card" style={{ padding: '0.55rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lightbulb size={14} color="#f59e0b" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fff' }}>
                    {item.title}
                  </span>
                </div>
                <button
                  onClick={() => handleStartTbdSprint(item, 5)}
                  className="btn-primary"
                  style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Flame size={12} fill="white" /> 🔥 5m Sprint
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

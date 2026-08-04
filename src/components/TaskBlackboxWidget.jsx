import React, { useState, useEffect } from 'react';
import { CheckSquare, Play, Square, Clock, Plus, Calendar } from 'lucide-react';
import { getZettelTimestamp, formatDuration } from '../utils/timeUtils';
import { getTaskListConfig } from '../services/blackboxStorage';
import confetti from 'canvas-confetti';

export default function TaskBlackboxWidget({
  onSaveTaskLog
}) {
  const [activeTask, setActiveTask] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [listConfig, setListConfig] = useState({ liveListName: 'blackbox', backlogListName: 'roundtoit' });

  useEffect(() => {
    setListConfig(getTaskListConfig());
  }, []);

  const [completedTasks, setCompletedTasks] = useState([
    {
      id: 'task_sample_1',
      title: 'Google Tasks #blackbox: Deep Architecture Coding',
      startPT: `${getZettelTimestamp().split('-')[0]}-1000`,
      endPT: `${getZettelTimestamp().split('-')[0]}-1130`,
      durationSeconds: 5400,
      tags: ['#blackbox_task', '#deep_work']
    }
  ]);

  useEffect(() => {
    let interval = null;
    if (activeTask) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTask]);

  const handleStartTask = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const startZettel = getZettelTimestamp();
    setActiveTask({
      id: `task_${Date.now()}`,
      title: taskName.trim(),
      startPT: startZettel,
      startTime: new Date()
    });
    setElapsedSeconds(0);
    setTaskName('');
  };

  const handleStopTask = () => {
    if (!activeTask) return;

    const endZettel = getZettelTimestamp();
    const duration = elapsedSeconds;

    const completed = {
      ...activeTask,
      endPT: endZettel,
      durationSeconds: duration,
      tags: ['#blackbox_task', '#workflow', '#google_tasks']
    };

    setCompletedTasks([completed, ...completedTasks]);

    // Save Zettel Log
    onSaveTaskLog({
      title: `Task Completed: ${completed.title}`,
      type: 'task',
      content: `Start: ${completed.startPT} PT | End: ${completed.endPT} PT | Duration: ${formatDuration(duration)}`,
      tags: ['#blackbox_task', '#workflow', '#google_tasks'],
      metadata: {
        taskTitle: completed.title,
        startPT: completed.startPT,
        endPT: completed.endPT,
        durationSeconds: duration
      }
    });

    setActiveTask(null);
    setElapsedSeconds(0);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
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
              Google Tasks "{listConfig.liveListName}" List
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Low-overhead Start/End Time Pair Sync
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ borderColor: 'rgba(139, 92, 246, 0.3)', color: '#c4b5fd' }}>
          <Calendar size={12} /> Google Calendar Polled
        </span>
      </div>

      {/* Active Task Banner */}
      {activeTask ? (
        <div className="glass-card" style={{ background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} className="animate-spin" /> ACTIVE TASK START: {activeTask.startPT} PT
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700', color: '#a78bfa' }}>
              {formatDuration(elapsedSeconds)}
            </span>
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.8rem' }}>
            "{activeTask.title}"
          </div>

          <button
            onClick={handleStopTask}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Square size={16} fill="white" /> Complete & Add End Pair to Blackbox
          </button>
        </div>
      ) : (
        <form onSubmit={handleStartTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="New #blackbox task (e.g. Reading Chapter 4)..."
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.9rem',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <Play size={15} fill="white" /> Start Task
          </button>
        </form>
      )}

      {/* Completed Task Pairs List */}
      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Recent Start / Complete Pairs:
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
        {completedTasks.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>
                {t.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {t.startPT} ➔ {t.endPT}
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#c4b5fd', fontFamily: 'var(--font-mono)' }}>
              {formatDuration(t.durationSeconds)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

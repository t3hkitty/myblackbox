import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Filter,
  Calendar,
  Tag,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Flame,
  AlertTriangle,
  CheckCircle2,
  ListFilter,
  RefreshCw,
  FastForward,
  Wand2,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { MBBTask, TaskPriority } from '../../tasks/types';
import { mbbTaskStore } from '../../tasks/store';
import { PRIORITY_MAP } from '../../tasks/priority';
import { AsciiPetWidget } from '../animations/AsciiPetWidget';
import { syncTaskToGoogleTasks } from '../../services/googleDriveAuthEngine';
import { dopamineAudio } from '../../services/dopamineAudioEngine';
import { GoblinDecomposerModal } from './GoblinDecomposerModal';
import { BeatTheClockSprintWidget } from './BeatTheClockSprintWidget';
import confetti from 'canvas-confetti';

interface TasksDashboardViewProps {
  onSaveZettel?: (zettel: any) => void;
}

export const TasksDashboardView: React.FC<TasksDashboardViewProps> = ({ onSaveZettel }) => {
  const [tasks, setTasks] = useState<MBBTask[]>([]);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>(0);
  const [quickDueDate, setQuickDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<number | 'all'>('all');
  const [petEvent, setPetEvent] = useState<'idle' | 'task_complete' | 'streak_sync' | 'hydrate_nudge'>('idle');

  // AuDHD Support State: Goblin modal & 5-minute Beat-the-Clock Sprint drawer
  const [decomposingTask, setDecomposingTask] = useState<MBBTask | null>(null);
  const [activeSprintTask, setActiveSprintTask] = useState<string | null>(null);
  const [showSprintWidget, setShowSprintWidget] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(dopamineAudio.getIsMuted());

  // Collapsible section state
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    overdue: false,
    today: false,
    high: false,
    medium: false,
    low: false,
    completed: true // default collapsed completed
  });

  useEffect(() => {
    const unsub = mbbTaskStore.subscribe((t) => setTasks(t));
    return () => unsub();
  }, []);

  const toggleSection = (sec: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    dopamineAudio.setMuted(next);
  };

  // Quick Capture handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    // Inline #tag parser
    const tagMatches = quickTitle.match(/#[\w-]+/g) || [];
    const tags = tagMatches.map((t) => t.slice(1));
    const cleanTitle = quickTitle.replace(/#[\w-]+/g, '').trim();

    const created = mbbTaskStore.addTask({
      title: cleanTitle || quickTitle,
      status: 'needsAction',
      due: quickDueDate || undefined,
      metadata: {
        priority: quickPriority,
        tags: tags.length > 0 ? tags : undefined
      }
    });

    // Procedural tick blip & confetti
    dopamineAudio.playTickBlip();
    confetti({ particleCount: 20, spread: 50, origin: { y: 0.8 } });

    // Sync to Google Tasks
    syncTaskToGoogleTasks(cleanTitle || quickTitle, 'blackbox', `Created via MBB Tasks Dashboard`);

    setQuickTitle('');
    setQuickPriority(0);
    setQuickDueDate('');
  };

  // 1-Click Toggle Task with Procedural Victory Chime
  const handleToggleTask = (task: MBBTask) => {
    if (task.status === 'completed') {
      mbbTaskStore.updateTask(task.id, { status: 'needsAction', completed: undefined });
    } else {
      mbbTaskStore.completeTask(task.id);
      setPetEvent('task_complete');
      dopamineAudio.playVictoryChime();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      if (onSaveZettel) {
        onSaveZettel({
          title: `Completed Task: ${task.title}`,
          type: 'task',
          content: `Completed MBB Task "${task.title}". Priority: ${task.metadata?.priority || 0}`,
          tags: ['#task_complete', ...(task.metadata?.tags?.map((t) => `#${t}`) || [])]
        });
      }
    }
  };

  // Guilt-Free Half-Done action
  const handleHalfTask = (task: MBBTask) => {
    mbbTaskStore.setHalfCompleted(task.id);
    dopamineAudio.playGentleRelief();
    confetti({ particleCount: 15, spread: 35, origin: { y: 0.8 } });
  };

  // Guilt-Free Skip / Defer action
  const handleSkipTask = (task: MBBTask) => {
    mbbTaskStore.skipTask(task.id);
    dopamineAudio.playGentleRelief();
  };

  // Double Checkmark / Sweep All Active Tasks
  const handleSweepAll = () => {
    const count = mbbTaskStore.sweepAllActive();
    if (count > 0) {
      dopamineAudio.playSweepAllChime();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      setPetEvent('streak_sync');
      if (onSaveZettel) {
        onSaveZettel({
          title: `🧹 Massive Task Sweep Catch-Up (${count} tasks)`,
          type: 'task_sweep',
          content: `Swept ${count} active/half tasks into completed archive without guilt.`,
          tags: ['#tasks', '#sweep_all', '#non_zero', '#dopamine_victory']
        });
      }
    }
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    tasks.forEach((t) => {
      t.metadata?.tags?.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // concise top 10 tags
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesNotes = t.notes?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNotes) return false;
      }

      if (selectedTag && !t.metadata?.tags?.includes(selectedTag)) {
        return false;
      }

      if (selectedPriority !== 'all' && (t.metadata?.priority || 0) !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedTag, selectedPriority]);

  // Categorize tasks into priority / due state buckets
  const nowStr = new Date().toISOString().split('T')[0];
  const activeTasks = filteredTasks.filter((t) => t.status === 'needsAction' || t.status === 'half');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const overdueTasks = activeTasks.filter((t) => t.due && t.due < nowStr);
  const todayTasks = activeTasks.filter((t) => t.due && t.due === nowStr);
  const highPriorityTasks = activeTasks.filter((t) => !overdueTasks.includes(t) && !todayTasks.includes(t) && (t.metadata?.priority === 3));
  const normalTasks = activeTasks.filter((t) => !overdueTasks.includes(t) && !todayTasks.includes(t) && (t.metadata?.priority !== 3));

  const renderTaskRow = (task: MBBTask) => {
    const isCompleted = task.status === 'completed';
    const isHalf = task.status === 'half';
    const prio = task.metadata?.priority || 0;
    const prioInfo = PRIORITY_MAP[prio as TaskPriority] || PRIORITY_MAP[0];

    return (
      <div
        key={task.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.45rem 0.6rem',
          background: isCompleted ? 'rgba(0, 0, 0, 0.2)' : isHalf ? 'rgba(254, 240, 138, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: isHalf ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '6px',
          transition: 'all 0.15s ease'
        }}
      >
        {/* Completion Checkbox */}
        <button
          onClick={() => handleToggleTask(task)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: isCompleted ? '#34d399' : prio === 3 ? '#f87171' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isCompleted ? <CheckCircle2 size={16} /> : <Square size={16} />}
        </button>

        {/* Half-Done Badge Indicator */}
        {isHalf && (
          <span title="Guilt-Free Half-Done" style={{ fontSize: '0.85rem' }}>
            🌗
          </span>
        )}

        {/* Task Title & Tags */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: isCompleted ? 400 : 600,
              color: isCompleted ? 'var(--text-muted)' : '#fff',
              textDecoration: isCompleted ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {task.title}
          </div>

          {(task.due || task.defer_until || (task.metadata?.tags && task.metadata.tags.length > 0)) && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
              {task.due && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: task.due < nowStr && !isCompleted ? '#f87171' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <Calendar size={10} /> {task.due}
                </span>
              )}
              {task.defer_until && (
                <span style={{ fontSize: '0.65rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  ⏳ Deferred: {task.defer_until}
                </span>
              )}
              {task.metadata?.tags?.map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTag(selectedTag === tag ? null : tag);
                  }}
                  style={{
                    fontSize: '0.62rem',
                    padding: '0px 4px',
                    borderRadius: '3px',
                    background: 'rgba(167, 139, 250, 0.15)',
                    color: '#c4b5fd',
                    cursor: 'pointer'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AuDHD Action Buttons: Goblin Decompose, Half-Done, Skip */}
        {!isCompleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* 🧙‍♂️ Goblin Break Down Button */}
            <button
              onClick={() => setDecomposingTask(task)}
              title="Decompose overwhelming task into tiny < 5m steps"
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '4px',
                color: '#c084fc',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <Wand2 size={11} /> Break Down
            </button>

            {/* 🌗 Guilt-Free Half */}
            <button
              onClick={() => handleHalfTask(task)}
              title="Mark half done (guilt-free progress)"
              style={{
                background: 'rgba(250, 204, 21, 0.15)',
                border: '1px solid rgba(250, 204, 21, 0.4)',
                borderRadius: '4px',
                color: '#facc15',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 5px',
                cursor: 'pointer'
              }}
            >
              🌗 Half
            </button>

            {/* ⏭️ Skip without guilt */}
            <button
              onClick={() => handleSkipTask(task)}
              title="Skip or defer 7 days without guilt"
              style={{
                background: 'rgba(148, 163, 184, 0.15)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '4px',
                color: '#94a3b8',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 5px',
                cursor: 'pointer'
              }}
            >
              ⏭️ Skip
            </button>
          </div>
        )}

        {/* Priority Badge */}
        {prio > 0 && (
          <span
            style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '4px',
              background: prioInfo.color,
              color: '#fff',
              fontWeight: 700
            }}
          >
            {prioInfo.label}
          </span>
        )}
      </div>
    );
  };

  const renderSection = (
    title: string,
    key: string,
    taskList: MBBTask[],
    badgeColor = '#60a5fa',
    icon?: React.ReactNode
  ) => {
    if (taskList.length === 0) return null;
    const isCollapsed = collapsedSections[key];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div
          onClick={() => toggleSection(key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.3rem 0.5rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '6px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isCollapsed ? <ChevronRight size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
            {icon}
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>{title}</span>
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              padding: '1px 6px',
              borderRadius: '10px',
              background: `${badgeColor}22`,
              color: badgeColor,
              fontWeight: 700
            }}
          >
            {taskList.length}
          </span>
        </div>

        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingLeft: '0.4rem' }}>
            {taskList.map(renderTaskRow)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. Top Bar: Slim Quick Capture + Concise Filter + AuDHD Actions */}
      <div
        className="glass-panel"
        style={{
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={18} color="#60a5fa" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              🐾 AuDHD Task Command Center
            </h2>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                padding: '1px 6px',
                borderRadius: '6px'
              }}
            >
              Anti-Overwhelm
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Mute/Unmute Audio Chime */}
            <button
              onClick={toggleSound}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
              title={soundMuted ? 'Unmute procedural dopamine chords' : 'Mute procedural audio'}
            >
              {soundMuted ? <VolumeX size={13} color="#f87171" /> : <Volume2 size={13} color="#34d399" />}
              <span>{soundMuted ? 'Muted' : 'Sound ON'}</span>
            </button>

            {/* 5-Min Sprint Drawer Toggle */}
            <button
              onClick={() => setShowSprintWidget((prev) => !prev)}
              className="btn-secondary"
              style={{
                padding: '0.3rem 0.6rem',
                fontSize: '0.72rem',
                borderColor: showSprintWidget ? '#f97316' : 'var(--border-color)',
                color: showSprintWidget ? '#fb923c' : 'var(--text-muted)',
                background: showSprintWidget ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Launch 5-Minute 'Beat The Clock' Dopamine Sprint"
            >
              <Flame size={13} color="#f97316" fill="#f97316" />
              <span>5m Sprint</span>
            </button>

            {/* Sweep All / Double Checkmark */}
            {activeTasks.length > 0 && (
              <button
                onClick={handleSweepAll}
                className="btn-secondary"
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.72rem',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="Sweep all piled-up tasks as completed without guilt!"
              >
                <CheckCircle2 size={13} />
                <span>Sweep All ({activeTasks.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional 5-Min Beat-the-Clock Sprint Panel */}
        {showSprintWidget && (
          <BeatTheClockSprintWidget
            initialTask={activeSprintTask || undefined}
            onSprintComplete={(title, dur) => {
              if (onSaveZettel) {
                onSaveZettel({
                  title: `🔥 Beat The Clock Victory: ${title}`,
                  type: 'sprint_victory',
                  content: `Completed 5-minute Beat-the-Clock sprint for "${title}" in ${dur} seconds! +50 Dopamine Victory Points.`,
                  tags: ['#beat_the_clock', '#dopamine_victory', '#sprint_5m']
                });
              }
              setActiveSprintTask(null);
            }}
          />
        )}

        {/* Slim Quick Capture Input */}
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Quick capture: Task title (#tag for tags)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#fff',
              fontSize: '0.8rem'
            }}
          />

          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(Number(e.target.value) as TaskPriority)}
            style={{
              padding: '0.45rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: PRIORITY_MAP[quickPriority].color,
              fontWeight: 700,
              fontSize: '0.75rem'
            }}
          >
            <option value={0}>Priority: None</option>
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High 🔥</option>
          </select>

          <input
            type="date"
            value={quickDueDate}
            onChange={(e) => setQuickDueDate(e.target.value)}
            style={{
              padding: '0.4rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'rgba(0, 0, 0, 0.4)',
              color: '#fff',
              fontSize: '0.75rem'
            }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={14} /> Add
          </button>
        </form>

        {/* Concise Filter Bar & Top 10 Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 180px' }}>
            <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.3rem 0.5rem 0.3rem 1.6rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.3)',
                color: '#fff',
                fontSize: '0.74rem'
              }}
            />
          </div>

          {/* Tag Filter Chips (Concise top 10) */}
          <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '2px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Tags:</span>
            {allTags.map(([tag, count]) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '0.68rem',
                    border: isSelected ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(192, 132, 252, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  #{tag} ({count})
                </button>
              );
            })}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                style={{
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.65rem',
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. ASCII Pet Animation Widget (Compact Gamification Companion) */}
      <AsciiPetWidget currentEvent={petEvent} onEventHandled={() => setPetEvent('idle')} />

      {/* 3. Collapsible Task List Grouped by Priority / Due State */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px'
        }}
      >
        {activeTasks.length === 0 && completedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🐾 No tasks found. Capture one above or sync from Google Tasks / Tasker!
          </div>
        ) : (
          <>
            {renderSection('🚨 Overdue', 'overdue', overdueTasks, '#f87171', <AlertTriangle size={14} color="#f87171" />)}
            {renderSection('📅 Due Today', 'today', todayTasks, '#fcd34d', <Calendar size={14} color="#fcd34d" />)}
            {renderSection('🔥 High Priority', 'high', highPriorityTasks, '#f97316', <Flame size={14} color="#f97316" />)}
            {renderSection('📋 Active Tasks', 'normal', normalTasks, '#60a5fa', <CheckSquare size={14} color="#60a5fa" />)}
            {renderSection('✓ Completed Archive', 'completed', completedTasks, '#34d399', <CheckCircle2 size={14} color="#34d399" />)}
          </>
        )}
      </div>

      {/* 4. Goblin Task Decomposer Modal */}
      {decomposingTask && (
        <GoblinDecomposerModal
          taskTitle={decomposingTask.title}
          isOpen={Boolean(decomposingTask)}
          onClose={() => setDecomposingTask(null)}
          onAddSubtasks={(subtasks) => {
            subtasks.forEach((s) => {
              mbbTaskStore.addTask({
                title: s.title,
                status: 'needsAction',
                metadata: {
                  priority: decomposingTask.metadata?.priority || 1,
                  parent: decomposingTask.id,
                  tags: [...(decomposingTask.metadata?.tags || []), 'micro_step']
                }
              });
            });
            setDecomposingTask(null);
          }}
          onStartSprint={(firstStep) => {
            setActiveSprintTask(firstStep);
            setShowSprintWidget(true);
            setDecomposingTask(null);
          }}
        />
      )}
    </div>
  );
};

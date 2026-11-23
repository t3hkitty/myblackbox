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
  RefreshCw
} from 'lucide-react';
import { MBBTask, TaskPriority } from '../../tasks/types';
import { mbbTaskStore } from '../../tasks/store';
import { PRIORITY_MAP } from '../../tasks/priority';
import { AsciiPetWidget } from '../animations/AsciiPetWidget';
import { syncTaskToGoogleTasks } from '../../services/googleDriveAuthEngine';
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

    // Sync to Google Tasks
    syncTaskToGoogleTasks(cleanTitle || quickTitle, 'blackbox', `Created via MBB Tasks Dashboard`);

    setQuickTitle('');
    setQuickPriority(0);
    setQuickDueDate('');
    confetti({ particleCount: 20, spread: 50, origin: { y: 0.8 } });
  };

  const handleToggleTask = (task: MBBTask) => {
    if (task.status === 'completed') {
      mbbTaskStore.updateTask(task.id, { status: 'needsAction', completed: undefined });
    } else {
      mbbTaskStore.completeTask(task.id);
      setPetEvent('task_complete');
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
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
  const activeTasks = filteredTasks.filter((t) => t.status === 'needsAction');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const overdueTasks = activeTasks.filter((t) => t.due && t.due < nowStr);
  const todayTasks = activeTasks.filter((t) => t.due && t.due === nowStr);
  const highPriorityTasks = activeTasks.filter((t) => !overdueTasks.includes(t) && !todayTasks.includes(t) && (t.metadata?.priority === 3));
  const normalTasks = activeTasks.filter((t) => !overdueTasks.includes(t) && !todayTasks.includes(t) && (t.metadata?.priority !== 3));

  const renderTaskRow = (task: MBBTask) => {
    const isCompleted = task.status === 'completed';
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
          background: isCompleted ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '6px',
          transition: 'all 0.15s ease'
        }}
      >
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

          {(task.due || (task.metadata?.tags && task.metadata.tags.length > 0)) && (
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
      {/* 1. Top Bar: Slim Quick Capture + Concise Filter + ASCII Pet Companion */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckSquare size={18} color="#60a5fa" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Tasks &amp; Google Tasks Sync Workspace
            </h2>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Frontmatter AST &bull; gtasks two-way sync &bull; Tasker capture
          </span>
        </div>

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
    </div>
  );
};

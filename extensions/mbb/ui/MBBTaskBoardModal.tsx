import React, { useState, useEffect, useRef } from 'react';
import { mbbEngineStore } from '../mbbEngine';
import { MBBTask, TaskPriority, EmojiFolderNode, WeeklyStageSummary } from '../types';
import { buildEmojiFolderTree } from '../emojiFolders';
import { toRomanNumeral } from '../roman';
import { loadStageProfiles } from '../stageDirector';

export interface MBBTaskBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITY_MAP: Record<TaskPriority, { label: string; color: string; emoji: string }> = {
  0: { label: 'None', color: '#94A3B8', emoji: '🌸' },
  1: { label: 'Low', color: '#38BDF8', emoji: '💜' },
  2: { label: 'Med', color: '#FBBF24', emoji: '✨' },
  3: { label: 'High', color: '#F43F5E', emoji: '🐾' }
};

const STORAGE_OPACITY_KEY = 'mbb_flight_deck_surface_opacity_v2';
const STORAGE_POS_KEY = 'mbb_task_board_overlay_pos_v2';

export const MBBTaskBoardModal: React.FC<MBBTaskBoardModalProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<MBBTask[]>([]);
  const [weeklyRollup, setWeeklyRollup] = useState<WeeklyStageSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'half' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Surface transparency (0.35 to 1.0)
  const [surfaceOpacity, setSurfaceOpacity] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_OPACITY_KEY);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.35 && val <= 1.0) return val;
      }
    }
    return 0.94;
  });

  // Coordinates
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_POS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
        } catch (e) {}
      }
    }
    return { x: -1, y: 80 };
  });

  // Dragging
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0
  });
  const cardRef = useRef<HTMLDivElement>(null);

  // Quick entry states
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>(0);
  const [quickType, setQuickType] = useState<MBBTask['type']>('task');
  const [quickStageProfile, setQuickStageProfile] = useState<string>('');

  useEffect(() => {
    const unsub = mbbEngineStore.subscribe((all) => {
      setTasks(all);
      setWeeklyRollup(mbbEngineStore.getWeeklyStageRollup());
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const updateSurfaceOpacity = (val: number) => {
    const clamped = Math.max(0.35, Math.min(1.0, val));
    setSurfaceOpacity(clamped);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_OPACITY_KEY, clamped.toFixed(2));
    }
  };

  const handleDockToCenter = () => {
    setPosition({ x: -1, y: 80 });
    localStorage.removeItem(STORAGE_POS_KEY);
  };

  // Drag handler
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    isDraggingRef.current = true;
    const rect = cardRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : (position.x === -1 ? Math.max(10, (window.innerWidth - 720) / 2) : position.x);
    const currentY = rect ? rect.top : position.y;

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: currentX,
      startY: currentY
    };

    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const currentMouseX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentMouseY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentMouseX - dragStartRef.current.mouseX;
      const deltaY = currentMouseY - dragStartRef.current.mouseY;

      const hudWidth = 720;
      const hudHeight = 640;
      const maxX = Math.max(10, window.innerWidth - hudWidth - 10);
      const maxY = Math.max(10, window.innerHeight - hudHeight - 10);

      const nextX = Math.min(Math.max(10, dragStartRef.current.startX + deltaX), maxX);
      const nextY = Math.min(Math.max(60, dragStartRef.current.startY + deltaY), maxY);

      setPosition({ x: nextX, y: nextY });
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
      setPosition((curr) => {
        if (curr.x !== -1) {
          localStorage.setItem(STORAGE_POS_KEY, JSON.stringify(curr));
        }
        return curr;
      });
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('touchend', handleDragEnd);
  };

  if (!isOpen) return null;

  const allTags = Array.from(
    new Set(tasks.flatMap((t) => t.metadata?.tags || []).filter(Boolean))
  );

  const stageProfiles = loadStageProfiles();

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const tagMatches = quickTitle.match(/#(\w+)/g);
    const extractedTags = tagMatches ? tagMatches.map((t) => t.slice(1)) : [];
    const cleanTitle = quickTitle.replace(/#(\w+)/g, '').trim();

    mbbEngineStore.addTask({
      title: cleanTitle,
      type: quickType,
      priority: quickPriority,
      tags: extractedTags,
      stage_profile_id: quickStageProfile || undefined,
      auto_stop_on: quickType === 'ticker' ? ['sleep'] : undefined
    });

    setQuickTitle('');
    setQuickPriority(0);
    showToast(`Added ${quickType}: ${cleanTitle}`);
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'active' && (task.status === 'completed' || task.status === 'half')) return false;
    if (activeTab === 'half' && task.status !== 'half') return false;
    if (activeTab === 'completed' && task.status !== 'completed') return false;
    if (selectedTag && !task.metadata?.tags?.includes(selectedTag)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = (task.notes || '').toLowerCase().includes(q);
      const matchTag = task.metadata?.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchNotes && !matchTag) return false;
    }

    return true;
  });

  const folderTree = buildEmojiFolderTree(filteredTasks);

  const renderFolderNode = (node: EmojiFolderNode, depth = 0) => {
    const subfolderKeys = Object.keys(node.subfolders);
    const hasChildren = subfolderKeys.length > 0 || node.tasks.length > 0;
    if (!hasChildren && depth > 0) return null;

    return (
      <div key={node.fullPath || 'root'} style={{ marginLeft: depth > 0 ? '16px' : '0px', marginTop: '6px' }}>
        {depth > 0 && (
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#181524', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <span>{node.emoji || '📁'}</span>
            <span>{node.name}</span>
            <span style={{ fontSize: '0.75rem', color: '#4A4458', fontWeight: 700 }}>({node.tasks.length})</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {node.tasks.map((task) => {
            const priorityInfo = PRIORITY_MAP[task.metadata?.priority || 0];
            const isCompleted = task.status === 'completed';
            const isHalf = task.status === 'half';

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  border: '2px solid #000',
                  borderRadius: '10px',
                  backgroundColor: isCompleted ? 'rgba(241, 245, 249, 0.92)' : isHalf ? 'rgba(254, 249, 195, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '1px 1px 0px #000',
                  opacity: isCompleted ? 0.75 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => {
                      if (isCompleted) {
                        mbbEngineStore.updateTask(task.id, { status: 'needsAction' });
                      } else {
                        mbbEngineStore.completeTask(task.id);
                        showToast(`✓ Completed ${task.title}`);
                      }
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#181524' }}
                  />

                  {isHalf && (
                    <span title="Half-Completed" style={{ fontSize: '1rem' }}>
                      🌗
                    </span>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: '#181524'
                        }}
                      >
                        {task.metadata?.emoji ? `${task.metadata.emoji} ` : ''}
                        {task.metadata?.cleanTitle || task.title}
                      </span>

                      {task.type === 'ticker' && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            backgroundColor: '#E9D5FF',
                            color: '#181524',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            border: '1px solid #000'
                          }}
                        >
                          🔢 {task.metadata?.roman || toRomanNumeral(task.metadata?.count || 0) || '0'} ({task.metadata?.count || 0})
                        </span>
                      )}

                      {task.metadata?.max_stage && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#DCFCE7',
                            color: '#14532D',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            border: '1px solid #000',
                            fontWeight: 800
                          }}
                        >
                          🎯 {task.metadata.max_stage}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {task.due && (
                        <span style={{ fontSize: '0.7rem', color: '#181524', fontWeight: 700 }}>
                          📅 Due: {task.due}
                        </span>
                      )}
                      {task.defer_until && (
                        <span style={{ fontSize: '0.7rem', color: '#581C87', fontWeight: 700 }}>
                          ⏳ Deferred: {task.defer_until}
                        </span>
                      )}
                      {task.metadata?.tags?.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#E6E6FA',
                            color: '#181524',
                            fontWeight: 700,
                            padding: '0px 4px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1'
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {task.type === 'ticker' && !isCompleted && (
                    <button
                      onClick={() => {
                        mbbEngineStore.tick(task.id);
                        showToast(`Tick! +1 for ${task.title}`);
                      }}
                      style={{
                        padding: '3px 8px',
                        backgroundColor: '#C084FC',
                        color: '#181524',
                        border: '1px solid #000',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      +1 Tick
                    </button>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => {
                        mbbEngineStore.setHalfCompleted(task.id);
                        showToast(`Marked half-done (guilt-free)`);
                      }}
                      title="Half-Completed"
                      style={{
                        padding: '3px 8px',
                        backgroundColor: '#FEF08A',
                        color: '#181524',
                        border: '1px solid #000',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      🌗 Half
                    </button>
                  )}

                  {!isCompleted && (
                    <button
                      onClick={() => {
                        mbbEngineStore.skipTask(task.id);
                        showToast(`Skipped for today`);
                      }}
                      title="Skip for today"
                      style={{
                        padding: '3px 8px',
                        backgroundColor: '#E2E8F0',
                        color: '#181524',
                        border: '1px solid #000',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      ⏭️ Skip
                    </button>
                  )}

                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: priorityInfo.color,
                      color: '#181524',
                      fontWeight: 800,
                      border: '1px solid #000'
                    }}
                  >
                    {priorityInfo.emoji}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {subfolderKeys.map((sub) => renderFolderNode(node.subfolders[sub], depth + 1))}
      </div>
    );
  };

  const blurPx = Math.max(4, Math.round((1 - surfaceOpacity) * 16));
  const cardBgColor = `rgba(255, 245, 250, ${surfaceOpacity})`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      <div
        ref={cardRef}
        style={{
          pointerEvents: 'auto',
          position: 'fixed',
          ...(position.x === -1
            ? { left: '50%', transform: 'translateX(-50%)', top: `${position.y}px` }
            : { left: `${position.x}px`, top: `${position.y}px` }),
          backgroundColor: cardBgColor,
          backdropFilter: `blur(${blurPx}px)`,
          WebkitBackdropFilter: `blur(${blurPx}px)`,
          border: '3px solid #000',
          borderRadius: '16px',
          width: 'min(720px, calc(100vw - 32px))',
          maxHeight: 'min(640px, calc(100vh - 100px))',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          boxShadow: '6px 6px 0px #000',
          fontFamily: 'inherit',
          color: '#181524',
          userSelect: 'none'
        }}
      >
        {/* Modal Top Header / Drag Handle */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            cursor: 'grab',
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1.5px solid #000'
          }}
          title="Click & Drag to reposition anywhere on screen"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>🐾</span>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#181524' }}>
              MBB Flight Deck & Task Board
            </h2>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                backgroundColor: '#F3E8FF',
                color: '#181524',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid #000'
              }}
            >
              FLOATING HUD
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'auto' }} onMouseDown={(e) => e.stopPropagation()}>
            {/* Opacity Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }} title={`Surface Opacity: ${Math.round(surfaceOpacity * 100)}%`}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#181524' }}>
                {Math.round(surfaceOpacity * 100)}%
              </span>
              <input
                type="range"
                min="0.35"
                max="1.0"
                step="0.05"
                value={surfaceOpacity}
                onChange={(e) => updateSurfaceOpacity(parseFloat(e.target.value))}
                style={{
                  width: '46px',
                  height: '14px',
                  cursor: 'pointer',
                  accentColor: '#A855F7'
                }}
              />
            </div>

            {position.x !== -1 && (
              <button
                onClick={handleDockToCenter}
                title="Reset position"
                style={{
                  background: '#F1F5F9',
                  color: '#181524',
                  border: '1px solid #000',
                  borderRadius: '5px',
                  fontSize: '0.72rem',
                  padding: '2px 5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Center
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: '#E6E6FA',
                color: '#181524',
                border: '1.5px solid #000',
                borderRadius: '6px',
                padding: '3px 10px',
                cursor: 'pointer',
                fontWeight: 900,
                boxShadow: '1px 1px 0px #000'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Weekly Stage Rollup Bar */}
        {weeklyRollup.length > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(237, 233, 254, 0.9)',
              border: '2px solid #000',
              borderRadius: '8px',
              padding: '6px 12px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#181524' }}>
              📊 Weekly Stage Rollup (Last 7 Days):
            </span>
            {weeklyRollup.map((r) => (
              <span
                key={r.stageKey}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: '#FFF',
                  color: '#181524',
                  border: '1px solid #000',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                {r.label}: {r.count}x
              </span>
            ))}
          </div>
        )}

        {/* Quick Add Form */}
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Add task or <emoji>//<folder>/<title> (e.g. 🤣//jokes/true)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            style={{
              flex: 2,
              minWidth: '220px',
              padding: '6px 10px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 700,
              color: '#181524'
            }}
          />
          <select
            value={quickType}
            onChange={(e) => setQuickType(e.target.value as MBBTask['type'])}
            style={{
              padding: '6px',
              border: '2px solid #000',
              borderRadius: '8px',
              fontWeight: 800,
              backgroundColor: '#FFF',
              color: '#181524'
            }}
          >
            <option value="task">📝 Task</option>
            <option value="ticker">🔢 Ticker</option>
            <option value="event">⚡ Event</option>
          </select>

          {stageProfiles.length > 0 && (
            <select
              value={quickStageProfile}
              onChange={(e) => setQuickStageProfile(e.target.value)}
              style={{
                padding: '6px',
                border: '2px solid #000',
                borderRadius: '8px',
                fontWeight: 800,
                backgroundColor: '#FFF',
                color: '#181524'
              }}
            >
              <option value="">🎯 No Stage Profile</option>
              {stageProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  🎯 {p.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(Number(e.target.value) as TaskPriority)}
            style={{
              padding: '6px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: PRIORITY_MAP[quickPriority].color,
              color: '#181524',
              fontWeight: 800
            }}
          >
            <option value={0}>🌸 None</option>
            <option value={1}>💜 Low</option>
            <option value={2}>✨ Med</option>
            <option value={3}>🐾 High</option>
          </select>

          <button
            type="submit"
            style={{
              padding: '6px 14px',
              backgroundColor: '#818CF8',
              color: '#181524',
              border: '2px solid #000',
              borderRadius: '8px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '1px 1px 0px #000'
            }}
          >
            + Add
          </button>
        </form>

        {/* Search & Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 700,
              color: '#181524'
            }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['active', 'half', 'completed', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 10px',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  backgroundColor: activeTab === tab ? '#181524' : '#E6E6FA',
                  color: activeTab === tab ? '#FFF' : '#181524',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'half' ? '🌗 Half-Done' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                padding: '2px 8px',
                border: '1px solid #000',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: selectedTag === null ? '#181524' : '#FFF',
                color: selectedTag === null ? '#FFF' : '#181524',
                cursor: 'pointer'
              }}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                style={{
                  padding: '2px 8px',
                  border: '1px solid #000',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  backgroundColor: selectedTag === tag ? '#A855F7' : '#FFF',
                  color: selectedTag === tag ? '#FFF' : '#181524',
                  cursor: 'pointer'
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Folder Hierarchy & Task List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#181524', fontWeight: 800 }}>
              🐾 No tasks found!
            </div>
          ) : (
            renderFolderNode(folderTree)
          )}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: '#181524',
              color: '#FFF',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { mbbEngineStore } from '../mbbEngine';
import { MBBTask, TaskPriority, EmojiFolderNode, WeeklyStageSummary } from '../types';
import { buildEmojiFolderTree } from '../emojiFolders';
import { toRomanNumeral } from '../roman';
import { loadStageProfiles } from '../stageDirector';

export type FlightDeckMode = 'collapsed' | 'minimap' | 'full';

interface HudPosition {
  x: number;
  y: number;
}

const STORAGE_MODE_KEY = 'mbb_flight_deck_mode_v2';
const STORAGE_POS_KEY = 'mbb_flight_deck_pos_v2';
const STORAGE_OPACITY_KEY = 'mbb_flight_deck_surface_opacity_v2';
const LEGACY_STORAGE_OPEN_KEY = 'mbb_quickbar_open';

const PRIORITY_MAP: Record<TaskPriority, { label: string; color: string; emoji: string }> = {
  0: { label: 'None', color: '#94A3B8', emoji: '🌸' },
  1: { label: 'Low', color: '#38BDF8', emoji: '💜' },
  2: { label: 'Med', color: '#FBBF24', emoji: '✨' },
  3: { label: 'High', color: '#F43F5E', emoji: '🐾' }
};

export const MBBQuickBarWidget: React.FC<{ onOpenModal?: () => void }> = () => {
  const [tasks, setTasks] = useState<MBBTask[]>([]);
  const [weeklyRollup, setWeeklyRollup] = useState<WeeklyStageSummary[]>([]);

  // HUD State: collapsed | minimap | full
  const [mode, setMode] = useState<FlightDeckMode>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedMode = localStorage.getItem(STORAGE_MODE_KEY) as FlightDeckMode;
      if (savedMode && ['collapsed', 'minimap', 'full'].includes(savedMode)) {
        return savedMode;
      }
      // Migrate legacy open flag if present
      const legacyOpen = localStorage.getItem(LEGACY_STORAGE_OPEN_KEY);
      if (legacyOpen !== null) {
        return legacyOpen === 'true' ? 'minimap' : 'collapsed';
      }
    }
    return 'minimap';
  });

  // Coordinates
  const [position, setPosition] = useState<HudPosition>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_POS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            return parsed;
          }
        } catch (e) {}
      }
    }
    return { x: -1, y: 80 }; // -1 indicates default edge-docked right
  });

  // Surface Opacity / Alpha (0.35 to 1.0)
  const [surfaceOpacity, setSurfaceOpacity] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_OPACITY_KEY);
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.35 && val <= 1.0) {
          return val;
        }
      }
    }
    return 0.94;
  });

  // Task filtering & creation states for full mode
  const [activeTab, setActiveTab] = useState<'active' | 'half' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick entry states
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>(0);
  const [quickType, setQuickType] = useState<MBBTask['type']>('task');
  const [quickStageProfile, setQuickStageProfile] = useState<string>('');

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0
  });
  const hudCardRef = useRef<HTMLDivElement>(null);

  // Sync tasks from store
  useEffect(() => {
    const unsub = mbbEngineStore.subscribe((all) => {
      setTasks(all);
      setWeeklyRollup(mbbEngineStore.getWeeklyStageRollup());
    });
    return unsub;
  }, []);

  // Save mode changes & broadcast to legacy listeners
  const updateMode = useCallback((newMode: FlightDeckMode) => {
    setMode(newMode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_MODE_KEY, newMode);
      localStorage.setItem(LEGACY_STORAGE_OPEN_KEY, String(newMode !== 'collapsed'));
    }
    window.dispatchEvent(new CustomEvent('mbb-toggle-quickbar', { detail: { open: newMode !== 'collapsed', mode: newMode } }));
  }, []);

  // Save opacity changes
  const updateSurfaceOpacity = useCallback((newOpacity: number) => {
    const clamped = Math.max(0.35, Math.min(1.0, newOpacity));
    setSurfaceOpacity(clamped);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_OPACITY_KEY, clamped.toFixed(2));
    }
  }, []);

  // Listen for Navbar eye icon or external events
  useEffect(() => {
    const handleToggleEvent = (e: any) => {
      if (e?.detail) {
        if (typeof e.detail.mode === 'string' && ['collapsed', 'minimap', 'full'].includes(e.detail.mode)) {
          setMode(e.detail.mode);
          localStorage.setItem(STORAGE_MODE_KEY, e.detail.mode);
          localStorage.setItem(LEGACY_STORAGE_OPEN_KEY, String(e.detail.mode !== 'collapsed'));
          return;
        }
        if (typeof e.detail.open === 'boolean') {
          const next = e.detail.open ? 'minimap' : 'collapsed';
          setMode(next);
          localStorage.setItem(STORAGE_MODE_KEY, next);
          localStorage.setItem(LEGACY_STORAGE_OPEN_KEY, String(e.detail.open));
          return;
        }
      }
      // Toggle collapsed <-> minimap
      setMode((prev) => {
        const next = prev === 'collapsed' ? 'minimap' : 'collapsed';
        localStorage.setItem(STORAGE_MODE_KEY, next);
        localStorage.setItem(LEGACY_STORAGE_OPEN_KEY, String(next !== 'collapsed'));
        return next;
      });
    };

    window.addEventListener('mbb-toggle-quickbar', handleToggleEvent);
    return () => window.removeEventListener('mbb-toggle-quickbar', handleToggleEvent);
  }, []);

  // Clamp positioning to viewport on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (prev.x === -1) return prev; // Docked
        const hudWidth = mode === 'full' ? 720 : 320;
        const hudHeight = mode === 'full' ? 640 : 480;
        const maxX = Math.max(10, window.innerWidth - hudWidth - 10);
        const maxY = Math.max(10, window.innerHeight - hudHeight - 10);
        const clampedX = Math.min(Math.max(10, prev.x), maxX);
        const clampedY = Math.min(Math.max(60, prev.y), maxY);
        if (clampedX !== prev.x || clampedY !== prev.y) {
          const updated = { x: clampedX, y: clampedY };
          localStorage.setItem(STORAGE_POS_KEY, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode]);

  // Dock to right edge
  const handleDockToEdge = () => {
    const reset = { x: -1, y: 80 };
    setPosition(reset);
    localStorage.removeItem(STORAGE_POS_KEY);
  };

  // Drag Handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only drag from header handle
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    isDraggingRef.current = true;
    const rect = hudCardRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : (position.x === -1 ? window.innerWidth - (mode === 'full' ? 740 : 340) : position.x);
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

      const hudWidth = mode === 'full' ? 720 : 320;
      const hudHeight = mode === 'full' ? 620 : 420;
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Create Task Handler
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

  // Filter tasks
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

  const allTags = Array.from(new Set(tasks.flatMap((t) => t.metadata?.tags || []).filter(Boolean)));
  const stageProfiles = loadStageProfiles();
  const folderTree = buildEmojiFolderTree(filteredTasks);

  const activeTickers = tasks.filter((t) => t.type === 'ticker' && t.status !== 'completed');
  const activeTasks = tasks.filter((t) => t.status === 'needsAction' || t.status === 'half');
  const topPriorityTasks = activeTasks
    .filter((t) => (t.metadata?.priority || 0) >= 2 || t.type !== 'ticker')
    .slice(0, 5);

  // Render a folder branch
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

  const isCollapsed = mode === 'collapsed';
  const isFull = mode === 'full';
  const hudWidth = isFull ? 'min(720px, calc(100vw - 32px))' : '320px';
  const hudMaxHeight = isFull ? 'min(640px, calc(100vh - 100px))' : 'min(500px, calc(100vh - 120px))';

  // Compute card surface background using surfaceOpacity (alpha channel)
  const surfaceAlpha = surfaceOpacity;
  const cardBgColor = `rgba(255, 245, 250, ${surfaceAlpha})`;
  const blurPx = Math.max(4, Math.round((1 - surfaceOpacity) * 16));

  const hudStyle: React.CSSProperties = {
    pointerEvents: 'auto',
    position: 'fixed',
    ...(position.x === -1
      ? { right: '16px', top: `${position.y}px` }
      : { left: `${position.x}px`, top: `${position.y}px` }),
    width: hudWidth,
    maxHeight: hudMaxHeight,
    backgroundColor: cardBgColor,
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`,
    border: '2px solid #000',
    borderRadius: '14px',
    boxShadow: '6px 6px 0px #000',
    zIndex: 999,
    padding: '12px',
    fontFamily: 'inherit',
    color: '#181524',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: isDraggingRef.current ? 'none' : 'width 0.22s ease-out, max-height 0.22s ease-out, background-color 0.15s ease-out',
    userSelect: 'none'
  };

  return (
    <>
      {/* 1. Unobtrusive Edge Wing Button (< 🐾 MBB) pinned to right edge */}
      <button
        onClick={() => updateMode(isCollapsed ? 'minimap' : 'collapsed')}
        title={isCollapsed ? 'Open MBB Flight Deck (Minimap)' : 'Collapse MBB Flight Deck (Wing)'}
        style={{
          position: 'fixed',
          right: !isCollapsed && position.x === -1 ? (isFull ? 'min(736px, calc(100vw - 16px))' : '336px') : '0px',
          top: '110px',
          zIndex: 1000,
          background: '#FFF5FA',
          border: '2px solid #000',
          borderRight: !isCollapsed && position.x === -1 ? '2px solid #000' : 'none',
          borderRadius: '8px 0 0 8px',
          boxShadow: '-2px 2px 0px #000',
          padding: '6px 8px',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: '0.85rem',
          color: '#181524',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'right 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          userSelect: 'none'
        }}
      >
        <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{isCollapsed ? '‹' : '›'}</span>
        {isCollapsed && (
          <span style={{ fontSize: '0.72rem', writingMode: 'vertical-rl', textOrientation: 'mixed', fontWeight: 900, letterSpacing: '1px' }}>
            🐾 MBB
          </span>
        )}
      </button>

      {/* 2. Non-Blocking Floating HUD Container (Pointer-events: none wrapper) */}
      {!isCollapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 999
          }}
        >
          <div ref={hudCardRef} style={hudStyle}>
            {/* Header / Drag Handle */}
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #000',
                paddingBottom: '8px',
                cursor: 'grab',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                margin: '-4px -4px 0 -4px',
                padding: '4px 6px',
                borderRadius: '8px 8px 0 0'
              }}
              title="Click & Drag to reposition floating HUD anywhere on screen"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem' }}>🐾</span>
                <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#181524' }}>
                  MBB Flight Deck
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    backgroundColor: isFull ? '#F3E8FF' : '#E0F2FE',
                    color: '#181524',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    border: '1px solid #000'
                  }}
                >
                  {isFull ? 'FULL MAP' : 'MINIMAP'}
                </span>
              </div>

              {/* Header Controls: Opacity Slider, Full/Minimap Toggle, Dock, Collapse */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', pointerEvents: 'auto' }} onMouseDown={(e) => e.stopPropagation()}>
                {/* Transparency Slider */}
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

                {/* Dock to Edge Button (visible if moved) */}
                {position.x !== -1 && (
                  <button
                    onClick={handleDockToEdge}
                    title="Dock to Right Edge"
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
                    Dock
                  </button>
                )}

                {/* Shrink / Morph Toggle (Full <-> Minimap) */}
                <button
                  onClick={() => updateMode(isFull ? 'minimap' : 'full')}
                  title={isFull ? 'Shrink to Minimap HUD' : 'Expand to Full Map Board'}
                  style={{
                    background: isFull ? '#E0F2FE' : '#A855F7',
                    color: isFull ? '#181524' : '#FFF',
                    border: '1px solid #000',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isFull ? '⤡ Minimap' : '⤢ Full Map'}
                </button>

                {/* Close / Collapse Button */}
                <button
                  onClick={() => updateMode('collapsed')}
                  title="Collapse to Wing"
                  style={{
                    background: '#CBD5E1',
                    color: '#181524',
                    border: '1px solid #000',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    padding: '1px 5px',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 3. MINIMAP CONTENT VIEW */}
            {!isFull && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                {/* Slim 1-Line Quick Capture */}
                <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    placeholder="Quick Capture + Enter..."
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      border: '1.5px solid #000',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#181524',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#C084FC',
                      color: '#181524',
                      border: '1.5px solid #000',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </form>

                {/* Active Tickers (1-Click Bar) */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#181524', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Active Tickers ({activeTickers.length})</span>
                    <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>1-Click Increment</span>
                  </div>
                  {activeTickers.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic', padding: '2px 0' }}>
                      No active tickers
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                      {activeTickers.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #000',
                            borderRadius: '6px',
                            fontSize: '0.78rem'
                          }}
                        >
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', fontWeight: 800, color: '#181524' }}>
                            {t.metadata?.emoji || '💊'} {t.metadata?.cleanTitle || t.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: 800, color: '#7E22CE', fontSize: '0.75rem' }}>
                              {t.metadata?.roman || toRomanNumeral(t.metadata?.count || 0) || '0'}
                            </span>
                            <button
                              onClick={() => {
                                mbbEngineStore.tick(t.id);
                                showToast(`+1 for ${t.title}`);
                              }}
                              style={{
                                padding: '1px 6px',
                                backgroundColor: '#C084FC',
                                color: '#181524',
                                border: '1px solid #000',
                                borderRadius: '4px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              +1
                            </button>
                            <button
                              onClick={() => {
                                mbbEngineStore.completeTask(t.id);
                                showToast(`✓ Completed ${t.title}`);
                              }}
                              style={{
                                padding: '1px 6px',
                                backgroundColor: '#86EFAC',
                                color: '#181524',
                                border: '1px solid #000',
                                borderRadius: '4px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Priority Tasks (Without Tag Bloat) */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#181524', marginBottom: '3px' }}>
                    Top Priority Tasks ({topPriorityTasks.length})
                  </div>
                  {topPriorityTasks.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic' }}>
                      All caught up! 🎉
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '130px', overflowY: 'auto' }}>
                      {topPriorityTasks.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #000',
                            borderRadius: '6px',
                            fontSize: '0.78rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                            <input
                              type="checkbox"
                              checked={t.status === 'completed'}
                              onChange={() => {
                                mbbEngineStore.completeTask(t.id);
                                showToast(`✓ Completed ${t.title}`);
                              }}
                              style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#181524' }}
                            />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', fontWeight: 800, color: '#181524' }}>
                              {t.metadata?.cleanTitle || t.title}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem' }}>
                            {PRIORITY_MAP[t.metadata?.priority || 0]?.emoji || '🌸'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mini Rollup Bar */}
                {weeklyRollup.length > 0 && (
                  <div style={{ borderTop: '1px dashed #000', paddingTop: '4px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#181524' }}>
                      Weekly Milestones:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                      {weeklyRollup.slice(0, 3).map((r) => (
                        <span
                          key={r.stageKey}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: '#F3E8FF',
                            color: '#181524',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            border: '1px solid #000'
                          }}
                        >
                          {r.label.split(' ')[0]}: {r.count}x
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Count & Expand Hint */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#181524', fontWeight: 700, borderTop: '1px solid rgba(0,0,0,0.15)', paddingTop: '4px' }}>
                  <span>{activeTasks.length} active tasks</span>
                  <button
                    onClick={() => updateMode('full')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7E22CE',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    View All Folders ↗
                  </button>
                </div>
              </div>
            )}

            {/* 4. FULL MAP CONTENT VIEW */}
            {isFull && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
                {/* Weekly Stage Rollup Bar */}
                {weeklyRollup.length > 0 && (
                  <div
                    style={{
                      backgroundColor: 'rgba(237, 233, 254, 0.9)',
                      border: '2px solid #000',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#181524' }}>
                      📊 Weekly Stage Rollup:
                    </span>
                    {weeklyRollup.map((r) => (
                      <span
                        key={r.stageKey}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: '#FFF',
                          color: '#181524',
                          border: '1px solid #000',
                          padding: '1px 5px',
                          borderRadius: '4px'
                        }}
                      >
                        {r.label}: {r.count}x
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Add Form with Types, Profiles, Priority */}
                <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Add task or <emoji>//<folder>/<title> (e.g. 🤣//jokes/true)..."
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    style={{
                      flex: 2,
                      minWidth: '200px',
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
                      padding: '6px 12px',
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
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '140px',
                      padding: '5px 8px',
                      border: '2px solid #000',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 700,
                      color: '#181524'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {(['active', 'half', 'completed', 'all'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: '4px 8px',
                          border: '2px solid #000',
                          borderRadius: '6px',
                          backgroundColor: activeTab === tab ? '#181524' : '#E6E6FA',
                          color: activeTab === tab ? '#FFF' : '#181524',
                          fontWeight: 800,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}
                      >
                        {tab === 'half' ? '🌗 Half' : tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Filters */}
                {allTags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <button
                      onClick={() => setSelectedTag(null)}
                      style={{
                        padding: '1px 6px',
                        border: '1px solid #000',
                        borderRadius: '10px',
                        fontSize: '0.72rem',
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
                          padding: '1px 6px',
                          border: '1px solid #000',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
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

                {/* Folder Tree Hierarchy */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px' }}>
                  {filteredTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#181524', fontWeight: 800 }}>
                      🐾 No tasks found in this view!
                    </div>
                  ) : (
                    renderFolderNode(folderTree)
                  )}
                </div>
              </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
              <div
                style={{
                  marginTop: '4px',
                  padding: '4px 8px',
                  backgroundColor: '#181524',
                  color: '#FFF',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '0.78rem'
                }}
              >
                {toastMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
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

export const MBBTaskBoardModal: React.FC<MBBTaskBoardModalProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<MBBTask[]>([]);
  const [weeklyRollup, setWeeklyRollup] = useState<WeeklyStageSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'half' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  if (!isOpen) return null;

  // Extract all unique tags
  const allTags = Array.from(
    new Set(tasks.flatMap((t) => t.metadata?.tags || []).filter(Boolean))
  );

  const stageProfiles = loadStageProfiles();

  // Create Task Handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    // Inline #tag extraction
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
    // Tab filter
    if (activeTab === 'active' && (task.status === 'completed' || task.status === 'half')) return false;
    if (activeTab === 'half' && task.status !== 'half') return false;
    if (activeTab === 'completed' && task.status !== 'completed') return false;

    // Tag filter
    if (selectedTag && !task.metadata?.tags?.includes(selectedTag)) return false;

    // Search query filter
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

  // Render a folder branch
  const renderFolderNode = (node: EmojiFolderNode, depth = 0) => {
    const subfolderKeys = Object.keys(node.subfolders);
    const hasChildren = subfolderKeys.length > 0 || node.tasks.length > 0;
    if (!hasChildren && depth > 0) return null;

    return (
      <div key={node.fullPath || 'root'} style={{ marginLeft: depth > 0 ? '16px' : '0px', marginTop: '6px' }}>
        {depth > 0 && (
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <span>{node.emoji || '📁'}</span>
            <span>{node.name}</span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>({node.tasks.length})</span>
          </div>
        )}

        {/* Tasks directly in this folder node */}
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
                  backgroundColor: isCompleted ? '#F1F5F9' : isHalf ? '#FEF9C3' : '#FFFFFF',
                  boxShadow: '1px 1px 0px #000',
                  opacity: isCompleted ? 0.7 : 1
                }}
              >
                {/* Left: Checkbox / Status & Title */}
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
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />

                  {/* Half-Done Indicator */}
                  {isHalf && (
                    <span title="Half-Completed" style={{ fontSize: '1rem' }}>
                      🌗
                    </span>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: '#1E1E2E'
                        }}
                      >
                        {task.metadata?.emoji ? `${task.metadata.emoji} ` : ''}
                        {task.metadata?.cleanTitle || task.title}
                      </span>

                      {/* Ticker badge */}
                      {task.type === 'ticker' && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: '#E9D5FF',
                            color: '#6B21A8',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            border: '1px solid #C084FC'
                          }}
                        >
                          🔢 {task.metadata?.roman || toRomanNumeral(task.metadata?.count || 0) || '0'} ({task.metadata?.count || 0})
                        </span>
                      )}

                      {/* Milestone badge */}
                      {task.metadata?.max_stage && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            border: '1px solid #86EFAC'
                          }}
                        >
                          🎯 {task.metadata.max_stage}
                        </span>
                      )}
                    </div>

                    {/* Sub-tags and defer info */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {task.due && (
                        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                          📅 Due: {task.due}
                        </span>
                      )}
                      {task.defer_until && (
                        <span style={{ fontSize: '0.7rem', color: '#9333EA' }}>
                          ⏳ Deferred: {task.defer_until}
                        </span>
                      )}
                      {task.metadata?.tags?.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#E6E6FA',
                            padding: '0px 4px',
                            borderRadius: '4px'
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Tick, Half, Skip, Priority) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* Ticker +1 */}
                  {task.type === 'ticker' && !isCompleted && (
                    <button
                      onClick={() => {
                        mbbEngineStore.tick(task.id);
                        showToast(`Tick! +1 for ${task.title}`);
                      }}
                      style={{
                        padding: '3px 8px',
                        backgroundColor: '#C084FC',
                        color: '#FFF',
                        border: '1px solid #000',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      +1 Tick
                    </button>
                  )}

                  {/* Half-Done Toggle */}
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
                        border: '1px solid #000',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🌗 Half
                    </button>
                  )}

                  {/* Skip Button */}
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        mbbEngineStore.skipTask(task.id);
                        showToast(`Skipped without guilt!`);
                      }}
                      title="Skip without overdue guilt"
                      style={{
                        padding: '3px 8px',
                        backgroundColor: '#E2E8F0',
                        border: '1px solid #000',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ⏭️ Skip
                    </button>
                  )}

                  {/* Priority Tag */}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: priorityInfo.color,
                      color: '#FFF',
                      fontWeight: 'bold',
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

        {/* Recursively render subfolders */}
        {subfolderKeys.map((sub) => renderFolderNode(node.subfolders[sub], depth + 1))}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFF0F5',
          border: '4px solid #000',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          boxShadow: '8px 8px 0px #000',
          fontFamily: 'inherit'
        }}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🐾</span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#2E1A47' }}>
              MBB Flight Deck & Task Board
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#E6E6FA',
              border: '2px solid #000',
              borderRadius: '8px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '2px 2px 0px #000'
            }}
          >
            ✕ Esc
          </button>
        </div>

        {/* Weekly Stage Rollup Bar */}
        {weeklyRollup.length > 0 && (
          <div
            style={{
              backgroundColor: '#EDE9FE',
              border: '2px solid #000',
              borderRadius: '8px',
              padding: '6px 12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#5B21B6' }}>
              📊 Weekly Stage Rollup (Last 7 Days):
            </span>
            {weeklyRollup.map((r) => (
              <span
                key={r.stageKey}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  backgroundColor: '#FFF',
                  border: '1px solid #7C3AED',
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
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Add task or <emoji>//<folder>/<title> (e.g. 🤣//jokes/true)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            style={{
              flex: 2,
              minWidth: '220px',
              padding: '8px 12px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#FFF',
              fontWeight: 600
            }}
          />
          <select
            value={quickType}
            onChange={(e) => setQuickType(e.target.value as MBBTask['type'])}
            style={{
              padding: '8px',
              border: '2px solid #000',
              borderRadius: '8px',
              fontWeight: 'bold',
              backgroundColor: '#FFF'
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
                padding: '8px',
                border: '2px solid #000',
                borderRadius: '8px',
                fontWeight: 'bold',
                backgroundColor: '#FFF'
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
              padding: '8px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: PRIORITY_MAP[quickPriority].color,
              color: '#FFF',
              fontWeight: 'bold'
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
              padding: '8px 16px',
              backgroundColor: '#818CF8',
              color: '#FFF',
              border: '2px solid #000',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #000'
            }}
          >
            + Add
          </button>
        </form>

        {/* Search & Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
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
              backgroundColor: '#FFF'
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
                  backgroundColor: activeTab === tab ? '#2E1A47' : '#E6E6FA',
                  color: activeTab === tab ? '#FFF' : '#000',
                  fontWeight: 'bold',
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
                backgroundColor: selectedTag === null ? '#A855F7' : '#FFF',
                color: selectedTag === null ? '#FFF' : '#000',
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
                  backgroundColor: selectedTag === tag ? '#A855F7' : '#FFF',
                  color: selectedTag === tag ? '#FFF' : '#000',
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
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
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
              backgroundColor: '#2E1A47',
              color: '#FFF',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 'bold',
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

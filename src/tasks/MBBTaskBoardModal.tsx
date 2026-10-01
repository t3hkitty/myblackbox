/**
 * 🐾 MBB React Task Board Modal
 * High-Density Kawaii Brutalist React Modal UI 🌸
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MBBTask, TaskFilterTab, TaskPriority } from './types';
import { mbbTaskStore } from './store';
import { PRIORITY_MAP } from './priority';

export interface MBBTaskBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MBBTaskBoardModal: React.FC<MBBTaskBoardModalProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<MBBTask[]>([]);
  const [activeTab, setActiveTab] = useState<TaskFilterTab>(() => {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('mbb_task_filter_tab') as TaskFilterTab) || 'active';
    }
    return 'active';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state from store
  useEffect(() => {
    const unsubscribe = mbbTaskStore.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
    });
    return () => unsubscribe();
  }, []);

  // Save active tab preference
  const handleTabChange = (tab: TaskFilterTab) => {
    setActiveTab(tab);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mbb_task_filter_tab', tab);
    }
  };

  // Keyboard accessibility: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  // Inline #tag parser & task creation
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    // Extract tags matching #tag
    const tagMatches = quickTitle.match(/#[\w-]+/g) || [];
    const tags = tagMatches.map((t) => t.slice(1));
    const cleanTitle = quickTitle.replace(/#[\w-]+/g, '').trim();

    mbbTaskStore.addTask({
      title: cleanTitle || quickTitle,
      status: 'needsAction',
      metadata: {
        priority: quickPriority,
        tags: tags.length > 0 ? tags : undefined,
      },
    });

    setQuickTitle('');
    setQuickPriority(0);
    triggerToast('✨ Task created!');
  };

  const handleToggleTask = (id: string, currentStatus: string) => {
    if (currentStatus === 'completed') {
      mbbTaskStore.updateTask(id, { status: 'needsAction', completed: undefined });
      triggerToast('🌸 Task reopened');
    } else {
      const res = mbbTaskStore.completeTask(id);
      if (res?.spawnedTask) {
        triggerToast('🔄 Task completed & recurring task spawned!');
      } else {
        triggerToast('🐾 Task completed!');
      }
    }
  };

  // Collect all unique tags for filter chips
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => {
      t.metadata?.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [tasks]);

  // Filter tasks based on tab, search query, and tag
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'active' && task.status !== 'needsAction') return false;
      if (activeTab === 'completed' && task.status !== 'completed') return false;

      // Tag filter
      if (selectedTag && !task.metadata?.tags?.includes(selectedTag)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesNotes) return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedTag, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(30, 30, 46, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: '#FFFBEB',
          border: '2px solid #000',
          borderRadius: '32px',
          boxShadow: '4px 4px 0px #000',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2E1A47', fontWeight: 800 }}>
            🐾 MBB Task Board 🌸
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#E6E6FA',
              border: '2px solid #000',
              borderRadius: '8px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '2px 2px 0px #000',
            }}
          >
            ✕ Esc
          </button>
        </div>

        {/* Quick Entry Bar */}
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Add task... (use #tag for tags)"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              fontWeight: 500,
            }}
          />
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(Number(e.target.value) as TaskPriority)}
            style={{
              padding: '8px',
              border: '2px solid #000',
              borderRadius: '8px',
              backgroundColor: PRIORITY_MAP[quickPriority].color,
              color: '#FFF',
              fontWeight: 'bold',
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
              boxShadow: '2px 2px 0px #000',
            }}
          >
            + Add
          </button>
        </form>

        {/* Controls: Search & Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
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
              backgroundColor: '#FFFFFF',
            }}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['active', 'completed', 'all'] as TaskFilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  padding: '6px 12px',
                  border: '2px solid #000',
                  borderRadius: '8px',
                  backgroundColor: activeTab === tab ? '#2E1A47' : '#E6E6FA',
                  color: activeTab === tab ? '#FFF' : '#000',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                padding: '2px 8px',
                border: '1px solid #000',
                borderRadius: '12px',
                fontSize: '0.8rem',
                backgroundColor: selectedTag === null ? '#A855F7' : '#FFF',
                color: selectedTag === null ? '#FFF' : '#000',
                cursor: 'pointer',
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
                  fontSize: '0.8rem',
                  backgroundColor: selectedTag === tag ? '#A855F7' : '#FFF',
                  color: selectedTag === tag ? '#FFF' : '#000',
                  cursor: 'pointer',
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Task List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
              🐾 No tasks found!
            </div>
          ) : (
            filteredTasks.map((task) => {
              const priorityInfo = PRIORITY_MAP[task.metadata?.priority || 0];
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    border: '2px solid #000',
                    borderRadius: '12px',
                    backgroundColor: task.status === 'completed' ? '#F1F5F9' : '#FFFFFF',
                    opacity: task.status === 'completed' ? 0.7 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span
                      style={{
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        fontWeight: 600,
                        color: '#1E1E2E',
                      }}
                    >
                      {task.title}
                    </span>
                    {task.metadata?.tags?.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#E6E6FA',
                          border: '1px solid #000',
                          padding: '1px 6px',
                          borderRadius: '8px',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        backgroundColor: priorityInfo.color,
                        color: '#FFF',
                        fontWeight: 'bold',
                        border: '1px solid #000',
                      }}
                    >
                      {priorityInfo.emoji} {priorityInfo.label}
                    </span>
                  </div>
                </div>
              );
            })
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
              fontSize: '0.85rem',
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

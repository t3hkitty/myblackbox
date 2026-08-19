import React, { useState } from 'react';
import { Target, Flame, Plus, CheckCircle2, Sparkles, Zap, Utensils, ArrowRight, Edit2, Tag, Copy, Award, Pin } from 'lucide-react';
import { getSuggestedGoalsFromLogs, analyzeNourishmentToActivity } from '../services/goalsEngine';
import confetti from 'canvas-confetti';

export default function GoalsTrackerWidget({
  goals = [],
  allLogs = [],
  onAddGoal,
  onIncrementGoal,
  onUpdateGoal,
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('#arc_focus');
  const [targetPerDay, setTargetPerDay] = useState(5);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editSerialTag, setEditSerialTag] = useState('');

  const suggestedGoals = getSuggestedGoalsFromLogs(allLogs, goals);

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let formattedTag = newTag.trim();
    if (!formattedTag.startsWith('#')) formattedTag = `#${formattedTag}`;

    onAddGoal({
      id: `goal_${Date.now()}`,
      title: newTitle.trim(),
      linkedTag: formattedTag,
      serialTag: formattedTag,
      targetPerDay: parseInt(targetPerDay, 10) || 5,
      currentCount: 0,
      streak: 0
    });

    setNewTitle('');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleAddSuggestedGoal = (sug) => {
    const serial = sug.linkedTag ? sug.linkedTag : `#arc_${sug.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    onAddGoal({
      ...sug,
      serialTag: serial
    });
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handleStartEditingSerial = (goal) => {
    setEditingGoalId(goal.id);
    setEditSerialTag(goal.serialTag || goal.linkedTag || '#arc_goal');
  };

  const handleSaveSerialTag = (goal) => {
    let cleanTag = editSerialTag.trim();
    if (!cleanTag.startsWith('#')) cleanTag = `#${cleanTag}`;

    if (onUpdateGoal) {
      onUpdateGoal(goal.id, {
        serialTag: cleanTag,
        linkedTag: cleanTag
      });
    } else {
      goal.serialTag = cleanTag;
      goal.linkedTag = cleanTag;
    }

    setEditingGoalId(null);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  // Log a new Task completed for this Arc Goal with next Serial Tag (#arc_rust/001 (Master Rust & WASM))
  const handleLogSerializedGoalTask = (goal, currentCount) => {
    const nextSeqNum = currentCount + 1;
    const seqStr = String(nextSeqNum).padStart(3, '0');
    const serialTagPrefix = goal.serialTag || goal.linkedTag || '#arc_goal';
    const uniqueSerialTag = `${serialTagPrefix}/${seqStr}`;
    const niceSerialTagWithGoal = `${uniqueSerialTag} (${goal.title})`;

    if (onSaveZettel) {
      onSaveZettel({
        title: `🏆 Goal Arc Task #${seqStr}: ${goal.title} (${uniqueSerialTag})`,
        type: 'task',
        content: `### 🎯 Arc Goal Task Serial Logged:\n- **Goal**: ${goal.title}\n- **Goal Serial Tag**: \`${uniqueSerialTag}\` (${goal.title})\n- **Total Completed Arc Tasks**: ${nextSeqNum}`,
        tags: [serialTagPrefix, uniqueSerialTag, '#arc_goal_task', '#milestone'],
        metadata: { goalId: goal.id, sequenceNum: nextSeqNum, serialTag: uniqueSerialTag, goalTitle: goal.title, niceFormattedSerialTag: niceSerialTagWithGoal }
      });
    }

    onIncrementGoal(goal.id);
    confetti({ particleCount: 45, spread: 70, origin: { y: 0.7 } });
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Target size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              Arc Goals & Serialized Tag Telemetry Engine
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Editable serial tags with friendly goal names e.g. #arc_rust/001 (Master Rust)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="zettel-badge" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)', fontSize: '0.7rem' }}>
            {goals.length} Active Goals
          </span>

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
              title="Pin Goal Tracker panel side-by-side with sticky tape"
            >
              📌 {isPinned ? 'Unpin' : 'Pin Tape'}
            </button>
          )}
        </div>
      </div>

      {/* Suggested Goals from Telemetry */}
      {suggestedGoals.length > 0 && (
        <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '0.65rem', marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c4b5fd', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} color="#a78bfa" />
            ✨ Telemetry Suggested Goals:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {suggestedGoals.map(sug => (
              <button
                key={sug.id}
                onClick={() => handleAddSuggestedGoal(sug)}
                className="btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c4b5fd' }}
                title="Add as tracked goal arc"
              >
                + {sug.title} ({sug.linkedTag})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Arc Goal Form */}
      <form onSubmit={handleCreateGoal} style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Arc Goal Title... (e.g. Master Rust & WASM)"
          style={{ flex: 1, minWidth: '130px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
        />
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="#arc_tag"
          style={{ width: '90px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <Plus size={14} /> Add Arc Goal
        </button>
      </form>

      {/* Arc Goals List with Serial Tag Counters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {goals.map(goal => {
          const serialPrefix = goal.serialTag || goal.linkedTag || '#arc_goal';
          
          // Calculate matching completed tasks in allLogs for this Goal Serial Tag
          const matchingLogsCount = allLogs.filter(log => {
            if (!log.tags || !Array.isArray(log.tags)) return false;
            return log.tags.some(t => t.toLowerCase().startsWith(serialPrefix.toLowerCase()));
          }).length;

          const totalCompletedTasks = Math.max(goal.currentCount || 0, matchingLogsCount);
          const progressPercent = Math.min(100, Math.round((totalCompletedTasks / goal.targetPerDay) * 100));
          const nextSeqStr = String(totalCompletedTasks + 1).padStart(3, '0');
          const niceFormattedSerialTag = `${serialPrefix}/${nextSeqStr} (${goal.title})`;

          return (
            <div key={goal.id} className="glass-card" style={{ padding: '0.7rem 0.85rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={15} color="#34d399" />
                    <span>{goal.title}</span>
                  </div>

                  {/* Editable Serial Tag Bar with Nice Name in Parenthesis */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    {editingGoalId === goal.id ? (
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editSerialTag}
                          onChange={(e) => setEditSerialTag(e.target.value)}
                          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #34d399', borderRadius: '4px', padding: '0.1rem 0.4rem', color: '#34d399', fontSize: '0.72rem', outline: 'none' }}
                        />
                        <button onClick={() => handleSaveSerialTag(goal)} className="btn-primary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.68rem' }}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 7px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontFamily: 'monospace' }}>
                          🏷️ {serialPrefix} <span style={{ color: '#a7f3d0', fontWeight: '600' }}>({goal.title})</span>
                        </span>
                        <button
                          onClick={() => handleStartEditingSerial(goal)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '1px' }}
                          title="Edit Serial Tag Prefix"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleLogSerializedGoalTask(goal, totalCompletedTasks)}
                    className="btn-primary"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title={`Log task with formatted serial tag ${niceFormattedSerialTag}`}
                  >
                    <Zap size={12} fill="white" /> +1 Log #{nextSeqStr}
                  </button>
                </div>
              </div>

              {/* Progress & Task Counter Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                <div style={{ flex: 1, height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#a7f3d0', fontWeight: '700', fontFamily: 'monospace' }}>
                  {totalCompletedTasks}/{goal.targetPerDay} Tasks ({matchingLogsCount} Tagged)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

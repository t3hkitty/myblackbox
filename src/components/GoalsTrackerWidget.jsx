import React, { useState } from 'react';
import { Target, Flame, Plus, CheckCircle2, Sparkles, Zap, Utensils, ArrowRight } from 'lucide-react';
import { getSuggestedGoalsFromLogs, analyzeNourishmentToActivity } from '../services/goalsEngine';
import confetti from 'canvas-confetti';

export default function GoalsTrackerWidget({
  goals,
  allLogs = [],
  onAddGoal,
  onIncrementGoal
}) {
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('#focus');
  const [targetPerDay, setTargetPerDay] = useState(2);

  const suggestedGoals = getSuggestedGoalsFromLogs(allLogs, goals);
  const nourishmentCorrelation = analyzeNourishmentToActivity(allLogs);

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const formattedTag = newTag.trim().startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;
    
    onAddGoal({
      id: `goal_${Date.now()}`,
      title: newTitle.trim(),
      linkedTag: formattedTag,
      targetPerDay: parseInt(targetPerDay, 10) || 1,
      currentCount: 0,
      streak: 0
    });

    setNewTitle('');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleAddSuggestedGoal = (sug) => {
    onAddGoal(sug);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
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
              Daily Goals & Habits Correlation Tracker
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Auto-correlates incoming telemetry tags with active habit streaks
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          {goals.length} Active Goals
        </span>
      </div>

      {/* Suggested Goals from Telemetry */}
      {suggestedGoals.length > 0 && (
        <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '0.65rem', marginBottom: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c4b5fd', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={13} color="#a78bfa" />
            ✨ Telemetry Suggested Habits (Based on your frequent logs):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {suggestedGoals.map(sug => (
              <button
                key={sug.id}
                onClick={() => handleAddSuggestedGoal(sug)}
                className="btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c4b5fd' }}
                title="Add as daily tracked goal"
              >
                + {sug.title} ({sug.linkedTag})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nourishment-to-Activity Telemetry Banner */}
      <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.65rem 0.8rem', marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Utensils size={13} /> ⚡ Gentle Nourishment-to-Activity Telemetry:
        </div>
        <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          {nourishmentCorrelation ? nourishmentCorrelation.message : 'Log fuel events (🍎 Balanced Snack, ☕ Energy Boost) to observe how nourishment powers your focus sessions — zero calorie counters or judgment!'}
        </p>
      </div>

      {/* Quick Add Goal Form */}
      <form onSubmit={handleCreateGoal} style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Goal title... (e.g. Read 20 mins)"
          style={{ flex: 1, minWidth: '130px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
        />
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="#tag"
          style={{ width: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.78rem' }}>
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Goals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {goals.map(goal => {
          const progressPercent = Math.min(100, Math.round((goal.currentCount / goal.targetPerDay) * 100));
          return (
            <div key={goal.id} className="glass-card" style={{ padding: '0.6rem 0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                    {goal.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                    {goal.linkedTag}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {goal.streak > 0 && (
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Flame size={12} fill="#f59e0b" /> {goal.streak}d
                    </span>
                  )}
                  <button
                    onClick={() => onIncrementGoal(goal.id)}
                    className="btn-secondary"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    + Progress
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {goal.currentCount}/{goal.targetPerDay}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

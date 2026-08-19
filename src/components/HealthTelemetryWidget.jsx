import React, { useState } from 'react';
import { Heart, Activity, CheckCircle2, Clock, Droplets, Pill, Utensils, AlertTriangle, Coffee, Sparkles, Pin } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HealthTelemetryWidget({
  allLogs = [],
  sipSettings,
  onLogSip,
  onLogPee,
  onLogPoo,
  onSaveZettel,
  isPinned,
  onTogglePin
}) {
  const [activeTab, setActiveTab] = useState('daily_confirmation'); // 'daily_confirmation' | 'hydration_excretion' | 'habit_alerts'

  const currentHour = new Date().getHours();

  // Time-aware automated log detector
  const checkLogConfirmation = (tags, keywords, startHour, endHour) => {
    return (allLogs || []).some(log => {
      const logDate = new Date(log.timestamp || log.createdIso || Date.now());
      const logHour = logDate.getHours();
      
      const matchesTime = (startHour === undefined || endHour === undefined) || (logHour >= startHour && logHour <= endHour);
      const matchesTag = log.tags && log.tags.some(t => tags.map(tg => tg.toLowerCase()).includes(t.toLowerCase()));
      const matchesKeyword = keywords.some(kw => (log.title || '').toLowerCase().includes(kw) || (log.content || '').toLowerCase().includes(kw));

      return matchesTime && (matchesTag || matchesKeyword);
    });
  };

  // Automated Time-Aware Statuses
  const morningMedsConfirmed = checkLogConfirmation(['#meds', '#morning_meds', '#supplements'], ['morning meds', 'took meds', 'supplements'], 4, 12);
  const eveningMedsConfirmed = checkLogConfirmation(['#meds', '#evening_meds', '#night_meds'], ['evening meds', 'night meds', 'took meds'], 17, 23);
  const breakfastConfirmed = checkLogConfirmation(['#food', '#breakfast', '#meal'], ['breakfast', 'ate food', 'morning meal'], 4, 11);
  const lunchConfirmed = checkLogConfirmation(['#food', '#lunch', '#meal'], ['lunch', 'midday meal'], 11, 16);
  const dinnerConfirmed = checkLogConfirmation(['#food', '#dinner', '#meal'], ['dinner', 'evening meal'], 16, 23);

  // Excretion & Hydration Stats from sipSettings
  const peeCount = sipSettings?.todayPeeCount || 0;
  const pooCount = sipSettings?.todayPooCount || 0;
  const totalBioBreaks = peeCount + pooCount;

  const handleQuickLogMeds = (type = 'Morning') => {
    const isMorning = type === 'Morning';
    onSaveZettel({
      title: `💊 Took ${type} Meds / Supplements`,
      type: 'health_telemetry',
      content: `Took ${type.toLowerCase()} medications & daily supplements at ${new Date().toLocaleTimeString()}.`,
      tags: ['#meds', isMorning ? '#morning_meds' : '#evening_meds', '#health_telemetry', '#telemetry']
    });
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleQuickLogMeal = (mealName = 'Breakfast') => {
    onSaveZettel({
      title: `🍽️ Ate ${mealName}`,
      type: 'health_telemetry',
      content: `Logged ${mealName.toLowerCase()} meal entry at ${new Date().toLocaleTimeString()}.`,
      tags: ['#food', `#${mealName.toLowerCase()}`, '#meal', '#telemetry']
    });
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleSingleTapBioBreak = (bioType = 'pee') => {
    if (bioType === 'poop') {
      if (onLogPoo) onLogPoo();
      onSaveZettel({
        title: `💩 Bio Break (Poop)`,
        type: 'health_telemetry',
        content: `Single-tap bio break logged: Poop 💩. Excretion station updated.`,
        tags: ['#poo', '#bio_break', '#excretion', '#telemetry'],
        metadata: { bioType: 'poop' }
      });
    } else {
      if (onLogPee) onLogPee();
      onSaveZettel({
        title: `🚽 Bio Break (Pee)`,
        type: 'health_telemetry',
        content: `Single-tap bio break logged: Pee 🚽. Excretion station updated.`,
        tags: ['#pee', '#bio_break', '#excretion', '#telemetry'],
        metadata: { bioType: 'pee' }
      });
    }
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            padding: '0.4rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Heart size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              🩺 Master Biological & Health Telemetry Panel
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Confirmed time-related health data: Meds, meals, bio breaks & habit alerts
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
              title="Pin panel side-by-side with sticky tape"
            >
              📌 {isPinned ? 'Unpin' : 'Pin Tape'}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('daily_confirmation')}
          className="btn-secondary"
          style={{
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            borderColor: activeTab === 'daily_confirmation' ? '#ef4444' : 'var(--border-color)',
            background: activeTab === 'daily_confirmation' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            color: activeTab === 'daily_confirmation' ? '#fca5a5' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <CheckCircle2 size={13} />
          <span>Time-Aware Confirmations</span>
        </button>

        <button
          onClick={() => setActiveTab('hydration_excretion')}
          className="btn-secondary"
          style={{
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            borderColor: activeTab === 'hydration_excretion' ? '#3b82f6' : 'var(--border-color)',
            background: activeTab === 'hydration_excretion' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'hydration_excretion' ? '#93c5fd' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Droplets size={13} />
          <span>Bio & Excretion ({totalBioBreaks})</span>
        </button>
      </div>

      {/* Tab 1: Time-Aware Automated Checkmarks */}
      {activeTab === 'daily_confirmation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          
          {/* Morning Meds Card */}
          <div className="glass-card" style={{ padding: '0.65rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: morningMedsConfirmed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)', border: morningMedsConfirmed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pill size={16} color={morningMedsConfirmed ? '#34d399' : '#94a3b8'} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                  💊 Morning Meds & Supplements
                </div>
                <div style={{ fontSize: '0.7rem', color: morningMedsConfirmed ? '#34d399' : 'var(--text-muted)' }}>
                  {morningMedsConfirmed ? '✅ Confirmed taken this morning!' : '⏳ Pending morning meds'}
                </div>
              </div>
            </div>

            {!morningMedsConfirmed && (
              <button
                onClick={() => handleQuickLogMeds('Morning')}
                className="btn-primary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                Log Meds
              </button>
            )}
          </div>

          {/* Evening Meds Card */}
          <div className="glass-card" style={{ padding: '0.65rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: eveningMedsConfirmed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)', border: eveningMedsConfirmed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pill size={16} color={eveningMedsConfirmed ? '#34d399' : '#94a3b8'} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                  💊 Evening / Night Meds
                </div>
                <div style={{ fontSize: '0.7rem', color: eveningMedsConfirmed ? '#34d399' : 'var(--text-muted)' }}>
                  {eveningMedsConfirmed ? '✅ Confirmed taken this evening!' : '⏳ Pending evening meds'}
                </div>
              </div>
            </div>

            {!eveningMedsConfirmed && (
              <button
                onClick={() => handleQuickLogMeds('Evening')}
                className="btn-primary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                Log Meds
              </button>
            )}
          </div>

          {/* Meals Confirmation Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.2rem' }}>
            
            {/* Breakfast */}
            <div className="glass-card" style={{ padding: '0.55rem', textCenter: 'center', background: breakfastConfirmed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.2)', border: breakfastConfirmed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                <Utensils size={12} /> Breakfast
              </div>
              <div style={{ fontSize: '0.68rem', color: breakfastConfirmed ? '#34d399' : 'var(--text-muted)', margin: '0.2rem 0' }}>
                {breakfastConfirmed ? '✅ Ate' : '⏳ Pending'}
              </div>
              {!breakfastConfirmed && (
                <button onClick={() => handleQuickLogMeal('Breakfast')} className="btn-secondary" style={{ width: '100%', padding: '0.15rem', fontSize: '0.65rem' }}>
                  Log
                </button>
              )}
            </div>

            {/* Lunch */}
            <div className="glass-card" style={{ padding: '0.55rem', textCenter: 'center', background: lunchConfirmed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.2)', border: lunchConfirmed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                <Utensils size={12} /> Lunch
              </div>
              <div style={{ fontSize: '0.68rem', color: lunchConfirmed ? '#34d399' : 'var(--text-muted)', margin: '0.2rem 0' }}>
                {lunchConfirmed ? '✅ Ate' : '⏳ Pending'}
              </div>
              {!lunchConfirmed && (
                <button onClick={() => handleQuickLogMeal('Lunch')} className="btn-secondary" style={{ width: '100%', padding: '0.15rem', fontSize: '0.65rem' }}>
                  Log
                </button>
              )}
            </div>

            {/* Dinner */}
            <div className="glass-card" style={{ padding: '0.55rem', textCenter: 'center', background: dinnerConfirmed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.2)', border: dinnerConfirmed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                <Utensils size={12} /> Dinner
              </div>
              <div style={{ fontSize: '0.68rem', color: dinnerConfirmed ? '#34d399' : 'var(--text-muted)', margin: '0.2rem 0' }}>
                {dinnerConfirmed ? '✅ Ate' : '⏳ Pending'}
              </div>
              {!dinnerConfirmed && (
                <button onClick={() => handleQuickLogMeal('Dinner')} className="btn-secondary" style={{ width: '100%', padding: '0.15rem', fontSize: '0.65rem' }}>
                  Log
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Single-Tap Bio Break & Excretion Station */}
      {activeTab === 'hydration_excretion' && (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#93c5fd', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🚽 Single-Tap Bio Break Excretion Telemetry</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>IFTTT / 1-Tap Ready</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
            {/* Pee 🚽 */}
            <button
              onClick={() => handleSingleTapBioBreak('pee')}
              className="btn-secondary"
              style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}
            >
              <div style={{ fontSize: '1.2rem' }}>🚽</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>Log Pee (🚽)</div>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd' }}>Today: {peeCount}</div>
            </button>

            {/* Poop 💩 */}
            <button
              onClick={() => handleSingleTapBioBreak('poop')}
              className="btn-secondary"
              style={{ padding: '0.6rem', background: 'rgba(217, 119, 6, 0.12)', borderColor: 'rgba(217, 119, 6, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}
            >
              <div style={{ fontSize: '1.2rem' }}>💩</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>Log Poop (💩)</div>
              <div style={{ fontSize: '0.7rem', color: '#fcd34d' }}>Today: {pooCount}</div>
            </button>
          </div>

          {/* High Bio Frequency Warning Banner */}
          {totalBioBreaks >= 4 && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="#fca5a5" />
              <div style={{ fontSize: '0.72rem', color: '#fca5a5' }}>
                <strong>⚠️ Kick Bio Habit Alert</strong>: {totalBioBreaks} Bio visits today! Consider swapping coffee for pure water or trying box breathing.
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

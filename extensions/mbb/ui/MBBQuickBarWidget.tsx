import React, { useState, useEffect } from 'react';
import { mbbEngineStore } from '../mbbEngine';
import { MBBTask, WeeklyStageSummary } from '../types';
import { toRomanNumeral } from '../roman';

export const MBBQuickBarWidget: React.FC<{ onOpenModal?: () => void }> = ({ onOpenModal }) => {
  const [tasks, setTasks] = useState<MBBTask[]>([]);
  const [weeklyRollup, setWeeklyRollup] = useState<WeeklyStageSummary[]>([]);

  useEffect(() => {
    const unsub = mbbEngineStore.subscribe((all) => {
      setTasks(all);
      setWeeklyRollup(mbbEngineStore.getWeeklyStageRollup());
    });
    return unsub;
  }, []);

  const activeTickers = tasks.filter((t) => t.type === 'ticker' && t.status !== 'completed');
  const activeTasks = tasks.filter((t) => t.status === 'needsAction' || t.status === 'half');

  return (
    <div
      style={{
        position: 'fixed',
        right: '16px',
        top: '80px',
        width: '240px',
        backgroundColor: '#FFF5FA',
        border: '2px solid #000',
        borderRadius: '12px',
        boxShadow: '4px 4px 0px #000',
        zIndex: 999,
        padding: '10px',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Widget Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '6px' }}>
        <span style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🐾 MBB Flight Deck
        </span>
        <button
          onClick={onOpenModal}
          style={{
            background: '#A855F7',
            color: '#FFF',
            border: '1px solid #000',
            borderRadius: '6px',
            fontSize: '0.75rem',
            padding: '2px 6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Board ↗
        </button>
      </div>

      {/* Active Tickers 1-Click Bar */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6B7280', marginBottom: '4px' }}>
          Active Tickers ({activeTickers.length})
        </div>
        {activeTickers.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>No active tickers</div>
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
                  backgroundColor: '#FFF',
                  border: '1px solid #000',
                  borderRadius: '6px',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', fontWeight: 600 }}>
                  {t.metadata?.emoji || '💊'} {t.metadata?.cleanTitle || t.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#9333EA', fontSize: '0.75rem' }}>
                    {t.metadata?.roman || toRomanNumeral(t.metadata?.count || 0) || '0'}
                  </span>
                  <button
                    onClick={() => mbbEngineStore.tick(t.id)}
                    style={{
                      padding: '1px 6px',
                      backgroundColor: '#C084FC',
                      color: '#FFF',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    +1
                  </button>
                  <button
                    onClick={() => mbbEngineStore.completeTask(t.id)}
                    style={{
                      padding: '1px 6px',
                      backgroundColor: '#86EFAC',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      fontWeight: 'bold',
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

      {/* Mini Rollup Bar */}
      {weeklyRollup.length > 0 && (
        <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '4px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#6B7280' }}>
            Weekly Milestones:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
            {weeklyRollup.slice(0, 3).map((r) => (
              <span
                key={r.stageKey}
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: '#F3E8FF',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  border: '1px solid #C084FC'
                }}
              >
                {r.label.split(' ')[0]}: {r.count}x
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Status Pill */}
      <div style={{ fontSize: '0.7rem', textAlign: 'center', color: '#64748B' }}>
        {activeTasks.length} active tasks in vault
      </div>
    </div>
  );
};

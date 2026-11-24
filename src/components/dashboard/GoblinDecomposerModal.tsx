import React, { useState } from 'react';
import { Sparkles, CheckSquare, X, ArrowRight, Lightbulb, Play } from 'lucide-react';
import { GoblinDecomposerService, DecompositionResult, MicroStep } from '../../services/goblinDecomposerService';
import { dopamineAudio } from '../../services/dopamineAudioEngine';
import confetti from 'canvas-confetti';

interface GoblinDecomposerModalProps {
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onAddSubtasks: (subtasks: { title: string; estimatedMinutes: number }[]) => void;
  onStartSprint?: (firstStep: string) => void;
}

export const GoblinDecomposerModal: React.FC<GoblinDecomposerModalProps> = ({
  taskTitle,
  isOpen,
  onClose,
  onAddSubtasks,
  onStartSprint
}) => {
  const [result, setResult] = useState<DecompositionResult>(() =>
    GoblinDecomposerService.decomposeTask(taskTitle)
  );
  const [steps, setSteps] = useState<MicroStep[]>(() => result.microSteps);

  if (!isOpen) return null;

  const handleToggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextState = !s.completed;
          if (nextState) {
            dopamineAudio.playTickBlip();
            confetti({ particleCount: 15, spread: 35, origin: { y: 0.7 } });
          }
          return { ...s, completed: nextState };
        }
        return s;
      })
    );
  };

  const handleInjectAll = () => {
    onAddSubtasks(
      steps.map((s) => ({
        title: `${s.emoji} ${s.title}`,
        estimatedMinutes: s.estimatedMinutes
      }))
    );
    dopamineAudio.playVictoryChime();
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFF5FA',
          border: '3px solid #000',
          borderRadius: '16px',
          boxShadow: '6px 6px 0px #000',
          maxWidth: '560px',
          width: '100%',
          padding: '18px',
          fontFamily: 'inherit',
          color: '#181524',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🧙‍♂️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#181524' }}>
                Goblin Anti-Paralysis Decomposer
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700 }}>
                Bite-sized micro-steps (&lt; 5 mins) to break executive dysfunction inertia
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#E2E8F0',
              border: '1.5px solid #000',
              borderRadius: '6px',
              padding: '2px 8px',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Target Task Title */}
        <div style={{ backgroundColor: '#F1F5F9', border: '1.5px solid #000', borderRadius: '8px', padding: '8px 12px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Overwhelming Task:
          </span>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#181524', marginTop: '2px' }}>
            "{taskTitle}"
          </div>
        </div>

        {/* The First Tiny Step Highlight Card */}
        <div
          style={{
            backgroundColor: '#FEF08A',
            border: '2px solid #000',
            borderRadius: '10px',
            padding: '10px 12px',
            boxShadow: '2px 2px 0px #000'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 900, color: '#854D0E', textTransform: 'uppercase' }}>
            <Lightbulb size={14} /> The Very First Tiny Action (Zero Resistance):
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#181524', marginTop: '4px' }}>
            {result.firstTinyStep}
          </div>
        </div>

        {/* Micro-steps List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>
            Micro-Steps Breakdown ({steps.length}):
          </span>
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => handleToggleStep(step.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                backgroundColor: step.completed ? 'rgba(220, 252, 231, 0.9)' : '#FFF',
                border: '1.5px solid #000',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => handleToggleStep(step.id)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#181524' }}
                />
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: step.completed ? 'line-through' : 'none',
                    color: step.completed ? '#166534' : '#181524'
                  }}
                >
                  {step.emoji} {step.title}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  backgroundColor: '#F3E8FF',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  border: '1px solid #000'
                }}
              >
                ⏱️ {step.estimatedMinutes}m
              </span>
            </div>
          ))}
        </div>

        {/* Anti-Paralysis Tip Banner */}
        <div style={{ fontSize: '0.72rem', color: '#475569', fontStyle: 'italic', borderTop: '1px dashed #CBD5E1', paddingTop: '6px' }}>
          💡 <strong>AuDHD Reframe:</strong> {result.antiParalysisTip}
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
          {onStartSprint && (
            <button
              onClick={() => {
                onStartSprint(result.firstTinyStep);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                backgroundColor: '#F97316',
                color: '#FFF',
                border: '1.5px solid #000',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: '1px 1px 0px #000'
              }}
            >
              <Play size={13} fill="white" /> Launch 5m Sprint
            </button>
          )}

          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                backgroundColor: '#E2E8F0',
                border: '1.5px solid #000',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleInjectAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 14px',
                backgroundColor: '#A855F7',
                color: '#FFF',
                border: '1.5px solid #000',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: '1px 1px 0px #000'
              }}
            >
              Inject Subtasks ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

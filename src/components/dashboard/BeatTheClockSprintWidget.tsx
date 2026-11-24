import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, Pause, RotateCcw, Trophy, Headphones, Music, Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import { dopamineAudio } from '../../services/dopamineAudioEngine';
import confetti from 'canvas-confetti';

interface BeatTheClockSprintWidgetProps {
  onSprintComplete?: (title: string, durationSeconds: number) => void;
  initialTask?: string;
}

interface Anthem {
  title: string;
  artist: string;
  url: string;
  cheesyFactor: string;
}

export const BeatTheClockSprintWidget: React.FC<BeatTheClockSprintWidgetProps> = ({
  onSprintComplete,
  initialTask
}) => {
  const [taskName, setTaskName] = useState(initialTask || 'Fold Laundry Sprint');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300s
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAnthem, setSelectedAnthem] = useState<Anthem | null>(null);
  const [soundMuted, setSoundMuted] = useState(dopamineAudio.getIsMuted());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const anthems: Anthem[] = [
    { title: 'Eye of the Tiger', artist: 'Survivor', url: 'https://www.youtube.com/watch?v=btPJPFnesV4', cheesyFactor: '🧀🧀🧀' },
    { title: 'Danger Zone', artist: 'Kenny Loggins', url: 'https://www.youtube.com/watch?v=siwpn14IE7E', cheesyFactor: '🧀🧀🧀' },
    { title: 'Holding Out for a Hero', artist: 'Bonnie Tyler', url: 'https://www.youtube.com/watch?v=bWcASV2sey0', cheesyFactor: '🧀🧀' },
    { title: 'The Final Countdown', artist: 'Europe', url: 'https://www.youtube.com/watch?v=9jK-NcRmVcw', cheesyFactor: '🧀🧀🧀' },
    { title: "You're the Best", artist: 'Joe Esposito', url: 'https://www.youtube.com/watch?v=oomCIXGznYs', cheesyFactor: '🧀🧀' }
  ];

  useEffect(() => {
    if (initialTask) {
      setTaskName(initialTask);
    }
  }, [initialTask]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            dopamineAudio.playSweepAllChime();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    dopamineAudio.setMuted(next);
  };

  const handleStart = () => {
    setIsRunning(true);
    dopamineAudio.playTickBlip();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(300);
  };

  const handleVictory = () => {
    setIsRunning(false);
    const elapsed = 300 - timeLeft;
    dopamineAudio.playVictoryChime();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    if (onSprintComplete) {
      onSprintComplete(taskName, elapsed);
    }
    setTimeLeft(300);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.round(((300 - timeLeft) / 300) * 100);

  return (
    <div
      style={{
        backgroundColor: '#FFF9FB',
        border: '2px solid #000',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '3px 3px 0px #000',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={16} color="#F97316" fill="#F97316" />
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#181524' }}>
            5-Min "Beat The Clock" Sprint
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: '#FEF08A',
              color: '#854D0E',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid #000'
            }}
          >
            DOPAMINE BOOSTER
          </span>
        </div>

        <button
          onClick={toggleSound}
          title={soundMuted ? 'Unmute procedural audio' : 'Mute procedural audio'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            color: soundMuted ? '#94A3B8' : '#7E22CE'
          }}
        >
          {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* Task input + Timer Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Chore or task to sprint through..."
          style={{
            flex: 1,
            minWidth: '160px',
            padding: '5px 8px',
            border: '1.5px solid #000',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#181524',
            backgroundColor: '#FFF'
          }}
        />

        {/* Big Digital Countdown */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 900,
            padding: '2px 10px',
            backgroundColor: timeLeft < 60 ? '#FEE2E2' : '#F3E8FF',
            color: timeLeft < 60 ? '#DC2626' : '#6B21A8',
            borderRadius: '6px',
            border: '1.5px solid #000',
            letterSpacing: '1px'
          }}
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '6px', width: '100%', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', border: '1px solid #000' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: timeLeft < 60 ? '#EF4444' : '#10B981',
            transition: 'width 1s linear'
          }}
        />
      </div>

      {/* Controls & Victory Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {!isRunning ? (
            <button
              onClick={handleStart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                backgroundColor: '#10B981',
                color: '#FFF',
                border: '1px solid #000',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              <Play size={12} fill="white" /> Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                backgroundColor: '#FBBF24',
                color: '#181524',
                border: '1px solid #000',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              <Pause size={12} /> Pause
            </button>
          )}

          <button
            onClick={handleReset}
            style={{
              padding: '4px 8px',
              backgroundColor: '#E2E8F0',
              color: '#181524',
              border: '1px solid #000',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* 🏆 Log Victory (Beat the clock) */}
        <button
          onClick={handleVictory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 12px',
            backgroundColor: '#F97316',
            color: '#FFF',
            border: '1px solid #000',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '1px 1px 0px #000'
          }}
        >
          <Trophy size={13} fill="white" /> 🏆 Finished &amp; Beat Clock!
        </button>
      </div>

      {/* Cheesy Motivation Anthems 1-Click launcher */}
      <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Headphones size={12} /> Anthems:
        </span>
        {anthems.map((a) => (
          <a
            key={a.title}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '1px 6px',
              backgroundColor: '#F1F5F9',
              color: '#181524',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {a.cheesyFactor} {a.title}
          </a>
        ))}
      </div>
    </div>
  );
};

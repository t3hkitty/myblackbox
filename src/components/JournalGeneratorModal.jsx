import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Check, Download, FileEdit, Image, Palette } from 'lucide-react';
import { getZettelTimestamp } from '../utils/timeUtils';
import { getPresetSceneArtwork, buildScenePrompt } from '../services/sceneGenerator';
import confetti from 'canvas-confetti';

export default function JournalGeneratorModal({
  isOpen,
  onClose,
  allLogs,
  sipSettings,
  onSaveJournalZettel
}) {
  const [userSynthesisComments, setUserSynthesisComments] = useState('');
  const [journalTitle, setJournalTitle] = useState(`Daily Telemetry Journal - ${getZettelTimestamp().split('-')[0]}`);
  const [attachSceneIllustration, setAttachSceneIllustration] = useState(true);

  if (!isOpen) return null;

  // Group logs into auto-sections
  const moodLogs = allLogs.filter(l => l.type === 'mood' || (l.tags && l.tags.includes('#mood')));
  const healthLogs = allLogs.filter(l => l.type === 'sip' || (l.tags && (l.tags.includes('#meds') || l.tags.includes('#chocolate') || l.tags.includes('#sip'))));
  const taskLogs = allLogs.filter(l => l.type === 'task' || (l.tags && l.tags.includes('#blackbox_task')));
  const bookLogs = allLogs.filter(l => l.type === 'ebook_review' || l.type === 'micro_tweet' || (l.tags && l.tags.includes('#reading')));

  const generateAutoContent = () => {
    let sections = [];

    // Scene Illustration Banner Header
    if (attachSceneIllustration) {
      sections.push(`![Aesthetic Telemetry Scene Illustration](/assets/journal_scene.jpg)\n`);
    }

    // Section 1: Mood
    sections.push(`## 🎭 Mood & Emotional Telemetry`);
    if (moodLogs.length > 0) {
      moodLogs.forEach(m => {
        sections.push(`- **${m.zettelId} PT**: ${m.mood ? `${m.mood.emoji} ${m.mood.label}` : m.title} ${m.content ? `— "${m.content}"` : ''}`);
      });
    } else {
      sections.push(`*No specific mood events recorded yet today.*`);
    }

    // Section 2: Health & Sips
    sections.push(`\n## 💧 Hydration & Health Telemetry`);
    sections.push(`- **Total Sips Today**: ${sipSettings?.todaySipCount || 0} sips (~${(sipSettings?.todaySipCount || 0) * (sipSettings?.sipVolumeMl || 15)} ${sipSettings?.unit || 'ml'})`);
    if (healthLogs.length > 0) {
      healthLogs.forEach(h => {
        sections.push(`- **${h.zettelId} PT**: ${h.title}`);
      });
    }

    // Section 3: Tasks
    sections.push(`\n## ⏱️ Google Tasks & Focus Duration`);
    if (taskLogs.length > 0) {
      taskLogs.forEach(t => {
        sections.push(`- **${t.zettelId} PT**: ${t.title} (${t.content})`);
      });
    } else {
      sections.push(`*No task pairs completed yet today.*`);
    }

    // Section 4: Ebooks & Micro-Tweets
    sections.push(`\n## 📚 Reading & Private Micro-Tweets`);
    if (bookLogs.length > 0) {
      bookLogs.forEach(b => {
        sections.push(`- **${b.zettelId} PT**: ${b.title}\n  ${b.content.replace(/\n/g, '\n  ')}`);
      });
    } else {
      sections.push(`*No ebook reading notes or micro-tweets recorded yet today.*`);
    }

    // Section 5: User Custom Comments
    sections.push(`\n## 📝 Overarching Synthesis & Comments`);
    sections.push(userSynthesisComments.trim() || `*No additional user synthesis added.*`);

    return sections.join('\n');
  };

  const handleSynthesizeAndSave = (e) => {
    e.preventDefault();

    const compiledContent = generateAutoContent();
    const zettelId = getZettelTimestamp();

    onSaveJournalZettel({
      title: journalTitle.trim(),
      type: 'journal',
      content: compiledContent,
      tags: ['#journal', '#daily_zettel', '#synthesis', '#telemetry'],
      metadata: {
        autoCompiledCount: allLogs.length,
        sipsToday: sipSettings?.todaySipCount || 0
      }
    });

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#a78bfa" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                Auto-Synthesize Daily Journal
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Compiles all micrologs into structured sections + custom comments
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSynthesizeAndSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <input
            type="text"
            required
            value={journalTitle}
            onChange={(e) => setJournalTitle(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '700',
              outline: 'none'
            }}
          />

          {/* Scene Illustration Generator Toggle */}
          <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={18} color="#a78bfa" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                  Auto-Generate Aesthetic Scene Illustration
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Replaces messy camera photos with a uniform, artistic 3D visual scene representing your day.
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={attachSceneIllustration}
              onChange={(e) => setAttachSceneIllustration(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* User Custom Overarching Comments */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#fff', marginBottom: '0.4rem' }}>
              Add Your Own Overarching Journal Comments & Reflections:
            </label>
            <textarea
              rows={4}
              value={userSynthesisComments}
              onChange={(e) => setUserSynthesisComments(e.target.value)}
              placeholder="Reflect on today's telemetry, breakthroughs, or unexpected events..."
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.7rem',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Live Preview of Auto-Structured Sections */}
          <div style={{ background: '#0a0d14', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.9rem', maxHeight: '220px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#a78bfa', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Auto-Generated Section Preview:
            </div>
            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#d1d5db', whitespace: 'pre-wrap', lineHeight: '1.4' }}>
              {generateAutoContent()}
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
              <Check size={16} />
              <span>Compile & Save Master Journal Zettel</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

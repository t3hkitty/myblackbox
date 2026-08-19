import React, { useState } from 'react';
import { Magnet, Heart, ThumbsDown, Sparkles, Plus, Zap, Compass, CheckCircle2, Award, Sparkle, Target, Tag } from 'lucide-react';
import { synthesizeArcGoalsFromLogs } from '../services/arcGoalsEngine';
import confetti from 'canvas-confetti';

const STORED_DESIRES_KEY = 'blackbox_attraction_desires_v1';

export default function AttractionPanelWidget({
  allLogs = [],
  goals = [],
  onLogAttractionZettel
}) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(STORED_DESIRES_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'd_1', text: 'Uninterrupted 2-hour deep work flow in early morning', category: 'Focus', type: 'like' },
      { id: 'd_2', text: 'Quiet coffee & reading time watching the sunrise', category: 'Vibe', type: 'like' },
      { id: 'd_3', text: 'Endless phone notification chimes during focus', category: 'Friction', type: 'dislike' }
    ];
  });

  const [newItemText, setNewItemText] = useState('');
  const [itemType, setItemType] = useState('like');

  // Dynamically extract desire/attraction Zettels from allLogs
  const desireZettels = (allLogs || []).filter(l => {
    const isDesireTag = l.tags && l.tags.some(t => ['#desire', '#attraction', '#priming', '#goal'].includes(t.toLowerCase()));
    return isDesireTag;
  });

  // Synthesize Arc Goals dynamically using active goals state & Zettel logs
  const synthesizedArcs = synthesizeArcGoalsFromLogs(allLogs, items);

  // Combine static/saved goals from goals prop with synthesized arcs
  const activeGoalItems = (goals || []).map(g => ({
    id: g.id,
    title: g.title || g.name,
    confidence: `${g.currentCount || 0} / ${g.targetCount || 10} logged`,
    description: `Active Arc Goal (${g.syncList || 'blackbox_goals'}): Primed in Zettel repository.`
  }));

  const combinedArcs = [...activeGoalItems, ...synthesizedArcs];
  const likesCount = items.filter(i => i.type === 'like').length + desireZettels.length;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem = {
      id: `attr_${Date.now()}`,
      text: newItemText.trim(),
      type: itemType,
      category: itemType === 'like' ? 'Attraction Magnet' : 'Friction Point'
    };

    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem(STORED_DESIRES_KEY, JSON.stringify(updated));
    setNewItemText('');

    // Save as Zettel telemetry entry associated with active Arc Goals
    onLogAttractionZettel({
      title: `${itemType === 'like' ? '💚 Verbalized Desire' : '💔 Friction Boundary'}: ${newItem.text}`,
      type: 'microlog',
      content: `**Verbalized Preference**: ${newItem.text}\n**Category**: ${newItem.category}\n\n*RAS Priming*: By naming this ${itemType === 'like' ? 'desire, your Reticular Activating System (RAS) is now primed to notice path opportunities towards it!' : 'friction point, you clarify boundaries to protect your energy.'}`,
      tags: [itemType === 'like' ? '#desire' : '#friction', '#attraction', '#priming', '#blackbox_goals', '#telemetry']
    });

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Magnet size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
              🧲 Law of Attraction & Arc Goals Priming Panel
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Associated directly with your {goals.length} saved goals & {desireZettels.length} desire Zettels
            </p>
          </div>
        </div>

        <span className="zettel-badge" style={{ color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.3)' }}>
          ✨ {likesCount} Desires & Goals Primed
        </span>
      </div>

      {/* Active Arc Goals & Zettel Linkage Card */}
      <div style={{ background: 'rgba(167, 139, 250, 0.08)', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#c4b5fd', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Target size={14} color="#a78bfa" />
          🎯 Linked Arc Goals & Associated Zettel Primers ({combinedArcs.length}):
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
          {combinedArcs.map((arc, idx) => (
            <div key={arc.id || idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.7rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff' }}>{arc.title}</span>
                <span style={{ fontSize: '0.68rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>{arc.confidence}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>{arc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Verbalization Form */}
      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
        <select value={itemType} onChange={(e) => setItemType(e.target.value)} style={{ background: '#111827', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}>
          <option value="like">💚 Desire (Like)</option>
          <option value="dislike">💔 Friction (Dislike)</option>
        </select>
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Verbalize what you want or dislike to prime RAS..."
          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.4rem', color: '#fff', fontSize: '0.78rem' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
          <Plus size={14} /> Add
        </button>
      </form>

      {/* Desires & Friction Points List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: item.type === 'like' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)', border: item.type === 'like' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: '#fff' }}>{item.type === 'like' ? '💚' : '💔'} {item.text}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

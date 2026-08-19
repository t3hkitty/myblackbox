import React, { useState, useEffect } from 'react';
import { Search, Tag, Download, Trash2, Eye, Filter, CheckSquare, Square, AlertOctagon, Edit3, ArrowUp, ArrowDown, Bomb, Archive, Inbox, UserCheck, RefreshCw, Key, Cloud, Layers, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { downloadMarkdownFile } from '../services/zettelEngine';
import { getGoogleAuthSession, syncLogsToGoogleDriveApps, reauthenticateGoogleAccount, triggerGoogleAuthPopup, disconnectGoogleAccount } from '../services/googleDriveAuthEngine';
import LogDetailModal from './LogDetailModal';

const LIFE_ARC_SPECS = [
  { id: 'arc_create', label: '🎨 Creative & Building Arc', tags: ['#create', '#code', '#project', '#workflow', '#blog'], color: '#10b981' },
  { id: 'arc_work', label: '💼 Work Shift Arc', tags: ['#work', '#work_clockin', '#work_late', '#work_break', '#work_eod', '#work_lunch'], color: '#3b82f6' },
  { id: 'arc_reading', label: '📚 Reading & TBR Arc', tags: ['#reading', '#book', '#tbr', '#book_review', '#media_vault', '#movie', '#tv'], color: '#60a5fa' },
  { id: 'arc_health', label: '💧 Hydration & Bio-Care Arc', tags: ['#sip', '#hydration', '#pee', '#poo', '#health', '#bio_event'], color: '#06b6d4' },
  { id: 'arc_attraction', label: '🧲 Attraction & Arc Goals', tags: ['#desire', '#attraction', '#priming', '#blackbox_goals', '#goal'], color: '#f472b6' },
  { id: 'arc_mental', label: '🧠 Mental Health & Braindump Arc', tags: ['#braindump', '#mental_health', '#emotional_processing', '#self_care'], color: '#a78bfa' },
  { id: 'arc_tweets', label: '💬 Live Micro-Tweets Arc', tags: ['#micro_tweet', '#chat'], color: '#ec4899' },
  { id: 'arc_general', label: '📦 General Telemetry Arc', tags: [], color: '#94a3b8' }
];

function classifyLogLifeArc(log) {
  if (!log.tags || log.tags.length === 0) return LIFE_ARC_SPECS[7];
  const found = LIFE_ARC_SPECS.find(spec => spec.tags.some(t => log.tags.includes(t)));
  return found || LIFE_ARC_SPECS[7];
}

export default function LogTimeline({
  logs,
  onDeleteLog,
  onMassDeleteLogs,
  onBulkUpdateLogs,
  onToggleArchiveLog,
  onDeleteAllSampleLogs,
  externalTagFilter = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [showArchived, setShowArchived] = useState(false);
  const [stackingMode, setStackingMode] = useState('flat'); // 'flat' | 'life_arcs' | 'categories'
  const [collapsedStackIds, setCollapsedStackIds] = useState([]);
  const [activeDetailLog, setActiveDetailLog] = useState(null);
  const [selectedLogIds, setSelectedLogIds] = useState([]);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [gSession, setGSession] = useState(getGoogleAuthSession());
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [showBannedInfoModal, setShowBannedInfoModal] = useState(false);

  const handleSaveInlineEdit = (logId) => {
    onBulkUpdateLogs([logId], { title: editTitle, content: editContent });
    setEditingLogId(null);
  };

  useEffect(() => {
    setGSession(getGoogleAuthSession());
  }, []);

  const handleForceSyncDrive = async () => {
    if (!gSession) return;
    setIsSyncingDrive(true);
    const res = await syncLogsToGoogleDriveApps(logs);
    setIsSyncingDrive(false);
    if (res.success) {
      setGSession(res.session);
      alert(res.message);
    }
  };

  const handleGoogleAuth = () => {
    if (gSession) {
      if (window.confirm('Disconnect Google Account?')) {
        disconnectGoogleAccount();
        setGSession(null);
      }
    } else {
      const newSession = triggerGoogleAuthPopup();
      if (newSession) {
        setGSession(newSession);
      }
    }
  };

  const activeFilterTag = externalTagFilter || selectedTagFilter;

  // Extract unique tags across logs
  const allTagsSet = new Set(['ALL']);
  logs.forEach(l => {
    if (l.tags) l.tags.forEach(t => allTagsSet.add(t));
  });
  const uniqueTags = Array.from(allTagsSet);

  // Filter logs
  const filteredLogs = logs.filter(l => {
    const isArchived = l.tags && l.tags.includes('#archive');

    if (activeFilterTag !== '#archive' && !searchQuery.trim()) {
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;
    }

    const matchesSearch = (l.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.zettelId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = activeFilterTag === 'ALL' || (l.tags && l.tags.includes(activeFilterTag));

    return matchesSearch && matchesTag;
  });

  const isAllSelected = filteredLogs.length > 0 && filteredLogs.every(l => selectedLogIds.includes(l.id));

  const handleToggleSelect = (id) => {
    if (selectedLogIds.includes(id)) {
      setSelectedLogIds(selectedLogIds.filter(i => i !== id));
    } else {
      setSelectedLogIds([...selectedLogIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(filteredLogs.map(l => l.id));
    }
  };

  const handleToggleCollapseStack = (stackId) => {
    if (collapsedStackIds.includes(stackId)) {
      setCollapsedStackIds(collapsedStackIds.filter(i => i !== stackId));
    } else {
      setCollapsedStackIds([...collapsedStackIds, stackId]);
    }
  };

  // Group & Stack Logic (Most Recent Zettel on top!)
  let stackedGroups = [];
  if (stackingMode === 'life_arcs') {
    const map = {};
    LIFE_ARC_SPECS.forEach(spec => {
      map[spec.id] = { spec, items: [] };
    });

    filteredLogs.forEach(log => {
      const arc = classifyLogLifeArc(log);
      if (map[arc.id]) map[arc.id].items.push(log);
    });

    stackedGroups = Object.values(map).filter(g => g.items.length > 0).map(g => ({
      id: g.spec.id,
      title: g.spec.label,
      color: g.spec.color,
      items: g.items.sort((a, b) => (b.zettelId || b.id).localeCompare(a.zettelId || a.id)) // Most recent on top!
    }));
  } else if (stackingMode === 'categories') {
    const map = {};
    filteredLogs.forEach(log => {
      const mainTag = (log.tags && log.tags[0]) ? log.tags[0] : '#general';
      if (!map[mainTag]) map[mainTag] = [];
      map[mainTag].push(log);
    });

    stackedGroups = Object.keys(map).map(tag => ({
      id: tag,
      title: `🏷️ Stack: ${tag}`,
      color: '#a78bfa',
      items: map[tag].sort((a, b) => (b.zettelId || b.id).localeCompare(a.zettelId || a.id)) // Most recent on top!
    }));
  }

  const handleMassDelete = () => {
    if (selectedLogIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedLogIds.length} selected Zettel log(s)?`)) {
      onMassDeleteLogs(selectedLogIds);
      setSelectedLogIds([]);
    }
  };

  const handleMassAddTag = () => {
    if (selectedLogIds.length === 0) return;
    const tag = window.prompt(`Enter tag to add to ${selectedLogIds.length} selected entries (e.g. #project1):`);
    if (tag && tag.trim()) {
      onBulkUpdateLogs(selectedLogIds, { addTag: tag.trim() });
      setSelectedLogIds([]);
    }
  };

  const handleMassArchiveToggle = (archiveAction) => {
    if (selectedLogIds.length === 0) return;
    if (archiveAction === 'archive') {
      onBulkUpdateLogs(selectedLogIds, { addTag: '#archive' });
    } else {
      onBulkUpdateLogs(selectedLogIds, { removeTag: '#archive' });
    }
    setSelectedLogIds([]);
  };

  const handleMassPrepend = () => {
    if (selectedLogIds.length === 0) return;
    const textToPrepend = window.prompt(`Prepend text to ${selectedLogIds.length} selected Zettel entries:`);
    if (textToPrepend && textToPrepend.trim()) {
      onBulkUpdateLogs(selectedLogIds, { prependText: textToPrepend.trim() });
      setSelectedLogIds([]);
    }
  };

  const handleMassAppend = () => {
    if (selectedLogIds.length === 0) return;
    const textToAppend = window.prompt(`Append text to ${selectedLogIds.length} selected Zettel entries:`);
    if (textToAppend && textToAppend.trim()) {
      onBulkUpdateLogs(selectedLogIds, { appendText: textToAppend.trim() });
      setSelectedLogIds([]);
    }
  };

  const archiveCount = logs.filter(l => l.tags && l.tags.includes('#archive')).length;

  const handleMassBanToggle = (shouldBan) => {
    if (selectedLogIds.length === 0) return;
    if (shouldBan) {
      onBulkUpdateLogs(selectedLogIds, { addTag: '#no_bundle', isBannedFromBundle: true });
    } else {
      onBulkUpdateLogs(selectedLogIds, { removeTag: '#no_bundle', isBannedFromBundle: false });
    }
    setSelectedLogIds([]);
  };

  const renderSingleLogCard = (log) => {
    const isSelected = selectedLogIds.includes(log.id);
    const isArchived = log.tags && log.tags.includes('#archive');
    const isBanned = log.isBannedFromBundle || (log.tags && log.tags.includes('#no_bundle'));

    return (
      <div key={log.id} className="glass-card" style={{ border: isSelected ? '1px solid #ef4444' : isBanned ? '1px dashed #ef4444' : '1px solid var(--border-color)', background: isSelected ? 'rgba(239, 68, 68, 0.05)' : isBanned ? 'rgba(239, 68, 68, 0.03)' : 'rgba(255, 255, 255, 0.03)', transition: 'all 0.2s ease', opacity: isArchived ? 0.75 : 1, marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleToggleSelect(log.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {isSelected ? <CheckSquare size={16} color="#ef4444" /> : <Square size={16} color="var(--text-muted)" />}
            </button>

            <span className="zettel-badge">{log.zettelId} PT</span>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
              {log.title}
            </span>
            {isArchived && (
              <span style={{ fontSize: '0.68rem', background: 'rgba(239, 68, 68, 0.18)', color: '#fca5a5', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                📦 Archived
              </span>
            )}
            {isBanned && (
              <span style={{ fontSize: '0.68rem', background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                📦 Excluded from Single-File Bundle
              </span>
            )}
            {(log.tags || []).some(t => ['#no_on_this_day', '#exclude_on_this_day', '#no_otd', 'no_on_this_day'].includes(t.toLowerCase())) && (
              <span style={{ fontSize: '0.68rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                🚫 Excluded from On This Day (#no_on_this_day)
              </span>
            )}
            {log.mood && (
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '12px', color: '#fff' }}>
                {log.mood.emoji} {log.mood.label}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={() => {
                const hasExclusion = (log.tags || []).some(t => ['#no_on_this_day', '#exclude_on_this_day', '#no_otd', 'no_on_this_day'].includes(t.toLowerCase()));
                if (hasExclusion) {
                  onBulkUpdateLogs([log.id], { removeTag: '#no_on_this_day' });
                } else {
                  onBulkUpdateLogs([log.id], { addTag: '#no_on_this_day' });
                }
              }}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: (log.tags || []).some(t => ['#no_on_this_day', '#exclude_on_this_day', '#no_otd', 'no_on_this_day'].includes(t.toLowerCase())) ? '#34d399' : '#fca5a5', borderColor: (log.tags || []).some(t => ['#no_on_this_day', '#exclude_on_this_day', '#no_otd', 'no_on_this_day'].includes(t.toLowerCase())) ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)' }}
              title={(log.tags || []).some(t => ['#no_on_this_day', '#exclude_on_this_day', '#no_otd', 'no_on_this_day'].includes(t.toLowerCase())) ? 'Include in On This Day panel' : 'Exclude from On This Day panel (#no_on_this_day)'}
            >
              {(log.tags || []).some(t => ['#no_on_this_day', '#exclude_on_this_day', '#no_otd', 'no_on_this_day'].includes(t.toLowerCase())) ? '📅 Include OTD' : '🚫 Exclude OTD'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                if (isBanned) {
                  onBulkUpdateLogs([log.id], { removeTag: '#no_bundle', isBannedFromBundle: false });
                } else {
                  onBulkUpdateLogs([log.id], { addTag: '#no_bundle', isBannedFromBundle: true });
                }
              }}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: isBanned ? '#34d399' : '#c084fc', borderColor: isBanned ? 'rgba(16, 185, 129, 0.4)' : 'rgba(168, 85, 247, 0.4)' }}
              title={isBanned ? 'Include this Zettel in single-file compiled bundle documents (always downloaded & backed up normally)' : 'Exclude this Zettel from single-file compiled bundle documents (still downloaded & backed up normally)'}
            >
              {isBanned ? '📦 Include Bundle' : '📦 Exclude Bundle'}
            </button>
            {onToggleArchiveLog && (
              <button
                className="btn-secondary"
                onClick={() => onToggleArchiveLog(log.id)}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: isArchived ? '#34d399' : '#fca5a5', borderColor: isArchived ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)' }}
                title={isArchived ? 'Un-archive Zettel log' : 'Archive Zettel log'}
              >
                {isArchived ? <Inbox size={13} /> : <Archive size={13} />}
              </button>
            )}

            <button
              className="btn-secondary"
              onClick={() => {
                setEditingLogId(log.id);
                setEditTitle(log.title);
                setEditContent(log.content || '');
              }}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              title="Edit Zettel Log Title & Content"
            >
              <Edit3 size={13} color="#f59e0b" />
            </button>
            <button
              className="btn-secondary"
              onClick={() => setActiveDetailLog(log)}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              title="Eye View: Detailed Modal & Markdown Preview"
            >
              <Eye size={13} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => downloadMarkdownFile(log)}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              title="Download Markdown (.md)"
            >
              <Download size={13} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => onDeleteLog(log.id)}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#f87171' }}
              title="Delete Entry"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {editingLogId === log.id ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ background: '#111827', border: '1px solid #f59e0b', color: '#fff', padding: '0.35rem', borderRadius: '4px', fontSize: '0.82rem', fontWeight: '700' }}
            />
            <textarea
              rows="3"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ background: '#111827', border: '1px solid var(--border-color)', color: '#fff', padding: '0.35rem', borderRadius: '4px', fontSize: '0.8rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
              <button onClick={() => setEditingLogId(null)} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>Cancel</button>
              <button onClick={() => handleSaveInlineEdit(log.id)} className="btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', background: '#f59e0b', color: '#000', fontWeight: '700' }}>Save Changes</button>
            </div>
          </div>
        ) : (
          log.content && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.5rem' }}>
              {log.content}
            </p>
          )
        )}

        {/* Tags list */}
        {log.tags && log.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {log.tags.map(tag => (
              <span key={tag} className="tag-pill" onClick={() => setSelectedTagFilter(tag)} style={{ cursor: 'pointer' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ margin: '0 1rem 2rem 1rem', padding: '1.25rem' }}>
      
      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📜 Zettelkasten Telemetry Journal ({filteredLogs.length} Entries)
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Immutable Zettel ID history • Flat-file Markdown backup under <code>/Drive/Apps/myBlackbox/</code></span>
            <button
              onClick={() => setShowBannedInfoModal(true)}
              className="btn-secondary"
              style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.1)' }}
              title="Learn how Markdown Bundling & Ban settings are saved in .md files"
            >
              <Info size={12} /> ℹ️ MD Bundle Spec Info
            </button>
          </p>
        </div>

        {/* Search, Filter, Stacking Modes & Sync Status */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Stacking View Mode Pills */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setStackingMode('flat')}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: '700', borderRadius: '4px', border: 'none', background: stackingMode === 'flat' ? 'rgba(167, 139, 250, 0.25)' : 'transparent', color: stackingMode === 'flat' ? '#c4b5fd' : 'var(--text-muted)', cursor: 'pointer' }}
              title="Flat chronological feed"
            >
              📜 Flat Feed
            </button>
            <button
              onClick={() => setStackingMode('life_arcs')}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: '700', borderRadius: '4px', border: 'none', background: stackingMode === 'life_arcs' ? 'rgba(59, 130, 246, 0.25)' : 'transparent', color: stackingMode === 'life_arcs' ? '#60a5fa' : 'var(--text-muted)', cursor: 'pointer' }}
              title="Auto-stack Zettels by Life Arcs (Most recent on top)"
            >
              🌌 Life Arcs Stack
            </button>
            <button
              onClick={() => setStackingMode('categories')}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: '700', borderRadius: '4px', border: 'none', background: stackingMode === 'categories' ? 'rgba(16, 185, 129, 0.25)' : 'transparent', color: stackingMode === 'categories' ? '#34d399' : 'var(--text-muted)', cursor: 'pointer' }}
              title="Auto-stack Zettels by Category & Primary Tag"
            >
              🏷️ Category Stacks
            </button>
          </div>

          {/* Google Auth Status Pill */}
          {gSession ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.25rem 0.55rem', borderRadius: '6px' }}>
              <span>👤✓ {gSession.userEmail.split('@')[0]}</span>
              <button
                onClick={handleForceSyncDrive}
                className="btn-secondary"
                style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                title="Sync all .md files to /Drive/Apps/myBlackbox/"
              >
                <RefreshCw size={12} className={isSyncingDrive ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
            </div>
          ) : (
            <button className="btn-secondary" onClick={handleGoogleAuth} style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#93c5fd' }} title="Connect Google Account for /Drive/Apps/myBlackbox/ auto-backup">
              <Cloud size={15} color="#3b82f6" />
              <span style={{ fontSize: '0.8rem' }}>Connect Google</span>
            </button>
          )}

          <button
            onClick={() => setShowArchived(!showArchived)}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.65rem',
              fontSize: '0.75rem',
              borderColor: showArchived ? '#ef4444' : 'var(--border-color)',
              background: showArchived ? 'rgba(239, 68, 68, 0.18)' : 'transparent',
              color: showArchived ? '#fca5a5' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            {showArchived ? <Inbox size={14} /> : <Archive size={14} />}
            <span>{showArchived ? 'Show Active Logs' : `📦 Archived (${archiveCount})`}</span>
          </button>

          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Zettel logs..."
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.4rem 0.6rem 0.4rem 2rem',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                width: '160px'
              }}
            />
          </div>

          <select
            value={selectedTagFilter}
            onChange={(e) => setSelectedTagFilter(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          >
            {uniqueTags.map(t => (
              <option key={t} value={t} style={{ background: '#111827' }}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-Selection Bulk Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.75rem', borderRadius: '6px', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleToggleSelectAll}
            className="btn-secondary"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: isAllSelected ? '#ef4444' : 'var(--text-muted)' }}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>

          {selectedLogIds.length > 0 && (
            <span style={{ fontSize: '0.78rem', color: '#fca5a5' }}>
              Selected: <strong style={{ color: '#fff' }}>{selectedLogIds.length}</strong>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {selectedLogIds.length > 0 && (
            <>
              <button onClick={() => handleMassBanToggle(true)} className="btn-secondary" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}>
                🚫 Ban MD Bundle
              </button>
              <button onClick={() => handleMassBanToggle(false)} className="btn-secondary" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}>
                ✅ Allow MD Bundle
              </button>
              <button onClick={() => handleMassArchiveToggle('archive')} className="btn-secondary" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}>
                <Archive size={13} /> Archive
              </button>
              <button onClick={() => handleMassArchiveToggle('unarchive')} className="btn-secondary" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}>
                <Inbox size={13} /> Un-archive
              </button>
              <button onClick={handleMassAddTag} className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}>
                <Tag size={13} /> Mass Tag
              </button>
              <button onClick={handleMassPrepend} className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(167, 139, 250, 0.4)', color: '#c4b5fd' }}>
                <ArrowUp size={13} /> Prepend
              </button>
              <button onClick={handleMassAppend} className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}>
                <ArrowDown size={13} /> Append
              </button>
              <button onClick={handleMassDelete} className="btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <Trash2 size={13} /> Delete ({selectedLogIds.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* RENDER LOGS FEED (Flat vs Auto-Stacked) */}
      {stackingMode === 'flat' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => renderSingleLogCard(log))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No Zettel logs found matching current filter.
            </div>
          )}
        </div>
      ) : (
        /* AUTO-STACKED VIEW (Life Arcs / Category Stacks) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {stackedGroups.map(stack => {
            const isCollapsed = collapsedStackIds.includes(stack.id);
            const topMostRecentLog = stack.items[0]; // Most recent on top!
            return (
              <div key={stack.id} className="glass-card" style={{ borderLeft: `4px solid ${stack.color}`, background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px' }}>
                {/* Stack Header Bar */}
                <div
                  onClick={() => handleToggleCollapseStack(stack.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isCollapsed ? 0 : '0.75rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} color={stack.color} />
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                        {stack.title} ({stack.items.length} Entries)
                      </h3>
                      {topMostRecentLog && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>
                          ⚡ Latest Topic Entry: <strong style={{ color: '#fff' }}>"{topMostRecentLog.title}"</strong> ({topMostRecentLog.zettelId} PT)
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.68rem', color: stack.color, background: `${stack.color}20`, border: `1px solid ${stack.color}50`, padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      {stack.items.length} Stacked
                    </span>
                    {isCollapsed ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronUp size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Stack Body: Rendered with Most Recent Log on Top */}
                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {stack.items.map(log => renderSingleLogCard(log))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Log Detail Preview Modal */}
      {activeDetailLog && (
        <LogDetailModal
          isOpen={Boolean(activeDetailLog)}
          onClose={() => setActiveDetailLog(null)}
          log={activeDetailLog}
          onDeleteLog={onDeleteLog}
        />
      )}

      {/* Markdown Bundling & Frontmatter Info Modal */}
      {showBannedInfoModal && (
        <div className="modal-backdrop" onClick={() => setShowBannedInfoModal(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#60a5fa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={18} color="#60a5fa" />
              ℹ️ Single-File Bundle Concatenation Rules & Frontmatter Spec
            </h3>
            
            <div style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p>
                Tagging a Zettel entry with <code>#no_bundle</code> (or setting <code>no_bundle: true</code>) excludes it from single-file multi-log compiled bundle documents. <strong>It does NOT block downloading or backing up the Zettel!</strong>
              </p>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: '#fcd34d' }}>📄 How it's saved in exported .md files:</strong>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Each exported <code>.md</code> file includes standard YAML frontmatter containing the <code>no_bundle</code> key and tag:
                </p>
                <pre style={{ background: '#111827', padding: '0.5rem', borderRadius: '4px', color: '#34d399', fontSize: '0.74rem', marginTop: '0.3rem', overflowX: 'auto' }}>
{`---
zettel_id: "20260805_182000"
type: "microlog"
no_bundle: true
tags: ["#telemetry", "#zettel", "#no_bundle"]
---

# 20260805_182000 - Title
> 📦 BUNDLE TYPE: Single-File Bundle Excluded (#no_bundle)`}
                </pre>
              </div>

              <ul style={{ margin: '0 0 0 1.2rem', padding: 0 }}>
                <li><strong>ZIP Archives</strong>: Includes ALL Zettel <code>.md</code> files regardless of <code>#no_bundle</code> tags.</li>
                <li><strong>Google Drive Sync</strong>: Backs up ALL Zettel files to <code>/Drive/Apps/myBlackbox/</code>.</li>
                <li><strong>Single-File Bundles</strong>: Excludes entries marked <code>#no_bundle</code> from single-file compiled bundle documents.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setShowBannedInfoModal(false)} className="btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}>
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

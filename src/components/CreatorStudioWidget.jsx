import React, { useState } from 'react';
import { Sparkles, Edit3, Image, BookOpen, Share2, Pin, MessageSquare } from 'lucide-react';
import LiveMicroTweetBar from './LiveMicroTweetBar';
import BloggerExportModal from './BloggerExportModal';

export default function CreatorStudioWidget({
  allLogs = [],
  onSaveZettel = null,
  isPinned = false,
  onTogglePin = null
}) {
  const [activeTab, setActiveTab] = useState('tweets');
  const [showBloggerModal, setShowBloggerModal] = useState(false);

  return (
    <div className="glass-panel" style={{ margin: '0 1rem 1.5rem 1rem', padding: '1rem', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={22} color="#c4b5fd" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>
              🎨 Creator Studio & Content Publishing Hub
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Decoupled creator tools: Live micro-tweeting, Blogger/Substack export, and media publishing!
            </p>
          </div>
        </div>

        {onTogglePin && (
          <button
            onClick={onTogglePin}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: isPinned ? '#fcd34d' : 'var(--text-muted)' }}
            title={isPinned ? 'Unpin from Corkboard' : 'Pin to Corkboard'}
          >
            <Pin size={13} fill={isPinned ? '#fcd34d' : 'none'} />
          </button>
        )}
      </div>

      {/* Creator Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('tweets')}
          style={{
            background: activeTab === 'tweets' ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
            color: activeTab === 'tweets' ? '#c4b5fd' : 'var(--text-muted)',
            border: activeTab === 'tweets' ? '1px solid #a78bfa' : '1px solid transparent',
            borderRadius: '6px',
            padding: '0.25rem 0.65rem',
            fontSize: '0.76rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <MessageSquare size={13} /> 🐦 Micro-Tweeting
        </button>

        <button
          onClick={() => setShowBloggerModal(true)}
          style={{
            background: 'transparent',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px',
            padding: '0.25rem 0.65rem',
            fontSize: '0.76rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Share2 size={13} /> 📰 Open Blogger & Substack Exporter
        </button>
      </div>

      {/* Active Tab Panel View */}
      {activeTab === 'tweets' && (
        <LiveMicroTweetBar
          allLogs={allLogs}
          onSaveTweet={onSaveZettel}
          onPostMicroTweet={onSaveZettel}
        />
      )}

      {/* Blogger Export Modal */}
      {showBloggerModal && (
        <BloggerExportModal
          isOpen={showBloggerModal}
          onClose={() => setShowBloggerModal(false)}
          allLogs={allLogs}
        />
      )}
    </div>
  );
}

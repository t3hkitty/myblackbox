import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Sparkles, BookOpen, MessageSquare, Tag, Globe, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BloggerExportModal({
  isOpen,
  onClose,
  allLogs = []
}) {
  if (!isOpen) return null;

  const [blogTitle, setBlogTitle] = useState('🔥 Live Tweet DNF Tirade & Media Journal Review');
  const [targetPlatform, setTargetPlatform] = useState('blogger'); // 'blogger' | 'wordpress' | 'medium' | 'markdown'
  const [isCopied, setIsCopied] = useState(false);

  // Compile live tweets, DNF logs, and book reviews
  const mediaLogs = allLogs.filter(l =>
    (l.tags && (l.tags.includes('#micro_tweet') || l.tags.includes('#reading') || l.tags.includes('#dnf') || l.tags.includes('#ebook'))) ||
    l.title.toLowerCase().includes('reaction') ||
    l.title.toLowerCase().includes('dnf')
  );

  const compiledPostContent = `
# ${blogTitle}

*Published via myBlackbox Microlog Protocol* • ${new Date().toLocaleDateString()}

---

## 📚 Live Tweet & DNF Media Tirade Logs:

${mediaLogs.length > 0 ? mediaLogs.map(l => `### ✍️ ${l.title}\n**Date**: ${l.zettelId} PT\n**Tags**: ${l.tags ? l.tags.join(' ') : ''}\n\n${l.content}\n`).join('\n---\n\n') : `### ✍️ DNF Book Tirade: Dale Carnegie - How to Win Friends\n**Date**: Today PT\n**Tags**: #dnf #reading #tirade #warning\n\n> "Manipulative tactics from the 1930s don't translate well to modern authentic relationships."\n\n**Verdict**: DNF (Did Not Finish). Dropped in favor of Intuitive Living.`}

---

*Generated automatically by myBlackbox Microlog Engine*
`.trim();

  const handleCopyPost = () => {
    navigator.clipboard.writeText(compiledPostContent);
    setIsCopied(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenBloggerDraft = () => {
    window.open(`https://www.blogger.com/blog/posts`, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={22} color="#f59e0b" />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>
                ✍️ Export to Blogger / WordPress Blog Post
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                1-click compiles live tweets, DNF tirades, and reviews into blog posts
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Blog Post Title Input */}
        <div style={{ marginBottom: '0.8rem' }}>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Blog Post Title:
          </label>
          <input
            type="text"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem 0.6rem', color: '#fff', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
          />
        </div>

        {/* Platform Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
          {['blogger', 'wordpress', 'medium', 'markdown'].map(p => (
            <button
              key={p}
              onClick={() => setTargetPlatform(p)}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.73rem',
                borderColor: targetPlatform === p ? '#f59e0b' : 'var(--border-color)',
                background: targetPlatform === p ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: targetPlatform === p ? '#fcd34d' : 'var(--text-muted)'
              }}
            >
              {p === 'blogger' ? '🟠 Blogger' : p === 'wordpress' ? '🔵 WordPress' : p === 'medium' ? '⚫ Medium' : '📝 Markdown'}
            </button>
          ))}
        </div>

        {/* Compiled Post Preview Area */}
        <div className="glass-card" style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', marginBottom: '1rem', maxHeight: '280px', overflowY: 'auto' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
            {compiledPostContent}
          </pre>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCopyPost}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: isCopied ? '#34d399' : '#fff', borderColor: isCopied ? '#34d399' : 'var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {isCopied ? <Check size={15} color="#34d399" /> : <Copy size={15} />}
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Blog HTML/Markdown'}</span>
          </button>

          <button
            onClick={handleOpenBloggerDraft}
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Globe size={15} />
            <span>Open Blogger Post Editor &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

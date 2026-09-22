import React, { useEffect } from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

export default function ImageModal({ imageUrl, title, onClose }) {
  // Listen for Escape key to close lightbox easily
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div className="modal-overlay lightbox-overlay" onClick={onClose}>
      <div 
        className="modal-content lightbox-content" 
        style={{ maxWidth: '960px', background: 'rgba(11, 15, 25, 0.95)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ZoomIn size={18} color="var(--accent-primary)" />
            <span>Chart Analysis Screenshot: {title || 'Enlarged View'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px' }}>
              ESC to close
            </span>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={onClose}
              style={{ borderRadius: '50%', padding: '0.45rem' }}
              title="Close enlarged view (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div 
          className="modal-body lightbox-body" 
          style={{ alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'auto', textAlign: 'center' }}
        >
          <img 
            src={imageUrl} 
            alt={title || 'Trade Chart Screenshot'} 
            className="lightbox-img" 
            style={{ maxHeight: '78vh', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tip: Click anywhere outside the image or press <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>ESC</kbd> to close.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

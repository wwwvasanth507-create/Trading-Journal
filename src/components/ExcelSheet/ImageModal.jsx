import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

export default function ImageModal({ imageUrl, title, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '900px', background: '#0b0f19' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ZoomIn size={18} color="var(--accent-primary)" />
            <span>Chart Analysis Screenshot: {title}</span>
          </div>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onClose}
            style={{ borderRadius: '50%', padding: '0.4rem' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <img 
            src={imageUrl} 
            alt={title || 'Trade Chart Screenshot'} 
            className="lightbox-img" 
          />
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Pro Tip: You can paste screenshots directly from TradingView using Ctrl+V while editing a trade.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Keyboard, X, Command } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', description: 'Log a new trade modal' },
    { key: 'C', description: 'Open Position Size / Risk Calculator' },
    { key: '1', description: 'Switch to Journal Sheet tab' },
    { key: '2', description: 'Switch to Analytics & Equity tab' },
    { key: '3', description: 'Switch to Psychology & Rules tab' },
    { key: '4', description: 'Switch to Trading Calendar tab' },
    { key: '?', description: 'Show keyboard shortcuts helper' },
    { key: 'Esc', description: 'Close any active modal' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Keyboard size={20} color="var(--accent-primary)" />
            <h2 className="modal-title">Keyboard Hotkeys</h2>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Speed up your trading journal workflow with press-and-go keyboard hotkeys:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            {shortcuts.map(s => (
              <div 
                key={s.key}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.55rem 0.85rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{s.description}</span>
                <kbd style={{ 
                  background: 'var(--bg-input)', 
                  border: '1px solid var(--border-card)', 
                  padding: '2px 8px', 
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)'
                }}>
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Got It</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Calculator, ArrowRight } from 'lucide-react';
import { 
  calculateSLDistance, 
  calculatePlannedRR, 
  calculateLotSize, 
  calculateRiskAmount 
} from '../../utils/calculations';
import { POPULAR_ASSETS } from '../../utils/sampleData';

export default function RiskCalculatorModal({ 
  isOpen, 
  onClose, 
  accountBalance, 
  onApplyToNewTrade 
}) {
  const [pair, setPair] = useState('EURUSD');
  const [direction, setDirection] = useState('BUY');
  const [balance, setBalance] = useState(() => (accountBalance || 10000).toString());
  const [riskPct, setRiskPct] = useState('1.0');
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');

  if (!isOpen) return null;

  const balNum = parseFloat(balance) || 0;
  const riskNum = parseFloat(riskPct) || 0;
  const entryNum = parseFloat(entry) || 0;
  const slNum = parseFloat(sl) || 0;
  const tpNum = parseFloat(tp) || 0;

  const slDist = calculateSLDistance(direction, entryNum, slNum);
  const riskAmount = calculateRiskAmount(balNum, riskNum);
  const plannedRR = calculatePlannedRR(direction, entryNum, slNum, tpNum);

  const lotSize = (slDist > 0 && riskAmount > 0)
    ? calculateLotSize(balNum, riskNum, direction, entryNum, slNum, pair)
    : 0;

  const handleApply = () => {
    onApplyToNewTrade({
      pair,
      direction,
      entryPrice: entryNum,
      stopLoss: slNum,
      takeProfit: tpNum,
      riskPercent: riskNum,
      lotSize: lotSize
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container liquid-modal-container" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
              <Calculator size={18} />
            </div>
            <div>
              <div className="modal-title">Position Size & Risk Calculator</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Calculate exact lot size and stop distance before executing
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Real-time Calculation Result Box */}
          <div className="calc-preview-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', background: 'linear-gradient(135deg, #0d1322 0%, #1e293b 100%)' }}>
            <div className="calc-card">
              <span className="calc-card-label">Allowed Risk ($)</span>
              <span className="calc-card-value highlight">
                ${riskAmount.toFixed(2)}
              </span>
            </div>
            <div className="calc-card">
              <span className="calc-card-label">Recommended Lot Size</span>
              <span className="calc-card-value highlight" style={{ color: 'var(--color-win)', fontSize: '1.25rem' }}>
                {lotSize > 0 ? lotSize : '0.00'}
              </span>
            </div>
            <div className="calc-card">
              <span className="calc-card-label">Planned R:R</span>
              <span className="calc-card-value">
                {plannedRR ? `1 : ${plannedRR}` : '—'}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="form-label" style={{ marginBottom: '0.3rem', display: 'block' }}>Preset Pair:</span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {POPULAR_ASSETS.map(asset => (
                <button 
                  key={asset.symbol}
                  type="button"
                  className={`asset-chip ${pair === asset.symbol ? 'active' : ''}`}
                  onClick={() => setPair(asset.symbol)}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Asset / Pair</label>
              <input 
                type="text" 
                className="form-input" 
                value={pair} 
                onChange={e => setPair(e.target.value.toUpperCase())} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trade Direction</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn ${direction === 'BUY' ? 'btn-success' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.45rem' }}
                  onClick={() => setDirection('BUY')}
                >
                  BUY
                </button>
                <button
                  type="button"
                  className={`btn ${direction === 'SELL' ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.45rem' }}
                  onClick={() => setDirection('SELL')}
                >
                  SELL
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Capital ($)</label>
              <input 
                type="number" 
                className="form-input cell-mono" 
                value={balance} 
                onChange={e => setBalance(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Risk Percentage (%)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-input cell-mono" 
                value={riskPct} 
                onChange={e => setRiskPct(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-grid" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div className="form-group">
              <label className="form-label">Entry Price</label>
              <input 
                type="number" 
                step="any" 
                placeholder="e.g. 1.08500" 
                className="form-input cell-mono" 
                value={entry} 
                onChange={e => setEntry(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stop Loss</label>
              <input 
                type="number" 
                step="any" 
                placeholder="e.g. 1.08300" 
                className="form-input cell-mono" 
                value={sl} 
                onChange={e => setSl(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Take Profit (Optional)</label>
              <input 
                type="number" 
                step="any" 
                placeholder="e.g. 1.09100" 
                className="form-input cell-mono" 
                value={tp} 
                onChange={e => setTp(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            disabled={lotSize <= 0} 
            onClick={handleApply}
          >
            <span>Log Trade With These Values</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  Image as ImageIcon, 
  ZoomIn,
  Sparkles, 
  Calculator,
  AlertTriangle
} from 'lucide-react';
import { 
  autoCalculateTrade, 
  calculateSLDistance, 
  calculateTPDistance, 
  calculatePlannedRR, 
  calculateLotSize, 
  calculateRiskAmount,
  calculatePnL,
  calculateRealizedRR,
  calculateResult 
} from '../../utils/calculations';
import { 
  SETUP_OPTIONS, 
  TIMEFRAME_OPTIONS, 
  MISTAKE_OPTIONS, 
  EMOTION_OPTIONS 
} from '../../utils/sampleData';

export default function TradeModal({ 
  trade, 
  accountBalance, 
  isOpen, 
  onClose, 
  onSave,
  nextTradeNum = 1,
  onViewImage
}) {
  if (!isOpen) return null;

  const isEditing = !!(trade && trade.id);

  // Initial state
  const [formData, setFormData] = useState(() => {
    if (isEditing) {
      return { ...trade };
    }
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().substring(0, 5);
    return {
      tradeNum: nextTradeNum,
      date: today,
      time: nowTime,
      pair: 'EURUSD',
      direction: 'BUY',
      setup: 'Liquidity Sweep + FVG',
      timeFrame: '15m',
      entryPrice: '',
      stopLoss: '',
      takeProfit: '',
      riskPercent: 1.0,
      lotSize: '',
      exitPrice: '',
      result: 'OPEN',
      pnl: '',
      plannedRR: '',
      realizedRR: '',
      ruleFollowed: 'Yes',
      mistake: 'None',
      emotion: 'Disciplined',
      screenshot: '',
      lesson: ''
    };
  });

  // Calculate live preview metrics
  const entryNum = parseFloat(formData.entryPrice) || 0;
  const slNum = parseFloat(formData.stopLoss) || 0;
  const tpNum = parseFloat(formData.takeProfit) || 0;
  const exitNum = parseFloat(formData.exitPrice) || 0;
  const riskPctNum = parseFloat(formData.riskPercent) || 0;
  const lotNum = parseFloat(formData.lotSize) || 0;

  const slDist = calculateSLDistance(formData.direction, entryNum, slNum);
  const tpDist = calculateTPDistance(formData.direction, entryNum, tpNum);
  const dollarRisk = calculateRiskAmount(accountBalance, riskPctNum);
  const plannedRR = calculatePlannedRR(formData.direction, entryNum, slNum, tpNum);

  // Suggested lot size
  const suggestedLot = (slDist > 0 && dollarRisk > 0) 
    ? calculateLotSize(accountBalance, riskPctNum, formData.direction, entryNum, slNum, formData.pair)
    : null;

  // Realized outcome if exit price is entered
  const livePnL = (exitNum > 0 && entryNum > 0 && (lotNum > 0 || (suggestedLot && suggestedLot > 0)))
    ? calculatePnL(formData.direction, entryNum, exitNum, lotNum > 0 ? lotNum : suggestedLot, formData.pair)
    : null;

  const liveResult = exitNum > 0 ? calculateResult(exitNum, livePnL) : 'OPEN';
  const liveRealizedRR = (livePnL !== null && dollarRisk > 0)
    ? calculateRealizedRR(livePnL, dollarRisk, formData.direction, entryNum, slNum, exitNum)
    : null;

  // Sync suggested lot size if user has not typed custom lot
  const handleApplySuggestedLot = () => {
    if (suggestedLot) {
      setFormData(prev => ({ ...prev, lotSize: suggestedLot }));
    }
  };

  // Handle clipboard paste for screenshots
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            setFormData(prev => ({ ...prev, screenshot: evt.target.result }));
          }
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFormData(prev => ({ ...prev, screenshot: evt.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Auto-complete fields before saving
    const finalTrade = autoCalculateTrade({
      ...formData,
      id: formData.id || 't-' + Date.now(),
      entryPrice: parseFloat(formData.entryPrice) || 0,
      stopLoss: parseFloat(formData.stopLoss) || 0,
      takeProfit: parseFloat(formData.takeProfit) || 0,
      riskPercent: parseFloat(formData.riskPercent) || 1,
      lotSize: parseFloat(formData.lotSize) || (suggestedLot || 0.1),
      exitPrice: formData.exitPrice !== '' ? parseFloat(formData.exitPrice) : '',
      pnl: formData.pnl !== '' ? parseFloat(formData.pnl) : (livePnL !== null ? livePnL : null),
    }, accountBalance);

    onSave(finalTrade);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} onPaste={handlePaste}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '840px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: formData.direction === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: formData.direction === 'BUY' ? 'var(--color-win)' : 'var(--color-loss)'
              }}
            >
              {formData.direction === 'BUY' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <div>
              <div className="modal-title">
                {isEditing ? `Edit Trade #${formData.tradeNum}` : `Log New Trade #${formData.tradeNum}`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Auto-calculates SL Distance, Risk $, Lot Size, P&L, and Planned/Realized R:R
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            
            {/* Live Auto-Calculation Preview Bar */}
            <div className="calc-preview-grid">
              <div className="calc-card">
                <span className="calc-card-label">Planned R:R</span>
                <span className={`calc-card-value ${plannedRR ? 'highlight' : ''}`}>
                  {plannedRR ? `1 : ${plannedRR.toFixed(2)}` : '—'}
                </span>
              </div>
              <div className="calc-card">
                <span className="calc-card-label">Dollar Risk</span>
                <span className="calc-card-value">
                  ${dollarRisk.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({formData.riskPercent}%)</span>
                </span>
              </div>
              <div className="calc-card">
                <span className="calc-card-label">Auto Lot Size</span>
                <span className="calc-card-value highlight" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {suggestedLot ? suggestedLot : '—'}
                  {suggestedLot && formData.lotSize !== suggestedLot && (
                    <button 
                      type="button" 
                      onClick={handleApplySuggestedLot}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.7rem', textDecoration: 'underline' }}
                    >
                      Apply
                    </button>
                  )}
                </span>
              </div>
              <div className="calc-card">
                <span className="calc-card-label">Outcome P&L</span>
                <span className={`calc-card-value ${livePnL > 0 ? 'win' : livePnL < 0 ? 'loss' : ''}`}>
                  {livePnL !== null ? `${livePnL >= 0 ? '+' : ''}$${livePnL.toFixed(2)}` : 'OPEN'}
                </span>
              </div>
              <div className="calc-card">
                <span className="calc-card-label">Realized R:R</span>
                <span className={`calc-card-value ${liveRealizedRR > 0 ? 'win' : liveRealizedRR < 0 ? 'loss' : ''}`}>
                  {liveRealizedRR !== null ? `${liveRealizedRR >= 0 ? '+' : ''}${liveRealizedRR}R` : '—'}
                </span>
              </div>
            </div>

            {/* General Details */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.date} 
                  onChange={e => setFormData({ ...formData, date: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={formData.time} 
                  onChange={e => setFormData({ ...formData, time: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pair / Asset</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. EURUSD, XAUUSD, BTCUSDT"
                  value={formData.pair} 
                  onChange={e => setFormData({ ...formData, pair: e.target.value.toUpperCase() })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Direction</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn ${formData.direction === 'BUY' ? 'btn-success' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.5rem' }}
                    onClick={() => setFormData({ ...formData, direction: 'BUY' })}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    className={`btn ${formData.direction === 'SELL' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.5rem' }}
                    onClick={() => setFormData({ ...formData, direction: 'SELL' })}
                  >
                    SELL / SHORT
                  </button>
                </div>
              </div>
            </div>

            {/* Strategy & Timeframe */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Setup / Strategy</label>
                <input 
                  type="text"
                  list="setup-list"
                  className="form-input"
                  placeholder="e.g. Liquidity Sweep, Order Block"
                  value={formData.setup}
                  onChange={e => setFormData({ ...formData, setup: e.target.value })}
                />
                <datalist id="setup-list">
                  {SETUP_OPTIONS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Time Frame</label>
                <select 
                  className="form-select"
                  value={formData.timeFrame}
                  onChange={e => setFormData({ ...formData, timeFrame: e.target.value })}
                >
                  {TIMEFRAME_OPTIONS.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Risk % (of ${accountBalance.toLocaleString()})</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.1" 
                  max="100"
                  className="form-input cell-mono" 
                  value={formData.riskPercent} 
                  onChange={e => setFormData({ ...formData, riskPercent: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Lot Size {suggestedLot ? `(Auto: ${suggestedLot})` : ''}
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-input cell-mono" 
                  placeholder={suggestedLot ? suggestedLot.toString() : 'Auto or enter lot'}
                  value={formData.lotSize} 
                  onChange={e => setFormData({ ...formData, lotSize: e.target.value })} 
                />
              </div>
            </div>

            {/* Price Levels (Auto-Calculates SL Dist, TP Dist, R:R) */}
            <div className="form-grid" style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div className="form-group">
                <label className="form-label">Entry Price</label>
                <input 
                  type="number" 
                  step="any" 
                  className="form-input cell-mono" 
                  placeholder="e.g. 1.08500"
                  value={formData.entryPrice} 
                  onChange={e => setFormData({ ...formData, entryPrice: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stop Loss</label>
                <input 
                  type="number" 
                  step="any" 
                  className="form-input cell-mono" 
                  placeholder="e.g. 1.08300"
                  value={formData.stopLoss} 
                  onChange={e => setFormData({ ...formData, stopLoss: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Take Profit</label>
                <input 
                  type="number" 
                  step="any" 
                  className="form-input cell-mono" 
                  placeholder="e.g. 1.09100"
                  value={formData.takeProfit} 
                  onChange={e => setFormData({ ...formData, takeProfit: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Exit Price (Leave blank if open)</label>
                <input 
                  type="number" 
                  step="any" 
                  className="form-input cell-mono" 
                  placeholder="Actual Exit Price"
                  value={formData.exitPrice} 
                  onChange={e => setFormData({ ...formData, exitPrice: e.target.value })} 
                />
              </div>
            </div>

            {/* Psychology & Discipline (Global Benchmark Standard) */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Rule Followed?</label>
                <select 
                  className="form-select"
                  value={formData.ruleFollowed}
                  onChange={e => setFormData({ ...formData, ruleFollowed: e.target.value })}
                >
                  <option value="Yes">Yes (Disciplined 100%)</option>
                  <option value="No">No (Violated Strategy)</option>
                  <option value="Partial">Partial (Slight deviation)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mistake</label>
                <select 
                  className="form-select"
                  value={formData.mistake}
                  onChange={e => setFormData({ ...formData, mistake: e.target.value })}
                >
                  {MISTAKE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emotion</label>
                <select 
                  className="form-select"
                  value={formData.emotion}
                  onChange={e => setFormData({ ...formData, emotion: e.target.value })}
                >
                  {EMOTION_OPTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                </select>
              </div>
            </div>

            {/* Screenshot Dropzone & Paste */}
            <div className="form-group">
              <label className="form-label">Chart Screenshot (Paste Ctrl+V or Upload)</label>
              {formData.screenshot ? (
                <div 
                  className="image-thumbnail-card"
                  onDoubleClick={() => onViewImage && onViewImage(formData.screenshot, `${formData.pair || 'Trade'} Chart Screenshot`)}
                  title="Double-click to open enlarged view in lightbox"
                >
                  <div 
                    className="thumb-preview-wrap"
                    onClick={() => onViewImage && onViewImage(formData.screenshot, `${formData.pair || 'Trade'} Chart Screenshot`)}
                  >
                    <img 
                      src={formData.screenshot} 
                      alt="Thumbnail Preview" 
                      className="image-thumbnail-preview" 
                    />
                    <div className="thumb-overlay-hint">
                      <ZoomIn size={14} color="#fff" />
                    </div>
                  </div>

                  <div className="thumb-info">
                    <div className="thumb-title">Chart Screenshot Attached</div>
                    <div className="thumb-hint">Double-click to enlarge & inspect</div>
                  </div>

                  <div className="thumb-actions">
                    <button
                      type="button"
                      className="btn-thumb-action"
                      onClick={() => onViewImage && onViewImage(formData.screenshot, `${formData.pair || 'Trade'} Chart Screenshot`)}
                      title="Inspect image in full lightbox"
                    >
                      <ZoomIn size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-thumb-action btn-thumb-delete"
                      onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, screenshot: '' }); }}
                      title="Remove screenshot"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="dropzone">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <ImageIcon size={24} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Click to upload image, or press <strong>Ctrl+V</strong> anywhere to paste screenshot
                    </span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Lesson & Notes */}
            <div className="form-group">
              <label className="form-label">Lesson / Post-Trade Takeaway</label>
              <textarea 
                className="form-textarea" 
                rows={2} 
                placeholder="What did you learn? What would you do differently next time?"
                value={formData.lesson}
                onChange={e => setFormData({ ...formData, lesson: e.target.value })}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{isEditing ? 'Save Changes' : 'Log Trade'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

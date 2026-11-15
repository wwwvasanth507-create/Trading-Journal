import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  calculatePlannedRR, 
  calculateRiskAmount,
  calculateRiskPercentFromLots,
  calculatePnL,
  calculateRealizedRR,
  getMultiplierForPair
} from '../../utils/calculations';
import { 
  SETUP_OPTIONS, 
  TIMEFRAME_OPTIONS, 
  MISTAKE_OPTIONS, 
  EMOTION_OPTIONS,
  SESSION_OPTIONS,
  POPULAR_ASSETS 
} from '../../utils/sampleData';
import addTradeWallpaper from '../../assets/add-trade-wallpaper.jpg';

export default function TradeModal({ 
  trade, 
  accountBalance, 
  isOpen, 
  onClose, 
  onSave,
  nextTradeNum = 1,
  onViewImage
}) {
  const isEditing = !!(trade && trade.id);

  const [formData, setFormData] = useState({
    tradeNum: nextTradeNum,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    session: 'London',
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
  });

  useEffect(() => {
    if (isOpen) {
      if (trade && trade.id) {
        setFormData({ ...trade });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const nowTime = new Date().toTimeString().substring(0, 5);
        setFormData({
          tradeNum: nextTradeNum,
          date: today,
          time: nowTime,
          session: 'London',
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
        });
      }
    }
  }, [isOpen, trade, nextTradeNum]);

  if (!isOpen) return null;

  const entryNum = parseFloat(formData.entryPrice) || 0;
  const slNum = parseFloat(formData.stopLoss) || 0;
  const tpNum = parseFloat(formData.takeProfit) || 0;
  const exitNum = parseFloat(formData.exitPrice) || 0;
  const riskPctNum = parseFloat(formData.riskPercent) || 0;
  const lotNum = parseFloat(formData.lotSize) || 0;

  const slDist = calculateSLDistance(formData.direction, entryNum, slNum);
  const multiplier = getMultiplierForPair(formData.pair);
  const dollarRisk = (slDist > 0 && lotNum > 0)
    ? parseFloat((lotNum * slDist * multiplier).toFixed(2))
    : calculateRiskAmount(accountBalance, riskPctNum);
  const plannedRR = calculatePlannedRR(formData.direction, entryNum, slNum, tpNum);

  const livePnL = (exitNum > 0 && entryNum > 0 && lotNum > 0)
    ? calculatePnL(formData.direction, entryNum, exitNum, lotNum, formData.pair)
    : null;

  const liveRealizedRR = (livePnL !== null && dollarRisk > 0)
    ? calculateRealizedRR(livePnL, dollarRisk, formData.direction, entryNum, slNum, exitNum)
    : null;

  const handleLotChange = (val) => {
    const parsed = parseFloat(val);
    let updatedRiskPct = formData.riskPercent;
    if (!isNaN(parsed) && parsed > 0 && entryNum > 0 && slNum > 0) {
      updatedRiskPct = calculateRiskPercentFromLots(accountBalance, parsed, formData.direction, entryNum, slNum, formData.pair);
    }
    setFormData(prev => ({ ...prev, lotSize: val, riskPercent: updatedRiskPct }));
  };

  const handleEntryChange = (val) => {
    const newEntry = parseFloat(val) || 0;
    let updatedRiskPct = formData.riskPercent;
    if (lotNum > 0 && newEntry > 0 && slNum > 0) {
      updatedRiskPct = calculateRiskPercentFromLots(accountBalance, lotNum, formData.direction, newEntry, slNum, formData.pair);
    }
    setFormData(prev => ({ ...prev, entryPrice: val, riskPercent: updatedRiskPct }));
  };

  const handleSLChange = (val) => {
    const newSL = parseFloat(val) || 0;
    let updatedRiskPct = formData.riskPercent;
    if (lotNum > 0 && entryNum > 0 && newSL > 0) {
      updatedRiskPct = calculateRiskPercentFromLots(accountBalance, lotNum, formData.direction, entryNum, newSL, formData.pair);
    }
    setFormData(prev => ({ ...prev, stopLoss: val, riskPercent: updatedRiskPct }));
  };

  const handleSelectAssetPreset = (asset) => {
    setFormData(prev => ({ ...prev, pair: asset.symbol }));
  };

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

    const finalTrade = autoCalculateTrade({
      ...formData,
      id: formData.id || 't-' + Date.now(),
      entryPrice: parseFloat(formData.entryPrice) || 0,
      stopLoss: parseFloat(formData.stopLoss) || 0,
      takeProfit: parseFloat(formData.takeProfit) || 0,
      riskPercent: parseFloat(formData.riskPercent) || 1,
      lotSize: formData.lotSize !== '' && !isNaN(parseFloat(formData.lotSize)) ? parseFloat(formData.lotSize) : formData.lotSize,
      exitPrice: formData.exitPrice !== '' ? parseFloat(formData.exitPrice) : '',
      pnl: formData.pnl !== '' ? parseFloat(formData.pnl) : (livePnL !== null ? livePnL : null),
    }, accountBalance);

    onSave(finalTrade);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} onPaste={handlePaste}>
      <div 
        className="modal-container add-trade-modal-container" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '840px',
          backgroundImage: `linear-gradient(rgba(6, 10, 22, 0.30), rgba(8, 14, 28, 0.45)), url(${addTradeWallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: formData.direction === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: formData.direction === 'BUY' ? 'var(--color-win)' : 'var(--color-loss)'
              }}
            >
              {formData.direction === 'BUY' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div>
              <div className="modal-title">
                {isEditing ? `Edit Trade #${formData.tradeNum}` : `Log New Trade #${formData.tradeNum}`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Auto-calculates SL Distance, Risk $, P&L, and Planned/Realized R:R
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            
            {/* Live Calculation Preview Bar */}
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
                  ${dollarRisk.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({formData.riskPercent || '—'}%)</span>
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

            {/* Risk Warning Alert */}
            {riskPctNum > 2.5 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-loss-border)', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-loss)', fontSize: '0.8rem' }}>
                <AlertTriangle size={16} />
                <span>Risk Alert: You are risking <strong>{riskPctNum}%</strong> of capital (${dollarRisk.toFixed(2)}). Standard risk parameters recommend &le; 2.0% per trade.</span>
              </div>
            )}

            {/* Asset Quick Select Chips */}
            <div>
              <span className="form-label" style={{ marginBottom: '0.3rem', display: 'block' }}>Quick Pair Presets:</span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {POPULAR_ASSETS.map(asset => (
                  <button 
                    key={asset.symbol}
                    type="button"
                    className={`asset-chip ${formData.pair === asset.symbol ? 'active' : ''}`}
                    onClick={() => handleSelectAssetPreset(asset)}
                  >
                    {asset.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* General Details */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.date || ''} 
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={formData.time || ''} 
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Market Session</label>
                <select 
                  className="form-select"
                  value={formData.session || 'London'}
                  onChange={e => setFormData({ ...formData, session: e.target.value })}
                >
                  {SESSION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Symbol / Pair</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.pair || ''} 
                  onChange={e => setFormData({ ...formData, pair: e.target.value.toUpperCase() })}
                  placeholder="e.g. EURUSD, XAUUSD"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Direction</label>
                <select 
                  className="form-select"
                  value={formData.direction}
                  onChange={e => setFormData({ ...formData, direction: e.target.value })}
                  style={{ color: formData.direction === 'BUY' ? 'var(--color-win)' : 'var(--color-loss)', fontWeight: 700 }}
                >
                  <option value="BUY">BUY / Long</option>
                  <option value="SELL">SELL / Short</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Setup Model</label>
                <select 
                  className="form-select"
                  value={formData.setup}
                  onChange={e => setFormData({ ...formData, setup: e.target.value })}
                >
                  {SETUP_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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
            </div>

            {/* Entry, SL, TP, Lot Size, Risk, Exit */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Entry Price</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-input cell-mono" 
                  value={formData.entryPrice} 
                  onChange={e => handleEntryChange(e.target.value)}
                  placeholder="1.08200"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stop Loss Price</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-input cell-mono" 
                  value={formData.stopLoss} 
                  onChange={e => handleSLChange(e.target.value)}
                  placeholder="1.08050"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Take Profit Price</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-input cell-mono" 
                  value={formData.takeProfit} 
                  onChange={e => setFormData({ ...formData, takeProfit: e.target.value })}
                  placeholder="1.08650"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                  Lot Size (Manual)
                </label>
                <input 
                  type="number" 
                  step="any"
                  className="form-input cell-mono" 
                  value={formData.lotSize} 
                  onChange={e => handleLotChange(e.target.value)}
                  placeholder="Enter lot size (e.g. 0.50)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Risk Percentage (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input cell-mono" 
                  value={formData.riskPercent} 
                  onChange={e => setFormData({ ...formData, riskPercent: e.target.value })}
                  placeholder="1.0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Exit Price (Leave empty if open)</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-input cell-mono" 
                  value={formData.exitPrice} 
                  onChange={e => setFormData({ ...formData, exitPrice: e.target.value })}
                  placeholder="Optional exit price"
                />
              </div>
            </div>

            {/* Psychology & Rules */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Did you follow trading rules?</label>
                <select 
                  className="form-select"
                  value={formData.ruleFollowed}
                  onChange={e => setFormData({ ...formData, ruleFollowed: e.target.value })}
                >
                  <option value="Yes">Yes — Plan Followed Perfectly</option>
                  <option value="No">No — Violated Strategy Rules</option>
                  <option value="Partial">Partial — Minor Hesitation / Adjustment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Execution Mistake</label>
                <select 
                  className="form-select"
                  value={formData.mistake}
                  onChange={e => setFormData({ ...formData, mistake: e.target.value })}
                >
                  {MISTAKE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Emotional State</label>
                <select 
                  className="form-select"
                  value={formData.emotion}
                  onChange={e => setFormData({ ...formData, emotion: e.target.value })}
                >
                  {EMOTION_OPTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                </select>
              </div>
            </div>

            {/* Screenshot Paste / Upload */}
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
                    onDoubleClick={() => onViewImage && onViewImage(formData.screenshot, `${formData.pair || 'Trade'} Chart Screenshot`)}
                    title="Double-click to enlarge & inspect"
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
                <div 
                  className="dropzone"
                  onClick={() => document.getElementById('screenshot-upload')?.click()}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <ImageIcon size={24} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Paste screenshot directly anywhere in this modal or click to browse
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Supports PNG, JPG, WebP, SVG
                    </span>
                  </div>
                  <input 
                    id="screenshot-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }} 
                  />
                </div>
              )}
            </div>

            {/* Lessons Learned */}
            <div className="form-group">
              <label className="form-label">Lesson & Trade Notes</label>
              <textarea 
                className="form-textarea" 
                rows={2}
                value={formData.lesson} 
                onChange={e => setFormData({ ...formData, lesson: e.target.value })}
                placeholder="What did you do well? What could be improved for next time?"
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

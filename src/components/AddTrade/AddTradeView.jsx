import React, { useState } from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Image as ImageIcon, 
  ZoomIn, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  Percent,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
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

export default function AddTradeView({ 
  accountBalance, 
  onSaveTrade, 
  nextTradeNum, 
  onNavigateTab,
  onViewImage 
}) {
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

  const [lastSavedTrade, setLastSavedTrade] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const resetForm = () => {
    setFormData({
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
    setSuccessMsg(false);
  };

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
      id: 't-' + Date.now(),
      entryPrice: parseFloat(formData.entryPrice) || 0,
      stopLoss: parseFloat(formData.stopLoss) || 0,
      takeProfit: parseFloat(formData.takeProfit) || 0,
      riskPercent: parseFloat(formData.riskPercent) || 1,
      lotSize: formData.lotSize !== '' && !isNaN(parseFloat(formData.lotSize)) ? parseFloat(formData.lotSize) : formData.lotSize,
      exitPrice: formData.exitPrice !== '' ? parseFloat(formData.exitPrice) : '',
      pnl: formData.pnl !== '' ? parseFloat(formData.pnl) : (livePnL !== null ? livePnL : null),
    }, accountBalance);

    onSaveTrade(finalTrade);
    setLastSavedTrade(finalTrade);
    setSuccessMsg(true);

    if (finalTrade.result === 'WIN' && finalTrade.pnl > 0) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div 
      className="add-trade-tab-view"
      onPaste={handlePaste}
      style={{
        backgroundImage: `linear-gradient(rgba(6, 10, 22, 0.38), rgba(8, 14, 28, 0.52)), url(${addTradeWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Top Banner / Tab Title */}
      <div className="add-trade-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div 
            style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: formData.direction === 'BUY' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: formData.direction === 'BUY' ? 'var(--color-win)' : 'var(--color-loss)',
              border: `1px solid ${formData.direction === 'BUY' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              boxShadow: `0 0 16px ${formData.direction === 'BUY' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}
          >
            {formData.direction === 'BUY' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 className="add-trade-title">Log New Trade #{formData.tradeNum}</h2>
              <span className="badge badge-manual-lot">100% Manual Lot Size</span>
            </div>
            <p className="add-trade-subtitle">
              Enter and track trade executions with strict risk discipline and custom position sizing.
            </p>
          </div>
        </div>

        {/* Popular Asset Chips */}
        <div className="add-trade-asset-chips">
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>Quick Pairs:</span>
          {POPULAR_ASSETS.slice(0, 6).map(asset => (
            <button
              key={asset.symbol}
              type="button"
              className={`chip-preset ${formData.pair === asset.symbol ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, pair: asset.symbol }))}
            >
              {asset.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && lastSavedTrade && (
        <div className="add-trade-success-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={22} color="#10b981" />
            <div>
              <span style={{ fontWeight: 700, color: '#10b981' }}>Trade #{lastSavedTrade.tradeNum} logged successfully!</span>
              <span style={{ marginLeft: '0.5rem', color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem' }}>
                {lastSavedTrade.direction} {lastSavedTrade.pair} | Lot: {lastSavedTrade.lotSize || '0.00'} | Outcome: {lastSavedTrade.result}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={resetForm}
            >
              <RotateCcw size={14} />
              <span>Log Another Trade</span>
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => onNavigateTab('sheet')}
            >
              <span>View in Journal Sheet</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Live Preview Cards (Planned R:R, Dollar Risk, Outcome P&L, Realized R:R) */}
      <div className="calc-preview-grid">
        <div className="calc-card">
          <div className="calc-card-label">Planned R:R</div>
          <div className="calc-card-value" style={{ color: plannedRR && plannedRR >= 2 ? 'var(--color-win)' : 'var(--text-primary)' }}>
            {plannedRR ? `1 : ${plannedRR}` : '---'}
          </div>
        </div>

        <div className="calc-card">
          <div className="calc-card-label">Dollar Risk ($)</div>
          <div className="calc-card-value" style={{ color: 'var(--color-loss)' }}>
            ${dollarRisk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="calc-card">
          <div className="calc-card-label">Outcome P&L ($)</div>
          <div 
            className="calc-card-value"
            style={{ 
              color: livePnL !== null 
                ? (livePnL > 0 ? 'var(--color-win)' : (livePnL < 0 ? 'var(--color-loss)' : 'var(--text-secondary)')) 
                : 'var(--text-muted)' 
            }}
          >
            {livePnL !== null ? `${livePnL >= 0 ? '+' : ''}$${livePnL.toFixed(2)}` : 'Open / Unclosed'}
          </div>
        </div>

        <div className="calc-card">
          <div className="calc-card-label">Realized R:R</div>
          <div 
            className="calc-card-value"
            style={{ 
              color: liveRealizedRR !== null 
                ? (liveRealizedRR > 0 ? 'var(--color-win)' : (liveRealizedRR < 0 ? 'var(--color-loss)' : 'var(--text-secondary)')) 
                : 'var(--text-muted)' 
            }}
          >
            {liveRealizedRR !== null ? `${liveRealizedRR > 0 ? '+' : ''}${liveRealizedRR}R` : '---'}
          </div>
        </div>
      </div>

      {/* Main Trade Form */}
      <form onSubmit={handleSubmit} className="add-trade-form-body">
        {/* Section 1: Trade Setup & Direction */}
        <div className="form-section-title">
          <Sparkles size={16} color="var(--accent-primary)" />
          <span>Setup & Execution Details</span>
        </div>

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

        {/* Section 2: Position Pricing & 100% MANUAL Lot Size */}
        <div className="form-section-title" style={{ marginTop: '1.25rem' }}>
          <DollarSign size={16} color="var(--accent-primary)" />
          <span>Position Sizing & Pricing</span>
        </div>

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

          {/* 100% MANUAL LOT SIZE FIELD */}
          <div className="form-group" style={{ position: 'relative' }}>
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
            <label className="form-label">Exit Price (Leave empty if trade is open)</label>
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

        {/* Section 3: Psychology, Rules & Discipline */}
        <div className="form-section-title" style={{ marginTop: '1.25rem' }}>
          <ShieldCheck size={16} color="var(--accent-primary)" />
          <span>Discipline & Trading Psychology</span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Rules Followed?</label>
            <select 
              className="form-select"
              value={formData.ruleFollowed}
              onChange={e => setFormData({ ...formData, ruleFollowed: e.target.value })}
            >
              <option value="Yes">Yes - Followed Plan 100%</option>
              <option value="Partial">Partial - Slight Deviations</option>
              <option value="No">No - Broke Rules</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Emotional Mindset</label>
            <select 
              className="form-select"
              value={formData.emotion}
              onChange={e => setFormData({ ...formData, emotion: e.target.value })}
            >
              {EMOTION_OPTIONS.map(em => <option key={em} value={em}>{em}</option>)}
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
            <label className="form-label">Trade Result</label>
            <select 
              className="form-select"
              value={formData.result}
              onChange={e => setFormData({ ...formData, result: e.target.value })}
              style={{ 
                color: formData.result === 'WIN' ? 'var(--color-win)' : (formData.result === 'LOSS' ? 'var(--color-loss)' : 'inherit'),
                fontWeight: 700 
              }}
            >
              <option value="OPEN">OPEN (Active Trade)</option>
              <option value="WIN">WIN (Take Profit Hit)</option>
              <option value="LOSS">LOSS (Stop Loss Hit)</option>
              <option value="BE">BE (Break Even)</option>
            </select>
          </div>
        </div>

        {/* Section 4: Screenshot & Notes */}
        <div className="form-grid" style={{ marginTop: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Chart Screenshot / Image URL</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Paste clipboard anywhere (Ctrl+V)</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                value={formData.screenshot?.startsWith('data:') ? '[Pasted Image File]' : (formData.screenshot || '')} 
                onChange={e => setFormData({ ...formData, screenshot: e.target.value })}
                placeholder="https://tradingview.com/x/..."
              />
              <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.55rem 0.85rem' }} title="Upload chart image file">
                <ImageIcon size={16} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            </div>

            {formData.screenshot && (
              <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                <img 
                  src={formData.screenshot} 
                  alt="Chart Screenshot" 
                  style={{ width: '130px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onClick={() => onViewImage && onViewImage(formData.screenshot, `${formData.pair} Trade Setup`)}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, screenshot: '' })}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--color-loss)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Trade Notes & Lessons Learned</label>
            <textarea 
              className="form-textarea" 
              rows={3}
              value={formData.lesson || ''} 
              onChange={e => setFormData({ ...formData, lesson: e.target.value })}
              placeholder="What did you observe? Did price action respect the key level? What can you improve next time?"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="add-trade-actions-bar">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={resetForm}
          >
            <RotateCcw size={16} />
            <span>Reset Fields</span>
          </button>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
          >
            <PlusCircle size={18} />
            <span>Save Trade to Journal</span>
          </button>
        </div>
      </form>
    </div>
  );
}

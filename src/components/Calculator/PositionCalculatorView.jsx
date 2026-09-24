import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  DollarSign, 
  Percent, 
  Zap, 
  Target, 
  RotateCcw, 
  Check, 
  Droplet,
  Sliders,
  Layers,
  Info
} from 'lucide-react';
import { 
  calculateSLDistance, 
  calculatePlannedRR, 
  calculateLotSize, 
  calculateRiskAmount 
} from '../../utils/calculations';
import { POPULAR_ASSETS } from '../../utils/sampleData';

export default function PositionCalculatorView({ 
  accountBalance = 10000, 
  onApplyToNewTrade,
  onNavigateTab
}) {
  const [pair, setPair] = useState('EURUSD');
  const [direction, setDirection] = useState('BUY');
  const [balance, setBalance] = useState(() => (accountBalance || 10000).toString());
  const [riskPct, setRiskPct] = useState('1.0');
  const [entry, setEntry] = useState('1.08500');
  const [sl, setSl] = useState('1.08200');
  const [tp, setTp] = useState('1.09250');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const balNum = parseFloat(balance) || 0;
  const riskNum = parseFloat(riskPct) || 0;
  const entryNum = parseFloat(entry) || 0;
  const slNum = parseFloat(sl) || 0;
  const tpNum = parseFloat(tp) || 0;

  const slDist = calculateSLDistance(direction, entryNum, slNum);
  const tpDist = direction === 'BUY' ? Math.max(0, tpNum - entryNum) : Math.max(0, entryNum - tpNum);
  const riskAmount = calculateRiskAmount(balNum, riskNum);
  const plannedRR = calculatePlannedRR(direction, entryNum, slNum, tpNum);

  const lotSize = (slDist > 0 && riskAmount > 0)
    ? calculateLotSize(balNum, riskNum, direction, entryNum, slNum, pair)
    : 0;

  // Potential profit ($) based on R:R
  const potentialProfit = plannedRR > 0 ? (riskAmount * plannedRR) : 0;

  // Pip calculation approximation
  const isJpy = pair.toUpperCase().endsWith('JPY');
  const isCrypto = pair.toUpperCase().includes('BTC') || pair.toUpperCase().includes('ETH');
  const pipMultiplier = isJpy ? 100 : (isCrypto ? 1 : 10000);
  const slPips = (slDist * pipMultiplier).toFixed(1);
  const tpPips = (tpDist * pipMultiplier).toFixed(1);

  // Risk Rating Assessment
  const riskLevel = riskNum <= 1.0 ? 'Conservative' : (riskNum <= 2.0 ? 'Moderate' : 'Aggressive');
  const riskColor = riskNum <= 1.0 ? '#10b981' : (riskNum <= 2.0 ? '#f59e0b' : '#ef4444');

  const handleApply = () => {
    if (onApplyToNewTrade) {
      onApplyToNewTrade({
        pair,
        direction,
        entryPrice: entryNum,
        stopLoss: slNum,
        takeProfit: tpNum,
        riskPercent: riskNum,
        lotSize: lotSize
      });
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 2500);
    }
  };

  const handleReset = () => {
    setPair('EURUSD');
    setDirection('BUY');
    setBalance((accountBalance || 10000).toString());
    setRiskPct('1.0');
    setEntry('1.08500');
    setSl('1.08200');
    setTp('1.09250');
  };

  return (
    <div className="liquid-calculator-container">
      {/* Dynamic Liquid Glow Auras in background */}
      <div className="liquid-aura" style={{ top: '-40px', left: '10%' }} />
      <div className="liquid-aura" style={{ bottom: '10px', right: '15%', background: 'radial-gradient(circle, rgba(129, 140, 248, 0.22) 0%, rgba(16, 185, 129, 0.12) 50%, transparent 70%)' }} />

      {/* TOP HEADER: Liquid Title & Quick Actions */}
      <div className="liquid-glass-card" style={{ padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="liquid-specular" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(129, 140, 248, 0.4) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 20px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <Calculator size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#f8fafc' }}>
                Position Size & Risk Calculator
              </h1>
              <span className="badge" style={{ 
                background: 'rgba(56, 189, 248, 0.15)', 
                color: '#38bdf8', 
                border: '1px solid rgba(56, 189, 248, 0.35)', 
                fontSize: '0.68rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px'
              }}>
                <Droplet size={11} />
                LIQUID ENGINE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Bi-directional position sizing with institutional risk modeling & liquid display
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleReset}
            style={{ 
              background: 'rgba(255, 255, 255, 0.06)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.78rem',
              gap: '6px'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleApply}
            style={{ 
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 25px rgba(14, 165, 233, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              fontSize: '0.85rem',
              fontWeight: 700,
              gap: '6px'
            }}
          >
            {appliedSuccess ? (
              <>
                <Check size={16} color="#10b981" />
                <span>Trade Created!</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>Apply to Journal Trade</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* HERO LIQUID HUD: Real-time Metric Readouts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {/* RECOMMENDED LOT SIZE */}
        <div className="liquid-glass-card" style={{ gridColumn: 'span 2', minWidth: '320px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.65) 100%)' }}>
          <div className="liquid-specular" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
              Recommended Position Size
            </span>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', fontSize: '0.7rem' }}>
              Live Sized
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <div className="liquid-hud-value" style={{ fontSize: '2.8rem' }}>
              {lotSize > 0 ? lotSize : '0.00'}
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>
              Lots
            </span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Contract Volume:</span>
            <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {lotSize > 0 ? (lotSize * 100000).toLocaleString() : '0'} Units
            </strong>
            <span>•</span>
            <span style={{ color: '#94a3b8' }}>Risk: <strong>${riskAmount.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* CASH RISK CARD */}
        <div className="liquid-glass-card">
          <div className="liquid-specular" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
              Cash Risk ($)
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: riskColor, boxShadow: `0 0 8px ${riskColor}` }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f87171' }}>
            ${riskAmount.toFixed(2)}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {riskNum}% of capital • <span style={{ color: riskColor, fontWeight: 600 }}>{riskLevel}</span>
          </div>
        </div>

        {/* PLANNED R:R CARD */}
        <div className="liquid-glass-card">
          <div className="liquid-specular" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
              Risk : Reward
            </span>
            <Target size={14} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: plannedRR >= 2 ? '#34d399' : '#fbbf24' }}>
            {plannedRR > 0 ? `1 : ${plannedRR}` : '—'}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Target: <strong style={{ color: '#38bdf8' }}>{tpPips} pips</strong> vs Stop: <strong style={{ color: '#f87171' }}>{slPips} pips</strong>
          </div>
        </div>

        {/* POTENTIAL GAIN CARD */}
        <div className="liquid-glass-card">
          <div className="liquid-specular" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
              Projected Profit
            </span>
            <TrendingUp size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
            {potentialProfit > 0 ? `+$${potentialProfit.toFixed(2)}` : '$0.00'}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Net gain if TP hit (+{((potentialProfit / (balNum || 1)) * 100).toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LIQUID INTERACTIVE CONTROLS & VISUALIZER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: Input Parameters */}
        <div className="liquid-glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="liquid-specular" />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={16} color="#38bdf8" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>Trade Parameters</h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fill in values to update lot size</span>
          </div>

          {/* Quick Asset Selector */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', display: 'block' }}>
              Select Asset / Pair:
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {POPULAR_ASSETS.map(asset => (
                <button 
                  key={asset.symbol}
                  type="button"
                  onClick={() => setPair(asset.symbol)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: pair === asset.symbol ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.35) 0%, rgba(129, 140, 248, 0.4) 100%)' : 'rgba(255, 255, 255, 0.05)',
                    border: pair === asset.symbol ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: pair === asset.symbol ? '#38bdf8' : '#94a3b8',
                    boxShadow: pair === asset.symbol ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Direction Switcher (BUY / SELL) */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem', display: 'block' }}>
              Order Direction:
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className={`liquid-pill-btn ${direction === 'BUY' ? 'active-buy' : ''}`}
                onClick={() => setDirection('BUY')}
              >
                <TrendingUp size={16} />
                <span>LONG / BUY</span>
              </button>
              <button
                type="button"
                className={`liquid-pill-btn ${direction === 'SELL' ? 'active-sell' : ''}`}
                onClick={() => setDirection('SELL')}
              >
                <TrendingDown size={16} />
                <span>SHORT / SELL</span>
              </button>
            </div>
          </div>

          {/* Capital & Risk Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', display: 'block' }}>
                Account Capital ($)
              </label>
              <input 
                type="number"
                className="liquid-input"
                value={balance}
                onChange={e => setBalance(e.target.value)}
                placeholder="10000"
              />
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  onClick={() => setBalance((accountBalance || 10000).toString())}
                  style={{ fontSize: '0.65rem', background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '0' }}
                >
                  Use actual balance (${accountBalance})
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem', display: 'block' }}>
                Risk Percentage (%)
              </label>
              <input 
                type="number"
                step="0.1"
                className="liquid-input"
                value={riskPct}
                onChange={e => setRiskPct(e.target.value)}
                placeholder="1.0"
              />
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                {['0.5', '1.0', '1.5', '2.0'].map(r => (
                  <button 
                    key={r}
                    type="button"
                    onClick={() => setRiskPct(r)}
                    style={{
                      fontSize: '0.65rem',
                      background: riskPct === r ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      color: riskPct === r ? '#38bdf8' : '#94a3b8',
                      padding: '1px 5px',
                      cursor: 'pointer'
                    }}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Levels (Entry, SL, TP) */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Price Execution Targets
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
                  Entry Price
                </label>
                <input 
                  type="number"
                  step="any"
                  className="liquid-input"
                  value={entry}
                  onChange={e => setEntry(e.target.value)}
                  placeholder="1.08500"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#f87171', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Stop Loss (SL)
                </label>
                <input 
                  type="number"
                  step="any"
                  className="liquid-input"
                  style={{ borderColor: 'rgba(239, 68, 68, 0.35)' }}
                  value={sl}
                  onChange={e => setSl(e.target.value)}
                  placeholder="1.08200"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#34d399', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Take Profit (TP)
                </label>
                <input 
                  type="number"
                  step="any"
                  className="liquid-input"
                  style={{ borderColor: 'rgba(16, 185, 129, 0.35)' }}
                  value={tp}
                  onChange={e => setTp(e.target.value)}
                  placeholder="1.09250"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Liquid Price Ladder & Trade Projection */}
        <div className="liquid-glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div className="liquid-specular" />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} color="#34d399" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Price Map & Liquidity Ladder
                </h2>
              </div>
              <span className="badge" style={{ background: direction === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)', color: direction === 'BUY' ? '#34d399' : '#fb7185', fontSize: '0.72rem' }}>
                {direction} {pair}
              </span>
            </div>

            {/* Visual Ladder Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
              
              {/* TAKE PROFIT LEVEL */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.04) 100%)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>Take Profit</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                      {tpNum > 0 ? tpNum : '—'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                    +{tpPips} pips
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>
                    +${potentialProfit.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* ENTRY PIVOT LEVEL */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0.04) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#bae6fd', fontWeight: 700, textTransform: 'uppercase' }}>Entry Pivot</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                      {entryNum > 0 ? entryNum : '—'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontSize: '0.72rem' }}>
                    Execution Level
                  </span>
                </div>
              </div>

              {/* STOP LOSS LEVEL */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.18) 0%, rgba(239, 68, 68, 0.04) 100%)',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#fecaca', fontWeight: 700, textTransform: 'uppercase' }}>Stop Loss</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                      {slNum > 0 ? slNum : '—'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                    -{slPips} pips
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>
                    -${riskAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Execution Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready to trade?</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                {lotSize > 0 ? `${lotSize} Lots on ${pair}` : 'Enter valid prices'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApply}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                  fontWeight: 700
                }}
              >
                <span>Save to Journal</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

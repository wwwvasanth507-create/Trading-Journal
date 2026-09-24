import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Award, 
  Target, 
  Flag,
  Percent, 
  DollarSign, 
  ShieldAlert, 
  BarChart3, 
  Layers, 
  Globe,
  CheckCircle2
} from 'lucide-react';
import { calculateMilestoneProgress } from '../../utils/calculations';
import { GRAPH_COLOR_THEMES } from './DashboardOverview';

export default function AnalyticsView({ trades, accountBalance, milestoneTarget = 500, setMilestoneTarget, equityTarget, setEquityTarget }) {
  const activeMilestone = milestoneTarget || equityTarget || 500;
  const updateMilestone = setMilestoneTarget || setEquityTarget;

  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(activeMilestone.toString());
  const [graphThemeId, setGraphThemeId] = useState('cyber');

  const activeGraphTheme = GRAPH_COLOR_THEMES.find(t => t.id === graphThemeId) || GRAPH_COLOR_THEMES[0];

  // Closed trades sorted by date/time
  const closedTrades = trades
    .filter(t => t.result !== 'OPEN')
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

  const wins = closedTrades.filter(t => t.result === 'WIN');
  const losses = closedTrades.filter(t => t.result === 'LOSS');
  const bes = closedTrades.filter(t => t.result === 'BE');

  const totalClosed = closedTrades.length;
  const winRate = totalClosed > 0 ? Math.round((wins.length / totalClosed) * 100) : 0;
  const lossRate = totalClosed > 0 ? Math.round((losses.length / totalClosed) * 100) : 0;
  const beRate = totalClosed > 0 ? (100 - winRate - lossRate) : 0;

  const totalGrossProfit = wins.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const totalGrossLoss = Math.abs(losses.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0));
  const netPnL = totalGrossProfit - totalGrossLoss;
  const profitFactor = totalGrossLoss > 0 ? (totalGrossProfit / totalGrossLoss).toFixed(2) : (totalGrossProfit > 0 ? '∞' : '0.00');

  const avgWin = wins.length > 0 ? totalGrossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalGrossLoss / losses.length : 0;

  const expectancy = totalClosed > 0 
    ? ((wins.length / totalClosed) * avgWin) - ((losses.length / totalClosed) * avgLoss)
    : 0;

  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;

  const equityPoints = [
    { tradeNum: 0, pnl: 0, cumulative: 0, date: 'Start', pair: 'Baseline' }
  ];

  closedTrades.forEach((t) => {
    const pnl = parseFloat(t.pnl) || 0;
    cumulative += pnl;
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;

    equityPoints.push({
      tradeNum: t.tradeNum,
      pnl,
      cumulative: parseFloat(cumulative.toFixed(2)),
      date: t.date,
      pair: t.pair,
      result: t.result,
      setup: t.setup
    });
  });

  const chartWidth = 700;
  const chartHeight = 240;
  const padding = { top: 25, right: 30, bottom: 35, left: 60 };

  const minCum = Math.min(0, ...equityPoints.map(p => p.cumulative));
  const maxCum = Math.max(100, ...equityPoints.map(p => p.cumulative));
  const cumRange = (maxCum - minCum) || 1;

  const getX = (idx) => {
    if (equityPoints.length <= 1) return padding.left;
    return padding.left + (idx / (equityPoints.length - 1)) * (chartWidth - padding.left - padding.right);
  };

  const getY = (val) => {
    return chartHeight - padding.bottom - ((val - minCum) / cumRange) * (chartHeight - padding.top - padding.bottom);
  };

  const zeroY = getY(0);
  const pathD = equityPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.cumulative)}`).join(' ');
  const areaD = `${pathD} L ${getX(equityPoints.length - 1)} ${zeroY} L ${getX(0)} ${zeroY} Z`;

  // Linear Regression Trendline: y = m * x + b
  const numPts = equityPoints.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < numPts; i++) {
    const x = i;
    const y = equityPoints[i].cumulative;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = numPts * sumXX - sumX * sumX;
  const trendSlope = denominator !== 0 ? (numPts * sumXY - sumX * sumY) / denominator : 0;
  const trendIntercept = numPts > 0 ? (sumY - trendSlope * sumX) / numPts : 0;

  const trendStartVal = trendIntercept;
  const trendEndVal = trendSlope * (numPts - 1) + trendIntercept;

  const trendX1 = getX(0);
  const trendY1 = getY(trendStartVal);
  const trendX2 = getX(numPts - 1);
  const trendY2 = getY(trendEndVal);

  const isTrendBullish = trendSlope >= 0;

  // Performance by Setup
  const setupStats = {};
  closedTrades.forEach(t => {
    const s = t.setup || 'Other';
    if (!setupStats[s]) setupStats[s] = { count: 0, pnl: 0, wins: 0 };
    setupStats[s].count += 1;
    setupStats[s].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'WIN') setupStats[s].wins += 1;
  });

  const setupList = Object.entries(setupStats).sort((a, b) => b[1].pnl - a[1].pnl);

  // Performance by Pair
  const pairStats = {};
  closedTrades.forEach(t => {
    const p = t.pair || 'Other';
    if (!pairStats[p]) pairStats[p] = { count: 0, pnl: 0, wins: 0 };
    pairStats[p].count += 1;
    pairStats[p].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'WIN') pairStats[p].wins += 1;
  });

  const pairList = Object.entries(pairStats).sort((a, b) => b[1].pnl - a[1].pnl);

  // Performance by Market Session
  const sessionStats = {};
  closedTrades.forEach(t => {
    const sess = t.session || 'London';
    if (!sessionStats[sess]) sessionStats[sess] = { count: 0, pnl: 0, wins: 0 };
    sessionStats[sess].count += 1;
    sessionStats[sess].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'WIN') sessionStats[sess].wins += 1;
  });

  const sessionList = Object.entries(sessionStats).sort((a, b) => b[1].pnl - a[1].pnl);

  // Compute Milestone Progress (Strictly Net P&L vs Milestone Target - Starting Capital is NEVER added)
  const milestoneProgress = calculateMilestoneProgress(netPnL, activeMilestone);

  const handleSaveTarget = () => {
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0 && updateMilestone) {
      updateMilestone(val);
    }
    setIsEditingTarget(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Net Realized P&L</span>
            <div className="kpi-icon" style={{ background: netPnL >= 0 ? 'var(--color-win-bg)' : 'var(--color-loss-bg)', color: netPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: netPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
            {netPnL >= 0 ? '+' : ''}${netPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-sub">
            {totalClosed} completed trades ({trades.length - totalClosed} open)
          </div>
        </div>

        {/* Milestone Target & Progress (Calculated strictly WITHOUT starting capital) */}
        <div className="kpi-card" style={{ border: milestoneProgress.isAchieved ? '1px solid var(--color-win-border)' : undefined }}>
          <div className="kpi-header">
            <span title="Standalone profit milestone target (starting capital is not added)">Milestone Target</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Flag size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isEditingTarget ? (
              <input 
                type="number" 
                className="cell-input-inline" 
                style={{ width: '110px', fontSize: '1.2rem', color: '#f59e0b', borderBottom: '1px solid #f59e0b' }} 
                value={targetInput} 
                onChange={e => setTargetInput(e.target.value)} 
                onBlur={handleSaveTarget} 
                onKeyDown={e => e.key === 'Enter' && handleSaveTarget()} 
                autoFocus 
              />
            ) : (
              <span 
                className="editable" 
                onClick={() => { setTargetInput(activeMilestone.toString()); setIsEditingTarget(true); }}
                title="Click to edit milestone target amount (e.g. $500, separate from starting capital)"
              >
                ${activeMilestone.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
            {milestoneProgress.isAchieved && (
              <span style={{ fontSize: '0.72rem', background: 'var(--color-win-bg)', color: 'var(--color-win)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Achieved 🎉
              </span>
            )}
          </div>
          {/* Progress Bar towards Milestone Target */}
          <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg-tertiary)', overflow: 'hidden', marginTop: '2px' }}>
            <div 
              style={{ 
                width: `${milestoneProgress.progressPercent}%`, 
                height: '100%', 
                background: milestoneProgress.isAchieved ? 'var(--color-win)' : 'linear-gradient(90deg, #f59e0b, #3b82f6)', 
                transition: 'width 0.5s ease-out' 
              }} 
            />
          </div>
          <div className="kpi-sub" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>Progress: {milestoneProgress.progressPercent}% (${netPnL >= 0 ? '+' : ''}${netPnL.toFixed(0)})</span>
            <span style={{ color: 'var(--text-muted)' }}>Capital: ${accountBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Win Rate</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)' }}>
              <Target size={16} />
            </div>
          </div>
          <div className="kpi-val">
            {winRate}%
          </div>
          <div className="kpi-sub">
            {wins.length} Wins · {losses.length} Losses · {bes.length} BE
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Profit Factor</span>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Award size={16} />
            </div>
          </div>
          <div className="kpi-val">
            {profitFactor}
          </div>
          <div className="kpi-sub">
            Gross: +${totalGrossProfit.toFixed(0)} / -${totalGrossLoss.toFixed(0)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Expectancy / Trade</span>
            <div className="kpi-icon" style={{ background: expectancy >= 0 ? 'var(--color-win-bg)' : 'var(--color-loss-bg)', color: expectancy >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
              <Percent size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: expectancy >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
            {expectancy >= 0 ? '+' : ''}${expectancy.toFixed(2)}
          </div>
          <div className="kpi-sub">
            Avg Win: ${avgWin.toFixed(0)} | Avg Loss: ${avgLoss.toFixed(0)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Max Drawdown</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-loss)' }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: 'var(--color-loss)' }}>
            -${maxDrawdown.toFixed(2)}
          </div>
          <div className="kpi-sub">
            {((maxDrawdown / accountBalance) * 100).toFixed(1)}% of starting capital
          </div>
        </div>
      </div>

      {/* Outcome Bar */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="chart-title">
            <BarChart3 size={18} color="var(--accent-primary)" />
            <span>Outcome Distribution</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-win)' }}>● Wins: {winRate}%</span>
            <span style={{ color: 'var(--color-loss)' }}>● Losses: {lossRate}%</span>
            <span style={{ color: 'var(--color-be)' }}>● Break-Even: {beRate}%</span>
          </div>
        </div>
        <div style={{ width: '100%', height: '14px', borderRadius: '7px', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${winRate}%`, background: 'var(--color-win)', transition: 'width 0.5s' }} title={`Wins: ${winRate}%`} />
          <div style={{ width: `${beRate}%`, background: 'var(--color-be)', transition: 'width 0.5s' }} title={`BE: ${beRate}%`} />
          <div style={{ width: `${lossRate}%`, background: 'var(--color-loss)', transition: 'width 0.5s' }} title={`Losses: ${lossRate}%`} />
        </div>
      </div>

      {/* Cumulative Equity Curve */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="chart-title">
              <TrendingUp size={18} color="var(--accent-primary)" />
              <span>Cumulative Equity Growth</span>
            </div>

            {numPts > 1 && (
              <span className="badge" style={{ 
                background: isTrendBullish ? activeGraphTheme.trendBadgeBg : 'rgba(239, 68, 68, 0.15)', 
                color: isTrendBullish ? activeGraphTheme.trendBadgeColor : '#f87171', 
                border: isTrendBullish ? `1px solid ${activeGraphTheme.trendBadgeBorder}` : '1px solid rgba(239, 68, 68, 0.35)', 
                fontSize: '0.72rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                padding: '3px 8px'
              }}>
                {isTrendBullish ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                Trend: {isTrendBullish ? '↗ Bullish' : '↘ Bearish'} ({isTrendBullish ? '+' : ''}${trendSlope.toFixed(2)}/trade)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            {/* Palette Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '2px 5px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', paddingRight: '2px' }}>Colors:</span>
              {GRAPH_COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setGraphThemeId(theme.id)}
                  title={`${theme.name} Palette`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    background: graphThemeId === theme.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: graphThemeId === theme.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                    borderRadius: '5px',
                    padding: '2px 5px',
                    cursor: 'pointer',
                    fontSize: '0.66rem',
                    fontWeight: graphThemeId === theme.id ? 700 : 500,
                    color: graphThemeId === theme.id ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: theme.swatch,
                    display: 'inline-block',
                    boxShadow: graphThemeId === theme.id ? `0 0 6px ${theme.trend[1]}` : 'none'
                  }} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '3px', borderRadius: '2px', background: `linear-gradient(90deg, ${activeGraphTheme.stops[0]}, ${activeGraphTheme.stops[1]}, ${activeGraphTheme.stops[2]})` }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Curve</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '0px', borderTop: `2.5px dashed ${activeGraphTheme.trend[1]}` }}></span>
              <span style={{ color: activeGraphTheme.trend[1], fontWeight: 600 }}>Trend (Animatic)</span>
            </div>

            {hoveredPoint && (
              <div style={{ background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-card)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                Trade #{hoveredPoint.tradeNum} ({hoveredPoint.pair}):{' '}
                <strong style={{ color: hoveredPoint.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                  {hoveredPoint.pnl >= 0 ? '+' : ''}${hoveredPoint.pnl}
                </strong>{' '}
                | Total: <strong>${hoveredPoint.cumulative}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', marginTop: '0.5rem' }}>
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            style={{ width: '100%', height: 'auto', minWidth: '550px' }}
          >
            <defs>
              <linearGradient id="analyticsEquityStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={activeGraphTheme.stops[0]} />
                <stop offset="50%" stopColor={activeGraphTheme.stops[1]} />
                <stop offset="100%" stopColor={netPnL >= 0 ? activeGraphTheme.stops[2] : '#f43f5e'} />
              </linearGradient>

              <linearGradient id="analyticsEquityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={activeGraphTheme.stops[0]} stopOpacity="0.38" />
                <stop offset="50%" stopColor={activeGraphTheme.stops[1]} stopOpacity="0.15" />
                <stop offset="100%" stopColor={activeGraphTheme.stops[2]} stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="analyticsTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={activeGraphTheme.trend[0]} />
                <stop offset="100%" stopColor={activeGraphTheme.trend[1]} />
              </linearGradient>

              <filter id="analyticsTrendGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <line 
              x1={padding.left} 
              y1={zeroY} 
              x2={chartWidth - padding.right} 
              y2={zeroY} 
              stroke="rgba(255, 255, 255, 0.12)" 
              strokeDasharray="3 3"
            />
            <text 
              x={padding.left - 8} 
              y={zeroY + 4} 
              fill="var(--text-muted)" 
              fontSize="10" 
              fontFamily="var(--font-mono)" 
              textAnchor="end"
            >
              $0
            </text>

            <text 
              x={padding.left - 8} 
              y={padding.top + 4} 
              fill="var(--text-muted)" 
              fontSize="10" 
              fontFamily="var(--font-mono)" 
              textAnchor="end"
            >
              +${maxCum.toFixed(0)}
            </text>
            {minCum < 0 && (
              <text 
                x={padding.left - 8} 
                y={chartHeight - padding.bottom + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                fontFamily="var(--font-mono)" 
                textAnchor="end"
              >
                ${minCum.toFixed(0)}
              </text>
            )}

            {peak > 0 && (
              <g>
                <line x1={padding.left} y1={getY(peak)} x2={chartWidth - padding.right} y2={getY(peak)} stroke="rgba(16, 185, 129, 0.25)" strokeDasharray="2 2" />
                <text x={chartWidth - padding.right} y={getY(peak) - 4} textAnchor="end" fill="var(--color-win)" fontSize="9">Peak: +${peak.toFixed(0)}</text>
              </g>
            )}

            {/* Area under curve */}
            {equityPoints.length > 1 && (
              <path d={areaD} fill="url(#analyticsEquityGrad)" />
            )}

            {/* ANIMATIC TREND LINE (Best-Fit Trajectory) */}
            {numPts > 1 && (
              <g filter="url(#analyticsTrendGlow)">
                {/* Glowing under-beam */}
                <line 
                  x1={trendX1} 
                  y1={trendY1} 
                  x2={trendX2} 
                  y2={trendY2} 
                  stroke={activeGraphTheme.trendGlow} 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                />
                {/* Flowing animated dashed trend line */}
                <line 
                  x1={trendX1} 
                  y1={trendY1} 
                  x2={trendX2} 
                  y2={trendY2} 
                  stroke="url(#analyticsTrendGrad)" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 4" 
                  strokeLinecap="round"
                  className="anim-trend-flow" 
                />
                {/* Animatic Traveling Comet Particle along Trendline */}
                <circle r="4" fill={activeGraphTheme.trend[1]} filter="url(#analyticsTrendGlow)">
                  <animate attributeName="cx" from={trendX1} to={trendX2} dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="cy" from={trendY1} to={trendY2} dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.9;1;0.9;0" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle r="7" fill={activeGraphTheme.trend[0]} opacity="0.35" filter="url(#analyticsTrendGlow)">
                  <animate attributeName="cx" from={trendX1} to={trendX2} dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="cy" from={trendY1} to={trendY2} dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.4;0.5;0.3;0" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* Main Equity Curve with Distinct Multi-Color Gradient */}
            {equityPoints.length > 1 && (
              <path 
                d={pathD} 
                fill="none" 
                stroke="url(#analyticsEquityStrokeGrad)" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}

            {/* Animated Pulsing Beacon on Latest Trade */}
            {numPts > 1 && (
              <g>
                <circle
                  cx={getX(numPts - 1)}
                  cy={getY(equityPoints[numPts - 1].cumulative)}
                  r="5"
                  fill="none"
                  stroke={equityPoints[numPts - 1].pnl >= 0 ? activeGraphTheme.stops[2] : '#f43f5e'}
                  strokeWidth="2"
                  className="anim-radar-ping"
                >
                  <animate attributeName="r" values="5;14;20" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;0" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={getX(numPts - 1)}
                  cy={getY(equityPoints[numPts - 1].cumulative)}
                  r="4.5"
                  fill={equityPoints[numPts - 1].pnl >= 0 ? activeGraphTheme.stops[2] : '#f43f5e'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Points */}
            {equityPoints.map((pt, idx) => {
              if (idx === 0) return null;
              const cx = getX(idx);
              const cy = getY(pt.cumulative);
              const isPtWin = pt.pnl > 0;
              return (
                <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={hoveredPoint === pt ? 7 : 4} 
                    fill={isPtWin ? activeGraphTheme.stops[2] : '#f43f5e'} 
                    stroke="#ffffff" 
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Breakdowns: Setups, Pairs, & Sessions */}
      <div className="analytics-grid">
        {/* Setup Performance */}
        <div className="chart-card">
          <div className="chart-title">
            <Layers size={18} color="var(--accent-primary)" />
            <span>Setup / Strategy Performance</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {setupList.map(([setupName, data]) => {
              const setupWinRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
              const isProfit = data.pnl >= 0;
              return (
                <div key={setupName} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{setupName} ({data.count} trades)</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: isProfit ? 'var(--color-win)' : 'var(--color-loss)', fontWeight: 700 }}>
                      {isProfit ? '+' : ''}${data.pnl.toFixed(2)} ({setupWinRate}% Win)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${setupWinRate}%`, 
                        height: '100%', 
                        background: isProfit ? 'var(--color-win)' : 'var(--color-loss)' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Session & Pair Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="chart-card">
            <div className="chart-title">
              <Globe size={18} color="var(--accent-primary)" />
              <span>Performance by Session</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sessionList.map(([sessName, data]) => {
                const sessWinRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
                const isProfit = data.pnl >= 0;
                return (
                  <div key={sessName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{sessName} Session</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.count} trades · {sessWinRate}% win</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isProfit ? 'var(--color-win)' : 'var(--color-loss)' }}>
                      {isProfit ? '+' : ''}${data.pnl.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-title">
              <BarChart3 size={18} color="var(--accent-primary)" />
              <span>Asset Leaderboard</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pairList.map(([pairName, data]) => {
                const pairWinRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
                const isProfit = data.pnl >= 0;
                return (
                  <div key={pairName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>{pairName}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.count} trades · {pairWinRate}% win</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isProfit ? 'var(--color-win)' : 'var(--color-loss)' }}>
                      {isProfit ? '+' : ''}${data.pnl.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

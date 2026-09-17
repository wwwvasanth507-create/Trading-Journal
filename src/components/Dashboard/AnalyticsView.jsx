import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  Percent, 
  DollarSign, 
  ShieldAlert, 
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsView({ trades, accountBalance }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

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
  const winLossRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : '—';

  // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
  const expectancy = totalClosed > 0 
    ? ((wins.length / totalClosed) * avgWin) - ((losses.length / totalClosed) * avgLoss)
    : 0;

  // Compute Cumulative Equity Points for Chart
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

  // SVG Chart Dimensions
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

  // Generate SVG Path
  const zeroY = getY(0);
  const pathD = equityPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.cumulative)}`).join(' ');
  const areaD = `${pathD} L ${getX(equityPoints.length - 1)} ${zeroY} L ${getX(0)} ${zeroY} Z`;

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Net P&L */}
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

        {/* Win Rate */}
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

        {/* Profit Factor */}
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

        {/* Trade Expectancy */}
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

        {/* Max Drawdown */}
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
            {((maxDrawdown / accountBalance) * 100).toFixed(1)}% of account capital
          </div>
        </div>
      </div>

      {/* Visual Win / Loss Distribution Bar */}
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

      {/* Cumulative Equity Curve Chart */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="chart-title">
            <TrendingUp size={18} color="var(--accent-primary)" />
            <span>Cumulative Equity Curve (Realized Account Growth)</span>
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

        {/* SVG Equity Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            style={{ width: '100%', height: 'auto', minWidth: '550px' }}
          >
            <defs>
              <linearGradient id="equityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Zero Line */}
            <line 
              x1={padding.left} 
              y1={zeroY} 
              x2={chartWidth - padding.right} 
              y2={zeroY} 
              stroke="var(--border-card)" 
              strokeDasharray="4"
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

            {/* Top / Bottom Reference lines */}
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

            {/* Shaded Area */}
            {equityPoints.length > 1 && (
              <path d={areaD} fill="url(#equityGrad)" />
            )}

            {/* Main Equity Line */}
            {equityPoints.length > 1 && (
              <path 
                d={pathD} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}

            {/* Data Points */}
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
                    fill={isPtWin ? 'var(--color-win)' : 'var(--color-loss)'} 
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

      {/* Breakdowns: Setups & Pairs */}
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

        {/* Pair Performance */}
        <div className="chart-card">
          <div className="chart-title">
            <BarChart3 size={18} color="var(--accent-primary)" />
            <span>Asset / Pair Leaderboard</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pairList.map(([pairName, data]) => {
              const pairWinRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
              const isProfit = data.pnl >= 0;
              return (
                <div key={pairName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
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
  );
}

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Target, 
  PlusCircle, 
  Calculator, 
  Table, 
  LineChart, 
  BrainCircuit, 
  ChevronRight, 
  ExternalLink,
  Edit3,
  Image as ImageIcon,
  Flame,
  Scale,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import { calculateMilestoneProgress } from '../../utils/calculations';

export default function DashboardOverview({
  trades = [],
  accountBalance = 10000,
  milestoneTarget = 500,
  setMilestoneTarget,
  onAddTrade,
  onEditTrade,
  onOpenCalculator,
  onNavigateTab,
  onViewImage
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState((milestoneTarget || 500).toString());

  // Closed & Open Trades
  const closedTrades = trades
    .filter(t => t.result !== 'OPEN')
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

  const openTrades = trades.filter(t => t.result === 'OPEN');
  const totalClosed = closedTrades.length;

  const wins = closedTrades.filter(t => t.result === 'WIN');
  const losses = closedTrades.filter(t => t.result === 'LOSS');
  const bes = closedTrades.filter(t => t.result === 'BE');

  const winRate = totalClosed > 0 ? Math.round((wins.length / totalClosed) * 100) : 0;
  const lossRate = totalClosed > 0 ? Math.round((losses.length / totalClosed) * 100) : 0;
  const beRate = totalClosed > 0 ? (100 - winRate - lossRate) : 0;

  const totalGrossProfit = wins.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const totalGrossLoss = Math.abs(losses.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0));
  const netPnL = totalGrossProfit - totalGrossLoss;
  const profitFactor = totalGrossLoss > 0 
    ? (totalGrossProfit / totalGrossLoss).toFixed(2) 
    : (totalGrossProfit > 0 ? '∞' : '0.00');

  const avgWin = wins.length > 0 ? totalGrossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalGrossLoss / losses.length : 0;
  const avgRR = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : (avgWin > 0 ? '∞' : '0.00');

  const expectancy = totalClosed > 0 
    ? ((wins.length / totalClosed) * avgWin) - ((losses.length / totalClosed) * avgLoss)
    : 0;

  // Directional Stats
  const buyTrades = closedTrades.filter(t => t.direction === 'BUY');
  const buyWins = buyTrades.filter(t => t.result === 'WIN').length;
  const buyWinRate = buyTrades.length > 0 ? Math.round((buyWins / buyTrades.length) * 100) : 0;
  const buyPnL = buyTrades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);

  const sellTrades = closedTrades.filter(t => t.direction === 'SELL');
  const sellWins = sellTrades.filter(t => t.result === 'WIN').length;
  const sellWinRate = sellTrades.length > 0 ? Math.round((sellWins / sellTrades.length) * 100) : 0;
  const sellPnL = sellTrades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);

  // Psychology & Discipline
  const rulesFollowed = closedTrades.filter(t => t.ruleFollowed === true || t.ruleFollowed === 'YES' || t.ruleFollowed === 'true');
  const rulesViolated = closedTrades.filter(t => t.ruleFollowed === false || t.ruleFollowed === 'NO' || t.ruleFollowed === 'false');
  const disciplineScore = totalClosed > 0 
    ? Math.round((rulesFollowed.length / totalClosed) * 100) 
    : 100;

  const followedPnL = rulesFollowed.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const violatedPnL = rulesViolated.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);

  // Emotions map
  const emotionsMap = {};
  closedTrades.forEach(t => {
    const em = t.emotion || 'Disciplined';
    if (!emotionsMap[em]) emotionsMap[em] = { count: 0, pnl: 0 };
    emotionsMap[em].count += 1;
    emotionsMap[em].pnl += (parseFloat(t.pnl) || 0);
  });
  const topEmotions = Object.entries(emotionsMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  // Mistakes map
  const mistakesMap = {};
  closedTrades.forEach(t => {
    const m = t.mistake || 'None';
    if (m !== 'None') {
      if (!mistakesMap[m]) mistakesMap[m] = { count: 0, pnl: 0 };
      mistakesMap[m].count += 1;
      mistakesMap[m].pnl += (parseFloat(t.pnl) || 0);
    }
  });
  const topMistakes = Object.entries(mistakesMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  // Milestone Progress
  const milestone = parseFloat(milestoneTarget) || 500;
  const milestoneProgress = calculateMilestoneProgress(netPnL, milestone);

  const handleSaveTarget = () => {
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0 && setMilestoneTarget) {
      setMilestoneTarget(val);
    }
    setIsEditingTarget(false);
  };

  // Equity Curve Points
  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;

  const equityPoints = [
    { tradeNum: 0, pnl: 0, cumulative: 0, date: 'Start', pair: 'Baseline' }
  ];

  closedTrades.forEach(t => {
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

  const chartWidth = 640;
  const chartHeight = 210;
  const padding = { top: 20, right: 25, bottom: 30, left: 55 };

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

  // Performance by Setup
  const setupStats = {};
  closedTrades.forEach(t => {
    const s = t.setup || 'Other';
    if (!setupStats[s]) setupStats[s] = { count: 0, pnl: 0, wins: 0 };
    setupStats[s].count += 1;
    setupStats[s].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'WIN') setupStats[s].wins += 1;
  });
  const setupList = Object.entries(setupStats)
    .sort((a, b) => b[1].pnl - a[1].pnl)
    .slice(0, 5);

  // Performance by Pair
  const pairStats = {};
  closedTrades.forEach(t => {
    const p = t.pair || 'Other';
    if (!pairStats[p]) pairStats[p] = { count: 0, pnl: 0, wins: 0 };
    pairStats[p].count += 1;
    pairStats[p].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'WIN') pairStats[p].wins += 1;
  });
  const pairList = Object.entries(pairStats)
    .sort((a, b) => b[1].pnl - a[1].pnl)
    .slice(0, 5);

  // Performance by Session
  const sessionStats = {};
  closedTrades.forEach(t => {
    const ses = t.session || 'London';
    if (!sessionStats[ses]) sessionStats[ses] = { count: 0, pnl: 0, wins: 0 };
    sessionStats[ses].count += 1;
    sessionStats[ses].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'WIN') sessionStats[ses].wins += 1;
  });
  const sessionList = Object.entries(sessionStats).sort((a, b) => b[1].pnl - a[1].pnl);

  // Current Month Calendar Snapshot
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const tradesByDate = {};
  trades.forEach(t => {
    if (!t.date) return;
    if (!tradesByDate[t.date]) tradesByDate[t.date] = [];
    tradesByDate[t.date].push(t);
  });

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const miniCalendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    miniCalendarCells.push({ dayNum: null, dateStr: null, trades: [] });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${mm}-${dd}`;
    const dayTrades = tradesByDate[dateStr] || [];
    miniCalendarCells.push({ dayNum: d, dateStr, trades: dayTrades });
  }

  let currentMonthPnL = 0;
  let currentMonthGreenDays = 0;
  let currentMonthRedDays = 0;
  miniCalendarCells.forEach(cell => {
    if (cell.trades.length > 0) {
      const dPnL = cell.trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
      currentMonthPnL += dPnL;
      if (dPnL > 0) currentMonthGreenDays += 1;
      else if (dPnL < 0) currentMonthRedDays += 1;
    }
  });

  // Recent 6 Trades
  const recentTrades = [...trades]
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`))
    .slice(0, 6);

  return (
    <div className="dashboard-overview-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. EXECUTIVE WELCOME & QUICK ACTIONS HEADER */}
      <div className="chart-card dashboard-hero-card" style={{ 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(20, 29, 52, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ 
                background: 'var(--accent-glow)', 
                color: 'var(--accent-primary)', 
                padding: '6px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <LayoutDashboard size={20} />
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                Trading Performance Dashboard
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Consolidated real-time analytics, equity curve, strategy edge, and calendar overview.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.65rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Account Capital: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>${parseFloat(accountBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-muted)' }}>
                Active Positions: <strong style={{ color: openTrades.length > 0 ? '#60a5fa' : 'var(--text-primary)' }}>{openTrades.length} open</strong>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-muted)' }}>
                Record: <strong style={{ color: 'var(--color-win)' }}>{winRate}% Win</strong> (<span style={{ color: 'var(--color-loss)' }}>{lossRate}% L</span>, <span style={{ color: 'var(--color-be)' }}>{beRate}% BE</span>)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onAddTrade}>
              <PlusCircle size={16} />
              <span>Log New Trade</span>
            </button>
            <button className="btn btn-secondary" onClick={onOpenCalculator}>
              <Calculator size={16} />
              <span>Risk Calculator</span>
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigateTab('sheet')}>
              <Table size={16} />
              <span>Journal Sheet</span>
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigateTab('calendar')}>
              <CalendarIcon size={16} />
              <span>Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE PERFORMANCE KPIS (6 CARDS) */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        
        {/* KPI 1: Net Realized P&L */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Net Realized P&L</span>
            <div className="kpi-icon" style={{ 
              background: netPnL >= 0 ? 'var(--color-win-bg)' : 'var(--color-loss-bg)', 
              color: netPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' 
            }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: netPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
            {netPnL >= 0 ? '+' : ''}${netPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-sub" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>+${totalGrossProfit.toFixed(0)}</span>
            <span style={{ color: 'var(--color-loss)' }}>-${totalGrossLoss.toFixed(0)}</span>
          </div>
        </div>

        {/* KPI 2: Win Rate % */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Win Rate</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)' }}>
              <Award size={16} />
            </div>
          </div>
          <div className="kpi-val">
            {winRate}%
          </div>
          <div className="kpi-sub">
            <span style={{ color: 'var(--color-win)' }}>{wins.length}W</span> / <span style={{ color: 'var(--color-loss)' }}>{losses.length}L</span> / <span style={{ color: 'var(--color-be)' }}>{bes.length}BE</span>
          </div>
        </div>

        {/* KPI 3: Profit Factor & Avg RR */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Profit Factor</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-win)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: parseFloat(profitFactor) >= 1.5 ? 'var(--color-win)' : 'var(--text-primary)' }}>
            {profitFactor}
          </div>
          <div className="kpi-sub">
            Avg R:R: <strong style={{ color: 'var(--text-primary)' }}>{avgRR}:1</strong>
          </div>
        </div>

        {/* KPI 4: Expectancy / Return */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Trade Expectancy</span>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Zap size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: expectancy >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
            {expectancy >= 0 ? '+' : ''}${expectancy.toFixed(2)}
          </div>
          <div className="kpi-sub">
            Avg profit per executed trade
          </div>
        </div>

        {/* KPI 5: Long vs Short Directional Ratio */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Long vs Short Edge</span>
            <div className="kpi-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <Scale size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ fontSize: '1.35rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-win)' }}>{buyWinRate}% L</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>|</span>
            <span style={{ color: 'var(--accent-primary)' }}>{sellWinRate}% S</span>
          </div>
          <div className="kpi-sub">
            BUY: ${buyPnL.toFixed(0)} • SELL: ${sellPnL.toFixed(0)}
          </div>
        </div>

        {/* KPI 6: Discipline Rating */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Discipline Rating</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-win)' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: disciplineScore >= 80 ? 'var(--color-win)' : disciplineScore >= 60 ? 'var(--accent-primary)' : 'var(--color-loss)' }}>
            {disciplineScore}%
          </div>
          <div className="kpi-sub">
            {rulesFollowed.length} followed • {rulesViolated.length} violated
          </div>
        </div>

      </div>

      {/* 3. MILESTONE PROGRESS TRACKER */}
      <div className="chart-card" style={{ 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(20, 29, 52, 0.85) 100%)',
        border: milestoneProgress.isAchieved ? '1px solid var(--color-win-border)' : '1px solid var(--border-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Profit Milestone Goal</span>
                {milestoneProgress.isAchieved && (
                  <span className="badge badge-win" style={{ fontSize: '0.7rem' }}>
                    <Sparkles size={11} style={{ marginRight: '3px' }} /> TARGET ACHIEVED!
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target is strictly Net P&L profit goal (Starting capital is never added)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Goal</div>
              {isEditingTarget ? (
                <input 
                  type="number" 
                  className="cell-input-inline" 
                  style={{ width: '100px', fontSize: '1rem', color: '#f59e0b', borderBottom: '1px solid #f59e0b' }} 
                  value={targetInput} 
                  onChange={e => setTargetInput(e.target.value)} 
                  onBlur={handleSaveTarget} 
                  onKeyDown={e => e.key === 'Enter' && handleSaveTarget()} 
                  autoFocus 
                />
              ) : (
                <span 
                  className="editable" 
                  onClick={() => { setTargetInput(milestone.toString()); setIsEditingTarget(true); }}
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: '#f59e0b', cursor: 'pointer' }}
                  title="Click to change milestone target goal"
                >
                  ${milestone.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Realized</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: netPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                {netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: milestoneProgress.remaining > 0 ? 'var(--text-secondary)' : 'var(--color-win)' }}>
                ${milestoneProgress.remaining.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '0.85rem' }}>
          <div style={{ 
            height: '10px', 
            background: 'var(--bg-input)', 
            borderRadius: '5px', 
            overflow: 'hidden', 
            position: 'relative' 
          }}>
            <div style={{ 
              height: '100%', 
              width: `${milestoneProgress.progressPercent}%`, 
              background: milestoneProgress.isAchieved 
                ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' 
                : 'linear-gradient(90deg, var(--accent-primary) 0%, #60a5fa 100%)',
              borderRadius: '5px',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>0%</span>
            <span>{milestoneProgress.progressPercent}% Completed</span>
            <span>100% Target</span>
          </div>
        </div>
      </div>

      {/* 4. TWO-COLUMN ANALYTICS HUB */}
      <div className="analytics-grid">
        
        {/* LEFT COLUMN: Equity Curve & Setup Edge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Equity Curve SVG Chart */}
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="chart-title">
                <LineChart size={18} color="var(--accent-primary)" />
                <span>Cumulative Equity Growth</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={() => onNavigateTab('analytics')}>
                <span>Detailed Analytics</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', minWidth: '480px' }}>
                <defs>
                  <linearGradient id="dashEquityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Zero line */}
                <line x1={padding.left} y1={zeroY} x2={chartWidth - padding.right} y2={zeroY} stroke="rgba(255, 255, 255, 0.12)" strokeDasharray="3 3" />
                <text x={padding.left - 8} y={zeroY + 4} textAnchor="end" fill="var(--text-muted)" fontSize="10">$0</text>

                {/* Peak line */}
                {peak > 0 && (
                  <g>
                    <line x1={padding.left} y1={getY(peak)} x2={chartWidth - padding.right} y2={getY(peak)} stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="2 2" />
                    <text x={chartWidth - padding.right} y={getY(peak) - 4} textAnchor="end" fill="var(--color-win)" fontSize="9">Peak: +${peak.toFixed(0)}</text>
                  </g>
                )}

                {/* Area under curve */}
                {equityPoints.length > 1 && (
                  <path d={areaD} fill="url(#dashEquityGrad)" />
                )}

                {/* Line curve */}
                {equityPoints.length > 1 && (
                  <path d={pathD} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* Points */}
                {equityPoints.map((pt, idx) => {
                  if (idx === 0) return null;
                  const cx = getX(idx);
                  const cy = getY(pt.cumulative);
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r={hoveredPoint === idx ? 6 : 3.5}
                      fill={pt.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)'}
                      stroke="#fff"
                      strokeWidth="1.5"
                      style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPoint !== null && equityPoints[hoveredPoint] && (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.8rem',
                  fontSize: '0.78rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                }}>
                  <div><strong>Trade #{equityPoints[hoveredPoint].tradeNum}</strong> ({equityPoints[hoveredPoint].pair})</div>
                  <div style={{ color: equityPoints[hoveredPoint].pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)', fontWeight: 700 }}>
                    P&L: {equityPoints[hoveredPoint].pnl >= 0 ? '+' : ''}${equityPoints[hoveredPoint].pnl.toFixed(2)}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Balance: +${equityPoints[hoveredPoint].cumulative.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
              <div>Peak Capital: <strong style={{ color: 'var(--color-win)' }}>+${peak.toFixed(2)}</strong></div>
              <div>Max Drawdown: <strong style={{ color: 'var(--color-loss)' }}>-${maxDrawdown.toFixed(2)}</strong></div>
              <div>Closed Trades: <strong>{totalClosed}</strong></div>
            </div>
          </div>

          {/* Strategy / Setup Edge Performance */}
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="chart-title">
                <Flame size={18} color="var(--accent-primary)" />
                <span>Strategy & Setup Win Rates</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ranked by Profit</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {setupList.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No trades recorded yet.</div>
              ) : (
                setupList.map(([setupName, data], index) => {
                  const sWinRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
                  return (
                    <div key={setupName} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>#{index + 1}</span>
                          <strong>{setupName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({data.count} trades)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.8rem', color: sWinRate >= 60 ? 'var(--color-win)' : 'var(--text-secondary)' }}>{sWinRate}% Win</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: data.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                            {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div style={{ height: '6px', width: '100%', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${sWinRate}%`, 
                          background: sWinRate >= 60 ? 'var(--color-win)' : sWinRate >= 45 ? 'var(--accent-primary)' : 'var(--color-loss)',
                          borderRadius: '3px' 
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Mini Calendar Snapshot & Psychology Audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Current Month Calendar Widget */}
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="chart-title">
                <CalendarIcon size={18} color="var(--accent-primary)" />
                <span>{monthNames[currentMonth]} {currentYear}</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={() => onNavigateTab('calendar')}>
                <span>Full Calendar</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Month P&L: </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: currentMonthPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                  {currentMonthPnL >= 0 ? '+' : ''}${currentMonthPnL.toFixed(2)}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-win)' }}>{currentMonthGreenDays} Green</span> / <span style={{ color: 'var(--color-loss)' }}>{currentMonthRedDays} Red</span>
              </div>
            </div>

            {/* Mini Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '0.5rem' }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', padding: '2px 0' }}>{d}</div>
              ))}
              {miniCalendarCells.map((cell, idx) => {
                if (!cell.dayNum) {
                  return <div key={`empty-${idx}`} style={{ height: '24px' }} />;
                }
                const hasTrades = cell.trades.length > 0;
                const dPnL = hasTrades ? cell.trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0) : 0;
                const isWin = dPnL > 0;
                const isLoss = dPnL < 0;

                return (
                  <div
                    key={cell.dateStr}
                    style={{
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: hasTrades ? 700 : 400,
                      borderRadius: '4px',
                      cursor: hasTrades ? 'pointer' : 'default',
                      background: hasTrades 
                        ? (isWin ? 'rgba(16, 185, 129, 0.3)' : isLoss ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)')
                        : 'rgba(255, 255, 255, 0.03)',
                      color: hasTrades ? (isWin ? 'var(--color-win)' : isLoss ? 'var(--color-loss)' : '#f59e0b') : 'var(--text-secondary)',
                      border: hasTrades ? (isWin ? '1px solid var(--color-win-border)' : '1px solid var(--color-loss-border)') : '1px solid transparent'
                    }}
                    title={hasTrades ? `${cell.dateStr}: ${cell.trades.length} trades (${dPnL >= 0 ? '+' : ''}$${dPnL.toFixed(2)})` : cell.dateStr}
                    onClick={() => onNavigateTab('calendar')}
                  >
                    {cell.dayNum}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Psychology & Rules Summary */}
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="chart-title">
                <BrainCircuit size={18} color="var(--accent-primary)" />
                <span>Trading Psychology & Discipline</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={() => onNavigateTab('psychology')}>
                <span>Audit</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rules Followed</div>
                  <strong style={{ color: 'var(--color-win)' }}>+${followedPnL.toFixed(2)}</strong>
                </div>
                <div className="account-divider" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rules Violated</div>
                  <strong style={{ color: 'var(--color-loss)' }}>{violatedPnL <= 0 ? '' : '+'}${violatedPnL.toFixed(2)}</strong>
                </div>
              </div>

              {/* Dominant Emotions */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>TOP EMOTIONS LOGGED:</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {topEmotions.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>None logged yet.</span>
                  ) : (
                    topEmotions.map(([em, val]) => (
                      <span key={em} className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', fontSize: '0.75rem' }}>
                        {em} ({val.count})
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Common Mistakes */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>TOP COSTLY MISTAKES:</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {topMistakes.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-win)' }}>Zero discipline leaks! Clean execution.</span>
                  ) : (
                    topMistakes.map(([m, val]) => (
                      <span key={m} className="badge badge-loss" style={{ fontSize: '0.75rem' }}>
                        {m} ({val.count})
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 5. PAIRS & SESSIONS BREAKDOWN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Most Profitable Pairs */}
        <div className="chart-card">
          <div className="chart-title">
            <DollarSign size={18} color="var(--accent-primary)" />
            <span>Top Instruments & Currency Pairs</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pairList.map(([pair, d]) => {
              const pWinRate = d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0;
              return (
                <div key={pair} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{pair}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({d.count} trades)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: pWinRate >= 60 ? 'var(--color-win)' : 'var(--text-secondary)' }}>{pWinRate}% Win</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: d.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                      {d.pnl >= 0 ? '+' : ''}${d.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions Edge */}
        <div className="chart-card">
          <div className="chart-title">
            <Clock size={18} color="var(--accent-primary)" />
            <span>Trading Session Analysis</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessionList.map(([session, d]) => {
              const sWinRate = d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0;
              return (
                <div key={session} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{session}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({d.count} trades)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: sWinRate >= 60 ? 'var(--color-win)' : 'var(--text-secondary)' }}>{sWinRate}% Win</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: d.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                      {d.pnl >= 0 ? '+' : ''}${d.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. RECENT TRADES FEED */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="chart-title">
            <Table size={18} color="var(--accent-primary)" />
            <span>Recent Trades Activity</span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => onNavigateTab('sheet')}>
            <span>Open Complete Journal Sheet ({trades.length} trades)</span>
            <ExternalLink size={13} style={{ marginLeft: '4px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recentTrades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              No trades logged yet. Click "Log New Trade" to get started!
            </div>
          ) : (
            recentTrades.map(t => (
              <div 
                key={t.id}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem 1rem', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    #{t.tradeNum}
                  </span>
                  <span className={`badge ${t.direction === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                    {t.direction}
                  </span>
                  <strong style={{ fontSize: '0.95rem' }}>{t.pair}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.date}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• {t.setup || 'Setup'}</span>
                  {t.imageUrl && (
                    <button 
                      className="btn-icon" 
                      style={{ padding: '2px', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                      title="View trade chart screenshot"
                      onClick={() => onViewImage(t.imageUrl, `${t.pair} ${t.direction} (#${t.tradeNum})`)}
                    >
                      <ImageIcon size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge ${t.result === 'WIN' ? 'badge-win' : t.result === 'LOSS' ? 'badge-loss' : t.result === 'BE' ? 'badge-be' : ''}`} style={t.result === 'OPEN' ? { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' } : undefined}>
                    {t.result}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: '80px', textAlign: 'right', color: (t.pnl || 0) >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                    {t.result === 'OPEN' ? 'OPEN' : `${(t.pnl || 0) >= 0 ? '+' : ''}$${parseFloat(t.pnl || 0).toFixed(2)}`}
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }} onClick={() => onEditTrade(t)}>
                    <Edit3 size={13} style={{ marginRight: '3px' }} />
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

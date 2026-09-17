import React from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Smile, 
  Frown, 
  Flame, 
  Scale 
} from 'lucide-react';

export default function PsychologyAuditView({ trades }) {
  const closedTrades = trades.filter(t => t.result !== 'OPEN');

  // Rule Compliance Breakdown
  const rulesFollowed = closedTrades.filter(t => t.ruleFollowed === 'Yes');
  const rulesViolated = closedTrades.filter(t => t.ruleFollowed === 'No');
  const rulesPartial = closedTrades.filter(t => t.ruleFollowed === 'Partial');

  const followedWins = rulesFollowed.filter(t => t.result === 'WIN').length;
  const followedWinRate = rulesFollowed.length > 0 ? Math.round((followedWins / rulesFollowed.length) * 100) : 0;
  const followedPnL = rulesFollowed.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);

  const violatedWins = rulesViolated.filter(t => t.result === 'WIN').length;
  const violatedWinRate = rulesViolated.length > 0 ? Math.round((violatedWins / rulesViolated.length) * 100) : 0;
  const violatedPnL = rulesViolated.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);

  // Mistakes Cost Analysis
  const mistakesMap = {};
  closedTrades.forEach(t => {
    const m = t.mistake || 'None';
    if (!mistakesMap[m]) mistakesMap[m] = { count: 0, pnl: 0, losses: 0 };
    mistakesMap[m].count += 1;
    mistakesMap[m].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'LOSS') mistakesMap[m].losses += 1;
  });

  const mistakesList = Object.entries(mistakesMap).sort((a, b) => a[1].pnl - b[1].pnl); // Most negative P&L first

  // Emotions Analysis
  const emotionsMap = {};
  closedTrades.forEach(t => {
    const em = t.emotion || 'Disciplined';
    if (!emotionsMap[em]) emotionsMap[em] = { count: 0, pnl: 0, wins: 0 };
    emotionsMap[em].count += 1;
    emotionsMap[em].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'WIN') emotionsMap[em].wins += 1;
  });

  const emotionsList = Object.entries(emotionsMap).sort((a, b) => b[1].pnl - a[1].pnl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Rule Compliance Comparison Card */}
      <div className="chart-card" style={{ background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
        <div className="chart-title">
          <Scale size={20} color="var(--accent-primary)" />
          <span>The True Cost of Rule Adherence (Discipline Audit)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
          {/* Rules Followed */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--color-win-border)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-win)', fontWeight: 700 }}>
              <CheckCircle2 size={18} />
              <span>RULES FOLLOWED ({rulesFollowed.length} trades)</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: followedPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
              {followedPnL >= 0 ? '+' : ''}${followedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Win Rate: <strong style={{ color: '#fff' }}>{followedWinRate}%</strong> ({followedWins}/{rulesFollowed.length})
            </div>
          </div>

          {/* Rules Violated */}
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--color-loss-border)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-loss)', fontWeight: 700 }}>
              <XCircle size={18} />
              <span>RULES VIOLATED ({rulesViolated.length} trades)</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: violatedPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
              {violatedPnL >= 0 ? '+' : ''}${violatedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Win Rate: <strong style={{ color: '#fff' }}>{violatedWinRate}%</strong> ({violatedWins}/{rulesViolated.length})
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainCircuit size={16} color="var(--accent-primary)" />
          <span>
            {violatedPnL < 0 ? (
              <>Trader Psychology Insight: Violating your trading plan has directly cost you <strong style={{ color: 'var(--color-loss)' }}>${Math.abs(violatedPnL).toFixed(2)}</strong>. Simply eliminating rule breaks would increase your account equity by that amount!</>
            ) : (
              <>Trader Psychology Insight: Keep following your strategy edge without chasing or moving stops prematurely.</>
            )}
          </span>
        </div>
      </div>

      {/* Mistakes & Emotions Matrix */}
      <div className="analytics-grid">
        {/* Mistakes Leaderboard */}
        <div className="chart-card">
          <div className="chart-title">
            <Flame size={18} color="var(--color-loss)" />
            <span>Mistakes Cost Breakdown ($ Lost)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mistakesList.map(([mistakeName, data]) => {
              const isProfit = data.pnl >= 0;
              return (
                <div 
                  key={mistakeName}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.65rem 0.85rem', 
                    background: mistakeName === 'None' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                    borderRadius: '8px', 
                    border: '1px solid var(--border-subtle)' 
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{mistakeName}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Occurred {data.count} times ({data.losses} losses)
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isProfit ? 'var(--color-win)' : 'var(--color-loss)' }}>
                    {isProfit ? '+' : ''}${data.pnl.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emotions Breakdown */}
        <div className="chart-card">
          <div className="chart-title">
            <Smile size={18} color="#a78bfa" />
            <span>Emotional State vs Performance</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {emotionsList.map(([emotionName, data]) => {
              const winRate = data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0;
              const isProfit = data.pnl >= 0;
              return (
                <div 
                  key={emotionName}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.65rem 0.85rem', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-subtle)' 
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{emotionName}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {data.count} trades · {winRate}% Win Rate
                    </div>
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

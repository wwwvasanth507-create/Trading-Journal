import React from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  Smile, 
  Flame, 
  Scale,
  ShieldCheck
} from 'lucide-react';

export default function PsychologyAuditView({ trades }) {
  const closedTrades = trades.filter(t => t.result !== 'OPEN');

  const rulesFollowed = closedTrades.filter(t => t.ruleFollowed === 'Yes');
  const rulesViolated = closedTrades.filter(t => t.ruleFollowed === 'No');

  const followedWins = rulesFollowed.filter(t => t.result === 'WIN').length;
  const followedWinRate = rulesFollowed.length > 0 ? Math.round((followedWins / rulesFollowed.length) * 100) : 0;
  const followedPnL = rulesFollowed.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);

  const violatedWins = rulesViolated.filter(t => t.result === 'WIN').length;
  const violatedWinRate = rulesViolated.length > 0 ? Math.round((violatedWins / rulesViolated.length) * 100) : 0;
  const violatedPnL = rulesViolated.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);

  const disciplineScore = closedTrades.length > 0 
    ? Math.round((rulesFollowed.length / closedTrades.length) * 100)
    : 100;

  const mistakesMap = {};
  closedTrades.forEach(t => {
    const m = t.mistake || 'None';
    if (!mistakesMap[m]) mistakesMap[m] = { count: 0, pnl: 0, losses: 0 };
    mistakesMap[m].count += 1;
    mistakesMap[m].pnl += (parseFloat(t.pnl) || 0);
    if (t.result === 'LOSS') mistakesMap[m].losses += 1;
  });

  const mistakesList = Object.entries(mistakesMap).sort((a, b) => a[1].pnl - b[1].pnl);

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
      
      {/* Discipline Score Meter Bar */}
      <div className="chart-card" style={{ background: 'linear-gradient(135deg, rgba(13, 19, 34, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="chart-title">
            <ShieldCheck size={22} color="var(--accent-primary)" />
            <div>
              <span>Trader Discipline Rating</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                Percentage of completed trades where your trading plan was followed without violation
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              color: disciplineScore >= 80 ? 'var(--color-win)' : disciplineScore >= 60 ? 'var(--color-be)' : 'var(--color-loss)' 
            }}>
              {disciplineScore}%
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {rulesFollowed.length} of {closedTrades.length} Trades Followed
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden', marginTop: '0.5rem' }}>
          <div 
            style={{ 
              width: `${disciplineScore}%`, 
              height: '100%', 
              background: disciplineScore >= 80 ? 'linear-gradient(90deg, #3b82f6, #10b981)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
            }} 
          />
        </div>
      </div>

      {/* Rule Compliance Comparison Card */}
      <div className="chart-card">
        <div className="chart-title">
          <Scale size={20} color="var(--accent-primary)" />
          <span>The True Cost of Rule Adherence (Plan vs Violation)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
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

        <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BrainCircuit size={18} color="var(--accent-primary)" />
          <span>
            {violatedPnL < 0 ? (
              <>Psychological Audit Insight: Violating your trading plan has directly cost you <strong style={{ color: 'var(--color-loss)' }}>${Math.abs(violatedPnL).toFixed(2)}</strong>. Eliminating rule breaks would instantly add that profit to your account!</>
            ) : (
              <>Psychological Audit Insight: Stay disciplined and let your statistical edge play out over large sample sizes.</>
            )}
          </span>
        </div>
      </div>

      {/* Mistakes & Emotions Matrix */}
      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-title">
            <Flame size={18} color="var(--color-loss)" />
            <span>Execution Mistakes Cost Breakdown ($ Lost)</span>
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

        <div className="chart-card">
          <div className="chart-title">
            <Smile size={18} color="#a78bfa" />
            <span>Emotional Mindset vs Performance</span>
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

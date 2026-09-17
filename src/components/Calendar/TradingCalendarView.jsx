import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

export default function TradingCalendarView({ trades, onEditTrade }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group trades by date (YYYY-MM-DD)
  const tradesByDate = {};
  trades.forEach(t => {
    if (!t.date) return;
    if (!tradesByDate[t.date]) {
      tradesByDate[t.date] = [];
    }
    tradesByDate[t.date].push(t);
  });

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calendar cells
  const calendarCells = [];
  // Empty padding cells for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ dayNum: null, dateStr: null, trades: [] });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    const dayTrades = tradesByDate[dateStr] || [];
    calendarCells.push({ dayNum: d, dateStr, trades: dayTrades });
  }

  // Monthly stats
  let monthPnL = 0;
  let greenDays = 0;
  let redDays = 0;
  let monthTotalTrades = 0;

  calendarCells.forEach(cell => {
    if (cell.trades.length > 0) {
      monthTotalTrades += cell.trades.length;
      const dayPnL = cell.trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
      monthPnL += dayPnL;
      if (dayPnL > 0) greenDays += 1;
      else if (dayPnL < 0) redDays += 1;
    }
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayTrades(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayTrades(null);
  };

  const handleSelectDay = (cell) => {
    if (!cell.dateStr || cell.trades.length === 0) {
      setSelectedDayTrades(null);
      setSelectedDateStr('');
      return;
    }
    setSelectedDayTrades(cell.trades);
    setSelectedDateStr(cell.dateStr);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Calendar Header & Monthly Summary */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="chart-title">
              <CalendarIcon size={20} color="var(--accent-primary)" />
              <span>{monthNames[month]} {year}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="btn btn-secondary btn-icon" onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-secondary btn-icon" onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Monthly Badges */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="account-label">Month Net P&L</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem', color: monthPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                {monthPnL >= 0 ? '+' : ''}${monthPnL.toFixed(2)}
              </span>
            </div>
            <div className="account-divider"></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="account-label">Green Days vs Red Days</span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--color-win)' }}>{greenDays} Green</span> / <span style={{ color: 'var(--color-loss)' }}>{redDays} Red</span>
              </span>
            </div>
            <div className="account-divider"></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="account-label">Total Trades</span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{monthTotalTrades}</span>
            </div>
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className="calendar-grid" style={{ marginTop: '1rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="calendar-grid">
          {calendarCells.map((cell, idx) => {
            if (!cell.dayNum) {
              return <div key={`empty-${idx}`} className="calendar-day-cell inactive" />;
            }

            const dayTrades = cell.trades;
            const hasTrades = dayTrades.length > 0;
            const dayPnL = hasTrades ? dayTrades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0) : 0;
            const isProfit = dayPnL > 0;
            const isLoss = dayPnL < 0;

            const isSelected = selectedDateStr === cell.dateStr;

            return (
              <div 
                key={cell.dateStr}
                className={`calendar-day-cell ${isSelected ? 'selected' : ''}`}
                style={{ 
                  cursor: hasTrades ? 'pointer' : 'default',
                  border: isSelected ? '2px solid var(--accent-primary)' : hasTrades ? (isProfit ? '1px solid var(--color-win-border)' : '1px solid var(--color-loss-border)') : '1px solid var(--border-subtle)',
                  background: hasTrades ? (isProfit ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)') : 'var(--bg-surface)'
                }}
                onClick={() => handleSelectDay(cell)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="calendar-day-num">{cell.dayNum}</span>
                  {hasTrades && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {dayTrades.length} {dayTrades.length === 1 ? 'trade' : 'trades'}
                    </span>
                  )}
                </div>

                {hasTrades ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.82rem', 
                      fontWeight: 700, 
                      color: isProfit ? 'var(--color-win)' : isLoss ? 'var(--color-loss)' : 'var(--color-be)'
                    }}>
                      {dayPnL >= 0 ? '+' : ''}${dayPnL.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {dayTrades.filter(t => t.result === 'WIN').length}W / {dayTrades.filter(t => t.result === 'LOSS').length}L
                    </div>
                  </div>
                ) : (
                  <div style={{ minHeight: '28px' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Trade Drilldown */}
      {selectedDayTrades && (
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="chart-title">
              <CalendarIcon size={18} color="var(--accent-primary)" />
              <span>Trades on {selectedDateStr} ({selectedDayTrades.length} trades)</span>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => setSelectedDayTrades(null)}>
              Close Drilldown
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedDayTrades.map(t => (
              <div 
                key={t.id}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem 1rem', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-subtle)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${t.direction === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                    {t.direction}
                  </span>
                  <strong style={{ fontSize: '0.95rem' }}>{t.pair}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.time}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• {t.setup}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge ${t.result === 'WIN' ? 'badge-win' : t.result === 'LOSS' ? 'badge-loss' : 'badge-be'}`}>
                    {t.result}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: t.pnl >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                    {t.pnl >= 0 ? '+' : ''}${parseFloat(t.pnl || 0).toFixed(2)}
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => onEditTrade(t)}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

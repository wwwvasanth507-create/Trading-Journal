import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Copy, 
  Edit3, 
  ExternalLink, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { autoCalculateTrade } from '../../utils/calculations';
import { SETUP_OPTIONS, TIMEFRAME_OPTIONS, MISTAKE_OPTIONS, EMOTION_OPTIONS } from '../../utils/sampleData';

export default function TableGrid({ 
  trades, 
  setTrades, 
  accountBalance, 
  onEditTrade, 
  onViewImage 
}) {
  const [sortField, setSortField] = useState('tradeNum');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [editingCell, setEditingCell] = useState(null); // { id, field }

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (aVal === undefined || aVal === null) aVal = '';
    if (bVal === undefined || bVal === null) bVal = '';

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === 'asc' 
      ? String(aVal).localeCompare(String(bVal)) 
      : String(bVal).localeCompare(String(aVal));
  });

  // Inline cell update handler
  const handleCellChange = (tradeId, field, rawValue) => {
    setTrades(prev => prev.map(t => {
      if (t.id !== tradeId) return t;

      let value = rawValue;
      if (['entryPrice', 'stopLoss', 'takeProfit', 'riskPercent', 'lotSize', 'exitPrice', 'pnl'].includes(field)) {
        if (rawValue === '') {
          value = '';
        } else {
          const parsed = parseFloat(rawValue);
          value = isNaN(parsed) ? t[field] : parsed;
        }
      }

      // If user is directly typing a custom lot size, flag it so auto-calc doesn't overwrite it
      const isManualLot = field === 'lotSize';

      const updatedTrade = {
        ...t,
        [field]: value,
        autoCalcLot: isManualLot ? false : t.autoCalcLot
      };

      // Auto-recalculate metrics
      return autoCalculateTrade(updatedTrade, accountBalance);
    }));
  };

  const handleDeleteTrade = (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      setTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleDuplicateTrade = (trade) => {
    const maxNum = trades.reduce((max, t) => Math.max(max, t.tradeNum || 0), 0);
    const newTrade = {
      ...trade,
      id: 't-' + Date.now(),
      tradeNum: maxNum + 1,
      exitPrice: '',
      result: 'OPEN',
      pnl: null,
      realizedRR: null
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  // Summary row totals
  const totalPnL = trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const closedCount = trades.filter(t => t.result !== 'OPEN').length;
  const winsCount = trades.filter(t => t.result === 'WIN').length;

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={12} color="var(--text-muted)" style={{ opacity: 0.4 }} />;
    return sortOrder === 'asc' ? <ArrowUp size={12} color="var(--accent-primary)" /> : <ArrowDown size={12} color="var(--accent-primary)" />;
  };

  return (
    <div className="sheet-wrapper">
      <div className="table-scroll-container">
        <table className="excel-table">
          <thead>
            <tr>
              {/* Frozen Columns */}
              <th className="col-frozen-1" onClick={() => handleSort('tradeNum')} style={{ width: '70px', minWidth: '70px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Trade#</span> {renderSortIcon('tradeNum')}
                </div>
              </th>
              <th className="col-frozen-2" onClick={() => handleSort('pair')} style={{ width: '100px', minWidth: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Pair</span> {renderSortIcon('pair')}
                </div>
              </th>
              <th className="col-frozen-3" onClick={() => handleSort('direction')} style={{ width: '80px', minWidth: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Direction</span> {renderSortIcon('direction')}
                </div>
              </th>

              {/* Standard Columns */}
              <th onClick={() => handleSort('date')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date</span> {renderSortIcon('date')}
                </div>
              </th>
              <th onClick={() => handleSort('time')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Time</span> {renderSortIcon('time')}
                </div>
              </th>
              <th onClick={() => handleSort('setup')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Setup</span> {renderSortIcon('setup')}
                </div>
              </th>
              <th onClick={() => handleSort('timeFrame')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Time Frame</span> {renderSortIcon('timeFrame')}
                </div>
              </th>

              {/* Auto Calculated Numeric Fields */}
              <th onClick={() => handleSort('entryPrice')} style={{ background: '#17223b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Entry Price ⚡</span> {renderSortIcon('entryPrice')}
                </div>
              </th>
              <th onClick={() => handleSort('stopLoss')} style={{ background: '#17223b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Stop Loss ⚡</span> {renderSortIcon('stopLoss')}
                </div>
              </th>
              <th onClick={() => handleSort('takeProfit')} style={{ background: '#17223b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Take Profit ⚡</span> {renderSortIcon('takeProfit')}
                </div>
              </th>
              <th onClick={() => handleSort('riskPercent')} style={{ background: '#17223b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Risk % ⚡</span> {renderSortIcon('riskPercent')}
                </div>
              </th>
              <th onClick={() => handleSort('lotSize')} style={{ background: '#1a2744', color: '#93c5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Lot Size 🤖</span> {renderSortIcon('lotSize')}
                </div>
              </th>
              <th onClick={() => handleSort('exitPrice')} style={{ background: '#17223b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Exit Price ⚡</span> {renderSortIcon('exitPrice')}
                </div>
              </th>
              <th onClick={() => handleSort('result')} style={{ background: '#1a2744', color: '#93c5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Result 🤖</span> {renderSortIcon('result')}
                </div>
              </th>
              <th onClick={() => handleSort('pnl')} style={{ background: '#1a2744', color: '#93c5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>P&L ($) 🤖</span> {renderSortIcon('pnl')}
                </div>
              </th>
              <th onClick={() => handleSort('plannedRR')} style={{ background: '#1a2744', color: '#93c5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>R:R 🤖</span> {renderSortIcon('plannedRR')}
                </div>
              </th>

              {/* Psychology & Notes */}
              <th onClick={() => handleSort('ruleFollowed')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Rule Followed?</span> {renderSortIcon('ruleFollowed')}
                </div>
              </th>
              <th onClick={() => handleSort('mistake')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Mistake</span> {renderSortIcon('mistake')}
                </div>
              </th>
              <th onClick={() => handleSort('emotion')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Emotion</span> {renderSortIcon('emotion')}
                </div>
              </th>
              <th>Screenshot</th>
              <th>Lesson</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((t) => {
              const isWin = t.result === 'WIN';
              const isLoss = t.result === 'LOSS';
              const isBE = t.result === 'BE';
              const isOpen = t.result === 'OPEN';

              return (
                <tr key={t.id}>
                  {/* Frozen 1: Trade# */}
                  <td className="col-frozen-1">
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      #{t.tradeNum}
                    </span>
                  </td>

                  {/* Frozen 2: Pair */}
                  <td className="col-frozen-2">
                    <span style={{ fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
                      {t.pair}
                    </span>
                  </td>

                  {/* Frozen 3: Direction */}
                  <td className="col-frozen-3">
                    <span className={`badge ${t.direction === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                      {t.direction}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="cell-editable">
                    <input 
                      type="date" 
                      className="cell-input-inline" 
                      value={t.date || ''} 
                      onChange={e => handleCellChange(t.id, 'date', e.target.value)}
                    />
                  </td>

                  {/* Time */}
                  <td className="cell-editable">
                    <input 
                      type="time" 
                      className="cell-input-inline" 
                      value={t.time || ''} 
                      onChange={e => handleCellChange(t.id, 'time', e.target.value)}
                    />
                  </td>

                  {/* Setup */}
                  <td className="cell-editable">
                    <input 
                      type="text" 
                      className="cell-input-inline" 
                      value={t.setup || ''} 
                      placeholder="Setup"
                      onChange={e => handleCellChange(t.id, 'setup', e.target.value)}
                    />
                  </td>

                  {/* Time Frame */}
                  <td className="cell-editable">
                    <select 
                      className="cell-input-inline"
                      value={t.timeFrame || '15m'}
                      onChange={e => handleCellChange(t.id, 'timeFrame', e.target.value)}
                    >
                      {TIMEFRAME_OPTIONS.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                    </select>
                  </td>

                  {/* Entry Price (Auto-triggers math) */}
                  <td className="cell-editable cell-mono" style={{ background: 'rgba(59, 130, 246, 0.03)' }}>
                    <input 
                      type="number" 
                      step="any"
                      className="cell-input-inline cell-mono" 
                      value={t.entryPrice ?? ''} 
                      placeholder="0.00"
                      onChange={e => handleCellChange(t.id, 'entryPrice', e.target.value)}
                    />
                  </td>

                  {/* Stop Loss (Auto-triggers math) */}
                  <td className="cell-editable cell-mono" style={{ background: 'rgba(59, 130, 246, 0.03)' }}>
                    <input 
                      type="number" 
                      step="any"
                      className="cell-input-inline cell-mono" 
                      value={t.stopLoss ?? ''} 
                      placeholder="0.00"
                      onChange={e => handleCellChange(t.id, 'stopLoss', e.target.value)}
                    />
                  </td>

                  {/* Take Profit (Auto-triggers math) */}
                  <td className="cell-editable cell-mono" style={{ background: 'rgba(59, 130, 246, 0.03)' }}>
                    <input 
                      type="number" 
                      step="any"
                      className="cell-input-inline cell-mono" 
                      value={t.takeProfit ?? ''} 
                      placeholder="0.00"
                      onChange={e => handleCellChange(t.id, 'takeProfit', e.target.value)}
                    />
                  </td>

                  {/* Risk % (Auto-triggers math) */}
                  <td className="cell-editable cell-mono" style={{ background: 'rgba(59, 130, 246, 0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        step="0.1"
                        className="cell-input-inline cell-mono" 
                        value={t.riskPercent ?? ''} 
                        placeholder="1.0"
                        onChange={e => handleCellChange(t.id, 'riskPercent', e.target.value)}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>%</span>
                    </div>
                  </td>

                  {/* Lot Size (Auto-Calculated by default or manual override) */}
                  <td className="cell-editable cell-mono" style={{ background: 'rgba(59, 130, 246, 0.07)' }}>
                    <input 
                      type="number" 
                      step="0.01"
                      className="cell-input-inline cell-mono" 
                      style={{ color: '#93c5fd', fontWeight: 600 }}
                      value={t.lotSize ?? ''} 
                      placeholder="Auto"
                      onChange={e => handleCellChange(t.id, 'lotSize', e.target.value)}
                      title="Auto-calculated from SL Distance and Risk %. Edit manually to override."
                    />
                  </td>

                  {/* Exit Price (Auto-triggers P&L & Result) */}
                  <td className="cell-editable cell-mono" style={{ background: 'rgba(59, 130, 246, 0.03)' }}>
                    <input 
                      type="number" 
                      step="any"
                      className="cell-input-inline cell-mono" 
                      value={t.exitPrice ?? ''} 
                      placeholder="Exit Price"
                      onChange={e => handleCellChange(t.id, 'exitPrice', e.target.value)}
                    />
                  </td>

                  {/* Result (Auto-Calculated) */}
                  <td style={{ textAlign: 'center' }}>
                    {isWin && <span className="badge badge-win">WIN</span>}
                    {isLoss && <span className="badge badge-loss">LOSS</span>}
                    {isBE && <span className="badge badge-be">BE</span>}
                    {isOpen && <span className="badge badge-open">OPEN</span>}
                  </td>

                  {/* P&L ($) (Auto-Calculated or Manual) */}
                  <td className="cell-editable cell-mono" style={{ textAlign: 'right' }}>
                    {t.pnl !== null && t.pnl !== undefined ? (
                      <span style={{ 
                        fontWeight: 700, 
                        color: t.pnl > 0 ? 'var(--color-win)' : t.pnl < 0 ? 'var(--color-loss)' : 'var(--text-secondary)' 
                      }}>
                        {t.pnl >= 0 ? '+' : ''}${parseFloat(t.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  {/* R:R (Auto-Calculated Planned & Realized) */}
                  <td className="cell-mono" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.plannedRR ? `1 : ${t.plannedRR}` : '—'}
                      </span>
                      {t.realizedRR !== null && t.realizedRR !== undefined && (
                        <span style={{ 
                          fontSize: '0.72rem', 
                          color: t.realizedRR > 0 ? 'var(--color-win)' : t.realizedRR < 0 ? 'var(--color-loss)' : 'var(--text-muted)' 
                        }}>
                          ({t.realizedRR >= 0 ? '+' : ''}{t.realizedRR}R)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rule Followed? */}
                  <td className="cell-editable">
                    <select 
                      className="cell-input-inline"
                      value={t.ruleFollowed || 'Yes'}
                      onChange={e => handleCellChange(t.id, 'ruleFollowed', e.target.value)}
                      style={{ 
                        color: t.ruleFollowed === 'Yes' ? 'var(--color-win)' : t.ruleFollowed === 'No' ? 'var(--color-loss)' : 'var(--color-be)'
                      }}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </td>

                  {/* Mistake */}
                  <td className="cell-editable">
                    <select 
                      className="cell-input-inline"
                      value={t.mistake || 'None'}
                      onChange={e => handleCellChange(t.id, 'mistake', e.target.value)}
                    >
                      {MISTAKE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>

                  {/* Emotion */}
                  <td className="cell-editable">
                    <select 
                      className="cell-input-inline"
                      value={t.emotion || 'Disciplined'}
                      onChange={e => handleCellChange(t.id, 'emotion', e.target.value)}
                    >
                      {EMOTION_OPTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                    </select>
                  </td>

                  {/* Screenshot Thumbnail */}
                  <td style={{ textAlign: 'center' }}>
                    {t.screenshot ? (
                      <button 
                        className="thumb-btn" 
                        onClick={() => onViewImage(t.screenshot, `${t.pair} (${t.direction})`)}
                        title="Click to view chart screenshot"
                      >
                        <img src={t.screenshot} alt="Chart" className="thumb-img" />
                        <span style={{ fontSize: '0.72rem' }}>View</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>

                  {/* Lesson */}
                  <td className="cell-editable" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <input 
                      type="text" 
                      className="cell-input-inline" 
                      value={t.lesson || ''} 
                      placeholder="Key takeaway"
                      onChange={e => handleCellChange(t.id, 'lesson', e.target.value)}
                    />
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <button 
                        className="btn btn-secondary btn-icon" 
                        style={{ padding: '4px' }}
                        onClick={() => onEditTrade(t)}
                        title="Edit in full trade modal"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-icon" 
                        style={{ padding: '4px' }}
                        onClick={() => handleDuplicateTrade(t)}
                        title="Duplicate trade setup"
                      >
                        <Copy size={13} />
                      </button>
                      <button 
                        className="btn btn-danger btn-icon" 
                        style={{ padding: '4px' }}
                        onClick={() => handleDeleteTrade(t.id)}
                        title="Delete trade"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {sortedTrades.length === 0 && (
              <tr>
                <td colSpan={22} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  No trades found matching your search or filters. Click "+ Add Trade" or "+ Quick Row" to start logging.
                </td>
              </tr>
            )}
          </tbody>

          {/* Excel Summary Footer */}
          {sortedTrades.length > 0 && (
            <tfoot>
              <tr style={{ background: '#131b2e', fontWeight: 700, borderTop: '2px solid var(--border-card)' }}>
                <td colSpan={3} className="col-frozen-1" style={{ background: '#131b2e', color: 'var(--text-heading)' }}>
                  Total ({sortedTrades.length} Trades)
                </td>
                <td colSpan={10} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Wins: <span style={{ color: 'var(--color-win)' }}>{winsCount}</span> | Losses: <span style={{ color: 'var(--color-loss)' }}>{closedCount - winsCount}</span>
                </td>
                <td style={{ textAlign: 'center', color: 'var(--text-heading)' }}>
                  Summary
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: totalPnL >= 0 ? 'var(--color-win)' : 'var(--color-loss)' }}>
                    {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td colSpan={6}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

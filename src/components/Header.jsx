import React, { useState } from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Calculator,
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { exportTradesToCSV, downloadFile, parseCSVToTrades } from '../utils/exportImport';

export default function Header({ 
  trades, 
  setTrades, 
  accountBalance, 
  setAccountBalance, 
  onOpenNewTradeModal, 
  onOpenCalculator,
  onResetDemo 
}) {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(accountBalance.toString());

  // Quick stats calculation
  const closedTrades = trades.filter(t => t.result !== 'OPEN');
  const wins = closedTrades.filter(t => t.result === 'WIN').length;
  const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;
  
  const totalPnL = trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const currentEquity = accountBalance + totalPnL;

  const handleSaveBalance = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val > 0) {
      setAccountBalance(val);
    }
    setIsEditingBalance(false);
  };

  const handleExportCSV = () => {
    const csvData = exportTradesToCSV(trades);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvData, `trading_journal_${dateStr}.csv`);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        const imported = parseCSVToTrades(text);
        if (imported.length > 0) {
          setTrades(prev => [...imported, ...prev]);
          alert(`Successfully imported ${imported.length} trades!`);
        } else {
          alert('Could not parse any valid trades from this CSV file.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="app-header">
      {/* Brand */}
      <div className="brand-section">
        <div className="brand-icon">
          <TrendingUp size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="brand-title">APEX JOURNAL</h1>
          <div className="brand-subtitle">Smart Sheet & Precision Risk Terminal</div>
        </div>
      </div>

      {/* Account Overview Bar */}
      <div className="account-bar">
        <div className="account-stat">
          <span className="account-label">Account Balance</span>
          {isEditingBalance ? (
            <input
              type="number"
              className="cell-input-inline"
              style={{ width: '100px', borderBottom: '1px solid var(--accent-primary)' }}
              value={balanceInput}
              onChange={e => setBalanceInput(e.target.value)}
              onBlur={handleSaveBalance}
              onKeyDown={e => e.key === 'Enter' && handleSaveBalance()}
              autoFocus
            />
          ) : (
            <span 
              className="account-val editable" 
              onClick={() => { setBalanceInput(accountBalance.toString()); setIsEditingBalance(true); }}
              title="Click to edit account starting balance"
            >
              <Wallet size={15} color="var(--accent-primary)" />
              ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="account-divider"></div>

        <div className="account-stat">
          <span className="account-label">Total Equity</span>
          <span className={`account-val ${totalPnL >= 0 ? 'win' : 'loss'}`}>
            ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="account-divider"></div>

        <div className="account-stat">
          <span className="account-label">Net P&L</span>
          <span className={`account-val ${totalPnL >= 0 ? 'win' : 'loss'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="account-divider"></div>

        <div className="account-stat">
          <span className="account-label">Win Rate</span>
          <span className="account-val" style={{ color: winRate >= 50 ? 'var(--color-win)' : 'var(--color-loss)' }}>
            {winRate}% <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({wins}/{closedTrades.length})</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="header-actions">
        <button className="btn btn-primary" onClick={onOpenNewTradeModal} title="Log a new trade with live auto-calculations">
          <PlusCircle size={16} />
          <span>New Trade</span>
        </button>

        <button className="btn btn-secondary" onClick={onOpenCalculator} title="Open Position Sizing Calculator">
          <Calculator size={15} />
          <span>Calculator</span>
        </button>

        <button className="btn btn-secondary" onClick={handleExportCSV} title="Export all trades to Excel/CSV">
          <Download size={15} />
          <span>Export CSV</span>
        </button>

        <label className="btn btn-secondary" title="Import trades from CSV file" style={{ margin: 0, cursor: 'pointer' }}>
          <Upload size={15} />
          <span>Import</span>
          <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
        </label>

        <button className="btn btn-secondary btn-icon" onClick={onResetDemo} title="Reset to realistic demo trades">
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Calculator,
  Wallet,
  FileCode,
  Keyboard
} from 'lucide-react';
import { 
  exportTradesToCSV, 
  exportJournalToJSON, 
  downloadFile, 
  parseCSVToTrades 
} from '../utils/exportImport';

export default function Header({ 
  trades, 
  setTrades, 
  accountBalance, 
  setAccountBalance,
  equityTarget,
  setEquityTarget,
  onOpenNewTradeModal, 
  onOpenCalculator,
  onOpenShortcuts,
  onResetDemo 
}) {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(accountBalance.toString());

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState((equityTarget || accountBalance * 1.2).toString());

  const closedTrades = trades.filter(t => t.result !== 'OPEN');
  const wins = closedTrades.filter(t => t.result === 'WIN').length;
  const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;
  
  const totalPnL = trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const currentEquity = accountBalance + totalPnL;

  const currentTarget = equityTarget || (accountBalance * 1.2);
  const growthNeeded = currentTarget - accountBalance;
  const progressPercent = growthNeeded > 0 
    ? Math.min(100, Math.max(0, Math.round((totalPnL / growthNeeded) * 100))) 
    : 100;

  const handleSaveBalance = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val > 0) {
      setAccountBalance(val);
    }
    setIsEditingBalance(false);
  };

  const handleSaveTarget = () => {
    const val = parseFloat(targetInput);
    if (!isNaN(val) && val > 0) {
      setEquityTarget(val);
    }
    setIsEditingTarget(false);
  };

  const handleExportCSV = () => {
    const csvData = exportTradesToCSV(trades);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvData, `apex_trading_journal_${dateStr}.csv`);
  };

  const handleExportJSON = () => {
    const jsonData = exportJournalToJSON(trades, accountBalance, currentTarget);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonData, `apex_journal_backup_${dateStr}.json`, 'application/json');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        if (file.name.endsWith('.json')) {
          try {
            const data = JSON.parse(text);
            if (data.trades && Array.isArray(data.trades)) {
              setTrades(data.trades);
              if (data.accountBalance) setAccountBalance(data.accountBalance);
              if (data.equityTarget) setEquityTarget(data.equityTarget);
              alert(`Successfully restored full journal backup (${data.trades.length} trades)!`);
            }
          } catch (err) {
            alert('Failed to parse JSON backup file: ' + err.message);
          }
        } else {
          const imported = parseCSVToTrades(text);
          if (imported.length > 0) {
            setTrades(prev => [...imported, ...prev]);
            alert(`Successfully imported ${imported.length} trades from CSV!`);
          } else {
            alert('Could not parse any valid trades from this CSV file.');
          }
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon">
          <TrendingUp size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="brand-title">APEX JOURNAL</h1>
          <div className="brand-subtitle">Smart Sheet & Precision Terminal</div>
        </div>
      </div>

      <div className="account-bar">
        <div className="account-stat">
          <span className="account-label">Starting Capital</span>
          {isEditingBalance ? (
            <input
              type="number"
              className="cell-input-inline"
              style={{ width: '90px', borderBottom: '1px solid var(--accent-primary)' }}
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
              <Wallet size={14} color="var(--accent-primary)" />
              ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="account-divider" />

        <div className="account-stat">
          <span className="account-label">Total Equity</span>
          <span className={`account-val ${totalPnL >= 0 ? 'win' : 'loss'}`}>
            ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="account-divider" />

        <div className="account-stat">
          <span className="account-label">Net P&L</span>
          <span className={`account-val ${totalPnL >= 0 ? 'win' : 'loss'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="account-divider" />

        <div className="account-stat">
          <span className="account-label">Win Rate</span>
          <span className="account-val" style={{ color: winRate >= 50 ? 'var(--color-win)' : 'var(--color-loss)' }}>
            {winRate}% <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({wins}/{closedTrades.length})</span>
          </span>
        </div>

        <div className="account-divider" />

        <div className="account-stat equity-progress-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="account-label">Target Milestone</span>
            {isEditingTarget ? (
              <input
                type="number"
                className="cell-input-inline"
                style={{ width: '70px', fontSize: '0.72rem' }}
                value={targetInput}
                onChange={e => setTargetInput(e.target.value)}
                onBlur={handleSaveTarget}
                onKeyDown={e => e.key === 'Enter' && handleSaveTarget()}
                autoFocus
              />
            ) : (
              <span 
                style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', cursor: 'pointer', color: 'var(--text-secondary)' }}
                onClick={() => { setTargetInput(currentTarget.toString()); setIsEditingTarget(true); }}
                title="Click to edit Equity Target"
              >
                ${currentTarget.toLocaleString()} ({progressPercent}%)
              </span>
            )}
          </div>
          <div className="equity-progress-bar" title={`Target: $${currentTarget.toLocaleString()} (${progressPercent}% reached)`}>
            <div className="equity-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn btn-primary" onClick={onOpenNewTradeModal} title="Log a new trade [Hotkey: N]">
          <PlusCircle size={16} />
          <span>New Trade</span>
        </button>

        <button className="btn btn-secondary" onClick={onOpenCalculator} title="Open Position Sizing Calculator [Hotkey: C]">
          <Calculator size={15} />
          <span>Calculator</span>
        </button>

        <button className="btn btn-secondary" onClick={handleExportCSV} title="Export trades to CSV file">
          <Download size={15} />
          <span>CSV</span>
        </button>

        <button className="btn btn-secondary" onClick={handleExportJSON} title="Full JSON Backup">
          <FileCode size={15} />
          <span>Backup</span>
        </button>

        <label className="btn btn-secondary" title="Import trades from CSV or JSON file" style={{ margin: 0, cursor: 'pointer' }}>
          <Upload size={15} />
          <span>Import</span>
          <input type="file" accept=".csv,.json" onChange={handleImportFile} style={{ display: 'none' }} />
        </label>

        <button className="btn btn-secondary btn-icon" onClick={onOpenShortcuts} title="Keyboard Hotkeys [?]">
          <Keyboard size={15} />
        </button>

        <button className="btn btn-secondary btn-icon" onClick={onResetDemo} title="Reset to demo trades">
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { 
  TrendingUp, 
  PlusCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Calculator,
  Wallet,
  Target,
  FileCode,
  Keyboard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  exportTradesToCSV, 
  exportJournalToJSON, 
  downloadFile, 
  parseCSVToTrades 
} from '../utils/exportImport';
import { calculateMilestoneProgress } from '../utils/calculations';

export default function Header({ 
  trades, 
  setTrades, 
  accountBalance, 
  setAccountBalance, 
  milestoneTarget = 500,
  setMilestoneTarget,
  equityTarget,
  setEquityTarget,
  onOpenNewTradeModal, 
  onOpenCalculator,
  onOpenShortcuts,
  onResetDemo 
}) {
  const activeMilestone = milestoneTarget || equityTarget || 500;
  const updateMilestone = setMilestoneTarget || setEquityTarget;

  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(accountBalance.toString());

  const [isEditingMilestone, setIsEditingMilestone] = useState(false);
  const [milestoneInput, setMilestoneInput] = useState(activeMilestone.toString());

  // Quick stats calculation
  const closedTrades = trades.filter(t => t.result !== 'OPEN');
  const wins = closedTrades.filter(t => t.result === 'WIN').length;
  const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;
  
  const totalPnL = trades.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0);
  const currentEquity = accountBalance + totalPnL;

  // Milestone Progress (Strictly Net P&L vs Milestone Target - Starting Capital is NEVER added)
  const milestoneProgress = calculateMilestoneProgress(totalPnL, activeMilestone);

  const handleSaveBalance = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val > 0) {
      setAccountBalance(val);
    }
    setIsEditingBalance(false);
  };

  const handleSaveMilestone = () => {
    const val = parseFloat(milestoneInput);
    if (!isNaN(val) && val > 0 && updateMilestone) {
      updateMilestone(val);
    }
    setIsEditingMilestone(false);
  };

  const handleExportCSV = () => {
    const csvData = exportTradesToCSV(trades);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvData, `apex_trading_journal_${dateStr}.csv`);
  };

  const handleExportJSON = () => {
    const jsonData = exportJournalToJSON(trades, accountBalance, activeMilestone);
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
              if (data.equityTarget && updateMilestone) updateMilestone(data.equityTarget);
              if (data.milestoneTarget && updateMilestone) updateMilestone(data.milestoneTarget);
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
      {/* Brand */}
      <div className="brand-section">
        <div className="brand-icon">
          <TrendingUp size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="brand-title">APEX JOURNAL</h1>
          <div className="brand-subtitle">Smart Sheet & Precision Terminal</div>
        </div>
      </div>

      {/* Account Overview Bar */}
      <div className="account-bar">
        {/* Stat 1: Starting Capital (Strictly independent from milestone target) */}
        <div className="account-stat">
          <span className="account-label" title="Base starting deposit / capital">Starting Capital</span>
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
              title="Click to edit starting capital (kept separate from milestone target)"
            >
              <Wallet size={14} color="var(--accent-primary)" />
              ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="account-divider" />

        {/* Stat 2: Milestone Target (Standalone profit goal - NEVER includes starting capital) */}
        <div className="account-stat">
          <span className="account-label" title="Standalone profit milestone goal (starting capital is not added)">Milestone Target</span>
          {isEditingMilestone ? (
            <input
              type="number"
              className="cell-input-inline"
              style={{ width: '85px', borderBottom: '1px solid #f59e0b' }}
              value={milestoneInput}
              onChange={e => setMilestoneInput(e.target.value)}
              onBlur={handleSaveMilestone}
              onKeyDown={e => e.key === 'Enter' && handleSaveMilestone()}
              autoFocus
            />
          ) : (
            <span 
              className="account-val editable" 
              onClick={() => { setMilestoneInput(activeMilestone.toString()); setIsEditingMilestone(true); }}
              title="Click to edit milestone target (e.g. $500, separate from starting capital)"
              style={{ color: '#f59e0b' }}
            >
              <Target size={14} color="#f59e0b" />
              ${activeMilestone.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <div className="account-divider" />

        {/* Stat 3: Milestone Progress (Net P&L vs Milestone Target) */}
        <div className="account-stat">
          <span className="account-label">Target Progress</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span 
              className="account-val" 
              style={{ 
                color: milestoneProgress.isAchieved ? 'var(--color-win)' : 'var(--text-primary)', 
                fontSize: '1rem' 
              }}
            >
              {milestoneProgress.progressPercent}%
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              ({totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(0)} / ${activeMilestone.toFixed(0)})
            </span>
          </div>
          <div className="equity-progress-bar" style={{ width: '100%', height: '4px', marginTop: '3px' }} title={`Target: $${activeMilestone.toLocaleString()} (${milestoneProgress.progressPercent}% reached)`}>
            <div className="equity-progress-fill" style={{ width: `${milestoneProgress.progressPercent}%`, height: '100%', background: milestoneProgress.isAchieved ? 'var(--color-win)' : '#f59e0b' }} />
          </div>
        </div>

        <div className="account-divider" />

        {/* Stat 4: Total Equity (Starting Capital + Net P&L) */}
        <div className="account-stat">
          <span className="account-label" title="Starting Capital + Realized Net P&L">Total Equity</span>
          <span className={`account-val ${totalPnL >= 0 ? 'win' : 'loss'}`}>
            ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="account-divider" />

        {/* Stat 5: Net P&L */}
        <div className="account-stat">
          <span className="account-label">Net P&L</span>
          <span className={`account-val ${totalPnL >= 0 ? 'win' : 'loss'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="account-divider" />

        {/* Stat 6: Win Rate */}
        <div className="account-stat">
          <span className="account-label">Win Rate</span>
          <span className="account-val" style={{ color: winRate >= 50 ? 'var(--color-win)' : 'var(--color-loss)' }}>
            {winRate}% <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({wins}/{closedTrades.length})</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
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

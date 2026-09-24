import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import Navigation from './components/Navigation';
import TableToolbar from './components/ExcelSheet/TableToolbar';
import TableGrid from './components/ExcelSheet/TableGrid';
import TradeModal from './components/ExcelSheet/TradeModal';
import ImageModal from './components/ExcelSheet/ImageModal';
import AnalyticsView from './components/Dashboard/AnalyticsView';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import PsychologyAuditView from './components/Psychology/PsychologyAuditView';
import TradingCalendarView from './components/Calendar/TradingCalendarView';
import RiskCalculatorModal from './components/Calculator/RiskCalculatorModal';
import PositionCalculatorView from './components/Calculator/PositionCalculatorView';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { 
  loadTrades, 
  saveTrades, 
  loadAccountBalance, 
  saveAccountBalance, 
  loadMilestoneTarget,
  saveMilestoneTarget,
  resetToDemoData, 
  clearAllTrades 
} from './utils/storage';
import { autoCalculateTrade } from './utils/calculations';

export default function App() {
  const [trades, setTrades] = useState(() => loadTrades());
  const [accountBalance, setAccountBalance] = useState(() => loadAccountBalance());
  const [milestoneTarget, setMilestoneTarget] = useState(() => loadMilestoneTarget());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCompact, setIsCompact] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    result: 'ALL',
    direction: 'ALL',
    setup: 'ALL',
    session: 'ALL',
    timeFrame: 'ALL',
    ruleFollowed: 'ALL'
  });

  // Modals
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  // Persistence Effects
  useEffect(() => {
    saveTrades(trades);
  }, [trades]);

  useEffect(() => {
    saveAccountBalance(accountBalance);
  }, [accountBalance]);

  useEffect(() => {
    saveMilestoneTarget(milestoneTarget);
  }, [milestoneTarget]);

  // Global Keyboard Shortcuts Listener (N, C, 1, 2, 3, 4, ?, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger hotkeys if user is typing in an input/textarea
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTrade(null);
        setIsTradeModalOpen(true);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsCalculatorOpen(true);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key === '1') {
        setActiveTab('dashboard');
      } else if (e.key === '2') {
        setActiveTab('sheet');
      } else if (e.key === '3') {
        setActiveTab('analytics');
      } else if (e.key === '4') {
        setActiveTab('psychology');
      } else if (e.key === '5') {
        setActiveTab('calendar');
      } else if (e.key === '6') {
        setActiveTab('calculator');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Next trade sequence number
  const nextTradeNum = trades.reduce((max, t) => Math.max(max, t.tradeNum || 0), 0) + 1;

  // Filter & Search matching
  const filteredTrades = trades.filter(t => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPair = (t.pair || '').toLowerCase().includes(q);
      const matchSetup = (t.setup || '').toLowerCase().includes(q);
      const matchSession = (t.session || '').toLowerCase().includes(q);
      const matchMistake = (t.mistake || '').toLowerCase().includes(q);
      const matchEmotion = (t.emotion || '').toLowerCase().includes(q);
      const matchLesson = (t.lesson || '').toLowerCase().includes(q);
      if (!matchPair && !matchSetup && !matchSession && !matchMistake && !matchEmotion && !matchLesson) {
        return false;
      }
    }

    if (filters.result !== 'ALL' && t.result !== filters.result) return false;
    if (filters.direction !== 'ALL' && t.direction !== filters.direction) return false;
    if (filters.setup !== 'ALL' && t.setup !== filters.setup) return false;
    if (filters.session !== 'ALL' && t.session !== filters.session) return false;
    if (filters.timeFrame !== 'ALL' && t.timeFrame !== filters.timeFrame) return false;
    if (filters.ruleFollowed !== 'ALL' && t.ruleFollowed !== filters.ruleFollowed) return false;

    return true;
  });

  // Save or Update Trade from Modal
  const handleSaveTrade = (savedTrade) => {
    if (editingTrade && editingTrade.id) {
      setTrades(prev => prev.map(t => t.id === savedTrade.id ? savedTrade : t));
    } else {
      setTrades(prev => [savedTrade, ...prev]);
      if (savedTrade.result === 'WIN' && savedTrade.pnl > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }
  };

  // Add a clean editable row directly into the Excel grid
  const handleAddInlineRow = () => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().substring(0, 5);
    const newEmptyTrade = autoCalculateTrade({
      id: 't-' + Date.now(),
      tradeNum: nextTradeNum,
      date: today,
      time: nowTime,
      session: 'London',
      pair: 'EURUSD',
      direction: 'BUY',
      setup: 'New Setup',
      timeFrame: '15m',
      entryPrice: 1.08000,
      stopLoss: 1.07800,
      takeProfit: 1.08600,
      riskPercent: 1.0,
      lotSize: '',
      exitPrice: '',
      result: 'OPEN',
      pnl: null,
      plannedRR: null,
      realizedRR: null,
      ruleFollowed: 'Yes',
      mistake: 'None',
      emotion: 'Disciplined',
      screenshot: '',
      lesson: ''
    }, accountBalance);

    setTrades(prev => [newEmptyTrade, ...prev]);
  };

  const handleOpenNewTrade = () => {
    setEditingTrade(null);
    setIsTradeModalOpen(true);
  };

  const handleEditTrade = (trade) => {
    setEditingTrade(trade);
    setIsTradeModalOpen(true);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all trades to default demo data? Your current trades will be replaced.')) {
      const { trades: newTrades, balance, milestoneTarget: newTarget, target } = resetToDemoData();
      setTrades(newTrades);
      setAccountBalance(balance);
      setMilestoneTarget(newTarget || target || 500);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear ALL trades from the journal?')) {
      clearAllTrades();
      setTrades([]);
    }
  };

  const handleApplyFromCalculator = (calculatedValues) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().substring(0, 5);
    setEditingTrade({
      tradeNum: nextTradeNum,
      date: today,
      time: nowTime,
      session: 'London',
      setup: 'Calculated Setup',
      timeFrame: '15m',
      ruleFollowed: 'Yes',
      mistake: 'None',
      emotion: 'Disciplined',
      screenshot: '',
      lesson: '',
      ...calculatedValues
    });
    setIsTradeModalOpen(true);
  };

  const closedTradesCount = trades.filter(t => t.result !== 'OPEN').length;

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header 
        trades={trades}
        setTrades={setTrades}
        accountBalance={accountBalance}
        setAccountBalance={setAccountBalance}
        milestoneTarget={milestoneTarget}
        setMilestoneTarget={setMilestoneTarget}
        onOpenNewTradeModal={handleOpenNewTrade}
        onOpenCalculator={() => setActiveTab('calculator')}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Tab Navigation */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        totalTrades={trades.length}
        closedTradesCount={closedTradesCount}
      />

      {/* Content Body */}
      <main className={`main-content ${activeTab === 'calendar' ? 'calendar-page-active' : ''}`}>
        {/* VIEW 0: ALL-IN-ONE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardOverview 
            trades={trades}
            accountBalance={accountBalance}
            milestoneTarget={milestoneTarget}
            setMilestoneTarget={setMilestoneTarget}
            onAddTrade={handleOpenNewTrade}
            onEditTrade={handleEditTrade}
            onOpenCalculator={() => setActiveTab('calculator')}
            onNavigateTab={setActiveTab}
            onViewImage={(url, title) => setViewingImage({ url, title })}
          />
        )}

        {/* VIEW 1: EXCEL SMART SHEET */}
        {activeTab === 'sheet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <TableToolbar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filters={filters}
              setFilters={setFilters}
              isCompact={isCompact}
              setIsCompact={setIsCompact}
              onAddTrade={handleOpenNewTrade}
              onAddInlineRow={handleAddInlineRow}
              totalTrades={trades.length}
              filteredCount={filteredTrades.length}
              onClearTrades={handleClearAll}
            />

            <TableGrid 
              trades={filteredTrades}
              setTrades={setTrades}
              accountBalance={accountBalance}
              isCompact={isCompact}
              onEditTrade={handleEditTrade}
              onViewImage={(url, title) => setViewingImage({ url, title })}
            />
          </div>
        )}

        {/* VIEW 2: ANALYTICS & EQUITY */}
        {activeTab === 'analytics' && (
          <AnalyticsView 
            trades={trades} 
            accountBalance={accountBalance} 
            milestoneTarget={milestoneTarget}
            setMilestoneTarget={setMilestoneTarget}
          />
        )}

        {/* VIEW 3: PSYCHOLOGY & RULES */}
        {activeTab === 'psychology' && (
          <PsychologyAuditView 
            trades={trades} 
          />
        )}

        {/* VIEW 4: TRADING CALENDAR */}
        {activeTab === 'calendar' && (
          <TradingCalendarView 
            trades={trades} 
            onEditTrade={handleEditTrade} 
          />
        )}

        {/* VIEW 5: POSITION SIZE & RISK CALCULATOR (LIQUID DISPLAY) */}
        {activeTab === 'calculator' && (
          <PositionCalculatorView 
            accountBalance={accountBalance}
            onApplyToNewTrade={handleApplyFromCalculator}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Modal: Add/Edit Trade */}
      <TradeModal 
        isOpen={isTradeModalOpen}
        trade={editingTrade}
        accountBalance={accountBalance}
        onClose={() => { setIsTradeModalOpen(false); setEditingTrade(null); }}
        onSave={handleSaveTrade}
        nextTradeNum={nextTradeNum}
        onViewImage={(url, title) => setViewingImage({ url, title })}
      />

      {/* Modal: Screenshot Zoom Lightbox */}
      <ImageModal 
        imageUrl={viewingImage?.url}
        title={viewingImage?.title}
        onClose={() => setViewingImage(null)}
      />

      {/* Modal: Position Size & Risk Calculator */}
      <RiskCalculatorModal 
        isOpen={isCalculatorOpen}
        accountBalance={accountBalance}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyToNewTrade={handleApplyFromCalculator}
      />

      {/* Modal: Keyboard Shortcuts Helper */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

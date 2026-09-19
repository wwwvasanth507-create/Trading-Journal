import React from 'react';
import { Search, Plus, Trash2, Rows, Maximize2 } from 'lucide-react';
import { SETUP_OPTIONS, SESSION_OPTIONS } from '../../utils/sampleData';

export default function TableToolbar({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters,
  isCompact,
  setIsCompact,
  onAddTrade,
  onAddInlineRow,
  totalTrades,
  filteredCount,
  onClearTrades
}) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const setQuickFilter = (preset) => {
    if (preset === 'WIN') {
      setFilters(prev => ({ ...prev, result: 'WIN', ruleFollowed: 'ALL' }));
    } else if (preset === 'LOSS') {
      setFilters(prev => ({ ...prev, result: 'LOSS', ruleFollowed: 'ALL' }));
    } else if (preset === 'VIOLATION') {
      setFilters(prev => ({ ...prev, result: 'ALL', ruleFollowed: 'No' }));
    } else if (preset === 'OPEN') {
      setFilters(prev => ({ ...prev, result: 'OPEN', ruleFollowed: 'ALL' }));
    } else {
      resetFilters();
    }
  };

  const hasActiveFilters = searchQuery || 
    filters.result !== 'ALL' || 
    filters.direction !== 'ALL' || 
    filters.setup !== 'ALL' || 
    filters.session !== 'ALL' || 
    filters.ruleFollowed !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      result: 'ALL',
      direction: 'ALL',
      setup: 'ALL',
      session: 'ALL',
      ruleFollowed: 'ALL'
    });
  };

  return (
    <div className="toolbar-container">
      {/* Search and Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div className="search-box">
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search pair, setup, mistake, notes..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Filter Chips */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button 
            className={`quick-chip ${filters.result === 'ALL' && filters.ruleFollowed === 'ALL' ? 'active' : ''}`}
            onClick={() => setQuickFilter('ALL')}
          >
            All
          </button>
          <button 
            className={`quick-chip ${filters.result === 'WIN' ? 'active' : ''}`}
            onClick={() => setQuickFilter('WIN')}
          >
            🎯 Wins
          </button>
          <button 
            className={`quick-chip ${filters.result === 'LOSS' ? 'active' : ''}`}
            onClick={() => setQuickFilter('LOSS')}
          >
            🛑 Losses
          </button>
          <button 
            className={`quick-chip ${filters.ruleFollowed === 'No' ? 'active' : ''}`}
            onClick={() => setQuickFilter('VIOLATION')}
          >
            ⚠️ Rule Breaks
          </button>
          <button 
            className={`quick-chip ${filters.result === 'OPEN' ? 'active' : ''}`}
            onClick={() => setQuickFilter('OPEN')}
          >
            ⚡ Open
          </button>
        </div>

        {/* Advanced Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            className="filter-select"
            value={filters.direction}
            onChange={e => handleFilterChange('direction', e.target.value)}
          >
            <option value="ALL">Direction: All</option>
            <option value="BUY">BUY / Long</option>
            <option value="SELL">SELL / Short</option>
          </select>

          <select 
            className="filter-select"
            value={filters.session || 'ALL'}
            onChange={e => handleFilterChange('session', e.target.value)}
          >
            <option value="ALL">Session: All</option>
            {SESSION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select 
            className="filter-select"
            value={filters.setup}
            onChange={e => handleFilterChange('setup', e.target.value)}
          >
            <option value="ALL">Setup: All</option>
            {SETUP_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {hasActiveFilters && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            onClick={resetFilters}
          >
            Reset
          </button>
        )}
      </div>

      {/* Action Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button 
          className="btn btn-secondary btn-icon"
          onClick={() => setIsCompact(!isCompact)}
          title={isCompact ? 'Switch to Standard Grid Density' : 'Switch to Compact Grid Density'}
        >
          {isCompact ? <Maximize2 size={15} /> : <Rows size={15} />}
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredCount}</strong> of <strong>{totalTrades}</strong>
        </span>

        <button 
          className="btn btn-primary"
          onClick={onAddTrade}
          style={{ padding: '0.45rem 0.85rem' }}
          title="Open modal to add a trade [N]"
        >
          <Plus size={15} />
          <span>Add Trade</span>
        </button>

        <button 
          className="btn btn-secondary"
          onClick={onAddInlineRow}
          style={{ padding: '0.45rem 0.85rem' }}
          title="Insert editable row into sheet"
        >
          <span>+ Quick Row</span>
        </button>

        {totalTrades > 0 && (
          <button 
            className="btn btn-danger btn-icon" 
            onClick={onClearTrades}
            title="Clear all trades"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

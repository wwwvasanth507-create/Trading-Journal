import React from 'react';
import { Search, Filter, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import { SETUP_OPTIONS, TIMEFRAME_OPTIONS } from '../../utils/sampleData';

export default function TableToolbar({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  onAddTrade,
  onAddInlineRow,
  totalTrades,
  filteredCount,
  onClearTrades
}) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = searchQuery || 
    filters.result !== 'ALL' || 
    filters.direction !== 'ALL' || 
    filters.setup !== 'ALL' || 
    filters.timeFrame !== 'ALL' || 
    filters.ruleFollowed !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      result: 'ALL',
      direction: 'ALL',
      setup: 'ALL',
      timeFrame: 'ALL',
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

        {/* Filter: Result */}
        <select 
          className="filter-select"
          value={filters.result}
          onChange={e => handleFilterChange('result', e.target.value)}
        >
          <option value="ALL">Result: All</option>
          <option value="WIN">WIN only</option>
          <option value="LOSS">LOSS only</option>
          <option value="BE">BE (Break Even)</option>
          <option value="OPEN">OPEN Trades</option>
        </select>

        {/* Filter: Direction */}
        <select 
          className="filter-select"
          value={filters.direction}
          onChange={e => handleFilterChange('direction', e.target.value)}
        >
          <option value="ALL">Direction: All</option>
          <option value="BUY">BUY / Long</option>
          <option value="SELL">SELL / Short</option>
        </select>

        {/* Filter: Setup */}
        <select 
          className="filter-select"
          value={filters.setup}
          onChange={e => handleFilterChange('setup', e.target.value)}
        >
          <option value="ALL">Setup: All</option>
          {SETUP_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Filter: Rule Followed */}
        <select 
          className="filter-select"
          value={filters.ruleFollowed}
          onChange={e => handleFilterChange('ruleFollowed', e.target.value)}
        >
          <option value="ALL">Rules: All</option>
          <option value="Yes">Rules: Followed</option>
          <option value="No">Rules: Violated</option>
          <option value="Partial">Rules: Partial</option>
        </select>

        {hasActiveFilters && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Action Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredCount}</strong> of <strong>{totalTrades}</strong> trades
        </span>

        <button 
          className="btn btn-primary"
          onClick={onAddTrade}
          style={{ padding: '0.45rem 0.85rem' }}
          title="Open modal to add a trade"
        >
          <Plus size={15} />
          <span>Add Trade</span>
        </button>

        <button 
          className="btn btn-secondary"
          onClick={onAddInlineRow}
          style={{ padding: '0.45rem 0.85rem' }}
          title="Directly insert an editable empty row into the Excel sheet"
        >
          <span>+ Quick Row</span>
        </button>

        {totalTrades > 0 && (
          <button 
            className="btn btn-danger btn-icon" 
            onClick={onClearTrades}
            title="Clear all trades from sheet"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Table, LineChart, BrainCircuit, Calendar } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, totalTrades, closedTradesCount }) {
  const tabs = [
    { id: 'sheet', label: 'Journal Sheet', icon: Table, count: totalTrades, key: '1' },
    { id: 'analytics', label: 'Analytics & Equity', icon: LineChart, count: closedTradesCount, key: '2' },
    { id: 'psychology', label: 'Psychology & Rules', icon: BrainCircuit, count: null, key: '3' },
    { id: 'calendar', label: 'Trading Calendar', icon: Calendar, count: null, key: '4' },
  ];

  return (
    <nav className="nav-tabs">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={`Switch to ${tab.label} [Hotkey: ${tab.key}]`}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="tab-badge">{tab.count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

import React from 'react';
import { LayoutDashboard, Table, LineChart, BrainCircuit, Calendar, Calculator } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, totalTrades, closedTradesCount }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null, key: '1' },
    { id: 'sheet', label: 'Journal Sheet', icon: Table, count: totalTrades, key: '2' },
    { id: 'analytics', label: 'Analytics & Equity', icon: LineChart, count: closedTradesCount, key: '3' },
    { id: 'psychology', label: 'Psychology & Rules', icon: BrainCircuit, count: null, key: '4' },
    { id: 'calendar', label: 'Trading Calendar', icon: Calendar, count: null, key: '5' },
    { id: 'calculator', label: 'Position Calculator', icon: Calculator, count: null, key: '6' },
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

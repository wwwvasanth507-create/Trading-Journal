import React from 'react';
import { Table, LineChart, BrainCircuit, Calendar, Calculator } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'sheet', label: 'Journal Sheet', icon: Table, count: null },
    { id: 'analytics', label: 'Analytics & Equity', icon: LineChart, count: null },
    { id: 'psychology', label: 'Psychology & Rules', icon: BrainCircuit, count: null },
    { id: 'calendar', label: 'Trading Calendar', icon: Calendar, count: null },
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
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

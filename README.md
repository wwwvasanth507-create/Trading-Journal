# 📈 APEX TRADING JOURNAL — Smart Sheet & Precision Risk Terminal

> **APEX Trading Journal** is a high-performance, professional trading terminal built with **React 19**, **Vite 8**, and **Vanilla CSS Glassmorphism**. Designed for Forex, Futures, Crypto, and Stock traders who demand precision trade logging, automatic risk management calculations, interactive equity curve analytics, trader psychology auditing, and seamless data backup/export capabilities.

---

## 🚀 Quick Start — Setup & Run Instructions

Follow these steps to run the application locally on your machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) and `npm` installed.

```bash
node -v
npm -v
```

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd Trading-Journal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   *The application will launch automatically at `http://localhost:5173` (or equivalent port).*

4. **Build for Production**:
   ```bash
   npm run build
   ```
   *Generates an optimized production bundle in the `dist/` folder.*

5. **Preview Production Build**:
   ```bash
   npm run preview
   ```

6. **Run Linter / Code Quality Check**:
   ```bash
   npm run lint
   ```

---

## 🔥 Key Features Overview

### 1. 📊 Excel-Style Smart Sheet (`TableGrid` & `TableToolbar`)
- **Excel-Style Frozen Columns**: Freeze `Trade#`, `Pair`, and `Direction` while scrolling horizontally across numeric metrics, setup notes, and screenshots.
- **⚡ Automatic Trade Math**: Typing `Entry Price`, `Stop Loss`, `Take Profit`, and `Risk %` automatically computes:
  - **Stop Loss Distance** (pips / points / price delta).
  - **Take Profit Distance**.
  - **Planned Risk-to-Reward Ratio (R:R)** (e.g. `1 : 3.00`).
  - **Recommended Position Lot Size** scaled to asset contract specifications.
- **🤖 Live Exit & Outcome Math**: Typing `Exit Price` automatically determines trade outcome (`WIN`, `LOSS`, `BE`), computes dollar `P&L`, and calculates realized R:R (`+3.0R` or `-1.0R`).
- **Inline Cell Editing & Quick Rows**: Edit any cell directly in the grid, or insert new empty rows with one click (`+ Quick Row`).
- **View Density Toggle**: Switch between **Standard Grid** and **Compact Grid** for dense data displays.

### 2. 🎯 Target Milestone & Account Overview Bar
- **Editable Starting Capital**: Click your starting account balance in the header to modify your baseline portfolio size.
- **Live Net P&L & Equity Badge**: Real-time total account equity and net P&L dollar calculations.
- **Target Equity Milestone Bar**: Set custom account target milestones (e.g. `$12,500`) with a visual progress bar and percentage tracker.

### 3. 📉 Interactive Equity Curve & Analytics Dashboard (`AnalyticsView`)
- **Cumulative Realized Equity Chart**: SVG growth curve tracking account equity over time with interactive point tooltips.
- **Outcome Distribution Bar**: Visual percentage breakdown of Wins, Losses, and Break-Even trades.
- **KPI Metrics Cards**:
  - **Net Realized P&L** ($)
  - **Win Rate** (%)
  - **Profit Factor** ($\text{Gross Profit} / \text{Gross Loss}$)
  - **Trade Expectancy** ($)
  - **Max Drawdown** ($ & % of capital)
- **Multi-Dimensional Leaderboards**: Win rate & P&L broken down by **Setup / Strategy**, **Market Session** (London, NY, Asian, Overlap), and **Asset Pair**.

### 4. 🧠 Trader Psychology & Discipline Audit (`PsychologyAuditView`)
- **Discipline Score Meter (0-100%)**: Evaluates rule compliance across all trades to rate trading plan adherence.
- **Plan vs Violation Comparison**: Side-by-side financial comparison showing exact dollar returns when rules are followed versus when rules are broken.
- **Execution Mistakes Leaderboard**: Tracks financial losses incurred by specific mistakes (`FOMO`, `Revenge Trading`, `Moved SL`, `Overleveraged`, `News Trading`).
- **Emotional State Matrix**: Evaluates performance by emotional mindset (`Disciplined`, `Confident`, `Calm`, `Anxious`, `Greedy`, `Frustrated`).

### 5. 📅 Interactive Trading Calendar (`TradingCalendarView`)
- Monthly calendar grid rendering green (profitable) and red (loss) trading days.
- Monthly statistics bar (Total P&L, Green vs Red Days, Total Trades executed).
- One-click day drilldown to inspect trades executed on a specific date.

### 6. 🧮 Position Size & Risk Calculator (`RiskCalculatorModal`)
- Dedicated position sizing calculator modal.
- Quick asset chips (`EURUSD`, `GBPUSD`, `XAUUSD`, `BTCUSD`, `NQ`, `ES`, `NVDA`).
- Computes exact position units/lots and dollar risk before order entry.
- Direct "Log Trade With These Values" button to transfer calculations into a new trade modal.

### 7. 💾 Data Persistence, Export & Full Backup
- **Automatic LocalStorage Synchronization**: All edits, balance changes, and target settings persist in browser storage.
- **Export to CSV**: Download trades formatted as an Excel-compatible CSV file.
- **JSON Full Backup & Restore**: Export entire journal configuration (trades, balance, milestone target) to JSON and restore anytime.
- **Demo Data Reset**: Instant reset button to populate realistic sample trades across Forex, Crypto, Futures, and Stocks.

---

## ⌨️ Global Keyboard Hotkeys

| Hotkey | Action |
| :--- | :--- |
| <kbd>N</kbd> | Open **New Trade** logging modal |
| <kbd>C</kbd> | Toggle **Position Size Calculator** modal |
| <kbd>1</kbd> | Switch to **Journal Sheet** tab |
| <kbd>2</kbd> | Switch to **Analytics & Equity** tab |
| <kbd>3</kbd> | Switch to **Psychology & Rules** tab |
| <kbd>4</kbd> | Switch to **Trading Calendar** tab |
| <kbd>?</kbd> | Show **Keyboard Shortcuts** helper overlay |
| <kbd>Esc</kbd> | Close any active modal or blur input fields |

---

## 🧮 Financial Calculations & Formula Definitions

The app enforces standardized institutional risk and outcome formulas:

### 1. Risk Amount ($)
$$\text{Dollar Risk} = \text{Account Balance} \times \left(\frac{\text{Risk Percentage}}{100}\right)$$

### 2. Stop Loss Distance ($\Delta P$)
$$\text{SL Distance} = |\text{Entry Price} - \text{Stop Loss Price}|$$

### 3. Position Lot Size
For Forex standard lots ($100,000$ units, $1\text{ pip} = 0.0001$):
$$\text{Lot Size} = \frac{\text{Dollar Risk}}{\text{SL Distance in Pips} \times \text{Pip Value per Lot}}$$

### 4. Planned Risk-to-Reward Ratio (R:R)
$$\text{Planned R:R} = \frac{|\text{Take Profit} - \text{Entry Price}|}{|\text{Entry Price} - \text{Stop Loss}|}$$

### 5. Realized Risk-to-Reward Ratio (R:R)
$$\text{Realized R:R} = \frac{\text{Realized Trade P\&L (\$)}}{\text{Dollar Risk (\$)}}$$

### 6. Profit Factor
$$\text{Profit Factor} = \frac{\sum \text{Gross Profits}}{\sum |\text{Gross Losses}|}$$

### 7. Trade Expectancy ($)
$$\text{Expectancy} = (\text{Win Rate} \times \text{Average Win}) - (\text{Loss Rate} \times \text{Average Loss})$$

---

## 🛠️ Project File Architecture

```
Trading-Journal/
├── index.html                   # Entry HTML with custom Google Fonts (Inter, Outfit, JetBrains Mono)
├── package.json                 # Core dependencies (React 19, Vite 8, Lucide React, Canvas Confetti)
├── vite.config.js               # Vite build settings & React SWC/Oxc plugin
├── README.md                    # Complete setup, features, and setup documentation
└── src/
    ├── main.jsx                 # React root renderer
    ├── App.jsx                  # Main app container, keyboard listener, tab router
    ├── index.css                # Slate Obsidian theme design tokens, glassmorphic utilities & keyframes
    ├── components/
    │   ├── Header.jsx           # Top brand header, equity target bar, JSON backup/export, balance editor
    │   ├── Navigation.jsx       # Tab switcher with trade count badges and hotkey tooltips
    │   ├── KeyboardShortcutsModal.jsx # Hotkeys helper overlay modal
    │   ├── Calculator/
    │   │   └── RiskCalculatorModal.jsx # Position sizing & risk calculator
    │   ├── Calendar/
    │   │   └── TradingCalendarView.jsx # Monthly trading calendar view with day drilldown
    │   ├── Dashboard/
    │   │   └── AnalyticsView.jsx     # KPI metrics, SVG equity curve, setup/pair/session leaderboards
    │   ├── ExcelSheet/
    │   │   ├── TableGrid.jsx         # Excel smart sheet with frozen columns, inline editing & math
    │   │   ├── TableToolbar.jsx      # Search box, quick filter chips, session filters, density toggle
    │   │   ├── TradeModal.jsx        # Full trade creation modal with asset presets & risk warnings
    │   │   └── ImageModal.jsx        # Chart screenshot zoom lightbox
    │   └── Psychology/
    │       └── PsychologyAuditView.jsx # Discipline score rating meter & mistake cost analysis
    └── utils/
        ├── calculations.js       # Core trade math functions (SL/TP, Lot Size, P&L, R:R)
        ├── exportImport.js       # CSV exporter/parser & full JSON backup handler
        ├── sampleData.js         # Realistic demo trades, assets presets, session options
        └── storage.js            # LocalStorage persistence & reset helpers
```

---

## 📄 License

This project is open source and available under the **MIT License**.

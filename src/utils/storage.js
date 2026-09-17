import { SAMPLE_TRADES, INITIAL_ACCOUNT_BALANCE } from './sampleData';
import { autoCalculateTrade } from './calculations';

const STORAGE_KEYS = {
  TRADES: 'trading_journal_trades_v1',
  BALANCE: 'trading_journal_balance_v1',
  SETTINGS: 'trading_journal_settings_v1'
};

export function loadTrades() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRADES);
    if (!raw) {
      saveTrades(SAMPLE_TRADES);
      return SAMPLE_TRADES;
    }
    const trades = JSON.parse(raw);
    return Array.isArray(trades) ? trades : SAMPLE_TRADES;
  } catch (err) {
    console.error('Failed to load trades from storage', err);
    return SAMPLE_TRADES;
  }
}

export function saveTrades(trades) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  } catch (err) {
    console.error('Failed to save trades to storage', err);
  }
}

export function loadAccountBalance() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BALANCE);
    if (!raw) return INITIAL_ACCOUNT_BALANCE;
    const val = parseFloat(raw);
    return isNaN(val) || val <= 0 ? INITIAL_ACCOUNT_BALANCE : val;
  } catch {
    return INITIAL_ACCOUNT_BALANCE;
  }
}

export function saveAccountBalance(balance) {
  try {
    localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
  } catch (err) {
    console.error('Failed to save balance to storage', err);
  }
}

export function resetToDemoData() {
  saveTrades(SAMPLE_TRADES);
  saveAccountBalance(INITIAL_ACCOUNT_BALANCE);
  return { trades: SAMPLE_TRADES, balance: INITIAL_ACCOUNT_BALANCE };
}

export function clearAllTrades() {
  saveTrades([]);
  return [];
}

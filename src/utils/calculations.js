/**
 * Trading Journal Auto-Calculation Engine
 * Handles bi-directional math for:
 * - SL Distance & TP Distance (Direction-aware)
 * - Planned R:R
 * - Risk Amount ($) from Risk % and Account Balance
 * - Lot Size / Position Sizing (Forex, Crypto, Stocks, Commodities)
 * - Realized P&L ($)
 * - Realized R:R
 * - Result (WIN, LOSS, BE, OPEN)
 */

// Asset multipliers
export const ASSET_MULTIPLIERS = {
  FOREX_STANDARD: 100000, // 1 Lot = 100,000 units (~$10/pip on USD quotes)
  FOREX_JPY: 1000,        // JPY pairs (0.01 pip)
  GOLD: 100,              // 1 Lot XAUUSD = 100 oz ($10 per $0.10 move)
  CRYPTO: 1,              // 1 Lot = 1 Coin (e.g. 1 BTC, 1 ETH)
  STOCKS: 1,              // 1 Lot = 1 Share
  INDICES: 1,             // 1 Contract
};

/**
 * Determine default contract multiplier based on pair name
 */
export function getMultiplierForPair(pair = '') {
  const p = pair.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (p.includes('XAU') || p.includes('GOLD')) return ASSET_MULTIPLIERS.GOLD;
  if (p.endsWith('JPY')) return 100; // Special forex pip scaling
  if (p.includes('BTC') || p.includes('ETH') || p.includes('SOL') || p.includes('USDT')) return ASSET_MULTIPLIERS.CRYPTO;
  if (['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF'].some(f => p.includes(f))) return 1; // Direct price delta for unit calculations
  return 1;
}

/**
 * Calculate Stop Loss Distance
 * BUY: Entry - SL
 * SELL: SL - Entry
 */
export function calculateSLDistance(direction, entryPrice, stopLoss) {
  const entry = parseFloat(entryPrice);
  const sl = parseFloat(stopLoss);
  if (isNaN(entry) || isNaN(sl) || entry <= 0 || sl <= 0) return 0;

  if (direction === 'BUY') {
    return Math.max(0, entry - sl);
  } else {
    return Math.max(0, sl - entry);
  }
}

/**
 * Calculate Take Profit Distance
 * BUY: TP - Entry
 * SELL: Entry - TP
 */
export function calculateTPDistance(direction, entryPrice, takeProfit) {
  const entry = parseFloat(entryPrice);
  const tp = parseFloat(takeProfit);
  if (isNaN(entry) || isNaN(tp) || entry <= 0 || tp <= 0) return 0;

  if (direction === 'BUY') {
    return Math.max(0, tp - entry);
  } else {
    return Math.max(0, entry - tp);
  }
}

/**
 * Calculate Planned Risk-to-Reward (R:R)
 * Planned R:R = TP Distance / SL Distance
 */
export function calculatePlannedRR(direction, entryPrice, stopLoss, takeProfit) {
  const slDist = calculateSLDistance(direction, entryPrice, stopLoss);
  const tpDist = calculateTPDistance(direction, entryPrice, takeProfit);

  if (slDist <= 0 || tpDist <= 0) return null;
  const ratio = tpDist / slDist;
  return parseFloat(ratio.toFixed(2));
}

/**
 * Calculate Dollar Risk from Account Balance and Risk %
 */
export function calculateRiskAmount(accountBalance, riskPercent) {
  const balance = parseFloat(accountBalance) || 0;
  const riskPct = parseFloat(riskPercent) || 0;
  if (balance <= 0 || riskPct <= 0) return 0;
  return parseFloat(((balance * riskPct) / 100).toFixed(2));
}

/**
 * Auto-Calculate Lot Size / Position Size
 * Position Size = Risk $ / (SL Distance * Multiplier)
 */
export function calculateLotSize(accountBalance, riskPercent, direction, entryPrice, stopLoss, pair = '') {
  const riskAmount = calculateRiskAmount(accountBalance, riskPercent);
  const slDist = calculateSLDistance(direction, entryPrice, stopLoss);

  if (riskAmount <= 0 || slDist <= 0) return 0;

  const multiplier = getMultiplierForPair(pair);
  const rawLot = riskAmount / (slDist * multiplier);

  // Round sensibly: 2 decimals for standard lot sizing
  if (rawLot >= 100) return Math.round(rawLot);
  if (rawLot >= 1) return parseFloat(rawLot.toFixed(2));
  return parseFloat(rawLot.toFixed(3));
}

/**
 * Auto-Calculate Risk % if user modifies Lot Size directly
 */
export function calculateRiskPercentFromLots(accountBalance, lotSize, direction, entryPrice, stopLoss, pair = '') {
  const balance = parseFloat(accountBalance) || 0;
  const lots = parseFloat(lotSize) || 0;
  const slDist = calculateSLDistance(direction, entryPrice, stopLoss);

  if (balance <= 0 || lots <= 0 || slDist <= 0) return 0;
  const multiplier = getMultiplierForPair(pair);
  const riskAmount = lots * slDist * multiplier;
  const riskPct = (riskAmount / balance) * 100;
  return parseFloat(riskPct.toFixed(2));
}

/**
 * Calculate Realized P&L ($)
 * BUY: (Exit - Entry) * Lot Size * Multiplier
 * SELL: (Entry - Exit) * Lot Size * Multiplier
 */
export function calculatePnL(direction, entryPrice, exitPrice, lotSize, pair = '') {
  const entry = parseFloat(entryPrice);
  const exit = parseFloat(exitPrice);
  const lots = parseFloat(lotSize);

  if (isNaN(entry) || isNaN(exit) || isNaN(lots) || entry <= 0 || exit <= 0 || lots <= 0) {
    return null;
  }

  const multiplier = getMultiplierForPair(pair);
  let priceDiff = 0;

  if (direction === 'BUY') {
    priceDiff = exit - entry;
  } else {
    priceDiff = entry - exit;
  }

  const pnl = priceDiff * lots * multiplier;
  return parseFloat(pnl.toFixed(2));
}

/**
 * Calculate Realized R:R
 * Realized R:R = Realized P&L / Risk $
 */
export function calculateRealizedRR(pnl, riskAmount, direction, entryPrice, stopLoss, exitPrice) {
  const pnlVal = parseFloat(pnl);
  const riskVal = parseFloat(riskAmount);

  if (!isNaN(pnlVal) && !isNaN(riskVal) && riskVal > 0) {
    const rr = pnlVal / riskVal;
    return parseFloat(rr.toFixed(2));
  }

  // Fallback if risk amount is not provided: calculate from price movement
  const slDist = calculateSLDistance(direction, entryPrice, stopLoss);
  const entry = parseFloat(entryPrice);
  const exit = parseFloat(exitPrice);

  if (slDist > 0 && !isNaN(entry) && !isNaN(exit)) {
    const priceDiff = direction === 'BUY' ? (exit - entry) : (entry - exit);
    return parseFloat((priceDiff / slDist).toFixed(2));
  }

  return null;
}

/**
 * Determine Result: WIN, LOSS, BE, or OPEN
 */
export function calculateResult(exitPrice, pnl) {
  if (exitPrice === '' || exitPrice === null || exitPrice === undefined) {
    return 'OPEN';
  }

  const pnlVal = parseFloat(pnl);
  if (isNaN(pnlVal)) return 'OPEN';

  if (pnlVal > 0.01) return 'WIN';
  if (pnlVal < -0.01) return 'LOSS';
  return 'BE'; // Break Even
}

/**
 * Comprehensive Recalculate Trade
 * Takes partial or complete trade data + account balance, returns complete updated trade with auto-calculated fields
 */
export function autoCalculateTrade(trade, accountBalance = 10000) {
  const updated = { ...trade };

  const direction = (updated.direction || 'BUY').toUpperCase();
  updated.direction = direction;

  // Calculate Risk $
  const riskAmount = calculateRiskAmount(accountBalance, updated.riskPercent);

  // If entry and SL exist:
  const slDist = calculateSLDistance(direction, updated.entryPrice, updated.stopLoss);
  const tpDist = calculateTPDistance(direction, updated.entryPrice, updated.takeProfit);

  // Auto calculate lot size if missing or if riskPercent is given and lotSize is not manually locked
  if (riskAmount > 0 && slDist > 0 && (!updated.lotSize || updated.autoCalcLot !== false)) {
    updated.lotSize = calculateLotSize(accountBalance, updated.riskPercent, direction, updated.entryPrice, updated.stopLoss, updated.pair);
  }

  // Planned R:R
  if (slDist > 0 && tpDist > 0) {
    updated.plannedRR = calculatePlannedRR(direction, updated.entryPrice, updated.stopLoss, updated.takeProfit);
  } else {
    updated.plannedRR = null;
  }

  // If Exit Price is provided, calculate P&L, Realized R:R, Result
  if (updated.exitPrice !== '' && updated.exitPrice !== null && updated.exitPrice !== undefined) {
    // If P&L is not manually overridden:
    if (updated.autoCalcPnL !== false || updated.pnl === undefined || updated.pnl === null || updated.pnl === '') {
      const calculatedPnl = calculatePnL(direction, updated.entryPrice, updated.exitPrice, updated.lotSize, updated.pair);
      if (calculatedPnl !== null) {
        updated.pnl = calculatedPnl;
      }
    }

    // Realized R:R
    updated.realizedRR = calculateRealizedRR(updated.pnl, riskAmount, direction, updated.entryPrice, updated.stopLoss, updated.exitPrice);

    // Result
    updated.result = calculateResult(updated.exitPrice, updated.pnl);
  } else {
    updated.result = 'OPEN';
    updated.realizedRR = null;
    if (updated.autoCalcPnL !== false) {
      updated.pnl = null;
    }
  }

  return updated;
}

/**
 * Calculate Milestone Target Progress
 * NOTE: The milestone target is strictly a standalone goal amount (e.g. $500).
 * Starting capital (e.g. $5,000) is NEVER added to the milestone target.
 * Progress is measured purely as Net Realized P&L against the milestone target.
 *
 * @param {number} netPnL - Realized Net P&L (e.g. $300)
 * @param {number} milestoneTarget - The milestone/target amount (e.g. $500)
 * @returns {{ targetAmount: number, progressPercent: number, remaining: number, isAchieved: boolean }}
 */
export function calculateMilestoneProgress(netPnL, milestoneTarget) {
  const pnl = parseFloat(netPnL) || 0;
  const target = parseFloat(milestoneTarget) || 0;

  if (target <= 0) {
    return {
      targetAmount: 0,
      progressPercent: 0,
      remaining: 0,
      isAchieved: false
    };
  }

  // Progress percentage (0% to 100% for progress bars, can exceed 100% conceptually)
  const rawPercent = (pnl / target) * 100;
  const progressPercent = parseFloat(Math.min(100, Math.max(0, rawPercent)).toFixed(1));
  const remaining = Math.max(0, parseFloat((target - pnl).toFixed(2)));
  const isAchieved = pnl >= target;

  return {
    targetAmount: target,
    progressPercent,
    remaining,
    isAchieved
  };
}

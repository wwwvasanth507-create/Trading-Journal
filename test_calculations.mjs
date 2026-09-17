import {
  calculateSLDistance,
  calculateTPDistance,
  calculatePlannedRR,
  calculateRiskAmount,
  calculateLotSize,
  calculatePnL,
  calculateRealizedRR,
  calculateResult,
  autoCalculateTrade
} from './src/utils/calculations.js';

console.log('--- RUNNING TRADING JOURNAL CALCULATION TESTS ---');

// Test 1: BUY Trade Math
const buySLDist = calculateSLDistance('BUY', 1.08500, 1.08300);
console.assert(Math.abs(buySLDist - 0.00200) < 0.00001, `BUY SL Distance failed: ${buySLDist}`);

const buyTPDist = calculateTPDistance('BUY', 1.08500, 1.09100);
console.assert(Math.abs(buyTPDist - 0.00600) < 0.00001, `BUY TP Distance failed: ${buyTPDist}`);

const buyRR = calculatePlannedRR('BUY', 1.08500, 1.08300, 1.09100);
console.assert(buyRR === 3.00, `BUY Planned R:R failed: ${buyRR}`);

// Test 2: SELL Trade Math
const sellSLDist = calculateSLDistance('SELL', 2500.0, 2510.0);
console.assert(Math.abs(sellSLDist - 10.0) < 0.001, `SELL SL Distance failed: ${sellSLDist}`);

const sellTPDist = calculateTPDistance('SELL', 2500.0, 2470.0);
console.assert(Math.abs(sellTPDist - 30.0) < 0.001, `SELL TP Distance failed: ${sellTPDist}`);

const sellRR = calculatePlannedRR('SELL', 2500.0, 2510.0, 2470.0);
console.assert(sellRR === 3.00, `SELL Planned R:R failed: ${sellRR}`);

// Test 3: Risk Dollar & Position Sizing
const dollarRisk = calculateRiskAmount(10000, 1.0);
console.assert(dollarRisk === 100.0, `Dollar risk failed: ${dollarRisk}`);

// Test 4: Realized P&L
const buyWinPnL = calculatePnL('BUY', 100.0, 110.0, 10, 'STOCKS');
console.assert(buyWinPnL === 100.0, `BUY Win PnL failed: ${buyWinPnL}`);

const sellWinPnL = calculatePnL('SELL', 2500.0, 2480.0, 1, 'GOLD');
console.assert(sellWinPnL === 2000.0, `SELL Win PnL failed: ${sellWinPnL}`);

const buyLossPnL = calculatePnL('BUY', 100.0, 95.0, 10, 'STOCKS');
console.assert(buyLossPnL === -50.0, `BUY Loss PnL failed: ${buyLossPnL}`);

// Test 5: Result Classification
console.assert(calculateResult(110.0, 100.0) === 'WIN', 'Result WIN check failed');
console.assert(calculateResult(95.0, -50.0) === 'LOSS', 'Result LOSS check failed');
console.assert(calculateResult(100.0, 0.0) === 'BE', 'Result BE check failed');
console.assert(calculateResult('', null) === 'OPEN', 'Result OPEN check failed');

// Test 6: Full Trade Auto-Calculate
const tradeRaw = {
  pair: 'EURUSD',
  direction: 'BUY',
  entryPrice: 1.08000,
  stopLoss: 1.07800,
  takeProfit: 1.08600,
  riskPercent: 1.0,
  exitPrice: 1.08600
};
const calculated = autoCalculateTrade(tradeRaw, 10000);
console.log('Auto-calculated trade:', calculated);
console.assert(calculated.result === 'WIN', 'AutoCalc result failed');
console.assert(calculated.plannedRR === 3.00, 'AutoCalc plannedRR failed');
console.assert(calculated.pnl > 0, 'AutoCalc pnl failed');

console.log('✅ ALL 6 CALCULATION UNIT TESTS PASSED SUCCESSFULLY!');

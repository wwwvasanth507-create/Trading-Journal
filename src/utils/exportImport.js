/**
 * Export and Import Utilities for Trading Journal
 * Supports CSV export/import and full JSON backup/restore
 */

export const HEADINGS = [
  'Trade#',
  'Date',
  'Time',
  'Session',
  'Pair',
  'Direction',
  'Setup',
  'Time Frame',
  'Entry Price',
  'Stop Loss',
  'Take Profit',
  'Risk %',
  'Lot Size',
  'Exit Price',
  'Result',
  'P&L($)',
  'R:R',
  'Rule followed?',
  'Mistake',
  'Emotion',
  'Screenshot',
  'Lesson'
];

/**
 * Format trade list as CSV string with proper escaping
 */
export function exportTradesToCSV(trades) {
  const headerRow = HEADINGS.join(',');
  const rows = trades.map((t, idx) => {
    const tradeNum = t.tradeNum || idx + 1;
    const date = t.date || '';
    const time = t.time || '';
    const session = t.session || 'London';
    const pair = t.pair || '';
    const direction = t.direction || 'BUY';
    const setup = `"${(t.setup || '').replace(/"/g, '""')}"`;
    const timeFrame = t.timeFrame || '';
    const entryPrice = t.entryPrice ?? '';
    const stopLoss = t.stopLoss ?? '';
    const takeProfit = t.takeProfit ?? '';
    const riskPercent = t.riskPercent !== undefined ? `${t.riskPercent}%` : '';
    const lotSize = t.lotSize ?? '';
    const exitPrice = t.exitPrice ?? '';
    const result = t.result || 'OPEN';
    const pnl = t.pnl !== null && t.pnl !== undefined ? t.pnl : '';
    const rr = t.plannedRR ? `1:${t.plannedRR}` : '';
    const ruleFollowed = t.ruleFollowed || 'Yes';
    const mistake = `"${(t.mistake || 'None').replace(/"/g, '""')}"`;
    const emotion = t.emotion || 'Disciplined';
    const screenshot = t.screenshot ? (t.screenshot.startsWith('data:') ? '[Chart Image Attached]' : t.screenshot) : '';
    const lesson = `"${(t.lesson || '').replace(/"/g, '""')}"`;

    return [
      tradeNum,
      date,
      time,
      session,
      pair,
      direction,
      setup,
      timeFrame,
      entryPrice,
      stopLoss,
      takeProfit,
      riskPercent,
      lotSize,
      exitPrice,
      result,
      pnl,
      rr,
      ruleFollowed,
      mistake,
      emotion,
      screenshot,
      lesson
    ].join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Export full journal configuration (trades + account settings) to JSON
 */
export function exportJournalToJSON(trades, accountBalance, milestoneTarget) {
  const target = milestoneTarget || 500;
  const data = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    accountBalance,
    milestoneTarget: target,
    equityTarget: target, // backward compatibility alias for legacy backups
    tradesCount: trades.length,
    trades
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Trigger browser file download
 */
export function downloadFile(content, fileName, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV text into trade objects
 */
export function parseCSVToTrades(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const parseRow = (text) => {
    const re = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\/]*(?:\s+[^,'"\s\\/]+)*))\s*(?:,|$)/g;
    const a = [];
    text.replace(re, (m0, m1, m2, m3) => {
      if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
      else if (m3 !== undefined) a.push(m3);
      return '';
    });
    return a;
  };

  const parsedTrades = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (!cols || cols.length < 4) continue;

    parsedTrades.push({
      id: 't-imp-' + Date.now() + '-' + i,
      tradeNum: parseInt(cols[0], 10) || i,
      date: cols[1] || new Date().toISOString().split('T')[0],
      time: cols[2] || '09:00',
      session: cols[3] || 'London',
      pair: cols[4] || cols[3] || 'UNKNOWN',
      direction: (cols[5] || cols[4] || 'BUY').toUpperCase(),
      setup: cols[6] || cols[5] || 'General',
      timeFrame: cols[7] || cols[6] || '15m',
      entryPrice: parseFloat(cols[8] || cols[7]) || 0,
      stopLoss: parseFloat(cols[9] || cols[8]) || 0,
      takeProfit: parseFloat(cols[10] || cols[9]) || 0,
      riskPercent: parseFloat((cols[11] || cols[10] || '1').replace('%', '')) || 1,
      lotSize: parseFloat(cols[12] || cols[11]) || 0.1,
      exitPrice: cols[13] || cols[12] ? parseFloat(cols[13] || cols[12]) : '',
      result: cols[14] || cols[13] || 'OPEN',
      pnl: cols[15] || cols[14] ? parseFloat(cols[15] || cols[14]) : null,
      plannedRR: parseFloat((cols[16] || cols[15] || '').replace('1:', '')) || null,
      ruleFollowed: cols[17] || cols[16] || 'Yes',
      mistake: cols[18] || cols[17] || 'None',
      emotion: cols[19] || cols[18] || 'Disciplined',
      screenshot: cols[20] && !cols[20].includes('[Chart') ? cols[20] : '',
      lesson: cols[21] || cols[20] || ''
    });
  }

  return parsedTrades;
}

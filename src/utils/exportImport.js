/**
 * Export and Import Utilities for Trading Journal
 * Supports CSV export/import and full JSON backup
 */

export const HEADINGS = [
  'Trade#',
  'Date',
  'Time',
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
    // Screenshot: if data URI, write [Image Attached] to keep CSV clean, or URL
    const screenshot = t.screenshot ? (t.screenshot.startsWith('data:') ? '[Chart Image Attached]' : t.screenshot) : '';
    const lesson = `"${(t.lesson || '').replace(/"/g, '""')}"`;

    return [
      tradeNum,
      date,
      time,
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

  // Parse rows with quote handling
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
      pair: cols[3] || 'UNKNOWN',
      direction: (cols[4] || 'BUY').toUpperCase(),
      setup: cols[5] || 'General',
      timeFrame: cols[6] || '15m',
      entryPrice: parseFloat(cols[7]) || 0,
      stopLoss: parseFloat(cols[8]) || 0,
      takeProfit: parseFloat(cols[9]) || 0,
      riskPercent: parseFloat((cols[10] || '1').replace('%', '')) || 1,
      lotSize: parseFloat(cols[11]) || 0.1,
      exitPrice: cols[12] ? parseFloat(cols[12]) : '',
      result: cols[13] || 'OPEN',
      pnl: cols[14] ? parseFloat(cols[14]) : null,
      plannedRR: parseFloat((cols[15] || '').replace('1:', '')) || null,
      ruleFollowed: cols[16] || 'Yes',
      mistake: cols[17] || 'None',
      emotion: cols[18] || 'Disciplined',
      screenshot: cols[19] && !cols[19].includes('[Chart') ? cols[19] : '',
      lesson: cols[20] || ''
    });
  }

  return parsedTrades;
}

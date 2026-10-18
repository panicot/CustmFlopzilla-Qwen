import { Card, AnalysisResult, CategoryResult, HandCategory, RANKS } from './types';
import { getCardCombos, RangeCombo } from './rangeParser';
import { evaluateHand } from './evaluator';

const ALL_CATEGORIES: HandCategory[] = [
  'Royal Flush',
  'Straight Flush',
  'Quads',
  'Full House',
  'Flush',
  'Straight',
  'Trips',
  'Two Pair',
  'Top Pair',
  'Second Pair',
  'Third Pair',
  'Bottom Pair',
  'Overpair',
  'High Card (Ace High)',
  'High Card (Other)',
];

export function analyzeRange(
  selectedCells: Set<string>, // "row-col" format
  boardCards: Card[]
): AnalysisResult {
  const categoryCounts: Record<HandCategory, number> = {} as Record<HandCategory, number>;
  for (const cat of ALL_CATEGORIES) {
    categoryCounts[cat] = 0;
  }
  
  let totalCombos = 0;
  let validCombos = 0;
  let excludedCombos = 0;
  
  // Iterate through all selected cells
  for (const cellKey of selectedCells) {
    const [rowStr, colStr] = cellKey.split('-');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    
    // Get all combos for this cell, filtered by board
    const combos = getCardCombos(row, col, boardCards);
    validCombos += combos.length;
    
    // Evaluate each combo
    for (const combo of combos) {
      const result = evaluateHand([combo.card1, combo.card2], boardCards);
      categoryCounts[result.category]++;
      totalCombos++;
    }
  }
  
  // Calculate excluded combos (total possible - valid)
  const totalPossible = getTotalPossibleCombos(selectedCells);
  excludedCombos = totalPossible - validCombos;
  
  // Build results
  const categories: CategoryResult[] = ALL_CATEGORIES
    .map(cat => ({
      category: cat,
      combos: categoryCounts[cat],
      percentage: totalCombos > 0 ? (categoryCounts[cat] / totalCombos) * 100 : 0,
    }))
    .filter(cat => cat.combos > 0)
    .sort((a, b) => getCategoryOrder(b.category) - getCategoryOrder(a.category));
  
  return {
    totalCombos,
    validCombos,
    excludedCombos,
    categories,
  };
}

function getTotalPossibleCombos(selectedCells: Set<string>): number {
  let total = 0;
  for (const cellKey of selectedCells) {
    const [rowStr, colStr] = cellKey.split('-');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    if (row === col) total += 6;
    else if (row < col) total += 4;
    else total += 12;
  }
  return total;
}

function getCategoryOrder(category: HandCategory): number {
  const order: Record<HandCategory, number> = {
    'Royal Flush': 100,
    'Straight Flush': 99,
    'Quads': 90,
    'Full House': 80,
    'Flush': 70,
    'Straight': 60,
    'Trips': 50,
    'Two Pair': 40,
    'Top Pair': 30,
    'Second Pair': 28,
    'Third Pair': 26,
    'Bottom Pair': 24,
    'Overpair': 32,
    'High Card (Ace High)': 10,
    'High Card (Other)': 5,
  };
  return order[category];
}

export function getCategoryColor(category: HandCategory): string {
  const colors: Record<HandCategory, string> = {
    'Royal Flush': '#fbbf24',
    'Straight Flush': '#f59e0b',
    'Quads': '#ef4444',
    'Full House': '#f97316',
    'Flush': '#3b82f6',
    'Straight': '#8b5cf6',
    'Trips': '#ec4899',
    'Two Pair': '#14b8a6',
    'Top Pair': '#22c55e',
    'Second Pair': '#4ade80',
    'Third Pair': '#86efac',
    'Bottom Pair': '#bbf7d0',
    'Overpair': '#a3e635',
    'High Card (Ace High)': '#94a3b8',
    'High Card (Other)': '#64748b',
  };
  return colors[category];
}

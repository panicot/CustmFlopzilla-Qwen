import { Card, Rank, Suit, RANKS, SUITS } from './types';
import { createDeck } from './deck';

export interface RangeCombo {
  card1: Card;
  card2: Card;
  label: string; // e.g., "AKs"
}

// Get all combos for a given cell in the range grid
export function getCombosForCell(row: number, col: number): { label: string; type: 'pair' | 'suited' | 'offsuit' } {
  const rank1 = RANKS[row];
  const rank2 = RANKS[col];
  
  if (row === col) {
    return { label: `${rank1}${rank2}`, type: 'pair' };
  } else if (row < col) {
    return { label: `${rank1}${rank2}s`, type: 'suited' };
  } else {
    return { label: `${rank2}${rank1}o`, type: 'offsuit' };
  }
}

// Generate all specific card combinations for a range cell
export function getCardCombos(row: number, col: number, boardCards: Card[]): RangeCombo[] {
  const rank1 = RANKS[row];
  const rank2 = RANKS[col];
  const combos: RangeCombo[] = [];
  const boardSet = new Set(boardCards.map(c => `${c.rank}${c.suit}`));
  
  if (row === col) {
    // Pair: all combinations of 2 cards of same rank with different suits
    const suitCombos = getSuitPairs();
    for (const [s1, s2] of suitCombos) {
      const c1: Card = { rank: rank1, suit: s1 };
      const c2: Card = { rank: rank2, suit: s2 };
      if (!boardSet.has(`${c1.rank}${c1.suit}`) && !boardSet.has(`${c2.rank}${c2.suit}`)) {
        combos.push({ card1: c1, card2: c2, label: `${rank1}${rank2}` });
      }
    }
  } else if (row < col) {
    // Suited: same suit combinations
    for (const suit of SUITS) {
      const c1: Card = { rank: rank1, suit };
      const c2: Card = { rank: rank2, suit };
      if (!boardSet.has(`${c1.rank}${c1.suit}`) && !boardSet.has(`${c2.rank}${c2.suit}`)) {
        combos.push({ card1: c1, card2: c2, label: `${rank1}${rank2}s` });
      }
    }
  } else {
    // Offsuit: different suit combinations
    for (const s1 of SUITS) {
      for (const s2 of SUITS) {
        if (s1 === s2) continue;
        const c1: Card = { rank: rank1, suit: s1 };
        const c2: Card = { rank: rank2, suit: s2 };
        if (!boardSet.has(`${c1.rank}${c1.suit}`) && !boardSet.has(`${c2.rank}${c2.suit}`)) {
          combos.push({ card1: c1, card2: c2, label: `${rank2}${rank1}o` });
        }
      }
    }
  }
  
  return combos;
}

function getSuitPairs(): [Suit, Suit][] {
  const suits: Suit[] = ['s', 'h', 'd', 'c'];
  const pairs: [Suit, Suit][] = [];
  for (let i = 0; i < suits.length; i++) {
    for (let j = i + 1; j < suits.length; j++) {
      pairs.push([suits[i], suits[j]]);
    }
  }
  return pairs;
}

// Count total combos for a cell (without board filtering)
export function getComboCount(row: number, col: number): number {
  if (row === col) return 6; // pairs: C(4,2) = 6
  if (row < col) return 4; // suited: 4 suits
  return 12; // offsuit: 4*3 = 12
}

// Count excluded combos due to board cards
export function getExcludedComboCount(row: number, col: number, boardCards: Card[]): number {
  const total = getComboCount(row, col);
  const rank1 = RANKS[row];
  const rank2 = RANKS[col];
  
  const boardRanks = boardCards.map(c => c.rank);
  const boardSuits = boardCards.map(c => c.suit);
  
  if (row === col) {
    // Pair: check how many cards of this rank are on the board
    const cardsOnBoard = boardRanks.filter(r => r === rank1).length;
    if (cardsOnBoard >= 2) return 6; // all combos excluded
    if (cardsOnBoard === 1) return 3; // 3 combos excluded (those containing the board card)
    return 0;
  } else if (row < col) {
    // Suited: check if specific suited combos are blocked
    let excluded = 0;
    for (const suit of SUITS) {
      const hasRank1 = boardCards.some(c => c.rank === rank1 && c.suit === suit);
      const hasRank2 = boardCards.some(c => c.rank === rank2 && c.suit === suit);
      if (hasRank1 || hasRank2) excluded++;
    }
    return excluded;
  } else {
    // Offsuit: more complex
    let excluded = 0;
    for (const s1 of SUITS) {
      for (const s2 of SUITS) {
        if (s1 === s2) continue;
        const hasC1 = boardCards.some(c => c.rank === rank1 && c.suit === s1);
        const hasC2 = boardCards.some(c => c.rank === rank2 && c.suit === s2);
        if (hasC1 || hasC2) excluded++;
      }
    }
    return excluded;
  }
}

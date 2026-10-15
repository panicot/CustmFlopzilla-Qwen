import { RANKS, Suit, SUITS } from './types';

// Parse range notation like "AA+, AKs+, KQo" into grid cell keys
export function parseRangeNotation(notation: string): Set<string> {
  const cells = new Set<string>();
  const parts = notation.split(/[,;\s]+/).filter(p => p.length > 0);
  
  for (const part of parts) {
    const parsed = parseSingleNotation(part.trim());
    parsed.forEach(key => cells.add(key));
  }
  
  return cells;
}

function parseSingleNotation(notation: string): Set<string> {
  const cells = new Set<string>();
  
  // Check for "+" suffix (means "and better")
  const hasPlus = notation.endsWith('+');
  const base = hasPlus ? notation.slice(0, -1) : notation;
  
  // Determine type: pair, suited, offsuit
  const isSuited = base.endsWith('s') && base.length >= 3;
  const isOffsuit = base.endsWith('o') && base.length >= 3;
  const isPair = base.length === 2 && base[0] === base[1];
  
  if (isPair) {
    // Pair notation: AA, KK, QQ, etc.
    const rank = base[0].toUpperCase();
    const rankIdx = RANKS.indexOf(rank as any);
    if (rankIdx === -1) return cells;
    
    if (hasPlus) {
      // AA+ means AA, KK, QQ, JJ, TT, 99, ... (all pairs from AA down to 22)
      for (let i = 0; i <= rankIdx; i++) {
        cells.add(`${i}-${i}`);
      }
    } else {
      cells.add(`${rankIdx}-${rankIdx}`);
    }
  } else if (isSuited) {
    // Suited notation: AKs, KQs, etc.
    const rank1 = base[0].toUpperCase();
    const rank2 = base[1].toUpperCase();
    const idx1 = RANKS.indexOf(rank1 as any);
    const idx2 = RANKS.indexOf(rank2 as any);
    if (idx1 === -1 || idx2 === -1) return cells;
    
    // Suited is in upper triangle (row < col), so smaller index is row
    const row = Math.min(idx1, idx2);
    const col = Math.max(idx1, idx2);
    
    if (hasPlus) {
      // AKs+ means all suited hands from AK down to the gap
      // This means: AKs, AQs, AJs, ATs, ... (keeping the higher card fixed)
      const highRow = row; // higher card (lower index = higher rank)
      for (let c = highRow + 1; c <= col; c++) {
        cells.add(`${highRow}-${c}`);
      }
      // Also include hands where the gap is same or smaller
      // AKs+ typically means AKs, AQs, AJs, ATs, A9s, A8s, A7s, A6s, A5s, A4s, A3s, A2s
      // i.e., all suited aces if high card is Ace
      if (highRow === 0) {
        for (let c = 1; c < 13; c++) {
          cells.add(`0-${c}`);
        }
      }
    } else {
      cells.add(`${row}-${col}`);
    }
  } else if (isOffsuit) {
    // Offsuit notation: AKo, KQo, etc.
    const rank1 = base[0].toUpperCase();
    const rank2 = base[1].toUpperCase();
    const idx1 = RANKS.indexOf(rank1 as any);
    const idx2 = RANKS.indexOf(rank2 as any);
    if (idx1 === -1 || idx2 === -1) return cells;
    
    // Offsuit is in lower triangle (row > col)
    const highIdx = Math.min(idx1, idx2); // higher rank = lower index
    const lowIdx = Math.max(idx1, idx2);
    
    if (hasPlus) {
      // AKo+ means AKo, AQo, AJo, ATs... (all offsuit with same high card, down to the gap)
      // Typically: all offsuit with the high card and any kicker >= the specified kicker
      for (let r = highIdx + 1; r <= lowIdx; r++) {
        cells.add(`${r}-${highIdx}`);
      }
      // If high card is Ace, include all offsuit aces
      if (highIdx === 0) {
        for (let r = 1; r < 13; r++) {
          cells.add(`${r}-0`);
        }
      }
    } else {
      cells.add(`${lowIdx}-${highIdx}`);
    }
  }
  
  return cells;
}

// Convert cell keys back to notation string
export function cellsToNotation(cells: Set<string>): string {
  if (cells.size === 0) return '';
  
  const pairs: string[] = [];
  const suited: string[] = [];
  const offsuit: string[] = [];
  
  for (const key of cells) {
    const [rowStr, colStr] = key.split('-');
    const row = parseInt(rowStr);
    const col = parseInt(colStr);
    
    if (row === col) {
      pairs.push(`${RANKS[row]}${RANKS[col]}`);
    } else if (row < col) {
      suited.push(`${RANKS[row]}${RANKS[col]}s`);
    } else {
      offsuit.push(`${RANKS[col]}${RANKS[row]}o`);
    }
  }
  
  const parts: string[] = [];
  if (pairs.length > 0) parts.push(pairs.join(', '));
  if (suited.length > 0) parts.push(suited.join(', '));
  if (offsuit.length > 0) parts.push(offsuit.join(', '));
  
  return parts.join('; ');
}

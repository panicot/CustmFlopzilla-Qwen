// Card and hand types for poker range analyzer

export type Suit = 'h' | 'd' | 'c' | 's'; // hearts, diamonds, clubs, spades
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type HandCategory =
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Quads'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Trips'
  | 'Two Pair'
  | 'Top Pair'
  | 'Second Pair'
  | 'Third Pair'
  | 'Bottom Pair'
  | 'Overpair'
  | 'High Card (Ace High)'
  | 'High Card (Other)';

export interface EvaluatedHand {
  category: HandCategory;
  rank: number; // numeric strength for comparison
  bestFive: Card[];
}

export interface CategoryResult {
  category: HandCategory;
  combos: number;
  percentage: number;
}

export interface AnalysisResult {
  totalCombos: number;
  validCombos: number;
  excludedCombos: number;
  categories: CategoryResult[];
}

export type Street = 'flop' | 'turn' | 'river';

export interface RangeCell {
  row: number; // 0-12 (A=0, K=1, ..., 2=12)
  col: number;
  type: 'pair' | 'suited' | 'offsuit';
  label: string; // e.g., "AKs", "QQ", "72o"
}

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

export const SUIT_COLORS: Record<Suit, string> = {
  s: '#ffffff',
  h: '#ef4444',
  d: '#3b82f6',
  c: '#22c55e',
};

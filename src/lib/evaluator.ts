import { Card, EvaluatedHand, HandCategory, Rank, RANKS } from './types';
import { rankValue } from './deck';

// Evaluate the best 5-card hand from 5, 6, or 7 cards
export function evaluateHand(cards: Card[], boardCards: Card[]): EvaluatedHand {
  const allCards = [...cards, ...boardCards];
  
  if (allCards.length < 5) {
    return { category: 'High Card (Other)', rank: 0, bestFive: allCards };
  }

  // Generate all 5-card combinations
  const combinations = getCombinations(allCards, 5);
  
  let bestHand: RawEval | null = null;
  
  for (const combo of combinations) {
    const evaluated = evaluate5Cards(combo);
    if (!bestHand || evaluated.rank > bestHand.rank) {
      bestHand = evaluated;
    }
  }
  
  // Now classify the hand in context of the board
  const classified = classifyWithContext(bestHand!, cards, boardCards);
  return classified as EvaluatedHand;
}

function getCombinations(cards: Card[], size: number): Card[][] {
  const results: Card[][] = [];
  
  function combine(start: number, current: Card[]) {
    if (current.length === size) {
      results.push([...current]);
      return;
    }
    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  
  combine(0, []);
  return results;
}

interface RawEval {
  category: string;
  rank: number;
  bestFive: Card[];
  pairRank?: number;
}

function evaluate5Cards(cards: Card[]): RawEval {
  const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  
  const isFlush = sorted.every(c => c.suit === sorted[0].suit);
  const isStraight = checkStraight(sorted);
  const ranks = sorted.map(c => rankValue(c.rank));
  
  // Count rank frequencies
  const rankCounts: Record<number, number> = {};
  for (const r of ranks) {
    rankCounts[r] = (rankCounts[r] || 0) + 1;
  }
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const countKeys = Object.keys(rankCounts).map(Number).sort((a, b) => {
    const countDiff = (rankCounts[b] || 0) - (rankCounts[a] || 0);
    if (countDiff !== 0) return countDiff;
    return b - a;
  });

  // Royal Flush
  if (isFlush && isStraight && ranks[0] === 14 && ranks[1] === 13) {
    return { category: 'Royal Flush', rank: 10000 + ranks[0], bestFive: sorted };
  }
  
  // Straight Flush
  if (isFlush && isStraight) {
    return { category: 'Straight Flush', rank: 9000 + getStraightHigh(sorted), bestFive: sorted };
  }
  
  // Four of a Kind (Quads)
  if (counts[0] === 4) {
    return { category: 'Quads', rank: 8000 + countKeys[0] * 100 + countKeys[1], bestFive: sorted };
  }
  
  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return { category: 'Full House', rank: 7000 + countKeys[0] * 100 + countKeys[1], bestFive: sorted };
  }
  
  // Flush
  if (isFlush) {
    return { category: 'Flush', rank: 6000 + ranks[0] * 10000 + ranks[1] * 1000 + ranks[2] * 100 + ranks[3] * 10 + ranks[4], bestFive: sorted };
  }
  
  // Straight
  if (isStraight) {
    return { category: 'Straight', rank: 5000 + getStraightHigh(sorted), bestFive: sorted };
  }
  
  // Three of a Kind (Trips)
  if (counts[0] === 3) {
    return { category: 'Trips', rank: 4000 + countKeys[0] * 100 + countKeys[1], bestFive: sorted };
  }
  
  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    return { category: 'Two Pair', rank: 3000 + countKeys[0] * 1000 + countKeys[1] * 100 + countKeys[2], bestFive: sorted };
  }
  
  // One Pair
  if (counts[0] === 2) {
    return { category: 'OnePair', rank: 2000 + countKeys[0] * 1000 + countKeys[1] * 100 + countKeys[2] * 10 + countKeys[3], bestFive: sorted, pairRank: countKeys[0] };
  }
  
  // High Card
  return { category: 'HighCard', rank: 1000 + ranks[0] * 10000 + ranks[1] * 1000 + ranks[2] * 100 + ranks[3] * 10 + ranks[4], bestFive: sorted };
}

function checkStraight(sorted: Card[]): boolean {
  const ranks = sorted.map(c => rankValue(c.rank));
  
  // Normal straight check
  let isStraight = true;
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i - 1] - ranks[i] !== 1) {
      isStraight = false;
      break;
    }
  }
  if (isStraight) return true;
  
  // Wheel (A-2-3-4-5)
  if (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2) {
    return true;
  }
  
  return false;
}

function getStraightHigh(sorted: Card[]): number {
  const ranks = sorted.map(c => rankValue(c.rank));
  
  // For wheel, high card is 5
  if (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2) {
    return 5;
  }
  
  return ranks[0];
}

// Classify hand in context of board (determine Top Pair, Overpair, etc.)
function classifyWithContext(hand: RawEval, holeCards: Card[], boardCards: Card[]): EvaluatedHand {
  // If no board cards, we can't classify pairs relative to the board
  if (boardCards.length === 0) {
    if (hand.category === 'OnePair') {
      return { ...hand, category: 'Bottom Pair' } as EvaluatedHand;
    }
    if (hand.category === 'HighCard') {
      const maxHoleRank = Math.max(...holeCards.map(c => rankValue(c.rank)));
      if (maxHoleRank === 14) {
        return { ...hand, category: 'High Card (Ace High)' } as EvaluatedHand;
      }
      return { ...hand, category: 'High Card (Other)' } as EvaluatedHand;
    }
    return { ...hand, category: hand.category } as EvaluatedHand;
  }

  const boardRanks = boardCards.map(c => rankValue(c.rank));
  const boardRanksSorted = [...new Set(boardRanks)].sort((a, b) => b - a);
  const holeRanks = holeCards.map(c => rankValue(c.rank));

  // One Pair classification
  if (hand.category === 'OnePair' && hand.pairRank !== undefined) {
    const pairRank = hand.pairRank;
    
    // Check if the pair is formed by hole cards (both hole cards same rank)
    const pairIsFromHole = holeRanks.filter(r => r === pairRank).length >= 2;
    // Check if the pair uses one hole card + one board card
    const pairUsesOneHole = holeRanks.includes(pairRank) && boardRanks.includes(pairRank);
    // Check if pair is entirely from the board
    const pairIsFromBoard = boardRanks.filter(r => r === pairRank).length >= 2 && !holeRanks.includes(pairRank);
    
    if (pairIsFromHole) {
      // Pocket pair (both hole cards are the paired rank)
      if (pairRank > Math.max(...boardRanks)) {
        return { ...hand, category: 'Overpair' } as EvaluatedHand;
      }
      // Pocket pair lower than all board cards
      if (pairRank < Math.min(...boardRanks)) {
        return { ...hand, category: 'Bottom Pair' } as EvaluatedHand;
      }
      // Pocket pair between board cards (rare but possible with 3+ board cards)
      return { ...hand, category: 'Bottom Pair' } as EvaluatedHand;
    }
    
    if (pairUsesOneHole) {
      // The player has paired one of their hole cards with the board
      // Determine which board card rank they paired
      if (pairRank === boardRanksSorted[0]) {
        return { ...hand, category: 'Top Pair' } as EvaluatedHand;
      } else if (boardRanksSorted.length >= 2 && pairRank === boardRanksSorted[1]) {
        return { ...hand, category: 'Second Pair' } as EvaluatedHand;
      } else if (boardRanksSorted.length >= 3 && pairRank === boardRanksSorted[2]) {
        return { ...hand, category: 'Third Pair' } as EvaluatedHand;
      } else {
        return { ...hand, category: 'Bottom Pair' } as EvaluatedHand;
      }
    }
    
    // Pair is from the board only (board has a pair, player doesn't contribute to it)
    if (pairIsFromBoard) {
      if (pairRank === boardRanksSorted[0]) {
        return { ...hand, category: 'Top Pair' } as EvaluatedHand;
      } else if (boardRanksSorted.length >= 2 && pairRank === boardRanksSorted[1]) {
        return { ...hand, category: 'Second Pair' } as EvaluatedHand;
      } else {
        return { ...hand, category: 'Bottom Pair' } as EvaluatedHand;
      }
    }
    
    // Default for pair
    return { ...hand, category: 'Bottom Pair' } as EvaluatedHand;
  }
  
  // High Card classification
  if (hand.category === 'HighCard') {
    const maxHoleRank = Math.max(...holeRanks);
    if (maxHoleRank === 14) {
      return { ...hand, category: 'High Card (Ace High)' } as EvaluatedHand;
    }
    return { ...hand, category: 'High Card (Other)' } as EvaluatedHand;
  }
  
  // All other categories pass through directly
  return { ...hand, category: hand.category } as EvaluatedHand;
}

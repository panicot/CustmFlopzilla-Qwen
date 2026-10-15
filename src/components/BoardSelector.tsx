import React, { useState } from 'react';
import { Card, Rank, Suit, Street, RANKS, SUITS, SUIT_SYMBOLS, SUIT_COLORS } from '../lib/types';
import { stringToCard, cardToString } from '../lib/deck';

interface BoardSelectorProps {
  boardCards: Card[];
  street: Street;
  onStreetChange: (street: Street) => void;
  onBoardChange: (cards: Card[]) => void;
}

const STREET_SIZES: Record<Street, number> = {
  flop: 3,
  turn: 4,
  river: 5,
};

export default function BoardSelector({ boardCards, street, onStreetChange, onBoardChange }: BoardSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showCardPicker, setShowCardPicker] = useState(false);

  const maxCards = STREET_SIZES[street];

  const handleTextSubmit = () => {
    const parts = inputValue.trim().split(/\s+/);
    const cards: Card[] = [];
    for (const part of parts) {
      const card = stringToCard(part);
      if (card) cards.push(card);
    }
    if (cards.length > 0) {
      onBoardChange(cards.slice(0, maxCards));
      setInputValue('');
    }
  };

  const handleSlotClick = (index: number) => {
    if (index < boardCards.length) {
      // Remove card
      const newCards = [...boardCards];
      newCards.splice(index, 1);
      onBoardChange(newCards);
    } else {
      setSelectedSlot(index);
      setShowCardPicker(true);
    }
  };

  const handleCardPick = (rank: Rank, suit: Suit) => {
    const newCard: Card = { rank, suit };
    const cardStr = cardToString(newCard);
    
    // Check if card is already on board
    if (boardCards.some(c => cardToString(c) === cardStr)) return;
    
    const newCards = [...boardCards];
    if (selectedSlot !== null && selectedSlot < newCards.length) {
      newCards[selectedSlot] = newCard;
    } else {
      newCards.push(newCard);
    }
    onBoardChange(newCards);
    setShowCardPicker(false);
    setSelectedSlot(null);
  };

  const handleClear = () => {
    onBoardChange([]);
  };

  return (
    <div className="bg-[#16213e] rounded-xl p-4 shadow-lg">
      <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        🃏 Board
      </h2>

      {/* Street Tabs */}
      <div className="flex gap-1 mb-4">
        {(['flop', 'turn', 'river'] as Street[]).map(s => (
          <button
            key={s}
            onClick={() => {
              onStreetChange(s);
              if (boardCards.length > STREET_SIZES[s]) {
                onBoardChange(boardCards.slice(0, STREET_SIZES[s]));
              }
            }}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${street === s
                ? 'bg-[#6d4aff] text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({STREET_SIZES[s]})
          </button>
        ))}
      </div>

      {/* Card Slots */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Array.from({ length: maxCards }, (_, i) => {
          const card = boardCards[i];
          return (
            <button
              key={i}
              onClick={() => handleSlotClick(i)}
              className={`
                w-14 h-20 rounded-lg border-2 flex items-center justify-center
                transition-all duration-200 text-lg font-bold
                ${card
                  ? 'border-[#6d4aff] bg-white/10 hover:border-red-500'
                  : 'border-dashed border-gray-600 bg-gray-800/50 hover:border-gray-400'
                }
              `}
            >
              {card ? (
                <span style={{ color: SUIT_COLORS[card.suit] }}>
                  {card.rank}{SUIT_SYMBOLS[card.suit]}
                </span>
              ) : (
                <span className="text-gray-600 text-2xl">+</span>
              )}
            </button>
          );
        })}
        <button
          onClick={handleClear}
          className="ml-2 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors self-center"
        >
          🗑️ Netejar
        </button>
      </div>

      {/* Text Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          placeholder='Ex: "Ah Qd 5c"'
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-[#6d4aff] focus:outline-none"
        />
        <button
          onClick={handleTextSubmit}
          className="px-4 py-2 bg-[#6d4aff] hover:bg-[#5a3de8] text-white rounded-lg text-sm font-medium transition-colors"
        >
          Afegir
        </button>
      </div>

      {/* Card Picker */}
      {showCardPicker && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-600 mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Selecciona una carta:</span>
            <button onClick={() => setShowCardPicker(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
          </div>
          {/* Suit headers */}
          <div className="grid grid-cols-4 gap-1 mb-1">
            {SUITS.map(suit => (
              <div key={suit} className="text-center text-xs font-bold" style={{ color: SUIT_COLORS[suit] }}>
                {SUIT_SYMBOLS[suit]}
              </div>
            ))}
          </div>
          {/* Card grid: 13 rows × 4 columns */}
          <div className="grid grid-cols-4 gap-1">
            {RANKS.map(rank =>
              SUITS.map(suit => {
                const cardStr = `${rank}${suit}`;
                const isOnBoard = boardCards.some(c => cardToString(c) === cardStr);
                return (
                  <button
                    key={cardStr}
                    onClick={() => !isOnBoard && handleCardPick(rank, suit)}
                    disabled={isOnBoard}
                    className={`
                      py-1.5 flex items-center justify-center rounded text-sm font-bold
                      transition-all
                      ${isOnBoard
                        ? 'bg-gray-700/30 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 hover:scale-105 cursor-pointer'
                      }
                    `}
                    style={{ color: isOnBoard ? undefined : SUIT_COLORS[suit] }}
                  >
                    {rank}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

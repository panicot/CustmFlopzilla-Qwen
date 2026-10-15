import React, { useState, useCallback, useMemo } from 'react';
import { Card, Street } from './lib/types';
import { analyzeRange } from './lib/analyzer';
import { getComboCount } from './lib/rangeParser';
import { parseRangeNotation } from './lib/rangeNotation';
import RangeGrid from './components/RangeGrid';
import BoardSelector from './components/BoardSelector';
import Results from './components/Results';

export default function App() {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [boardCards, setBoardCards] = useState<Card[]>([]);
  const [street, setStreet] = useState<Street>('flop');

  const handleToggleCell = useCallback((key: string) => {
    setSelectedCells(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const all = new Set<string>();
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 13; col++) {
        all.add(`${row}-${col}`);
      }
    }
    setSelectedCells(all);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedCells(new Set());
  }, []);

  const handleSetRange = useCallback((cells: Set<string>) => {
    setSelectedCells(cells);
  }, []);

  const [rangeText, setRangeText] = useState('');
  
  const handleRangeTextSubmit = useCallback(() => {
    if (rangeText.trim()) {
      const cells = parseRangeNotation(rangeText);
      if (cells.size > 0) {
        setSelectedCells(prev => {
          const next = new Set(prev);
          cells.forEach(c => next.add(c));
          return next;
        });
        setRangeText('');
      }
    }
  }, [rangeText]);

  // Calculate combo count for display
  const comboCount = useMemo(() => {
    let count = 0;
    for (const key of selectedCells) {
      const [rowStr, colStr] = key.split('-');
      count += getComboCount(parseInt(rowStr), parseInt(colStr));
    }
    return count;
  }, [selectedCells]);

  // Run analysis
  const analysisResult = useMemo(() => {
    if (selectedCells.size === 0) return null;
    return analyzeRange(selectedCells, boardCards);
  }, [selectedCells, boardCards]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Header */}
      <header className="bg-[#16213e]/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎴</span>
            <div>
              <h1 className="text-lg font-bold text-white">Analitzador de Rangs de Pòquer</h1>
              <p className="text-xs text-gray-400">Anàlisi de rangs i probabilitats vs. board</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
            <span>Rang: <span className="text-[#6d4aff] font-bold">{selectedCells.size}</span> cel·les</span>
            <span>Board: <span className="text-[#22c55e] font-bold">{boardCards.length}</span> cartes</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <RangeGrid
              selectedCells={selectedCells}
              onToggleCell={handleToggleCell}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              onSetRange={handleSetRange}
              comboCount={comboCount}
            />
            
            {/* Range Notation Input */}
            <div className="bg-[#16213e] rounded-xl p-3 shadow-lg">
              <div className="text-xs text-gray-400 mb-2 font-medium">📝 Notació de Rang (ex: AA+, AKs+, KQo)</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rangeText}
                  onChange={(e) => setRangeText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRangeTextSubmit()}
                  placeholder="AA+, AKs+..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-[#6d4aff] focus:outline-none"
                />
                <button
                  onClick={handleRangeTextSubmit}
                  className="px-4 py-2 bg-[#6d4aff] hover:bg-[#5a3de8] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Afegir
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setRangeText('AA+, AKs+'); }}
                  className="text-[10px] px-2 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
                >
                  AA+, AKs+
                </button>
                <button
                  onClick={() => { setRangeText('TT+, AQs+, AJo+'); }}
                  className="text-[10px] px-2 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
                >
                  TT+, AQs+, AJo+
                </button>
                <button
                  onClick={() => { setRangeText('22+, A2s+, K9s+, Q9s+, J9s+, T8s+, 97s+, 87s, ATo+, KTo+'); }}
                  className="text-[10px] px-2 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
                >
                  ~30% Range
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <BoardSelector
              boardCards={boardCards}
              street={street}
              onStreetChange={setStreet}
              onBoardChange={setBoardCards}
            />
            <Results 
              result={analysisResult} 
              isAnalyzing={false}
              hasRange={selectedCells.size > 0}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-[#16213e] rounded-xl p-4 shadow-lg">
          <h3 className="text-sm font-bold text-gray-300 mb-2">ℹ️ Com funciona</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
            <div>
              <span className="text-[#6d4aff] font-bold">1.</span> Selecciona les mans del rang del rival a la graella 13×13 (vermell=parells, verd=suited, blau=offsuit)
            </div>
            <div>
              <span className="text-[#6d4aff] font-bold">2.</span> Introdueix les cartes del board (flop/turn/river) clicant els slots o escrivint-les
            </div>
            <div>
              <span className="text-[#6d4aff] font-bold">3.</span> L'analitzador calcula la distribució de mans del rival automàticament
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8 py-4 text-center text-xs text-gray-500">
        Analitzador de Rangs de Pòquer • Anàlisi estadística sense mà pròpia
      </footer>
    </div>
  );
}

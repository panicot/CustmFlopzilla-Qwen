import React, { useCallback, useRef, useState } from 'react';
import { RANKS } from '../lib/types';

interface RangeGridProps {
  selectedCells: Set<string>;
  onToggleCell: (key: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSetRange: (cells: Set<string>) => void;
  comboCount: number;
}

function getCellType(row: number, col: number): 'pair' | 'suited' | 'offsuit' {
  if (row === col) return 'pair';
  if (row < col) return 'suited';
  return 'offsuit';
}

function getCellLabel(row: number, col: number): string {
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  if (row === col) return `${r1}${r2}`;
  if (row < col) return `${r1}${r2}s`;
  return `${r2}${r1}o`;
}

// Preset ranges
function getPresetRange(preset: string): Set<string> {
  const cells = new Set<string>();
  
  switch (preset) {
    case 'top5': {
      // AA-TT, AKs-ATs, KQs-KJs, AKo
      for (let i = 0; i <= 4; i++) cells.add(`${i}-${i}`); // pairs
      for (let col = 1; col <= 4; col++) cells.add(`0-${col}`); // AKs-ATs
      cells.add('1-2'); // KQs
      cells.add('1-3'); // KJs
      cells.add('1-0'); // AKo
      break;
    }
    case 'top10': {
      // AA-77, AKs-A7s, KQs-K9s, QJs-Q9s, JTs-J9s, T9s-T8s, 98s, 87s, AKo-AJo, KQo
      for (let i = 0; i <= 6; i++) cells.add(`${i}-${i}`); // pairs
      for (let col = 1; col <= 7; col++) cells.add(`0-${col}`); // A suited
      for (let col = 2; col <= 4; col++) cells.add(`1-${col}`); // KQs-KTs
      cells.add('1-5'); // K9s
      cells.add('2-3'); cells.add('2-4'); // QJs, QTs
      cells.add('2-5'); // Q9s
      cells.add('3-4'); cells.add('3-5'); // JTs, J9s
      cells.add('4-5'); cells.add('4-6'); // T9s, T8s
      cells.add('5-6'); // 98s
      cells.add('6-7'); // 87s
      cells.add('1-0'); cells.add('2-0'); cells.add('3-0'); // AKo, AQo, AJo
      cells.add('2-1'); // KQo
      break;
    }
    case 'top20': {
      // AA-22, all aces suited, broadway suited, some connectors
      for (let i = 0; i <= 12; i++) cells.add(`${i}-${i}`); // all pairs
      for (let col = 1; col <= 12; col++) cells.add(`0-${col}`); // all A suited
      for (let col = 2; col <= 6; col++) cells.add(`1-${col}`); // K suited
      for (let col = 3; col <= 6; col++) cells.add(`2-${col}`); // Q suited
      for (let col = 4; col <= 6; col++) cells.add(`3-${col}`); // J suited
      cells.add('4-5'); cells.add('4-6'); cells.add('4-7'); // T suited
      cells.add('5-6'); cells.add('5-7'); // 9 suited
      cells.add('6-7'); cells.add('6-8'); // 8 suited
      cells.add('7-8'); // 78s
      // offsuit broadway
      for (let col = 0; col <= 4; col++) {
        for (let row = 0; row <= 4; row++) {
          if (row > col) cells.add(`${row}-${col}`);
        }
      }
      break;
    }
    default:
      break;
  }
  
  return cells;
}

export default function RangeGrid({ selectedCells, onToggleCell, onSelectAll, onClearAll, onSetRange, comboCount }: RangeGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    const key = `${row}-${col}`;
    const isCurrentlySelected = selectedCells.has(key);
    setIsDragging(true);
    setDragMode(isCurrentlySelected ? 'deselect' : 'select');
    onToggleCell(key);
  }, [selectedCells, onToggleCell]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isDragging || !dragMode) return;
    const key = `${row}-${col}`;
    const isSelected = selectedCells.has(key);
    
    if (dragMode === 'select' && !isSelected) {
      onToggleCell(key);
    } else if (dragMode === 'deselect' && isSelected) {
      onToggleCell(key);
    }
  }, [isDragging, dragMode, selectedCells, onToggleCell]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
  }, []);

  return (
    <div className="bg-[#16213e] rounded-xl p-4 shadow-lg" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🎯 Rang del Rival
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Combos: <span className="text-[#6d4aff] font-bold">{comboCount}</span>
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={onSelectAll}
          className="px-3 py-1.5 text-xs bg-[#6d4aff] hover:bg-[#5a3de8] text-white rounded-md transition-colors font-medium"
        >
          100%
        </button>
        <button
          onClick={() => onSetRange(getPresetRange('top5'))}
          className="px-3 py-1.5 text-xs bg-[#6d4aff]/80 hover:bg-[#5a3de8] text-white rounded-md transition-colors"
        >
          Top 5%
        </button>
        <button
          onClick={() => onSetRange(getPresetRange('top10'))}
          className="px-3 py-1.5 text-xs bg-[#6d4aff]/80 hover:bg-[#5a3de8] text-white rounded-md transition-colors"
        >
          Top 10%
        </button>
        <button
          onClick={() => onSetRange(getPresetRange('top20'))}
          className="px-3 py-1.5 text-xs bg-[#6d4aff]/80 hover:bg-[#5a3de8] text-white rounded-md transition-colors"
        >
          Top 20%
        </button>
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 text-xs bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-md transition-colors font-medium"
        >
          Netejar
        </button>
      </div>

      {/* Rank Labels */}
      <div className="grid grid-cols-13 gap-[2px] mb-[2px]">
        {RANKS.map((rank, i) => (
          <div key={i} className="text-[8px] text-gray-500 text-center font-medium">
            {rank}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-13 gap-[2px]" onMouseLeave={handleMouseUp}>
        {Array.from({ length: 13 }, (_, row) =>
          Array.from({ length: 13 }, (_, col) => {
            const key = `${row}-${col}`;
            const isSelected = selectedCells.has(key);
            const type = getCellType(row, col);
            const label = getCellLabel(row, col);
            
            let bgColor = 'bg-gray-700/40';
            if (type === 'pair') bgColor = isSelected ? 'bg-red-500' : 'bg-red-900/30';
            else if (type === 'suited') bgColor = isSelected ? 'bg-emerald-500' : 'bg-emerald-900/30';
            else bgColor = isSelected ? 'bg-sky-500' : 'bg-gray-700/40';
            
            return (
              <button
                key={key}
                onMouseDown={(e) => handleMouseDown(row, col, e)}
                onMouseEnter={() => handleMouseEnter(row, col)}
                className={`
                  w-full aspect-square flex items-center justify-center
                  text-[8px] sm:text-[9px] md:text-[10px] font-semibold rounded-[3px]
                  transition-colors duration-100
                  ${bgColor}
                  ${isSelected ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}
                `}
                title={label}
                draggable={false}
              >
                {label}
              </button>
            );
          })
        )}
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500"></span> Parells
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Suited
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-sky-500"></span> Offsuit
        </span>
      </div>
    </div>
  );
}

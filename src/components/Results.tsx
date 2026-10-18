import React, { useMemo } from 'react';
import { AnalysisResult, HandCategory } from '../lib/types';
import { getCategoryColor } from '../lib/analyzer';

interface ResultsProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  hasRange: boolean;
}

export default function Results({ result, isAnalyzing, hasRange }: ResultsProps) {
  if (!hasRange) {
    return (
      <div className="bg-[#16213e] rounded-xl p-6 shadow-lg h-full flex flex-col justify-center">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📊 Resultats de l'Anàlisi
        </h2>
        <div className="text-center text-gray-500 py-8">
          <p className="text-4xl mb-3">🎴</p>
          <p className="text-sm">Selecciona un rang a la graella per començar l'anàlisi</p>
          <p className="text-xs text-gray-600 mt-2">Pots arrossegar per seleccionar múltiples cel·les</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing || !result) {
    return (
      <div className="bg-[#16213e] rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📊 Resultats de l'Anàlisi
        </h2>
        <div className="text-center text-gray-400 py-8">
          <div className="animate-spin w-8 h-8 border-2 border-[#6d4aff] border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm">Calculant...</p>
        </div>
      </div>
    );
  }

  const { totalCombos, validCombos, excludedCombos, categories } = result;

  // Group categories for summary
  const majorCategories = [
    { label: 'Monster (SF+)', cats: ['Royal Flush', 'Straight Flush', 'Quads', 'Full House'], color: '#ef4444' },
    { label: 'Color (Flush)', cats: ['Flush'], color: '#3b82f6' },
    { label: 'Escala', cats: ['Straight'], color: '#8b5cf6' },
    { label: 'Trío', cats: ['Trips'], color: '#ec4899' },
    { label: 'Doble Parella', cats: ['Two Pair'], color: '#14b8a6' },
    { label: 'Parella', cats: ['Top Pair', 'Second Pair', 'Third Pair', 'Bottom Pair', 'Overpair'], color: '#22c55e' },
    { label: 'Carta Alta', cats: ['High Card (Ace High)', 'High Card (Other)'], color: '#94a3b8' },
  ];

  const getGroupPercentage = (cats: string[]) => {
    return categories
      .filter(c => cats.includes(c.category))
      .reduce((sum, c) => sum + c.percentage, 0);
  };

  const getGroupCombos = (cats: string[]) => {
    return categories
      .filter(c => cats.includes(c.category))
      .reduce((sum, c) => sum + c.combos, 0);
  };

  return (
    <div className="bg-[#16213e] rounded-xl p-4 shadow-lg animate-slide-in h-full">
      <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        📊 Resultats de l'Anàlisi
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-xl sm:text-2xl font-bold text-[#6d4aff]">{validCombos}</div>
          <div className="text-[10px] text-gray-400">Combos Vàlids</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-xl sm:text-2xl font-bold text-[#22c55e]">{categories.length}</div>
          <div className="text-[10px] text-gray-400">Categories</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-xl sm:text-2xl font-bold text-[#ef4444]">{excludedCombos}</div>
          <div className="text-[10px] text-gray-400">Exclosos</div>
        </div>
      </div>

      {excludedCombos > 0 && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-2 mb-4">
          <p className="text-xs text-red-300">
            ⚠️ {excludedCombos} combos exclosos per cartes duplicades amb el board
          </p>
        </div>
      )}

      {/* Stacked Bar Chart */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-1.5 font-medium">Distribució Visual del Rang</div>
        <div className="h-7 rounded-lg overflow-hidden flex bg-gray-800 border border-gray-700/50">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="h-full transition-all duration-500 relative group"
              style={{
                width: `${Math.max(cat.percentage, 0.5)}%`,
                backgroundColor: getCategoryColor(cat.category),
              }}
              title={`${cat.category}: ${cat.percentage.toFixed(1)}% (${cat.combos} combos)`}
            >
              {cat.percentage > 4 && (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-sm">
                  {cat.percentage.toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Group Summary */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2 font-medium">Resum per Grup</div>
        <div className="space-y-1.5">
          {majorCategories.map(group => {
            const pct = getGroupPercentage(group.cats);
            const combos = getGroupCombos(group.cats);
            if (pct === 0) return null;
            return (
              <div key={group.label} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-300 w-24 sm:w-28 truncate">{group.label}</span>
                <div className="flex-1 h-3.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: group.color,
                    }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 w-14 text-right font-mono">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="overflow-hidden rounded-lg border border-gray-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800/80">
              <th className="text-left px-3 py-2 text-gray-400 font-medium text-[11px]">Categoria</th>
              <th className="text-right px-3 py-2 text-gray-400 font-medium text-[11px]">Combos</th>
              <th className="text-right px-3 py-2 text-gray-400 font-medium text-[11px]">%</th>
              <th className="text-left px-2 py-2 text-gray-400 font-medium text-[11px] w-24 sm:w-32"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.category} className="border-t border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(cat.category) }}
                    />
                    <span className="text-gray-200 text-[11px]">{cat.category}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5 text-right text-gray-300 font-mono text-[11px]">{cat.combos}</td>
                <td className="px-3 py-1.5 text-right text-gray-300 font-mono text-[11px]">{cat.percentage.toFixed(1)}%</td>
                <td className="px-2 py-1.5">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: getCategoryColor(cat.category),
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

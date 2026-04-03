import { useRef, useState } from 'react';
import { HelpCircle, BarChart3, Settings, Sparkles, Grid3x3 } from 'lucide-react';
import { GameMode, ThemeCategory } from '../types/game';
import CategoryDropdown from './CategoryDropdown';

interface HeaderProps {
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onShowHelp: () => void;
  onShowStats: () => void;
  onShowSettings: () => void;
  onCategorySelect: (category: ThemeCategory) => void;
  categoryStats: Record<ThemeCategory, { gamesPlayed: number; gamesWon: number }>;
}

export default function Header({
  gameMode,
  onModeChange,
  onShowHelp,
  onShowStats,
  onShowSettings,
  onCategorySelect,
  categoryStats,
}: HeaderProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur-md relative z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onShowHelp}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="How to play"
          >
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white/90" />
          </button>

          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 animate-pulse flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' }} />
              <h1 className="brand-font text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight whitespace-nowrap" style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}>
                ProperNoundle
              </h1>
              <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 animate-pulse flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' }} />
            </div>
            <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap justify-center">
              <button
                onClick={() => {
                  setShowCategoryDropdown(false);
                  onModeChange('daily');
                }}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  gameMode === 'daily'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                }`}
                aria-label="Daily mode"
              >
                Daily
              </button>
              <button
                onClick={() => {
                  setShowCategoryDropdown(false);
                  onModeChange('practice');
                }}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  gameMode === 'practice'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                }`}
                aria-label="Practice mode"
              >
                Practice
              </button>
              <button
                onClick={() => {
                  setShowCategoryDropdown(false);
                  onModeChange('sequence');
                }}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  gameMode === 'sequence' && !showCategoryDropdown
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                }`}
                aria-label="Sequence mode"
              >
                Sequence
              </button>
              <div className="relative">
                <button
                  ref={categoryButtonRef}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1 ${
                    gameMode === 'category' || showCategoryDropdown
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                  }`}
                  aria-label="Categories"
                >
                  <Grid3x3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Categories</span>
                  <span className="xs:hidden">Cat</span>
                </button>
                <CategoryDropdown
                  isOpen={showCategoryDropdown}
                  onClose={() => setShowCategoryDropdown(false)}
                  onSelectCategory={(category) => {
                    onCategorySelect(category);
                    setShowCategoryDropdown(false);
                  }}
                  categoryStats={categoryStats}
                  buttonRef={categoryButtonRef}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={onShowStats}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Statistics"
            >
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white/90" />
            </button>
            <button
              onClick={onShowSettings}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white/90" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

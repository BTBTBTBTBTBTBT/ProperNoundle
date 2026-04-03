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

const MODES: { id: GameMode; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'practice', label: 'Practice' },
  { id: 'sequence', label: 'Sequence' },
];

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
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md relative z-50">
      <div className="max-w-2xl mx-auto px-2 sm:px-3 py-1.5 sm:py-2">
        {/* Top row: icons + title */}
        <div className="flex items-center justify-between mb-1.5">
          <button
            onClick={onShowHelp}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="How to play"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.5))' }} />
            <h1 className="brand-font text-[15px] sm:text-2xl font-bold text-white tracking-tight whitespace-nowrap" style={{ textShadow: '0 0 15px rgba(255, 215, 0, 0.4)' }}>
              ProperNoundle
            </h1>
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.5))' }} />
          </div>

          <div className="flex">
            <button
              onClick={onShowStats}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Statistics"
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            </button>
            <button
              onClick={onShowSettings}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Mode selector — single row segmented control */}
        <div className="flex items-center gap-1 justify-center overflow-x-auto">
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 flex-shrink-0">
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  setShowCategoryDropdown(false);
                  onModeChange(mode.id);
                }}
                className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all ${
                  gameMode === mode.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0">
            <button
              ref={categoryButtonRef}
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all border ${
                gameMode === 'category' || showCategoryDropdown
                  ? 'bg-amber-500 text-white border-amber-400/50 shadow-sm'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white/90 hover:bg-white/10'
              }`}
              aria-label="Categories"
            >
              <Grid3x3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">Cat.</span>
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
    </header>
  );
}

import { useRef, useState } from 'react';
import { HelpCircle, BarChart3, Settings, Grid3x3 } from 'lucide-react';
import { GameMode, ThemeCategory } from '../types/game';
import CategoryDropdown from './CategoryDropdown';

function FlankerStar({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`flex-shrink-0 ${className}`}
    >
      {/* 4-point diamond star */}
      <path
        d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
        fill="url(#star-gradient)"
      />
      {/* Small accent dots */}
      <circle cx="6" cy="6" r="0.8" fill="rgba(255,215,0,0.5)" />
      <circle cx="18" cy="6" r="0.6" fill="rgba(255,215,0,0.4)" />
      <circle cx="18" cy="18" r="0.7" fill="rgba(255,215,0,0.3)" />
      <defs>
        <radialGradient id="star-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
    </svg>
  );
}

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
    <header className="header-backdrop header-border-glow relative z-50">
      <div className="max-w-2xl mx-auto px-2 sm:px-3 py-1.5 sm:py-2">
        {/* Top row: icons + title */}
        <div className="flex items-center justify-between mb-1.5">
          <button
            onClick={onShowHelp}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
            aria-label="How to play"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-white/80 transition-colors" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <FlankerStar className="w-4 h-4 sm:w-5 sm:h-5 flanker-glow" />
            <h1 className="brand-font brand-shimmer text-[16px] sm:text-2xl font-extrabold tracking-[-0.02em] whitespace-nowrap">
              ProperNoundle
            </h1>
            <FlankerStar className="w-4 h-4 sm:w-5 sm:h-5 flanker-glow flanker-glow-delay" />
          </div>

          <div className="flex gap-0.5">
            <button
              onClick={onShowStats}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
              aria-label="Statistics"
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-white/80 transition-colors" />
            </button>
            <button
              onClick={onShowSettings}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-white/80 transition-colors" />
            </button>
          </div>
        </div>

        {/* Mode selector — single row segmented control */}
        <div className="flex items-center gap-1 justify-center">
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

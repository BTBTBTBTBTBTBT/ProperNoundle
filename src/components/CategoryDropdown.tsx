import { useEffect, useRef } from 'react';
import { ThemeCategory } from '../types/game';

interface CategoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: ThemeCategory) => void;
  categoryStats: Record<ThemeCategory, { gamesPlayed: number; gamesWon: number }>;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const CATEGORIES: { id: ThemeCategory; name: string; color: string; gradient: string }[] = [
  {
    id: 'music',
    name: 'Music',
    color: 'from-pink-500 to-rose-500',
    gradient: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-400/30 hover:border-pink-400/60'
  },
  {
    id: 'videogames',
    name: 'Video Games',
    color: 'from-cyan-500 to-blue-500',
    gradient: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400/30 hover:border-cyan-400/60'
  },
  {
    id: 'movies',
    name: 'Movies',
    color: 'from-amber-500 to-orange-500',
    gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400/30 hover:border-amber-400/60'
  },
  {
    id: 'sports',
    name: 'Sports',
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/30 hover:border-green-400/60'
  },
  {
    id: 'history',
    name: 'History',
    color: 'from-stone-500 to-slate-500',
    gradient: 'bg-gradient-to-br from-stone-500/20 to-slate-500/20 border-stone-400/30 hover:border-stone-400/60'
  },
  {
    id: 'science',
    name: 'Science',
    color: 'from-teal-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-teal-400/30 hover:border-teal-400/60'
  },
  {
    id: 'currentevents',
    name: 'Current Events',
    color: 'from-red-500 to-rose-500',
    gradient: 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-400/30 hover:border-red-400/60'
  },
];

export default function CategoryDropdown({
  isOpen,
  onClose,
  onSelectCategory,
  categoryStats,
  buttonRef
}: CategoryDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  const handleCategorySelect = (categoryId: ThemeCategory) => {
    onSelectCategory(categoryId);
    onClose();
  };

  const getWinRate = (category: ThemeCategory) => {
    const stats = categoryStats[category];
    if (!stats || stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl animate-dropdown z-[100]"
      style={{
        animation: 'slideDown 0.3s ease-out forwards'
      }}
    >
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div className="p-4">
        <h3 className="text-lg font-extrabold brand-font brand-shimmer mb-3">Select Category</h3>

        <div className="space-y-2">
          {CATEGORIES.map((category) => {
            const stats = categoryStats[category.id];
            const winRate = getWinRate(category.id);

            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`${category.gradient} backdrop-blur-sm rounded-lg p-3 border transition-all duration-200 hover:scale-[1.02] active:scale-95 text-left group w-full`}
              >
                <div className="flex justify-between items-center">
                  <div className={`text-base font-bold text-transparent bg-clip-text bg-gradient-to-r ${category.color}`}>
                    {category.name}
                  </div>

                  {stats && stats.gamesPlayed > 0 ? (
                    <div className="text-xs text-white/70">
                      <span className="text-white font-semibold">{winRate}%</span> win rate
                    </div>
                  ) : (
                    <div className="text-white/40 text-xs">
                      New
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/60 text-xs text-center">
            Practice puzzles from your favorite categories
          </p>
        </div>
      </div>
    </div>
  );
}

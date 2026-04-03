import { ThemeCategory } from '../../types/game';
import Modal from './Modal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: ThemeCategory) => void;
  categoryStats: Record<ThemeCategory, { gamesPlayed: number; gamesWon: number }>;
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

export default function CategoryModal({ isOpen, onClose, onSelectCategory, categoryStats }: CategoryModalProps) {
  const handleCategorySelect = (categoryId: ThemeCategory) => {
    onSelectCategory(categoryId);
    onClose();
  };

  const getWinRate = (category: ThemeCategory) => {
    const stats = categoryStats[category];
    if (!stats || stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Category">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
        {CATEGORIES.map((category) => {
          const stats = categoryStats[category.id];
          const winRate = getWinRate(category.id);

          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`${category.gradient} backdrop-blur-sm rounded-xl p-4 border transition-all duration-200 hover:scale-105 active:scale-95 text-left group`}
            >
              <div className="flex flex-col h-full">
                <div className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${category.color} mb-2`}>
                  {category.name}
                </div>

                {stats && stats.gamesPlayed > 0 ? (
                  <div className="text-sm space-y-1 mt-auto">
                    <div className="text-white/70">
                      Win Rate: <span className="text-white font-semibold">{winRate}%</span>
                    </div>
                    <div className="text-white/50 text-xs">
                      {stats.gamesPlayed} game{stats.gamesPlayed !== 1 ? 's' : ''} played
                    </div>
                  </div>
                ) : (
                  <div className="text-white/50 text-sm mt-auto">
                    Not played yet
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-white/70 text-sm text-center">
          Play practice puzzles from your favorite categories
        </p>
      </div>
    </Modal>
  );
}

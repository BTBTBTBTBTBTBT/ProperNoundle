import Modal from './Modal';
import { Stats } from '../../types/game';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Stats;
}

export default function StatsModal({ isOpen, onClose, stats }: StatsModalProps) {
  const { daily, practice, sequence } = stats;
  const winPercentage = daily.gamesPlayed > 0
    ? Math.round((daily.gamesWon / daily.gamesPlayed) * 100)
    : 0;

  const maxGuessCount = Math.max(...Object.values(daily.guessDistribution), 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Statistics">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-amber-400">Daily Mode</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{daily.gamesPlayed}</div>
              <div className="text-xs text-white/70">Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{winPercentage}</div>
              <div className="text-xs text-white/70">Win %</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{daily.currentStreak}</div>
              <div className="text-xs text-white/70">Current</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{daily.maxStreak}</div>
              <div className="text-xs text-white/70">Max</div>
            </div>
          </div>

          <h4 className="text-sm font-semibold mb-2 text-amber-300">Guess Distribution</h4>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map(guessNum => {
              const count = daily.guessDistribution[guessNum] || 0;
              const percentage = maxGuessCount > 0 ? (count / maxGuessCount) * 100 : 0;
              return (
                <div key={guessNum} className="flex items-center gap-2">
                  <div className="w-4 text-xs font-semibold text-white/90">{guessNum}</div>
                  <div className="flex-1 bg-white/10 rounded-lg overflow-hidden border border-white/20">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-5 flex items-center justify-end pr-2 text-xs font-bold text-white transition-all duration-300 shadow-lg shadow-green-500/30"
                      style={{ width: `${Math.max(percentage, count > 0 ? 10 : 0)}%` }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="text-lg font-semibold mb-3 text-amber-400">Practice Mode</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{practice.gamesPlayed}</div>
              <div className="text-xs text-white/70">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{practice.gamesWon}</div>
              <div className="text-xs text-white/70">Games Won</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="text-lg font-semibold mb-3 text-amber-400">Sequence Mode</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{sequence.sequencesPlayed}</div>
              <div className="text-xs text-white/70">Started</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{sequence.sequencesCompleted}</div>
              <div className="text-xs text-white/70">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

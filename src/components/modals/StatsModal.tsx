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
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-2 text-amber-400 uppercase tracking-wider">Daily</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { value: daily.gamesPlayed, label: 'Played' },
              { value: winPercentage, label: 'Win %' },
              { value: daily.currentStreak, label: 'Streak' },
              { value: daily.maxStreak, label: 'Best' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-white/50 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map(guessNum => {
              const count = daily.guessDistribution[guessNum] || 0;
              const percentage = maxGuessCount > 0 ? (count / maxGuessCount) * 100 : 0;
              return (
                <div key={guessNum} className="flex items-center gap-2">
                  <div className="w-3 text-xs font-medium text-white/50">{guessNum}</div>
                  <div className="flex-1 bg-white/5 rounded overflow-hidden h-5">
                    {count > 0 && (
                      <div
                        className="bg-green-600 h-full flex items-center justify-end pr-1.5 text-[10px] font-bold text-white rounded transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 12)}%` }}
                      >
                        {count}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <h3 className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Practice</h3>
            <div className="text-xl font-bold text-white">{practice.gamesWon}<span className="text-white/30 font-normal">/{practice.gamesPlayed}</span></div>
            <div className="text-[10px] text-white/40">won</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <h3 className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Sequence</h3>
            <div className="text-xl font-bold text-white">{sequence.sequencesCompleted}<span className="text-white/30 font-normal">/{sequence.sequencesPlayed}</span></div>
            <div className="text-[10px] text-white/40">completed</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

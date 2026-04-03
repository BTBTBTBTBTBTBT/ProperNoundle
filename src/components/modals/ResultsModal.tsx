import { useState, useEffect } from 'react';
import { Share2, Check, X, Sparkles } from 'lucide-react';
import { Guess, Category, GameMode } from '../../types/game';
import { generateDailyShareText, generateShareText, copyToClipboard } from '../../utils/share';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  won: boolean;
  answer: string;
  guesses: Guess[];
  category: Category;
  gameMode: GameMode;
  puzzleNumber?: number;
  currentStreak?: number;
  onPlayAgain?: () => void;
}

export default function ResultsModal({
  isOpen,
  onClose,
  won,
  answer,
  guesses,
  category,
  gameMode,
  puzzleNumber,
  currentStreak,
  onPlayAgain,
}: ResultsModalProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = gameMode === 'daily' && puzzleNumber
      ? generateDailyShareText(guesses, category, won ? 'won' : 'lost', 6, currentStreak)
      : generateShareText(guesses, puzzleNumber || 0, category, won ? 'won' : 'lost', 6);

    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm px-6 py-5 border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-transparent to-transparent opacity-50"></div>

          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div></div>

            <div className="flex items-center justify-center gap-2">
              {won && (
                <Sparkles className="w-5 h-5 text-amber-400" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.5))' }} />
              )}
              <h2
                id="results-title"
                className="brand-font text-2xl font-bold text-white whitespace-nowrap"
                style={{ textShadow: won ? '0 0 15px rgba(255, 215, 0, 0.2)' : 'none' }}
              >
                {won ? 'Congratulations!' : 'Better luck next time!'}
              </h2>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-4 text-center">
            <div className="text-4xl mb-2">
              {won ? '🎉' : '😔'}
            </div>

            <div>
              <p className="text-lg font-semibold text-white mb-2">
                {won ? `You solved it in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}!` : 'The answer was:'}
              </p>
              <p className="text-2xl font-bold text-amber-400" style={{ textShadow: '0 0 15px rgba(255, 215, 0, 0.4)' }}>{answer}</p>
              <p className="text-sm text-white/70 mt-1 capitalize">Category: {category}</p>
            </div>

            {won && currentStreak && currentStreak > 1 && (
              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/30 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-amber-300 font-semibold">
                  🔥 {currentStreak} day streak!
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-4">
              {gameMode !== 'daily' && (
                <button
                  onClick={() => {
                    onClose();
                    onPlayAgain?.();
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-amber-500/30 border border-amber-400/50"
                >
                  Play Again
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 border border-green-400/50"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Share Results
                  </>
                )}
              </button>
            </div>

            {gameMode === 'daily' && (
              <p className="text-sm text-white/70 pt-2">
                Come back tomorrow for a new puzzle!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

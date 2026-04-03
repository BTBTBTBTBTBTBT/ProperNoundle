import { useState, useEffect } from 'react';
import { Share2, Check, X } from 'lucide-react';
import { Guess, Category, GameMode } from '../../types/game';
import { generateDailyShareText, generateShareText, copyToClipboard } from '../../utils/share';
import { fetchWikipediaImage } from '../../utils/wikipedia';

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
  wikiTitle?: string;
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
  wikiTitle,
}: ResultsModalProps) {
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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
    if (isOpen && answer) {
      setImageUrl(null);
      setImageLoaded(false);
      fetchWikipediaImage(answer, wikiTitle).then(url => {
        if (url) setImageUrl(url);
      });
    }
  }, [isOpen, answer, wikiTitle]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
    >
      <div
        className="bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 id="results-title" className="brand-font text-lg font-bold text-white">
            {won ? 'You got it!' : 'Not this time'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 text-center space-y-3">
          {/* Wikipedia image */}
          <div className="flex justify-center">
            {imageUrl ? (
              <div className="relative max-w-[180px] rounded-lg overflow-hidden border border-white/10">
                <img
                  src={imageUrl}
                  alt={answer}
                  className={`w-full h-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="w-24 h-24 bg-white/5 animate-pulse rounded-lg" />
                )}
              </div>
            ) : (
              <span className="text-3xl">{won ? '🎉' : '😔'}</span>
            )}
          </div>

          {/* Answer reveal */}
          <div>
            <p className="text-sm text-white/60 mb-1">
              {won ? `Solved in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}` : 'The answer was'}
            </p>
            <p className="text-xl font-bold text-amber-400">{answer}</p>
            <p className="text-xs text-white/40 mt-0.5 capitalize">{category}</p>
          </div>

          {/* Streak badge */}
          {won && currentStreak && currentStreak > 1 && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-400/25 text-sm text-amber-300 font-semibold">
              🔥 {currentStreak} day streak
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {gameMode !== 'daily' && (
              <button
                onClick={() => { onClose(); onPlayAgain?.(); }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Play Again
              </button>
            )}
            <button
              onClick={handleShare}
              className={`${gameMode === 'daily' ? 'flex-1' : ''} bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-1.5 border border-white/10`}
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copied</>
              ) : (
                <><Share2 className="w-4 h-4" /> Share</>
              )}
            </button>
          </div>

          {gameMode === 'daily' && (
            <p className="text-xs text-white/40">Come back tomorrow for a new puzzle!</p>
          )}
        </div>
      </div>
    </div>
  );
}

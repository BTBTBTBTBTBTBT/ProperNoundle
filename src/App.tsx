import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';
import StatsModal from './components/modals/StatsModal';
import HowToPlayModal from './components/modals/HowToPlayModal';
import ResultsModal from './components/modals/ResultsModal';
import SettingsModal from './components/modals/SettingsModal';
import CategoryModal from './components/modals/CategoryModal';
import { GameMode, ThemeCategory } from './types/game';
import { getDailyPuzzle, getRandomPuzzle, getDailyPuzzleNumber, getTodayString, getCategoryPuzzles } from './utils/dailyPuzzle';
import {
  getStats,
  updateDailyStats,
  updatePracticeStats,
  updateSequenceStats,
  getDailyGameState,
  getSettings,
  saveSettings,
  addGameHistory,
  updateCategoryStats,
  getAllCategoryStats,
} from './utils/storage';
import { triggerConfetti, triggerCameraFlash } from './utils/confetti';
import { useGame } from './hooks/useGame';
import { useHints } from './hooks/useHints';
import { useDailyPersistence } from './hooks/useDailyPersistence';
import { useSequence } from './hooks/useSequence';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [stats, setStats] = useState(getStats());
  const [settings, setSettings] = useState(getSettings());
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // Hooks
  const game = useGame();
  const hints = useHints();
  const { persistIfDaily } = useDailyPersistence(gameMode);
  const { sequenceState, startSequence, handleSequenceResult } = useSequence();

  const persist = useCallback(() => {
    if (!game.puzzle) return;
    persistIfDaily({
      puzzle: game.puzzle,
      guesses: game.guesses,
      currentGuess: game.currentGuess,
      gameStatus: game.gameStatus,
      hint: hints.hint,
      hintUsed: hints.hintUsed,
      vowelRevealed: hints.vowelRevealed,
      vowelUsed: hints.vowelUsed,
      consonantRevealed: hints.consonantRevealed,
      consonantUsed: hints.consonantUsed,
    });
  }, [game.puzzle, game.guesses, game.currentGuess, game.gameStatus, hints, persistIfDaily]);

  // Initialize daily puzzle on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const savedState = getDailyGameState();
      if (savedState) {
        game.restoreGame(savedState);
        hints.restoreHints({
          hint: savedState.hint || null,
          hintUsed: savedState.hintUsed || false,
          vowelRevealed: savedState.vowelRevealed || null,
          vowelUsed: savedState.vowelUsed || false,
          consonantRevealed: savedState.consonantRevealed || null,
          consonantUsed: savedState.consonantUsed || false,
        });
        if (savedState.gameStatus !== 'playing') {
          setShowResults(true);
        }
      } else {
        const dailyPuzzle = await getDailyPuzzle();
        game.resetGame(dailyPuzzle);
      }
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fullReset = useCallback(async (puzzle: Parameters<typeof game.resetGame>[0]) => {
    game.resetGame(puzzle);
    hints.resetHints();
    setShowResults(false);
  }, [game.resetGame, hints.resetHints]);

  const handleModeChange = useCallback(async (mode: GameMode) => {
    if (mode === gameMode && mode !== 'category') return;
    setGameMode(mode);

    if (mode === 'daily') {
      setSelectedCategory(null);
      const savedState = getDailyGameState();
      if (savedState) {
        game.restoreGame(savedState);
        hints.restoreHints({
          hint: savedState.hint || null,
          hintUsed: savedState.hintUsed || false,
          vowelRevealed: savedState.vowelRevealed || null,
          vowelUsed: savedState.vowelUsed || false,
          consonantRevealed: savedState.consonantRevealed || null,
          consonantUsed: savedState.consonantUsed || false,
        });
        if (savedState.gameStatus !== 'playing') setShowResults(true);
      } else {
        const dailyPuzzle = await getDailyPuzzle();
        await fullReset(dailyPuzzle);
      }
    } else if (mode === 'practice') {
      setSelectedCategory(null);
      const randomPuzzle = await getRandomPuzzle();
      await fullReset(randomPuzzle);
    } else if (mode === 'sequence') {
      setSelectedCategory(null);
      const firstPuzzle = await startSequence();
      await fullReset(firstPuzzle);
    }
  }, [gameMode, game.restoreGame, hints.restoreHints, fullReset, startSequence]);

  const handleCategorySelect = useCallback(async (category: ThemeCategory) => {
    setSelectedCategory(category);
    setGameMode('category');
    const categoryPuzzles = await getCategoryPuzzles(category, 1);
    await fullReset(categoryPuzzles[0]);
  }, [fullReset]);

  const handleWin = useCallback((guessCount: number) => {
    setTimeout(() => {
      triggerCameraFlash();
      setTimeout(() => triggerConfetti(), 200);
    }, 800);

    if (gameMode === 'daily' && game.puzzle) {
      updateDailyStats(true, guessCount);
      addGameHistory(getTodayString(), game.puzzle.id, game.puzzle.category, guessCount, true);
      setStats(getStats());
      setTimeout(() => setShowResults(true), 1500);
    } else if (gameMode === 'practice') {
      updatePracticeStats(true);
      setStats(getStats());
      setTimeout(() => setShowResults(true), 1500);
    } else if (gameMode === 'category' && selectedCategory) {
      updateCategoryStats(selectedCategory, true);
      setStats(getStats());
      setTimeout(() => setShowResults(true), 1500);
    } else if (gameMode === 'sequence' && game.puzzle) {
      const result = handleSequenceResult(game.puzzle, true, guessCount);
      if (result.done) {
        updateSequenceStats(true);
        setStats(getStats());
        setTimeout(() => setShowResults(true), 500);
      } else if (result.nextPuzzle) {
        setTimeout(() => fullReset(result.nextPuzzle!), 2000);
      }
    }
  }, [gameMode, game.puzzle, selectedCategory, handleSequenceResult, fullReset]);

  const handleLoss = useCallback((guessCount: number) => {
    if (gameMode === 'daily' && game.puzzle) {
      updateDailyStats(false, 0);
      addGameHistory(getTodayString(), game.puzzle.id, game.puzzle.category, guessCount, false);
      setStats(getStats());
      setTimeout(() => setShowResults(true), 500);
    } else if (gameMode === 'practice') {
      updatePracticeStats(false);
      setStats(getStats());
      setTimeout(() => setShowResults(true), 500);
    } else if (gameMode === 'category' && selectedCategory) {
      updateCategoryStats(selectedCategory, false);
      setStats(getStats());
      setTimeout(() => setShowResults(true), 500);
    } else if (gameMode === 'sequence' && game.puzzle) {
      const result = handleSequenceResult(game.puzzle, false, guessCount);
      if (result.done) {
        updateSequenceStats(false);
        setStats(getStats());
        setTimeout(() => setShowResults(true), 500);
      }
    }
  }, [gameMode, game.puzzle, selectedCategory, handleSequenceResult]);

  const onEnter = useCallback(() => {
    const result = game.handleEnter();
    if (!result) return;

    if (result.won) {
      handleWin(result.guesses.length);
      persist();
    } else if (result.lost) {
      handleLoss(result.guesses.length);
      persist();
    } else {
      persist();
    }
  }, [game.handleEnter, handleWin, handleLoss, persist]);

  const onFetchClue = useCallback(async () => {
    if (!game.puzzle || game.gameStatus !== 'playing') return;
    const guess = await hints.fetchClue(game.puzzle, game.answerLength);
    if (guess) {
      const lost = game.addHintGuess(guess);
      if (lost) handleLoss(game.guesses.length + 1);
      persist();
    }
  }, [game.puzzle, game.gameStatus, game.answerLength, game.guesses.length, game.addHintGuess, hints.fetchClue, handleLoss, persist]);

  const onRevealVowel = useCallback(() => {
    if (!game.puzzle || game.gameStatus !== 'playing') return;
    const guess = hints.revealVowel(game.puzzle, game.answerLength);
    if (guess) {
      const lost = game.addHintGuess(guess);
      if (lost) handleLoss(game.guesses.length + 1);
      persist();
    }
  }, [game.puzzle, game.gameStatus, game.answerLength, game.guesses.length, game.addHintGuess, hints.revealVowel, handleLoss, persist]);

  const onRevealConsonant = useCallback(() => {
    if (!game.puzzle || game.gameStatus !== 'playing') return;
    const guess = hints.revealConsonant(game.puzzle, game.answerLength);
    if (guess) {
      const lost = game.addHintGuess(guess);
      if (lost) handleLoss(game.guesses.length + 1);
      persist();
    }
  }, [game.puzzle, game.gameStatus, game.answerLength, game.guesses.length, game.addHintGuess, hints.revealConsonant, handleLoss, persist]);

  const handlePlayAgain = useCallback(async () => {
    if (gameMode === 'practice') {
      const randomPuzzle = await getRandomPuzzle();
      await fullReset(randomPuzzle);
    } else if (gameMode === 'sequence') {
      const firstPuzzle = await startSequence();
      await fullReset(firstPuzzle);
    } else if (gameMode === 'category' && selectedCategory) {
      const categoryPuzzles = await getCategoryPuzzles(selectedCategory, 1);
      await fullReset(categoryPuzzles[0]);
    }
  }, [gameMode, selectedCategory, fullReset, startSequence]);

  if (isLoading || !game.puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="ambient-glow" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          gameMode={gameMode}
          onModeChange={handleModeChange}
          onShowHelp={() => setShowHelp(true)}
          onShowStats={() => setShowStats(true)}
          onShowSettings={() => setShowSettings(true)}
          onCategorySelect={handleCategorySelect}
          categoryStats={getAllCategoryStats()}
        />

        <main className="flex-1 flex flex-col items-center px-2 sm:px-4 py-2">
          <div className="w-full max-w-2xl flex flex-col flex-1">
            {/* Theme tag + sequence progress — compact inline */}
            <div className="flex items-center justify-center gap-2 mb-1 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-400/25 text-amber-300 capitalize">
                {gameMode === 'category' && selectedCategory ? (
                  selectedCategory === 'videogames' ? 'Video Games' :
                  selectedCategory === 'currentevents' ? 'Current Events' :
                  selectedCategory
                ) : game.puzzle.themeCategory ? (
                  game.puzzle.themeCategory === 'videogames' ? 'Video Games' :
                  game.puzzle.themeCategory === 'currentevents' ? 'Current Events' :
                  game.puzzle.themeCategory
                ) : game.puzzle.category}
              </span>
              {gameMode === 'sequence' && sequenceState && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/70">
                  {sequenceState.currentPuzzleIndex + 1}/{sequenceState.totalPuzzles}
                  <span className="text-green-400">{sequenceState.results.filter(r => r.won).length} solved</span>
                </span>
              )}
            </div>

            {/* Help toolbar — compact single row */}
            {game.gameStatus === 'playing' && (
              <div className="flex items-center justify-center gap-1.5 mb-2 relative z-10">
                <button
                  onClick={onFetchClue}
                  disabled={hints.hintUsed || hints.loadingHint}
                  className={`btn-hint ${hints.hintUsed ? 'btn-hint-used' : 'bg-white/8 hover:bg-white/12 text-white/80 hover:text-white border-white/10'}`}
                >
                  {hints.loadingHint ? '...' : hints.hintUsed ? 'Clue Used' : 'Clue'}
                </button>
                <button
                  onClick={onRevealVowel}
                  disabled={hints.vowelUsed}
                  className={`btn-hint ${hints.vowelUsed ? 'btn-hint-used' : 'bg-white/8 hover:bg-white/12 text-white/80 hover:text-white border-white/10'}`}
                >
                  {hints.vowelUsed ? hints.vowelRevealed : 'Vowel'}
                </button>
                <button
                  onClick={onRevealConsonant}
                  disabled={hints.consonantUsed}
                  className={`btn-hint ${hints.consonantUsed ? 'btn-hint-used' : 'bg-white/8 hover:bg-white/12 text-white/80 hover:text-white border-white/10'}`}
                >
                  {hints.consonantUsed ? hints.consonantRevealed : 'Consonant'}
                </button>
              </div>
            )}

            {/* Clue text */}
            {hints.hint && (
              <div className="max-w-md mx-auto mb-2 bg-blue-500/10 rounded-lg px-3 py-2 border border-blue-400/20 relative z-10">
                <div className="text-white/80 text-xs leading-relaxed"><span className="font-semibold text-blue-300">Clue: </span>{hints.hint}</div>
              </div>
            )}

            <GameBoard
              guesses={game.guesses}
              currentGuess={game.currentGuess}
              maxGuesses={game.maxGuesses}
              answerLength={game.answerLength}
              highContrast={settings.highContrast}
              showFormat={game.guesses.length > 0}
              answerDisplay={game.puzzle.display}
              shouldShake={game.shouldShake}
            />

            <Keyboard
              onKeyPress={game.handleKeyPress}
              onEnter={onEnter}
              onBackspace={game.handleBackspace}
              letterStates={game.letterStates}
              disabled={game.gameStatus !== 'playing'}
              highContrast={settings.highContrast}
            />
          </div>
        </main>

        <StatsModal
          isOpen={showStats}
          onClose={() => setShowStats(false)}
          stats={stats}
        />

        <HowToPlayModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />

        <ResultsModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          won={game.gameStatus === 'won'}
          answer={game.puzzle.display}
          guesses={game.guesses}
          category={game.puzzle.category}
          gameMode={gameMode}
          puzzleNumber={gameMode === 'daily' ? getDailyPuzzleNumber() : undefined}
          currentStreak={gameMode === 'daily' ? stats.daily.currentStreak : undefined}
          onPlayAgain={handlePlayAgain}
          wikiTitle={game.puzzle.wikiTitle}
        />

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
        />

        <CategoryModal
          isOpen={showCategories}
          onClose={() => setShowCategories(false)}
          onSelectCategory={handleCategorySelect}
          categoryStats={getAllCategoryStats()}
        />
      </div>
    </div>
  );
}

export default App;

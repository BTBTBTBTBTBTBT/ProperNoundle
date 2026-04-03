import { useState, useEffect, useMemo, useRef, memo } from 'react';
import { Guess } from '../types/game';
import Tile from './Tile';
import { normalizeString } from '../utils/gameLogic';

interface GameBoardProps {
  guesses: Guess[];
  currentGuess: string;
  maxGuesses: number;
  answerLength: number;
  highContrast?: boolean;
  showFormat?: boolean;
  answerDisplay?: string;
  shouldShake?: boolean;
}

export default memo(function GameBoard({
  guesses,
  currentGuess,
  maxGuesses,
  answerLength,
  highContrast = false,
  answerDisplay = '',
  shouldShake = false,
}: GameBoardProps) {
  const [lastGuessCount, setLastGuessCount] = useState(guesses.length);
  const [shouldFlipRow, setShouldFlipRow] = useState(-1);
  const [tileSize, setTileSize] = useState(56);
  const resizeTimer = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (guesses.length > lastGuessCount) {
      setShouldFlipRow(guesses.length - 1);
      setLastGuessCount(guesses.length);
      const timer = setTimeout(() => setShouldFlipRow(-1), 1000);
      return () => clearTimeout(timer);
    }
  }, [guesses.length, lastGuessCount]);

  const wordGroups = useMemo((): number[] => {
    if (!answerDisplay) return [answerLength];
    return answerDisplay.split(' ').map(word => normalizeString(word).length);
  }, [answerDisplay, answerLength]);

  useEffect(() => {
    const calculateTileSize = () => {
      // Use visual viewport for accurate mobile Safari height
      const vv = window.visualViewport;
      const viewportHeight = vv ? vv.height : window.innerHeight;
      const viewportWidth = vv ? vv.width : window.innerWidth;

      // Reserve space for header (~90px), keyboard (~170px), toolbar+tag (~70px), padding (~30px)
      const reservedHeight = 360;
      const availableHeight = viewportHeight - reservedHeight;

      const rowGap = 6;
      const totalRowGaps = (maxGuesses - 1) * rowGap;
      const maxTileHeightFromHeight = (availableHeight - totalRowGaps) / maxGuesses;

      const wordGroupGap = 12;
      const tileGap = 4;
      const totalTiles = wordGroups.reduce((sum, count) => sum + count, 0);
      const totalGroupGaps = (wordGroups.length - 1) * wordGroupGap;
      const totalTileGaps = (totalTiles - wordGroups.length) * tileGap;
      const horizontalPadding = viewportWidth < 640 ? 32 : 64;

      const availableWidth = viewportWidth - horizontalPadding - totalGroupGaps - totalTileGaps;
      const maxTileWidthFromWidth = availableWidth / totalTiles;

      const calculatedSize = Math.min(maxTileHeightFromHeight, maxTileWidthFromWidth, 56);
      const finalSize = Math.max(calculatedSize, 16);

      setTileSize(finalSize);
    };

    calculateTileSize();

    const debouncedResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(calculateTileSize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    window.visualViewport?.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.visualViewport?.removeEventListener('resize', debouncedResize);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
    };
  }, [maxGuesses, wordGroups]);

  const renderRow = (index: number) => {
    const shouldFlip = shouldFlipRow === index;
    const isCurrentRow = index === guesses.length;
    const applyShake = shouldShake && isCurrentRow;

    if (index < guesses.length) {
      const guess = guesses[index];
      const letters = guess.word.split('');

      let letterIndex = 0;
      return (
        <div key={index} className={`flex gap-3 justify-center ${applyShake ? 'shake' : ''}`} role="row">
          {wordGroups.map((groupSize, groupIdx) => (
            <div key={groupIdx} className="flex gap-1">
              {Array(groupSize).fill('').map(() => {
                const currentIndex = letterIndex++;
                const letter = letters[currentIndex] || '';
                const displayLetter = letter === '_' ? '' : letter.toUpperCase();
                return (
                  <Tile
                    key={currentIndex}
                    letter={displayLetter}
                    state={guess.tiles[currentIndex]}
                    index={currentIndex}
                    highContrast={highContrast}
                    shouldFlip={shouldFlip}
                    size={tileSize}
                  />
                );
              })}
            </div>
          ))}
        </div>
      );
    } else if (index === guesses.length) {
      const letters = normalizeString(currentGuess).split('');
      const totalTiles = wordGroups.reduce((sum, count) => sum + count, 0);
      const tiles = Array(totalTiles).fill('');
      letters.forEach((letter, i) => {
        if (i < totalTiles) {
          tiles[i] = letter;
        }
      });

      let letterIndex = 0;
      return (
        <div key={index} className={`flex gap-3 justify-center ${applyShake ? 'shake' : ''}`} role="row">
          {wordGroups.map((groupSize, groupIdx) => (
            <div key={groupIdx} className="flex gap-1">
              {Array(groupSize).fill('').map(() => {
                const currentIndex = letterIndex++;
                return (
                  <Tile
                    key={currentIndex}
                    letter={tiles[currentIndex]}
                    state={tiles[currentIndex] ? 'tbd' : 'empty'}
                    index={currentIndex}
                    highContrast={highContrast}
                    size={tileSize}
                  />
                );
              })}
            </div>
          ))}
        </div>
      );
    } else {
      let letterIndex = 0;
      return (
        <div key={index} className="flex gap-3 justify-center" role="row">
          {wordGroups.map((groupSize, groupIdx) => (
            <div key={groupIdx} className="flex gap-1">
              {Array(groupSize).fill('').map(() => {
                const currentIndex = letterIndex++;
                return (
                  <Tile
                    key={currentIndex}
                    letter=""
                    state="empty"
                    index={currentIndex}
                    highContrast={highContrast}
                    size={tileSize}
                  />
                );
              })}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div ref={boardRef} className="flex flex-col gap-1.5 my-1 sm:my-4" role="grid">
      {Array(maxGuesses)
        .fill(0)
        .map((_, i) => renderRow(i))}
    </div>
  );
});

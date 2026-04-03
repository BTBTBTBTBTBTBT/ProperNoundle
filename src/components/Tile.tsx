import { useState, useEffect, useRef } from 'react';
import { TileState } from '../types/game';

interface TileProps {
  letter: string;
  state: TileState;
  index: number;
  highContrast?: boolean;
  shouldFlip?: boolean;
  size?: number;
}

export default function Tile({ letter, state, index, highContrast = false, shouldFlip = false, size = 56 }: TileProps) {
  const [currentState, setCurrentState] = useState<TileState>(state);
  const [isFlipping, setIsFlipping] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    // Clear any pending timers from previous flip
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (shouldFlip && (state === 'correct' || state === 'present' || state === 'absent' || state === 'hint-used')) {
      const flipDelay = index * 150;

      const t1 = window.setTimeout(() => {
        setIsFlipping(true);

        const t2 = window.setTimeout(() => {
          setCurrentState(state);
        }, 250);
        timers.current.push(t2);

        const t3 = window.setTimeout(() => {
          setIsFlipping(false);
        }, 500);
        timers.current.push(t3);
      }, flipDelay);
      timers.current.push(t1);
    } else if (!shouldFlip) {
      setCurrentState(state);
    }
  }, [shouldFlip, state, index]);

  const fontSize = size * 0.5;
  const baseClasses = 'flex items-center justify-center font-bold uppercase transition-transform duration-100';

  const getBorderClass = () => {
    if (currentState === 'empty') return 'border-2 border-white/30';
    if (currentState === 'tbd') return 'border-2 border-white/50';
    return 'border-2 border-transparent';
  };

  const stateClasses = {
    empty: 'bg-transparent text-white',
    tbd: 'bg-white/10 text-white tile-pop',
    correct: highContrast ? 'bg-orange-500 text-white' : 'bg-green-600 text-white',
    present: highContrast ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white',
    absent: 'bg-gray-700 text-white',
    'hint-used': 'bg-gray-800/60 text-gray-500',
  };

  return (
    <div
      className={`${baseClasses} ${getBorderClass()} ${stateClasses[currentState]} ${isFlipping ? 'tile-flip' : ''}`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${fontSize}px` }}
      role="gridcell"
      aria-label={`${letter || 'empty'}, ${currentState}`}
    >
      {letter}
    </div>
  );
}

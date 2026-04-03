import { useEffect, memo } from 'react';
import { Delete } from 'lucide-react';
import { TileState } from '../types/game';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  letterStates: Record<string, TileState>;
  disabled?: boolean;
  highContrast?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

export default memo(function Keyboard({
  onKeyPress,
  onEnter,
  onBackspace,
  letterStates,
  disabled = false,
  highContrast = false,
}: KeyboardProps) {
  useEffect(() => {
    const handlePhysicalKeyPress = (event: KeyboardEvent) => {
      if (disabled) return;

      if (event.key === 'Enter') {
        onEnter();
      } else if (event.key === 'Backspace') {
        onBackspace();
      } else if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
        onKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyPress);
    return () => window.removeEventListener('keydown', handlePhysicalKeyPress);
  }, [onKeyPress, onEnter, onBackspace, disabled]);

  const getKeyClasses = (key: string, state?: TileState) => {
    const baseClasses = 'rounded font-bold transition-all duration-75 active:scale-95 uppercase select-none';

    if (key === 'ENTER' || key === 'BACK') {
      return `${baseClasses} px-3 sm:px-4 py-4 text-xs sm:text-sm bg-slate-500 hover:bg-slate-400 active:bg-slate-600 text-white`;
    }

    if (!state || state === 'empty') {
      return `${baseClasses} px-2 sm:px-3 py-4 text-sm sm:text-base bg-slate-400 hover:bg-slate-300 active:bg-slate-500 text-white`;
    }

    const stateClasses = {
      'correct': highContrast ? 'bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white' : 'bg-green-600 hover:bg-green-500 active:bg-green-700 text-white',
      'present': highContrast ? 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white' : 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-white',
      'absent': 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white',
      'empty': 'bg-slate-400 hover:bg-slate-300 active:bg-slate-500 text-white',
      'tbd': 'bg-slate-400 hover:bg-slate-300 active:bg-slate-500 text-white',
      'hint-used': 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white',
    } as const;

    return `${baseClasses} px-2 sm:px-3 py-4 text-sm sm:text-base ${stateClasses[state]}`;
  };

  const handleClick = (key: string) => {
    if (disabled) return;

    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACK') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 pb-4">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center mb-1">
          {row.map(key => {
            const state = letterStates[key];
            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                className={getKeyClasses(key, state)}
                disabled={disabled}
                aria-label={key === 'BACK' ? 'Backspace' : key}
              >
                {key === 'BACK' ? (
                  <Delete className="w-5 h-5" />
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});

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
    const base = 'kbd-key';

    if (key === 'ENTER' || key === 'BACK') {
      return `${base} kbd-action`;
    }

    if (!state || state === 'empty' || state === 'tbd') {
      return `${base} kbd-default`;
    }

    const stateMap = {
      'correct': highContrast ? 'kbd-correct-hc' : 'kbd-correct',
      'present': highContrast ? 'kbd-present-hc' : 'kbd-present',
      'absent': 'kbd-absent',
      'hint-used': 'kbd-absent',
    } as const;

    return `${base} ${stateMap[state]}`;
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
    <div className="w-full max-w-lg mx-auto px-1 pb-2 sm:pb-4 flex-shrink-0">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-[3px] sm:gap-1 justify-center mb-[3px] sm:mb-1">
          {rowIndex === 1 && <div className="flex-[0.5]" />}
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
                  <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  key
                )}
              </button>
            );
          })}
          {rowIndex === 1 && <div className="flex-[0.5]" />}
        </div>
      ))}
    </div>
  );
});

import Modal from './Modal';
import { Settings } from '../../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: SettingsModalProps) {
  const toggleHighContrast = () => {
    onSettingsChange({ ...settings, highContrast: !settings.highContrast });
  };

  const toggleReduceMotion = () => {
    onSettingsChange({ ...settings, reduceMotion: !settings.reduceMotion });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div>
            <div className="font-semibold text-white">High Contrast Mode</div>
            <div className="text-sm text-white/70">
              Better color differentiation
            </div>
          </div>
          <button
            onClick={toggleHighContrast}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.highContrast ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-white/20'
            }`}
            role="switch"
            aria-checked={settings.highContrast}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg ${
                settings.highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div>
            <div className="font-semibold text-white">Reduce Motion</div>
            <div className="text-sm text-white/70">
              Minimize animations
            </div>
          </div>
          <button
            onClick={toggleReduceMotion}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.reduceMotion ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-white/20'
            }`}
            role="switch"
            aria-checked={settings.reduceMotion}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg ${
                settings.reduceMotion ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="pt-4 text-sm text-white/80">
          <p className="mb-2">
            <strong className="text-amber-400">About ProperNoundle</strong>
          </p>
          <p>
            A Wordle-style daily guessing game for proper nouns. Guess celebrities,
            sports stars, landmarks, locations, and other famous people, places, and things in 6 tries!
          </p>
        </div>
      </div>
    </Modal>
  );
}

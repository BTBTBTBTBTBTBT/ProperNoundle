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
      <div className="space-y-1">
        {[
          { label: 'High Contrast', desc: 'Orange/blue instead of green/yellow', enabled: settings.highContrast, toggle: toggleHighContrast },
          { label: 'Reduce Motion', desc: 'Minimize animations', enabled: settings.reduceMotion, toggle: toggleReduceMotion },
        ].map(setting => (
          <div key={setting.label} className="flex items-center justify-between py-3 border-b border-white/5">
            <div>
              <div className="text-sm font-medium text-white">{setting.label}</div>
              <div className="text-xs text-white/40">{setting.desc}</div>
            </div>
            <button
              onClick={setting.toggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                setting.enabled ? 'bg-amber-500' : 'bg-white/15'
              }`}
              role="switch"
              aria-checked={setting.enabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                  setting.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}

        <div className="pt-4 text-xs text-white/30">
          <p>ProperNoundle — A Wordle-style game for proper nouns.</p>
        </div>
      </div>
    </Modal>
  );
}

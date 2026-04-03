import Modal from './Modal';
import Tile from '../Tile';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How to Play">
      <div className="space-y-4 text-sm text-white/80">
        <p className="font-medium text-white">
          Guess the proper noun in 6 tries!
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Tile letter="T" state="correct" index={0} size={36} />
            <span>Correct letter, correct position</span>
          </div>
          <div className="flex items-center gap-3">
            <Tile letter="A" state="present" index={0} size={36} />
            <span>Correct letter, wrong position</span>
          </div>
          <div className="flex items-center gap-3">
            <Tile letter="X" state="absent" index={0} size={36} />
            <span>Letter not in the answer</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 space-y-1.5">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Game Modes</div>
          <p><span className="text-white font-medium">Daily</span> — One puzzle per day, shared with everyone</p>
          <p><span className="text-white font-medium">Practice</span> — Unlimited random puzzles</p>
          <p><span className="text-white font-medium">Sequence</span> — Solve 5 puzzles in a row</p>
          <p><span className="text-white font-medium">Categories</span> — Pick a topic: music, sports, movies...</p>
        </div>

        <div className="border-t border-white/10 pt-3 space-y-1.5">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Hints</div>
          <p>Three hint buttons cost 1 guess each: <span className="text-white font-medium">Clue</span> (Wikipedia summary), <span className="text-white font-medium">Vowel</span>, or <span className="text-white font-medium">Consonant</span> reveal.</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-3">
          <p className="text-xs text-amber-200">
            <span className="font-semibold">Tip:</span> After your first guess, the answer format is revealed (spaces between words).
          </p>
        </div>
      </div>
    </Modal>
  );
}

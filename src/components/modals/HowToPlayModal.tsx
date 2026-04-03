import Modal from './Modal';
import Tile from '../Tile';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How to Play">
      <div className="space-y-4 text-sm text-white/90">
        <p className="font-semibold text-white">
          Guess the answer in 6 tries. The answer can be any proper noun!
        </p>

        <div className="space-y-2">
          <h3 className="font-semibold text-amber-400">Answer Types:</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Celebrities (e.g., Taylor Swift, The Rock)</li>
            <li>Sports stars (e.g., LeBron James, Messi)</li>
            <li>Geographic locations (e.g., New York, Tokyo)</li>
            <li>Landmarks and events (e.g., Eiffel Tower, Super Bowl)</li>
            <li>Other proper nouns (brands, famous people, places, and things)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-amber-400">Rules:</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Answers can be any length (not limited to 5 letters)</li>
            <li>Each guess must match the answer length</li>
            <li>After the first guess, the answer format is revealed</li>
            <li>Only letters receive color feedback</li>
          </ul>
        </div>

        <div className="space-y-3 border-t border-white/10 pt-3">
          <h3 className="font-semibold text-amber-400">Color Feedback:</h3>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tile letter="T" state="correct" index={0} />
              <span>Green means the letter is correct and in the right position</span>
            </div>

            <div className="flex items-center gap-2">
              <Tile letter="A" state="present" index={0} />
              <span>Yellow means the letter is in the answer but wrong position</span>
            </div>

            <div className="flex items-center gap-2">
              <Tile letter="X" state="absent" index={0} />
              <span>Gray means the letter is not in the answer</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <h3 className="font-semibold text-amber-400">Game Modes:</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Daily:</strong> One puzzle per day, shared with everyone</li>
            <li><strong>Practice:</strong> Unlimited random puzzles</li>
            <li><strong>Sequence:</strong> Solve a chain of 5 puzzles in a row</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/30 rounded-lg p-3 mt-4 backdrop-blur-sm">
          <p className="text-sm text-amber-100">
            <strong className="text-amber-300">Tip:</strong> Start with common letters and pay attention to the answer format revealed after your first guess!
          </p>
        </div>
      </div>
    </Modal>
  );
}

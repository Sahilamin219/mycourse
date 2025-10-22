import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const WORD_LIST = [
  'PEACE', 'ARGUE', 'LOGIC', 'SPEAK', 'THINK', 'TRUTH', 'DEBATE',
  'POINT', 'CLAIM', 'PROOF', 'VOICE', 'AGREE', 'CLEAR', 'SMART'
];

export function WordPuzzle() {
  const [targetWord, setTargetWord] = useState('');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
  }, []);

  const checkGuess = () => {
    if (guess.length !== targetWord.length) return;

    const upperGuess = guess.toUpperCase();
    setAttempts([...attempts, upperGuess]);

    if (upperGuess === targetWord) {
      setWon(true);
      setGameOver(true);
    } else if (attempts.length >= 5) {
      setGameOver(true);
    }

    setGuess('');
  };

  const getLetterColor = (letter: string, index: number, attempt: string) => {
    if (attempt[index] === targetWord[index]) {
      return 'bg-green-500 text-white';
    } else if (targetWord.includes(letter)) {
      return 'bg-yellow-500 text-white';
    }
    return 'bg-gray-600 text-white';
  };

  const resetGame = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
    setGuess('');
    setAttempts([]);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="bg-gray-700 rounded-xl p-6">
      <h3 className="text-white font-bold text-lg mb-4 text-center">
        Word Puzzle - Guess the {targetWord.length} letter word!
      </h3>

      <div className="space-y-2 mb-4">
        {attempts.map((attempt, idx) => (
          <div key={idx} className="flex justify-center gap-2">
            {attempt.split('').map((letter, letterIdx) => (
              <div
                key={letterIdx}
                className={`w-10 h-10 flex items-center justify-center rounded font-bold ${getLetterColor(
                  letter,
                  letterIdx,
                  attempt
                )}`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}

        {!gameOver && Array(6 - attempts.length).fill(0).map((_, idx) => (
          <div key={`empty-${idx}`} className="flex justify-center gap-2">
            {Array(targetWord.length).fill(0).map((_, letterIdx) => (
              <div
                key={letterIdx}
                className="w-10 h-10 border-2 border-gray-500 rounded"
              />
            ))}
          </div>
        ))}
      </div>

      {gameOver ? (
        <div className="text-center">
          {won ? (
            <div className="mb-4">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
              <p className="text-green-400 font-bold">Congratulations!</p>
              <p className="text-white text-sm">You guessed: {targetWord}</p>
            </div>
          ) : (
            <div className="mb-4">
              <XCircle className="mx-auto text-red-500 mb-2" size={48} />
              <p className="text-red-400 font-bold">Game Over!</p>
              <p className="text-white text-sm">The word was: {targetWord}</p>
            </div>
          )}
          <button
            onClick={resetGame}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && checkGuess()}
            maxLength={targetWord.length}
            placeholder={`Enter ${targetWord.length} letters`}
            className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
          />
          <button
            onClick={checkGuess}
            disabled={guess.length !== targetWord.length}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            Submit Guess
          </button>
          <p className="text-gray-400 text-xs text-center mt-2">
            Attempts: {attempts.length}/6
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        <p className="font-semibold mb-1">How to play:</p>
        <p>🟩 Green = Correct letter & position</p>
        <p>🟨 Yellow = Correct letter, wrong position</p>
        <p>⬜ Gray = Letter not in word</p>
      </div>
    </div>
  );
}

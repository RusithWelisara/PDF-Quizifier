import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, CheckCircle, XCircle } from 'lucide-react'

export function GameInterface({ questions, onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [selectedOption, setSelectedOption] = useState(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [streak, setStreak] = useState(0)

    const currentQuestion = questions[currentIndex]

    const handleAnswer = (option) => {
        if (isAnswered) return
        setSelectedOption(option)
        setIsAnswered(true)

        const isCorrect = option === currentQuestion.answer
        if (isCorrect) {
            setScore(s => s + 100 + (streak * 10))
            setStreak(s => s + 1)
        } else {
            setStreak(0)
        }

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(i => i + 1)
                setIsAnswered(false)
                setSelectedOption(null)
            } else {
                onComplete(score + (isCorrect ? 100 + (streak * 10) : 0)) // Pass final score
            }
        }, 1500)
    }

    return (
        <div className="game-container">
            <div className="game-header">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                    />
                </div>
                <div className="stats">
                    <span>Question {currentIndex + 1}/{questions.length}</span>
                    <span className="score">Score: {score}</span>
                    <span className="streak">🔥 {streak}</span>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="question-card"
                >
                    <h2 className="question-text">{currentQuestion.question}</h2>

                    <div className="options-grid">
                        {currentQuestion.options.map((option, idx) => {
                            let className = "option-btn"
                            if (isAnswered) {
                                if (option === currentQuestion.answer) className += " correct"
                                else if (option === selectedOption) className += " incorrect"
                                else className += " disabled"
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                    className={className}
                                    onClick={() => handleAnswer(option)}
                                    disabled={isAnswered}
                                >
                                    {option}
                                    {isAnswered && option === currentQuestion.answer && <CheckCircle size={20} />}
                                    {isAnswered && option === selectedOption && option !== currentQuestion.answer && <XCircle size={20} />}
                                </motion.button>
                            )
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            <style>{`
        .game-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .game-header {
          margin-bottom: 2rem;
        }
        .progress-bar {
          height: 8px;
          background: var(--surface);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          transition: width 0.5s ease;
        }
        .stats {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          color: var(--text-dim);
        }
        .score { color: var(--text); }
        .streak { color: orange; }
        
        .question-card {
          background: var(--surface);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        .question-text {
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .option-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid transparent;
          padding: 1rem;
          border-radius: 8px;
          color: var(--text);
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .option-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          border-color: var(--primary);
        }
        .option-btn.correct {
          background: rgba(34, 197, 94, 0.2);
          border-color: var(--success);
          color: var(--success);
        }
        .option-btn.incorrect {
          background: rgba(239, 68, 68, 0.2);
          border-color: var(--error);
          color: var(--error);
        }
        .option-btn.disabled {
          opacity: 0.5;
          cursor: default;
        }
      `}</style>
        </div>
    )
}

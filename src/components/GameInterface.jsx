import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, CheckCircle, XCircle, Send, Clock } from 'lucide-react'
import { soundManager } from '../utils/soundManager'
import { SubmitQuizDialog } from './SubmitQuizDialog'

export function GameInterface({ questions, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [streak, setStreak] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    let interval = null
    if (!isPaused) {
      interval = setInterval(() => {
        setSecondsElapsed(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPaused])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (option) => {
    if (isAnswered) return
    setSelectedOption(option)
    setIsAnswered(true)

    const isCorrect = option === currentQuestion.answer
    if (isCorrect) {
      soundManager.play('correct')
      setScore(s => s + 100 + (streak * 10))
      setCorrectAnswers(c => c + 1)
      setStreak(s => s + 1)
    } else {
      soundManager.play('wrong')
      setStreak(0)
    }

    // Record the answer
    const answerRecord = {
      id: currentQuestion.id,
      question: currentQuestion.question,
      userAnswer: option,
      correctAnswer: currentQuestion.answer,
      isCorrect,
      options: currentQuestion.options
    }

    setUserAnswers(prev => [...prev, answerRecord])

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1)
        setIsAnswered(false)
        setSelectedOption(null)
      } else {
        setIsPaused(true)
        onComplete({
          totalScore: score + (isCorrect ? 100 + (streak * 10) : 0),
          correctCount: correctAnswers + (isCorrect ? 1 : 0),
          history: [...userAnswers, answerRecord],
          duration: secondsElapsed
        })
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
          <div className="timer-wrapper">
            <Clock size={16} />
            <span>{formatTime(secondsElapsed)}</span>
          </div>
          <span>Question {currentIndex + 1} / {questions.length}</span>
          <span className="score">Correct: {correctAnswers} / {questions.length}</span>
          <span className="streak">🔥 {streak}</span>
          <button
            className="header-submit-btn"
            onClick={() => {
              setIsPaused(true)
              setShowSubmitDialog(true)
            }}
            title="Submit for Admin Review"
          >
            <Send size={16} /> Submit for Review
          </button>
        </div>
      </div>

      <SubmitQuizDialog
        isOpen={showSubmitDialog}
        onClose={() => {
          setIsPaused(false)
          setShowSubmitDialog(false)
        }}
        questions={questions}
      />

      <AnimatePresence mode='wait'>
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="question-card"
        >
          {currentQuestion.context && (
            <div className="context-box">
              <div className="context-label">📖 Reference Material</div>
              <div className="context-text">{currentQuestion.context}</div>
            </div>
          )}

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
        .timer-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          color: var(--primary);
          font-family: monospace;
          font-size: 1.1rem;
          font-weight: 700;
          margin-right: 1rem;
        }
        .header-submit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 1rem;
        }
        .header-submit-btn:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
          transform: translateY(-1px);
        }
        
        .context-box {
          background: rgba(99, 102, 241, 0.1);
          border-left: 4px solid var(--primary);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: left;
        }
        .context-label {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        .context-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text);
          white-space: pre-wrap;
        }
        
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

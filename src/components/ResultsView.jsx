import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RefreshCw, Star, ChevronDown, ChevronUp, Check, X } from 'lucide-react'

export function ResultsView({ score, correctCount, totalQuestions, history, onRetry, onNewFile }) {
  const percentage = Math.round((correctCount / totalQuestions) * 100)
  const [showReview, setShowReview] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)

  const handleScroll = (e) => {
    if (e.target.scrollTop > 10) {
      setShowScrollHint(false)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="results-card"
    >
      <div className="trophy-wrapper">
        <Trophy size={64} color="#fbbf24" />
      </div>
      <h1>Quiz Completed!</h1>

      <div className="score-display">
        <span className="sc-label">Correct Answers</span>
        <span className="sc-value">{correctCount} / {totalQuestions}</span>
        <span className="sc-points">{percentage}% - {score} XP Earned</span>
      </div>

      <div className="actions">
        <button onClick={onRetry} className="action-btn secondary">
          <RefreshCw size={20} /> Try Again
        </button>
        <button onClick={onNewFile} className="action-btn primary">
          <Star size={20} /> New PDF
        </button>
      </div>

      {history && history.length > 0 && (
        <>
          <button
            className="toggle-review-btn"
            onClick={() => setShowReview(!showReview)}
          >
            {showReview ? (
              <>Hide Review <ChevronUp size={16} /></>
            ) : (
              <>Review Answers <ChevronDown size={16} /></>
            )}
          </button>

          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="review-container"
              >
                <div className="review-scroll-area" onScroll={handleScroll}>
                  <h3>Answer Review</h3>
                  {history.map((item, idx) => (
                    <div key={idx} className={`review-item ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="r-question">{idx + 1}. {item.question}</div>
                      <div className="r-meta">
                        <div className={`r-user ${!item.isCorrect ? 'wrong' : ''}`}>
                          Your Answer: {item.userAnswer}
                        </div>
                        {!item.isCorrect && (
                          <div className="r-correct">
                            Correct Answer: {item.correctAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <AnimatePresence>
                  {showScrollHint && history.length > 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, y: [0, 5, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ y: { repeat: Infinity, duration: 1.5 } }}
                      className="scroll-hint"
                    >
                      <ChevronDown size={20} />
                      <span>Scroll for more</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <style>{`
        .results-card {
           background: var(--surface);
           padding: 3rem;
           border-radius: 16px;
           text-align: center;
           margin: 2rem auto;
           max-width: 500px;
        }
        .trophy-wrapper {
          background: rgba(251, 191, 36, 0.1);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .score-display {
          margin: 2rem 0;
          background: rgba(255,255,255,0.05);
          padding: 1.5rem;
          border-radius: 12px;
        }
        .sc-label {
          display: block;
          font-size: 0.9rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }
        .sc-value {
          font-size: 3rem;
          font-weight: 900;
          color: var(--primary);
          line-height: 1;
        }
        .sc-points {
          display: block;
          font-size: 1rem;
          color: var(--text-dim);
          margin-top: 0.5rem;
          font-weight: 500;
        }
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .action-btn {
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s;
        }
        .action-btn:hover {
          transform: translateY(-2px);
        }
        .action-btn.primary {
          background: var(--primary);
          color: white;
        }
        .action-btn.secondary {
          background: transparent;
          border: 1px solid var(--text-dim);
          color: var(--text);
        }
        .action-btn.secondary:hover {
          background: rgba(255,255,255,0.05);
        }
        
        .review-container {
            position: relative;
            margin-top: 2rem;
            background: rgba(0,0,0,0.2);
            border-radius: 12px;
            overflow: hidden;
        }

        .review-scroll-area {
          text-align: left;
          padding: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }
        .review-scroll-area h3 {
          margin-top: 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
          position: sticky;
          top: 0;
          background: rgba(28, 28, 30, 0.95);
          z-index: 10;
          backdrop-filter: blur(5px);
        }

        .scroll-hint {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            color: var(--primary);
            font-size: 0.8rem;
            pointer-events: none;
            background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
            padding-bottom: 0.5rem;
            padding-top: 3rem;
        }

        .review-item {
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid transparent;
        }
        .review-item.correct {
          border-left-color: var(--success);
        }
        .review-item.incorrect {
          border-left-color: var(--error);
        }
        .r-question {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .r-meta {
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .r-user {
          color: var(--text-dim);
        }
        .r-user.wrong {
          color: var(--error);
        }
        .r-correct {
          color: var(--success);
          font-weight: 600;
        }
        .toggle-review-btn {
          width: 100%;
          margin-top: 1rem;
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.2);
          color: var(--text-dim);
          padding: 0.8rem;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .toggle-review-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
      `}</style>
    </motion.div>
  )
}

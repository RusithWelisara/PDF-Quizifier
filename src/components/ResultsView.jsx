import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, RefreshCw, Star } from 'lucide-react'

export function ResultsView({ score, correctCount, totalQuestions, onRetry, onNewFile }) {
  const percentage = Math.round((correctCount / totalQuestions) * 100)

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
        <span className="sc-points">{score} XP Earned</span>
      </div>

      <div className="actions">
        <button onClick={onRetry} className="action-btn secondary">
          <RefreshCw size={20} /> Try Again
        </button>
        <button onClick={onNewFile} className="action-btn primary">
          <Star size={20} /> New PDF
        </button>
      </div>

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
      `}</style>
    </motion.div>
  )
}

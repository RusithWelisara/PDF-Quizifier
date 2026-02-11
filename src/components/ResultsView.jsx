import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generatePerformanceReview } from '../utils/aiParser'
import { SubmitQuizDialog } from './SubmitQuizDialog'
import { Trophy, RefreshCw, Star, ChevronDown, ChevronUp, Check, X, Sparkles, Upload } from 'lucide-react'

export function ResultsView({ score, correctCount, totalQuestions, history, duration, onRetry, onNewFile }) {
  const percentage = Math.round((correctCount / totalQuestions) * 100)
  const [showReview, setShowReview] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [aiReview, setAiReview] = useState(null)
  const [loadingReview, setLoadingReview] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  const handleScroll = (e) => {
    if (e.target.scrollTop > 10) {
      setShowScrollHint(false)
    }
  }

  const handleGetReview = async () => {
    if (aiReview) return // Already loaded

    setLoadingReview(true)
    try {
      const review = await generatePerformanceReview(history, { correctCount }, totalQuestions)
      setAiReview(review)
    } catch (error) {
      alert("Failed to generate AI review. Check your API key.")
    } finally {
      setLoadingReview(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const averageTime = duration ? (duration / totalQuestions).toFixed(1) : 0

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

      <div className="time-stats">
        <div className="time-card">
          <span className="time-label">Total Time</span>
          <span className="time-value">{formatTime(duration)}</span>
        </div>
        <div className="time-card">
          <span className="time-label">Avg. / Question</span>
          <span className="time-value">{averageTime}s</span>
        </div>
      </div>

      <div className="actions">
        <button onClick={onRetry} className="action-btn secondary">
          <RefreshCw size={20} /> Try Again
        </button>
        <button onClick={() => setShowSubmitDialog(true)} className="action-btn submit">
          <Upload size={20} /> Submit Quiz
        </button>
        <button onClick={onNewFile} className="action-btn primary">
          <Star size={20} /> New PDF
        </button>
      </div>

      <SubmitQuizDialog
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        questions={history}
      />

      {/* AI Review Section */}
      <div className="ai-section">
        {!aiReview ? (
          <button
            className="ai-review-btn"
            onClick={handleGetReview}
            disabled={loadingReview}
          >
            <Sparkles size={18} className={loadingReview ? 'spin' : ''} />
            {loadingReview ? "Analyzing Performance..." : "Get AI Performance Report"}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ai-report"
          >
            <h3><Sparkles size={18} color="var(--secondary)" /> AI Performance Analysis</h3>
            <div className="report-grid">
              <div className="report-card strength">
                <h4>🌟 Strengths</h4>
                <p>{aiReview.strengths}</p>
              </div>
              <div className="report-card weakness">
                <h4>🎯 Focus Areas</h4>
                <p>{aiReview.weaknesses}</p>
              </div>
            </div>
            <div className="report-card advice">
              <h4>💡 Pro Tip</h4>
              <p>{aiReview.advice}</p>
            </div>
          </motion.div>
        )}
      </div>

      {history && history.length > 0 && (
        <>
          <button
            className="toggle-review-btn"
            onClick={() => setShowReview(!showReview)}
          >
            {showReview ? (
              <>Hide Answer Key <ChevronUp size={16} /></>
            ) : (
              <>Show Answer Key <ChevronDown size={16} /></>
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
                  <h3>Detailed Answer Key</h3>
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
           max-width: 600px; /* Increased width for better report layout */
        }
        .trophy-wrapper {
          background: rgba(251, 191, 36, 0.1);
          width: 80px;
          height: 80px;
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
        .time-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .time-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .time-label {
          font-size: 0.75rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .time-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary);
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
        .action-btn.submit {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }
        .action-btn.submit:hover {
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        
        /* AI Section Styles */
        .ai-section {
          margin: 2rem 0;
        }
        .ai-review-btn {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border: none;
          padding: 1rem 2rem;
          border-radius: 99px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .ai-review-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }
        .ai-review-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .ai-report {
          text-align: left;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .ai-report h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0;
          color: var(--secondary);
          margin-bottom: 1.5rem;
        }
        .report-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .report-card {
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 8px;
        }
        .report-card h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-dim);
        }
        .report-card p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .strength h4 { color: #fbbf24; }
        .weakness h4 { color: #ef4444; }
        .advice h4 { color: #6366f1; }
        
        
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
          max-height: 60vh;
          overflow-y: auto;
        }
        .review-scroll-area h3 {
          margin-top: 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
          color: var(--text-dim);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
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

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, BookOpen, Calendar } from 'lucide-react'
import { supabase } from '../utils/supabase'

const SUBJECTS = [
    "Buddhism",
    "Sinhala Language & Literature",
    "English Language",
    "Mathematics",
    "History",
    "Science",
    "English Literature",
    "Commerce",
    "ICT"
]

const YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"]

export function SubmitQuizDialog({ isOpen, onClose, questions }) {
    const [subject, setSubject] = useState('')
    const [year, setYear] = useState('')
    const [title, setTitle] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!subject || !year) {
            alert('Please select both subject and year')
            return
        }

        setSubmitting(true)
        try {
            // Strip user answers from questions - only send question structure
            const cleanQuestions = questions.map(q => ({
                id: q.id,
                question: q.question,
                options: q.options,
                answer: q.correctAnswer,
                ...(q.context && { context: q.context })
            }))

            const { data, error } = await supabase
                .from('quizzes')
                .insert({
                    title: title || `${subject} ${year}`,
                    subject,
                    year,
                    questions: cleanQuestions,
                    status: 'pending'
                })

            if (error) throw error

            alert('✅ Quiz submitted for review! Admins will review it soon.')
            onClose()
        } catch (error) {
            console.error('Submission error:', error)
            alert('Failed to submit quiz. Please check your connection.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="submit-dialog"
                    >
                        <div className="dialog-header">
                            <h2>📤 Submit Quiz for Review</h2>
                            <button className="close-btn" onClick={onClose}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="dialog-body">
                            <p className="dialog-description">
                                Submit this quiz to be reviewed by admins and added to the public library.
                            </p>

                            <div className="form-group">
                                <label>
                                    <BookOpen size={16} /> Subject *
                                </label>
                                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                                    <option value="">Select subject</option>
                                    {SUBJECTS.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    <Calendar size={16} /> Year *
                                </label>
                                <select value={year} onChange={(e) => setYear(e.target.value)}>
                                    <option value="">Select year</option>
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Quiz Title (Optional)</label>
                                <input
                                    type="text"
                                    placeholder={subject && year ? `${subject} ${year}` : "e.g., Mathematics 2024 MCQ"}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="quiz-info">
                                <span>{questions.length} questions</span>
                            </div>
                        </div>

                        <div className="dialog-footer">
                            <button className="cancel-btn" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={submitting || !subject || !year}
                            >
                                <Send size={18} />
                                {submitting ? 'Submitting...' : 'Submit for Review'}
                            </button>
                        </div>

                        <style>{`
              .modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: 999;
              }
              .submit-dialog {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--surface);
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                z-index: 1000;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
              }
              .dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
              }
              .dialog-header h2 {
                margin: 0;
                font-size: 1.5rem;
              }
              .close-btn {
                background: transparent;
                border: none;
                color: var(--text-dim);
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 8px;
                transition: all 0.2s;
              }
              .close-btn:hover {
                background: rgba(255,255,255,0.1);
                color: white;
              }
              .dialog-body {
                padding: 1.5rem;
              }
              .dialog-description {
                color: var(--text-dim);
                margin-bottom: 1.5rem;
                font-size: 0.95rem;
              }
              .form-group {
                margin-bottom: 1.5rem;
              }
              .form-group label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
              }
              .form-group select,
              .form-group input {
                width: 100%;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: white;
                padding: 0.75rem;
                border-radius: 8px;
                font-size: 1rem;
                transition: all 0.2s;
              }
              .form-group select:focus,
              .form-group input:focus {
                outline: none;
                border-color: var(--primary);
                background: rgba(255,255,255,0.08);
              }
              .form-group select option {
                background: var(--surface);
                color: white;
              }
              .quiz-info {
                background: rgba(99, 102, 241, 0.1);
                padding: 0.75rem;
                border-radius: 8px;
                text-align: center;
                color: var(--primary);
                font-weight: 600;
              }
              .dialog-footer {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 1px solid rgba(255,255,255,0.1);
              }
              .cancel-btn,
              .submit-btn {
                flex: 1;
                padding: 0.875rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
              }
              .cancel-btn {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.2);
                color: var(--text);
              }
              .cancel-btn:hover {
                background: rgba(255,255,255,0.05);
              }
              .submit-btn {
                background: var(--primary);
                border: none;
                color: white;
              }
              .submit-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
              }
              .submit-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }
            `}</style>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

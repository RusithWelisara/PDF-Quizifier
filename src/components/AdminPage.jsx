import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Eye, Loader, Lock } from 'lucide-react'
import { supabase } from '../utils/supabase'

export function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [pendingQuizzes, setPendingQuizzes] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState(null)

    useEffect(() => {
        const isAuth = sessionStorage.getItem('admin_auth') === 'true'
        setAuthenticated(isAuth)
        if (isAuth) {
            fetchPendingQuizzes()
        }
    }, [])

    const handleLogin = () => {
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD
        if (password === adminPassword) {
            sessionStorage.setItem('admin_auth', 'true')
            setAuthenticated(true)
            fetchPendingQuizzes()
        } else {
            alert('Incorrect password')
        }
    }

    const fetchPendingQuizzes = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .eq('status', 'pending')
                .order('submitted_at', { ascending: false })

            if (error) throw error
            setPendingQuizzes(data || [])
        } catch (error) {
            console.error('Failed to fetch pending quizzes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (quizId) => {
        try {
            const { error } = await supabase
                .from('quizzes')
                .update({ status: 'approved', approved_at: new Date().toISOString() })
                .eq('id', quizId)

            if (error) throw error
            alert('✅ Quiz approved!')
            fetchPendingQuizzes()
            setSelectedQuiz(null)
        } catch (error) {
            console.error('Failed to approve quiz:', error)
            alert('Failed to approve quiz')
        }
    }

    const handleReject = async (quizId) => {
        try {
            const { error } = await supabase
                .from('quizzes')
                .update({ status: 'rejected' })
                .eq('id', quizId)

            if (error) throw error
            alert('❌ Quiz rejected')
            fetchPendingQuizzes()
            setSelectedQuiz(null)
        } catch (error) {
            console.error('Failed to reject quiz:', error)
            alert('Failed to reject quiz')
        }
    }

    if (!authenticated) {
        return (
            <div className="admin-login">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="login-card"
                >
                    <Lock size={48} className="lock-icon" />
                    <h2>Admin Access</h2>
                    <input
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <button onClick={handleLogin}>Login</button>
                </motion.div>

                <style>{`
          .admin-login {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .login-card {
            background: var(--surface);
            padding: 3rem;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .lock-icon {
            color: var(--primary);
            margin-bottom: 1rem;
          }
          .login-card h2 {
            margin-bottom: 2rem;
          }
          .login-card input {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            font-size: 1rem;
            margin-bottom: 1rem;
          }
          .login-card input:focus {
            outline: none;
            border-color: var(--primary);
          }
          .login-card button {
            width: 100%;
            background: var(--primary);
            border: none;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .login-card button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
          }
        `}</style>
            </div>
        )
    }

    return (
        <div className="admin-container">
            <h1>📊 Admin Dashboard</h1>
            <p className="subtitle">Review and approve submitted quizzes</p>

            {loading ? (
                <div className="loading">
                    <Loader size={48} className="spinner" />
                </div>
            ) : (
                <div className="quizzes-list">
                    {pendingQuizzes.length === 0 ? (
                        <div className="empty-state">
                            <p>No pending quizzes to review</p>
                        </div>
                    ) : (
                        pendingQuizzes.map((quiz) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="quiz-item"
                            >
                                <div className="quiz-header">
                                    <h3>{quiz.title}</h3>
                                    <div className="quiz-meta">
                                        <span className="badge">{quiz.subject}</span>
                                        <span className="badge">{quiz.year}</span>
                                    </div>
                                </div>
                                <div className="quiz-info">
                                    <span>{quiz.questions.length} questions</span>
                                    <span>Submitted: {new Date(quiz.submitted_at).toLocaleDateString()}</span>
                                </div>
                                <div className="quiz-actions">
                                    <button
                                        className="preview-btn"
                                        onClick={() => setSelectedQuiz(selectedQuiz?.id === quiz.id ? null : quiz)}
                                    >
                                        <Eye size={18} /> {selectedQuiz?.id === quiz.id ? 'Hide' : 'Preview'}
                                    </button>
                                    <button className="approve-btn" onClick={() => handleApprove(quiz.id)}>
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button className="reject-btn" onClick={() => handleReject(quiz.id)}>
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>

                                {selectedQuiz?.id === quiz.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="preview-section"
                                    >
                                        <h4>Preview</h4>
                                        <div className="questions-preview">
                                            {quiz.questions.slice(0, 3).map((q, i) => (
                                                <div key={i} className="question-preview">
                                                    <p><strong>Q{i + 1}:</strong> {q.question}</p>
                                                    <ul>
                                                        {q.options.map((opt, j) => (
                                                            <li key={j} className={opt === q.answer ? 'correct' : ''}>
                                                                {opt} {opt === q.answer && '✓'}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                            {quiz.questions.length > 3 && (
                                                <p className="more-questions">...and {quiz.questions.length - 3} more questions</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            <style>{`
        .admin-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }
        .admin-container h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: var(--text-dim);
          margin-bottom: 2rem;
        }
        .loading {
          text-align: center;
          padding: 3rem;
          color: var(--primary);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-dim);
        }
        .quizzes-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .quiz-item {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .quiz-header h3 {
          margin: 0;
        }
        .quiz-meta {
          display: flex;
          gap: 0.5rem;
        }
        .badge {
          background: rgba(99, 102, 241, 0.2);
          color: var(--primary);
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .quiz-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          color: var(--text-dim);
          font-size: 0.9rem;
        }
        .quiz-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .quiz-actions button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .preview-btn {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .approve-btn {
          background: #10b981;
          color: white;
        }
        .reject-btn {
          background: #ef4444;
          color: white;
        }
        .quiz-actions button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .preview-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .preview-section h4 {
          margin-bottom: 1rem;
          color: var(--primary);
        }
        .questions-preview {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .question-preview {
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 8px;
        }
        .question-preview p {
          margin-bottom: 0.5rem;
        }
        .question-preview ul {
          list-style: none;
          padding: 0;
        }
        .question-preview li {
          padding: 0.5rem;
          margin: 0.25rem 0;
          border-radius: 6px;
          background: rgba(255,255,255,0.05);
        }
        .question-preview li.correct {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          font-weight: 600;
        }
        .more-questions {
          text-align: center;
          color: var(--text-dim);
          font-style: italic;
        }
      `}</style>
        </div>
    )
}

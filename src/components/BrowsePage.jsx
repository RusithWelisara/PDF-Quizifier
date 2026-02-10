import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Calendar, BookOpen, Clock } from 'lucide-react'

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

// Placeholder data generator
const generatePlaceholders = () => {
    return Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        title: `Past Paper Quiz ${2025 - i}`,
        subject: SUBJECTS[i % SUBJECTS.length],
        year: `${2025 - (i % 5)}`,
        questions: 20 + i * 5,
        duration: "45 mins"
    }))
}

export function BrowsePage() {
    const [selectedSubject, setSelectedSubject] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [quizzes] = useState(generatePlaceholders())

    const filteredQuizzes = quizzes.filter(quiz => {
        return (
            (!selectedSubject || quiz.subject === selectedSubject) &&
            (!selectedYear || quiz.year === selectedYear)
        )
    })

    return (
        <div className="browse-container">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="browse-header"
            >
                <h1>Browse Quizzes</h1>
                <p>Practice with past papers and curated quizzes.</p>
            </motion.div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <BookOpen size={18} />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">All Subjects</option>
                        {SUBJECTS.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <Calendar size={18} />
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">All Years</option>
                        {YEARS.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Quiz Grid */}
            <div className="quiz-grid">
                {filteredQuizzes.length > 0 ? (
                    filteredQuizzes.map((quiz) => (
                        <motion.div
                            key={quiz.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ y: -5 }}
                            className="quiz-card"
                        >
                            <div className="card-badge">{quiz.year}</div>
                            <h3>{quiz.subject}</h3>
                            <div className="card-info">
                                <span>{quiz.questions} Questions</span>
                                <span>•</span>
                                <span><Clock size={14} style={{ marginBottom: -2 }} /> {quiz.duration}</span>
                            </div>
                            <button className="start-btn">Start Quiz</button>
                        </motion.div>
                    ))
                ) : (
                    <div className="no-results">
                        <Search size={48} />
                        <p>No quizzes found for these filters.</p>
                    </div>
                )}
            </div>

            <style>{`
        .browse-container {
            width: 100%;
            max-width: 900px;
            padding: 1rem;
        }
        .browse-header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(to right, #fff, #9ca3af);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .browse-header p {
            color: var(--text-dim);
            margin-bottom: 2rem;
        }

        .filters-bar {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        .filter-group {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-dim);
        }
        .filter-group select {
            background: transparent;
            border: none;
            color: white;
            font-size: 1rem;
            outline: none;
            cursor: pointer;
        }
        .filter-group select option {
            background: var(--surface);
            color: white;
        }

        .quiz-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
        }
        
        .quiz-card {
            background: var(--surface);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 1.5rem;
            position: relative;
            transition: all 0.3s;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .quiz-card:hover {
            border-color: var(--primary);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
        }
        .card-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            padding: 0.2rem 0.6rem;
            border-radius: 99px;
            font-size: 0.8rem;
            font-weight: 700;
        }
        .quiz-card h3 {
            margin: 1.5rem 0 0.5rem 0;
            font-size: 1.2rem;
        }
        .card-info {
            display: flex;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--text-dim);
            margin-bottom: 1.5rem;
        }
        .start-btn {
            width: 100%;
            background: transparent;
            border: 1px solid var(--text-dim);
            color: var(--text);
            padding: 0.8rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .quiz-card:hover .start-btn {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
        }

        .no-results {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: var(--text-dim);
            border: 2px dashed rgba(255,255,255,0.1);
            border-radius: 12px;
        }
      `}</style>
        </div>
    )
}

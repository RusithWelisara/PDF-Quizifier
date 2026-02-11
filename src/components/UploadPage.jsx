import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractTextFromPDF } from '../utils/pdf'
import { generateQuiz } from '../utils/quiz'
import { soundManager } from '../utils/soundManager'
import { UploadZone } from './UploadZone'
import { GameInterface } from './GameInterface'
import { ResultsView } from './ResultsView'
import { Settings } from './Settings'
import { Settings as SettingsIcon } from 'lucide-react'

export function UploadPage() {
    const [gameState, setGameState] = useState('upload') // upload, processing, quiz, results
    const [questions, setQuestions] = useState([])
    const [score, setScore] = useState({ totalScore: 0, correctCount: 0 })
    const [loading, setLoading] = useState(false)
    const [originalFile, setOriginalFile] = useState(null)
    const [showSettings, setShowSettings] = useState(false)

    const handleFileSelected = async (file, markingScheme) => {
        setLoading(true)
        setOriginalFile(file)
        try {
            const text = await extractTextFromPDF(file)
            const generatedQuestions = await generateQuiz(text, 5, markingScheme)

            if (generatedQuestions[0]?.id === "failed") {
                alert(generatedQuestions[0].question)
                setLoading(false)
                return
            }

            setQuestions(generatedQuestions)
            setGameState('quiz')
        } catch (error) {
            console.error(error)
            if (error.message === 'API_KEY_MISSING') {
                alert("Please set your Gemini API key in Settings to use AI extraction.")
                setShowSettings(true)
            } else {
                alert("Failed to parse PDF: " + error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleTextSubmit = async (text, markingScheme) => {
        setLoading(true)
        try {
            const generatedQuestions = await generateQuiz(text, 5, markingScheme)

            if (generatedQuestions[0]?.id === "failed") {
                alert(generatedQuestions[0].question)
                setLoading(false)
                return
            }

            setQuestions(generatedQuestions)
            setGameState('quiz')
        } catch (error) {
            console.error(error)
            if (error.message === 'API_KEY_MISSING') {
                alert("Please set your Gemini API key in Settings to use AI extraction.")
                setShowSettings(true)
            } else {
                alert("Failed to parse text: " + error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleQuizComplete = (scoreData) => {
        soundManager.play('complete')
        setScore(scoreData)
        setGameState('results')
    }

    const handleRetry = () => {
        setScore({ totalScore: 0, correctCount: 0 })
        setGameState('quiz')
    }

    const handleNewFile = () => {
        setScore({ totalScore: 0, correctCount: 0 })
        setQuestions([])
        setGameState('upload')
    }

    return (
        <div className="upload-page-container">
            <div className="page-header">
                <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="page-title"
                >
                    Generate Quiz
                </motion.h1>
                <button
                    className="settings-toggle"
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                >
                    <SettingsIcon size={24} />
                </button>
            </div>

            <AnimatePresence mode='wait'>
                {gameState === 'upload' && (
                    <UploadZone
                        onFileSelected={handleFileSelected}
                        onTextSubmit={handleTextSubmit}
                        isLoading={loading}
                        key="upload"
                    />
                )}
                {gameState === 'quiz' && (
                    <GameInterface questions={questions} onComplete={handleQuizComplete} key="quiz" />
                )}
                {gameState === 'results' && (
                    <ResultsView
                        score={score.totalScore}
                        correctCount={score.correctCount}
                        totalQuestions={questions.length}
                        history={score.history}
                        onRetry={handleRetry}
                        onNewFile={handleNewFile}
                        key="results"
                    />
                )}
            </AnimatePresence>

            <Settings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            <style>{`
        .upload-page-container {
            width: 100%;
            max-width: 800px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .page-header {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        .page-title {
            font-size: 2rem;
            margin: 0;
            font-weight: 800;
            background: linear-gradient(to right, #fff, #9ca3af);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .settings-toggle {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-dim);
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        .settings-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-color: var(--primary);
            transform: rotate(45deg);
        }
      `}</style>
        </div>
    )
}

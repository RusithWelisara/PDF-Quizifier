import React, { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, HelpCircle, X } from 'lucide-react'
import tutorialVideo from '../assets/Parser Text.mp4'

export function UploadZone({ onFileSelected, onTextSubmit, isLoading }) {
  const [activeTab, setActiveTab] = useState('upload')
  const [textInput, setTextInput] = useState('')
  const [markingScheme, setMarkingScheme] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    if (isLoading) return
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      onFileSelected(file, markingScheme)
    }
  }, [onFileSelected, isLoading, markingScheme])

  const handleFileInput = useCallback((e) => {
    if (isLoading) return
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      onFileSelected(file, markingScheme)
    }
  }, [onFileSelected, isLoading, markingScheme])

  const handleTextSubmit = () => {
    if (textInput.trim() && !isLoading) {
      onTextSubmit(textInput, markingScheme)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="upload-container"
    >
      <button
        className="help-button"
        onClick={() => setShowTutorial(true)}
        title="View Tutorial"
      >
        <HelpCircle size={24} />
      </button>

      <div className="tab-switcher">
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload size={18} /> Upload PDF
        </button>
        <button
          className={`tab ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <FileText size={18} /> Paste Text
        </button>
      </div>

      {activeTab === 'upload' && (
        <div
          className="upload-card"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="icon-wrapper">
            <Upload size={48} color="var(--primary)" />
          </div>
          <h2>Upload your PDF</h2>
          <p>Drag and drop your study material here to generate a quiz instantly.</p>

          <label className={`upload-btn ${isLoading ? 'disabled' : ''}`}>
            {isLoading ? 'Processing...' : 'Select File'}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              disabled={isLoading}
              style={{ display: 'none' }}
            />
          </label>

          <div className="optional-section">
            <h3><span>(Optional)</span> Marking Scheme</h3>
            <p>Paste the correct answers here to improve accuracy.</p>
            <textarea
              className="marking-scheme-input"
              placeholder="e.g. 1. Paris, 2. 1945, 3. Option 4..."
              value={markingScheme}
              onChange={(e) => setMarkingScheme(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {isLoading && <div className="loader"></div>}
        </div>
      )}

      {activeTab === 'text' && (
        <div className="text-input-card">
          <div className="icon-wrapper">
            <FileText size={48} color="var(--primary)" />
          </div>
          <h2>Paste MCQ Text</h2>
          <p>Copy your questions from the PDF and paste them here.</p>

          <textarea
            className="text-input"
            placeholder="Paste your MCQ questions here...&#10;&#10;Example:&#10;1. What is the capital of France?&#10;1. Berlin&#10;2. Paris&#10;3. London&#10;4. Madrid&#10;Answer: 2"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isLoading}
          />

          <button
            className={`upload-btn ${isLoading || !textInput.trim() ? 'disabled' : ''}`}
            onClick={handleTextSubmit}
            disabled={isLoading || !textInput.trim()}
          >
            {isLoading ? 'Processing...' : 'Generate Quiz'}
          </button>

          <div className="optional-section">
            <h3><span>(Optional)</span> Marking Scheme</h3>
            <p>Paste the correct answers here so AI uses them.</p>
            <textarea
              className="marking-scheme-input"
              placeholder="e.g. 1. 2, 2. Paris, 3. c)..."
              value={markingScheme}
              onChange={(e) => setMarkingScheme(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {isLoading && <div className="loader"></div>}
        </div>
      )}

      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowTutorial(false)}>
                <X size={24} />
              </button>
              <h3>How to use Paste Text</h3>
              <div className="video-container">
                <video
                  src={tutorialVideo}
                  controls
                  autoPlay
                  className="tutorial-video"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .upload-container {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .help-button {
          position: absolute;
          top: -1rem;
          right: -1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-dim);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 10;
        }
        .help-button:hover {
          background: var(--primary);
          color: white;
          transform: scale(1.1);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }
        .modal-content {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          width: 100%;
          max-width: 900px;
          position: relative;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        }
        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: #ef4444;
          color: white;
        }
        .modal-content h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        .video-container {
          width: 100%;
          aspect-ratio: 16/9;
          background: black;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .tutorial-video {
          width: 100%;
          height: 100%;
        }
        .tab-switcher {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.4rem;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: fit-content;
        }
        .tab {
          padding: 0.6rem 1.5rem;
          border-radius: 10px;
          color: var(--text-dim);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          border: none;
          background: transparent;
        }
        .tab:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
        }
        .tab.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .upload-card, .text-input-card {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          width: 100%;
          max-height: 65vh;
          overflow-x: hidden;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }
        .text-input-card {
          border-style: solid;
        }
        .icon-wrapper {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05));
          padding: 1.2rem;
          border-radius: 20px;
          margin-bottom: 0.5rem;
        }
        h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
        }
        p {
          color: var(--text-dim);
          text-align: center;
          max-width: 400px;
          margin: 0;
          line-height: 1.6;
        }
        .text-input {
          width: 100%;
          min-height: 250px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.2rem;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          resize: none;
          margin-top: 0.5rem;
          transition: border-color 0.3s;
          line-height: 1.5;
        }
        .text-input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(0, 0, 0, 0.3);
        }
        .upload-btn {
          background: var(--primary);
          color: white;
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        .upload-btn:hover:not(.disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }
        .upload-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
        .optional-section {
          width: 100%;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          text-align: left;
        }
        .optional-section h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .optional-section h3 span {
          color: var(--primary);
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .optional-section p {
          text-align: left;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }
        .marking-scheme-input {
          width: 100%;
          min-height: 80px;
          max-height: 150px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem;
          color: var(--text);
          font-size: 0.9rem;
          resize: vertical;
          transition: border-color 0.3s;
        }
        .marking-scheme-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .loader {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Custom scrollbar */
        .upload-card::-webkit-scrollbar, .text-input-card::-webkit-scrollbar {
          width: 6px;
        }
        .upload-card::-webkit-scrollbar-thumb, .text-input-card::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .upload-card::-webkit-scrollbar-thumb:hover, .text-input-card::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </motion.div>
  )
}

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, X, Save, Key, Trash2, Volume2, VolumeX } from 'lucide-react'
import { soundManager } from '../utils/soundManager'

export function Settings({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isMuted, setIsMuted] = useState(soundManager.isMuted())

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY')
    if (savedKey) setApiKey(savedKey)
  }, [isOpen])

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey)
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 1500)

    // Dispatch custom event to notify aiParser
    window.dispatchEvent(new Event('api-key-updated'))
  }

  const handleClear = () => {
    localStorage.removeItem('GEMINI_API_KEY')
    setApiKey('')
    window.dispatchEvent(new Event('api-key-updated'))
  }

  const handleToggleSound = () => {
    const newMutedState = soundManager.toggleMute()
    setIsMuted(newMutedState)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-header">
              <div className="title-area">
                <SettingsIcon className="icon-glow" size={24} />
                <h3>Settings</h3>
              </div>
              <button className="close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="settings-content">
              <div className="input-group">
                <label>
                  <Key size={16} />
                  Gemini API Key
                </label>
                <div className="key-input-wrapper">
                  <input
                    type="password"
                    placeholder="Enter your API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  {apiKey && (
                    <button className="clear-key-btn" onClick={handleClear} title="Clear Key">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="help-text">
                  Your key is stored locally in your browser and never sent to our servers.
                  Get one at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.
                </p>
              </div>

              <div className="input-group" style={{ marginTop: '1.5rem' }}>
                <label>
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  Sound Effects
                </label>
                <button
                  className={`toggle-sound-btn ${!isMuted ? 'active' : ''}`}
                  onClick={handleToggleSound}
                >
                  <div className="toggle-handle" />
                </button>
              </div>
            </div>

            <div className="settings-footer">
              <button
                className={`save-btn ${isSaved ? 'success' : ''}`}
                onClick={handleSave}
                disabled={!apiKey}
              >
                {isSaved ? 'Saved!' : (
                  <>
                    <Save size={18} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        .settings-modal {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2rem;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .title-area {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .title-area h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        .icon-glow {
          color: var(--primary);
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
        }
        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .input-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-dim);
        }
        .key-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .key-input-wrapper input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.8rem 3rem 0.8rem 1rem;
          color: white;
          font-family: monospace;
          font-size: 0.9rem;
          transition: all 0.3s;
        }
        .key-input-wrapper input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(0, 0, 0, 0.3);
        }
        .clear-key-btn {
          position: absolute;
          right: 0.8rem;
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .clear-key-btn:hover {
          opacity: 1;
        }
        .help-text {
          font-size: 0.8rem;
          color: var(--text-dim);
          line-height: 1.5;
          margin: 0;
        }
        .help-text a {
          color: var(--primary);
          text-decoration: none;
        }
        .help-text a:hover {
          text-decoration: underline;
        }
        .settings-footer {
          margin-top: 2rem;
        }
        .save-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.8rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }
        .save-btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .save-btn.success {
          background: #10b981;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .toggle-sound-btn {
          width: 50px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          border: none;
          position: relative;
          cursor: pointer;
          transition: background 0.3s;
        }
        .toggle-sound-btn.active {
          background: var(--primary);
        }
        .toggle-handle {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .toggle-sound-btn.active .toggle-handle {
          transform: translateX(22px);
        }
      `}</style>
    </AnimatePresence>
  )
}

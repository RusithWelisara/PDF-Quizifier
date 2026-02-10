class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)()
        this.muted = localStorage.getItem('quiz_sound_muted') === 'true'
    }

    play(type) {
        if (this.muted) return
        if (this.ctx.state === 'suspended') this.ctx.resume()

        switch (type) {
            case 'correct':
                this._playCorrect()
                break
            case 'wrong':
                this._playWrong()
                break
            case 'complete':
                this._playComplete()
                break
            case 'hover':
                this._playHover()
                break
        }
    }

    _playCorrect() {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1)

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.3)
    }

    _playWrong() {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, this.ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.3)

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.3)
    }

    _playComplete() {
        const now = this.ctx.currentTime
            // Arpeggio
            ;[523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const osc = this.ctx.createOscillator()
                const gain = this.ctx.createGain()
                osc.connect(gain)
                gain.connect(this.ctx.destination)

                osc.type = 'triangle'
                osc.frequency.value = freq

                gain.gain.setValueAtTime(0.2, now + i * 0.1)
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4)

                osc.start(now + i * 0.1)
                osc.stop(now + i * 0.1 + 0.4)
            })
    }

    _playHover() {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, this.ctx.currentTime)
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.05)
    }

    toggleMute() {
        this.muted = !this.muted
        localStorage.setItem('quiz_sound_muted', this.muted)
        return this.muted
    }

    isMuted() {
        return this.muted
    }
}

export const soundManager = new SoundManager()

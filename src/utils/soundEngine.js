class SoundEngine {
  constructor() {
    this.ctx = null;
    this.bgmInterval = null;
    this.muted = false;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopBGM();
    return this.muted;
  }

  playTone(freq, type, duration, vol = 0.1) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // 1. START SOUND (Power-up)
  playStart() {
    this.init();
    if (this.muted) return;
    const now = this.ctx.currentTime;
    
    // Fast ascending arpeggio
    this.playTone(261.63, 'square', 0.1, 0.15); // C4
    setTimeout(() => this.playTone(329.63, 'square', 0.1, 0.15), 80); // E4
    setTimeout(() => this.playTone(392.00, 'square', 0.1, 0.15), 160); // G4
    setTimeout(() => this.playTone(523.25, 'square', 0.3, 0.2), 240); // C5
  }

  // 2. RUNNING SOUND (BGM Loop)
  startBGM() {
    this.init();
    if (this.muted || this.bgmInterval) return;
    
    let step = 0;
    // A darker, cyberpunk synthwave bassline
    const sequence = [
      110.00, 110.00, 130.81, 110.00, 
      146.83, 146.83, 164.81, 164.81
    ];
    
    this.bgmInterval = setInterval(() => {
      if (!this.muted && this.ctx) {
        const freq = sequence[step % sequence.length];
        // Using sawtooth for that gritty synth feel
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // Add a slight lowpass filter so it's not too harsh
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      }
      step++;
    }, 200); // Tempo (200ms per note)
  }

  // 3. ENDING SOUND (Game Over)
  playGameOver() {
    this.stopBGM();
    this.init();
    if (this.muted) return;
    
    // Descending sad tone
    this.playTone(392.00, 'sawtooth', 0.2, 0.15); // G4
    setTimeout(() => this.playTone(311.13, 'sawtooth', 0.2, 0.15), 180); // Eb4
    setTimeout(() => this.playTone(261.63, 'sawtooth', 0.2, 0.15), 360); // C4
    setTimeout(() => this.playTone(196.00, 'sawtooth', 0.6, 0.2), 540); // G3
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();

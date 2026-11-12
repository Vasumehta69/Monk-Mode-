/**
 * Web Audio API synthesizer for Monk Mode
 * Clean, reliable sound feedback without external asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbientType: string = 'none';

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a peaceful Tibetan singing bowl / zen bell tone
   */
  playZenBell(volume = 0.5) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Base fundamental and harmonic overtones for singing bowl effect
      const freqs = [392, 784, 1176, 1568];
      const gains = [0.6, 0.25, 0.1, 0.05];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[i] * volume, now);
        // Exponential decay for resonant chime
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.6);
      });
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  /**
   * Subtle tactile tick on button press or timer start/pause
   */
  playTick(volume = 0.2) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  /**
   * Ambient sound generator using Web Audio API
   */
  setAmbientSound(type: 'none' | 'white-noise' | 'rain' | 'theta' | 'campfire', volume = 0.3) {
    this.stopAmbient();
    if (type === 'none') {
      this.currentAmbientType = 'none';
      return;
    }

    try {
      const ctx = this.getContext();
      this.currentAmbientType = type;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      if (type === 'white-noise' || type === 'rain') {
        // Generate continuous white/pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            // Brown/Pink filtered noise simulates rain drops & shower
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
          } else {
            // Gentle white noise
            data[i] = white * 0.25;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        if (type === 'rain') {
          // Lowpass filter for deep soothing rainfall
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, ctx.currentTime);
          noise.connect(filter);
          filter.connect(masterGain);
        } else {
          // Bandpass for gentle concentration noise
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);
          filter.Q.setValueAtTime(0.5, ctx.currentTime);
          noise.connect(filter);
          filter.connect(masterGain);
        }

        noise.start();
        this.ambientSource = noise;
      } else if (type === 'theta') {
        // Deep Theta wave (432Hz & 438Hz binaural drone)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime); // 108Hz base

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(114, ctx.currentTime); // 6Hz theta difference

        const nodeGroup = ctx.createGain();
        nodeGroup.gain.setValueAtTime(0.3, ctx.currentTime);

        if (panner1 && panner2) {
          panner1.pan.setValueAtTime(-0.8, ctx.currentTime);
          panner2.pan.setValueAtTime(0.8, ctx.currentTime);
          osc1.connect(panner1);
          osc2.connect(panner2);
          panner1.connect(nodeGroup);
          panner2.connect(nodeGroup);
        } else {
          osc1.connect(nodeGroup);
          osc2.connect(nodeGroup);
        }

        nodeGroup.connect(masterGain);

        osc1.start();
        osc2.start();

        this.ambientSource = nodeGroup;
      } else if (type === 'campfire') {
        // Low rumble + gentle crackles
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const isCrackle = Math.random() > 0.994;
          data[i] = (isCrackle ? (Math.random() * 2 - 1) * 0.9 : white * 0.08);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);

        noise.connect(filter);
        filter.connect(masterGain);

        noise.start();
        this.ambientSource = noise;
      }
    } catch (e) {
      console.warn('Ambient sound error:', e);
    }
  }

  setAmbientVolume(vol: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        if ('stop' in this.ambientSource && typeof (this.ambientSource as any).stop === 'function') {
          (this.ambientSource as any).stop();
        }
        this.ambientSource.disconnect();
      } catch (e) {
        // ignore
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    this.currentAmbientType = 'none';
  }

  getCurrentAmbientType(): string {
    return this.currentAmbientType;
  }
}

export const soundEngine = new SoundEngine();

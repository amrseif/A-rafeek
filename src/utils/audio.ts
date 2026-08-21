// Pure Web Audio API Synthesized Audio Engine for Focus, Study & Alert Sounds
export type FocusSoundTrack =
  | 'brown_noise'
  | 'alpha_waves'
  | 'gentle_rain'
  | 'beta_waves'
  | 'pink_noise'
  | 'cozy_drone';

export interface SoundTrackInfo {
  id: FocusSoundTrack;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  badge: string;
}

export const SOUND_TRACKS: SoundTrackInfo[] = [
  {
    id: 'brown_noise',
    name: 'ضوضاء بنية عميقة (Brown Noise)',
    category: 'عزل التشتت',
    description: 'تردد هادر دافئ يحاكي هدير المحيط، يعزل الضوضاء الخارجية ويمنحك تركيزاً عميقاً وهدوءاً تاماً',
    icon: '🌊',
    badge: 'الأكثر تركيزاً',
    color: 'from-amber-600/20 to-stone-800/40 border-amber-500/30 text-amber-300',
  },
  {
    id: 'alpha_waves',
    name: 'موجات ألفا الهادئة (Alpha 10Hz)',
    category: 'صفاء واستيعاب',
    description: 'وسادة هرمونية ناعمة متناغمة مع نبضات ألفا 10Hz لتحفيز الاستيعاب وتصفية الذهن وتخفيف التوتر',
    icon: '🧠',
    badge: 'تدفق ذهني',
    color: 'from-indigo-600/20 to-blue-900/40 border-indigo-500/30 text-indigo-300',
  },
  {
    id: 'gentle_rain',
    name: 'صوت المطر والسكينة (Raindrops)',
    category: 'أجواء طبيعية',
    description: 'زخات مطر طبيعية متواصلة تمنح شعوراً بالراحة والدفء وتزيل التشتت أثناء القراءة والمذاكرة',
    icon: '🌧️',
    badge: 'استرخاء',
    color: 'from-cyan-600/20 to-teal-900/40 border-cyan-500/30 text-cyan-300',
  },
  {
    id: 'beta_waves',
    name: 'موجات بيتا للحل (Beta 14Hz)',
    category: 'تركيز ومسائل',
    description: 'تردد منشط للذاكرة واليقظة الذهنية مع بريق صوتي محفز لحل المسائل الصعبة والبرمجة',
    icon: '⚡',
    badge: 'نشاط عالي',
    color: 'from-purple-600/20 to-violet-900/40 border-purple-500/30 text-purple-300',
  },
  {
    id: 'pink_noise',
    name: 'الضوضاء الوردية (Pink Noise)',
    category: 'توازن ذهني',
    description: 'صوت ناعم متوازن الطيف (1/f) يدعم الذاكرة وتثبيت المعلومات ويساعد في استرجاع الدروس',
    icon: '🌸',
    badge: 'حفظ وتثبيت',
    color: 'from-rose-600/20 to-pink-900/40 border-rose-500/30 text-rose-300',
  },
  {
    id: 'cozy_drone',
    name: 'أجواء الدراسة الدافئة (Cozy Study)',
    category: 'محيط دافئ',
    description: 'هارموني صوتي محيطي دافئ ومهدئ يشبه أجواء المكتبات الهادئة لجلسات المذاكرة الطويلة',
    icon: '✨',
    badge: 'راحة تامة',
    color: 'from-emerald-600/20 to-teal-900/40 border-emerald-500/30 text-emerald-300',
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: FocusSoundTrack = 'brown_noise';
  private isPlaying: boolean = false;
  private volume: number = 0.6; // default comfortable volume
  private masterGain: GainNode | null = null;
  private activeNodes: Array<{ stop?: () => void; disconnect: () => void }> = [];
  private listeners: Array<() => void> = [];

  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('AudioContext error:', e);
      return null;
    }
  }

  // React state subscriptions
  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  getTrack(): FocusSoundTrack {
    return this.currentTrack;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch (e) {
        // ignore
      }
    }
    this.notify();
  }

  // --- Sound Cues ---
  async playFocusStart() {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn('playFocusStart error', e);
    }
  }

  async playBreakStart() {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [783.99, 659.25, 523.25]; // G5 -> E5 -> C5

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.14);

        gain.gain.setValueAtTime(0.18, now + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.14);
        osc.stop(now + i * 0.14 + 0.4);
      });
    } catch (e) {
      console.warn('playBreakStart error', e);
    }
  }

  async playTaskComplete() {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Celebration chord)

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.6);
      });
    } catch (e) {
      console.warn('playTaskComplete error', e);
    }
  }

  // --- Ambient Focus Loops ---
  async togglePlay(track?: FocusSoundTrack) {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    if (track && track !== this.currentTrack) {
      this.currentTrack = track;
      this.stopCurrentAmbient();
      await this.startAmbient(track);
      this.isPlaying = true;
      this.notify();
      return;
    }

    if (this.isPlaying) {
      this.stopCurrentAmbient();
      this.isPlaying = false;
      this.notify();
    } else {
      this.stopCurrentAmbient();
      await this.startAmbient(this.currentTrack);
      this.isPlaying = true;
      this.notify();
    }
  }

  async setTrack(track: FocusSoundTrack) {
    this.currentTrack = track;
    if (this.isPlaying) {
      this.stopCurrentAmbient();
      await this.startAmbient(track);
    }
    this.notify();
  }

  private stopCurrentAmbient() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.activeNodes = [];
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch (e) {}
      this.masterGain = null;
    }
  }

  private async startAmbient(track: FocusSoundTrack) {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    this.stopCurrentAmbient();

    const master = ctx.createGain();
    master.gain.setValueAtTime(this.volume, ctx.currentTime);
    master.connect(ctx.destination);
    this.masterGain = master;

    switch (track) {
      case 'brown_noise':
        this.createBrownNoise(ctx, master);
        break;
      case 'alpha_waves':
        this.createAlphaWaves(ctx, master);
        break;
      case 'beta_waves':
        this.createBetaWaves(ctx, master);
        break;
      case 'gentle_rain':
        this.createRainSound(ctx, master);
        break;
      case 'pink_noise':
        this.createPinkNoise(ctx, master);
        break;
      case 'cozy_drone':
        this.createCozyDrone(ctx, master);
        break;
    }
  }

  // 1. Rich Brown Noise (Deep study rumble - Paul Kellet integration + warm presence)
  private createBrownNoise(ctx: AudioContext, destination: GainNode) {
    const sampleRate = ctx.sampleRate;
    const bufferSize = 3 * sampleRate;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.04 * white) / 1.04;
        lastOut = output[i];
        output[i] *= 3.5; // Rich audible presence
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Highpass to eliminate speaker-choking sub-40Hz DC rumble
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(45, ctx.currentTime);

    // Lowpass at 750Hz gives full warm brown body audible on all laptop/phone speakers
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(750, ctx.currentTime);
    lp.Q.setValueAtTime(0.7, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);

    source.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(destination);

    source.start();
    this.activeNodes.push(source, hp, lp, gain);
  }

  // 2. Pink Noise (Balanced spectrum 1/f)
  private createPinkNoise(ctx: AudioContext, destination: GainNode) {
    const sampleRate = ctx.sampleRate;
    const bufferSize = 3 * sampleRate;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.16;
        b6 = white * 0.115926;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.45, ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    source.start();
    this.activeNodes.push(source, filter, gain);
  }

  // 3. Alpha Waves (Lush Warm Ambient Pad + 10Hz Alpha Brainwave Rhythm)
  private createAlphaWaves(ctx: AudioContext, destination: GainNode) {
    const now = ctx.currentTime;
    const baseFreq = 216; // Harmonic A3 (432Hz sub-octave)

    // 1) Warm ambient chord pad (A3, C#4, E4 harmonic cluster filtered)
    const padFrequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // 216, 270, 324 Hz
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.18, now);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(450, now);
    padFilter.Q.setValueAtTime(1.5, now);

    padFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx % 2 === 0 ? 4 : -4), now);
      osc.connect(padFilter);
      osc.start();
      this.activeNodes.push(osc);
    });

    padFilter.connect(padGain);
    padGain.connect(destination);
    this.activeNodes.push(padFilter, padGain);

    // 2) 10Hz Alpha Pulsing carrier wave for mental flow
    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = 'sine';
    pulseOsc.frequency.setValueAtTime(216, now);

    const pulseGain = ctx.createGain();
    pulseGain.gain.setValueAtTime(0.12, now);

    // LFO modulator at 10Hz (Alpha frequency)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(10, now); // 10Hz Alpha

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.06, now);

    lfo.connect(lfoGain);
    lfoGain.connect(pulseGain.gain);

    pulseOsc.connect(pulseGain);
    pulseGain.connect(destination);

    pulseOsc.start();
    lfo.start();
    this.activeNodes.push(pulseOsc, pulseGain, lfo, lfoGain);

    // 3) Soft pink dust bed in the background
    const sampleRate = ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, 2 * sampleRate, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 1.5;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);

    noiseSource.start();
    this.activeNodes.push(noiseSource, noiseFilter, noiseGain);
  }

  // 4. Beta Waves (High alertness 14Hz + Focus Shimmer)
  private createBetaWaves(ctx: AudioContext, destination: GainNode) {
    const now = ctx.currentTime;
    const baseFreq = 280;

    // 1) Harmonic Clarity Tones (D4 chord)
    const freqs = [baseFreq, baseFreq * 1.5]; // 280Hz & 420Hz
    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = 'lowpass';
    toneFilter.frequency.setValueAtTime(650, now);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.14, now);

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.detune.setValueAtTime(idx === 0 ? -3 : 3, now);
      osc.connect(toneFilter);
      osc.start();
      this.activeNodes.push(osc);
    });

    toneFilter.connect(toneGain);
    toneGain.connect(destination);
    this.activeNodes.push(toneFilter, toneGain);

    // 2) 14Hz Beta Brainwave Pulse
    const betaCarrier = ctx.createOscillator();
    betaCarrier.type = 'sine';
    betaCarrier.frequency.setValueAtTime(baseFreq, now);

    const betaGain = ctx.createGain();
    betaGain.gain.setValueAtTime(0.12, now);

    const betaLfo = ctx.createOscillator();
    betaLfo.type = 'sine';
    betaLfo.frequency.setValueAtTime(14, now); // 14Hz Beta Alertness

    const betaLfoGain = ctx.createGain();
    betaLfoGain.gain.setValueAtTime(0.08, now);

    betaLfo.connect(betaLfoGain);
    betaLfoGain.connect(betaGain.gain);

    betaCarrier.connect(betaGain);
    betaGain.connect(destination);

    betaCarrier.start();
    betaLfo.start();
    this.activeNodes.push(betaCarrier, betaGain, betaLfo, betaLfoGain);

    // 3) Air Shimmer (Bandpassed crisp noise)
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, 2 * sampleRate, sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = buffer.getChannelData(c);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    }
    const shimmerSource = ctx.createBufferSource();
    shimmerSource.buffer = buffer;
    shimmerSource.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1400, now);
    bp.Q.setValueAtTime(1.2, now);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.07, now);

    shimmerSource.connect(bp);
    bp.connect(shimmerGain);
    shimmerGain.connect(destination);

    shimmerSource.start();
    this.activeNodes.push(shimmerSource, bp, shimmerGain);
  }

  // 5. Gentle Rain & Droplets (Lush natural ambience)
  private createRainSound(ctx: AudioContext, destination: GainNode) {
    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;
    const bufferSize = 3 * sampleRate;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(350, now);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3800, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.38, now);

    // Subtle gentle modulation to give lifelike rain surge
    const rainLfo = ctx.createOscillator();
    rainLfo.type = 'sine';
    rainLfo.frequency.setValueAtTime(0.18, now); // slow surge every ~5s

    const rainLfoGain = ctx.createGain();
    rainLfoGain.gain.setValueAtTime(0.07, now);

    rainLfo.connect(rainLfoGain);
    rainLfoGain.connect(gain.gain);

    source.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(destination);

    source.start();
    rainLfo.start();
    this.activeNodes.push(source, hp, lp, gain, rainLfo, rainLfoGain);
  }

  // 6. Cozy Drone (Warm resonant study pad with gentle harmonic motion)
  private createCozyDrone(ctx: AudioContext, destination: GainNode) {
    const now = ctx.currentTime;
    // C Major 9 lush voicing: C3, G3, B3, D4, E4 (130.81, 196.0, 246.94, 293.66, 329.63 Hz)
    const chords = [130.81, 196.0, 246.94, 293.66, 329.63];

    const masterDroneGain = ctx.createGain();
    masterDroneGain.gain.setValueAtTime(0.22, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);
    filter.Q.setValueAtTime(1.8, now);

    // Slow breath filter sweep (LFO)
    const filterLfo = ctx.createOscillator();
    filterLfo.type = 'sine';
    filterLfo.frequency.setValueAtTime(0.08, now); // very slow 12s breathing cycle

    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.setValueAtTime(120, now);

    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Gentle micro-detuning for lush warm chorus effect
      osc.detune.setValueAtTime((idx - 2) * 5, now);

      osc.connect(filter);
      osc.start();
      this.activeNodes.push(osc);
    });

    filter.connect(masterDroneGain);
    masterDroneGain.connect(destination);

    filterLfo.start();
    this.activeNodes.push(filter, masterDroneGain, filterLfo, filterLfoGain);
  }
}

export const sounds = new SoundEngine();

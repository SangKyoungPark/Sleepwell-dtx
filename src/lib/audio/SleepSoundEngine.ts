type SoundType =
	| "white"
	| "pink"
	| "brown"
	| "rain"
	| "wave"
	| "wind"
	| "cricket"
	| "binaural";

interface SoundNode {
	source: AudioBufferSourceNode | OscillatorNode | null;
	gain: GainNode;
	extra?: {
		sources: (AudioBufferSourceNode | OscillatorNode)[];
		nodes: AudioNode[];
		intervals: ReturnType<typeof setInterval>[];
		timeouts: ReturnType<typeof setTimeout>[];
	};
	playing: boolean;
	volume: number;
}

interface EngineState {
	sounds: Record<SoundType, { playing: boolean; volume: number }>;
	masterVolume: number;
	timerMinutes: number | null;
	timerRemaining: number | null;
}

type OnChangeCallback = (state: EngineState) => void;

const SAMPLE_RATE = 48000;
const BUFFER_DURATION = 5; // longer buffer to hide loop seam

class SleepSoundEngine {
	private static instance: SleepSoundEngine | null = null;
	private ctx: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private sounds: Map<SoundType, SoundNode> = new Map();
	private timerTimeout: ReturnType<typeof setTimeout> | null = null;
	private timerMinutes: number | null = null;
	private timerEnd: number | null = null;
	private onChange: OnChangeCallback | null = null;

	private constructor() {}

	static GetInstance(): SleepSoundEngine {
		if (!SleepSoundEngine.instance) {
			SleepSoundEngine.instance = new SleepSoundEngine();
		}
		return SleepSoundEngine.instance;
	}

	SetOnChange(cb: OnChangeCallback | null): void {
		this.onChange = cb;
	}

	private NotifyChange(): void {
		if (!this.onChange) return;
		this.onChange(this.GetState());
	}

	GetState(): EngineState {
		const soundTypes: SoundType[] = [
			"white", "pink", "brown", "rain", "wave", "wind", "cricket", "binaural",
		];
		const sounds = {} as EngineState["sounds"];
		for (const type of soundTypes) {
			const node = this.sounds.get(type);
			sounds[type] = {
				playing: node?.playing ?? false,
				volume: node?.volume ?? 0.5,
			};
		}

		let timerRemaining: number | null = null;
		if (this.timerEnd !== null) {
			timerRemaining = Math.max(0, Math.ceil((this.timerEnd - Date.now()) / 1000));
		}

		return {
			sounds,
			masterVolume: this.masterGain?.gain.value ?? 0.7,
			timerMinutes: this.timerMinutes,
			timerRemaining,
		};
	}

	private EnsureContext(): AudioContext {
		if (!this.ctx || this.ctx.state === "closed") {
			this.ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
			this.masterGain = this.ctx.createGain();
			this.masterGain.gain.value = 0.7;
			this.masterGain.connect(this.ctx.destination);
		}
		if (this.ctx.state === "suspended") {
			this.ctx.resume();
		}
		return this.ctx;
	}

	private GetMasterGain(): GainNode {
		this.EnsureContext();
		return this.masterGain!;
	}

	// Crossfade-loopable noise buffer: fade edges so loop seam is inaudible
	private CreateNoiseBuffer(type: "white" | "pink" | "brown"): AudioBuffer {
		const ctx = this.EnsureContext();
		const length = SAMPLE_RATE * BUFFER_DURATION;
		const buffer = ctx.createBuffer(1, length, SAMPLE_RATE);
		const data = buffer.getChannelData(0);

		if (type === "white") {
			for (let i = 0; i < length; i++) {
				data[i] = Math.random() * 2 - 1;
			}
		} else if (type === "pink") {
			let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
			for (let i = 0; i < length; i++) {
				const white = Math.random() * 2 - 1;
				b0 = 0.99886 * b0 + white * 0.0555179;
				b1 = 0.99332 * b1 + white * 0.0750759;
				b2 = 0.96900 * b2 + white * 0.1538520;
				b3 = 0.86650 * b3 + white * 0.3104856;
				b4 = 0.55000 * b4 + white * 0.5329522;
				b5 = -0.7616 * b5 - white * 0.0168980;
				data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
				b6 = white * 0.115926;
			}
		} else {
			let last = 0;
			for (let i = 0; i < length; i++) {
				const white = Math.random() * 2 - 1;
				last = (last + (0.02 * white)) / 1.02;
				data[i] = last * 3.5;
			}
		}

		// Crossfade first/last 0.5s so loop is seamless
		const fadeLen = Math.floor(SAMPLE_RATE * 0.5);
		for (let i = 0; i < fadeLen; i++) {
			const t = i / fadeLen;
			// Blend end into start with equal-power crossfade
			const fadeIn = Math.sqrt(t);
			const fadeOut = Math.sqrt(1 - t);
			const endIdx = length - fadeLen + i;
			data[i] = data[i] * fadeIn + data[endIdx] * fadeOut;
		}

		return buffer;
	}

	private StartNoise(type: "white" | "pink" | "brown"): SoundNode {
		const ctx = this.EnsureContext();
		const buffer = this.CreateNoiseBuffer(type);
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.loop = true;

		// Gentle EQ: cut harsh highs for a smoother feel
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = type === "white" ? 8000 : type === "pink" ? 6000 : 3000;
		lp.Q.value = 0.5;

		const gain = ctx.createGain();
		gain.gain.value = 0.5;
		source.connect(lp);
		lp.connect(gain);
		gain.connect(this.GetMasterGain());
		source.start();

		return {
			source,
			gain,
			extra: { sources: [], nodes: [lp], intervals: [], timeouts: [] },
			playing: true,
			volume: 0.5,
		};
	}

	// Rain: 3-layer approach (base steady + mid patter + high drips)
	private StartRain(): SoundNode {
		const ctx = this.EnsureContext();
		const gain = ctx.createGain();
		gain.gain.value = 0.5;
		gain.connect(this.GetMasterGain());

		const sources: AudioBufferSourceNode[] = [];
		const nodes: AudioNode[] = [];

		// Layer 1: Steady base (low rumble of rain on surface)
		const baseBuffer = this.CreateNoiseBuffer("brown");
		const baseSrc = ctx.createBufferSource();
		baseSrc.buffer = baseBuffer;
		baseSrc.loop = true;
		const baseLp = ctx.createBiquadFilter();
		baseLp.type = "lowpass";
		baseLp.frequency.value = 800;
		baseLp.Q.value = 0.3;
		const baseGain = ctx.createGain();
		baseGain.gain.value = 0.4;
		baseSrc.connect(baseLp);
		baseLp.connect(baseGain);
		baseGain.connect(gain);
		baseSrc.start();
		sources.push(baseSrc);
		nodes.push(baseLp, baseGain);

		// Layer 2: Mid-frequency patter
		const midBuffer = this.CreateNoiseBuffer("pink");
		const midSrc = ctx.createBufferSource();
		midSrc.buffer = midBuffer;
		midSrc.loop = true;
		const midBp = ctx.createBiquadFilter();
		midBp.type = "bandpass";
		midBp.frequency.value = 2500;
		midBp.Q.value = 0.4;
		const midGain = ctx.createGain();
		midGain.gain.value = 0.3;
		midSrc.connect(midBp);
		midBp.connect(midGain);
		midGain.connect(gain);
		midSrc.start();
		sources.push(midSrc);
		nodes.push(midBp, midGain);

		// Layer 3: High sparkle (individual droplets feel)
		const hiBuffer = this.CreateNoiseBuffer("white");
		const hiSrc = ctx.createBufferSource();
		hiSrc.buffer = hiBuffer;
		hiSrc.loop = true;
		const hiBp = ctx.createBiquadFilter();
		hiBp.type = "highpass";
		hiBp.frequency.value = 5000;
		hiBp.Q.value = 0.3;
		const hiGain = ctx.createGain();
		hiGain.gain.value = 0.12;
		hiSrc.connect(hiBp);
		hiBp.connect(hiGain);
		hiGain.connect(gain);
		hiSrc.start();
		sources.push(hiSrc);
		nodes.push(hiBp, hiGain);

		// Gentle intensity swell (slow, smooth variation)
		const swellLfo = ctx.createOscillator();
		swellLfo.type = "sine";
		swellLfo.frequency.value = 0.04; // very slow ~25s cycle
		const swellDepth = ctx.createGain();
		swellDepth.gain.value = 0.08;
		swellLfo.connect(swellDepth);
		swellDepth.connect(midGain.gain);
		swellLfo.start();
		sources.push(swellLfo as unknown as AudioBufferSourceNode);
		nodes.push(swellDepth);

		return {
			source: null,
			gain,
			extra: { sources: sources as (AudioBufferSourceNode | OscillatorNode)[], nodes, intervals: [], timeouts: [] },
			playing: true,
			volume: 0.5,
		};
	}

	// Wave: multi-LFO brown noise with lowpass for warmth + slow rolling feel
	private StartWave(): SoundNode {
		const ctx = this.EnsureContext();
		const gain = ctx.createGain();
		gain.gain.value = 0.5;
		gain.connect(this.GetMasterGain());

		const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];
		const nodes: AudioNode[] = [];

		// Base: brown noise through lowpass for deep ocean rumble
		const buffer = this.CreateNoiseBuffer("brown");
		const src = ctx.createBufferSource();
		src.buffer = buffer;
		src.loop = true;
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 600;
		lp.Q.value = 0.3;
		src.connect(lp);
		sources.push(src);
		nodes.push(lp);

		// Second layer: pink noise for wave crest foam
		const foamBuffer = this.CreateNoiseBuffer("pink");
		const foamSrc = ctx.createBufferSource();
		foamSrc.buffer = foamBuffer;
		foamSrc.loop = true;
		const foamBp = ctx.createBiquadFilter();
		foamBp.type = "bandpass";
		foamBp.frequency.value = 1500;
		foamBp.Q.value = 0.5;
		const foamGain = ctx.createGain();
		foamGain.gain.value = 0;
		foamSrc.connect(foamBp);
		foamBp.connect(foamGain);
		sources.push(foamSrc);
		nodes.push(foamBp, foamGain);

		// Mix both to output gain
		const mixGain = ctx.createGain();
		mixGain.gain.value = 1.0;
		lp.connect(mixGain);
		foamGain.connect(mixGain);
		mixGain.connect(gain);
		nodes.push(mixGain);

		// LFO 1: primary wave rhythm ~0.06Hz (16s cycle)
		const lfo1 = ctx.createOscillator();
		lfo1.type = "sine";
		lfo1.frequency.value = 0.06;
		const lfo1Depth = ctx.createGain();
		lfo1Depth.gain.value = 0.35;
		lfo1.connect(lfo1Depth);
		lfo1Depth.connect(mixGain.gain);
		sources.push(lfo1);
		nodes.push(lfo1Depth);

		// LFO 2: secondary slower wave ~0.025Hz (40s cycle) for variation
		const lfo2 = ctx.createOscillator();
		lfo2.type = "sine";
		lfo2.frequency.value = 0.025;
		const lfo2Depth = ctx.createGain();
		lfo2Depth.gain.value = 0.15;
		lfo2.connect(lfo2Depth);
		lfo2Depth.connect(mixGain.gain);
		sources.push(lfo2);
		nodes.push(lfo2Depth);

		// LFO on foam: when wave crests, foam gets louder
		const foamLfo = ctx.createOscillator();
		foamLfo.type = "sine";
		foamLfo.frequency.value = 0.06;
		const foamLfoDepth = ctx.createGain();
		foamLfoDepth.gain.value = 0.2;
		foamLfo.connect(foamLfoDepth);
		foamLfoDepth.connect(foamGain.gain);
		sources.push(foamLfo);
		nodes.push(foamLfoDepth);

		src.start();
		foamSrc.start();
		lfo1.start();
		lfo2.start();
		foamLfo.start();

		return {
			source: null,
			gain,
			extra: { sources, nodes, intervals: [], timeouts: [] },
			playing: true,
			volume: 0.5,
		};
	}

	// Wind: sweeping bandpass frequency + multiple layers for gusts
	private StartWind(): SoundNode {
		const ctx = this.EnsureContext();
		const gain = ctx.createGain();
		gain.gain.value = 0.5;
		gain.connect(this.GetMasterGain());

		const sources: (AudioBufferSourceNode | OscillatorNode)[] = [];
		const nodes: AudioNode[] = [];

		// Layer 1: Base low wind
		const lowBuffer = this.CreateNoiseBuffer("brown");
		const lowSrc = ctx.createBufferSource();
		lowSrc.buffer = lowBuffer;
		lowSrc.loop = true;
		const lowLp = ctx.createBiquadFilter();
		lowLp.type = "lowpass";
		lowLp.frequency.value = 250;
		lowLp.Q.value = 0.5;
		const lowGain = ctx.createGain();
		lowGain.gain.value = 0.3;
		lowSrc.connect(lowLp);
		lowLp.connect(lowGain);
		lowGain.connect(gain);
		lowSrc.start();
		sources.push(lowSrc);
		nodes.push(lowLp, lowGain);

		// Layer 2: Mid howl with sweeping bandpass
		const midBuffer = this.CreateNoiseBuffer("pink");
		const midSrc = ctx.createBufferSource();
		midSrc.buffer = midBuffer;
		midSrc.loop = true;
		const midBp = ctx.createBiquadFilter();
		midBp.type = "bandpass";
		midBp.frequency.value = 500;
		midBp.Q.value = 2.0;
		const midGain = ctx.createGain();
		midGain.gain.value = 0.25;
		midSrc.connect(midBp);
		midBp.connect(midGain);
		midGain.connect(gain);
		midSrc.start();
		sources.push(midSrc);
		nodes.push(midBp, midGain);

		// Sweep the bandpass frequency for howling effect
		const sweepLfo = ctx.createOscillator();
		sweepLfo.type = "sine";
		sweepLfo.frequency.value = 0.08;
		const sweepDepth = ctx.createGain();
		sweepDepth.gain.value = 300; // sweep +-300Hz around 500Hz
		sweepLfo.connect(sweepDepth);
		sweepDepth.connect(midBp.frequency);
		sweepLfo.start();
		sources.push(sweepLfo);
		nodes.push(sweepDepth);

		// Layer 3: High whistle (subtle)
		const hiBuffer = this.CreateNoiseBuffer("white");
		const hiSrc = ctx.createBufferSource();
		hiSrc.buffer = hiBuffer;
		hiSrc.loop = true;
		const hiBp = ctx.createBiquadFilter();
		hiBp.type = "bandpass";
		hiBp.frequency.value = 2000;
		hiBp.Q.value = 3.0;
		const hiGain = ctx.createGain();
		hiGain.gain.value = 0.06;
		hiSrc.connect(hiBp);
		hiBp.connect(hiGain);
		hiGain.connect(gain);
		hiSrc.start();
		sources.push(hiSrc);
		nodes.push(hiBp, hiGain);

		// Gust LFO on overall volume
		const gustLfo = ctx.createOscillator();
		gustLfo.type = "sine";
		gustLfo.frequency.value = 0.12;
		const gustDepth = ctx.createGain();
		gustDepth.gain.value = 0.15;
		gustLfo.connect(gustDepth);
		gustDepth.connect(gain.gain);
		gustLfo.start();
		sources.push(gustLfo);
		nodes.push(gustDepth);

		// Slower swell
		const swellLfo = ctx.createOscillator();
		swellLfo.type = "sine";
		swellLfo.frequency.value = 0.03;
		const swellDepth = ctx.createGain();
		swellDepth.gain.value = 0.1;
		swellLfo.connect(swellDepth);
		swellDepth.connect(gain.gain);
		swellLfo.start();
		sources.push(swellLfo);
		nodes.push(swellDepth);

		return {
			source: null,
			gain,
			extra: { sources, nodes, intervals: [], timeouts: [] },
			playing: true,
			volume: 0.5,
		};
	}

	// Cricket: multiple individuals at different pitches + natural timing
	private StartCricket(): SoundNode {
		const ctx = this.EnsureContext();
		const gain = ctx.createGain();
		gain.gain.value = 0.25;
		gain.connect(this.GetMasterGain());

		const intervals: ReturnType<typeof setInterval>[] = [];
		const timeouts: ReturnType<typeof setTimeout>[] = [];

		const chirp = (freq: number, volume: number) => {
			try {
				const osc = ctx.createOscillator();
				osc.type = "sine";
				osc.frequency.value = freq;
				const chirpGain = ctx.createGain();
				chirpGain.gain.value = 0;
				osc.connect(chirpGain);
				chirpGain.connect(gain);

				const now = ctx.currentTime;
				// Natural chirp: rapid trill of 3-4 pulses
				const pulseCount = 3 + Math.floor(Math.random() * 2);
				for (let p = 0; p < pulseCount; p++) {
					const t = now + p * 0.045;
					chirpGain.gain.setValueAtTime(0, t);
					chirpGain.gain.linearRampToValueAtTime(volume, t + 0.008);
					chirpGain.gain.linearRampToValueAtTime(0, t + 0.035);
				}
				const endTime = now + pulseCount * 0.045 + 0.02;
				osc.start(now);
				osc.stop(endTime);
			} catch { /* context closed */ }
		};

		// Cricket individual 1: dominant, regular
		const freq1 = 4200 + Math.random() * 400;
		const i1 = setInterval(() => {
			const node = this.sounds.get("cricket");
			if (!node?.playing) return;
			chirp(freq1, 0.5 + Math.random() * 0.2);
		}, 1200 + Math.random() * 400);
		intervals.push(i1);

		// Cricket individual 2: slightly different pitch, offset timing
		const freq2 = 4800 + Math.random() * 500;
		const t2 = setTimeout(() => {
			const i2 = setInterval(() => {
				const node = this.sounds.get("cricket");
				if (!node?.playing) return;
				chirp(freq2, 0.3 + Math.random() * 0.2);
			}, 1500 + Math.random() * 600);
			intervals.push(i2);
		}, 600);
		timeouts.push(t2);

		// Cricket individual 3: distant, quieter, sporadic
		const freq3 = 3800 + Math.random() * 300;
		const t3 = setTimeout(() => {
			const i3 = setInterval(() => {
				const node = this.sounds.get("cricket");
				if (!node?.playing) return;
				if (Math.random() > 0.4) {
					chirp(freq3, 0.15 + Math.random() * 0.1);
				}
			}, 2000 + Math.random() * 1000);
			intervals.push(i3);
		}, 1200);
		timeouts.push(t3);

		// Occasional background ambient hiss (distant field)
		const ambBuffer = this.CreateNoiseBuffer("pink");
		const ambSrc = ctx.createBufferSource();
		ambSrc.buffer = ambBuffer;
		ambSrc.loop = true;
		const ambBp = ctx.createBiquadFilter();
		ambBp.type = "bandpass";
		ambBp.frequency.value = 3000;
		ambBp.Q.value = 0.3;
		const ambGain = ctx.createGain();
		ambGain.gain.value = 0.04;
		ambSrc.connect(ambBp);
		ambBp.connect(ambGain);
		ambGain.connect(gain);
		ambSrc.start();

		return {
			source: null,
			gain,
			extra: {
				sources: [ambSrc],
				nodes: [ambBp, ambGain],
				intervals,
				timeouts,
			},
			playing: true,
			volume: 0.25,
		};
	}

	// Binaural: softened with subtle noise bed + gentle amplitude shaping
	private StartBinaural(): SoundNode {
		const ctx = this.EnsureContext();
		const merger = ctx.createChannelMerger(2);

		// Lower carrier (150Hz) for more comfortable listening
		const oscL = ctx.createOscillator();
		const oscR = ctx.createOscillator();
		oscL.type = "sine";
		oscR.type = "sine";
		oscL.frequency.value = 150;
		oscR.frequency.value = 152; // 2Hz delta

		const gainL = ctx.createGain();
		const gainR = ctx.createGain();
		gainL.gain.value = 0.35;
		gainR.gain.value = 0.35;

		oscL.connect(gainL);
		oscR.connect(gainR);
		gainL.connect(merger, 0, 0);
		gainR.connect(merger, 0, 1);

		// Soft pad: gentle brown noise bed to mask the raw tone
		const padBuffer = this.CreateNoiseBuffer("brown");
		const padSrc = ctx.createBufferSource();
		padSrc.buffer = padBuffer;
		padSrc.loop = true;
		const padLp = ctx.createBiquadFilter();
		padLp.type = "lowpass";
		padLp.frequency.value = 300;
		padLp.Q.value = 0.3;
		const padGain = ctx.createGain();
		padGain.gain.value = 0.15;
		padSrc.connect(padLp);
		padLp.connect(padGain);

		const gain = ctx.createGain();
		gain.gain.value = 0.4;
		merger.connect(gain);
		padGain.connect(gain);
		gain.connect(this.GetMasterGain());

		// Gentle amplitude breathing ~0.1Hz
		const breathLfo = ctx.createOscillator();
		breathLfo.type = "sine";
		breathLfo.frequency.value = 0.1;
		const breathDepth = ctx.createGain();
		breathDepth.gain.value = 0.05;
		breathLfo.connect(breathDepth);
		breathDepth.connect(gain.gain);

		oscL.start();
		oscR.start();
		padSrc.start();
		breathLfo.start();

		return {
			source: null,
			gain,
			extra: {
				sources: [oscL, oscR, padSrc, breathLfo],
				nodes: [merger, gainL, gainR, padLp, padGain, breathDepth],
				intervals: [],
				timeouts: [],
			},
			playing: true,
			volume: 0.4,
		};
	}

	ToggleSound(type: SoundType): void {
		const existing = this.sounds.get(type);
		if (existing?.playing) {
			this.StopSound(type);
		} else {
			this.PlaySound(type);
		}
		this.NotifyChange();
	}

	private PlaySound(type: SoundType): void {
		this.StopSound(type);

		let node: SoundNode;
		switch (type) {
			case "white":
			case "pink":
			case "brown":
				node = this.StartNoise(type);
				break;
			case "rain":
				node = this.StartRain();
				break;
			case "wave":
				node = this.StartWave();
				break;
			case "wind":
				node = this.StartWind();
				break;
			case "cricket":
				node = this.StartCricket();
				break;
			case "binaural":
				node = this.StartBinaural();
				break;
		}

		this.sounds.set(type, node);
	}

	private StopSound(type: SoundType): void {
		const node = this.sounds.get(type);
		if (!node) return;

		node.playing = false;

		try {
			if (node.source) {
				node.source.stop();
				node.source.disconnect();
			}
			if (node.extra) {
				for (const s of node.extra.sources) {
					try { s.stop(); s.disconnect(); } catch { /* ignore */ }
				}
				for (const n of node.extra.nodes) {
					try { n.disconnect(); } catch { /* ignore */ }
				}
				for (const i of node.extra.intervals) {
					clearInterval(i);
				}
				for (const t of node.extra.timeouts) {
					clearTimeout(t);
				}
			}
			node.gain.disconnect();
		} catch { /* ignore */ }

		this.sounds.delete(type);
	}

	SetVolume(type: SoundType, volume: number): void {
		const node = this.sounds.get(type);
		if (!node) return;
		node.volume = volume;
		try {
			node.gain.gain.setTargetAtTime(volume, this.ctx!.currentTime, 0.05);
		} catch { /* ignore */ }
		this.NotifyChange();
	}

	SetMasterVolume(volume: number): void {
		try {
			const gain = this.GetMasterGain();
			gain.gain.setTargetAtTime(volume, this.ctx!.currentTime, 0.05);
		} catch { /* ignore */ }
		this.NotifyChange();
	}

	SetTimer(minutes: number | null): void {
		if (this.timerTimeout !== null) {
			clearTimeout(this.timerTimeout);
			this.timerTimeout = null;
		}
		this.timerEnd = null;
		this.timerMinutes = minutes;

		if (minutes === null || minutes <= 0) {
			this.NotifyChange();
			return;
		}

		const totalMs = minutes * 60 * 1000;
		const fadeStartMs = totalMs - 60000;
		this.timerEnd = Date.now() + totalMs;

		if (fadeStartMs > 0) {
			this.timerTimeout = setTimeout(() => {
				try {
					const master = this.GetMasterGain();
					master.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 60);
				} catch { /* ignore */ }

				this.timerTimeout = setTimeout(() => {
					this.StopAll();
				}, 60000);
			}, fadeStartMs);
		} else {
			try {
				const master = this.GetMasterGain();
				master.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + minutes * 60);
			} catch { /* ignore */ }
			this.timerTimeout = setTimeout(() => {
				this.StopAll();
			}, totalMs);
		}

		this.NotifyChange();
	}

	StopAll(): void {
		const types: SoundType[] = [
			"white", "pink", "brown", "rain", "wave", "wind", "cricket", "binaural",
		];
		for (const type of types) {
			this.StopSound(type);
		}

		if (this.timerTimeout !== null) {
			clearTimeout(this.timerTimeout);
			this.timerTimeout = null;
		}
		this.timerEnd = null;
		this.timerMinutes = null;

		if (this.masterGain) {
			try {
				this.masterGain.gain.cancelScheduledValues(this.ctx!.currentTime);
				this.masterGain.gain.value = 0.7;
			} catch { /* ignore */ }
		}

		this.NotifyChange();
	}

	IsAnyPlaying(): boolean {
		for (const node of this.sounds.values()) {
			if (node.playing) return true;
		}
		return false;
	}
}

export { SleepSoundEngine };
export type { SoundType, EngineState };

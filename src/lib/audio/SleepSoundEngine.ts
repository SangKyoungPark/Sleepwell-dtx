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
const BUFFER_DURATION = 2; // seconds

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
			// Paul Kellet pink noise filter
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
			// Brown noise: cumulative random walk + lowpass effect
			let last = 0;
			for (let i = 0; i < length; i++) {
				const white = Math.random() * 2 - 1;
				last = (last + (0.02 * white)) / 1.02;
				data[i] = last * 3.5;
			}
		}

		return buffer;
	}

	private StartNoise(type: "white" | "pink" | "brown"): SoundNode {
		const ctx = this.EnsureContext();
		const buffer = this.CreateNoiseBuffer(type);
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.loop = true;

		const gain = ctx.createGain();
		gain.gain.value = 0.5;
		source.connect(gain);
		gain.connect(this.GetMasterGain());
		source.start();

		return { source, gain, playing: true, volume: 0.5 };
	}

	private StartRain(): SoundNode {
		const ctx = this.EnsureContext();
		const buffer = this.CreateNoiseBuffer("white");
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.loop = true;

		// Bandpass filter to shape rain sound
		const filter = ctx.createBiquadFilter();
		filter.type = "bandpass";
		filter.frequency.value = 1200;
		filter.Q.value = 0.5;

		const gain = ctx.createGain();
		gain.gain.value = 0.5;

		source.connect(filter);
		filter.connect(gain);
		gain.connect(this.GetMasterGain());
		source.start();

		// Random amplitude modulation for realistic rain patter
		const interval = setInterval(() => {
			if (gain.gain.value > 0) {
				const target = 0.3 + Math.random() * 0.4;
				const node = this.sounds.get("rain");
				if (node) {
					try {
						gain.gain.setTargetAtTime(target * node.volume, ctx.currentTime, 0.5);
					} catch { /* ignore */ }
				}
			}
		}, 800);

		return {
			source,
			gain,
			extra: { sources: [], nodes: [filter], intervals: [interval] },
			playing: true,
			volume: 0.5,
		};
	}

	private StartWave(): SoundNode {
		const ctx = this.EnsureContext();
		const buffer = this.CreateNoiseBuffer("brown");
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.loop = true;

		// LFO for wave motion (0.07Hz)
		const lfo = ctx.createOscillator();
		lfo.type = "sine";
		lfo.frequency.value = 0.07;
		const lfoGain = ctx.createGain();
		lfoGain.gain.value = 0.3;
		lfo.connect(lfoGain);

		const gain = ctx.createGain();
		gain.gain.value = 0.5;
		lfoGain.connect(gain.gain);

		source.connect(gain);
		gain.connect(this.GetMasterGain());

		source.start();
		lfo.start();

		return {
			source,
			gain,
			extra: { sources: [lfo], nodes: [lfoGain], intervals: [] },
			playing: true,
			volume: 0.5,
		};
	}

	private StartWind(): SoundNode {
		const ctx = this.EnsureContext();
		const buffer = this.CreateNoiseBuffer("pink");
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.loop = true;

		const filter = ctx.createBiquadFilter();
		filter.type = "bandpass";
		filter.frequency.value = 400;
		filter.Q.value = 1.0;

		// Slow LFO for wind gusts
		const lfo = ctx.createOscillator();
		lfo.type = "sine";
		lfo.frequency.value = 0.15;
		const lfoGain = ctx.createGain();
		lfoGain.gain.value = 0.2;
		lfo.connect(lfoGain);

		const gain = ctx.createGain();
		gain.gain.value = 0.5;
		lfoGain.connect(gain.gain);

		source.connect(filter);
		filter.connect(gain);
		gain.connect(this.GetMasterGain());

		source.start();
		lfo.start();

		return {
			source,
			gain,
			extra: { sources: [lfo], nodes: [filter, lfoGain], intervals: [] },
			playing: true,
			volume: 0.5,
		};
	}

	private StartCricket(): SoundNode {
		const ctx = this.EnsureContext();
		const gain = ctx.createGain();
		gain.gain.value = 0.3;
		gain.connect(this.GetMasterGain());

		// Periodic chirp bursts at random intervals
		const chirp = () => {
			try {
				const osc = ctx.createOscillator();
				osc.type = "sine";
				osc.frequency.value = 4500 + Math.random() * 1000;
				const chirpGain = ctx.createGain();
				chirpGain.gain.value = 0;

				osc.connect(chirpGain);
				chirpGain.connect(gain);

				const now = ctx.currentTime;
				// Quick burst pattern: chirp-chirp
				chirpGain.gain.setValueAtTime(0, now);
				chirpGain.gain.linearRampToValueAtTime(0.6, now + 0.01);
				chirpGain.gain.linearRampToValueAtTime(0, now + 0.04);
				chirpGain.gain.linearRampToValueAtTime(0.5, now + 0.08);
				chirpGain.gain.linearRampToValueAtTime(0, now + 0.12);

				osc.start(now);
				osc.stop(now + 0.15);
			} catch { /* context closed */ }
		};

		const interval = setInterval(() => {
			const node = this.sounds.get("cricket");
			if (!node?.playing) return;
			chirp();
			// Second chirp sometimes
			if (Math.random() > 0.4) {
				setTimeout(chirp, 150 + Math.random() * 100);
			}
		}, 600 + Math.random() * 1200);

		return {
			source: null,
			gain,
			extra: { sources: [], nodes: [], intervals: [interval] },
			playing: true,
			volume: 0.3,
		};
	}

	private StartBinaural(): SoundNode {
		const ctx = this.EnsureContext();
		// Stereo: left 200Hz, right 202Hz -> 2Hz delta wave beat
		const merger = ctx.createChannelMerger(2);
		const oscL = ctx.createOscillator();
		const oscR = ctx.createOscillator();
		oscL.type = "sine";
		oscR.type = "sine";
		oscL.frequency.value = 200;
		oscR.frequency.value = 202;

		const gainL = ctx.createGain();
		const gainR = ctx.createGain();
		gainL.gain.value = 0.5;
		gainR.gain.value = 0.5;

		oscL.connect(gainL);
		oscR.connect(gainR);
		gainL.connect(merger, 0, 0);
		gainR.connect(merger, 0, 1);

		const gain = ctx.createGain();
		gain.gain.value = 0.4;
		merger.connect(gain);
		gain.connect(this.GetMasterGain());

		oscL.start();
		oscR.start();

		return {
			source: null,
			gain,
			extra: {
				sources: [oscL, oscR],
				nodes: [merger, gainL, gainR],
				intervals: [],
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
		// Stop existing first
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
		// Clear existing timer
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
		const fadeStartMs = totalMs - 60000; // fade out last 60 seconds
		this.timerEnd = Date.now() + totalMs;

		if (fadeStartMs > 0) {
			// Start fade-out 60 seconds before end
			this.timerTimeout = setTimeout(() => {
				try {
					const master = this.GetMasterGain();
					master.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 60);
				} catch { /* ignore */ }

				// Actual stop after 60 more seconds
				this.timerTimeout = setTimeout(() => {
					this.StopAll();
				}, 60000);
			}, fadeStartMs);
		} else {
			// Less than 60 seconds total: fade entire duration
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

		// Reset master volume for next time
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

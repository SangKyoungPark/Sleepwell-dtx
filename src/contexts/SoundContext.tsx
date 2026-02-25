"use client";

import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import { SleepSoundEngine, type SoundType, type EngineState } from "@/lib/audio/SleepSoundEngine";

interface SoundContextValue {
	state: EngineState;
	isAnyPlaying: boolean;
	timerRemaining: number | null;
	toggleSound: (type: SoundType) => void;
	setVolume: (type: SoundType, volume: number) => void;
	setMasterVolume: (volume: number) => void;
	setTimer: (minutes: number | null) => void;
	stopAll: () => void;
	playPreset: () => void;
}

const DEFAULT_STATE: EngineState = {
	sounds: {
		white: { playing: false, volume: 0.5 },
		pink: { playing: false, volume: 0.5 },
		brown: { playing: false, volume: 0.5 },
		rain: { playing: false, volume: 0.5 },
		wave: { playing: false, volume: 0.5 },
		wind: { playing: false, volume: 0.5 },
		cricket: { playing: false, volume: 0.3 },
		binaural: { playing: false, volume: 0.4 },
	},
	masterVolume: 0.7,
	timerMinutes: null,
	timerRemaining: null,
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<EngineState>(DEFAULT_STATE);
	const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
	const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const engineRef = useRef<SleepSoundEngine | null>(null);

	// Initialize engine (client-side only)
	useEffect(() => {
		if (typeof window === "undefined") return;

		const engine = SleepSoundEngine.GetInstance();
		engineRef.current = engine;

		engine.SetOnChange((newState) => {
			setState(newState);
		});

		// Sync initial state
		setState(engine.GetState());

		return () => {
			engine.SetOnChange(null);
		};
	}, []);

	// Timer countdown interval
	useEffect(() => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
			timerIntervalRef.current = null;
		}

		const engine = engineRef.current;
		if (!engine) return;

		const engineState = engine.GetState();
		if (engineState.timerRemaining !== null && engineState.timerRemaining > 0) {
			setTimerRemaining(engineState.timerRemaining);

			timerIntervalRef.current = setInterval(() => {
				const s = engine.GetState();
				if (s.timerRemaining === null || s.timerRemaining <= 0) {
					setTimerRemaining(null);
					if (timerIntervalRef.current) {
						clearInterval(timerIntervalRef.current);
						timerIntervalRef.current = null;
					}
				} else {
					setTimerRemaining(s.timerRemaining);
				}
			}, 1000);
		} else {
			setTimerRemaining(null);
		}

		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
				timerIntervalRef.current = null;
			}
		};
	}, [state.timerMinutes]);

	const toggleSound = useCallback((type: SoundType) => {
		engineRef.current?.ToggleSound(type);
	}, []);

	const setVolume = useCallback((type: SoundType, volume: number) => {
		engineRef.current?.SetVolume(type, volume);
	}, []);

	const setMasterVolume = useCallback((volume: number) => {
		engineRef.current?.SetMasterVolume(volume);
	}, []);

	const setTimer = useCallback((minutes: number | null) => {
		engineRef.current?.SetTimer(minutes);
	}, []);

	const stopAll = useCallback(() => {
		engineRef.current?.StopAll();
	}, []);

	const playPreset = useCallback(() => {
		const engine = engineRef.current;
		if (!engine) return;
		engine.StopAll();
		engine.ToggleSound("rain");
		engine.ToggleSound("brown");
		engine.SetTimer(45);
	}, []);

	const isAnyPlaying = Object.values(state.sounds).some((s) => s.playing);

	return (
		<SoundContext.Provider
			value={{
				state,
				isAnyPlaying,
				timerRemaining,
				toggleSound,
				setVolume,
				setMasterVolume,
				setTimer,
				stopAll,
				playPreset,
			}}
		>
			{children}
		</SoundContext.Provider>
	);
}

export function useSoundContext(): SoundContextValue {
	const ctx = useContext(SoundContext);
	if (!ctx) {
		throw new Error("useSoundContext must be used within SoundProvider");
	}
	return ctx;
}

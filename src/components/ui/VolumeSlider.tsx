"use client";

import { cn } from "@/lib/utils";

interface VolumeSliderProps {
	value: number;
	onChange: (value: number) => void;
	className?: string;
}

export function VolumeSlider({ value, onChange, className }: VolumeSliderProps) {
	const percentage = value * 100;

	return (
		<input
			type="range"
			min={0}
			max={1}
			step={0.01}
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
			className={cn("w-full h-1.5 rounded-full appearance-none cursor-pointer", className)}
			style={{
				background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-surface-light) ${percentage}%, var(--color-surface-light) 100%)`,
			}}
		/>
	);
}

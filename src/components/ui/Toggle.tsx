"use client";

interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	label?: string;
	description?: string;
}

export function Toggle({ checked, onChange, disabled = false, label, description }: ToggleProps) {
	return (
		<div className="flex items-center justify-between gap-3">
			{(label || description) && (
				<div className="flex-1 min-w-0">
					{label && <p className="text-sm font-medium">{label}</p>}
					{description && (
						<p className="text-xs text-[var(--color-muted)] mt-0.5">{description}</p>
					)}
				</div>
			)}
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				disabled={disabled}
				onClick={() => onChange(!checked)}
				className={`
					relative inline-flex h-7 w-12 shrink-0 items-center rounded-full
					transition-colors cursor-pointer
					${disabled ? "opacity-50 cursor-not-allowed" : ""}
					${checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-light)]"}
				`}
			>
				<span
					className={`
						inline-block h-5 w-5 rounded-full bg-white shadow-sm
						transition-transform
						${checked ? "translate-x-6" : "translate-x-1"}
					`}
				/>
			</button>
		</div>
	);
}

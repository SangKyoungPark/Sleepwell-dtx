import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
	return (
		<div className={cn(
			"bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface-light)] to-[var(--color-surface)] animate-shimmer rounded-xl",
			className,
		)} />
	);
}

/** 홈/리포트용 카드 스켈레톤 */
export function SkeletonCard() {
	return (
		<div className="bg-[var(--color-surface)] rounded-2xl p-5 space-y-3">
			<Skeleton className="w-2/3 h-4 rounded" />
			<Skeleton className="w-full h-14 rounded-xl" />
			<Skeleton className="w-1/2 h-3 rounded" />
		</div>
	);
}

/** 페이지 전체 로딩 스켈레톤 */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
	return (
		<div className="animate-fade-in space-y-4 p-6 max-w-md mx-auto pb-20">
			<Skeleton className="w-1/3 h-6 rounded" />
			<Skeleton className="w-2/3 h-4 rounded" />
			<div className="space-y-3 mt-4">
				{Array.from({ length: cards }).map((_, i) => <SkeletonCard key={i} />)}
			</div>
		</div>
	);
}

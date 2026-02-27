"use client";

import React from "react";
import MarkdownText from "@/components/ui/MarkdownText";
import { CloudDecoration, MoonIllustration } from "@/components/ui/SleepIllustrations";

interface CoachResponseRendererProps {
	text: string;
	isStreaming: boolean;
}

// ── 태그 타입 정의 ──

type TagType = "TIP" | "STAT" | "STEPS" | "KEY";

interface ParsedTag {
	type: TagType;
	title: string;
	content: string;
}

interface ParsedSegment {
	kind: "text" | "card";
	text?: string;
	card?: ParsedTag;
}

// ── 아이콘 매칭 ──

const TOPIC_ICONS: { keywords: string[]; icon: string }[] = [
	{ keywords: ["수면", "잠", "꿈", "밤", "침대", "베개"], icon: "\uD83C\uDF19" },
	{ keywords: ["호흡", "이완", "명상", "릴렉스", "마음"], icon: "\uD83E\uDDD8" },
	{ keywords: ["운동", "활동", "걷기", "스트레칭"], icon: "\uD83C\uDFC3" },
	{ keywords: ["카페인", "커피", "차", "음료"], icon: "\u2615" },
	{ keywords: ["루틴", "습관", "규칙", "위생"], icon: "\uD83D\uDCCB" },
	{ keywords: ["스트레스", "불안", "걱정", "긴장"], icon: "\uD83D\uDCAD" },
	{ keywords: ["빛", "화면", "블루라이트", "어둡"], icon: "\uD83D\uDD26" },
	{ keywords: ["음식", "식사", "야식"], icon: "\uD83C\uDF75" },
	{ keywords: ["시간", "시계", "타이머", "분"], icon: "\u23F0" },
	{ keywords: ["효율", "통계", "분석", "데이터", "%"], icon: "\uD83D\uDCCA" },
];

function getTopicIcon(text: string): string {
	const lower = text.toLowerCase();
	for (const topic of TOPIC_ICONS) {
		if (topic.keywords.some((kw) => lower.includes(kw))) {
			return topic.icon;
		}
	}
	return "\u2728";
}

// ── 하단 일러스트 선택 ──

function getBottomIllustration(fullText: string): React.ReactNode {
	const lower = fullText.toLowerCase();
	if (lower.includes("\uC218\uBA74") || lower.includes("\uC7A0") || lower.includes("\uBC24") || lower.includes("\uCE68\uB300")) {
		return (
			<div className="flex justify-center mt-3 opacity-40">
				<MoonIllustration size={40} />
			</div>
		);
	}
	if (lower.includes("\uC774\uC644") || lower.includes("\uD638\uD761") || lower.includes("\uBA85\uC0C1") || lower.includes("\uAD6C\uB984")) {
		return (
			<div className="flex justify-center mt-3 opacity-30">
				<CloudDecoration />
			</div>
		);
	}
	return null;
}

// ── 태그 파서 ──

const TAG_REGEX = /\[(TIP|STAT|STEPS|KEY):([^\]]*)\]([\s\S]*?)\[\/\1\]/g;

function parseResponse(text: string): ParsedSegment[] {
	const segments: ParsedSegment[] = [];
	let lastIndex = 0;

	let match: RegExpExecArray | null;
	const regex = new RegExp(TAG_REGEX.source, TAG_REGEX.flags);

	while ((match = regex.exec(text)) !== null) {
		// 태그 앞의 일반 텍스트
		if (match.index > lastIndex) {
			const beforeText = text.slice(lastIndex, match.index).trim();
			if (beforeText) {
				segments.push({ kind: "text", text: beforeText });
			}
		}

		segments.push({
			kind: "card",
			card: {
				type: match[1] as TagType,
				title: match[2].trim(),
				content: match[3].trim(),
			},
		});

		lastIndex = match.index + match[0].length;
	}

	// 남은 텍스트
	if (lastIndex < text.length) {
		const remaining = text.slice(lastIndex).trim();
		if (remaining) {
			segments.push({ kind: "text", text: remaining });
		}
	}

	return segments;
}

// ── 비주얼 카드 컴포넌트들 ──

function TipCard({ title, content, index }: { title: string; content: string; index: number }) {
	const icon = getTopicIcon(title + " " + content);
	return (
		<div
			className="rounded-2xl p-4 my-2 animate-card-reveal"
			style={{
				background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(129,140,248,0.08))",
				border: "1px solid rgba(99,102,241,0.25)",
				backdropFilter: "blur(8px)",
				animationDelay: `${index * 100}ms`,
			}}
		>
			<div className="flex items-start gap-3">
				<div
					className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
					style={{ background: "rgba(99,102,241,0.2)" }}
				>
					{icon}
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-xs font-bold text-[var(--color-primary-light)] mb-1">{title}</p>
					<p className="text-sm leading-relaxed text-[var(--color-foreground)] opacity-90">{content}</p>
				</div>
			</div>
		</div>
	);
}

function StatCard({ title, content, index }: { title: string; content: string; index: number }) {
	return (
		<div
			className="rounded-2xl p-4 my-2 text-center animate-card-reveal"
			style={{
				background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.06))",
				border: "1px solid rgba(52,211,153,0.25)",
				backdropFilter: "blur(8px)",
				animationDelay: `${index * 100}ms`,
			}}
		>
			<p className="text-xs text-[var(--color-muted)] mb-1">{title}</p>
			<p className="text-2xl font-bold text-[var(--color-success)]">{content}</p>
		</div>
	);
}

function StepsCard({ title, content, index }: { title: string; content: string; index: number }) {
	const steps = content
		.split("\n")
		.map((s) => s.replace(/^\d+[.)]\s*/, "").trim())
		.filter(Boolean);

	return (
		<div
			className="rounded-2xl p-4 my-2 animate-card-reveal"
			style={{
				background: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(139,92,246,0.06))",
				border: "1px solid rgba(167,139,250,0.25)",
				backdropFilter: "blur(8px)",
				animationDelay: `${index * 100}ms`,
			}}
		>
			<p className="text-xs font-bold text-[var(--color-accent)] mb-3">{title}</p>
			<div className="space-y-2.5">
				{steps.map((step, i) => (
					<div key={i} className="flex items-start gap-3">
						<div
							className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
							style={{
								background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
								color: "white",
							}}
						>
							{i + 1}
						</div>
						<p className="text-sm leading-relaxed text-[var(--color-foreground)] opacity-90 pt-0.5">
							{step}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

function KeyCard({ title, content, index }: { title: string; content: string; index: number }) {
	return (
		<div
			className="rounded-2xl p-4 my-2 relative overflow-hidden animate-card-reveal"
			style={{
				background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))",
				border: "1px solid rgba(251,191,36,0.25)",
				backdropFilter: "blur(8px)",
				animationDelay: `${index * 100}ms`,
			}}
		>
			{/* 별 장식 */}
			<div className="absolute top-2 right-3 text-xs opacity-40 animate-twinkle">{"\u2728"}</div>
			<div className="flex items-start gap-3">
				<div
					className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
					style={{ background: "rgba(251,191,36,0.2)" }}
				>
					{"\u2B50"}
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-xs font-bold text-[var(--color-warning)] mb-1">{title}</p>
					<p className="text-sm leading-relaxed text-[var(--color-foreground)] opacity-90">{content}</p>
				</div>
			</div>
		</div>
	);
}

// ── 카드 렌더 디스패처 ──

function renderCard(card: ParsedTag, index: number): React.ReactNode {
	switch (card.type) {
		case "TIP":
			return <TipCard key={`tip-${index}`} title={card.title} content={card.content} index={index} />;
		case "STAT":
			return <StatCard key={`stat-${index}`} title={card.title} content={card.content} index={index} />;
		case "STEPS":
			return <StepsCard key={`steps-${index}`} title={card.title} content={card.content} index={index} />;
		case "KEY":
			return <KeyCard key={`key-${index}`} title={card.title} content={card.content} index={index} />;
		default:
			return null;
	}
}

// ── 메인 컴포넌트 ──

export default function CoachResponseRenderer({ text, isStreaming }: CoachResponseRendererProps) {
	// 스트리밍 중이면 기존 MarkdownText로 표시
	if (isStreaming) {
		return <MarkdownText text={text} />;
	}

	// 태그가 하나도 없으면 기존 MarkdownText 사용
	const hasTag = /\[(TIP|STAT|STEPS|KEY):/.test(text);
	if (!hasTag) {
		return <MarkdownText text={text} />;
	}

	// 태그 파싱 후 비주얼 렌더링
	const segments = parseResponse(text);

	return (
		<div>
			{segments.map((seg, i) => {
				if (seg.kind === "text" && seg.text) {
					return <MarkdownText key={`text-${i}`} text={seg.text} />;
				}
				if (seg.kind === "card" && seg.card) {
					return renderCard(seg.card, i);
				}
				return null;
			})}
			{getBottomIllustration(text)}
		</div>
	);
}

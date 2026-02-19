"use client";

import React from "react";

interface MarkdownTextProps {
  text: string;
  className?: string;
}

/** 경량 마크다운 렌더러 — bold, italic, code, 제목, 리스트 지원 */
export default function MarkdownText({ text, className = "" }: MarkdownTextProps) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (listItems.length === 0) return;
    if (listType === "ol") {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-0.5">
          {listItems}
        </ol>,
      );
    } else {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-0.5">
          {listItems}
        </ul>,
      );
    }
    listItems = [];
    listType = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 제목
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = parseInline(headingMatch[2]);
      const cls =
        level === 1
          ? "text-base font-bold mt-3 mb-1"
          : level === 2
            ? "text-sm font-bold mt-2 mb-1"
            : "text-sm font-semibold mt-1.5 mb-0.5";
      elements.push(
        <div key={`h-${i}`} className={cls}>
          {content}
        </div>,
      );
      continue;
    }

    // 순서 없는 리스트
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(<li key={`li-${i}`}>{parseInline(ulMatch[1])}</li>);
      continue;
    }

    // 순서 있는 리스트
    const olMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (olMatch) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(<li key={`li-${i}`}>{parseInline(olMatch[1])}</li>);
      continue;
    }

    // 리스트 끊김
    flushList();

    // 빈 줄
    if (line.trim() === "") {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    // 일반 텍스트
    elements.push(
      <div key={`p-${i}`}>{parseInline(line)}</div>,
    );
  }

  flushList();

  return <div className={className}>{elements}</div>;
}

/** 인라인 마크다운 파싱: **bold**, *italic*, `code` */
function parseInline(text: string): React.ReactNode {
  // 정규식으로 인라인 마크업 분할
  const parts: React.ReactNode[] = [];
  // 패턴: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // 매치 전 일반 텍스트
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={`i-${match.index}`}>{match[3]}</em>,
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={`c-${match.index}`}
          className="bg-white/10 px-1 py-0.5 rounded text-xs"
        >
          {match[4]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // 남은 텍스트
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : parts;
}

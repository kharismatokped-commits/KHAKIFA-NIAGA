"use client";

import React from "react";

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query,
  className = "",
  highlightClassName = "bg-amber-100 text-emerald-950 font-bold px-0.5 rounded-xs",
}) => {
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Tokenize query words
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (words.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Regex pattern matching any of the words
  const pattern = new RegExp(`(${words.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = words.some(
          (w) => w.toLowerCase() === part.toLowerCase(),
        );
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </span>
  );
};

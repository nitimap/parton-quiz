import { parseFormattedText } from "@/lib/formattedText";

export function FormattedText({ text, className = "" }: { text: string; className?: string }) {
  return <span className={`formatted-text ${className}`.trim()}>
    {parseFormattedText(text).map((block, blockIndex) => block.type === "text"
      ? <span className="formatted-text-normal" key={blockIndex}>{block.text}</span>
      : <span className="verse" key={blockIndex}>{block.lines.map((parts, lineIndex) =>
          <span className="verse-line" key={lineIndex}>{parts.map((part, partIndex) =>
            <span className="verse-part" key={partIndex}>{part}</span>)}</span>)}</span>)}
  </span>;
}

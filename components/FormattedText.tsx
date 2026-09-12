import { parseFormattedText } from "@/lib/formattedText";

function inlineFormatting(text: string) {
  return text.split(/(\[u\][\s\S]*?\[\/u\])/gi).filter(Boolean).map((part, index) => {
    const match = part.match(/^\[u\]([\s\S]*?)\[\/u\]$/i);
    return match ? <u className="quiz-underline" key={index}>{match[1]}</u> : part;
  });
}

export function FormattedText({ text, className = "" }: { text: string; className?: string }) {
  return <span className={`formatted-text ${className}`.trim()}>
    {parseFormattedText(text).map((block, blockIndex) => block.type === "text"
      ? <span className="formatted-text-normal" key={blockIndex}>{inlineFormatting(block.text)}</span>
      : <span className="verse" key={blockIndex}>{block.lines.map((parts, lineIndex) =>
          <span className="verse-line" key={lineIndex}>{parts.map((part, partIndex) =>
            <span className="verse-part" key={partIndex}>{inlineFormatting(part)}</span>)}</span>)}</span>)}
  </span>;
}

export type FormattedBlock =
  | { type: "text"; text: string }
  | { type: "verse"; lines: string[][] };

const versePattern = /\[กลอน\]([\s\S]*?)\[\/กลอน\]/gi;

export function parseFormattedText(value: string): FormattedBlock[] {
  const blocks: FormattedBlock[] = [];
  let cursor = 0;

  for (const match of value.matchAll(versePattern)) {
    const index = match.index ?? 0;
    const before = value.slice(cursor, index).trim();
    if (before) blocks.push({ type: "text", text: before });

    const lines = match[1].trim().split(/\r?\n/)
      .map((line) => line.trim()).filter(Boolean)
      .map((line) => line.split(/\t| {2,}/).map((part) => part.trim()).filter(Boolean));
    if (lines.length) blocks.push({ type: "verse", lines });
    cursor = index + match[0].length;
  }

  const after = value.slice(cursor).trim();
  if (after) blocks.push({ type: "text", text: after });
  return blocks.length ? blocks : [{ type: "text", text: value }];
}

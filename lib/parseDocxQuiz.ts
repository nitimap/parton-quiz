import mammoth from "mammoth";
import type { ParseResult, QuizChoice, QuizQuestion } from "@/types/quiz";
const questionLine = /^\s*(\d+)\s*[.)]\s*(.+)$/;
const choiceLine = /^\s*([กขคงA-Da-d])\s*[.)]\s*(.+)$/;
const answerLine = /^\s*(\d+)\s*[.)]?\s*([กขคงA-Da-d])\s*$/;
const thaiLabels = ["ก", "ข", "ค", "ง"];
const labelIndex = (label: string) => thaiLabels.includes(label) ? thaiLabels.indexOf(label) : "ABCD".indexOf(label.toUpperCase());
const clean = (s: string) => s.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
export async function parseDocxQuiz(buffer: Buffer): Promise<ParseResult> {
  const raw = await mammoth.extractRawText({ buffer });
  const rawResult = parseQuizText(raw.value);
  if (rawResult.success) return rawResult;
  const html = await mammoth.convertToHtml({ buffer });
  const listAwareResult = parseQuizText(htmlToNumberedText(html.value));
  return listAwareResult.success ? listAwareResult : rawResult;
}

function decodeHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export function htmlToNumberedText(html: string) {
  const blocks = [...html.matchAll(/<(li|p)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)];
  const lines: string[] = [];
  let inAnswerKey = false, questionNumber = 0, answerNumber = 0;
  for (const block of blocks) {
    const tag = block[1].toLowerCase(), text = clean(decodeHtml(block[2]));
    if (!text) continue;
    if (/^(เฉลย|answer\s*key)\s*:?$/i.test(text)) { inAnswerKey = true; lines.push(text); continue; }
    if (tag === "li") {
      if (inAnswerKey) lines.push(`${++answerNumber}. ${text}`);
      else lines.push(`${++questionNumber}. ${text}`);
    } else lines.push(text);
  }
  return lines.join("\n");
}
export function parseQuizText(text: string): ParseResult {
  const errors: string[] = [], warnings: string[] = [];
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean);
  const keyAt = lines.findIndex((line) => /^(เฉลย|answer\s*key)\s*:?$/i.test(line));
  if (keyAt < 0) return { success: false, questions: [], warnings, errors: ["Answer key heading (เฉลย or Answer Key) was not found."], answerCount: 0 };
  const raw: { number: number; text: string; choices: { label: string; text: string }[] }[] = []; let current: (typeof raw)[number] | undefined;
  for (const line of lines.slice(0, keyAt)) {
    const c = line.match(choiceLine), q = line.match(questionLine);
    if (c && current) current.choices.push({ label: c[1], text: c[2] });
    else if (q) { current = { number: Number(q[1]), text: q[2], choices: [] }; raw.push(current); }
    else if (current && !current.choices.length) current.text += ` ${line}`;
    else if (current?.choices.length) current.choices[current.choices.length - 1].text += ` ${line}`;
  }
  if (!raw.length) errors.push("No numbered questions were found.");
  const seen = new Set<number>(); raw.forEach((q) => { if (seen.has(q.number)) errors.push(`Duplicate question number ${q.number}.`); seen.add(q.number); if (q.choices.length !== 4) errors.push(`Question ${q.number} has ${q.choices.length} answer choices; exactly 4 are required.`); });
  const answers = new Map<number, string>();
  for (const line of lines.slice(keyAt + 1)) { const m = line.match(answerLine); if (m) answers.set(Number(m[1]), m[2]); else warnings.push(`Could not read answer-key line: “${line}”`); }
  const questions: QuizQuestion[] = raw.map((q) => {
    const choices: QuizChoice[] = q.choices.map((c, i) => ({ id: `q${q.number}-choice-${i + 1}`, text: clean(c.text), originalLabel: c.label }));
    const answer = answers.get(q.number), index = answer ? labelIndex(answer) : -1;
    if (!answer) errors.push(`Answer for Question ${q.number} was not found.`); else if (index < 0 || !choices[index]) errors.push(`Answer for Question ${q.number} does not point to a valid choice.`);
    return { id: `question-${q.number}`, originalNumber: q.number, question: clean(q.text), choices, correctChoiceId: choices[index]?.id ?? "" };
  });
  for (const number of answers.keys()) if (!seen.has(number)) errors.push(`Answer key refers to missing Question ${number}.`);
  return { success: errors.length === 0, questions, warnings, errors: [...new Set(errors)], answerCount: answers.size };
}

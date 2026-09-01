import type { QuizQuestion } from "@/types/quiz";
import { shuffle } from "./shuffle";
export function createSession(questions: readonly QuizQuestion[], count = questions.length): QuizQuestion[] { return shuffle(questions).slice(0, Math.min(count, questions.length)).map((q) => ({ ...q, choices: shuffle(q.choices) })); }
export function scoreMessage(percent: number) { if (percent >= 90) return "Excellent work!"; if (percent >= 80) return "Great job!"; if (percent >= 70) return "Good effort!"; return "Keep practicing!"; }

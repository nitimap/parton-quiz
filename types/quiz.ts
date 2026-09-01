export type QuizChoice = { id: string; text: string; originalLabel?: string };
export type QuizQuestion = { id: string; originalNumber: number; question: string; choices: QuizChoice[]; correctChoiceId: string };
export type Quiz = { id: string; title: string; subject?: string; description?: string; sourceFilename?: string; questions: QuizQuestion[]; createdAt?: string };
export type QuizSummary = Omit<Quiz, "questions"> & { questionCount: number };
export type AnswerRecord = { questionId: string; selectedChoiceId: string; correctChoiceId: string; isCorrect: boolean };
export type ParseResult = { success: boolean; questions: QuizQuestion[]; warnings: string[]; errors: string[]; answerCount: number };
export type QuizMode = "practice" | "test";

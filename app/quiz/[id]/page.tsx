import { notFound } from "next/navigation";
import { QuizPlayer } from "@/components/QuizPlayer";
import { adminClient, publicClient } from "@/lib/supabase/server";
import { sampleQuiz } from "@/lib/sampleData";
import type { Quiz } from "@/types/quiz";

export const dynamic = "force-dynamic";
export default async function QuizPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ assignment?: string }> }) {
  const { id } = await params, { assignment } = await searchParams;
  let quiz: Quiz | undefined;
  if (id === "sample" && !publicClient()) quiz = sampleQuiz;
  else { const db = publicClient(); if (db) { const { data } = await db.from("quizzes").select("*").eq("id", id).single(); if (data) quiz = { id: data.id, title: data.title, subject: data.subject, description: data.description, questions: data.questions, createdAt: data.created_at }; } }
  if (!quiz) notFound();
  let validToken: string | undefined;
  if (assignment) { const db = adminClient(); if (db) { const { data } = await db.from("assignments").select("token").eq("token", assignment).eq("quiz_id", id).single(); validToken = data?.token; } }
  return <QuizPlayer quiz={quiz} assignmentToken={validToken}/>;
}

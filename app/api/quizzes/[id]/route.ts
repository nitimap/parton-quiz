import { NextResponse } from "next/server";
import { isParent } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import { z } from "zod";

const questionSchema = z.object({
  id: z.string(), originalNumber: z.number(), question: z.string().min(1),
  choices: z.array(z.object({ id: z.string(), text: z.string().min(1), originalLabel: z.string().optional() })).length(4),
  correctChoiceId: z.string().min(1),
}).refine(q => q.choices.some(c => c.id === q.correctChoiceId), "Correct answer must match a choice.");

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120), subject: z.string().max(80), description: z.string().max(500),
  sourceFilename: z.string().max(255).optional(), questions: z.array(questionSchema).min(1).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isParent()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = updateSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid quiz update." }, { status: 400 });
  const db = adminClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { id } = await params;
  const values = { title: body.data.title, subject: body.data.subject || null, description: body.data.description || null, ...(body.data.questions ? { questions: body.data.questions, source_filename: body.data.sourceFilename || null } : {}), updated_at: new Date().toISOString() };
  const { error } = await db.from("quizzes").update(values).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isParent()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adminClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { id } = await params, { error } = await db.from("quizzes").delete().eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}

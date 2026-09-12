import { NextResponse } from "next/server";
import { z } from "zod";
import { isParent } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!await isParent()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = z.object({ archived: z.boolean() }).safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid assignment update." }, { status: 400 });
  const db = adminClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { token: id } = await params;
  const { error } = await db.from("assignments").update({ archived_at: body.data.archived ? new Date().toISOString() : null }).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!await isParent()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adminClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { token: id } = await params;
  const { error } = await db.from("assignments").delete().eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}

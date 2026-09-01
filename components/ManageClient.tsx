"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { ParseResult, QuizQuestion } from "@/types/quiz";

type Saved = { id: string; title: string; subject?: string; description?: string; questions: QuizQuestion[]; created_at: string };
type Parsed = ParseResult & { filename: string };

export function ManageClient() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<Saved | null>(null);
  const [title, setTitle] = useState(""), [subject, setSubject] = useState(""), [description, setDescription] = useState("");
  const [quizzes, setQuizzes] = useState<Saved[]>([]);

  const load = async () => { const r = await fetch("/api/quizzes"); if (r.ok) setQuizzes(await r.json()); };
  useEffect(() => { fetch("/api/parent/status").then(r => r.json()).then(x => { setAuth(x.authenticated); if (x.authenticated) load(); }); }, []);

  const login = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage("");
    const r = await fetch("/api/parent/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin }) });
    const x = await r.json(); setBusy(false);
    if (r.ok) { setAuth(true); load(); } else setMessage(x.error);
  };
  const parseFile = async (file: File, target: Saved | null) => {
    setReplaceTarget(target); setBusy(true); setMessage("Parsing document…");
    const form = new FormData(); form.append("file", file);
    const r = await fetch("/api/parse", { method: "POST", body: form }), x = await r.json(); setBusy(false);
    if (r.ok) { setParsed(x); setTitle(target?.title ?? file.name.replace(/\.docx$/i, "")); setSubject(target?.subject ?? ""); setDescription(target?.description ?? ""); setMessage(""); }
    else setMessage(x.error);
  };
  const chooseFile = async (e: React.ChangeEvent<HTMLInputElement>, target: Saved | null) => { const file = e.target.files?.[0]; if (file) await parseFile(file, target); e.target.value = ""; };
  const save = async () => {
    if (!parsed?.success) return;
    if (replaceTarget && !confirm(`Replace all questions in “${replaceTarget.title}” with ${parsed.questions.length} questions from this file?`)) return;
    setBusy(true); const replacing = Boolean(replaceTarget);
    const r = await fetch(replacing ? `/api/quizzes/${replaceTarget?.id}` : "/api/quizzes", { method: replacing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, subject, description, sourceFilename: parsed.filename, questions: parsed.questions }) });
    const x = await r.json(); setBusy(false);
    if (r.ok) { setMessage(replacing ? "Quiz questions updated successfully." : "Quiz saved successfully."); setParsed(null); setReplaceTarget(null); setTitle(""); setSubject(""); setDescription(""); load(); }
    else setMessage(x.error);
  };
  const remove = async (q: Saved) => { if (!confirm(`Delete “${q.title}”?\n\nThis cannot be undone.`)) return; setBusy(true); const r = await fetch(`/api/quizzes/${q.id}`, { method: "DELETE" }); setBusy(false); if (r.ok) load(); else setMessage((await r.json()).error); };
  const edit = async (q: Saved) => {
    const nextTitle = prompt("Quiz title", q.title); if (nextTitle === null || !nextTitle.trim()) return;
    const nextSubject = prompt("Subject (optional)", q.subject ?? ""); if (nextSubject === null) return;
    const nextDescription = prompt("Description (optional)", q.description ?? ""); if (nextDescription === null) return;
    setBusy(true); const r = await fetch(`/api/quizzes/${q.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: nextTitle, subject: nextSubject, description: nextDescription }) }); setBusy(false);
    if (r.ok) { setMessage("Quiz details updated successfully."); load(); } else setMessage((await r.json()).error);
  };

  if (auth === null) return <main className="shell py-16 text-center">Loading parent area…</main>;
  if (!auth) return <main className="shell py-16"><form onSubmit={login} className="card mx-auto max-w-md p-7 sm:p-10"><p className="eyebrow">Parent area</p><h1 className="mt-2 text-3xl font-bold">Enter parent PIN</h1><p className="mt-2 text-[var(--muted)]">Quiz management is protected for this browser session.</p><label className="label mt-8" htmlFor="pin">PIN</label><input id="pin" className="field" type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} autoFocus required/><button disabled={busy} className="btn btn-primary mt-4 w-full">{busy ? "Checking…" : "Continue"}</button>{message && <p className="mt-4 rounded-xl bg-[var(--red-soft)] p-3 text-[var(--red)]">{message}</p>}<Link href="/" className="mt-6 block text-center text-sm font-bold text-[var(--blue)]">← Back to quiz library</Link></form></main>;

  return <main className="shell py-10 sm:py-14">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Parent area</p><h1 className="mt-2 text-4xl font-bold">Manage Quizzes</h1></div><Link className="btn btn-secondary" href="/">View Quiz Library</Link></div>
    {message && <p className={`mt-6 rounded-xl p-4 ${message.includes("success") ? "bg-[var(--green-soft)] text-[var(--green)]" : "bg-[var(--red-soft)] text-[var(--red)]"}`}>{message}</p>}
    <section className="card mt-8 p-5 sm:p-8">
      <h2 className="text-2xl font-bold">{replaceTarget ? `Update “${replaceTarget.title}”` : "Upload New Quiz"}</h2>
      <p className="mt-1 text-[var(--muted)]">{replaceTarget ? "Review the newly parsed questions before replacing the existing set." : "Choose a Google Docs worksheet downloaded as .docx. The original file is discarded after parsing."}</p>
      {!replaceTarget && <label className="btn btn-primary mt-5 cursor-pointer"><input type="file" accept=".docx" className="sr-only" onChange={e => chooseFile(e, null)}/>{busy ? "Working…" : "Choose .docx file"}</label>}
      {parsed && <div className="mt-7 border-t border-[var(--line)] pt-7">
        <div className={`rounded-2xl p-4 ${parsed.success ? "bg-[var(--green-soft)]" : "bg-[var(--red-soft)]"}`}><strong className="block">File: {parsed.filename}</strong><p>✓ Found {parsed.questions.length} questions</p><p>✓ Found {parsed.answerCount} answers</p>{parsed.errors.map(e => <p key={e}>⚠ {e}</p>)}{parsed.warnings.map(w => <p key={w}>⚠ {w}</p>)}</div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="label">Quiz Title *</span><input className="field" value={title} onChange={e => setTitle(e.target.value)}/></label><label><span className="label">Subject</span><input className="field" value={subject} onChange={e => setSubject(e.target.value)}/></label><label className="sm:col-span-2"><span className="label">Description</span><textarea className="field" value={description} onChange={e => setDescription(e.target.value)}/></label></div>
        <h3 className="mt-8 text-xl font-bold">Preview Questions</h3><div className="mt-3 max-h-[520px] space-y-3 overflow-auto pr-2">{parsed.questions.map((q, i) => <details className="rounded-2xl border border-[var(--line)] bg-white p-4" key={q.id} open={i === 0}><summary className="cursor-pointer font-bold">Question {q.originalNumber}: {q.question}</summary><ol className="mt-3 space-y-1">{q.choices.map((c, j) => <li key={c.id}>{"ABCD"[j]}. {c.text}{c.id === q.correctChoiceId && <strong className="ml-2 text-[var(--green)]">✓ Correct Answer</strong>}</li>)}</ol></details>)}</div>
        <div className="mt-6 flex flex-wrap gap-3"><button disabled={!parsed.success || !title.trim() || busy} className="btn btn-primary" onClick={save}>{busy ? "Saving…" : replaceTarget ? "Replace Questions" : "Save Quiz"}</button><button className="btn btn-secondary" onClick={() => { setParsed(null); setReplaceTarget(null); }}>Cancel</button></div>
      </div>}
    </section>
    <section className="mt-10"><h2 className="text-2xl font-bold">Existing Quizzes</h2><div className="mt-4 grid gap-4">{quizzes.map(q => <article className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center" key={q.id}><div className="flex-1"><h3 className="text-xl font-bold">{q.title}</h3><p className="text-sm text-[var(--muted)]">{q.subject || "General"} · {q.questions.length} questions · {new Date(q.created_at).toLocaleDateString()}</p></div><Link className="btn btn-secondary" href={`/quiz/${q.id}`}>Preview</Link><label className="btn btn-primary cursor-pointer"><input type="file" accept=".docx" className="sr-only" onChange={e => chooseFile(e, q)}/>Update from DOCX</label><button className="btn btn-secondary" disabled={busy} onClick={() => edit(q)}>Edit details</button><button className="btn btn-danger" disabled={busy} onClick={() => remove(q)}>Delete</button></article>)}{!quizzes.length && <p className="card p-6 text-[var(--muted)]">No saved quizzes yet.</p>}</div></section>
  </main>;
}

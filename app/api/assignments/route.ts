import { NextResponse } from "next/server";
import { isParent } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function GET(){if(!await isParent())return NextResponse.json({error:"Unauthorized"},{status:401});const db=adminClient();if(!db)return NextResponse.json({error:"Supabase is not configured."},{status:503});const {data,error}=await db.from("assignments").select("*, quizzes(title,subject), attempts(*)").order("created_at",{ascending:false});return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json(data)}
export async function POST(req:Request){if(!await isParent())return NextResponse.json({error:"Unauthorized"},{status:401});const body=z.object({quizId:z.string().uuid(),label:z.string().trim().min(1).max(120)}).safeParse(await req.json());if(!body.success)return NextResponse.json({error:"Invalid assignment."},{status:400});const db=adminClient();if(!db)return NextResponse.json({error:"Supabase is not configured."},{status:503});const {data,error}=await db.from("assignments").insert({quiz_id:body.data.quizId,label:body.data.label}).select().single();return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json(data,{status:201})}

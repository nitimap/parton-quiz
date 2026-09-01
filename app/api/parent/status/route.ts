import { NextResponse } from "next/server"; import { isParent } from "@/lib/auth"; export async function GET(){return NextResponse.json({authenticated:await isParent()})}

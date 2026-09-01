import { createHash,timingSafeEqual } from "crypto"; import { cookies } from "next/headers";
const token=()=>createHash("sha256").update(`quiz-parent:${process.env.PARENT_PIN??""}`).digest("hex");
export function pinMatches(value:string){const expected=process.env.PARENT_PIN;if(!expected)return false;const a=Buffer.from(createHash("sha256").update(value).digest("hex")),b=Buffer.from(createHash("sha256").update(expected).digest("hex"));return timingSafeEqual(a,b)}
export async function isParent(){return (await cookies()).get("quiz_parent")?.value===token()&&Boolean(process.env.PARENT_PIN)}
export async function setParentCookie(){(await cookies()).set("quiz_parent",token(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:60*60*8,path:"/"})}

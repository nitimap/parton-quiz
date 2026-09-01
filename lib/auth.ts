import { createHash,timingSafeEqual } from "crypto"; import { cookies } from "next/headers";
const configuredPin=()=>process.env.PARENT_PIN?.trim()??"";
const token=()=>createHash("sha256").update(`quiz-parent:${configuredPin()}`).digest("hex");
export function hasParentPin(){return configuredPin().length>0}
export function pinMatches(value:string){const expected=configuredPin();if(!expected)return false;const a=Buffer.from(createHash("sha256").update(value.trim()).digest("hex")),b=Buffer.from(createHash("sha256").update(expected).digest("hex"));return timingSafeEqual(a,b)}
export async function isParent(){return (await cookies()).get("quiz_parent")?.value===token()&&hasParentPin()}
export async function setParentCookie(){(await cookies()).set("quiz_parent",token(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:60*60*8,path:"/"})}

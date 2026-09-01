import type { Quiz } from "@/types/quiz";
export const sampleQuiz: Quiz = { id: "sample", title: "Social Studies Review", subject: "Social Studies", description: "Sample quiz — connect Supabase to replace it with your saved quizzes.", createdAt: new Date().toISOString(), questions: [
  { id: "s1", originalNumber: 1, question: "หน่วยเศรษฐกิจแบ่งออกเป็น 3 หน่วย คือข้อใด", choices: [{ id: "s1a", text: "หน่วยครอบครัว หน่วยร้านค้า หน่วยประเทศ" }, { id: "s1b", text: "หน่วยบุคคล หน่วยบริษัท หน่วยโรงพยาบาล" }, { id: "s1c", text: "หน่วยครัวเรือน หน่วยธุรกิจ หน่วยรัฐบาล" }, { id: "s1d", text: "หน่วยครัว หน่วยภาษี หน่วยเศรษฐกิจ" }], correctChoiceId: "s1c" },
  { id: "s2", originalNumber: 2, question: "รายได้หลักของรัฐบาลได้มาจากที่ใด", choices: [{ id: "s2a", text: "ดอกเบี้ยเงินฝาก" }, { id: "s2b", text: "กำไรจากการขายสินค้า" }, { id: "s2c", text: "การทำงาน" }, { id: "s2d", text: "ภาษี" }], correctChoiceId: "s2d" }
] };

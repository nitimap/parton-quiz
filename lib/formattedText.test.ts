import { describe, expect, it } from "vitest";
import { parseFormattedText } from "./formattedText";

describe("formatted quiz text", () => {
  it("separates explicitly marked verse from normal text", () => {
    expect(parseFormattedText("อ่านข้อความ\n[กลอน]\nวรรคหนึ่ง    วรรคสอง\nวรรคสาม    วรรคสี่\n[/กลอน]\nแล้วตอบคำถาม")).toEqual([
      { type: "text", text: "อ่านข้อความ" },
      { type: "verse", lines: [["วรรคหนึ่ง", "วรรคสอง"], ["วรรคสาม", "วรรคสี่"]] },
      { type: "text", text: "แล้วตอบคำถาม" },
    ]);
  });

  it("leaves unmarked text as normal text", () => {
    expect(parseFormattedText("คำถามทั่วไป")).toEqual([{ type: "text", text: "คำถามทั่วไป" }]);
  });
});

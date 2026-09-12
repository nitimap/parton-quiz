import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { markDocxUnderlines, parseDocxQuiz } from "./parseDocxQuiz";

async function quizDocx() {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("_rels/.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  const paragraph = (content: string) => `<w:p>${content}</w:p>`;
  const text = (value: string) => `<w:r><w:t xml:space="preserve">${value}</w:t></w:r>`;
  const underlined = (value: string) => `<w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t>${value}</w:t></w:r>`;
  zip.file("word/document.xml", '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    paragraph(text("1. คำถาม")) + paragraph(text("ก. ") + underlined("ตัวเลือก")) +
    paragraph(text("ข. สอง")) + paragraph(text("ค. สาม")) + paragraph(text("ง. สี่")) +
    paragraph(text("เฉลย")) + paragraph(text("1. ก")) + "</w:body></w:document>");
  return zip.generateAsync({ type: "nodebuffer" });
}

describe("DOCX underline extraction", () => {
  it("marks underlined Word runs and ignores explicit underline removal", async () => {
    const zip = new JSZip();
    zip.file("word/document.xml", [
      "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p>",
      "<w:r><w:rPr><w:u w:val=\"single\"/></w:rPr><w:t>ขีดเส้นใต้</w:t></w:r>",
      "<w:r><w:rPr><w:u w:val=\"none\"/></w:rPr><w:t>ธรรมดา</w:t></w:r>",
      "</w:p></w:body></w:document>",
    ].join(""));
    const result = await markDocxUnderlines(await zip.generateAsync({ type: "nodebuffer" }));
    const xml = await (await JSZip.loadAsync(result)).file("word/document.xml")!.async("string");
    expect(xml).toContain("<w:t>\uE000ขีดเส้นใต้\uE001</w:t>");
    expect(xml).toContain("<w:t>ธรรมดา</w:t>");
  });

  it("keeps underline formatting in a parsed answer choice", async () => {
    const result = await parseDocxQuiz(await quizDocx());
    expect(result.success).toBe(true);
    expect(result.questions[0].choices[0].text).toContain("[u]ตัวเลือก[/u]");
  });
});

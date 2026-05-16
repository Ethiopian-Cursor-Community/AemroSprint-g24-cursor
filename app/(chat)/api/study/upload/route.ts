import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { extractTextFromPdf } from "@/lib/study/parse-pdf";
import { truncateStudyText } from "@/lib/study/types";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const textField = formData.get("text");
    const file = formData.get("file");

    if (typeof textField === "string" && textField.trim().length > 0) {
      const { text, truncated } = truncateStudyText(textField.trim());
      return NextResponse.json({
        text,
        fileName: "pasted-text.txt",
        truncated,
      });
    }

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No file or text provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File must be 5MB or smaller" },
        { status: 400 }
      );
    }

    const type = file.type;
    const uploadName = file instanceof File && file.name ? file.name : "upload";

    let rawText = "";

    if (type === "application/pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      rawText = await extractTextFromPdf(buffer);
    } else if (type === "text/plain") {
      rawText = await file.text();
    } else {
      return NextResponse.json(
        { error: "Only PDF and plain text files are supported" },
        { status: 400 }
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file" },
        { status: 400 }
      );
    }

    const { text, truncated } = truncateStudyText(rawText);

    return NextResponse.json({
      text,
      fileName: uploadName,
      truncated,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}

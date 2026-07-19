import { NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const totalPages = pdfDoc.numPages;

    const pageTexts: Array<{ page: number; text: string }> = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      pageTexts.push({
        page: i,
        text: pageText,
      });
    }

    const fullText = pageTexts.map((p) => p.text).join('\n\n');

    return NextResponse.json({
      text: fullText,
      pages: pageTexts,
      totalPages,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Extract text error:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract text from PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
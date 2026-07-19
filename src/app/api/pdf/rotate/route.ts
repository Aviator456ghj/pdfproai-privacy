import { NextResponse } from 'next/server';
import { PDFDocument, degrees } from 'pdf-lib';

function parsePageRange(rangeStr: string, maxPage: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(maxPage, parseInt(endStr, 10) || maxPage);
      for (let i = start; i <= end; i++) {
        pages.add(i - 1);
      }
    } else {
      const num = parseInt(part, 10);
      if (num >= 1 && num <= maxPage) {
        pages.add(num - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const angleStr = formData.get('angle') as string;
    const pagesStr = (formData.get('pages') as string) || 'all';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    const validAngles = [90, 180, 270];
    const angle = parseInt(angleStr, 10);

    if (!validAngles.includes(angle)) {
      return NextResponse.json(
        { error: `Invalid rotation angle. Must be one of: ${validAngles.join(', ')}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const allPages = pdfDoc.getPages();
    const totalPages = allPages.length;

    const targetPages =
      pagesStr === 'all'
        ? allPages.map((_, i) => i)
        : parsePageRange(pagesStr, totalPages);

    if (targetPages.length === 0) {
      return NextResponse.json(
        { error: 'No valid pages found in the specified range' },
        { status: 400 }
      );
    }

    for (const pageIndex of targetPages) {
      const page = allPages[pageIndex];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + angle));
    }

    const rotatedBytes = await pdfDoc.save();

    return new NextResponse(rotatedBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rotated-${angle}deg.pdf"`,
        'X-Rotated-Pages': String(targetPages.length),
      },
    });
  } catch (error) {
    console.error('PDF rotate error:', error);
    const message = error instanceof Error ? error.message : 'Failed to rotate PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
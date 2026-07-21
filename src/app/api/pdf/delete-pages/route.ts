import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { addFreeWatermark, shouldApplyWatermark } from '@/lib/pdf-watermark';

function parsePageNumbers(pageStr: string, maxPage: number): number[] {
  const pages = new Set<number>();
  const parts = pageStr.split(',').map((s) => s.trim());

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
    const pagesStr = (formData.get('pages') as string) || '';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    if (!pagesStr) {
      return NextResponse.json(
        { error: 'Pages to delete are required (e.g., "1,3,5-7")' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();

    const pagesToDelete = new Set(parsePageNumbers(pagesStr, totalPages));

    if (pagesToDelete.size === 0) {
      return NextResponse.json(
        { error: `No valid pages found. PDF has ${totalPages} pages.` },
        { status: 400 }
      );
    }

    if (pagesToDelete.size === totalPages) {
      return NextResponse.json(
        { error: 'Cannot delete all pages from the PDF' },
        { status: 400 }
      );
    }

    const newPdf = await PDFDocument.create();
    const keepIndices = sourcePdf
      .getPageIndices()
      .filter((_, i) => !pagesToDelete.has(i));

    const copiedPages = await newPdf.copyPages(sourcePdf, keepIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    let resultBytes = await newPdf.save();

    const applyWatermark = shouldApplyWatermark(request);
    if (applyWatermark) {
      resultBytes = await addFreeWatermark(resultBytes);
    }

    return new NextResponse(resultBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="pages-deleted.pdf"',
        'X-Remaining-Pages': String(newPdf.getPageCount()),
        'X-Deleted-Count': String(pagesToDelete.size),
        'X-Watermarked': applyWatermark ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error('Delete pages error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete pages';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
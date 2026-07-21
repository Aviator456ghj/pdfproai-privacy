import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { addFreeWatermark, shouldApplyWatermark } from '@/lib/pdf-watermark';

function parsePageRange(rangeStr: string, maxPage: number): number[] {
  const pages = new Set<number>();

  const parts = rangeStr.split(',').map((s) => s.trim());
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(maxPage, parseInt(endStr, 10) || maxPage);
      for (let i = start; i <= end; i++) {
        pages.add(i - 1); // 0-indexed
      }
    } else {
      const num = parseInt(part, 10);
      if (num >= 1 && num <= maxPage) {
        pages.add(num - 1); // 0-indexed
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mode = (formData.get('mode') as string) || 'range';
    const pagesStr = (formData.get('pages') as string) || '';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();

    let splitGroups: number[][] = [];

    switch (mode) {
      case 'range': {
        if (!pagesStr) {
          return NextResponse.json(
            { error: 'Page range is required for range mode' },
            { status: 400 }
          );
        }
        const pages = parsePageRange(pagesStr, totalPages);
        if (pages.length === 0) {
          return NextResponse.json(
            { error: 'No valid pages found in range' },
            { status: 400 }
          );
        }
        splitGroups = [pages];
        break;
      }

      case 'every-n': {
        const n = parseInt(pagesStr, 10);
        if (!n || n < 1) {
          return NextResponse.json(
            { error: 'Valid number of pages per split is required' },
            { status: 400 }
          );
        }
        for (let i = 0; i < totalPages; i += n) {
          const group: number[] = [];
          for (let j = i; j < Math.min(i + n, totalPages); j++) {
            group.push(j);
          }
          splitGroups.push(group);
        }
        break;
      }

      case 'specific': {
        if (!pagesStr) {
          return NextResponse.json(
            { error: 'Page list is required for specific mode' },
            { status: 400 }
          );
        }
        const parts = pagesStr.split(',').map((s) => s.trim());
        for (const part of parts) {
          const group = parsePageRange(part, totalPages);
          if (group.length > 0) {
            splitGroups.push(group);
          }
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Invalid split mode: ${mode}. Use "range", "every-n", or "specific"` },
          { status: 400 }
        );
    }

    // Create the first split PDF and return it
    const newPdf = await PDFDocument.create();
    const firstGroup = splitGroups[0];
    const copiedPages = await newPdf.copyPages(sourcePdf, firstGroup);
    copiedPages.forEach((page) => newPdf.addPage(page));

    let pdfBytes = await newPdf.save();

    const applyWatermark = shouldApplyWatermark(request);
    if (applyWatermark) {
      pdfBytes = await addFreeWatermark(pdfBytes);
    }

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="split-part-1.pdf"',
        'X-Total-Splits': String(splitGroups.length),
        'X-Part-Index': '0',
        'X-Watermarked': applyWatermark ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error('PDF split error:', error);
    const message = error instanceof Error ? error.message : 'Failed to split PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
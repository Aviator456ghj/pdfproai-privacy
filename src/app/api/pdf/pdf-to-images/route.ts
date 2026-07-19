import { NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

function parsePageRange(rangeStr: string, maxPage: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(maxPage, parseInt(endStr, 10) || maxPage);
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const num = parseInt(part, 10);
      if (num >= 1 && num <= maxPage) {
        pages.add(num);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

async function renderPageToImage(
  pdfDoc: PDFDocumentProxy,
  pageNum: number,
  format: 'png' | 'jpg',
  quality: number
): Promise<Buffer> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2.0 });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  if (format === 'png') {
    return canvas.toBuffer('image/png');
  } else {
    return canvas.toBuffer('image/jpeg', { quality });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const format = ((formData.get('format') as string) || 'png') as 'png' | 'jpg';
    const quality = parseFloat(formData.get('quality') as string) || 0.9;
    const pagesStr = (formData.get('pages') as string) || 'all';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    if (format !== 'png' && format !== 'jpg') {
      return NextResponse.json(
        { error: 'Format must be "png" or "jpg"' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const totalPages = pdfDoc.numPages;

    const targetPages =
      pagesStr === 'all'
        ? Array.from({ length: totalPages }, (_, i) => i + 1)
        : parsePageRange(pagesStr, totalPages);

    if (targetPages.length === 0) {
      return NextResponse.json(
        { error: `No valid pages found. PDF has ${totalPages} pages.` },
        { status: 400 }
      );
    }

    // Render the first page and return it
    const imageBuffer = await renderPageToImage(pdfDoc, targetPages[0], format, quality);

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="page-${targetPages[0]}.${format}"`,
        'X-Total-Pages': String(totalPages),
        'X-Rendered-Pages': String(targetPages.length),
      },
    });
  } catch (error) {
    console.error('PDF to images error:', error);
    const message = error instanceof Error ? error.message : 'Failed to convert PDF to images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
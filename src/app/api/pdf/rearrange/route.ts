import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { addFreeWatermark, shouldApplyWatermark } from '@/lib/pdf-watermark';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const orderStr = formData.get('order') as string;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    if (!orderStr) {
      return NextResponse.json(
        { error: 'Page order is required (JSON array of 1-based page indices)' },
        { status: 400 }
      );
    }

    let order: number[];
    try {
      order = JSON.parse(orderStr);
      if (!Array.isArray(order) || order.length === 0) {
        throw new Error('Order must be a non-empty array');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid order format. Must be a JSON array of numbers.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdf.getPageCount();

    // Validate all page indices are within range (1-based to 0-based)
    const zeroBasedOrder = order.map((page, idx) => {
      const num = typeof page === 'number' ? page : parseInt(String(page), 10);
      if (isNaN(num) || num < 1 || num > totalPages) {
        throw new Error(`Invalid page number at index ${idx}: ${page}. Must be 1-${totalPages}.`);
      }
      return num - 1;
    });

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, zeroBasedOrder);
    copiedPages.forEach((page) => newPdf.addPage(page));

    let rearrangedBytes = await newPdf.save();

    const applyWatermark = shouldApplyWatermark(request);
    if (applyWatermark) {
      rearrangedBytes = await addFreeWatermark(rearrangedBytes);
    }

    return new NextResponse(rearrangedBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rearranged.pdf"',
        'X-Page-Count': String(newPdf.getPageCount()),
        'X-Watermarked': applyWatermark ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error('Rearrange error:', error);
    const message = error instanceof Error ? error.message : 'Failed to rearrange pages';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
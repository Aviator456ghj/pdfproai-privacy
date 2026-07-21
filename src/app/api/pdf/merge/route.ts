import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { addFreeWatermark, shouldApplyWatermark } from '@/lib/pdf-watermark';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const applyWatermark = shouldApplyWatermark(request);

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 PDF files are required for merging' },
        { status: 400 }
      );
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: 'All entries must be valid File objects' },
          { status: 400 }
        );
      }

      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `File "${file.name}" is not a PDF` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    let mergedBytes = await mergedPdf.save();

    // Apply watermark for free-tier users
    if (applyWatermark) {
      mergedBytes = await addFreeWatermark(mergedBytes);
    }

    const totalPageCount = mergedPdf.getPageCount();

    return new NextResponse(mergedBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="merged-${totalPageCount}-pages.pdf"`,
        'X-Page-Count': String(totalPageCount),
        'X-Watermarked': applyWatermark ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error('PDF merge error:', error);
    const message = error instanceof Error ? error.message : 'Failed to merge PDFs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
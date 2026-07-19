import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const level = (formData.get('level') as string) || 'medium';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const originalSize = arrayBuffer.byteLength;

    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // Remove metadata for compression
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    // Set metadata to indicate compression
    pdfDoc.setProducer('PDFPro AI Compressor');

    // Save with optimization options based on level
    const saveOptions: Parameters<typeof pdfDoc.save>[0] = {};

    switch (level) {
      case 'low':
        // Minimal compression - just re-save
        saveOptions.useObjectStreams = true;
        break;
      case 'medium':
        // Medium compression - object streams
        saveOptions.useObjectStreams = true;
        break;
      case 'high':
        // High compression - object streams + add default empty objects removed
        saveOptions.useObjectStreams = true;
        // Also remove all annotations for max compression
        const pages = pdfDoc.getPages();
        for (const page of pages) {
          page.node.remove('Annots');
        }
        break;
      default:
        saveOptions.useObjectStreams = true;
    }

    const compressedBytes = await pdfDoc.save(saveOptions);
    const compressedSize = compressedBytes.byteLength;
    const reduction = Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);

    return new NextResponse(compressedBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed-${level}.pdf"`,
        'X-Original-Size': String(originalSize),
        'X-Compressed-Size': String(compressedSize),
        'X-Reduction-Percent': reduction.toFixed(2),
      },
    });
  } catch (error) {
    console.error('PDF compress error:', error);
    const message = error instanceof Error ? error.message : 'Failed to compress PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
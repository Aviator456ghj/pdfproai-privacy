import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'At least one image file is required' },
        { status: 400 }
      );
    }

    const SUPPORTED_TYPES = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/tiff',
      'image/gif',
    ];

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: 'All entries must be valid File objects' },
          { status: 400 }
        );
      }

      if (!SUPPORTED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported image format: ${file.type} for file "${file.name}"` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();

      // Convert image to PNG using sharp for consistent processing
      const processedBuffer = await sharp(Buffer.from(arrayBuffer))
        .png()
        .toBuffer();

      const image = await pdfDoc.embedPng(processedBuffer);

      // Get image dimensions and scale to fit A4-ish page (595 x 842 points)
      const imgWidth = image.width;
      const imgHeight = image.height;

      const pageWidth = 595;
      const pageHeight = 842;
      const margin = 40;

      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const scale = Math.min(
        availableWidth / imgWidth,
        availableHeight / imgHeight,
        1 // Don't upscale
      );

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      // Center the image on the page
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="images-to-pdf.pdf"',
        'X-Page-Count': String(pdfDoc.getPageCount()),
      },
    });
  } catch (error) {
    console.error('Images to PDF error:', error);
    const message = error instanceof Error ? error.message : 'Failed to convert images to PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
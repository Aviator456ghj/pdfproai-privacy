import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;
  return { r, g, b };
}

const POSITION_CONFIGS: Record<
  string,
  (pageWidth: number, pageHeight: number, textWidth: number, textHeight: number) => { x: number; y: number; rotate?: number }
> = {
  center: (pw, ph, tw, th) => ({
    x: (pw - tw) / 2,
    y: (ph - th) / 2,
    rotate: -45,
  }),
  top_left: (pw, ph, tw, _th) => ({ x: 30, y: ph - 30 - 15 }),
  top_center: (pw, ph, tw, _th) => ({ x: (pw - tw) / 2, y: ph - 30 - 15 }),
  top_right: (pw, ph, tw, _th) => ({ x: pw - tw - 30, y: ph - 30 - 15 }),
  bottom_left: (_pw, _ph, _tw, _th) => ({ x: 30, y: 30 }),
  bottom_center: (pw, _ph, tw, _th) => ({ x: (pw - tw) / 2, y: 30 }),
  bottom_right: (pw, _ph, tw, _th) => ({ x: pw - tw - 30, y: 30 }),
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = (formData.get('text') as string) || 'WATERMARK';
    const fontSize = parseInt(formData.get('fontSize') as string) || 48;
    const color = (formData.get('color') as string) || '#cccccc';
    const opacity = parseFloat(formData.get('opacity') as string) || 0.3;
    const position = (formData.get('position') as string) || 'center';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    if (!POSITION_CONFIGS[position]) {
      return NextResponse.json(
        { error: `Invalid position. Must be one of: ${Object.keys(POSITION_CONFIGS).join(', ')}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { r, g, b } = hexToRgb(color);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width: pw, height: ph } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      const posConfig = POSITION_CONFIGS[position](pw, ph, textWidth, textHeight);

      page.drawText(text, {
        x: posConfig.x,
        y: posConfig.y,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity: Math.max(0, Math.min(1, opacity)),
        rotate: posConfig.rotate ? degrees(posConfig.rotate) : undefined,
      });
    }

    const watermarkedBytes = await pdfDoc.save();

    return new NextResponse(watermarkedBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="watermarked.pdf"',
        'X-Watermark-Pages': String(pages.length),
      },
    });
  } catch (error) {
    console.error('PDF watermark error:', error);
    const message = error instanceof Error ? error.message : 'Failed to add watermark';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
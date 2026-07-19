import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { addFreeWatermark, shouldApplyWatermark } from '@/lib/pdf-watermark';

type Position =
  | 'bottom_center'
  | 'bottom_left'
  | 'bottom_right'
  | 'top_center'
  | 'top_left'
  | 'top_right';

function getPositionCoords(
  position: Position,
  pw: number,
  ph: number,
  textWidth: number,
  margin: number
): { x: number; y: number } {
  switch (position) {
    case 'bottom_center':
      return { x: (pw - textWidth) / 2, y: margin };
    case 'bottom_left':
      return { x: margin, y: margin };
    case 'bottom_right':
      return { x: pw - textWidth - margin, y: margin };
    case 'top_center':
      return { x: (pw - textWidth) / 2, y: ph - margin };
    case 'top_left':
      return { x: margin, y: ph - margin };
    case 'top_right':
      return { x: pw - textWidth - margin, y: ph - margin };
    default:
      return { x: (pw - textWidth) / 2, y: margin };
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const position = (formData.get('position') as Position) || 'bottom_center';
    const startNumber = parseInt(formData.get('startNumber') as string) || 1;
    const format = (formData.get('format') as string) || 'numeric';
    const fontSize = parseInt(formData.get('fontSize') as string) || 12;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    const validPositions: Position[] = [
      'bottom_center',
      'bottom_left',
      'bottom_right',
      'top_center',
      'top_left',
      'top_right',
    ];

    if (!validPositions.includes(position)) {
      return NextResponse.json(
        { error: `Invalid position. Must be one of: ${validPositions.join(', ')}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const margin = 40;

    pages.forEach((page, index) => {
      const pageNum = index + startNumber;

      let label: string;
      switch (format) {
        case 'numeric':
          label = String(pageNum);
          break;
        case 'roman':
          label = toRoman(pageNum);
          break;
        case 'dash_numeric':
          label = `— ${pageNum} —`;
          break;
        case 'page_of':
          label = `Page ${pageNum} of ${pages.length + startNumber - 1}`;
          break;
        default:
          label = String(pageNum);
      }

      const { width: pw, height: ph } = page.getSize();
      const textWidth = font.widthOfTextAtSize(label, fontSize);
      const coords = getPositionCoords(position, pw, ph, textWidth, margin);

      page.drawText(label, {
        x: coords.x,
        y: coords.y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    });

    let numberedBytes = await pdfDoc.save();

    const applyWatermark = shouldApplyWatermark(request);
    if (applyWatermark) {
      numberedBytes = await addFreeWatermark(numberedBytes);
    }

    return new NextResponse(numberedBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="with-page-numbers.pdf"',
        'X-Watermarked': applyWatermark ? 'true' : 'false',
      },
    });
  } catch (error) {
    console.error('Page numbers error:', error);
    const message = error instanceof Error ? error.message : 'Failed to add page numbers';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function toRoman(num: number): string {
  if (num <= 0) return String(num);
  const romanNumerals: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let result = '';
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}
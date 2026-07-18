import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import mammoth from 'mammoth';

// Simple HTML tag stripping and text extraction
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '  • ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No DOCX file provided' }, { status: 400 });
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.some((t) => file.type === t) && !file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'File must be a DOCX document' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    // Convert DOCX to HTML using mammoth
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // Strip HTML to plain text
    const text = stripHtml(html);

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'No text content could be extracted from the document' },
        { status: 400 }
      );
    }

    // Create PDF from text using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 60;
    const maxWidth = pageWidth - margin * 2;
    const fontSize = 11;
    const lineHeight = fontSize * 1.5;

    const lines: Array<{ text: string; bold: boolean }> = [];

    // Split text into lines and detect bold patterns
    const rawLines = text.split('\n');
    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        lines.push({ text: '', bold: false });
        continue;
      }

      // Word wrap the line
      const words = trimmed.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth && currentLine) {
          lines.push({ text: currentLine, bold: false });
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        // Detect if it looks like a heading (short, possibly all caps, or starts with bullet)
        const isHeading =
          trimmed.length < 60 &&
          (trimmed === trimmed.toUpperCase() || trimmed.startsWith('•') || trimmed.startsWith('-'));

        lines.push({ text: currentLine, bold: isHeading });
      }
    }

    // Render lines onto PDF pages
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    for (const line of lines) {
      if (line.text === '') {
        // Blank line = paragraph break
        y -= lineHeight * 0.5;
        if (y < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        continue;
      }

      const currentFont = line.bold ? boldFont : font;
      const currentFontSize = line.bold ? 13 : fontSize;
      const currentLineHeight = currentFontSize * 1.5;

      if (y - currentLineHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      currentPage.drawText(line.text, {
        x: margin,
        y: y - currentFontSize,
        size: currentFontSize,
        font: currentFont,
        color: rgb(0, 0, 0),
      });

      y -= currentLineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.docx?$/i, '')}.pdf"`,
        'X-Page-Count': String(pdfDoc.getPageCount()),
      },
    });
  } catch (error) {
    console.error('Word to PDF error:', error);
    const message = error instanceof Error ? error.message : 'Failed to convert Word to PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
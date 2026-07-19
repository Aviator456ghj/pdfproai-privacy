import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Adds a "PDFPro AI Free" watermark to every page of a PDF.
 * Used for free-tier users.
 */
export async function addFreeWatermark(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const text = 'PDFPro AI Free';
    const textWidth = font.widthOfTextAtSize(text, 14);

    // Draw diagonal watermark across the page
    // Position at center, rotated 45 degrees
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: 14,
      font,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.35,
      rotate: {
        type: 'degrees' as const,
        angle: -35,
      },
    });

    // Also draw a smaller watermark at bottom-right
    const footerText = 'Processed by PDFPro AI — Free Version';
    const footerWidth = font.widthOfTextAtSize(footerText, 8);
    page.drawText(footerText, {
      x: width - footerWidth - 20,
      y: 20,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.5,
    });
  }

  return await pdfDoc.save();
}

/**
 * Checks if a request should apply watermark (free tier).
 * In a real app, this would check the user's session/tier.
 * For now, checks the `X-User-Tier` header or defaults to free.
 */
export function shouldApplyWatermark(request: Request): boolean {
  const tier = request.headers.get('X-User-Tier');
  return !tier || tier === 'free';
}
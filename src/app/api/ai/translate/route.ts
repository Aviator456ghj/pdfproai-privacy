import { NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import ZAI from 'z-ai-web-dev-sdk';

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const totalPages = pdfDoc.numPages;

  const pageTexts: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      pageTexts.push(pageText);
    }
  }

  return pageTexts.join('\n\n');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetLanguage = (formData.get('targetLanguage') as string) || 'English';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    if (!targetLanguage.trim()) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(file);

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF' },
        { status: 400 }
      );
    }

    // Split text into chunks if too long
    const maxChunkLength = 8000;
    const chunks: string[] = [];

    if (extractedText.length <= maxChunkLength) {
      chunks.push(extractedText);
    } else {
      // Split by paragraphs to avoid breaking mid-sentence
      const paragraphs = extractedText.split('\n\n');
      let currentChunk = '';

      for (const para of paragraphs) {
        if ((currentChunk + '\n\n' + para).length > maxChunkLength && currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = para;
        } else {
          currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
        }
      }
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    }

    const systemPrompt = `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original meaning, tone, and formatting as much as possible. Only output the translated text, without any explanations or notes. Preserve paragraph breaks.`;

    const ai = await ZAI.create();

    // Translate chunks in parallel (max 3 concurrent)
    const translatedChunks: string[] = [];
    const batchSize = 3;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (chunk) => {
          const response = await ai.chat.completions.create({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: chunk },
            ],
          });
          return response?.choices?.[0]?.message?.content || chunk;
        })
      );
      translatedChunks.push(...batchResults);
    }

    const translatedText = translatedChunks.join('\n\n');

    return NextResponse.json({
      translatedText,
      originalText: extractedText,
      metadata: {
        fileName: file.name,
        targetLanguage,
        originalLength: extractedText.length,
        translatedLength: translatedText.length,
        chunksProcessed: chunks.length,
      },
    });
  } catch (error) {
    console.error('Translate error:', error);
    const message = error instanceof Error ? error.message : 'Failed to translate PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
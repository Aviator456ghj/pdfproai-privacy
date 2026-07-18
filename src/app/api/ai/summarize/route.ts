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
    const length = (formData.get('length') as string) || 'medium';
    const language = (formData.get('language') as string) || 'English';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(file);

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF' },
        { status: 400 }
      );
    }

    // Build summarization prompt based on length
    const lengthInstructions: Record<string, string> = {
      short: 'Provide a very concise summary in 2-3 sentences.',
      medium: 'Provide a detailed summary covering the main points, key arguments, and conclusions in a well-structured format (approximately 200-400 words).',
      long: 'Provide an exhaustive summary covering all major sections, key details, data points, and conclusions in a comprehensive format (approximately 500-800 words).',
      bullet: 'Provide a summary using bullet points covering the main topics, key points, and important details.',
    };

    const lengthInstruction = lengthInstructions[length] || lengthInstructions.medium;

    const systemPrompt = `You are an expert document summarizer. Summarize the following document content in ${language}. ${lengthInstruction} Focus on accuracy and capturing the most important information. If the text appears to be cut off, summarize what is available.`;

    // Truncate text if too long (to fit within context limits)
    const maxTextLength = 15000;
    const textToSummarize =
      extractedText.length > maxTextLength
        ? extractedText.substring(0, maxTextLength) + '\n\n[... document truncated for summarization ...]'
        : extractedText;

    // Call AI SDK
    const ai = await ZAI.create();
    const response = await ai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: textToSummarize },
      ],
    });

    const summary =
      response?.choices?.[0]?.message?.content || 'Failed to generate summary.';

    return NextResponse.json({
      summary,
      metadata: {
        fileName: file.name,
        originalLength: extractedText.length,
        summarizedWith: length,
        language,
      },
    });
  } catch (error) {
    console.error('Summarize error:', error);
    const message = error instanceof Error ? error.message : 'Failed to summarize PDF';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
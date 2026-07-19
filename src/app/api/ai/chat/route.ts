import { NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import ZAI from 'z-ai-web-dev-sdk';
import type { ChatMessage } from 'z-ai-web-dev-sdk';

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
    const message = (formData.get('message') as string) || '';
    const historyStr = (formData.get('history') as string) || '[]';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File is not a PDF' }, { status: 400 });
    }

    if (!message.trim()) {
      return NextResponse.json({ error: 'A message is required' }, { status: 400 });
    }

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(file);

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF' },
        { status: 400 }
      );
    }

    // Parse conversation history
    let history: ChatMessage[] = [];
    try {
      history = JSON.parse(historyStr);
      if (!Array.isArray(history)) {
        history = [];
      }
    } catch {
      history = [];
    }

    // Build messages array
    const maxTextLength = 12000;
    const truncatedText =
      extractedText.length > maxTextLength
        ? extractedText.substring(0, maxTextLength) + '\n\n[... document truncated ...]'
        : extractedText;

    const systemPrompt = `You are a helpful AI assistant specialized in analyzing and answering questions about PDF documents. You have access to the following document content. Answer the user's questions based on the document content. If the answer is not found in the document, say so clearly. Be accurate and cite specific parts of the document when relevant.

--- DOCUMENT CONTENT START ---
${truncatedText}
--- DOCUMENT CONTENT END ---`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      // Include previous conversation history (limited to last 10 messages)
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    // Call AI SDK
    const ai = await ZAI.create();
    const response = await ai.chat.completions.create({ messages });

    const aiResponse =
      response?.choices?.[0]?.message?.content || 'I was unable to generate a response.';

    return NextResponse.json({
      response: aiResponse,
      metadata: {
        fileName: file.name,
        documentLength: extractedText.length,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process chat request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
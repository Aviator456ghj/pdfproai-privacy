import {
  FileText, Merge, Scissors, Minimize2, RotateCw, Trash2, Copy, ArrowUpDown,
  Droplets, Hash, Languages, Brain, MessageCircle, FileEdit, BookOpen,
  FileSpreadsheet, Presentation, Image, FileDown, FileUp, FileCode,
  Scan, Type, PenTool, Search, Shield, Unlock, Lock, Key, Code2,
  Layers, Zap, Cloud, FileQuestion, Sparkles, Highlighter, Pen,
  Eraser, Stamp, Table2, Lightbulb, GraduationCap, FileSearch, AlertTriangle,
  FileSignature, FileInput, Settings
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  isPremium: boolean;
  isNew?: boolean;
  isAI?: boolean;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  tools: Tool[];
}

export const categories: ToolCategory[] = [
  {
    id: 'essentials',
    name: 'PDF Essentials',
    description: 'Core PDF operations for everyday use',
    icon: Layers,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    tools: [
      { id: 'merge', name: 'Merge PDF', description: 'Combine multiple PDFs into one document', icon: Merge, category: 'essentials', isPremium: false },
      { id: 'split', name: 'Split PDF', description: 'Separate PDF into individual pages or sections', icon: Scissors, category: 'essentials', isPremium: false },
      { id: 'compress', name: 'Compress PDF', description: 'Reduce file size while maintaining quality', icon: Minimize2, category: 'essentials', isPremium: false },
      { id: 'rotate', name: 'Rotate PDF', description: 'Rotate pages to any angle', icon: RotateCw, category: 'essentials', isPremium: false },
      { id: 'delete-pages', name: 'Delete Pages', description: 'Remove unwanted pages from your PDF', icon: Trash2, category: 'essentials', isPremium: false },
      { id: 'extract-pages', name: 'Extract Pages', description: 'Pull specific pages into a new PDF', icon: Copy, category: 'essentials', isPremium: false },
      { id: 'rearrange', name: 'Rearrange Pages', description: 'Drag and drop to reorder pages', icon: ArrowUpDown, category: 'essentials', isPremium: false },
      { id: 'watermark', name: 'Watermark', description: 'Add text or image watermarks', icon: Droplets, category: 'essentials', isPremium: true },
      { id: 'page-numbers', name: 'Page Numbers', description: 'Add page numbers to your document', icon: Hash, category: 'essentials', isPremium: false },
    ],
  },
  {
    id: 'conversion',
    name: 'Conversion',
    description: 'Convert between PDF and other formats',
    icon: FileDown,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    tools: [
      { id: 'pdf-to-word', name: 'PDF to Word', description: 'Convert PDF to editable DOCX format', icon: FileText, category: 'conversion', isPremium: true },
      { id: 'word-to-pdf', name: 'Word to PDF', description: 'Convert DOCX files to PDF', icon: FileUp, category: 'conversion', isPremium: false },
      { id: 'excel-to-pdf', name: 'Excel to PDF', description: 'Convert spreadsheets to PDF', icon: FileSpreadsheet, category: 'conversion', isPremium: true },
      { id: 'pdf-to-excel', name: 'PDF to Excel', description: 'Extract tables from PDF to XLSX', icon: FileSpreadsheet, category: 'conversion', isPremium: true },
      { id: 'ppt-to-pdf', name: 'PPT to PDF', description: 'Convert presentations to PDF', icon: Presentation, category: 'conversion', isPremium: true },
      { id: 'pdf-to-ppt', name: 'PDF to PPT', description: 'Convert PDF to PowerPoint', icon: Presentation, category: 'conversion', isPremium: true },
      { id: 'pdf-to-images', name: 'PDF to Images', description: 'Convert each page to PNG or JPG', icon: Image, category: 'conversion', isPremium: false },
      { id: 'images-to-pdf', name: 'Images to PDF', description: 'Create PDF from multiple images', icon: FileUp, category: 'conversion', isPremium: false },
      { id: 'html-to-pdf', name: 'HTML to PDF', description: 'Convert web pages to PDF', icon: FileCode, category: 'conversion', isPremium: true, isNew: true },
      { id: 'epub-to-pdf', name: 'EPUB to PDF', description: 'Convert ebooks to PDF format', icon: BookOpen, category: 'conversion', isPremium: true, isNew: true },
    ],
  },
  {
    id: 'ocr',
    name: 'OCR',
    description: 'Optical Character Recognition powered by AI',
    icon: Scan,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    tools: [
      { id: 'scan-to-pdf', name: 'Scan to PDF', description: 'Convert scanned documents to searchable PDFs', icon: Scan, category: 'ocr', isPremium: true },
      { id: 'image-to-text', name: 'Image to Text', description: 'Extract text from images using OCR', icon: Type, category: 'ocr', isPremium: true },
      { id: 'handwriting-ocr', name: 'Handwriting Recognition', description: 'Recognize handwritten text in documents', icon: PenTool, category: 'ocr', isPremium: true, isNew: true },
      { id: 'searchable-pdf', name: 'Searchable PDF', description: 'Make scanned PDFs searchable', icon: Search, category: 'ocr', isPremium: true },
      { id: 'multi-language-ocr', name: 'Multi-language OCR', description: 'Extract text in 100+ languages', icon: Languages, category: 'ocr', isPremium: true, isNew: true },
    ],
  },
  {
    id: 'ai',
    name: 'AI Features',
    description: 'Intelligent document processing with AI',
    icon: Brain,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    tools: [
      { id: 'ai-summarize', name: 'Summarize PDF', description: 'Get AI-powered summaries of your documents', icon: Sparkles, category: 'ai', isPremium: true, isAI: true },
      { id: 'ai-chat', name: 'Ask Questions', description: 'Chat with your PDF using AI', icon: MessageCircle, category: 'ai', isPremium: true, isAI: true },
      { id: 'ai-translate', name: 'Translate PDF', description: 'Translate documents to any language', icon: Languages, category: 'ai', isPremium: true, isAI: true },
      { id: 'ai-rewrite', name: 'Rewrite Content', description: 'Rewrite and improve document text', icon: FileEdit, category: 'ai', isPremium: true, isAI: true, isNew: true },
      { id: 'ai-legal', name: 'Explain Legal Docs', description: 'AI-powered legal document analysis', icon: FileQuestion, category: 'ai', isPremium: true, isAI: true, isNew: true },
      { id: 'ai-medical', name: 'Explain Medical Reports', description: 'Understand medical reports with AI', icon: AlertTriangle, category: 'ai', isPremium: true, isAI: true, isNew: true },
      { id: 'ai-notes', name: 'Generate Notes', description: 'Create study notes from documents', icon: Lightbulb, category: 'ai', isPremium: true, isAI: true },
      { id: 'ai-flashcards', name: 'Create Flashcards', description: 'Auto-generate flashcards for studying', icon: GraduationCap, category: 'ai', isPremium: true, isAI: true, isNew: true },
      { id: 'ai-extract-tables', name: 'Extract Tables', description: 'AI-powered table extraction from PDFs', icon: Table2, category: 'ai', isPremium: true, isAI: true },
      { id: 'ai-key-points', name: 'Extract Key Points', description: 'Identify and extract main points', icon: FileSearch, category: 'ai', isPremium: true, isAI: true },
    ],
  },
  {
    id: 'editing',
    name: 'Editing',
    description: 'Edit and annotate your PDF documents',
    icon: Pen,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    tools: [
      { id: 'edit-text', name: 'Edit Text', description: 'Modify text directly in your PDF', icon: FileEdit, category: 'editing', isPremium: true },
      { id: 'edit-images', name: 'Edit Images', description: 'Add, remove, or modify images', icon: Image, category: 'editing', isPremium: true },
      { id: 'add-signature', name: 'Add Signature', description: 'Sign documents electronically', icon: FileSignature, category: 'editing', isPremium: true, isNew: true },
      { id: 'fill-forms', name: 'Fill Forms', description: 'Fill in interactive PDF forms', icon: FileInput, category: 'editing', isPremium: true },
      { id: 'create-forms', name: 'Create Forms', description: 'Design interactive PDF forms', icon: FileInput, category: 'editing', isPremium: true, isNew: true },
      { id: 'highlight', name: 'Highlight', description: 'Highlight important text passages', icon: Highlighter, category: 'editing', isPremium: true },
      { id: 'annotate', name: 'Annotate', description: 'Add comments and annotations', icon: Pen, category: 'editing', isPremium: true },
      { id: 'redact', name: 'Redact Sensitive Data', description: 'Permanently remove sensitive information', icon: Eraser, category: 'editing', isPremium: true },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Protect and secure your PDF documents',
    icon: Shield,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    tools: [
      { id: 'password-protect', name: 'Password Protect', description: 'Add password protection to PDFs', icon: Lock, category: 'security', isPremium: true },
      { id: 'remove-password', name: 'Remove Password', description: 'Unlock password-protected PDFs', icon: Unlock, category: 'security', isPremium: true },
      { id: 'encrypt', name: 'Encrypt PDF', description: 'Apply AES-256 encryption', icon: Shield, category: 'security', isPremium: true },
      { id: 'decrypt', name: 'Decrypt PDF', description: 'Remove encryption from PDFs', icon: Unlock, category: 'security', isPremium: true },
      { id: 'permission-control', name: 'Permission Control', description: 'Control printing, copying, and editing', icon: Key, category: 'security', isPremium: true },
      { id: 'sign-pdf', name: 'Digital Signature', description: 'Add certified digital signatures', icon: Stamp, category: 'security', isPremium: true, isNew: true },
    ],
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    description: 'APIs and automation for developers',
    icon: Code2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    tools: [
      { id: 'pdf-api', name: 'PDF API', description: 'RESTful API for PDF operations', icon: Code2, category: 'developer', isPremium: true },
      { id: 'batch-processing', name: 'Batch Processing', description: 'Process hundreds of PDFs at once', icon: Layers, category: 'developer', isPremium: true },
      { id: 'automation', name: 'Automation', description: 'Set up automated PDF workflows', icon: Zap, category: 'developer', isPremium: true, isNew: true },
      { id: 'cloud-integration', name: 'Cloud Storage', description: 'Connect Google Drive, Dropbox, and more', icon: Cloud, category: 'developer', isPremium: true },
    ],
  },
];

export function getAllTools(): Tool[] {
  return categories.flatMap(c => c.tools);
}

export function getToolById(id: string): Tool | undefined {
  return getAllTools().find(t => t.id === id);
}

export function getCategoryById(id: string): ToolCategory | undefined {
  return categories.find(c => c.id === id);
}

export function getRelatedTools(toolId: string): Tool[] {
  const tool = getToolById(toolId);
  if (!tool) return [];
  return categories
    .find(c => c.id === tool.category)?.tools
    .filter(t => t.id !== toolId)
    .slice(0, 4) ?? [];
}
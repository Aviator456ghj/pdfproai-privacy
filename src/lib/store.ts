import { create } from 'zustand';

type View = 'landing' | 'tool' | 'pricing' | 'all-tools';

interface AppState {
  view: View;
  activeToolId: string | null;
  activeCategoryId: string | null;
  setView: (view: View) => void;
  openTool: (toolId: string) => void;
  openCategory: (categoryId: string) => void;
  goHome: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  addUploadedFiles: (files: File[]) => void;
  removeUploadedFile: (index: number) => void;
  clearUploadedFiles: () => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'landing',
  activeToolId: null,
  activeCategoryId: null,
  setView: (view) => set({ view, activeToolId: null, activeCategoryId: null }),
  openTool: (toolId) => set({ view: 'tool', activeToolId: toolId, activeCategoryId: null }),
  openCategory: (categoryId) => set({ view: 'all-tools', activeCategoryId: categoryId }),
  goHome: () => set({ view: 'landing', activeToolId: null, activeCategoryId: null, uploadedFiles: [], searchQuery: '' }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  uploadedFiles: [],
  setUploadedFiles: (uploadedFiles) => set({ uploadedFiles }),
  addUploadedFiles: (files) => set((s) => ({ uploadedFiles: [...s.uploadedFiles, ...files] })),
  removeUploadedFile: (index) => set((s) => ({ uploadedFiles: s.uploadedFiles.filter((_, i) => i !== index) })),
  clearUploadedFiles: () => set({ uploadedFiles: [] }),
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));
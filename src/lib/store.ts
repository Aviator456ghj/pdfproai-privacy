import { create } from 'zustand';

type View = 'landing' | 'tool' | 'pricing' | 'all-tools';
type UserTier = 'free' | 'premium' | 'business';

interface AdState {
  showPreAd: boolean;
  showPostAd: boolean;
  preAdCompleted: boolean;
  postAdCompleted: boolean;
  pendingToolId: string | null;
  adWatermarkRemoved: boolean;
  setShowPreAd: (v: boolean) => void;
  setShowPostAd: (v: boolean) => void;
  setPreAdCompleted: (v: boolean) => void;
  setPostAdCompleted: (v: boolean) => void;
  setPendingToolId: (id: string | null) => void;
  setAdWatermarkRemoved: (v: boolean) => void;
  resetAdState: () => void;
}

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
  // User tier system
  userTier: UserTier;
  setUserTier: (tier: UserTier) => void;
  isFreeUser: () => boolean;
  // Ad system
  ad: AdState;
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'landing',
  activeToolId: null,
  activeCategoryId: null,
  setView: (view) => set({ view, activeToolId: null, activeCategoryId: null }),
  openTool: (toolId) => {
    const state = get();
    // Free users must watch ad before entering tool
    if (state.userTier === 'free') {
      set({
        ad: {
          ...state.ad,
          showPreAd: true,
          pendingToolId: toolId,
          preAdCompleted: false,
        },
      });
    } else {
      set({ view: 'tool', activeToolId: toolId, activeCategoryId: null });
    }
  },
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

  // User tier
  userTier: 'free',
  setUserTier: (userTier) => set({ userTier }),
  isFreeUser: () => get().userTier === 'free',

  // Ad system
  ad: {
    showPreAd: false,
    showPostAd: false,
    preAdCompleted: false,
    postAdCompleted: false,
    pendingToolId: null,
    adWatermarkRemoved: false,
    setShowPreAd: (v) => set((s) => ({ ad: { ...s.ad, showPreAd: v } })),
    setShowPostAd: (v) => set((s) => ({ ad: { ...s.ad, showPostAd: v } })),
    setPreAdCompleted: (v) => set((s) => ({ ad: { ...s.ad, preAdCompleted: v } })),
    setPostAdCompleted: (v) => set((s) => ({ ad: { ...s.ad, postAdCompleted: v } })),
    setPendingToolId: (id) => set((s) => ({ ad: { ...s.ad, pendingToolId: id } })),
    setAdWatermarkRemoved: (v) => set((s) => ({ ad: { ...s.ad, adWatermarkRemoved: v } })),
    resetAdState: () =>
      set((s) => ({
        ad: {
          ...s.ad,
          showPreAd: false,
          showPostAd: false,
          preAdCompleted: false,
          postAdCompleted: false,
          pendingToolId: null,
          adWatermarkRemoved: false,
        },
      })),
  },
}));
import { create } from 'zustand';
import { hasReachedDailyLimit } from './usage-limit';

type View = 'landing' | 'tool' | 'pricing' | 'all-tools';
type UserTier = 'free' | 'premium' | 'business';

interface AdState {
  showPreAd: boolean;
  showPostAd: boolean;
  preAdCompleted: boolean;
  postAdCompleted: boolean;
  pendingToolId: string | null;
  adWatermarkRemoved: boolean;
  processingAdWatched: boolean;
  setShowPreAd: (v: boolean) => void;
  setShowPostAd: (v: boolean) => void;
  setPreAdCompleted: (v: boolean) => void;
  setPostAdCompleted: (v: boolean) => void;
  setPendingToolId: (id: string | null) => void;
  setAdWatermarkRemoved: (v: boolean) => void;
  setProcessingAdWatched: (v: boolean) => void;
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
  // Legal page modals
  showPrivacyPolicy: boolean;
  setShowPrivacyPolicy: (v: boolean) => void;
  showTermsOfService: boolean;
  setShowTermsOfService: (v: boolean) => void;
  // Usage limit modal
  showUsageLimitModal: boolean;
  setShowUsageLimitModal: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  view: 'landing',
  activeToolId: null,
  activeCategoryId: null,
  setView: (view) => set({ view, activeToolId: null, activeCategoryId: null }),
  openTool: (toolId) => {
    // All users (including free) go directly to the tool now.
    // The ad is shown during processing instead of before entering.
    set({ view: 'tool', activeToolId: toolId, activeCategoryId: null });
  },
  openCategory: (categoryId) => set({ view: 'all-tools', activeCategoryId: categoryId }),
  goHome: () => set({
    view: 'landing',
    activeToolId: null,
    activeCategoryId: null,
    uploadedFiles: [],
    searchQuery: '',
    ad: { ...get().ad, processingAdWatched: false },
  }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  uploadedFiles: [],
  setUploadedFiles: (uploadedFiles) => set({ uploadedFiles }),
  addUploadedFiles: (files) => set((s) => ({ uploadedFiles: [...s.uploadedFiles, ...files] })),
  removeUploadedFile: (index) => set((s) => ({ uploadedFiles: s.uploadedFiles.filter((_, i) => i !== index) })),
  clearUploadedFiles: () => set({ uploadedFiles: [] }),
  isProcessing: false,
  setIsProcessing: (v) => {
    if (v) {
      // When starting processing, check usage limit for free users
      const state = get();
      if (state.userTier === 'free') {
        try {
          if (hasReachedDailyLimit()) {
            set({ showUsageLimitModal: true });
            return; // Block processing
          }
        } catch {
          // SSR or localStorage unavailable — allow processing
        }
      }
      set({ isProcessing: true, ad: { ...get().ad, processingAdWatched: false } });
    } else {
      set({ isProcessing: false });
    }
  },

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
    processingAdWatched: false,
    setShowPreAd: (v) => set((s) => ({ ad: { ...s.ad, showPreAd: v } })),
    setShowPostAd: (v) => set((s) => ({ ad: { ...s.ad, showPostAd: v } })),
    setPreAdCompleted: (v) => set((s) => ({ ad: { ...s.ad, preAdCompleted: v } })),
    setPostAdCompleted: (v) => set((s) => ({ ad: { ...s.ad, postAdCompleted: v } })),
    setPendingToolId: (id) => set((s) => ({ ad: { ...s.ad, pendingToolId: id } })),
    setAdWatermarkRemoved: (v) => set((s) => ({ ad: { ...s.ad, adWatermarkRemoved: v } })),
    setProcessingAdWatched: (v) => set((s) => ({ ad: { ...s.ad, processingAdWatched: v } })),
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
          processingAdWatched: false,
        },
      })),
  },

  // Legal page modals
  showPrivacyPolicy: false,
  setShowPrivacyPolicy: (showPrivacyPolicy) => set({ showPrivacyPolicy }),
  showTermsOfService: false,
  setShowTermsOfService: (showTermsOfService) => set({ showTermsOfService }),

  // Usage limit modal
  showUsageLimitModal: false,
  setShowUsageLimitModal: (showUsageLimitModal) => set({ showUsageLimitModal }),
}));
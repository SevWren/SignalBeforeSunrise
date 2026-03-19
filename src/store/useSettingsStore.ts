import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutPreset {
  id: string;
  name: string;
  sidebarSize: number;
  articleListSize: number;
  previewSize: number;
  sidebarVisible: boolean;
  previewVisible: boolean;
}

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  viewMode: 'grid' | 'list' | 'compact';
  columnCount: number;
  cardSize: number;
  fontSize: 'small' | 'medium' | 'large';
  
  // Layout
  sidebarSize: number;
  articleListSize: number;
  previewSize: number;
  sidebarVisible: boolean;
  previewVisible: boolean;
  
  layoutPresets: LayoutPreset[];
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setViewMode: (mode: 'grid' | 'list' | 'compact') => void;
  setColumnCount: (count: number) => void;
  setCardSize: (size: number) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  
  setPanelSizes: (sizes: { sidebar?: number; articleList?: number; preview?: number }) => void;
  toggleSidebar: () => void;
  togglePreview: () => void;
  
  saveLayoutPreset: (name: string) => void;
  loadLayoutPreset: (id: string) => void;
  removeLayoutPreset: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      viewMode: 'grid',
      columnCount: 3,
      cardSize: 100,
      fontSize: 'medium',
      
      sidebarSize: 20,
      articleListSize: 40,
      previewSize: 40,
      sidebarVisible: true,
      previewVisible: true,
      
      layoutPresets: [
        {
          id: 'default',
          name: 'Default 3-Pane',
          sidebarSize: 20,
          articleListSize: 40,
          previewSize: 40,
          sidebarVisible: true,
          previewVisible: true,
        },
        {
          id: 'reading',
          name: 'Reading Mode',
          sidebarSize: 15,
          articleListSize: 25,
          previewSize: 60,
          sidebarVisible: false,
          previewVisible: true,
        }
      ],
      
      setTheme: (theme) => set({ theme }),
      setViewMode: (viewMode) => set({ viewMode }),
      setColumnCount: (columnCount) => set({ columnCount }),
      setCardSize: (cardSize) => set({ cardSize }),
      setFontSize: (fontSize) => set({ fontSize }),
      
      setPanelSizes: (sizes) => set((state) => ({ ...state, ...sizes })),
      toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
      togglePreview: () => set((state) => ({ previewVisible: !state.previewVisible })),
      
      saveLayoutPreset: (name) => set((state) => {
        const newPreset: LayoutPreset = {
          id: Math.random().toString(36).substring(7),
          name,
          sidebarSize: state.sidebarSize,
          articleListSize: state.articleListSize,
          previewSize: state.previewSize,
          sidebarVisible: state.sidebarVisible,
          previewVisible: state.previewVisible,
        };
        return { layoutPresets: [...state.layoutPresets, newPreset] };
      }),
      
      loadLayoutPreset: (id) => set((state) => {
        const preset = state.layoutPresets.find(p => p.id === id);
        if (!preset) return state;
        return {
          sidebarSize: preset.sidebarSize,
          articleListSize: preset.articleListSize,
          previewSize: preset.previewSize,
          sidebarVisible: preset.sidebarVisible,
          previewVisible: preset.previewVisible,
        };
      }),
      
      removeLayoutPreset: (id) => set((state) => ({
        layoutPresets: state.layoutPresets.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'rss-settings-storage',
    }
  )
);

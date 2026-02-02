import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type ColorTheme = 'ocean' | 'sunset' | 'forest';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiStore {
  theme: Theme;
  colorTheme: ColorTheme;
  sidebarOpen: boolean;
  editingCourseId: string | null;
  showGraph: boolean;
  toasts: Toast[];

  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setEditingCourseId: (id: string | null) => void;
  setShowGraph: (show: boolean) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

function loadTheme(): Theme {
  try {
    return (localStorage.getItem('theme') as Theme) ?? 'dark';
  } catch {
    return 'system';
  }
}

function loadColorTheme(): ColorTheme {
  try {
    return (localStorage.getItem('colorTheme') as ColorTheme) ?? 'forest';
  } catch {
    return 'ocean';
  }
}

export const useUiStore = create<UiStore>()((set) => ({
  theme: loadTheme(),
  colorTheme: loadColorTheme(),
  sidebarOpen: true,
  editingCourseId: null,
  showGraph: false,
  toasts: [],

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  setColorTheme: (colorTheme) => {
    localStorage.setItem('colorTheme', colorTheme);
    set({ colorTheme });
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setEditingCourseId: (id) => set({ editingCourseId: id }),
  setShowGraph: (show) => set({ showGraph: show }),

  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

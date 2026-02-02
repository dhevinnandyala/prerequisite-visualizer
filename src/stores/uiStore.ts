import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiStore {
  theme: Theme;
  sidebarOpen: boolean;
  editingCourseId: string | null;
  showGraph: boolean;
  toasts: Toast[];

  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setEditingCourseId: (id: string | null) => void;
  setShowGraph: (show: boolean) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

function loadTheme(): Theme {
  try {
    return (localStorage.getItem('theme') as Theme) ?? 'system';
  } catch {
    return 'system';
  }
}

export const useUiStore = create<UiStore>()((set) => ({
  theme: loadTheme(),
  sidebarOpen: true,
  editingCourseId: null,
  showGraph: false,
  toasts: [],

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
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

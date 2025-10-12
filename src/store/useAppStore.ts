import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface AppState {
  themeMode: ThemeMode;
  toggleTheme: () => void;

  counter: number;
  inc: () => void;
  dec: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  themeMode: 'light',
  toggleTheme: () => set({ themeMode: get().themeMode === 'light' ? 'dark' : 'light' }),

  counter: 0,
  inc: () => set((s) => ({ counter: s.counter + 1 })),
  dec: () => set((s) => ({ counter: Math.max(0, s.counter - 1) })),
  reset: () => set({ counter: 0 }),
}));

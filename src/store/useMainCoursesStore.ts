import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Course } from './storeTypes';
// Если у тебя уже есть db — просто раскомментируй импорты:
// import { db } from '../../lib/firebase';
// import { collection, getDocs } from 'firebase/firestore';

type MainCoursesState = {
  courses: Course[];
  loading: boolean;
  error: string | null;

  setCourses: (cs: Course[]) => void;
  fetchCourses: () => Promise<void>;
};

export const useMainCoursesStore = create<MainCoursesState>()(
  devtools((set) => ({
    courses: [],
    loading: false,
    error: null,

    setCourses: (cs) => set({ courses: cs }),

    // По умолчанию — заглушка. Если используешь Firestore, раскомментируй код ниже.
    fetchCourses: async () => {
      try {
        set({ loading: true, error: null });

        const raw: Course[] = [];

        set({ courses: raw, loading: false });
      } catch (e: any) {
        set({ error: e?.message || 'Не удалось загрузить курсы', loading: false });
      }
    },
  }))
);

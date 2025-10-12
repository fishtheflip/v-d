import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { safeStorage } from './storage';

type AvailableState = {
  availableCourses: string[]; // simpId[]
  toggleAvailableCourse: (simpId: string) => void;
  fetchAvailableCourses: () => Promise<void>;
  clearAvailable: () => void;
};

export const useAvailableCoursesStore = create<AvailableState>()(
  devtools(
    persist(
      (set, get) => ({
        availableCourses: [],

        toggleAvailableCourse: (simpId) => {
          const setNew = new Set(get().availableCourses);
          setNew.has(simpId) ? setNew.delete(simpId) : setNew.add(simpId);
          set({ availableCourses: Array.from(setNew) });
        },

        fetchAvailableCourses: async () => { /* persist сам восстановит */ },

        clearAvailable: () => set({ availableCourses: [] }),
      }),
      { name: 'availableCourses', storage: createJSONStorage(() => safeStorage as Storage)}
    )
  )
);

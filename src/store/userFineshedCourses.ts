import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { safeStorage } from './storage';

type FinishedState = {
  finishedCourses: string[]; // simpId[]
  toggleFinishedCourse: (simpId: string) => void;
  fetchFinishedCourses: () => Promise<void>;
  clearFinished: () => void;
};

export const useFinishedCoursesStore = create<FinishedState>()(
  devtools(
    persist(
      (set, get) => ({
        finishedCourses: [],

        toggleFinishedCourse: (simpId) => {
          const setNew = new Set(get().finishedCourses);
          setNew.has(simpId) ? setNew.delete(simpId) : setNew.add(simpId);
          set({ finishedCourses: Array.from(setNew) });
        },

        fetchFinishedCourses: async () => {},

        clearFinished: () => set({ finishedCourses: [] }),
      }),
      { name: 'finishedCourses', storage: createJSONStorage(() => safeStorage as Storage) }
    )
  )
);

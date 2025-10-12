import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { safeStorage } from './storage';

type ConcreteState = {
  concreteCourses: string[]; // simpId[]
  toggleConcreteCourse: (simpId: string) => void;
  fetchConcreteCourses: () => Promise<void>;
  clearConcrete: () => void;
};

export const useConcreteCoursesStore = create<ConcreteState>()(
  devtools(
    persist(
      (set, get) => ({
        concreteCourses: [],

        toggleConcreteCourse: (simpId) => {
          const setNew = new Set(get().concreteCourses);
          setNew.has(simpId) ? setNew.delete(simpId) : setNew.add(simpId);
          set({ concreteCourses: Array.from(setNew) });
        },

        fetchConcreteCourses: async () => {},

        clearConcrete: () => set({ concreteCourses: [] }),
      }),
      { name: 'concreteCourses', storage: createJSONStorage(() => safeStorage as Storage) }
    )
  )
);

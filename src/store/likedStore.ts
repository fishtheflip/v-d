import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { safeStorage } from './storage';

type LikedState = {
  likedCourses: string[];           // simpId[]
  toggleLikedCourse: (simpId: string) => void;
  isLiked: (simpId: string) => boolean;
  fetchLikedCourses: () => Promise<void>; // для единообразия с RN
  clearLikes: () => void;
};

export const useLikedCoursesStore = create<LikedState>()(
  devtools(
    persist(
      (set, get) => ({
        likedCourses: [],

        toggleLikedCourse: (simpId) => {
          const setNew = new Set(get().likedCourses);
          setNew.has(simpId) ? setNew.delete(simpId) : setNew.add(simpId);
          set({ likedCourses: Array.from(setNew) });
        },

        isLiked: (simpId) => get().likedCourses.includes(simpId),

        fetchLikedCourses: async () => {
          // persist уже грузит из localStorage — оставляем для совместимости
          return;
        },

        clearLikes: () => set({ likedCourses: [] }),
      }),
      { name: 'likedCourses', storage: createJSONStorage(() => safeStorage as Storage) }
    )
  )
);

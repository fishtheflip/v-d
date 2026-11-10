// Compatibility API for screens that previously loaded the Firestore cache.
import { courses, choreos } from './localCatalog';
export type { CatalogCourse, CatalogChoreo } from './localCatalog';

export const getCachedCourses = () => courses;
export const getCachedChoreos = () => choreos;
export const loadCourses = (_force = false) => Promise.resolve(courses);
export const loadChoreos = (_force = false) => Promise.resolve(choreos);

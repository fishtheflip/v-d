import snapshot from '../data/catalog.json';
import videoOverrides from '../data/videoOverrides.json';

export type CatalogLesson = {
  name: string;
  duration?: string | number;
  isOpen?: boolean;
  thumbUrl?: string;
  videoId?: string;
  vimeoId?: string;
  videoProvider?: string;
  videoUrl?: string;
  url?: string;
  description?: string;
};

export type CatalogCourse = {
  id: string;
  documentId: string;
  courseName: string;
  title?: string;
  simpId?: string;
  simpid?: string;
  authorTitle?: string;
  Author?: string;
  seasonNum?: number;
  sumDuration?: number | string;
  sumLessons?: number | string;
  level?: string;
  imgUrl?: string;
  imgPosition?: string;
  popular?: boolean;
  popPriority?: number;
  lessons?: CatalogLesson[];
};

export type CatalogChoreo = CatalogCourse & { name: string; authors?: string[] };
export type CatalogAuthor = {
  id: string;
  documentId: string;
  name: string;
  simpId?: string;
  about?: string;
  info?: string;
  imgurl?: string;
  photo?: string;
  category?: string[];
};

const overrides: Record<string, Record<string, string>> = videoOverrides;

function publicImage(url?: string) {
  return url?.startsWith('/') ? `${import.meta.env?.BASE_URL || '/'}${url.slice(1)}` : url;
}

function normalizeCourse(item: CatalogCourse): CatalogCourse {
  const simpId = item.simpId || item.simpid;
  const links = overrides[simpId || item.id];
  return {
    ...item,
    imgUrl: publicImage(item.imgUrl),
    id: String(item.id),
    simpId,
    lessons: item.lessons?.map(lesson => {
      const videoUrl = links?.[lesson.name.trim()];
      return videoUrl
        ? { ...lesson, videoId: videoUrl, videoUrl, videoProvider: 'youtube' }
        : lesson;
    }),
  };
}

export const courses = (snapshot.courses as unknown as CatalogCourse[])
  .map(normalizeCourse)
  .sort((a, b) => (Number(a.popPriority) || 0) - (Number(b.popPriority) || 0));
export const choreos = snapshot.choreos.map(item => ({
  ...normalizeCourse({ ...item, courseName: item.name } as unknown as CatalogCourse),
  name: item.name,
  authors: item.authors,
})) as CatalogChoreo[];
export const authors = snapshot.authors.map(item => ({ ...item, imgurl: publicImage(item.imgurl), id: String(item.id) })) as CatalogAuthor[];
export const categories = snapshot.categories.map(item => ({ ...item, id: String(item.id) }));

export function findCourse(slug: string, kind?: 'course' | 'choreo') {
  const items = kind === 'course' ? courses : kind === 'choreo' ? choreos : [...courses, ...choreos];
  return items.find(item => item.simpId === slug || item.id === slug || item.documentId === slug);
}

export function findAuthor(slug: string) {
  return authors.find(item => item.simpId === slug || String(item.id) === slug || item.documentId === slug);
}

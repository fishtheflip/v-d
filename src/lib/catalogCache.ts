import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export type CatalogCourse = {
  id: string;
  courseName: string;
  title?: string;
  simpId?: string;
  authorTitle?: string;
  seasonNum?: number;
  imgUrl?: string;
  popular?: boolean;
  popPriority?: number;
  [key: string]: unknown;
};

export type CatalogChoreo = {
  id: string;
  name: string;
  Author?: string;
  imgUrl?: string;
  simpId?: string;
  [key: string]: unknown;
};

type CacheEntry<T> = { data: T; ts: number };

const TTL_MS = 60 * 60 * 1000;
const PREFIX = 'catalog:';
const memory = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

function readCache<T>(key: string): T | null {
  const now = Date.now();
  const cached = memory.get(key) as CacheEntry<T> | undefined;
  if (cached && now - cached.ts < TTL_MS) return cached.data;

  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (now - parsed.ts >= TTL_MS) return null;
    memory.set(key, parsed);
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  const entry: CacheEntry<T> = { data, ts: Date.now() };
  memory.set(key, entry);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {}
}

async function fetchCached<T>(key: string, fetcher: () => Promise<T>, force = false): Promise<T> {
  if (!force) {
    const cached = readCache<T>(key);
    if (cached) return cached;
    const pending = inFlight.get(key) as Promise<T> | undefined;
    if (pending) return pending;
  }

  const request = fetcher()
    .then((data) => {
      writeCache(key, data);
      return data;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, request);
  return request;
}

export const getCachedCourses = () => readCache<CatalogCourse[]>('courses');
export const getCachedChoreos = () => readCache<CatalogChoreo[]>('choreos');

export const loadCourses = (force = false) =>
  fetchCached<CatalogCourse[]>('courses', async () => {
    const snap = await getDocs(collection(db, 'courses'));
    return snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as CatalogCourse)
      .sort((a, b) => (Number(a.popPriority) || 0) - (Number(b.popPriority) || 0));
  }, force);

export const loadChoreos = (force = false) =>
  fetchCached<CatalogChoreo[]>('choreos', async () => {
    const snap = await getDocs(collection(db, 'choreos'));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CatalogChoreo);
  }, force);

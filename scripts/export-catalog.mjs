import { mkdir, writeFile } from 'node:fs/promises';

const base = 'https://firestore.googleapis.com/v1/projects/vite-9fbbb/databases/(default)/documents';
const collections = { courses: 'courses', choreos: 'choreos', authors: 'authors', categories: 'category' };

function decode(value) {
  if ('nullValue' in value) return null;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  throw new Error(`Unsupported Firestore value: ${Object.keys(value).join(', ')}`);
}

function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decode(value)]));
}

const catalog = {};
for (const [key, collection] of Object.entries(collections)) {
  const items = [];
  let pageToken;
  do {
    const url = new URL(`${base}/${collection}`);
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${collection}: HTTP ${response.status}`);
    const page = await response.json();
    for (const doc of page.documents || []) {
      const documentId = doc.name.split('/').pop();
      items.push({ id: documentId, ...decodeFields(doc.fields || {}), documentId });
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
  if (!items.length) throw new Error(`Empty collection: ${collection}`);
  catalog[key] = items;
  console.info(`${key}: ${items.length}`);
}

// Write only after every collection was successfully exported.
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/data/catalog.json', import.meta.url), `${JSON.stringify(catalog, null, 2)}\n`);

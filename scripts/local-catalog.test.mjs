import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const snapshot = JSON.parse(await read('../src/data/catalog.json'));
const overrides = JSON.parse(await read('../src/data/videoOverrides.json'));
const source = (await read('../src/lib/localCatalog.ts'))
  .replace("import snapshot from '../data/catalog.json';", `const snapshot = ${JSON.stringify(snapshot)};`)
  .replace("import videoOverrides from '../data/videoOverrides.json';", `const videoOverrides = ${JSON.stringify(overrides)};`);

async function loadTypeScript(source) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const catalog = await loadTypeScript(source);
const { toPlayerUrl } = await loadTypeScript(await read('../src/lib/videoUrl.ts'));

test('complete catalog and nested lesson data are retained', () => {
  assert.deepEqual([catalog.courses.length, catalog.choreos.length, catalog.authors.length, catalog.categories.length], [7, 3, 9, 7]);
  assert.equal([...catalog.courses, ...catalog.choreos].reduce((n, item) => n + item.lessons.length, 0), 92);
  for (const item of [...snapshot.courses, ...snapshot.choreos]) {
    const resolved = catalog.findCourse(item.documentId);
    assert.equal(resolved.lessons.length, item.lessons.length);
    item.lessons.forEach((lesson, index) => {
      assert.equal(resolved.lessons[index].description, lesson.description);
      assert.equal(resolved.lessons[index].isOpen, lesson.isOpen);
    });
  }
});

test('courses resolve by legacy ID, slug and Firestore ID', () => {
  for (const course of [...catalog.courses, ...catalog.choreos]) {
    for (const key of [course.id, course.simpId, course.documentId].filter(Boolean)) {
      assert.equal(catalog.findCourse(key), course);
    }
  }
  assert.equal(catalog.findCourse('37').simpId, 'afro1');
  assert.equal(catalog.findCourse('poping1').courseName, 'Popping');
  assert.equal(catalog.findCourse('unknown'), undefined);
});

test('every author and category resolves locally', () => {
  for (const author of catalog.authors) {
    assert.equal(catalog.findAuthor(author.id), author);
    assert.equal(catalog.findAuthor(author.documentId), author);
  }
  for (const category of catalog.categories) {
    assert.ok(catalog.courses.some(course => course.courseName === category.name));
  }
  for (const choreo of catalog.choreos) {
    for (const name of choreo.authors) assert.ok(catalog.authors.some(author => author.name === name));
  }
});

test('YouTube overrides target only named lessons and preserve Vimeo fallback', () => {
  for (const [slug, lessons] of Object.entries(overrides)) {
    const course = catalog.findCourse(slug);
    assert.ok(course, slug);
    for (const [name, url] of Object.entries(lessons)) {
      const matches = course.lessons.filter(lesson => lesson.name.trim() === name);
      assert.equal(matches.length, 1);
      assert.equal(matches[0].videoUrl, url);
      assert.equal(matches[0].videoProvider, 'youtube');
      assert.ok(toPlayerUrl(url).startsWith('https://www.youtube-nocookie.com/embed/'));
    }
  }
  const afro = catalog.findCourse('afro1');
  assert.equal(toPlayerUrl(afro.lessons.find(lesson => lesson.name === 'Abrir').videoId), 'https://www.youtube-nocookie.com/embed/iZZbDK-sl7I?playsinline=1&rel=0');
  const original = snapshot.courses.find(course => course.simpId === 'afro1');
  assert.deepEqual(afro.lessons.filter(lesson => lesson.name !== 'Abrir'), original.lessons.filter(lesson => lesson.name !== 'Abrir'));
  assert.equal(toPlayerUrl('https://example.com/video'), null);
  assert.equal(toPlayerUrl('https://vimeo.com/123456/abc'), 'https://player.vimeo.com/video/123456?h=abc&playsinline=1');
});

test('catalog screens do not import Firestore', async () => {
  for (const file of ['Home', 'NotesPage', 'AuthorPage', 'CoursesPageWeb', 'VideoPage']) {
    assert.doesNotMatch(await read(`../src/pages/${file}.tsx`), /firebase\/firestore|lib\/firestore/);
  }
  assert.doesNotMatch(await read('../src/lib/catalogCache.ts'), /firebase|localStorage/);
});

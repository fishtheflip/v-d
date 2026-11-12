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
  assert.deepEqual([catalog.courses.length, catalog.choreos.length, catalog.authors.length, catalog.categories.length], [8, 3, 10, 8]);
  assert.equal([...catalog.courses, ...catalog.choreos].reduce((n, item) => n + item.lessons.length, 0), 104);
  for (const item of [...snapshot.courses, ...snapshot.choreos]) {
    const resolved = catalog.findCourse(item.documentId);
    assert.equal(resolved.lessons.length, item.lessons.length);
    item.lessons.forEach((lesson, index) => {
      assert.equal(resolved.lessons[index].description, lesson.description);
      assert.equal(resolved.lessons[index].isOpen, lesson.isOpen);
    });
  }
});

test('Askhat has a local portrait, biography and both style filters', async () => {
  const author = catalog.findAuthor('askhat');
  assert.equal(author.name, 'Асхат');
  assert.deepEqual(author.category, ['locking', 'popping']);
  assert.ok(author.about);
  assert.equal(author.imgurl, '/images/authors/askhat.jpg');
  const photo = await readFile(new URL(`../public${author.imgurl}`, import.meta.url));
  assert.ok(photo.length > 0);
});

test('Locking Intro belongs to Askhat and embeds the supplied YouTube video', () => {
  const course = catalog.findCourse('locking1');
  assert.equal(course.authorTitle, catalog.findAuthor('askhat').name);
  assert.equal(course.courseName, 'Locking');
  assert.equal(course.lessons.length, 12);
  assert.equal(course.lessons[11].name, 'Outro');
  assert.equal(course.lessons[11].isOpen, false);
  assert.equal(toPlayerUrl(course.lessons[11].videoUrl, course.lessons[11].videoProvider),
    'https://www.youtube-nocookie.com/embed/5qOwXV10quA?playsinline=1&rel=0');
  assert.equal(course.lessons[10].name, '10 Freestyle');
  assert.equal(course.lessons[10].isOpen, false);
  assert.equal(toPlayerUrl(course.lessons[10].videoUrl, course.lessons[10].videoProvider),
    'https://www.youtube-nocookie.com/embed/kzaRCtkBFgA?playsinline=1&rel=0');
  assert.equal(course.lessons[9].name, '9 Groove: смена сторон и ощущений во время танца');
  assert.equal(course.lessons[9].isOpen, false);
  assert.equal(toPlayerUrl(course.lessons[9].videoUrl, course.lessons[9].videoProvider),
    'https://www.youtube-nocookie.com/embed/bpAlGu8XBFo?playsinline=1&rel=0');
  assert.equal(course.lessons[8].name, '8 James brown, 4 corner temptation walk, The freak');
  assert.equal(course.lessons[8].isOpen, false);
  assert.equal(toPlayerUrl(course.lessons[8].videoUrl, course.lessons[8].videoProvider),
    'https://www.youtube-nocookie.com/embed/ZAUCnReIo3E?playsinline=1&rel=0');
  assert.equal(course.lessons[7].name, '7 Robot shuffle, Хамбон, Which a way');
  assert.equal(course.lessons[7].isOpen, false);
  assert.equal(toPlayerUrl(course.lessons[7].videoUrl, course.lessons[7].videoProvider),
    'https://www.youtube-nocookie.com/embed/6HswmuDIpdE?playsinline=1&rel=0');
  assert.equal(course.lessons[6].name, '6 Stop & Go');
  assert.equal(course.lessons[6].isOpen, false);
  assert.equal(toPlayerUrl(course.lessons[6].videoUrl, course.lessons[6].videoProvider),
    'https://www.youtube-nocookie.com/embed/EFpA34jvkOY?playsinline=1&rel=0');
  assert.equal(course.lessons[5].name, '5 Rock steady, The bump, The seek');
  assert.equal(course.lessons[5].isOpen, false);
  assert.equal(toPlayerUrl(course.lessons[5].videoUrl, course.lessons[5].videoProvider),
    'https://www.youtube-nocookie.com/embed/MkMyyCSmROQ?playsinline=1&rel=0');
  assert.equal(course.lessons[4].name, '4 Scoobot, Scooby doo, Scoobot hop, Skeeter rabbit');
  assert.equal(course.lessons[4].isOpen, false);
  assert.equal(toPlayerUrl(course.lessons[4].videoUrl, course.lessons[4].videoProvider),
    'https://www.youtube-nocookie.com/embed/UaiAHc-slhI?playsinline=1&rel=0');
  assert.equal(course.lessons[3].name, '3 Leo walk, Pimp walk, Six step');
  assert.equal(course.lessons[3].isOpen, true);
  assert.deepEqual(course.lessons.map(lesson => lesson.isOpen),
    [true, true, true, true, false, false, false, false, false, false, false, false]);
  assert.equal(toPlayerUrl(course.lessons[3].videoUrl, course.lessons[3].videoProvider),
    'https://www.youtube-nocookie.com/embed/liFekYZkeVI?playsinline=1&rel=0');
  assert.equal(course.lessons[2].name, '2 Locking: Up, Lock, Twirl, Point, Pace, High five');
  assert.equal(course.lessons[2].isOpen, true);
  assert.equal(toPlayerUrl(course.lessons[2].videoUrl, course.lessons[2].videoProvider),
    'https://www.youtube-nocookie.com/embed/I9Ai0WuGqnU?playsinline=1&rel=0');
  assert.equal(course.sumLessons, course.lessons.length);
  assert.equal(course.lessons[1].name, '1 Locking Grooves: Funky, Body rock, Funky position, Swing Groove');
  assert.equal(course.lessons[1].isOpen, true);
  assert.equal(toPlayerUrl(course.lessons[1].videoUrl, course.lessons[1].videoProvider),
    'https://www.youtube-nocookie.com/embed/r0qhTeptkq0?playsinline=1&rel=0');
  assert.equal(course.lessons[0].name, 'Intro');
  assert.equal(course.lessons[0].isOpen, true);
  assert.equal(toPlayerUrl(course.lessons[0].videoUrl, course.lessons[0].videoProvider),
    'https://www.youtube-nocookie.com/embed/_KuuVPioIVY?playsinline=1&rel=0');
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

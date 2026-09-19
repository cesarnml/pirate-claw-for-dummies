import assert from 'node:assert/strict';
import test from 'node:test';
import { splitSentences } from './sentences.mjs';

test('keeps sentence ranges lossless and in reading order', () => {
  const source = 'First sentence. Second sentence! Last without punctuation';
  const ranges = splitSentences(source);

  assert.deepEqual(
    ranges.map(({ start, end }) => source.slice(start, end).trim()),
    ['First sentence.', 'Second sentence!', 'Last without punctuation'],
  );
});

test('does not emit an empty narration unit for whitespace', () => {
  assert.deepEqual(splitSentences('   \n  '), []);
});

test('keeps a sentence closed by a curly quote', () => {
  const source = 'Plex answers “is this in my library?” External providers help.';
  assert.deepEqual(
    splitSentences(source).map(({ start, end }) => source.slice(start, end).trim()),
    ['Plex answers “is this in my library?”', 'External providers help.'],
  );
});

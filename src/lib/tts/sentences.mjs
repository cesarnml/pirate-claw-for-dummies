/**
 * Sentence boundaries shared by the HTML wrapper and audio generator.
 * Ranges deliberately tile the original text: the page markup cannot drop a
 * character just because narration needs a sentence boundary there.
 */
const ABBREVIATIONS = new Set([
  'e.g', 'i.e', 'etc', 'vs', 'cf', 'approx', 'fig', 'no',
  'mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'jr', 'sr',
  'inc', 'ltd', 'co', 'dept', 'univ', 'al',
]);

export function splitSentences(text) {
  const ranges = [];
  let start = 0;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (!'.!?'.includes(character)) continue;

    let endIndex = index;
    while (endIndex + 1 < text.length && '.!?'.includes(text[endIndex + 1])) endIndex += 1;
    while (endIndex + 1 < text.length && '"\')]}”’'.includes(text[endIndex + 1])) endIndex += 1;

    const after = text.slice(endIndex + 1);
    if (after && !/^\s/.test(after)) continue;
    if (after.trim() && !/^\s*["'(“‘]?[A-Z0-9—-]/.test(after)) continue;

    const before = text.slice(start, index);
    if (character === '.') {
      const lastWord = before.match(/([A-Za-z.]+)$/)?.[1]?.toLowerCase().replace(/\.$/, '');
      if (lastWord && ABBREVIATIONS.has(lastWord)) continue;
      if (/(^|\s)[A-Z]$/.test(before)) continue;
      if (/\d$/.test(before) && /^\d/.test(text.slice(index + 1))) continue;
    }

    const end = endIndex + 1;
    if (text.slice(start, end).trim()) ranges.push({ start, end });
    start = end;
    index = endIndex;
  }

  if (text.slice(start).trim()) ranges.push({ start, end: text.length });

  const tiled = [];
  for (const range of ranges) {
    if (!tiled.length) {
      tiled.push({ ...range });
      continue;
    }
    let sentenceStart = range.start;
    while (sentenceStart < range.end && /\s/.test(text[sentenceStart])) sentenceStart += 1;
    tiled[tiled.length - 1].end = sentenceStart;
    tiled.push({ start: sentenceStart, end: range.end });
  }
  return tiled;
}

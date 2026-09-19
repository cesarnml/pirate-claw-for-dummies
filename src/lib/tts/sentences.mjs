/** Deliberately conservative splitter: readable narration beats clever parsing. */
export function splitSentences(text) {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    return Array.from(segmenter.segment(text), ({ index, segment }) => ({
      start: index,
      end: index + segment.length,
    })).filter(({ start, end }) => text.slice(start, end).trim());
  }

  const ranges = [];
  const pattern = /[^.!?]+[.!?]+[”’')\]]*(?:\s+|$)|[^.!?]+$/g;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (match[0].trim()) ranges.push({ start, end });
  }
  return ranges;
}

/** Deliberately conservative splitter: readable narration beats clever parsing. */
export function splitSentences(text) {
  const ranges = [];
  const pattern = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (match[0].trim()) ranges.push({ start, end });
  }
  return ranges;
}

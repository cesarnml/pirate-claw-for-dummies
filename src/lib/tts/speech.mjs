/** Plain visible text of a HAST subtree. */
export const textOf = (node) =>
  node.type === 'text' ? node.value ?? '' : (node.children?.map(textOf).join('') ?? '');

const ACRONYMS = new Map([
  ['TMDB', 'T M D B'], ['TVDB', 'T V D B'], ['IMDb', 'I M D B'], ['API', 'A P I'],
  ['RSS', 'R S S'], ['SQL', 'S Q L'], ['URL', 'U R L'], ['JSON', 'J S O N'],
  ['Plex', 'Plex'], ['YTS', 'Y T S'], ['EZTV', 'E Z T V'], ['NAS', 'N A S'],
]);

// This is a spoken-only dictionary. It intentionally leaves the document text
// alone, while giving the synthesiser an unambiguous reading of the names and
// shorthand that recur throughout this particular guide.
const PRONUNCIATIONS = [
  [/🦀/g, ' Pirate Claw '],
  [/\bteardown\b/gi, 'tear down'],
  [/\bTheTVDB\b/g, 'The T V D B'],
  [/\bFanart\.tv\b/gi, 'Fan art dot T V'],
  [/\bOMDb\b/g, 'O M D B'],
  [/\bBYOK\b/g, 'B Y O K'],
  [/\bDMG\b/g, 'D M G'],
  [/\bSvelteKit\b/g, 'Svelte Kit'],
  [/\bTailscale\b/g, 'Tail scale'],
  [/\bGluetun\b/g, 'glue ten'],
  [/\bKokoro\b/g, 'ko ko ro'],
  [/\bHono\b/g, 'ho no'],
  [/\bv(\d+)\b/gi, 'version $1'],
];

export function speakCode(value) {
  let spoken = String(value).trim();
  if (!spoken) return '';
  for (const [written, said] of ACRONYMS) {
    spoken = spoken.replace(new RegExp(`\\b${written}\\b`, 'g'), said);
  }
  return spoken
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_/]/g, ' ')
    .replace(/\./g, ' dot ')
    .replace(/\(\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function announceCodeBlock(pre) {
  const classes = (pre.properties?.className ?? []).map(String);
  if (classes.includes('mermaid')) return '[Diagram — see the page for the visual.]';

  const language = String(pre.properties?.dataLanguage ?? pre.properties?.['data-language'] ?? 'code');
  const lineCount = Math.max(1, textOf(pre).split('\n').length);
  return `[${language} code block, ${lineCount} ${lineCount === 1 ? 'line' : 'lines'}.]`;
}

/**
 * Spoken form of a HAST subtree. The generator calls this on each already
 * wrapped sentence, so inline code becomes intelligible while the visual text
 * stays exactly as authored.
 */
export const speechOf = (node) => {
  if (node.type === 'text') return node.value ?? '';
  if (node.type !== 'element') return '';
  if (['script', 'style', 'link'].includes(node.tagName)) return '';
  if (node.tagName === 'pre') return announceCodeBlock(node);
  if (node.tagName === 'code') return ` ${speakCode(textOf(node))} `;
  return node.children?.map(speechOf).join('') ?? '';
};

export function tidyForSpeech(value) {
  let spoken = value;
  for (const [pattern, replacement] of PRONUNCIATIONS) spoken = spoken.replace(pattern, replacement);
  for (const [written, said] of ACRONYMS) {
    spoken = spoken.replace(new RegExp(`\\b${written}\\b`, 'g'), said);
  }
  return spoken
    .replace(/ /g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[—–]/g, ', ')
    .replace(/\s+([,.;:!?)\]])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

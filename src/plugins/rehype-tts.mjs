import { visit } from 'unist-util-visit';
import { textOf } from '../lib/tts/speech.mjs';
import { splitSentences } from '../lib/tts/sentences.mjs';

const blocks = new Set(['p', 'h2', 'h3', 'li', 'td', 'th', 'figcaption']);
const skip = new Set(['script', 'style', 'svg', 'button', 'pre']);
const span = (index, children) => ({ type: 'element', tagName: 'span', properties: { dataTts: String(index) }, children });

export default function rehypeTts() {
  return (tree) => {
    let counter = 0;
    visit(tree, 'element', (node) => {
      if (skip.has(node.tagName) || !blocks.has(node.tagName)) return 'skip';
      if (node.children?.some((child) => child.type !== 'text')) return;
      const visible = textOf(node);
      const ranges = splitSentences(visible);
      if (!ranges.length) return;
      node.children = ranges.map((range) => span(counter++, [{ type: 'text', value: visible.slice(range.start, range.end) }]));
    });
  };
}

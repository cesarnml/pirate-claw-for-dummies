/**
 * Wrap every narratable sentence in a `<span data-tts="n">`.
 *
 * The built HTML is the single source for both the player highlight targets and
 * the synthesis queue. Keeping inline elements inside their sentence span is
 * essential: prose with `code`, links, or emphasis must remain visible and
 * narratable rather than being skipped as a whole block.
 */
import { visit } from 'unist-util-visit';
import { textOf } from '../lib/tts/speech.mjs';
import { splitSentences } from '../lib/tts/sentences.mjs';

const BLOCKS = new Set([
  'p', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dd', 'dt', 'td', 'th', 'figcaption', 'summary',
]);
const SKIP = new Set(['script', 'style', 'svg', 'button']);

const span = (index, children) => ({
  type: 'element',
  tagName: 'span',
  properties: { dataTts: String(index) },
  children,
});

const hasBlockDescendant = (node) =>
  node.children?.some((child) =>
    child.type === 'element' && (BLOCKS.has(child.tagName) || hasBlockDescendant(child)),
  ) ?? false;

// astro-mermaid emits this as a raw HAST node, so a plain element visitor would
// otherwise omit the diagram from both playback and the active highlight.
const isMermaidRaw = (node) =>
  node.type === 'raw' && /<pre\b[^>]*\bclass="[^"]*\bmermaid\b/.test(node.value ?? '');

export default function rehypeTts() {
  return (tree) => {
    let counter = 0;

    visit(tree, (node) => node.type === 'element' || isMermaidRaw(node), (node, _index, parent) => {
      if (isMermaidRaw(node)) {
        if (parent) parent.children[parent.children.indexOf(node)] = span(counter++, [node]);
        return;
      }

      if (node.tagName === 'pre') {
        if (parent) parent.children[parent.children.indexOf(node)] = span(counter++, [node]);
        return 'skip';
      }
      if (SKIP.has(node.tagName)) return 'skip';
      if (!BLOCKS.has(node.tagName) || hasBlockDescendant(node)) return;

      // Text nodes may straddle sentence boundaries. Inline elements remain
      // intact and belong to the sentence where they begin, preserving markup.
      const atoms = node.children.map((child) =>
        child.type === 'text'
          ? { kind: 'text', node: child, visible: child.value ?? '' }
          : { kind: 'element', node: child, visible: textOf(child) },
      );
      const visible = atoms.map((atom) => atom.visible).join('');
      if (!visible.trim()) return;

      const ranges = splitSentences(visible);
      if (!ranges.length) return;

      const children = [];
      let cursor = 0;
      let atomIndex = 0;
      let carry = atoms[0]?.visible ?? '';

      for (const range of ranges) {
        const bucket = [];
        while (atomIndex < atoms.length && cursor < range.end) {
          const atom = atoms[atomIndex];
          const atomEnd = cursor + carry.length;

          if (atom.kind === 'text') {
            const from = Math.max(0, range.start - cursor);
            const to = Math.min(carry.length, range.end - cursor);
            const piece = carry.slice(from, to);
            if (piece) bucket.push({ type: 'text', value: piece });
            if (atomEnd > range.end) {
              carry = carry.slice(to);
              cursor = range.end;
              break;
            }
          } else {
            bucket.push(atom.node);
          }

          cursor = atomEnd;
          atomIndex += 1;
          carry = atoms[atomIndex]?.visible ?? '';
        }
        if (bucket.length) children.push(span(counter++, bucket));
      }

      // A wrapper may add elements, but it may never change the text a reader
      // sees. Failing loudly is safer than silently eating a boundary space.
      const rebuilt = children.map(textOf).join('');
      if (rebuilt !== visible) {
        throw new Error(`rehype-tts changed page text: ${JSON.stringify(visible.slice(0, 120))}`);
      }
      node.children = children;
    });
  };
}

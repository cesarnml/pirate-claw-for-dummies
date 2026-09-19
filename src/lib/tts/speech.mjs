export const textOf = (node) => {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
};

export const speechOf = (node) => textOf(node)
  .replace(/\bTMDB\b/g, 'T M D B')
  .replace(/\bAPI\b/g, 'A P I')
  .replace(/\bRSS\b/g, 'R S S')
  .replace(/\bSQL\b/g, 'S Q L')
  .replace(/\bPlex\b/g, 'Plex')
  .replace(/\s+/g, ' ')
  .trim();

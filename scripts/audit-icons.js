import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
  });
  return results;
}

const files = walk('ocho/client/src');
const iconMap = {};
const inlineSvgs = [];
const emojisOrSymbols = [];

files.forEach((f) => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative('ocho/client/src', f).replace(/\\/g, '/');

  // Match all imports from lucide-react (could be multiline)
  const lucideMatches = [...content.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/gs)];
  lucideMatches.forEach((match) => {
    const icons = match[1]
      .split(',')
      .map((s) => s.trim())
      .filter((s) => Boolean(s) && !s.startsWith('//'));
    icons.forEach((icon) => {
      // Clean possible 'as Alias'
      const cleanIcon = icon.split(/\s+as\s+/)[0].trim();
      if (!iconMap[cleanIcon]) iconMap[cleanIcon] = [];
      if (!iconMap[cleanIcon].includes(relPath)) {
        iconMap[cleanIcon].push(relPath);
      }
    });
  });

  // Check for inline SVGs except Logo.tsx
  if (relPath !== 'components/ui/Logo.tsx') {
    const svgMatches = [...content.matchAll(/<svg[^>]*>/g)];
    if (svgMatches.length > 0) {
      inlineSvgs.push({ file: relPath, count: svgMatches.length });
    }
  }

  // Check for emoji or text symbols used as icons
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojiMatches = content.match(emojiRegex);
  if (emojiMatches) {
    emojisOrSymbols.push({ file: relPath, emojis: [...new Set(emojiMatches)] });
  }
});

console.log('=== LUCIDE ICONS USED ===');
console.log(JSON.stringify(iconMap, null, 2));

console.log('\n=== INLINE SVGS (NON-LOGO) ===');
console.log(JSON.stringify(inlineSvgs, null, 2));

console.log('\n=== EMOJIS FOUND IN CODE ===');
console.log(JSON.stringify(emojisOrSymbols, null, 2));

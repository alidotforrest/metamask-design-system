/**
 * Post PR file review comments with before/after screenshot links.
 * Usage: node scripts/post-screenshot-comments.mjs
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const manifest = JSON.parse(
  fs.readFileSync('/workspace/images/manifest.json', 'utf8'),
);
const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
const baseUrl = `https://raw.githubusercontent.com/MetaMask/metamask-design-system/${branch}/images`;

const byFile = new Map();
for (const entry of manifest) {
  const list = byFile.get(entry.filePath) ?? [];
  list.push(entry);
  byFile.set(entry.filePath, list);
}

const comments = [];
for (const [filePath, entries] of byFile) {
  const lines = [
    '### Before / after Storybook screenshots',
    '',
    'Copy updates in this file (main vs PR preview).',
    '',
  ];

  for (const e of entries) {
    const prefix = e.rn ? 'rn' : 'react';
    const safeName = `${prefix}-${e.component}-${e.storyName}`;
    const beforeImg = `${baseUrl}/${safeName}-before.png`;
    const afterImg = `${baseUrl}/${safeName}-after.png`;
    lines.push(`#### ${e.storyName}`);
    lines.push('');
    lines.push('| Before (main) | After (PR) |');
    lines.push('| --- | --- |');
    lines.push(
      `| ![before](${beforeImg}) | ![after](${afterImg}) |`,
    );
    lines.push('');
    lines.push(`- [Before story](${e.beforeUrl})`);
    lines.push(`- [After story](${e.afterUrl})`);
    lines.push('');
  }

  comments.push({ filePath, body: lines.join('\n') });
}

fs.writeFileSync(
  '/workspace/images/comments.json',
  JSON.stringify(comments, null, 2),
);
console.log(`Prepared ${comments.length} file comments.`);

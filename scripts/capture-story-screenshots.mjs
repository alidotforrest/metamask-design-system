/**
 * Capture before/after Storybook screenshots for changed stories in a PR.
 * Usage: node scripts/capture-story-screenshots.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const OUT_DIR = '/workspace/pr-screenshots/1461';
const BEFORE_REACT_BASE =
  'https://metamask.github.io/metamask-design-system/iframe.html';
const BEFORE_RN_BASE =
  'https://metamask.github.io/metamask-design-system/react-native/iframe.html';
const AFTER_REACT_BASE =
  'https://diuv6g5fj9pvx.cloudfront.net/metamask-design-system/32990895416/storybook-build/iframe.html';
const AFTER_RN_BASE =
  'https://diuv6g5fj9pvx.cloudfront.net/metamask-design-system/32990895416/storybook-build/react-native/iframe.html';

function toStoryId(title, storyName) {
  const slug = title
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const storySlug = storyName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  return `${slug}--${storySlug}`;
}

function getChangedStoryFiles() {
  const output = execSync('git diff main --name-only -- "*.stories.tsx"', {
    encoding: 'utf8',
  });
  return output.trim().split('\n').filter(Boolean);
}

function getChangedStories(filePath) {
  const diff = execSync(`git diff main -U0 -- "${filePath}"`, {
    encoding: 'utf8',
  });
  const changed = new Set();
  const lines = diff.split('\n');
  let currentStory = null;

  for (const line of lines) {
    const storyMatch = line.match(
      /^@@ .* export const (\w+): Story/,
    );
    if (storyMatch) {
      currentStory = storyMatch[1];
    }
    if (
      line.startsWith('+') &&
      !line.startsWith('+++') &&
      currentStory &&
      !line.match(/^\+export const/)
    ) {
      changed.add(currentStory);
    }
    if (line.startsWith('@@') && !line.includes('export const')) {
      // hunk inside a story without story declaration in hunk header
    }
  }

  // Also detect new story exports
  for (const line of lines) {
    const m = line.match(/^\+export const (\w+): Story/);
    if (m) changed.add(m[1]);
  }

  // Fallback: if only meta/argTypes changed, capture Default
  if (changed.size === 0) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('export const Default')) {
      changed.add('Default');
    }
  }

  return [...changed];
}

function getTitle(filePath, content) {
  const m = content.match(/title:\s*['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

function isReactNative(filePath) {
  return filePath.includes('design-system-react-native');
}

async function capturePage(page, url, outPath) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const frame = page.frame({ name: 'storybook-preview-iframe' });
  const target = frame ?? page;
  await target.waitForTimeout(500);
  await page.screenshot({ path: outPath, fullPage: false });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = [];

  const files = getChangedStoryFiles();
  const browser = await chromium.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = getTitle(filePath, content);
    if (!title) {
      console.warn(`No title in ${filePath}`);
      continue;
    }

    const rn = isReactNative(filePath);
    const beforeBase = rn ? BEFORE_RN_BASE : BEFORE_REACT_BASE;
    const afterBase = rn ? AFTER_RN_BASE : AFTER_REACT_BASE;
    const stories = getChangedStories(filePath);
    const component = path.basename(path.dirname(filePath));

    for (const storyName of stories) {
      const storyId = toStoryId(title, storyName);
      const params = `id=${storyId}&viewMode=story`;
      const beforeUrl = `${beforeBase}?${params}`;
      const afterUrl = `${afterBase}?${params}`;
      const safeName = `${rn ? 'rn' : 'react'}-${component}-${storyName}`;
      const beforePath = path.join(OUT_DIR, `${safeName}-before.png`);
      const afterPath = path.join(OUT_DIR, `${safeName}-after.png`);

      console.log(`Capturing ${safeName}...`);
      try {
        await capturePage(page, beforeUrl, beforePath);
        await capturePage(page, afterUrl, afterPath);
        manifest.push({
          filePath,
          storyName,
          storyId,
          component,
          rn,
          beforePath,
          afterPath,
          beforeUrl,
          afterUrl,
        });
      } catch (err) {
        console.error(`Failed ${safeName}:`, err.message);
      }
    }
  }

  await browser.close();
  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  console.log(`Done. ${manifest.length} story pairs captured.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

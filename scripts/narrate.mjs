#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fromHtml } from 'hast-util-from-html';
import { visit } from 'unist-util-visit';
import ffmpeg from 'ffmpeg-static';
import { speechOf, tidyForSpeech } from '../src/lib/tts/speech.mjs';
import { readingOrder } from '../src/sidebar.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = path.join(root, 'dist'); const work = path.join(root, '.tts'); const out = path.join(root, 'public/audio');
const voice = process.argv.includes('--voice') ? process.argv[process.argv.indexOf('--voice') + 1] : 'af_heart';
const allowed = new Set(readingOrder.map((page) => page.slug));

function pages() {
  const found = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : entry.name === 'index.html' && found.push(path.join(dir, entry.name)));
  walk(dist);
  return found.map((file) => {
    const rel = path.relative(dist, path.dirname(file)); const key = rel || 'index'; const tree = fromHtml(fs.readFileSync(file, 'utf8'));
    const byIndex = new Map();
    visit(tree, 'element', (node) => {
      const raw = node.properties?.dataTts;
      if (raw === undefined) return;
      const speech = tidyForSpeech(speechOf(node));
      if (speech) byIndex.set(Number(raw), { i: Number(raw), speech });
    });
    const sentences = [...byIndex.values()].sort((left, right) => left.i - right.i);
    return { key, sentences };
  }).filter((page) => allowed.has(page.key) && page.sentences.length);
}
const hash = (page) => crypto.createHash('sha256').update(JSON.stringify({ version: 2, voice, sentences: page.sentences })).digest('hex').slice(0, 16);
const run = (cmd, args) => new Promise((resolve, reject) => { const child = spawn(cmd, args, { stdio: 'inherit' }); child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))); child.on('error', reject); });

if (!fs.existsSync(dist)) throw new Error('Run npm run build before npm run narrate.');
const all = pages().map((page) => ({ ...page, hash: hash(page) }));
const stale = all.filter((page) => { const meta = path.join(out, `${page.key}.json`); const audio = path.join(out, `${page.key}.mp3`); if (!fs.existsSync(meta) || !fs.existsSync(audio)) return true; try { return JSON.parse(fs.readFileSync(meta, 'utf8')).hash !== page.hash; } catch { return true; } });
if (!stale.length) { console.log('Narration is current.'); process.exit(0); }
fs.mkdirSync(work, { recursive: true }); fs.mkdirSync(out, { recursive: true });
const requestedWorkers = Number.parseInt(process.env.KOKORO_WORKERS ?? '2', 10);
const workerCount = Math.max(1, Math.min(Number.isFinite(requestedWorkers) ? requestedWorkers : 2, stale.length));
const chunks = Array.from({ length: workerCount }, () => []);
stale.forEach((page, index) => chunks[index % workerCount].push(page));
const jobs = chunks.map((jobPages, index) => {
  const job = path.join(work, `job-${index}.json`);
  fs.writeFileSync(job, JSON.stringify({ voice, outDir: path.join(work, 'wav'), pages: jobPages }));
  return job;
});
console.log(`Synthesizing ${stale.length} track(s) with ${workerCount} worker(s).`);
await Promise.all(jobs.map((job) => run(process.execPath, [path.join(root, 'scripts/kokoro-synth.mjs'), job])));
for (const page of stale) {
  const wav = path.join(work, 'wav', `${page.key}.wav`); const timing = path.join(work, 'wav', `${page.key}.timing.json`); const mp3 = path.join(out, `${page.key}.mp3`);
  fs.mkdirSync(path.dirname(mp3), { recursive: true }); await run(ffmpeg, ['-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3]);
  fs.writeFileSync(path.join(out, `${page.key}.json`), fs.readFileSync(timing));
}
console.log(`Published ${stale.length} narration track(s).`);

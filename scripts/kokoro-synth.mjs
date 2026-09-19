#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { KokoroTTS } from 'kokoro-js';

const GAP = 0.12;
const model = process.env.KOKORO_MODEL ?? 'onnx-community/Kokoro-82M-v1.0-ONNX';

function writeWav(file, samples, rate) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8); buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, i) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + i * 2));
  fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, buffer);
}

const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const tts = await KokoroTTS.from_pretrained(model, { dtype: 'q8', device: 'cpu' });
for (const page of job.pages) {
  const chunks = []; const sentences = []; let cursor = 0; let rate = 24000;
  for (const sentence of page.sentences) {
    const audio = await tts.generate(sentence.speech, { voice: job.voice });
    rate = audio.sampling_rate;
    const duration = audio.audio.length / rate;
    sentences.push({ i: sentence.i, start: Number(cursor.toFixed(3)), end: Number((cursor + duration).toFixed(3)) });
    chunks.push(audio.audio, new Float32Array(Math.round(rate * GAP))); cursor += duration + GAP;
  }
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const merged = new Float32Array(length); let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
  writeWav(path.join(job.outDir, `${page.key}.wav`), merged, rate);
  fs.writeFileSync(path.join(job.outDir, `${page.key}.timing.json`), JSON.stringify({ hash: page.hash, duration: Number((length / rate).toFixed(3)), sentences }));
  console.log(`✓ ${page.key} — ${(length / rate / 60).toFixed(1)} min`);
}

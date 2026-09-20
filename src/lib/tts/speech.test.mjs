import assert from 'node:assert/strict';
import test from 'node:test';
import { announceCodeBlock, tidyForSpeech } from './speech.mjs';

test('uses the Pirate Claw pronunciation dictionary without changing prose', () => {
  assert.equal(
    tidyForSpeech('🦀 starts teardown on the NAS through TheTVDB.'),
    'Pirate Claw starts tear down on the N A S through The T V D B.',
  );
});

test('announces Mermaid diagrams instead of attempting to read graph syntax', () => {
  const pre = { type: 'element', tagName: 'pre', properties: { className: ['mermaid'] }, children: [] };
  assert.equal(announceCodeBlock(pre), '[Diagram — see the page for the visual.]');
});

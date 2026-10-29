import test from 'node:test';
import assert from 'node:assert/strict';
import { cropRect, outputSize } from '../lib/photo-processing.ts';
test('matching aspect keeps the full photo without an unwanted crop', () => {
  assert.deepEqual(cropRect(4000, 3000, 4 / 3), { x: 0, y: 0, width: 4000, height: 3000 });
});
test('portrait crop can reach the top and bottom without leaving the image', () => {
  const top = cropRect(3000, 4000, 4 / 3, 1, 50, 0);
  const bottom = cropRect(3000, 4000, 4 / 3, 1, 50, 100);
  assert.equal(top.y, 0);
  assert.equal(bottom.y + bottom.height, 4000);
  assert.equal(bottom.width / bottom.height, 4 / 3);
});
test('zoom and bounded position controls preserve crop bounds', () => {
  for (const ratio of [1, 4 / 3, 16 / 9])
    for (const zoom of [1, 2, 4])
      for (const offset of [-10, 50, 110]) {
        const crop = cropRect(4000, 3000, ratio, zoom, offset, offset);
        assert.ok(crop.x >= 0 && crop.y >= 0);
        assert.ok(crop.x + crop.width <= 4000.0001 && crop.y + crop.height <= 3000.0001);
        assert.ok(Math.abs(crop.width / crop.height - ratio) < 0.00001);
      }
});
test('large photos resize to 2048 pixels and smaller photos are never upscaled', () => {
  assert.deepEqual(outputSize(4000, 3000), { width: 2048, height: 1536 });
  assert.deepEqual(outputSize(800, 600), { width: 800, height: 600 });
  assert.deepEqual(outputSize(3000, 4000), { width: 1536, height: 2048 });
});
test('invalid photo dimensions fail before image processing', () => {
  assert.throws(() => cropRect(0, 100, 4 / 3));
  assert.throws(() => cropRect(100, 100, NaN));
});

import { buildDeletionEmailUrl } from '../src/features/settings/deletion-email';

describe('buildDeletionEmailUrl', () => {
  it('addresses a deletion request without embedding account data', () => {
    const url = buildDeletionEmailUrl('delete@example.invalid');

    expect(url.startsWith('mailto:delete@example.invalid?')).toBe(true);
    expect(url).toContain('TrackMyProps%20account%20and%20data%20deletion%20request');
    expect(url).not.toContain('alex@example.com');
  });
});

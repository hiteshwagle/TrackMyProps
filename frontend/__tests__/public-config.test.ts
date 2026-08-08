import { getPublicServiceUrlError } from '../src/config/public-config';

describe('public service URL validation', () => {
  it('allows local HTTP development URLs', () => {
    expect(getPublicServiceUrlError('http://127.0.0.1:54321', 'Supabase')).toBeNull();
    expect(getPublicServiceUrlError('http://localhost:8000', 'Backend')).toBeNull();
  });

  it('requires HTTPS for non-local services', () => {
    expect(getPublicServiceUrlError('http://api.example.com', 'Backend')).toContain(
      'must use HTTPS',
    );
  });

  it('rejects invalid URLs', () => {
    expect(getPublicServiceUrlError('not a URL', 'Backend')).toBe('The Backend URL is invalid.');
  });
});

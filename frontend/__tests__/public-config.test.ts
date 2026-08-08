import {
  getEnvironmentConfigurationError,
  getPublicServiceUrlError,
} from '../src/config/public-config';

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

describe('environment separation', () => {
  it('allows loopback services in development', () => {
    expect(
      getEnvironmentConfigurationError(
        'development',
        'http://127.0.0.1:54321',
        'http://127.0.0.1:8000',
      ),
    ).toBeNull();
  });

  it('rejects loopback services in production', () => {
    expect(
      getEnvironmentConfigurationError(
        'production',
        'http://127.0.0.1:54321',
        'https://api.example.com',
      ),
    ).toBe('Production configuration cannot use loopback service URLs.');
  });

  it('rejects unknown environments', () => {
    expect(
      getEnvironmentConfigurationError(
        'staging',
        'https://supabase.example.com',
        'https://api.example.com',
      ),
    ).toBe('The application environment must be development or production.');
  });
});

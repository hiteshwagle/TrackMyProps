import { fetchCurrentUser } from '../src/features/profile/current-user';

const backendUrl = 'http://127.0.0.1:8000';

describe('fetchCurrentUser', () => {
  it('sends the Supabase access token to the backend', async () => {
    const fetchImplementation = jest.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(init?.headers).toEqual({ Authorization: 'Bearer access-token' });
        return new Response(
          JSON.stringify({
            email: 'owner@example.com',
            id: 'e8cf2dbf-463e-485f-880d-cdb828749979',
            name: 'Owner Example',
            phone: null,
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        );
      },
    );

    const user = await fetchCurrentUser('access-token', backendUrl, fetchImplementation);

    expect(fetchImplementation).toHaveBeenCalledWith(`${backendUrl}/api/v1/me`, {
      headers: { Authorization: 'Bearer access-token' },
      method: 'GET',
    });
    expect(user.name).toBe('Owner Example');
  });

  it('returns a safe typed backend error', async () => {
    const fetchImplementation = jest.fn(
      async () =>
        new Response(
          JSON.stringify({
            error: {
              code: 'INVALID_ACCESS_TOKEN',
              message: 'The access token is invalid or expired.',
            },
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 401 },
        ),
    );

    await expect(
      fetchCurrentUser('expired-token', backendUrl, fetchImplementation),
    ).rejects.toMatchObject({
      code: 'INVALID_ACCESS_TOKEN',
      status: 401,
    });
  });

  it('rejects a response that violates the contract', async () => {
    const fetchImplementation = jest.fn(
      async () =>
        new Response(JSON.stringify({ id: 'not-a-uuid' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
    );

    await expect(
      fetchCurrentUser('access-token', backendUrl, fetchImplementation),
    ).rejects.toMatchObject({ code: 'INVALID_BACKEND_RESPONSE' });
  });
});

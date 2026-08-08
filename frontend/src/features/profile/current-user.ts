import { useQuery } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { z } from 'zod';

import {
  getEnvironmentConfigurationError,
  getPublicServiceUrlError,
  publicConfig,
} from '../../config/public-config';

const currentUserSchema = z
  .object({
    email: z.email(),
    id: z.uuid(),
    name: z.string().nullable(),
    phone: z.string().nullable(),
  })
  .strict();

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;

export class BackendApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

export async function fetchCurrentUser(
  accessToken: string,
  backendUrl = publicConfig.backendUrl,
  fetchImplementation: typeof fetch = fetch,
): Promise<CurrentUser> {
  const configurationError = getPublicServiceUrlError(backendUrl, 'Backend');
  const environmentError =
    backendUrl === publicConfig.backendUrl
      ? getEnvironmentConfigurationError(
          publicConfig.appEnvironment,
          publicConfig.supabaseUrl,
          publicConfig.backendUrl,
        )
      : null;
  if (configurationError || environmentError) {
    throw new BackendApiError(
      configurationError || environmentError || 'Backend configuration is missing.',
      0,
      'BACKEND_NOT_CONFIGURED',
    );
  }

  let response: Response;
  try {
    response = await fetchImplementation(`${backendUrl}/api/v1/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      method: 'GET',
    });
  } catch {
    throw new BackendApiError(
      'The backend is unavailable. Check the local services and try again.',
      0,
      'BACKEND_UNAVAILABLE',
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsedError = errorResponseSchema.safeParse(payload);
    throw new BackendApiError(
      parsedError.success ? parsedError.data.error.message : 'The request could not be completed.',
      response.status,
      parsedError.success ? parsedError.data.error.code : 'BACKEND_REQUEST_FAILED',
    );
  }

  const parsedUser = currentUserSchema.safeParse(payload);
  if (!parsedUser.success) {
    throw new BackendApiError(
      'The backend returned an invalid response.',
      response.status,
      'INVALID_BACKEND_RESPONSE',
    );
  }
  return parsedUser.data;
}

export function useCurrentUser(session: Session | null) {
  return useQuery({
    enabled: Boolean(session),
    queryFn: () => fetchCurrentUser(session?.access_token || ''),
    queryKey: ['current-user', session?.user.id],
    retry: (failureCount, error) =>
      error instanceof BackendApiError && error.status >= 500 && failureCount < 1,
    staleTime: 60_000,
  });
}

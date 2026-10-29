import { getChatGPTUser } from '../app/chatgpt-auth';
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function apiUser(request: Request, write = false) {
  const user = await getChatGPTUser();
  if (!user) throw new ApiError(401, 'Sign in to access your portfolio.');
  if (write) {
    const origin = request.headers.get('origin');
    if (!origin || origin !== new URL(request.url).origin)
      throw new ApiError(403, 'Request origin is not allowed.');
    if (!request.headers.get('content-type')?.includes('application/json'))
      throw new ApiError(415, 'Send JSON data.');
  }
  return user;
}
export async function body(request: Request) {
  const text = await request.text();
  if (text.length > 20000) throw new ApiError(413, 'This entry is too large.');
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, 'Invalid JSON.');
  }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export function failure(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error && typeof error === 'object' && 'issues' in error) {
    const e = error as { issues: { message: string }[] };
    return json({ error: e.issues.map((i) => i.message).join(' ') }, 400);
  }
  const requestId = crypto.randomUUID();
  console.error(JSON.stringify({ event: 'portfolio_request_failed', requestId }));
  return json(
    { error: 'Unable to complete this request. Please try again.', request_id: requestId },
    500,
  );
}

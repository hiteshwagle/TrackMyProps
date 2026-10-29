import { apiUser, failure } from '../../../../lib/api';
import { listPortfolio } from '../../../../lib/store';
export async function GET(request: Request) {
  try {
    const user = await apiUser(request);
    return new Response(
      JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          currency: 'AUD',
          ...(await listPortfolio(user.userId)),
        },
        null,
        2,
      ),
      {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="trackmyprops-portfolio.json"',
          'Cache-Control': 'private, no-store',
        },
      },
    );
  } catch (e) {
    return failure(e);
  }
}

import { apiUser, json, failure } from '../../../../lib/api';
import { listPortfolio } from '../../../../lib/store';
import { summarise } from '../../../../lib/domain';
export async function GET(request: Request) {
  try {
    const user = await apiUser(request);
    const portfolio = await listPortfolio(user.userId);
    const param = new URL(request.url).searchParams.get('year');
    const year = param
      ? Number(param)
      : Number(
          new Intl.DateTimeFormat('en-AU', {
            timeZone: 'Australia/Sydney',
            year: 'numeric',
          }).format(new Date()),
        );
    if (!Number.isInteger(year) || year < 2000 || year > 9999)
      return json({ error: 'Choose a valid calendar year.' }, 400);
    return json({ ...portfolio, summary: summarise(portfolio.properties, portfolio.items, year) });
  } catch (e) {
    return failure(e);
  }
}

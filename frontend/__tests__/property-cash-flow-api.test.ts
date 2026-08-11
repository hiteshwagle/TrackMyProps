import {
  createPropertyCashFlowItem,
  deletePropertyCashFlowItem,
  fetchPropertyCashFlowItems,
  fetchPropertyCashFlowSummary,
  type PropertyCashFlowItemCreate,
} from '../src/features/properties/property-cash-flow-api';

const backendUrl = 'http://127.0.0.1:8000';
const propertyId = '919d97fd-64cb-4eb6-8349-0fc0c78b1285';
const itemId = '5658d22d-dd92-4b45-bc19-740b03b4193b';

const itemInput: PropertyCashFlowItemCreate = {
  amount: { amount: '650.00', currency: 'AUD' },
  end_date: null,
  frequency: 'weekly',
  name: 'Rent',
  occurrence_date: null,
  start_date: '2026-08-11',
};

function itemResponse() {
  return {
    ...itemInput,
    created_at: '2026-08-11T00:00:00Z',
    item_id: itemId,
    item_type: 'income',
    property_id: propertyId,
    updated_at: '2026-08-11T00:00:00Z',
  };
}

describe('property cash-flow API', () => {
  it('gets the annual property totals from the summary endpoint', async () => {
    const fetchImplementation = jest.fn(async (url: string | URL | Request) => {
      expect(String(url)).toBe(`${backendUrl}/api/v1/properties/${propertyId}/cash-flow-summary`);
      return new Response(
        JSON.stringify({
          calculation_version: 'property-cash-flow-summary:1.0.0',
          expense_item_count: 1,
          income_item_count: 1,
          period: 'annual',
          period_year: 2026,
          property_id: propertyId,
          total_expenses: { amount: '5400.00', currency: 'AUD' },
          total_income: { amount: '33800.00', currency: 'AUD' },
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    });

    const summary = await fetchPropertyCashFlowSummary(
      'access-token',
      propertyId,
      backendUrl,
      fetchImplementation,
    );

    expect(summary.total_income.amount).toBe('33800.00');
    expect(summary.total_expenses.amount).toBe('5400.00');
  });

  it('lists income sources from the property endpoint', async () => {
    const fetchImplementation = jest.fn(async (url: string | URL | Request) => {
      expect(String(url)).toBe(
        `${backendUrl}/api/v1/properties/${propertyId}/income?page_size=100`,
      );
      return new Response(
        JSON.stringify({
          items: [itemResponse()],
          pagination: {
            has_next: false,
            has_previous: false,
            page: 1,
            page_size: 100,
            total: 1,
            total_pages: 1,
          },
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    });

    const items = await fetchPropertyCashFlowItems(
      'access-token',
      propertyId,
      'income',
      backendUrl,
      fetchImplementation,
    );

    expect(items[0]?.name).toBe('Rent');
  });

  it('creates an expense through the plural expense endpoint', async () => {
    const expenseInput: PropertyCashFlowItemCreate = {
      ...itemInput,
      frequency: 'one_off',
      name: 'Maintenance',
      occurrence_date: '2026-08-11',
      start_date: null,
    };
    const fetchImplementation = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe(`${backendUrl}/api/v1/properties/${propertyId}/expenses`);
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify(expenseInput));
      return new Response(
        JSON.stringify({
          ...itemResponse(),
          ...expenseInput,
          item_type: 'expense',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 201 },
      );
    });

    const item = await createPropertyCashFlowItem(
      'access-token',
      propertyId,
      'expense',
      expenseInput,
      backendUrl,
      fetchImplementation,
    );

    expect(item.item_type).toBe('expense');
    expect(item.name).toBe('Maintenance');
  });

  it('deletes only the selected property expense item', async () => {
    const fetchImplementation = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe(`${backendUrl}/api/v1/expenses/${itemId}`);
      expect(init?.method).toBe('DELETE');
      return new Response(null, { status: 204 });
    });

    await deletePropertyCashFlowItem(
      'access-token',
      propertyId,
      'expense',
      itemId,
      backendUrl,
      fetchImplementation,
    );

    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });
});

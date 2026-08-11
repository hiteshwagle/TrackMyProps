import {
  createProperty,
  fetchPortfolioSummary,
  fetchProperties,
  type PropertyCreate,
  updateProperty,
  updatePropertyStatus,
} from '../src/features/properties/property-api';
import {
  buildPropertyCreate,
  type PropertyFormValues,
} from '../src/features/properties/property-form';

const backendUrl = 'http://127.0.0.1:8000';

function formValues(): PropertyFormValues {
  return {
    addressId: 'GANSW123456789',
    addressLine1: '10 Example Street',
    addressLine2: '',
    addressSearch: '10 Example Street, Parramatta NSW 2150',
    annualInterestRatePercent: '6.1',
    bathrooms: '1.5',
    bedrooms: '2.5',
    buildingAreaSqm: '82.25',
    carSpaces: '1',
    country: 'Australia',
    currentValue: '700000.00',
    currentValueAsOf: '2026-08-01',
    displayName: 'Parramatta unit',
    landAreaSqm: '125.50',
    loanBalanceAsOf: '2026-08-01',
    loanChoice: 'yes',
    nextRepaymentDate: '2026-09-01',
    notes: '',
    originalLoanAmount: '520000.00',
    postcode: '2150',
    propertyType: 'apartment_unit',
    purchaseDate: '2024-05-01',
    purchasePrice: '650000.00',
    remainingLoanBalance: '490000.00',
    repaymentAmount: '3200.00',
    repaymentFrequency: 'monthly',
    state: 'NSW',
    suburb: 'Parramatta',
  };
}

function propertyInput(): PropertyCreate {
  return buildPropertyCreate(formValues());
}

function propertyResponse() {
  return {
    ...propertyInput(),
    created_at: '2026-08-11T00:00:00Z',
    owner_user_id: 'e8cf2dbf-463e-485f-880d-cdb828749979',
    property_id: '919d97fd-64cb-4eb6-8349-0fc0c78b1285',
    status: 'active',
    updated_at: '2026-08-11T00:00:00Z',
  };
}

describe('property contracts', () => {
  it('builds a precise property request without binary floating-point rate conversion', () => {
    expect(propertyInput()).toMatchObject({
      address_id: 'GANSW123456789',
      annual_interest_rate: { display_percent: '6.1', value: '0.061' },
      car_spaces: 1,
      current_value: { amount: '700000.00', currency: 'AUD' },
      has_loan: true,
      purchase_price: { amount: '650000.00', currency: 'AUD' },
    });
  });

  it('preserves unknown loan information rather than converting it to zero', () => {
    const values = formValues();
    values.loanChoice = 'unknown';

    expect(buildPropertyCreate(values)).toMatchObject({
      annual_interest_rate: null,
      has_loan: null,
      original_loan_amount: null,
      remaining_loan_balance: null,
    });
  });

  it('lists properties using the Supabase access token', async () => {
    const fetchImplementation = jest.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(init?.headers).toEqual({ Authorization: 'Bearer access-token' });
        return new Response(
          JSON.stringify({
            items: [propertyResponse()],
            pagination: {
              has_next: false,
              has_previous: false,
              page: 1,
              page_size: 25,
              total: 1,
              total_pages: 1,
            },
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      },
    );

    const properties = await fetchProperties(
      'access-token',
      'active',
      backendUrl,
      fetchImplementation,
    );

    expect(properties[0]?.display_name).toBe('Parramatta unit');
    expect(fetchImplementation).toHaveBeenCalledWith(
      `${backendUrl}/api/v1/properties?status=active`,
      expect.any(Object),
    );
  });

  it('creates a property only through the backend API', async () => {
    const input = propertyInput();
    const fetchImplementation = jest.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(init).toEqual({
          body: JSON.stringify(input),
          headers: {
            Authorization: 'Bearer access-token',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });
        return new Response(JSON.stringify(propertyResponse()), {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        });
      },
    );

    const created = await createProperty('access-token', input, backendUrl, fetchImplementation);

    expect(created.owner_user_id).toBe('e8cf2dbf-463e-485f-880d-cdb828749979');
  });

  it('updates editable property details through the backend', async () => {
    const input = propertyInput();
    const fetchImplementation = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe(`${backendUrl}/api/v1/properties/${propertyResponse().property_id}`);
      expect(init?.method).toBe('PUT');
      expect(init?.body).toBe(JSON.stringify(input));
      return new Response(JSON.stringify(propertyResponse()), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    });

    const updated = await updateProperty(
      'access-token',
      propertyResponse().property_id,
      input,
      backendUrl,
      fetchImplementation,
    );

    expect(updated.display_name).toBe('Parramatta unit');
  });

  it('archives and restores a property through the status endpoint', async () => {
    const archivedResponse = { ...propertyResponse(), status: 'archived' as const };
    const fetchImplementation = jest.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe(
        `${backendUrl}/api/v1/properties/${propertyResponse().property_id}/status`,
      );
      expect(init?.method).toBe('PATCH');
      expect(init?.body).toBe(JSON.stringify({ status: 'archived' }));
      return new Response(JSON.stringify(archivedResponse), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    });

    const archived = await updatePropertyStatus(
      'access-token',
      propertyResponse().property_id,
      'archived',
      backendUrl,
      fetchImplementation,
    );

    expect(archived.status).toBe('archived');
  });

  it('loads authoritative portfolio totals from the backend', async () => {
    const fetchImplementation = jest.fn(async () =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            asset_value_missing_count: 0,
            calculation_version: 'portfolio-summary:1.0.0',
            equity_missing_count: 0,
            loan_balance_missing_count: 0,
            property_count: 1,
            total_asset_value: { amount: '700000.00', currency: 'AUD' },
            total_equity: { amount: '210000.00', currency: 'AUD' },
            total_remaining_loan: { amount: '490000.00', currency: 'AUD' },
          }),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        ),
      ),
    );

    const summary = await fetchPortfolioSummary('access-token', backendUrl, fetchImplementation);

    expect(summary.property_count).toBe(1);
    expect(summary.total_equity?.amount).toBe('210000.00');
  });
});

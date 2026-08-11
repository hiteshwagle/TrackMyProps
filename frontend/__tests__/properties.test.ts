import {
  createProperty,
  fetchProperties,
  type PropertyCreate,
} from '../src/features/properties/property-api';
import {
  buildPropertyCreate,
  type PropertyFormValues,
} from '../src/features/properties/property-form';

const backendUrl = 'http://127.0.0.1:8000';

function formValues(): PropertyFormValues {
  return {
    addressLine1: '10 Example Street',
    addressLine2: '',
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

    const properties = await fetchProperties('access-token', backendUrl, fetchImplementation);

    expect(properties[0]?.display_name).toBe('Parramatta unit');
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
});

import { act, fireEvent, render } from '@testing-library/react-native';

import PropertiesScreen from '../app/(tabs)/properties';
import type { Property } from '../src/features/properties/property-api';

const mockSession = {
  access_token: 'access-token',
  user: { id: 'e8cf2dbf-463e-485f-880d-cdb828749979' },
};
const mockCreateProperty = jest.fn();
const mockUpdateStatus = jest.fn();
const mockUseProperties = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: () => ({ session: mockSession }),
}));

jest.mock('../src/features/properties/address-lookup-api', () => ({
  lookupAddressesWithSupabase: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('../src/features/properties/property-api', () => {
  const actual = jest.requireActual('../src/features/properties/property-api');
  return {
    ...actual,
    useCreateProperty: () => ({ isPending: false, mutateAsync: mockCreateProperty }),
    useProperties: (...arguments_: unknown[]) => mockUseProperties(...arguments_),
    useUpdatePropertyStatus: () => ({ isPending: false, mutateAsync: mockUpdateStatus }),
  };
});

jest.mock('../src/features/properties/property-cash-flow-api', () => ({
  usePropertyCashFlowSummary: () => ({
    data: {
      period_year: 2026,
      total_expenses: { amount: '5400.00', currency: 'AUD' },
      total_income: { amount: '33800.00', currency: 'AUD' },
    },
    isError: false,
    isPending: false,
  }),
}));

const property: Property = {
  address_id: 'GAVIC421626446',
  address_line_1: '21 Marigold Avenue',
  address_line_2: null,
  annual_interest_rate: null,
  bathrooms: '1.5',
  bedrooms: '2.5',
  building_area_sqm: '82.25',
  car_spaces: 1,
  country: 'Australia',
  created_at: '2026-08-11T00:00:00Z',
  current_value: { amount: '700000.00', currency: 'AUD' },
  current_value_as_of: '2026-08-01',
  display_name: 'Altona home',
  has_loan: false,
  land_area_sqm: '125.50',
  loan_balance_as_of: null,
  next_repayment_date: null,
  notes: null,
  original_loan_amount: null,
  owner_user_id: 'e8cf2dbf-463e-485f-880d-cdb828749979',
  postcode: '3025',
  property_id: '919d97fd-64cb-4eb6-8349-0fc0c78b1285',
  property_type: 'house',
  purchase_date: '2024-05-01',
  purchase_price: { amount: '650000.00', currency: 'AUD' },
  remaining_loan_balance: { amount: '0.00', currency: 'AUD' },
  repayment_amount: null,
  repayment_frequency: null,
  state: 'VIC',
  status: 'active',
  suburb: 'Altona North',
  updated_at: '2026-08-11T00:00:00Z',
};

function propertyQuery(data: Property[]) {
  return {
    data,
    error: null,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
  };
}

describe('PropertiesScreen', () => {
  beforeEach(() => {
    mockCreateProperty.mockReset();
    mockRouterPush.mockReset();
    mockUpdateStatus.mockReset();
    mockUseProperties.mockReset();
    mockUseProperties.mockImplementation((_session, status) =>
      propertyQuery(status === 'active' ? [property] : []),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows compact annual totals and opens the property details page', async () => {
    const view = await render(<PropertiesScreen />);

    expect(view.getByRole('tab', { name: 'Active' })).toBeOnTheScreen();
    expect(view.getByRole('tab', { name: 'Archived' })).toBeOnTheScreen();
    expect(view.getByText('Total income (annual): AUD 33800.00')).toBeOnTheScreen();
    expect(view.getByText('Total expense (annual): AUD 5400.00')).toBeOnTheScreen();
    expect(view.getByText('active').props.numberOfLines).toBe(1);
    expect(view.queryByRole('button', { name: 'Add income' })).not.toBeOnTheScreen();
    expect(view.queryByRole('button', { name: 'Add expense' })).not.toBeOnTheScreen();

    await fireEvent.press(view.getByRole('button', { name: 'View details' }));

    expect(mockRouterPush).toHaveBeenCalledWith({
      params: { propertyId: property.property_id },
      pathname: '/property/[propertyId]',
    });
  });

  it('archives a property and removes the success message after five seconds', async () => {
    jest.useFakeTimers();
    mockUpdateStatus.mockResolvedValue({ ...property, status: 'archived' });
    const view = await render(<PropertiesScreen />);

    await act(async () => {
      fireEvent.press(view.getByRole('button', { name: 'Archive' }));
    });

    expect(mockUpdateStatus).toHaveBeenCalledWith({
      propertyId: property.property_id,
      status: 'archived',
    });
    expect(view.getByText('Altona home was archived.')).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(4_999);
    });
    expect(view.getByText('Altona home was archived.')).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(view.queryByText('Altona home was archived.')).not.toBeOnTheScreen();
  });

  it('switches to the archived property list', async () => {
    const view = await render(<PropertiesScreen />);

    await fireEvent.press(view.getByRole('tab', { name: 'Archived' }));

    expect(mockUseProperties).toHaveBeenLastCalledWith(mockSession, 'archived');
    expect(view.getByText('No archived properties')).toBeOnTheScreen();
  });
});

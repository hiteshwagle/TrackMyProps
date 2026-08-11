import { fireEvent, render } from '@testing-library/react-native';

import PropertyDetailsScreen from '../app/property/[propertyId]';
import type { Property } from '../src/features/properties/property-api';

const mockPropertyId = '919d97fd-64cb-4eb6-8349-0fc0c78b1285';
const mockCreateCashFlowItem = jest.fn();
const mockDeleteCashFlowItem = jest.fn();
const mockUpdateProperty = jest.fn();

const mockProperty: Property = {
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
  property_id: mockPropertyId,
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

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ propertyId: mockPropertyId }),
}));

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: () => ({
    session: {
      access_token: 'access-token',
      user: { id: 'e8cf2dbf-463e-485f-880d-cdb828749979' },
    },
  }),
}));

jest.mock('../src/features/properties/address-lookup-api', () => ({
  lookupAddressesWithSupabase: jest.fn(),
}));

jest.mock('../src/features/properties/property-api', () => {
  const actual = jest.requireActual('../src/features/properties/property-api');
  return {
    ...actual,
    useProperty: () => ({
      data: mockProperty,
      error: null,
      isError: false,
      isPending: false,
      refetch: jest.fn(),
    }),
    useUpdateProperty: () => ({ isPending: false, mutateAsync: mockUpdateProperty }),
  };
});

jest.mock('../src/features/properties/property-cash-flow-api', () => ({
  useCreatePropertyCashFlowItem: () => ({
    isPending: false,
    mutateAsync: mockCreateCashFlowItem,
  }),
  useDeletePropertyCashFlowItem: () => ({
    isPending: false,
    mutateAsync: mockDeleteCashFlowItem,
  }),
  usePropertyCashFlowItems: () => ({
    data: [],
    error: null,
    isError: false,
    isPending: false,
  }),
}));

describe('PropertyDetailsScreen', () => {
  beforeEach(() => {
    mockCreateCashFlowItem.mockReset();
    mockDeleteCashFlowItem.mockReset();
    mockUpdateProperty.mockReset();
  });

  it('keeps income and expense management on the details page', async () => {
    const view = await render(<PropertyDetailsScreen />);

    expect(view.getByText('Altona home')).toBeOnTheScreen();
    expect(view.getByText('Income sources')).toBeOnTheScreen();
    expect(view.getByText('Expenses')).toBeOnTheScreen();
    expect(view.getByRole('button', { name: 'Add income' })).toBeOnTheScreen();

    await fireEvent.press(view.getByRole('button', { name: 'Add expense' }));

    expect(view.getByRole('button', { name: 'Council rates' })).toBeOnTheScreen();
    expect(view.getByLabelText('Expense name')).toBeOnTheScreen();
    expect(view.getByLabelText('Amount (AUD)')).toBeOnTheScreen();
  });

  it('opens property editing from the details page', async () => {
    const view = await render(<PropertyDetailsScreen />);

    await fireEvent.press(view.getByRole('button', { name: 'Edit property' }));

    expect(view.getByLabelText('Property name')).toHaveDisplayValue('Altona home');
    expect(view.getByLabelText('Purchase date')).toHaveDisplayValue('2024-05-01');
  });
});

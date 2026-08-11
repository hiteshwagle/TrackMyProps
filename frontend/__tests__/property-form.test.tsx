import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';

import type { Property } from '../src/features/properties/property-api';
import { PropertyForm, propertyFormValues } from '../src/features/properties/property-form';

const lookupAddressesMock = jest.fn();

async function fillPropertyDetails(view: Awaited<ReturnType<typeof render>>) {
  await fireEvent.changeText(view.getByLabelText('Property name'), 'Parramatta unit');
  await fireEvent.changeText(view.getByLabelText('Address line 1'), '10 Example Street');
  await fireEvent.changeText(view.getByLabelText('Suburb'), 'Parramatta');
  await fireEvent.changeText(view.getByLabelText('State'), 'NSW');
  await fireEvent.changeText(view.getByLabelText('Postcode'), '2150');
  await fireEvent.changeText(view.getByLabelText('Bedrooms'), '2.5');
  await fireEvent.changeText(view.getByLabelText('Bathrooms'), '1.5');
  await fireEvent.changeText(view.getByLabelText('Car spaces'), '1');
  await fireEvent.changeText(view.getByLabelText('Land area (m²)'), '125.50');
  await fireEvent.changeText(view.getByLabelText('Building area (m²)'), '82.25');
  await fireEvent.changeText(view.getByLabelText('Purchase date'), '2024-05-01');
  await fireEvent.changeText(view.getByLabelText('Purchase price (AUD)'), '650000.00');
}

describe('PropertyForm', () => {
  beforeEach(() => {
    lookupAddressesMock.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not leave the required details step when fields are missing', async () => {
    const view = await render(<PropertyForm onCancel={jest.fn()} onSubmit={jest.fn()} />);

    await fireEvent.press(view.getByRole('button', { name: 'Continue' }));

    expect(await view.findAllByText('This field is required.')).not.toHaveLength(0);
    expect(view.getByText('Property details')).toBeOnTheScreen();
  });

  it('renders purchase date as a date picker on web', async () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    try {
      const view = await render(<PropertyForm onCancel={jest.fn()} onSubmit={jest.fn()} />);

      expect(view.getByLabelText('Purchase date')).toHaveProp('type', 'date');
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    }
  });

  it('submits after the required step while preserving optional finance as unknown', async () => {
    const onSubmit = jest.fn().mockResolvedValue(null);
    const view = await render(<PropertyForm onCancel={jest.fn()} onSubmit={onSubmit} />);

    await fillPropertyDetails(view);
    await fireEvent.press(view.getByRole('button', { name: 'Continue' }));

    expect(await view.findByText('Financial details')).toBeOnTheScreen();
    await fireEvent.press(view.getByRole('button', { name: 'Save property' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          display_name: 'Parramatta unit',
          has_loan: null,
          purchase_price: { amount: '650000.00', currency: 'AUD' },
          remaining_loan_balance: null,
        }),
      );
    });
  });

  it('prefills an existing property for editing', async () => {
    jest.useFakeTimers();
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
      current_value: null,
      current_value_as_of: null,
      display_name: 'Altona home',
      has_loan: null,
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
      remaining_loan_balance: null,
      repayment_amount: null,
      repayment_frequency: null,
      state: 'VIC',
      status: 'archived',
      suburb: 'Altona North',
      updated_at: '2026-08-11T00:00:00Z',
    };

    const view = await render(
      <PropertyForm
        accessToken="user-token"
        initialValues={propertyFormValues(property)}
        onAddressLookup={lookupAddressesMock}
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(view.getByLabelText('Property name')).toHaveDisplayValue('Altona home');
    expect(view.getByLabelText('Purchase date')).toHaveDisplayValue('2024-05-01');
    await act(async () => {
      jest.advanceTimersByTime(1_500);
    });
    expect(lookupAddressesMock).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('waits 1.5 seconds after seven characters and prefills address fields on selection', async () => {
    jest.useFakeTimers();
    lookupAddressesMock.mockResolvedValue([
      {
        address_id: 'GAVIC421626446',
        address_line_1: '21 MARIGOLD AV',
        country: 'Australia',
        formatted_address: '21 MARIGOLD AV, ALTONA NORTH VIC 3025',
        postcode: '3025',
        state: 'VIC',
        suburb: 'ALTONA NORTH',
      },
    ]);
    const view = await render(
      <PropertyForm
        accessToken="user-token"
        onAddressLookup={lookupAddressesMock}
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    await fireEvent.changeText(view.getByLabelText('Find address'), '21 marigold');
    await act(async () => {
      jest.advanceTimersByTime(1499);
    });
    expect(lookupAddressesMock).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(lookupAddressesMock).toHaveBeenCalledWith('21 marigold', 'user-token');

    await fireEvent.press(
      await view.findByRole('button', { name: '21 MARIGOLD AV, ALTONA NORTH VIC 3025' }),
    );
    expect(view.getByLabelText('Address line 1')).toHaveDisplayValue('21 MARIGOLD AV');
    expect(view.getByLabelText('Suburb')).toHaveDisplayValue('ALTONA NORTH');
    expect(view.getByLabelText('State')).toHaveDisplayValue('VIC');
    expect(view.getByLabelText('Postcode')).toHaveDisplayValue('3025');
    jest.useRealTimers();
  });
});

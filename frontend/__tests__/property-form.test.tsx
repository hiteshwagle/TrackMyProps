import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { PropertyForm } from '../src/features/properties/property-form';

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

  it('does not leave the required details step when fields are missing', async () => {
    const view = await render(<PropertyForm onCancel={jest.fn()} onSubmit={jest.fn()} />);

    await fireEvent.press(view.getByRole('button', { name: 'Continue' }));

    expect(await view.findAllByText('This field is required.')).not.toHaveLength(0);
    expect(view.getByText('Property details')).toBeOnTheScreen();
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

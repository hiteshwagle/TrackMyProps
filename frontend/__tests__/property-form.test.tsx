import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { PropertyForm } from '../src/features/properties/property-form';

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
});

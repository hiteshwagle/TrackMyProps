import { fireEvent, render, waitFor } from '@testing-library/react-native';

import SettingsScreen from '../app/(tabs)/settings';

const mockUpdateProfilePhone = jest.fn();

jest.mock('../src/features/auth/auth-context', () => ({
  useAuth: () => ({
    session: {
      user: {
        email: 'owner@example.com',
        user_metadata: { phone: '+61 412 345 678' },
      },
    },
    signOut: jest.fn(),
    updateProfilePhone: mockUpdateProfilePhone,
  }),
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    mockUpdateProfilePhone.mockReset();
    mockUpdateProfilePhone.mockResolvedValue({ error: null });
  });

  it('shows and updates the optional profile phone number', async () => {
    const view = await render(<SettingsScreen />);

    expect(view.getByLabelText('Phone (optional)')).toHaveDisplayValue('+61 412 345 678');

    await fireEvent.changeText(view.getByLabelText('Phone (optional)'), '+61 499 888 777');
    await fireEvent.press(view.getByRole('button', { name: 'Save phone' }));

    await waitFor(() => expect(mockUpdateProfilePhone).toHaveBeenCalledWith('+61 499 888 777'));
    expect(view.getByText('Your phone number was updated.')).toBeOnTheScreen();
  });

  it('rejects an invalid phone number before calling Supabase', async () => {
    const view = await render(<SettingsScreen />);

    await fireEvent.changeText(view.getByLabelText('Phone (optional)'), '12');
    await fireEvent.press(view.getByRole('button', { name: 'Save phone' }));

    expect(
      await view.findByText('Enter a valid phone number or leave it blank.'),
    ).toBeOnTheScreen();
    expect(mockUpdateProfilePhone).not.toHaveBeenCalled();
  });
});

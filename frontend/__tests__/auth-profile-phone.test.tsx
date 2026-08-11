import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { AuthProvider, useAuth } from '../src/features/auth/auth-context';

const mockUpdateUser = jest.fn();
const mockUnsubscribe = jest.fn();
const mockSupabase = {
  auth: {
    getSession: jest.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })),
    startAutoRefresh: jest.fn(),
    stopAutoRefresh: jest.fn(),
    updateUser: mockUpdateUser,
  },
};

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: jest.fn() }),
}));

jest.mock('../src/config/public-config', () => ({
  getAuthConfigurationError: () => null,
  publicConfig: { termsUrl: 'https://example.invalid/terms' },
}));

jest.mock('../src/lib/supabase', () => ({
  getSupabaseClient: () => mockSupabase,
}));

function UpdatePhoneProbe() {
  const { updateProfilePhone } = useAuth();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void updateProfilePhone('  +61 499 888 777  ')}
    >
      <Text>Update profile phone</Text>
    </Pressable>
  );
}

describe('profile phone authentication metadata', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
    mockUpdateUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it('updates phone as profile metadata rather than an authentication phone identity', async () => {
    const view = await render(
      <AuthProvider>
        <UpdatePhoneProbe />
      </AuthProvider>,
    );

    await fireEvent.press(view.getByRole('button', { name: 'Update profile phone' }));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { phone: '+61 499 888 777' },
      }),
    );
  });
});

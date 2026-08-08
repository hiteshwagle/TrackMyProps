import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { SignUpForm, type SignUpValues } from '../src/features/auth/sign-up-form';

async function fillRequiredFields(view: Awaited<ReturnType<typeof render>>) {
  await fireEvent.changeText(view.getByLabelText('Name'), 'Alex Owner');
  await fireEvent.changeText(view.getByLabelText('Email'), 'alex@example.com');
  await fireEvent.changeText(view.getByLabelText('Password'), 'secure-password');
}

describe('SignUpForm', () => {
  it('requires Terms and Conditions acceptance', async () => {
    const onSubmit = jest.fn<Promise<string | null>, [SignUpValues]>().mockResolvedValue(null);
    const view = await render(
      <SignUpForm
        configurationError={null}
        onSubmit={onSubmit}
        termsUrl="https://example.invalid/terms"
      />,
    );

    await fillRequiredFields(view);
    await fireEvent.press(view.getByRole('button', { name: 'Create account' }));

    expect(await view.findByText('Accept the Terms and Conditions to continue.')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid details with an optional phone number omitted', async () => {
    const onSubmit = jest.fn<Promise<string | null>, [SignUpValues]>().mockResolvedValue(null);
    const view = await render(
      <SignUpForm
        configurationError={null}
        onSubmit={onSubmit}
        termsUrl="https://example.invalid/terms"
      />,
    );

    await fillRequiredFields(view);
    await fireEvent.press(view.getByRole('checkbox'));
    await fireEvent.press(view.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'alex@example.com',
        name: 'Alex Owner',
        password: 'secure-password',
        phone: '',
        termsAccepted: true,
      });
    });
  });

  it('disables submission when Supabase is not configured', async () => {
    const view = await render(
      <SignUpForm
        configurationError="Supabase development configuration is missing."
        onSubmit={jest.fn()}
        termsUrl="https://example.invalid/terms"
      />,
    );

    expect(view.getByRole('button', { name: 'Create account' })).toBeDisabled();
    expect(view.getByText('Supabase development configuration is missing.')).toBeOnTheScreen();
  });
});

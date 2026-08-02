import { render } from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  it('renders the Phase 0 application shell', async () => {
    const view = await render(<App />);

    expect(view.getByRole('header', { name: 'TrackMyProps' })).toBeOnTheScreen();
    expect(view.getByText('Phase 0 application scaffold')).toBeOnTheScreen();
  });
});

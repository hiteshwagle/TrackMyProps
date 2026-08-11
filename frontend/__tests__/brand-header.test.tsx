import { render } from '@testing-library/react-native';

import { BrandHeader } from '../src/components/brand-header';

describe('BrandHeader', () => {
  it('shows the TrackMyProps brand and logo', async () => {
    const view = await render(<BrandHeader />);

    expect(view.getByText('TrackMyProps')).toBeOnTheScreen();
    expect(view.getByLabelText('TrackMyProps logo')).toBeOnTheScreen();
  });
});

import { render } from '@testing-library/react-native';

import TabsLayout from '../app/(tabs)/_layout';

const mockTabs = jest.fn();
const mockUseSafeAreaInsets = jest.fn();

jest.mock('expo-router', () => {
  function Tabs(properties: unknown) {
    mockTabs(properties);
    return null;
  }
  function TabScreen() {
    return null;
  }
  Tabs.Screen = TabScreen;
  return { Tabs };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockUseSafeAreaInsets(),
}));

jest.mock('@react-native-vector-icons/feather', () => ({
  Feather: () => null,
}));

describe('TabsLayout', () => {
  beforeEach(() => {
    mockTabs.mockClear();
    mockUseSafeAreaInsets.mockReturnValue({ bottom: 0, left: 0, right: 0, top: 0 });
  });

  it('reserves enough height for mobile labels without a device inset', async () => {
    await render(<TabsLayout />);

    const screenOptions = mockTabs.mock.calls[0]?.[0].screenOptions;
    expect(screenOptions.tabBarLabelStyle.lineHeight).toBe(16);
    expect(screenOptions.tabBarStyle).toMatchObject({ height: 74, paddingBottom: 10 });
  });

  it('adds the device bottom safe-area inset to the tab bar', async () => {
    mockUseSafeAreaInsets.mockReturnValue({ bottom: 34, left: 0, right: 0, top: 0 });

    await render(<TabsLayout />);

    const screenOptions = mockTabs.mock.calls[0]?.[0].screenOptions;
    expect(screenOptions.tabBarStyle).toMatchObject({ height: 98, paddingBottom: 34 });
  });
});

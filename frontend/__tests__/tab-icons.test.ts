import { getTabIconName } from '../src/navigation/tab-icons';

describe('tab icons', () => {
  it.each([
    ['dashboard', 'grid'],
    ['properties', 'home'],
    ['analytics', 'bar-chart-2'],
    ['settings', 'settings'],
  ] as const)('provides the expected icon for %s', (tab, icon) => {
    expect(getTabIconName(tab)).toBe(icon);
  });
});

export type TabName = 'analytics' | 'dashboard' | 'properties' | 'settings';

const tabIcons = {
  analytics: 'bar-chart-2',
  dashboard: 'grid',
  properties: 'home',
  settings: 'settings',
} as const;

export function getTabIconName(tabName: TabName) {
  return tabIcons[tabName];
}

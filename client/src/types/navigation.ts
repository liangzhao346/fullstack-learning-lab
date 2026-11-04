export type TabId = 'products' | 'orders' | 'labs' | 'learn';

export interface NavigationItem {
  id: TabId;
  number: string;
  label: string;
}

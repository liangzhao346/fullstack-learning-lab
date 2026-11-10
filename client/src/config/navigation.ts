/** 侧栏的显示顺序与文案。每个 id 与 App.vue 中的页面映射对应。 */
import type { NavigationItem } from '../types/navigation';

export const navigationItems: NavigationItem[] = [
  { id: 'products', number: '01', label: '商品与库存' },
  { id: 'orders', number: '02', label: '订单与事务' },
  { id: 'labs', number: '03', label: '缓存实验室' },
  { id: 'learn', number: '04', label: '学习地图' },
];

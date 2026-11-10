/** 页签契约。导航配置、工作区的当前选项和 App 的页面映射共用 TabId。 */
export type TabId = 'products' | 'orders' | 'labs' | 'learn';

export interface NavigationItem {
  id: TabId;
  /** 侧栏展示用编号，保留前导零。 */
  number: string;
  label: string;
}

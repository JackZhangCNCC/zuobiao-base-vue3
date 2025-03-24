import { defineStore } from 'pinia'

type DeviceType = 'desktop' | 'mobile';
type ThemeType = 'light' | 'dark';
type SizeType = 'small' | 'default' | 'large';

interface AppState {
  device: DeviceType;
  theme: ThemeType;
  sidebarCollapsed: boolean;
  size: SizeType;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    device: 'desktop',
    theme: 'light',
    sidebarCollapsed: false,
    size: 'default'
  }),
  getters: {
    isMobile: (state): boolean => state.device === 'mobile'
  },
  actions: {
    setDevice(device: DeviceType): void {
      this.device = device
    },
    toggleSidebar(): void {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setSidebarCollapsed(collapsed: boolean): void {
      this.sidebarCollapsed = collapsed
    },
    setTheme(theme: ThemeType): void {
      this.theme = theme
    },
    setSize(size: SizeType): void {
      this.size = size
    }
  },
  persist: true
})

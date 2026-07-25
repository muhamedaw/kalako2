import { create } from 'zustand'

export interface NavigationState {
  activeTab: 'store' | 'voting' | 'play' | 'notifications' | 'profile'
  isSettingsPanelOpen: boolean
  setActiveTab: (tab: NavigationState['activeTab']) => void
  toggleSettingsPanel: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'play',
  isSettingsPanelOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSettingsPanel: () => set((s) => ({ isSettingsPanelOpen: !s.isSettingsPanelOpen })),
}))

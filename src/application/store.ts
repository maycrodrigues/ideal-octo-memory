import { create } from "zustand";

interface AppState {
  tenantId: string;
  isOffline: boolean;
  setTenantId: (id: string) => void;
  setOffline: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tenantId: "default-tenant-123", // Default tenant
  isOffline: !navigator.onLine,
  setTenantId: (id) => set({ tenantId: id }),
  setOffline: (status) => set({ isOffline: status }),
}));

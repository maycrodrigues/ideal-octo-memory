import { useAppStore } from "../../application/store";

export function useTenant() {
  const tenantId = useAppStore((state) => state.tenantId);
  const setTenantId = useAppStore((state) => state.setTenantId);

  return { tenantId, setTenantId };
}

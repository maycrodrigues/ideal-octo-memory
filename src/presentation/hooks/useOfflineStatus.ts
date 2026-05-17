import { useEffect } from "react";
import { useAppStore } from "../../application/store";

export function useOfflineStatus() {
  const isOffline = useAppStore((state) => state.isOffline);
  const setOffline = useAppStore((state) => state.setOffline);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOffline]);

  return isOffline;
}

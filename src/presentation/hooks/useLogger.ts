import { useTenant } from "./useTenant";

export function useLogger(module: string) {
  const { tenantId } = useTenant();

  const log = (action: string, payload?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      tenantId,
      module,
      action,
      payload,
    };
    
    // In a real app, this might be sent to an EventBus or remote observability tool
    console.log(`[ObserviKids] ${JSON.stringify(logEntry)}`);
  };

  return { log };
}

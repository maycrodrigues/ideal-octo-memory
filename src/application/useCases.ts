import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dbAdapter } from "../infrastructure/idbAdapter";
import { Observation } from "../domain/types";
import { AlertAdapter } from "../infrastructure/alertAdapter";

export function useObservations(tenantId: string) {
  return useQuery({
    queryKey: ["observations", tenantId],
    queryFn: () => dbAdapter.getObservations(tenantId),
  });
}

export function useAddObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (observation: Observation) => dbAdapter.saveObservation(observation),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["observations", variables.tenantId] });
      AlertAdapter.success("Anotação Salva", "A atividade foi registrada com sucesso.");
    },
    onError: (error) => {
      console.error(error);
      AlertAdapter.error("Erro ao salvar", "Ocorreu um erro ao salvar a anotação off-line.");
    },
  });
}

export function useDeleteObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dbAdapter.deleteObservation(id),
    onSuccess: (_, id) => {
      // Invalidate specific tenant? Hard to know tenant without payload, we invalidate all 
      // or we can pass tenantId as well.
      queryClient.invalidateQueries({ queryKey: ["observations"] });
    },
    onError: (error) => {
      console.error(error);
      AlertAdapter.error("Erro ao excluir", "Não foi possível excluir o registro.");
    },
  });
}

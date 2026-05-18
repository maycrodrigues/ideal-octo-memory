import React from "react";
import { useObservations, useDeleteObservation } from "../../application/useCases";
import { useTenant } from "../hooks/useTenant";
import { AlertAdapter } from "../../infrastructure/alertAdapter";

export function HistoryPage() {
  const { tenantId } = useTenant();
  const { data: observations, isLoading, error } = useObservations(tenantId);
  const deleteMutation = useDeleteObservation();

  const handleDelete = async (id: string) => {
    const confirmed = await AlertAdapter.confirm(
      "Excluir Observação?",
      "Esta ação não pode ser desfeita e removerá o registro local."
    );
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-indigo-400 font-black uppercase tracking-widest text-sm">Carregando histórico...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-black uppercase tracking-widest text-sm">Erro ao carregar os dados.</div>;
  if (!observations?.length) return <div className="p-8 text-center text-indigo-400 font-black uppercase tracking-widest text-sm">Nenhum registro encontrado.</div>;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <h2 className="text-2xl font-black text-indigo-900 mb-8">Histórico de Atividades</h2>
      <div className="space-y-6">
        {observations.map((obs) => {
          const isMiguelOnly = obs.children.length === 1 && obs.children[0] === "Miguel";
          const isMarianaOnly = obs.children.length === 1 && obs.children[0] === "Mariana";
          
          let cardClasses = "bg-white border-indigo-600 shadow-[8px_8px_0px_0px_#4338ca]";
          let textClasses = "text-indigo-900";
          let dateClasses = "text-indigo-400";
          let childTagClasses = "bg-indigo-50 border-indigo-100 text-indigo-900";
          
          if (isMarianaOnly) {
            cardClasses = "bg-pink-50 border-pink-500 shadow-[8px_8px_0px_0px_#ec4899]";
            textClasses = "text-pink-900";
            dateClasses = "text-pink-500";
            childTagClasses = "bg-pink-100 border-pink-200 text-pink-900";
          } else if (isMiguelOnly) {
            cardClasses = "bg-blue-50 border-blue-500 shadow-[8px_8px_0px_0px_#3b82f6]";
            textClasses = "text-blue-900";
            dateClasses = "text-blue-500";
            childTagClasses = "bg-blue-100 border-blue-200 text-blue-900";
          }

          return (
          <article
            key={obs.id}
            className={`p-6 rounded-[32px] border-4 transition-transform hover:-translate-y-1 ${cardClasses}`}
          >
            <div className="flex flex-col sm:flex-row gap-6">
              {obs.photoBase64 && (
                <div
                  className="w-full sm:w-32 h-32 shrink-0 rounded-2xl bg-white border-4 border-white/50 overflow-hidden shadow-sm"
                >
                  <img src={obs.photoBase64} alt="Atividade" className="object-cover w-full h-full" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${dateClasses}`}>
                      {new Date(obs.timestamp).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })} • 
                      {" "}{new Date(obs.timestamp).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                    </span>
                    <h3 className={`text-xl font-black leading-tight ${textClasses}`}>
                      {obs.activity}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDelete(obs.id)}
                    className="text-slate-400 hover:text-red-500 bg-white/50 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0 ml-2"
                    title="Excluir"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {!obs.isReport && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {obs.children.map(child => {
                       const status = obs.childStatuses?.[child];
                       const hasStatus = !!(status?.mood || status?.wellBeing);
                       return (
                         <div key={child} className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-xl ${childTagClasses}`}>
                           <span className="text-[10px] font-black uppercase tracking-widest">{child}</span>
                           {hasStatus && (
                             <>
                                <span className="opacity-40">•</span>
                                {status?.mood && <span className="text-[10px] font-bold opacity-80">{status.mood}</span>}
                                {(status?.mood && status?.wellBeing) && <span className="opacity-40">•</span>}
                                {status?.wellBeing && <span className="text-[10px] font-bold opacity-80">{status.wellBeing}</span>}
                             </>
                           )}
                         </div>
                       )
                    })}
                  </div>
                )}

                {obs.isReport && (
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-yellow-400 text-yellow-900 border-2 border-yellow-500 font-black text-[10px] uppercase tracking-widest rounded-md">
                      Relatório Gerado
                    </span>
                  </div>
                )}

                {obs.notes && (
                  <div className={`text-sm font-medium leading-relaxed p-4 rounded-2xl border-2 mb-4 ${obs.isReport ? 'bg-indigo-50 border-indigo-100 text-indigo-900 whitespace-pre-wrap font-serif italic' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                    {obs.notes}
                  </div>
                )}

                {obs.location && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/50 rounded-xl border-2 border-black/5 text-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <a 
                      href={`https://www.google.com/maps?q=${obs.location.lat},${obs.location.lng}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs font-black uppercase tracking-wider hover:underline"
                    >
                      Ver no Mapa
                    </a>
                  </div>
                )}
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}

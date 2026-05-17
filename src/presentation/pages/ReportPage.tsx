import React, { useMemo } from "react";
import { ulid } from "ulid";
import { useObservations } from "../../application/useCases";
import { useTenant } from "../hooks/useTenant";
import { AlertAdapter } from "../../infrastructure/alertAdapter";
import { ChildSchema, Observation } from "../../domain/types";

export function ReportPage() {
  const { tenantId } = useTenant();
  const { data: observations, isLoading } = useObservations(tenantId);

  const reportsByDay = useMemo(() => {
    if (!observations) return [];

    // Group observations by day
    const grouped = observations.reduce((acc, obs) => {
      // Ignore manually saved reports if they exist from previous versions
      if (obs.isReport) return acc;

      const date = new Date(obs.timestamp);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.getTime();

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(obs);
      return acc;
    }, {} as Record<number, Observation[]>);

    return Object.entries(grouped)
      .map(([dateKeyStr, obsList]) => {
        const dateKey = parseInt(dateKeyStr, 10);
        const date = new Date(dateKey);
        const dayOfWeek = date.toLocaleDateString("pt-BR", { weekday: 'long' });
        const dayOfMonth = date.getDate().toString().padStart(2, '0');
        const formattedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
        
        let reportText = `${formattedDayOfWeek}, dia ${dayOfMonth}\n\n`;

        const formatAct = (obs: Observation, child: string) => {
          const time = new Date(obs.timestamp).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
          const status = obs.childStatuses?.[child];
          let statusStr = "";
          if (status?.mood && status?.wellBeing) {
            statusStr = ` (Humor: ${status.mood}, Bem-estar: ${status.wellBeing})`;
          } else if (status?.mood) {
            statusStr = ` (Humor: ${status.mood})`;
          } else if (status?.wellBeing) {
            statusStr = ` (Bem-estar: ${status.wellBeing})`;
          }
           return `* [${time}] ${obs.activity}${statusStr}${obs.notes ? ` - ${obs.notes}` : ''}`;
        };
        
        // Reverse to show oldest to newest inside the daily report
        const reversedObs = [...obsList].reverse();

        const marianaObs = reversedObs.filter(o => o.children.includes("Mariana"));
        if (marianaObs.length > 0) {
          reportText += `MARIANA:\n`;
          marianaObs.forEach(obs => {
             reportText += `${formatAct(obs, "Mariana")}\n`;
          });
          reportText += `\n`;
        }
        
        const miguelObs = reversedObs.filter(o => o.children.includes("Miguel"));
        if (miguelObs.length > 0) {
          reportText += `MIGUEL:\n`;
          miguelObs.forEach(obs => {
            reportText += `${formatAct(obs, "Miguel")}\n`;
          });
        }

        return {
          dateKey,
          reportText: reportText.trim(),
          dateStr: `${formattedDayOfWeek}, ${dayOfMonth}`
        };
      })
      .sort((a, b) => b.dateKey - a.dateKey); // Newest days first
  }, [observations]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    AlertAdapter.success("Copiado!", "Relatório copiado para a área de transferência.");
  };

  const handleWhatsApp = (text: string) => {
    if (!text) return;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  if (isLoading) {
    return <div className="p-8 text-center text-indigo-400 font-black uppercase tracking-widest text-sm">Carregando relatórios...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-8">
      <div className="bg-indigo-900 rounded-[40px] shadow-[8px_8px_0px_0px_#4338ca] border-4 border-indigo-600 p-8 text-white flex gap-4 items-center">
         <div className="w-14 h-14 bg-indigo-700 rounded-2xl flex items-center justify-center border-4 border-indigo-600 shrink-0">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-white italic leading-tight">Relatórios Diários</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mt-1">
            Gerados automaticamente
          </p>
        </div>
      </div>

      {reportsByDay.length === 0 ? (
         <div className="p-8 text-center text-indigo-400 font-black uppercase tracking-widest text-sm">Nenhum relatório disponível.</div>
      ) : (
        <div className="space-y-6">
          {reportsByDay.map(report => (
            <div key={report.dateKey} className="bg-white rounded-[40px] p-8 border-4 border-indigo-100 shadow-[8px_8px_0px_0px_#e0e7ff]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-indigo-900 leading-tight">{report.dateStr}</h3>
              </div>
              
              <div className="bg-slate-50 rounded-3xl p-6 border-4 border-slate-100 font-serif leading-relaxed text-sm text-slate-700 whitespace-pre-wrap mb-6">
                {report.reportText}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleCopy(report.reportText)}
                  className="py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-xs rounded-2xl transition-colors uppercase tracking-widest border-2 border-indigo-100"
                >
                  Copiar Texto
                </button>
                <button 
                  onClick={() => handleWhatsApp(report.reportText)}
                  className="py-3 bg-green-500 hover:bg-green-600 text-white font-black text-xs rounded-2xl transition-colors uppercase tracking-widest shadow-[4px_4px_0px_0px_#166534] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  Enviar via WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

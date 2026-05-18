import React, { useEffect, useMemo, useState } from "react";
import { useObservations } from "../../application/useCases";
import { useTenant } from "../hooks/useTenant";
import { AlertAdapter } from "../../infrastructure/alertAdapter";
import { Observation } from "../../domain/types";

type ChildFilter = "both" | "mariana" | "miguel";

type DayReport = {
  dateKey: number;
  dateStr: string;
  textByChild: Record<ChildFilter, string>;
};

export function ReportPage() {
  const { tenantId } = useTenant();
  const { data: observations, isLoading } = useObservations(tenantId);

  const dayReports = useMemo<DayReport[]>(() => {
    if (!observations) return [];

    const grouped = observations.reduce((acc, obs) => {
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

    const formatAct = (obs: Observation, time: string, child: string) => {
      const status = obs.childStatuses?.[child];
      let statusStr = "";
      if (status?.mood && status?.wellBeing) {
        statusStr = ` (Humor: ${status.mood}, Bem-estar: ${status.wellBeing})`;
      } else if (status?.mood) {
        statusStr = ` (Humor: ${status.mood})`;
      } else if (status?.wellBeing) {
        statusStr = ` (Bem-estar: ${status.wellBeing})`;
      }

      const timeStr = `_[${time}]_`;
      const notesStr = obs.notes ? ` - ${obs.notes}` : "";
      return `${timeStr}${statusStr} - ${obs.activity}${notesStr}`;
    };

    const buildDayText = (
      headerText: string,
      lines: { mariana: string[]; miguel: string[] },
      childFilter: ChildFilter
    ) => {
      const blocks: string[] = [headerText];

      if (childFilter === "both" || childFilter === "mariana") {
        if (lines.mariana.length > 0) {
          blocks.push(`*MARIANA*:\n${lines.mariana.join("\n")}`);
        }
      }

      if (childFilter === "both" || childFilter === "miguel") {
        if (lines.miguel.length > 0) {
          blocks.push(`*MIGUEL*:\n${lines.miguel.join("\n")}`);
        }
      }

      if (blocks.length === 1) return "";
      return blocks.join("\n\n");
    };

    return Object.entries(grouped)
      .map(([dateKeyStr, obsList]) => {
        const dateKey = parseInt(dateKeyStr, 10);
        const date = new Date(dateKey);
        const dayOfWeek = date.toLocaleDateString("pt-BR", { weekday: "long" });
        const dayOfMonth = date.getDate().toString().padStart(2, "0");
        const formattedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

        const headerText = `*${formattedDayOfWeek}, dia ${dayOfMonth}*`;

        const reversedObs = [...obsList].reverse();

        const marianaLines = reversedObs
          .filter((o) => o.children.includes("Mariana"))
          .map((obs) => {
            const time = new Date(obs.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            return formatAct(obs, time, "Mariana");
          });

        const miguelLines = reversedObs
          .filter((o) => o.children.includes("Miguel"))
          .map((obs) => {
            const time = new Date(obs.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            return formatAct(obs, time, "Miguel");
          });

        const lines = { mariana: marianaLines, miguel: miguelLines };

        return {
          dateKey,
          dateStr: `${formattedDayOfWeek}, ${dayOfMonth}`,
          textByChild: {
            both: buildDayText(headerText, lines, "both"),
            mariana: buildDayText(headerText, lines, "mariana"),
            miguel: buildDayText(headerText, lines, "miguel"),
          },
        };
      })
      .sort((a, b) => b.dateKey - a.dateKey);
  }, [observations]);

  const [childFilter, setChildFilter] = useState<ChildFilter>("both");
  const [selectedDateKeys, setSelectedDateKeys] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (dayReports.length === 0) return;
    setSelectedDateKeys((prev) => {
      if (prev.size > 0) return prev;
      return new Set([dayReports[0].dateKey]);
    });
  }, [dayReports]);

  const visibleDayReports = useMemo(() => {
    if (selectedDateKeys.size === 0) return [];
    return dayReports
      .filter((r) => selectedDateKeys.has(r.dateKey))
      .filter((r) => (r.textByChild[childFilter] || "").trim().length > 0);
  }, [dayReports, selectedDateKeys, childFilter]);

  const combinedReportText = useMemo(() => {
    if (visibleDayReports.length === 0) return "";
    const sortedByOldest = [...visibleDayReports].sort((a, b) => a.dateKey - b.dateKey);
    return sortedByOldest.map((r) => r.textByChild[childFilter]).join("\n\n");
  }, [visibleDayReports, childFilter]);

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

      {dayReports.length === 0 ? (
        <div className="p-8 text-center text-indigo-400 font-black uppercase tracking-widest text-sm">Nenhum relatório disponível.</div>
      ) : (
        <div className="space-y-6">
          <section className="bg-white rounded-[40px] p-8 border-4 border-indigo-100 shadow-[8px_8px_0px_0px_#e0e7ff]">
            <h3 className="text-xl font-black text-indigo-900 leading-tight mb-6">Filtros</h3>

            <fieldset className="mb-6">
              <legend className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Mostrar de quem
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  aria-pressed={childFilter === "mariana"}
                  onClick={() => setChildFilter("mariana")}
                  className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-colors ${
                    childFilter === "mariana"
                      ? "bg-pink-500 text-white border-pink-500 shadow-[4px_4px_0px_0px_#be185d]"
                      : "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100"
                  }`}
                >
                  Mariana
                </button>
                <button
                  type="button"
                  aria-pressed={childFilter === "miguel"}
                  onClick={() => setChildFilter("miguel")}
                  className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-colors ${
                    childFilter === "miguel"
                      ? "bg-blue-500 text-white border-blue-500 shadow-[4px_4px_0px_0px_#1d4ed8]"
                      : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                  }`}
                >
                  Miguel
                </button>
                <button
                  type="button"
                  aria-pressed={childFilter === "both"}
                  onClick={() => setChildFilter("both")}
                  className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-colors ${
                    childFilter === "both"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-[4px_4px_0px_0px_#4338ca]"
                      : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                  }`}
                >
                  Os dois
                </button>
              </div>
            </fieldset>

            <fieldset>
              <legend className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Selecionar dias para agrupar
              </legend>

              <div className="flex justify-end gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedDateKeys(new Set(dayReports.map((r) => r.dateKey)))}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 bg-white hover:bg-slate-50 border-slate-100 text-slate-700"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDateKeys(new Set())}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 bg-white hover:bg-slate-50 border-slate-100 text-slate-700"
                >
                  Limpar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dayReports.map((r) => {
                  const checked = selectedDateKeys.has(r.dateKey);
                  return (
                    <label
                      key={r.dateKey}
                      className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedDateKeys((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(r.dateKey);
                            else next.delete(r.dateKey);
                            return next;
                          });
                        }}
                        className="h-5 w-5 accent-indigo-600"
                      />
                      <span className="text-sm font-black text-slate-800">{r.dateStr}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </section>

          {combinedReportText ? (
            <div className="bg-white rounded-[40px] p-8 border-4 border-indigo-100 shadow-[8px_8px_0px_0px_#e0e7ff]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-indigo-900 leading-tight">Mensagem Agrupadas</h3>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border-4 border-slate-100 font-serif leading-relaxed text-sm text-slate-700 whitespace-pre-wrap mb-6">
                {combinedReportText}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleCopy(combinedReportText)}
                  className="py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-xs rounded-2xl transition-colors uppercase tracking-widest border-2 border-indigo-100"
                >
                  Copiar Tudo
                </button>
                <button
                  onClick={() => handleWhatsApp(combinedReportText)}
                  className="py-3 bg-green-500 hover:bg-green-600 text-white font-black text-xs rounded-2xl transition-colors uppercase tracking-widest shadow-[4px_4px_0px_0px_#166534] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  Enviar Tudo via WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-indigo-400 font-black uppercase tracking-widest text-sm">
              Nenhum conteúdo para os filtros selecionados.
            </div>
          )}

          {visibleDayReports.map((report) => (
            <div key={report.dateKey} className="bg-white rounded-[40px] p-8 border-4 border-indigo-100 shadow-[8px_8px_0px_0px_#e0e7ff]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-indigo-900 leading-tight">{report.dateStr}</h3>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border-4 border-slate-100 font-serif leading-relaxed text-sm text-slate-700 whitespace-pre-wrap mb-6">
                {report.textByChild[childFilter]}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleCopy(report.textByChild[childFilter])}
                  className="py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-xs rounded-2xl transition-colors uppercase tracking-widest border-2 border-indigo-100"
                >
                  Copiar Texto
                </button>
                <button
                  onClick={() => handleWhatsApp(report.textByChild[childFilter])}
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

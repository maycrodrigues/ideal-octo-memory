import React, { useState } from "react";
import { ulid } from "ulid";
import { Child, Location, ObservationSchema, ChildSchema, MoodSchema, WellBeingSchema, ChildStatus } from "../../domain/types";
import { useLogger } from "../hooks/useLogger";
import { useTenant } from "../hooks/useTenant";
import { useAddObservation } from "../../application/useCases";
import { LocationPicker } from "../components/LocationPicker";
import { PhotoUploader } from "../components/PhotoUploader";
import { AlertAdapter } from "../../infrastructure/alertAdapter";
import { cn } from "../../lib/utils";

export function AddObservationPage() {
  const { log } = useLogger("AddObservationPage");
  const { tenantId } = useTenant();
  const addMutation = useAddObservation();

  const [children, setChildren] = useState<Child[]>([]);
  const [childStatuses, setChildStatuses] = useState<Partial<Record<Child, ChildStatus>>>({});
  const [activity, setActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [dateString, setDateString] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const toggleChild = (child: Child) => {
    setChildren((prev) => {
      const isSelected = prev.includes(child);
      if (isSelected) {
        const newStatuses = { ...childStatuses };
        delete newStatuses[child];
        setChildStatuses(newStatuses);
        return prev.filter((c) => c !== child);
      } else {
        return [...prev, child];
      }
    });
  };

  const updateChildStatus = (child: Child, field: keyof ChildStatus, value: string) => {
    setChildStatuses(prev => ({
      ...prev,
      [child]: {
        ...prev[child],
        [field]: value
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (children.length === 0) {
      AlertAdapter.error("Obrigatório", "Selecione pelo menos uma criança.");
      return;
    }
    if (!activity.trim()) {
      AlertAdapter.error("Obrigatório", "Informe a atividade principal.");
      return;
    }

    const newObservation = {
      id: ulid(),
      tenantId,
      children,
      childStatuses,
      activity,
      notes,
      location,
      photoBase64,
      timestamp: new Date(dateString).getTime() || Date.now(),
    };

    const parsed = ObservationSchema.safeParse(newObservation);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\\n');
      AlertAdapter.error("Dados Inválidos", errorMsg);
      console.error(parsed.error);
      return;
    }

    log("add_observation", { activity, children, childStatuses });
    
    await addMutation.mutateAsync(parsed.data);
    
    // Reset form
    setChildren([]);
    setChildStatuses({});
    setActivity("");
    setNotes("");
    setLocation(undefined);
    setPhotoBase64(undefined);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDateString(now.toISOString().slice(0, 16));
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="bg-white rounded-[40px] border-4 border-indigo-600 shadow-[8px_8px_0px_0px_#4338ca] p-6 sm:p-8">
        <h2 className="text-2xl font-black text-indigo-900 mb-8">Nova Observação</h2>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Crianças envolvidas */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Crianças presentes e Estado (Humor / Bem-Estar)
            </label>
            <div className="flex flex-col gap-4">
              {ChildSchema.options.map((child) => {
                const isSelected = children.includes(child);
                return (
                  <div
                    key={child}
                    className={cn(
                      "flex flex-col p-4 rounded-3xl border-4 transition-colors",
                      isSelected
                        ? "bg-indigo-50 border-indigo-600 shadow-[4px_4px_0px_0px_#4338ca]"
                        : "bg-white border-indigo-50 hover:border-indigo-200 cursor-pointer"
                    )}
                  >
                    <div 
                      className="flex items-center gap-4 cursor-pointer" 
                      onClick={() => toggleChild(child)}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full border-4 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xl",
                        isSelected ? "border-indigo-200 bg-indigo-600 text-white" : "border-indigo-100 bg-blue-100 text-blue-500"
                      )}>
                        {child.charAt(0)}
                      </div>
                      <div>
                        <h3 className={cn("font-black text-lg leading-none", isSelected ? "text-indigo-900" : "text-indigo-300")}>{child}</h3>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t-2 border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2">Humor</label>
                          <div className="flex flex-wrap gap-2">
                            {MoodSchema.options.map(mood => (
                              <button
                                type="button"
                                key={mood}
                                onClick={() => updateChildStatus(child, 'mood', mood)}
                                className={cn(
                                  "px-3 py-1 text-xs font-bold rounded-full border-2 transition-all",
                                  childStatuses[child]?.mood === mood
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "bg-white border-indigo-100 text-indigo-500 hover:border-indigo-300"
                                )}
                              >
                                {mood}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2">Bem-estar</label>
                          <div className="flex flex-wrap gap-2">
                            {WellBeingSchema.options.map(wb => (
                              <button
                                type="button"
                                key={wb}
                                onClick={() => updateChildStatus(child, 'wellBeing', wb)}
                                className={cn(
                                  "px-3 py-1 text-xs font-bold rounded-full border-2 transition-all",
                                  childStatuses[child]?.wellBeing === wb
                                    ? "bg-pink-500 border-pink-500 text-white"
                                    : "bg-white border-pink-100 text-pink-500 hover:border-pink-300"
                                )}
                              >
                                {wb}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data e Hora */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Data e Horário do Registro
            </label>
            <input
              type="datetime-local"
              value={dateString}
              onChange={(e) => setDateString(e.target.value)}
              className="w-full text-lg font-bold text-indigo-900 focus:outline-none p-5 rounded-2xl border-4 border-indigo-50 focus:border-indigo-200 bg-indigo-50/30 transition-colors"
            />
          </div>

          {/* Atividade */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Atividade Principal
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Ex: Brincando no parquinho..."
              className="w-full text-lg font-bold text-indigo-900 placeholder-indigo-200 focus:outline-none p-5 rounded-2xl border-4 border-indigo-50 focus:border-indigo-200 bg-indigo-50/30 transition-colors"
            />
          </div>

          {/* Notas Extras */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Detalhes (Como estão? O que aconteceu?)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações extras sobre o momento..."
              className="w-full text-base font-medium text-slate-700 placeholder-slate-300 focus:outline-none p-5 rounded-2xl border-4 border-slate-50 focus:border-slate-200 bg-slate-50/50 transition-colors resize-none"
            />
          </div>

          {/* Localização e Foto em Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Localização (Opcional)
              </label>
              <div className="rounded-3xl border-4 border-indigo-50 bg-indigo-50/10 p-4">
                <LocationPicker onLocationSelected={setLocation} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Foto (Opcional)
              </label>
              <div className="rounded-3xl border-4 border-indigo-50 bg-indigo-50/10 h-[264px] flex items-center justify-center p-4">
                 <PhotoUploader key={addMutation.isSuccess ? 'success' : 'upload'} onPhotoSelected={setPhotoBase64} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-black text-lg rounded-2xl shadow-[4px_4px_0px_0px_#831843] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:bg-slate-300 disabled:shadow-none disabled:translate-x-1 disabled:translate-y-1 uppercase tracking-widest"
            >
              {addMutation.isPending ? "SALVANDO..." : "SALVAR OBSERVAÇÃO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

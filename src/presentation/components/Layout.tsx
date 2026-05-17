import React, { useState } from "react";
import { AddObservationPage } from "../pages/AddObservationPage";
import { HistoryPage } from "../pages/HistoryPage";
import { ReportPage } from "../pages/ReportPage";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { cn } from "../../lib/utils";
import { PlusCircle, Clock, FileText } from "lucide-react";

export function Layout() {
  const [activeTab, setActiveTab] = useState<"add" | "history" | "report">("add");
  const isOffline = useOfflineStatus();

  return (
    <div className="min-h-screen bg-[#FFFBF0] font-sans flex flex-col overflow-x-hidden">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-yellow-500 text-yellow-900 border-b-4 border-yellow-600 text-xs font-black uppercase tracking-widest px-4 py-2 text-center">
          Você está offline. Observações salvas localmente.
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b-4 border-yellow-400 shrink-0">
        <div className="max-w-5xl mx-auto px-6 h-24 flex flex-col justify-center">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-[4px_4px_0px_0px_#4338ca]">
                O
              </div>
              <div>
                <h1 className="text-2xl font-black text-indigo-900 leading-none tracking-tight">ObserviKids</h1>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Acompanhamento Diário</p>
              </div>
            </div>
            
            <div className="hidden sm:flex gap-4 items-center">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border-2 border-indigo-100">
                <span className={cn("w-3 h-3 rounded-full", isOffline ? "bg-red-500" : "bg-green-500")}></span>
                <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">
                  {isOffline ? "Offline" : "Sincronizado"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation (Desktop) */}
      <div className="bg-white border-b-4 border-indigo-100 hidden sm:block">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex gap-4 py-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("add")}
              className={cn(
                "px-6 py-3 text-sm font-black uppercase tracking-widest rounded-2xl transition-all",
                activeTab === "add"
                  ? "bg-indigo-600 text-white shadow-[4px_4px_0px_0px_#4338ca] -translate-y-1"
                  : "bg-indigo-50 text-indigo-400 hover:bg-indigo-100 border-2 border-transparent"
              )}
            >
              Nova Anotação
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-6 py-3 text-sm font-black uppercase tracking-widest rounded-2xl transition-all",
                activeTab === "history"
                  ? "bg-indigo-600 text-white shadow-[4px_4px_0px_0px_#4338ca] -translate-y-1"
                  : "bg-indigo-50 text-indigo-400 hover:bg-indigo-100 border-2 border-transparent"
              )}
            >
              Histórico
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={cn(
                "px-6 py-3 text-sm font-black uppercase tracking-widest rounded-2xl transition-all",
                activeTab === "report"
                  ? "bg-pink-500 text-white shadow-[4px_4px_0px_0px_#831843] -translate-y-1"
                  : "bg-pink-50 text-pink-400 hover:bg-pink-100 border-2 border-transparent"
              )}
            >
              Relatórios
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 pb-32 sm:p-8 sm:pb-8">
        {activeTab === "add" && <AddObservationPage />}
        {activeTab === "history" && <HistoryPage />}
        {activeTab === "report" && <ReportPage />}
      </main>

      {/* Navigation (Mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-indigo-100 p-3 z-50 rounded-t-3xl shadow-[0px_-8px_20px_rgba(0,0,0,0.05)]">
        <nav className="flex justify-between gap-2 max-w-md mx-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("add")}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all",
              activeTab === "add"
                ? "bg-indigo-600 text-white shadow-[0px_4px_0px_0px_#4338ca] -translate-y-1"
                : "bg-transparent text-indigo-300 hover:bg-indigo-50 border-2 border-transparent"
            )}
          >
            <PlusCircle className="w-6 h-6 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-widest">Anotar</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all",
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-[0px_4px_0px_0px_#4338ca] -translate-y-1"
                : "bg-transparent text-indigo-300 hover:bg-indigo-50 border-2 border-transparent"
            )}
          >
            <Clock className="w-6 h-6 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-widest">Histórico</span>
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all",
              activeTab === "report"
                ? "bg-pink-500 text-white shadow-[0px_4px_0px_0px_#831843] -translate-y-1"
                : "bg-transparent text-pink-300 hover:bg-pink-50 border-2 border-transparent"
            )}
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-widest">Relatórios</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

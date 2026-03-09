import React, { useState, useEffect } from "react";
import { FileText, ArrowDownLeft, ArrowUpRight, Loader2, Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const API_HISTORY = "https://nexstore-tz6u.onrender.com/api/sales/history";

export default function Reports() {
  const [logs, setLogs] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(API_HISTORY);
        if (Array.isArray(response.data)) {
          setLogs(response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
        toast.error("Erro ao carregar histórico");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const fmtDate = (date) => {
    if (!date) return "Data N/A";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const fmtCurrency = (v) => {
    return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
      <p>Carregando registros da EletroCelo...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Relatórios de Atividade</h2>
            <p className="text-xs md:text-sm text-slate-500">Histórico de vendas e movimentações de estoque</p>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2">
            <Calendar size={14} className="text-emerald-500" />
            MARÇO 2026
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[750px] border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-32">Data/Hora</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-28">Evento</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Produto</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-20">Qtd</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right w-32">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length > 0 ? (
                  logs.map((log) => {
                    const isSale = log.totalPrice > 0;
                    return (
                      <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">{fmtDate(log.soldAt)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {isSale ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 bg-red-100 text-red-600 rounded-md w-fit">
                              <ArrowDownLeft size={12} /> Saída
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md w-fit">
                              <ArrowUpRight size={12} /> Entrada
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-slate-700 whitespace-nowrap">{log.productName}</td>
                        <td className={`px-4 py-4 text-center text-xs font-bold whitespace-nowrap ${isSale ? 'text-slate-600' : 'text-emerald-600'}`}>
                          {isSale ? `-${log.quantity}` : `+${log.quantity}`}
                        </td>
                        <td className="px-4 py-4 text-right text-xs font-bold text-slate-800 whitespace-nowrap">
                          {isSale ? fmtCurrency(log.totalPrice) : "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>Nenhuma movimentação encontrada.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
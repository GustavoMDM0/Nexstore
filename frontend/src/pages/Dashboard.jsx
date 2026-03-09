import React, { useState, useEffect } from "react";
import { DollarSign, Package, AlertTriangle, BarChart3, Loader2 } from "lucide-react"; 
import api from "../api/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/products/stats/dashboard"),
          api.get("/sales/history")
        ]);

        setStats(statsRes.data);

        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return {
            date: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
            fullDate: d.toISOString().split('T')[0],
            total: 0
          };
        }).reverse();

        historyRes.data.forEach(sale => {
          if (sale.totalPrice > 0) {
            const saleDate = new Date(sale.soldAt).toISOString().split('T')[0];
            const dayEntry = last7Days.find(d => d.fullDate === saleDate);
            if (dayEntry) {
              dayEntry.total += sale.totalPrice;
            }
          }
        });

        setChartData(last7Days);
      } catch (err) {
        console.error("Erro ao carregar dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-500">
      <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
      <p className="animate-pulse">Sincronizando com EletroCelo...</p>
    </div>
  );

  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
        <p className="text-sm md:text-base text-slate-500">Gestão de Inventário - EletroCelo Hub</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Valor em Estoque</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-1">{fmt(stats?.totalStockValue || 0)}</h3>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Vendas do Mês</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-1">{fmt(stats?.monthlyRevenue || 0)}</h3>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Estoque Baixo</p>
          <h3 className="text-xl md:text-2xl font-black text-red-600 mt-1">{stats?.lowStockCount || 0}</h3>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Produtos</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-1">{stats?.totalProducts || 0}</h3>
        </div>
      </div>

      <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-base md:text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart3 className="text-emerald-500" size={20} /> Vendas da Semana
        </h3>
        <div className="h-72 md:h-80 w-full overflow-x-auto">
          <div className="h-full min-w-[500px] md:min-w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [fmt(value), "Vendas"]}
                />
                <Bar dataKey="total" fill="#047857" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
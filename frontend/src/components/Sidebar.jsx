import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, Zap, X } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Inventário", path: "/inventario" },
  { icon: ShoppingCart, label: "Vendas", path: "/vendas" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay: agora com z-index maior para cobrir tudo no mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] text-slate-400 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        <div className="p-6 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Zap size={18} fill="currentColor" className="text-slate-900" />
              </div>
              NexStock
            </h1>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-bold">EletroCelo Hub</p>
          </div>
          
          {/* Botão para fechar interno (apenas mobile) */}
          <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.label}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {isActive && <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full" />}
                <item.icon size={20} style={{ color: isActive ? '#34d399' : 'inherit' }} />
                <span className={`text-sm font-semibold ${isActive ? 'text-emerald-400' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl cursor-pointer">
            <Settings size={20} />
            <span className="text-sm font-semibold">Configurações</span>
          </div>
        </div>
      </div>
    </>
  );
}
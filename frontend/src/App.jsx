import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales'; 
import Reports from './pages/Reports'; 
import { Toaster } from 'sonner';
import { Menu, Zap } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] flex items-center justify-between px-6 z-50 border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Zap size={18} fill="currentColor" className="text-slate-900" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">NexStock</span>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700"
          >
            <Menu size={24} />
          </button>
        </header>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 min-w-0 pt-16 lg:pt-0">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventario" element={<Inventory />} />
              <Route path="/vendas" element={<Sales />} />
              <Route path="/relatorios" element={<Reports />} />
            </Routes>
        </main>

        <Toaster position="top-right" richColors closeButton />
      </div>
    </Router>
  );
}

export default App;
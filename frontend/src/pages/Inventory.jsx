import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Trash2, Loader2, X, Edit3 } from "lucide-react";
import { toast } from "sonner";
import api from "../api/api";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [oldStockValue, setOldStockValue] = useState(0);

  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", category: "Smartphones", costPrice: 0,
    sellPrice: "", currentStock: "", minStock: 1
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products/all");
      setProducts(response.data);
    } catch (error) {
      toast.error("Erro ao carregar dados do inventário");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openEditModal = (p) => {
    setEditingId(p._id);
    setOldStockValue(p.currentStock);
    setNewProduct({
      name: p.name,
      sku: p.sku,
      category: p.category || "Smartphones",
      costPrice: p.costPrice || 0,
      sellPrice: p.sellPrice,
      currentStock: p.currentStock,
      minStock: p.minStock
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { _id, __v, createdAt, updatedAt, ...dataToSave } = newProduct;

      if (editingId) {
        await api.put(`/products/update/${editingId}`, dataToSave);

        const newStockValue = Number(dataToSave.currentStock);
        if (newStockValue > oldStockValue) {
          const diff = newStockValue - oldStockValue;
          await api.post("/sales/log-activity", {
            productId: editingId,
            productName: dataToSave.name,
            quantity: diff,
            note: "Entrada manual via edição"
          });
        }
        toast.success("Produto atualizado!");
      } else {
        const response = await api.post("/products/add", dataToSave);
        await api.post("/sales/log-activity", {
          productId: response.data._id,
          productName: dataToSave.name,
          quantity: dataToSave.currentStock,
          note: "Estoque inicial (Novo Produto)"
        });
        toast.success("Produto cadastrado!");
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setNewProduct({ name: "", sku: "", category: "Smartphones", costPrice: 0, sellPrice: "", currentStock: "", minStock: 1 });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro na operação");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Excluir ${name}?`)) return;
    try {
      await api.delete(`/products/delete/${id}`);
      toast.success("Removido!");
      fetchProducts();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  const filtered = useMemo(() =>
    products.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    ), [products, search]
  );

  const fmt = (v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-500 bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
      <p className="animate-pulse font-medium">Sincronizando banco NexStock...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Inventário Real</h2>
          <p className="text-sm text-slate-500">Controle total de produtos e SKUs</p>
        </div>
        <button 
          onClick={() => { 
            setEditingId(null); 
            setNewProduct({ name: "", sku: "", category: "Smartphones", costPrice: 0, sellPrice: "", currentStock: "", minStock: 1 });
            setIsModalOpen(true); 
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" /> Adicionar Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Venda</th>
                <th className="px-6 py-4 text-center">Qtd</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right pr-8">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isLowStock = p.currentStock < (p.minStock || 1);
                return (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{p.sku}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{p.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{fmt(p.sellPrice || 0)}</td>
                    <td className={`px-6 py-4 text-center font-black ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                      {p.currentStock ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter ${isLowStock ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {isLowStock ? "Reposição" : "Estável"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex gap-4 justify-end">
                         <button onClick={() => openEditModal(p)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/btn">
                           <Edit3 className="h-4 w-4 text-slate-400 group-hover/btn:text-blue-600" />
                         </button>
                         <button onClick={() => handleDelete(p._id, p.name)} className="p-2 hover:bg-red-50 rounded-lg transition-colors group/btn">
                           <Trash2 className="h-4 w-4 text-slate-300 group-hover/btn:text-red-600" />
                         </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="text-slate-400"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Nome do Produto</label>
                <input 
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
                  placeholder="Ex: iPhone 15 Pro 128GB"
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">SKU</label>
                  <input 
                    required 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" 
                    placeholder="Ex: IPH15P-128-BR"
                    value={newProduct.sku} 
                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Preço de Venda (R$)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" 
                    placeholder="7500.00"
                    value={newProduct.sellPrice} 
                    onChange={e => setNewProduct({...newProduct, sellPrice: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Estoque Atual</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" 
                    placeholder="10"
                    value={newProduct.currentStock} 
                    onChange={e => setNewProduct({...newProduct, currentStock: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Estoque Mínimo</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" 
                    placeholder="2"
                    value={newProduct.minStock} 
                    onChange={e => setNewProduct({...newProduct, minStock: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-3.5 px-4 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="w-full py-3.5 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
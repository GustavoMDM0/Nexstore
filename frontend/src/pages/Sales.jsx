import React, { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_PRODUCTS = "https://nexstore-tz6u.onrender.com/api/products/all";
const API_CHECKOUT = "https://nexstore-tz6u.onrender.com/api/sales/checkout";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(API_PRODUCTS);
        setProducts(response.data);
      } catch (error) {
        toast.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleFinalizeSale = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error("Selecione um produto");

    if (quantity > selectedProduct.currentStock) {
      return toast.error("Estoque insuficiente para esta venda!");
    }

    setSubmitting(true);
    try {
      const payload = {
        productId: selectedProduct._id,
        quantity: Number(quantity)
      };

      await axios.post(API_CHECKOUT, payload);
      
      toast.success("Venda realizada com sucesso!");
      
      setSelectedProduct(null);
      setQuantity(1);
      
      const updated = await axios.get(API_PRODUCTS);
      setProducts(updated.data);

    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao processar venda");
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = selectedProduct ? selectedProduct.sellPrice * quantity : 0;
  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
      <p>Carregando PDV...</p>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 mt-4 text-center">Nova Venda</h2>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <ShoppingCart className="text-emerald-600 h-5 w-5" />
          <h3 className="font-bold text-slate-700">PDV Simples</h3>
        </div>

        <form onSubmit={handleFinalizeSale} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Produto</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
              value={selectedProduct?._id || ""}
              onChange={(e) => {
                const prod = products.find(p => p._id === e.target.value);
                setSelectedProduct(prod);
              }}
            >
              <option value="">Selecione um produto...</option>
              {products.map(p => (
                <option key={p._id} value={p._id} disabled={p.currentStock <= 0}>
                  {p.name} — {fmt(p.sellPrice)} (estoque: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Quantidade</label>
            <input 
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 flex justify-between items-center">
            <span className="text-slate-500 font-medium text-sm">Total da Venda</span>
            <span className="text-2xl font-black text-slate-900">{fmt(totalValue)}</span>
          </div>

          <button 
            type="submit"
            disabled={submitting || !selectedProduct || selectedProduct.currentStock <= 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
            {submitting ? "Processando..." : "Finalizar Venda"}
          </button>

          {selectedProduct && selectedProduct.currentStock <= 5 && selectedProduct.currentStock > 0 && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-xs font-medium border border-amber-100">
              <AlertCircle size={14} />
              Atenção: Estoque baixo para este item!
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Product, BusinessProfile } from '../types';
import { 
  Search, 
  Plus, 
  AlertCircle,
  RefreshCw,
  Box,
  Layers,
  ArrowUpRight,
  Calculator
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onOpenAddProduct?: () => void;
  businessProfile: BusinessProfile | null;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, onOpenAddProduct, businessProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';
  const globalThreshold = businessProfile?.stockThreshold || 5;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const valuation = useMemo(() => {
    return products.reduce((acc, p) => {
      acc.totalCost += (p.costPrice || 0) * p.stock;
      acc.totalRevenue += (p.price || 0) * p.stock;
      return acc;
    }, { totalCost: 0, totalRevenue: 0 });
  }, [products]);

  const handleRestock = (id: string, amount: number) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, stock: p.stock + amount } : p
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A]">Inventory</h1>
            <p className="text-xs text-[#64748B] font-medium italic">Asset valuation & stock control.</p>
          </div>
          <button 
            onClick={onOpenAddProduct}
            className="w-12 h-12 md:w-auto md:px-6 bg-[#0F172A] text-white rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span className="hidden md:inline font-black uppercase text-xs tracking-widest">Add Item</span>
          </button>
        </div>

        {/* Valuation Section - Mobile optimized grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-[#0F172A]/5 p-4 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-1 text-[#64748B]">
              <Calculator size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Asset Cost</span>
            </div>
            <p className="text-lg font-black font-mono text-blue-600">{currency}{valuation.totalCost.toLocaleString()}</p>
          </div>
          <div className="bg-[#F0FDF4] border border-[#2DD4BF]/20 p-4 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-1 text-emerald-600">
              <ArrowUpRight size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Exp. Revenue</span>
            </div>
            <p className="text-lg font-black font-mono text-emerald-600">{currency}{valuation.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* Search - Full width on mobile */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
        <input 
          type="text" 
          placeholder="Search products..."
          className="w-full h-14 pl-12 pr-4 bg-white border border-[#0F172A]/10 rounded-2xl focus:border-[#2DD4BF] outline-none font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => {
          const threshold = product.stockThreshold ?? globalThreshold;
          const isLow = product.stock <= threshold;
          const isOut = product.stock === 0;

          return (
            <div 
              key={product.id} 
              className={`group relative border rounded-[32px] p-5 flex flex-col transition-all duration-300 ${
                isOut ? 'bg-gray-50 border-gray-200 opacity-80' : 
                isLow ? 'bg-amber-50/50 border-amber-200' : 
                'bg-white border-gray-100 hover:border-[#2DD4BF]/30 hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${isLow ? 'bg-amber-100 text-amber-600' : 'bg-[#F0FDF4] text-[#2DD4BF]'}`}>
                  <Box size={20} />
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#64748B] block">{product.category}</span>
                  <span className="text-[9px] font-mono font-bold text-gray-400">#{product.id.slice(0, 5)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-black text-[#0F172A] leading-tight truncate pr-2">{product.name}</h3>
                <div className="flex gap-4 mt-2">
                  <div>
                    <span className="text-[8px] font-black uppercase text-gray-400 block tracking-widest">Price</span>
                    <span className="text-sm font-black text-emerald-600 font-mono">{currency}{product.price}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-gray-400 block tracking-widest">Cost</span>
                    <span className="text-sm font-black text-amber-600 font-mono">{currency}{product.costPrice}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-black ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-[#0F172A]'}`}>
                      {product.stock}
                    </span>
                    {isLow && <AlertCircle size={14} className={isOut ? 'text-red-500' : 'text-amber-500'} />}
                  </div>
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">In Stock</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRestock(product.id, 5)}
                    className="flex-1 h-11 bg-[#0F172A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <RefreshCw size={12} /> +5
                  </button>
                  <button 
                    onClick={() => handleRestock(product.id, 10)}
                    className="flex-1 h-11 bg-white border border-[#0F172A]/10 text-[#0F172A] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Layers size={12} /> +10
                  </button>
                </div>
              </div>

              {isOut && (
                <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] rounded-[32px] flex items-center justify-center p-4">
                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-red-100 text-center animate-in zoom-in-95">
                    <p className="text-xs font-black text-red-600 uppercase mb-2">Out of Stock</p>
                    <button 
                      onClick={() => handleRestock(product.id, 10)}
                      className="px-4 py-2 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                    >
                      Restock Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;

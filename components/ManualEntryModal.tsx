
import React, { useState, useMemo } from 'react';
import { Product, SalesSource, ExtractedSale, BusinessProfile, Customer, PaymentMethod } from '../types';
import { X, Check, MessageCircle, Instagram, Facebook, Store, Phone, Globe, Sparkles, Banknote, Wallet } from 'lucide-react';

export interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Product[];
  onConfirm: (saleData: ExtractedSale) => void;
  businessProfile?: BusinessProfile | null;
  customers?: Customer[];
}

const PLATFORMS: { value: SalesSource; label: string }[] = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Walk-in', label: 'Walk-in' },
  { value: 'Phone Call', label: 'Phone Call' },
  { value: 'Other', label: 'Other' },
];

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose, inventory, onConfirm, businessProfile }) => {
  const [formData, setFormData] = useState({
    customerHandle: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    source: 'Walk-in' as SalesSource,
    paymentMethod: 'Cash/Transfer' as PaymentMethod
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const suggestions = useMemo(() => {
    return inventory.filter(p => p.stock > 0).sort((a, b) => b.totalSales - a.totalSales).slice(0, 3);
  }, [inventory]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerHandle) e.handle = "Handle required";
    if (!formData.productName) e.product = "Product required";
    if (formData.quantity <= 0) e.qty = "Must be > 0";
    if (formData.unitPrice < 0) e.price = "Invalid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const confirmedSale: ExtractedSale = {
      intent: 'sale',
      orderType: 'single',
      confidence: 'high',
      customers: [{
        handle: formData.customerHandle.startsWith('@') ? formData.customerHandle : `@${formData.customerHandle}`,
        platform: formData.source,
        paymentMethod: formData.paymentMethod,
        items: [{
          productName: formData.productName,
          quantity: formData.quantity,
          unitPrice: formData.unitPrice
        }],
        orderTotal: formData.unitPrice * formData.quantity
      }]
    };

    onConfirm(confirmedSale);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Manual Sale</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={24} className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Customer Handle *</label>
              <input 
                type="text"
                value={formData.customerHandle}
                onChange={e => setFormData({...formData, customerHandle: e.target.value})}
                className={`w-full h-14 bg-white/5 border ${errors.handle ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 text-white outline-none focus:border-[#2DD4BF] font-bold`}
                placeholder="@handle"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Source Platform</label>
              <select 
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value as SalesSource})}
                className="w-full h-14 bg-[#111] border border-white/10 rounded-2xl px-5 text-white outline-none"
              >
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Quick Select</label>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map(p => (
                <button 
                  key={p.id} type="button"
                  onClick={() => setFormData({...formData, productName: p.name, unitPrice: p.price})}
                  className={`p-4 rounded-2xl border text-left transition-all flex justify-between items-center ${formData.productName === p.name ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-[#2DD4BF]" />
                    <span className="text-xs font-bold">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono">${p.price}</span>
                </button>
              ))}
            </div>
            <input 
              type="text"
              placeholder="Or type product name..."
              value={formData.productName}
              onChange={e => setFormData({...formData, productName: e.target.value})}
              className={`w-full h-14 bg-white/5 border ${errors.product ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 text-white font-bold outline-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Quantity</label>
              <input 
                type="number" min="1"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                className={`w-full h-14 bg-white/5 border ${errors.qty ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 text-white font-bold`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Unit Price</label>
              <input 
                type="number" min="0"
                value={formData.unitPrice}
                onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                className={`w-full h-14 bg-white/5 border ${errors.price ? 'border-red-500' : 'border-white/10'} rounded-2xl px-5 text-[#2DD4BF] font-black`}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Payment Method</p>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'Cash/Transfer'})}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${formData.paymentMethod === 'Cash/Transfer' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-slate-500'}`}
                >
                  <Banknote size={16} />
                  <span className="text-[10px] font-black uppercase">Direct</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'Bookly Wallet'})}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${formData.paymentMethod === 'Bookly Wallet' ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-[#2DD4BF]' : 'bg-transparent border-white/5 text-slate-500'}`}
                >
                  <Wallet size={16} />
                  <span className="text-[10px] font-black uppercase text-left">Wallet (2.5%)</span>
                </button>
             </div>
          </div>

          <button type="submit" className="w-full h-16 bg-white text-black font-black rounded-3xl mt-4 shadow-xl active:scale-95 transition-all">Log Entry</button>
        </form>
      </div>
    </div>
  );
};

export default ManualEntryModal;

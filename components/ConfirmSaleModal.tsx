
import React, { useState, useEffect } from 'react';
import { ExtractedSale, Product, BusinessProfile, SalesSource, PaymentMethod } from '../types';
import { X, Check, ShoppingCart, User, AlertCircle, AlertTriangle, Plus, Trash2, CreditCard, Wallet, Banknote, Truck } from 'lucide-react';

export interface ConfirmSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalData: ExtractedSale) => void;
  saleData: ExtractedSale;
  products: Product[];
  businessProfile: BusinessProfile | null;
}

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];

const ConfirmSaleModal: React.FC<ConfirmSaleModalProps> = ({ 
  isOpen, onClose, onConfirm, saleData, products, businessProfile 
}) => {
  const [localData, setLocalData] = useState<ExtractedSale>(saleData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalData(saleData);
  }, [saleData]);

  if (!isOpen) return null;
  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';
  const isLowConfidence = localData.confidence === 'low';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!localData.customers || localData.customers.length === 0) {
      newErrors.general = "No customers found.";
    } else {
      localData.customers.forEach((c, cIdx) => {
        if (!c.handle) newErrors[`customer-${cIdx}-handle`] = "Handle required.";
        if (!c.items || c.items.length === 0) newErrors[`customer-${cIdx}-items`] = "Cart cannot be empty.";
        c.items?.forEach((item, iIdx) => {
          if (!item.productName) newErrors[`item-${cIdx}-${iIdx}-name`] = "Name required.";
          if (item.quantity <= 0) newErrors[`item-${cIdx}-${iIdx}-qty`] = "Qty > 0.";
          if ((item.unitPrice || 0) < 0) newErrors[`item-${cIdx}-${iIdx}-price`] = "Price >= 0.";
        });
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinalConfirm = () => {
    if (validate()) {
      onConfirm(localData);
    }
  };

  const updateCustomer = (idx: number, field: string, value: any) => {
    const newCustomers = [...(localData.customers || [])];
    newCustomers[idx] = { ...newCustomers[idx], [field]: value };
    setLocalData({ ...localData, customers: newCustomers });
  };

  const updateItem = (custIdx: number, itemIdx: number, field: string, value: any) => {
    const newCustomers = [...(localData.customers || [])];
    const newItems = [...newCustomers[custIdx].items];
    newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
    
    // Recalculate order total
    const subtotal = newItems.reduce((acc, item) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0);
    newCustomers[custIdx].orderTotal = subtotal;

    newCustomers[custIdx].items = newItems;
    setLocalData({ ...localData, customers: newCustomers });
  };

  const removeItem = (custIdx: number, itemIdx: number) => {
    const newCustomers = [...(localData.customers || [])];
    newCustomers[custIdx].items = newCustomers[custIdx].items.filter((_, i) => i !== itemIdx);
    const total = newCustomers[custIdx].items.reduce((acc, item) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0);
    newCustomers[custIdx].orderTotal = total;
    setLocalData({ ...localData, customers: newCustomers });
  };

  const addItem = (custIdx: number) => {
    const newCustomers = [...(localData.customers || [])];
    newCustomers[custIdx].items.push({ productName: '', quantity: 1, unitPrice: 0 });
    setLocalData({ ...localData, customers: newCustomers });
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0f0f0f] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isLowConfidence ? 'bg-amber-500' : 'bg-emerald-500'}`}>
              <ShoppingCart size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Review Order</h2>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                AI Confidence: <span className={isLowConfidence ? 'text-amber-500' : 'text-emerald-500'}>{localData.confidence}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {localData.customers?.map((c, custIdx) => {
            const walletFee = c.paymentMethod === 'Bookly Wallet' ? (c.orderTotal || 0) * 0.025 : 0;
            const deliveryFee = c.deliveryFee || 0;
            const finalTotal = (c.orderTotal || 0) + walletFee + deliveryFee;

            return (
              <div key={custIdx} className="p-6 bg-white/[0.03] rounded-[32px] border border-white/10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Customer</label>
                    <input 
                      type="text"
                      value={c.handle}
                      onChange={(e) => updateCustomer(custIdx, 'handle', e.target.value)}
                      className={`w-full h-11 bg-black/40 border ${errors[`customer-${custIdx}-handle`] ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 text-xs text-white font-bold outline-none focus:border-[#2DD4BF]`}
                    />
                    {errors[`customer-${custIdx}-handle`] && <p className="text-[9px] text-red-500 font-bold ml-1">{errors[`customer-${custIdx}-handle`]}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Source</label>
                    <select 
                      value={c.platform || 'WhatsApp'}
                      onChange={(e) => updateCustomer(custIdx, 'platform', e.target.value)}
                      className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs text-white font-bold outline-none"
                    >
                      {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cart</p>
                    <button onClick={() => addItem(custIdx)} className="text-[10px] font-black text-[#2DD4BF] uppercase flex items-center gap-1 hover:opacity-80">
                      <Plus size={12} /> Add Item
                    </button>
                  </div>
                  
                  {c.items?.map((item, itemIdx) => (
                    <div key={itemIdx} className="space-y-1">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                          <input 
                            type="text"
                            value={item.productName}
                            onChange={(e) => updateItem(custIdx, itemIdx, 'productName', e.target.value)}
                            className={`w-full h-10 bg-black/20 border ${errors[`item-${custIdx}-${itemIdx}-name`] ? 'border-red-500' : 'border-white/5'} rounded-lg px-3 text-[11px] text-white`}
                            placeholder="Product name"
                          />
                        </div>
                        <div className="col-span-2">
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(custIdx, itemIdx, 'quantity', parseInt(e.target.value) || 0)}
                            className={`w-full h-10 bg-black/20 border ${errors[`item-${custIdx}-${itemIdx}-qty`] ? 'border-red-500' : 'border-white/5'} rounded-lg px-2 text-[11px] text-white text-center font-mono`}
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-bold">{currency}</span>
                            <input 
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(custIdx, itemIdx, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className={`w-full h-10 bg-black/20 border ${errors[`item-${custIdx}-${itemIdx}-price`] ? 'border-red-500' : 'border-white/5'} rounded-lg pl-5 pr-2 text-[11px] text-white font-mono`}
                            />
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button onClick={() => removeItem(custIdx, itemIdx)} className="text-red-500/30 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {errors[`customer-${custIdx}-items`] && itemIdx === 0 && (
                        <p className="text-[9px] text-red-500 font-bold ml-1">{errors[`customer-${custIdx}-items`]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Delivery Fee</label>
                    <div className="relative">
                      <Truck size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="number"
                        value={deliveryFee}
                        onChange={(e) => updateCustomer(custIdx, 'deliveryFee', parseFloat(e.target.value) || 0)}
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-xs text-white font-bold outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2 h-11">
                        <button 
                          onClick={() => updateCustomer(custIdx, 'paymentMethod', 'Cash/Transfer')}
                          className={`flex-1 rounded-xl border flex items-center justify-center gap-2 transition-all ${c.paymentMethod === 'Cash/Transfer' || !c.paymentMethod ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-slate-500'}`}
                        >
                          <Banknote size={14} />
                        </button>
                        <button 
                          onClick={() => updateCustomer(custIdx, 'paymentMethod', 'Bookly Wallet')}
                          className={`flex-1 rounded-xl border flex items-center justify-center gap-2 transition-all ${c.paymentMethod === 'Bookly Wallet' ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-[#2DD4BF]' : 'bg-transparent border-white/5 text-slate-500'}`}
                        >
                          <Wallet size={14} />
                        </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-slate-500 font-mono text-[10px]">
                    <span>Items Subtotal</span>
                    <span>{currency}{(c.orderTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-mono text-[10px]">
                    <span>Delivery Fee</span>
                    <span>+{currency}{deliveryFee.toLocaleString()}</span>
                  </div>
                  {c.paymentMethod === 'Bookly Wallet' && (
                    <div className="flex justify-between items-center text-amber-500 font-mono text-[10px]">
                      <span>Processing Fee (2.5%)</span>
                      <span>+{currency}{walletFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Final Ledger Total</span>
                    <span className="text-xl font-black text-[#2DD4BF] font-mono">{currency}{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex flex-col gap-3">
          {errors.general && <p className="text-[10px] text-red-500 font-bold text-center">{errors.general}</p>}
          <button 
            onClick={handleFinalConfirm}
            className="w-full h-16 bg-white text-black font-black rounded-3xl flex items-center justify-center gap-2 shadow-2xl hover:scale-[1.01] active:scale-95 transition-all"
          >
            <Check size={20} /> Finalize Ledger Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSaleModal;

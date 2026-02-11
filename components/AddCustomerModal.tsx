
import React, { useState } from 'react';
import { Customer, SalesSource } from '../types';
import { X, User, MessageCircle, MapPin, Check, AtSign, Globe } from 'lucide-react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (customer: Omit<Customer, 'id' | 'orderCount' | 'ltv' | 'lastActive'>) => void;
}

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    channel: 'WhatsApp' as SalesSource,
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.handle) return;

    // Ensure handle starts with @
    const handle = formData.handle.startsWith('@') ? formData.handle : `@${formData.handle}`;

    onAdd({
      ...formData,
      handle
    });

    // Reset
    setFormData({ name: '', handle: '', channel: 'WhatsApp', address: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#0F172A]">
            <User className="text-[#2DD4BF]" />
            New Customer Profile
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all font-bold text-[#0F172A]"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <AtSign size={10} /> Social Handle
            </label>
            <input
              type="text"
              required
              value={formData.handle}
              onChange={e => setFormData({ ...formData, handle: e.target.value })}
              className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-mono font-bold text-[#2DD4BF]"
              placeholder="@username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Globe size={10} /> Primary Sales Channel
            </label>
            <select
              value={formData.channel}
              onChange={e => setFormData({ ...formData, channel: e.target.value as SalesSource })}
              className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
            >
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <MapPin size={10} /> Default Shipping Address
            </label>
            <textarea
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full h-24 p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2DD4BF] transition-all text-sm resize-none font-medium text-[#0F172A]"
              placeholder="123 Main St, City, Country..."
            />
          </div>

          <button
            type="submit"
            className="w-full h-16 bg-[#2DD4BF] text-[#0F172A] font-black rounded-3xl flex items-center justify-center space-x-2 mt-2 hover:shadow-lg hover:bg-[#20c9e6] active:scale-95 transition-all"
          >
            <Check size={20} />
            <span>Create Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;

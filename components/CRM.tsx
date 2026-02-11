
import React, { useState, useMemo } from 'react';
import { Customer, Transaction, BusinessProfile } from '../types';
import {
  Users,
  Search,
  MessageCircle,
  Instagram,
  Facebook,
  Phone,
  User,
  ChevronRight,
  TrendingUp,
  History,
  X,
  Calendar,
  MapPin,
  ChevronLeft,
  Zap,
  Award,
  Plus,
  Download,
  Share2
} from 'lucide-react';

interface CRMProps {
  customers: Customer[];
  transactions: Transaction[];
  businessProfile: BusinessProfile | null;
  onOpenAddCustomer?: () => void;
  onViewInvoice: (transaction: Transaction) => void;
}

const CRM: React.FC<CRMProps> = ({ customers, transactions, businessProfile, onOpenAddCustomer, onViewInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const vipThreshold = businessProfile?.vipThreshold || 5;
  const currency = businessProfile?.currency === 'NGN' ? '₦' : '$';

  const getTier = (orderCount: number) => {
    if (orderCount >= vipThreshold) {
      return { label: 'VIP', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: <Award size={10} /> };
    }
    if (orderCount > 1) {
      return { label: 'Returning', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <History size={10} /> };
    }
    return { label: 'New', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: <Zap size={10} /> };
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChannelIcon = (channel: string, size = 14) => {
    switch (channel) {
      case 'WhatsApp': return <MessageCircle size={size} className="text-green-500" />;
      case 'Instagram': return <Instagram size={size} className="text-pink-500" />;
      case 'Facebook': return <Facebook size={size} className="text-blue-500" />;
      case 'Phone Call': return <Phone size={size} className="text-blue-400" />;
      default: return <User size={size} className="text-gray-400" />;
    }
  };

  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter(t => t.customerHandle === selectedCustomer.handle)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedCustomer, transactions]);

  const avgOrderValue = useMemo(() => {
    if (!selectedCustomer || selectedCustomer.orderCount === 0) return 0;
    return Math.round(selectedCustomer.ltv / selectedCustomer.orderCount);
  }, [selectedCustomer]);

  const exportCRMToCSV = () => {
    const headers = ['Name', 'Handle', 'Channel', 'Orders', 'Total Spend', 'Tier'];
    const rows = customers.map(c => [
      c.name,
      c.handle,
      c.channel,
      c.orderCount,
      c.ltv,
      getTier(c.orderCount).label
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookly-customers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-20">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A]">CRM</h1>
            <p className="text-xs text-[#64748B] font-medium italic">Customer intelligence & history.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCRMToCSV}
              className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:text-[#0F172A] hover:border-emerald-400 shadow-sm active:scale-95 transition-all"
              title="Export CSV"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onOpenAddCustomer}
              className="h-12 px-5 bg-[#2DD4BF] text-[#0F172A] rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              <Plus size={20} />
              <span className="hidden md:inline font-black uppercase text-xs tracking-widest">New Profile</span>
            </button>
          </div>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-[#0F172A]/5 p-4 rounded-3xl shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Leads</p>
            <p className="text-xl font-black text-[#0F172A]">{customers.length}</p>
          </div>
          <div className="bg-white border border-[#0F172A]/5 p-4 rounded-3xl shadow-sm">
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">VIP Status</p>
            <p className="text-xl font-black text-amber-500">{customers.filter(c => c.orderCount >= vipThreshold).length}</p>
          </div>
          <div className="bg-[#F0FDF4] border border-[#2DD4BF]/20 p-4 rounded-3xl shadow-sm lg:col-span-1">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total LTV</p>
            <p className="text-xl font-black text-emerald-600 font-mono">{currency}{customers.reduce((s, c) => s + c.ltv, 0).toLocaleString()}</p>
          </div>
          <div className="bg-white border border-[#0F172A]/5 p-4 rounded-3xl shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Ticket</p>
            <p className="text-xl font-black text-[#0F172A] font-mono">{currency}{Math.round(customers.reduce((s, c) => s + c.ltv, 0) / (customers.length || 1))}</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
        <input
          type="text"
          placeholder="Search handles or names..."
          className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 outline-none font-medium text-sm text-[#0F172A] placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Directory Table/List */}
      <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] uppercase font-black tracking-[0.2em] text-[#64748B] bg-gray-50/50">
                <th className="px-6 py-5">Customer Identification</th>
                <th className="px-6 py-5 hidden md:table-cell">Tier</th>
                <th className="px-6 py-5 text-right">LTV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-gray-400 italic text-sm">No profiles found.</td>
                </tr>
              ) : (
                filteredCustomers.map(customer => {
                  const tier = getTier(customer.orderCount);
                  return (
                    <tr
                      key={customer.id}
                      className="group hover:bg-[#F0FDF4] transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-[#0F172A]">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm text-[#0F172A]">{customer.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getChannelIcon(customer.channel)}
                              <span className="text-[10px] text-gray-500 font-mono">{customer.handle}</span>
                              <div className={`md:hidden flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase ${tier.color}`}>
                                {tier.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${tier.color}`}>
                          {tier.icon}
                          {tier.label}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-black text-emerald-600 text-sm">{currency}{customer.ltv.toLocaleString()}</span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase">{customer.orderCount} Orders</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] animate-in fade-in" onClick={() => setSelectedCustomer(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[260] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedCustomer(null)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="font-black text-xl text-[#0F172A] tracking-tight">Profile Intelligence</h2>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-[32px] bg-gray-50 border border-gray-100 flex items-center justify-center text-4xl font-black text-[#2DD4BF]">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0F172A]">{selectedCustomer.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs text-[#64748B] font-mono font-semibold">{selectedCustomer.handle}</span>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${getTier(selectedCustomer.orderCount).color}`}>
                      {getTier(selectedCustomer.orderCount).label}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-3xl text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">LTV</p>
                  <p className="text-lg font-mono font-black text-[#2DD4BF]">{currency}{selectedCustomer.ltv.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-3xl text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders</p>
                  <p className="text-lg font-mono font-black text-[#0F172A]">{selectedCustomer.orderCount}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-3xl text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Item</p>
                  <p className="text-lg font-mono font-black text-[#0F172A]">{currency}{avgOrderValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Shipping Log</h4>
                  <div className="bg-white border border-gray-100 p-5 rounded-3xl flex items-start gap-4 shadow-sm">
                    <MapPin size={18} className="text-[#2DD4BF] mt-0.5" />
                    <p className="text-sm text-[#64748B] leading-relaxed font-medium italic">{selectedCustomer.address || 'No primary address logged.'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Ledger</h4>
                    <TrendingUp size={14} className="text-emerald-500" />
                  </div>
                  <div className="space-y-3">
                    {customerTransactions.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs italic border border-dashed border-gray-200 rounded-3xl">No orders logged yet.</div>
                    ) : (
                      customerTransactions.map(t => (
                        <div key={t.id} className="bg-white border border-gray-100 p-4 rounded-3xl flex items-center justify-between shadow-sm hover:border-[#2DD4BF]/30 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#0F172A]">{t.productName}</p>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{new Date(t.timestamp).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <p className="font-mono font-black text-[#2DD4BF] text-sm">{currency}{t.total.toLocaleString()}</p>
                            <button onClick={() => onViewInvoice(t)} className="text-[9px] font-black text-gray-400 uppercase hover:text-[#0F172A] transition-colors flex items-center gap-1">
                              Receipt <ChevronRight size={10} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50">
              <button className="w-full h-14 bg-[#0F172A] text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all">
                <MessageCircle size={18} />
                <span>Initiate Chat via {selectedCustomer.channel}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CRM;

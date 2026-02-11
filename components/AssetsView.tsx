import React, { useState } from 'react';
import { Users, Package } from 'lucide-react';
import { Product, Customer, Transaction, BusinessProfile } from '../types';
import CRM from './CRM';
import Inventory from './Inventory';

interface AssetsViewProps {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  onOpenAddProduct: () => void;
  onOpenAddCustomer: () => void;
  setProducts: (products: Product[]) => void;
  businessProfile: BusinessProfile | null;
  onViewInvoice: (transaction: Transaction) => void;
}

const AssetsView: React.FC<AssetsViewProps> = ({
  products,
  customers,
  transactions,
  onOpenAddProduct,
  onOpenAddCustomer,
  setProducts,
  businessProfile,
  onViewInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'customers'>('inventory');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Tab Menu */}
      <div className="flex p-1 bg-white border border-slate-200 rounded-3xl w-full max-w-2xl mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'inventory'
              ? 'bg-[#0F172A] text-white shadow-lg'
              : 'text-gray-400 hover:text-[#0F172A]'
          }`}
        >
          <Package size={16} />
          <span>Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'customers'
              ? 'bg-[#0F172A] text-white shadow-lg'
              : 'text-gray-400 hover:text-[#0F172A]'
          }`}
        >
          <Users size={16} />
          <span>Customers</span>
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'inventory' ? (
          <Inventory
            products={products}
            setProducts={setProducts}
            onOpenAddProduct={onOpenAddProduct}
            businessProfile={businessProfile}
          />
        ) : (
          <CRM
            customers={customers}
            transactions={transactions}
            businessProfile={businessProfile}
            onOpenAddCustomer={onOpenAddCustomer}
            onViewInvoice={onViewInvoice}
          />
        )}
      </div>
    </div>
  );
};

export default AssetsView;


import React, { useState } from 'react';
import { Transaction, Expense, FilterState, Product, Customer, TransactionStatus } from '../types';
import SalesView from './SalesView';
import Expenses from './Expenses';
import { History, Wallet } from 'lucide-react';

interface FinancialsViewProps {
  transactions: Transaction[];
  expenses: Expense[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  products: Product[];
  customers: Customer[];
  vipThreshold: number;
  onViewInvoice: (transaction: Transaction) => void;
  onArchive: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  currency: string;
  onStatusChange: (id: string, status: TransactionStatus) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  businessProfile: any;
}

const FinancialsView: React.FC<FinancialsViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'expenses'>('orders');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Merged Menu Toggle */}
      <div className="flex p-1 bg-white border border-[#0F172A]/5 rounded-3xl w-full max-w-sm mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'orders'
              ? 'bg-[#0F172A] text-white shadow-lg'
              : 'text-gray-400 hover:text-[#0F172A]'
          }`}
        >
          <History size={16} />
          <span>Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'expenses'
              ? 'bg-[#0F172A] text-white shadow-lg'
              : 'text-gray-400 hover:text-[#0F172A]'
          }`}
        >
          <Wallet size={16} />
          <span>Expenses</span>
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'orders' ? (
          <SalesView
            transactions={props.transactions}
            filters={props.filters}
            setFilters={props.setFilters}
            products={props.products}
            customers={props.customers}
            vipThreshold={props.vipThreshold}
            onViewInvoice={props.onViewInvoice}
            onArchive={props.onArchive}
            onEdit={props.onEdit}
            currency={props.currency}
            onStatusChange={props.onStatusChange}
          />
        ) : (
          <Expenses
            expenses={props.expenses}
            onAddExpense={props.onAddExpense}
            businessProfile={props.businessProfile}
          />
        )}
      </div>
    </div>
  );
};

export default FinancialsView;

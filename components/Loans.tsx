import React from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';

export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue';
  description: string;
}

interface LoansProps {
  loans?: Loan[];
}

const Loans: React.FC<LoansProps> = ({ loans = [] }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <DollarSign size={32} className="text-amber-500" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-[#0F172A] mb-2">Loans Management</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          Track and manage your business loans, interest rates, and payment schedules.
        </p>
        
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
          <AlertCircle size={16} />
          <span className="font-medium">This feature is coming soon</span>
        </div>
      </div>

      {/* Placeholder Cards */}
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {[
          {
            title: 'Add Loan',
            description: 'Record a new business loan',
            icon: '📋'
          },
          {
            title: 'Track Payments',
            description: 'Monitor payment schedules',
            icon: '📅'
          },
          {
            title: 'View Analytics',
            description: 'See loan summaries and trends',
            icon: '📊'
          },
          {
            title: 'Interest Calculator',
            description: 'Calculate interest automatically',
            icon: '🧮'
          }
        ].map((item, i) => (
          <div
            key={i}
            className="p-4 border border-slate-200 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="font-black text-[#0F172A] text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Current Status */}
      {loans.length === 0 && (
        <div className="text-center py-8 px-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-sm text-amber-900">
            No loans recorded yet. Start tracking your loans when you're ready!
          </p>
        </div>
      )}
    </div>
  );
};

export default Loans;

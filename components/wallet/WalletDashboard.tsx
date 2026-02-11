
import React, { useState } from 'react';
import { Copy, ArrowUpRight, ArrowDownLeft, Plus, Send, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { WalletProfile, WalletTransaction } from '../../types';
import { TransferModal } from './TransferModal';
import { getCurrencySymbol } from '../../utils/currency';

interface WalletDashboardProps {
    wallet: WalletProfile;
    onTransfer: (amount: number, recipient: string, category: string, description: string) => void;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ wallet, onTransfer }) => {
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const currencySymbol = getCurrencySymbol(wallet.currency);

    const copyAccountNumber = () => {
        navigator.clipboard.writeText(wallet.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalIncome = wallet.transactions
        .filter(t => t.type === 'credit' && t.status === 'success')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = wallet.transactions
        .filter(t => t.type === 'debit' && t.status === 'success')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-black mb-2">Available Balance</p>
                        <h2 className="text-4xl font-black">
                            {currencySymbol}{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>
                    <div className="w-10 h-10 bg-[#2DD4BF] rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-[#0F172A]" />
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Account Number</span>
                        <button
                            onClick={copyAccountNumber}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <span className="font-mono font-bold text-sm">{wallet.accountNumber}</span>
                            {copied ? <CheckCircle2 size={14} className="text-[#2DD4BF]" /> : <Copy size={14} />}
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Bank Name</span>
                        <span className="font-bold text-sm">{wallet.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Account Name</span>
                        <span className="font-bold text-sm">{wallet.accountName}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setShowTransferModal(true)}
                    className="h-24 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#2DD4BF] hover:bg-[#2DD4BF]/5 transition-all group"
                >
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-[#2DD4BF] rounded-xl flex items-center justify-center transition-colors">
                        <Send size={20} className="text-slate-600 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">Transfer Out</span>
                </button>
                <button className="h-24 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-emerald-500 rounded-xl flex items-center justify-center transition-colors">
                        <Plus size={20} className="text-slate-600 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">Add Money</span>
                </button>
            </div>

            {/* Mini Analytics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowDownLeft size={16} className="text-emerald-600" />
                        <span className="text-xs uppercase font-black tracking-wider text-emerald-600">Income (30d)</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-700">
                        {currencySymbol}{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowUpRight size={16} className="text-red-600" />
                        <span className="text-xs uppercase font-black tracking-wider text-red-600">Expenses (30d)</span>
                    </div>
                    <p className="text-2xl font-black text-red-700">
                        {currencySymbol}{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-black text-[#0F172A]">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {wallet.transactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock size={24} className="text-slate-400" />
                            </div>
                            <p className="text-slate-400 font-medium">No transactions yet</p>
                        </div>
                    ) : (
                        wallet.transactions.slice(0, 10).map(tx => (
                            <TransactionRow key={tx.id} transaction={tx} currency={wallet.currency} />
                        ))
                    )}
                </div>
            </div>

            {showTransferModal && (
                <TransferModal
                    balance={wallet.balance}
                    currency={wallet.currency}
                    onClose={() => setShowTransferModal(false)}
                    onConfirm={onTransfer}
                />
            )}
        </div>
    );
};

const TransactionRow: React.FC<{ transaction: WalletTransaction; currency: string }> = ({ transaction, currency }) => {
    const isCredit = transaction.type === 'credit';
    const statusIcon = transaction.status === 'success' ? CheckCircle2 : transaction.status === 'pending' ? Clock : XCircle;
    const StatusIcon = statusIcon;

    return (
        <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                    <p className="font-bold text-sm text-[#0F172A]">{transaction.description}</p>
                    <p className="text-xs text-slate-400">{new Date(transaction.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className={`font-black text-sm ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '-'}{getCurrencySymbol(currency)}{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    {transaction.category && <p className="text-[10px] text-slate-400 uppercase tracking-wider">{transaction.category}</p>}
                </div>
                <StatusIcon size={16} className={transaction.status === 'success' ? 'text-emerald-500' : transaction.status === 'pending' ? 'text-amber-500' : 'text-red-500'} />
            </div>
        </div>
    );
};

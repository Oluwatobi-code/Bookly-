
import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { ExpenseCategory } from '../../types';
import { getCurrencySymbol } from '../../utils/currency';

interface TransferModalProps {
    balance: number;
    currency: string;
    onClose: () => void;
    onConfirm: (amount: number, recipient: string, category: string, description: string) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Rent', 'Marketing', 'Supplies', 'Logistics', 'Utilities', 'Salary', 'Other'];

const NIGERIAN_BANKS = [
    'Access Bank', 'Citibank', 'Ecobank', 'Fidelity Bank', 'First Bank of Nigeria',
    'First City Monument Bank (FCMB)', 'Globus Bank', 'Guaranty Trust Bank (GTBank)',
    'Heritage Bank', 'Keystone Bank', 'Polaris Bank', 'Providus Bank',
    'Stanbic IBTC Bank', 'Standard Chartered Bank', 'Sterling Bank',
    'SunTrust Bank', 'Union Bank', 'United Bank for Africa (UBA)',
    'Unity Bank', 'Wema Bank', 'Zenith Bank'
];

export const TransferModal: React.FC<TransferModalProps> = ({ balance, currency, onClose, onConfirm }) => {
    const [step, setStep] = useState<'bank-details' | 'amount-category'>('bank-details');
    const [formData, setFormData] = useState({
        accountNumber: '',
        bank: '',
        amount: '',
        category: '' as ExpenseCategory | '',
        description: ''
    });
    const [error, setError] = useState('');
    const [accountName, setAccountName] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [filteredBanks, setFilteredBanks] = useState<string[]>(NIGERIAN_BANKS);
    const [showBankDropdown, setShowBankDropdown] = useState(false);

  const currencySymbol = getCurrencySymbol(currency);
    // Mock name enquiry when account number is 10 digits and bank is selected
    useEffect(() => {
        if (formData.accountNumber.length === 10 && formData.bank) {
            setIsVerifying(true);
            setError('');
            // Simulate API call
            setTimeout(() => {
                setAccountName('John Doe'); // Mock recipient name
                setIsVerifying(false);
            }, 1000);
        } else {
            setAccountName('');
        }
    }, [formData.accountNumber, formData.bank]);

    const handleBankSearch = (query: string) => {
        setFormData({ ...formData, bank: query });
        if (query.trim()) {
            const filtered = NIGERIAN_BANKS.filter(bank =>
                bank.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredBanks(filtered);
            setShowBankDropdown(true);
        } else {
            setFilteredBanks(NIGERIAN_BANKS);
            setShowBankDropdown(true);
        }
    };

    const selectBank = (bank: string) => {
        setFormData({ ...formData, bank });
        setShowBankDropdown(false);
    };

    const handleContinue = () => {
        if (!formData.accountNumber || formData.accountNumber.length !== 10) {
            setError('Enter a valid 10-digit account number');
            return;
        }
        if (!formData.bank) {
            setError('Select a bank');
            return;
        }
        if (!accountName) {
            setError('Wait for account verification');
            return;
        }
        setError('');
        setStep('amount-category');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(formData.amount);

        if (!amount || amount <= 0) {
            setError('Enter a valid amount');
            return;
        }
        if (amount > balance) {
            setError('Insufficient balance');
            return;
        }
        if (!formData.category) {
            setError('Select an expense category');
            return;
        }

        onConfirm(
            amount,
            `${accountName} - ${formData.bank}`,
            formData.category,
            formData.description || `Transfer to ${accountName}`
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-[#0F172A]">Transfer Funds</h2>
                        <p className="text-xs text-slate-400 mt-1">
                            {step === 'bank-details' ? 'Step 1: Recipient Details' : 'Step 2: Amount & Category'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {step === 'bank-details' ? (
                        <>
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                                <p className="text-xs uppercase tracking-widest text-slate-500 font-black mb-1">Available Balance</p>
                                <p className="text-2xl font-black text-[#0F172A]">{currency} {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Number</label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    value={formData.accountNumber}
                                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all font-mono font-bold text-lg text-[#0F172A]"
                                    placeholder="0123456789"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Bank</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.bank}
                                        onChange={e => handleBankSearch(e.target.value)}
                                        onFocus={() => setShowBankDropdown(true)}
                                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 pr-10 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
                                        placeholder="Search or select bank..."
                                    />
                                    <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>

                                {showBankDropdown && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                        {filteredBanks.length > 0 ? (
                                            filteredBanks.map(bank => (
                                                <button
                                                    key={bank}
                                                    type="button"
                                                    onClick={() => selectBank(bank)}
                                                    className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors font-medium text-sm text-[#0F172A] border-b border-slate-100 last:border-0"
                                                >
                                                    {bank}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-5 text-center text-slate-400 text-sm">No banks found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isVerifying && (
                                <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-amber-700">Verifying account...</p>
                                </div>
                            )}

                            {accountName && !isVerifying && (
                                <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                                    <CheckCircle2 size={20} className="text-emerald-600" />
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-emerald-600 font-black">Account Name</p>
                                        <p className="text-sm font-bold text-emerald-900">{accountName}</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                    <AlertCircle size={16} className="text-red-500" />
                                    <p className="text-sm font-bold text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={!accountName || isVerifying}
                                className="w-full h-16 bg-[#0F172A] text-white font-black rounded-3xl flex items-center justify-center space-x-2 hover:bg-[#1e293b] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>Continue</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                                <p className="text-xs uppercase tracking-wider text-emerald-600 font-black mb-1">Sending to</p>
                                <p className="text-lg font-bold text-emerald-900">{accountName}</p>
                                <p className="text-xs text-emerald-600 mt-1">{formData.bank} • {formData.accountNumber}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all font-mono font-bold text-xl text-[#0F172A]"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    Expense Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
                                >
                                    <option value="">Select category...</option>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400 pl-2">This transfer will be logged as an expense</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-20 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2DD4BF] transition-all text-sm resize-none font-medium text-[#0F172A]"
                                    placeholder="Add a note..."
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                    <AlertCircle size={16} className="text-red-500" />
                                    <p className="text-sm font-bold text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep('bank-details')}
                                    className="flex-1 h-14 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-14 bg-[#2DD4BF] text-[#0F172A] font-black rounded-2xl flex items-center justify-center space-x-2 hover:shadow-lg active:scale-95 transition-all"
                                >
                                    <Send size={20} />
                                    <span>Send</span>
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

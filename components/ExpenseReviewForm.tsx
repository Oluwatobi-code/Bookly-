import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ExtractedExpense, BusinessProfile, ExpenseCategory } from '../types';
import { getCurrencySymbol } from '../utils/currency';

interface ExpenseReviewFormProps {
    extractedExpense: ExtractedExpense;
    onChange: (updated: ExtractedExpense) => void;
    businessProfile: BusinessProfile;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    'Rent', 'Marketing', 'Supplies', 'Logistics', 'Utilities', 'Salary', 'Other'
];

export const ExpenseReviewForm: React.FC<ExpenseReviewFormProps> = ({
    extractedExpense,
    onChange,
    businessProfile
}) => {
    const [errors, setErrors] = useState<string[]>([]);
    const currencySymbol = getCurrencySymbol(businessProfile.currency);

    const updateField = (field: keyof ExtractedExpense, value: any) => {
        onChange({ ...extractedExpense, [field]: value });
    };

    const validate = (): boolean => {
        const newErrors: string[] = [];

        if (!extractedExpense.amount || extractedExpense.amount <= 0) {
            newErrors.push('Amount must be greater than zero');
        }
        if (!extractedExpense.category) {
            newErrors.push('Category is required');
        }
        if (!extractedExpense.description?.trim()) {
            newErrors.push('Description is required');
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    return (
        <div className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Amount ({currencySymbol}) *
                </label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={extractedExpense.amount || ''}
                    onChange={e => updateField('amount', parseFloat(e.target.value) || 0)}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all font-mono font-bold text-xl text-[#0F172A]"
                    placeholder="0.00"
                />
            </div>

            {/* Category */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Category *
                </label>
                <select
                    value={extractedExpense.category || ''}
                    onChange={e => updateField('category', e.target.value as ExpenseCategory)}
                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
                >
                    <option value="">Select category...</option>
                    {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Description *
                </label>
                <textarea
                    value={extractedExpense.description || ''}
                    onChange={e => updateField('description', e.target.value)}
                    className="w-full h-24 p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#2DD4BF] transition-all text-sm resize-none font-medium text-[#0F172A]"
                    placeholder="What was this expense for?"
                />
            </div>

            {/* Vendor */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Vendor/Supplier
                </label>
                <input
                    type="text"
                    value={extractedExpense.vendor || ''}
                    onChange={e => updateField('vendor', e.target.value)}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-medium text-[#0F172A]"
                    placeholder="Who did you pay?"
                />
            </div>

            {/* Payment Method & Date */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Payment Method
                    </label>
                    <select
                        value={extractedExpense.paymentMethod || 'cash'}
                        onChange={e => updateField('paymentMethod', e.target.value)}
                        className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-bold text-[#0F172A]"
                    >
                        <option value="cash">Cash</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="card">Card</option>
                        <option value="wallet">Mobile Wallet</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Date
                    </label>
                    <input
                        type="date"
                        value={extractedExpense.date || new Date().toISOString().split('T')[0]}
                        onChange={e => updateField('date', e.target.value)}
                        className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 outline-none focus:border-[#2DD4BF] transition-all font-medium text-[#0F172A]"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-red-700 uppercase tracking-wider">Total Expense</span>
                    <span className="text-3xl font-black text-red-700 font-mono">
                        {currencySymbol}{(extractedExpense.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                        <AlertCircle size={18} />
                        <span>Please fix the following errors:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                        {errors.map((error, i) => (
                            <li key={i}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

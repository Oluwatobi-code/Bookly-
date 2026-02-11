import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ExtractedSale, ExtractedExpense, BusinessProfile, Product, Customer, ExtractedRecordType } from '../types';
import { OrderReviewForm } from './OrderReviewForm';
import { ExpenseReviewForm } from './ExpenseReviewForm';

interface ReviewConfirmModalProps {
    extractedRecord: ExtractedSale | ExtractedExpense;
    onConfirm: (record: ExtractedSale | ExtractedExpense) => void;
    onCancel: () => void;
    businessProfile: BusinessProfile;
    products: Product[];
    customers: Customer[];
}

export const ReviewConfirmModal: React.FC<ReviewConfirmModalProps> = ({
    extractedRecord,
    onConfirm,
    onCancel,
    businessProfile,
    products,
    customers
}) => {
    const [editedRecord, setEditedRecord] = useState(extractedRecord);
    const isOrder = extractedRecord.recordType === 'order';

    const handleConfirm = () => {
        onConfirm(editedRecord);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-3xl bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-[#0F172A]">
                            {isOrder ? 'Review Order' : 'Review Expense'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Verify and edit the extracted information before saving
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8">
                    {isOrder ? (
                        <OrderReviewForm
                            extractedSale={editedRecord as ExtractedSale}
                            onChange={setEditedRecord}
                            businessProfile={businessProfile}
                            products={products}
                            customers={customers}
                        />
                    ) : (
                        <ExpenseReviewForm
                            extractedExpense={editedRecord as ExtractedExpense}
                            onChange={setEditedRecord}
                            businessProfile={businessProfile}
                        />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 p-8 border-t border-slate-100 bg-slate-50/30 flex-shrink-0">
                    <button
                        onClick={onCancel}
                        className="px-6 h-14 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-8 h-14 bg-[#2DD4BF] text-[#0F172A] font-black rounded-2xl hover:shadow-lg active:scale-95 transition-all"
                    >
                        {isOrder ? 'Confirm Order' : 'Confirm Expense'}
                    </button>
                </div>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { Shield, ChevronRight, Camera, Check, Lock, Building2, User } from 'lucide-react';

interface WalletOnboardingProps {
    onComplete: (data: any) => void;
    onCancel: () => void;
}

type Step = 'intro' | 'kyc' | 'face-verify' | 'business-info' | 'pin-setup';

export const WalletOnboarding: React.FC<WalletOnboardingProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState<Step>('intro');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        bvn: '',
        businessName: '',
        pin: '',
        confirmPin: ''
    });

    const nextStep = (next: Step) => setStep(next);

    const handleFaceVerification = () => {
        setLoading(true);
        // Mock verification delay
        setTimeout(() => {
            setLoading(false);
            nextStep('business-info');
        }, 2000);
    };

    const handleFinalSubmit = () => {
        if (formData.pin !== formData.confirmPin || formData.pin.length < 4) return;
        setLoading(true);
        setTimeout(() => {
            onComplete(formData);
        }, 1500);
    };

    const renderIntro = () => (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-[#2DD4BF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={40} className="text-[#2DD4BF]" />
            </div>
            <h2 className="text-2xl font-black text-[#0F172A]">Activate Business Wallet</h2>
            <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                Get a dedicated virtual account to receive payments, track expenses automatically, and unlock future credit.
            </p>

            <div className="space-y-3 pt-4">
                <button
                    onClick={() => nextStep('kyc')}
                    className="w-full h-14 bg-[#2DD4BF] text-[#0F172A] font-black rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Create Wallet <ChevronRight size={18} />
                </button>
                <button
                    onClick={onCancel}
                    className="w-full h-12 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                    Not Now
                </button>
            </div>
        </div>
    );

    const renderKYC = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setStep('intro')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
                    <ChevronRight size={20} className="rotate-180 text-slate-400" />
                </button>
                <h3 className="font-bold text-[#0F172A]">Identity Verification</h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Legal Full Name</label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] font-bold text-[#0F172A]"
                        placeholder="As shown on ID"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Date of Birth</label>
                    <input
                        type="date"
                        value={formData.dob}
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] font-bold text-[#0F172A]"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">BVN Information</label>
                    <input
                        type="number"
                        value={formData.bvn}
                        onChange={e => setFormData({ ...formData, bvn: e.target.value })}
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] font-mono font-bold text-[#0F172A]"
                        placeholder="11-digit BVN"
                    />
                </div>
            </div>

            <button
                disabled={!formData.fullName || !formData.dob || formData.bvn.length < 11}
                onClick={() => nextStep('face-verify')}
                className="w-full h-14 mt-4 bg-[#0F172A] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e293b] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Verify Identity <ChevronRight size={18} />
            </button>
        </div>
    );

    const renderFaceVerify = () => (
        <div className="text-center space-y-8 animate-in zoom-in duration-300 py-6">
            <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 border-4 border-[#2DD4BF] rounded-full animate-pulse" />
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                    {loading ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <span className="text-[#2DD4BF] font-mono animate-pulse">Scanning...</span>
                        </div>
                    ) : (
                        <User size={80} className="text-slate-300" />
                    )}
                </div>
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#0F172A] rounded-full flex items-center justify-center text-white shadow-lg">
                    <Camera size={20} />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0F172A]">Face Verification</h3>
                <p className="text-slate-500 text-sm">Center your face in the frame to confirm it's you.</p>
            </div>

            <button
                onClick={handleFaceVerification}
                disabled={loading}
                className="w-full h-14 bg-[#2DD4BF] text-[#0F172A] font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
                {loading ? 'Verifying...' : 'Start Scan'}
            </button>
        </div>
    );

    const renderBusinessInfo = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center space-y-2 mb-8">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Check size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Identity Verified!</h3>
                <p className="text-slate-500 text-sm">Now let's name your business wallet.</p>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Business Display Name</label>
                <div className="relative">
                    <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full h-14 pl-12 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] font-bold text-[#0F172A]"
                        placeholder="e.g. Tobi's Fashion"
                    />
                </div>
                <p className="text-[10px] text-slate-400 pl-2">This name will appear on transfer receipts.</p>
            </div>

            <button
                disabled={!formData.businessName}
                onClick={() => nextStep('pin-setup')}
                className="w-full h-14 mt-4 bg-[#0F172A] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e293b] active:scale-95 transition-all disabled:opacity-50"
            >
                Continue <ChevronRight size={18} />
            </button>
        </div>
    );

    const renderPinSetup = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Lock size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Secure your Wallet</h3>
                <p className="text-slate-500 text-sm">Create a 4-digit PIN for transactions.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Create PIN</label>
                    <input
                        type="password"
                        maxLength={4}
                        value={formData.pin}
                        onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 outline-none focus:border-[#2DD4BF] font-mono font-black text-2xl text-center tracking-[1em]"
                        placeholder="••••"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Confirm PIN</label>
                    <input
                        type="password"
                        maxLength={4}
                        value={formData.confirmPin}
                        onChange={e => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                        className={`w-full h-14 bg-white border rounded-2xl px-5 outline-none focus:border-[#2DD4BF] font-mono font-black text-2xl text-center tracking-[1em] ${formData.confirmPin && formData.pin !== formData.confirmPin ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                        placeholder="••••"
                    />
                </div>
            </div>

            <button
                disabled={formData.pin.length !== 4 || formData.pin !== formData.confirmPin || loading}
                onClick={handleFinalSubmit}
                className="w-full h-14 mt-4 bg-[#2DD4BF] text-[#0F172A] font-black rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
                {loading ? 'Creating Wallet...' : 'Finish Setup'}
            </button>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto min-h-[400px] flex flex-col justify-center">
            {step === 'intro' && renderIntro()}
            {step === 'kyc' && renderKYC()}
            {step === 'face-verify' && renderFaceVerify()}
            {step === 'business-info' && renderBusinessInfo()}
            {step === 'pin-setup' && renderPinSetup()}
        </div>
    );
};

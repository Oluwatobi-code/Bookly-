
import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  Globe, 
  Smartphone, 
  Bell, 
  Shield, 
  Palette,
  ChevronRight,
  Store,
  Tag,
  Star,
  X,
  Check,
  Camera,
  Mail,
  Phone as PhoneIcon,
  Cloud,
  Database,
  Lock,
  Crown,
  Layout,
  ToggleLeft,
  ToggleRight,
  Eye,
  TrendingUp,
  Trophy,
  Zap,
  Package,
  PieChart
} from 'lucide-react';
import { BusinessProfile, SalesSource, DashboardWidgets } from '../types';

interface SettingsProps {
  businessProfile: BusinessProfile | null;
  setBusinessProfile: (profile: BusinessProfile) => void;
}

type EditSection = 'profile' | 'branding' | 'financials' | 'notifications' | 'security' | 'platforms' | 'widgets' | 'none';

const SOURCES: SalesSource[] = ['WhatsApp', 'Instagram', 'Facebook', 'Walk-in', 'Phone Call', 'Other'];

const Settings: React.FC<SettingsProps> = ({ businessProfile, setBusinessProfile }) => {
  const [activeEdit, setActiveEdit] = useState<EditSection>('none');

  if (!businessProfile) return null;

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBusinessProfile({
      ...businessProfile,
      defaultSalesSource: e.target.value as SalesSource
    });
  };

  const toggleNotifications = () => {
    setBusinessProfile({
      ...businessProfile,
      notificationsEnabled: !businessProfile.notificationsEnabled
    });
  };

  const toggleWidget = (key: keyof DashboardWidgets) => {
    setBusinessProfile({
      ...businessProfile,
      dashboardWidgets: {
        ...businessProfile.dashboardWidgets,
        [key]: !businessProfile.dashboardWidgets[key]
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your professional identity and data rules.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SectionTitle title="Business Profile" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white shadow-sm">
            <SettingsItem icon={<Store size={20} />} label="Identity" sub={businessProfile.name} onClick={() => setActiveEdit('profile')} />
            <SettingsItem icon={<Palette size={20} />} label="Branding" sub="Logo & Receipt Customization" onClick={() => setActiveEdit('branding')} />
          </div>

          <SectionTitle title="Dashboard Layout" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white shadow-sm p-2">
            <div className="space-y-1">
              <WidgetToggle 
                icon={<Eye size={18} />} 
                label="Summary Stat Cards" 
                active={businessProfile.dashboardWidgets?.statCards} 
                onToggle={() => toggleWidget('statCards')} 
              />
              <WidgetToggle 
                icon={<TrendingUp size={18} />} 
                label="Revenue Trend Chart" 
                active={businessProfile.dashboardWidgets?.revenueTrend} 
                onToggle={() => toggleWidget('revenueTrend')} 
              />
              <WidgetToggle 
                icon={<Trophy size={18} />} 
                label="Top Performer Badge" 
                active={businessProfile.dashboardWidgets?.topPerformer} 
                onToggle={() => toggleWidget('topPerformer')} 
              />
              <WidgetToggle 
                icon={<Zap size={18} />} 
                label="Quick Action Buttons" 
                active={businessProfile.dashboardWidgets?.quickActions} 
                onToggle={() => toggleWidget('quickActions')} 
              />
              <WidgetToggle 
                icon={<Package size={18} />} 
                label="Inventory Health Status" 
                active={businessProfile.dashboardWidgets?.inventoryHealth} 
                onToggle={() => toggleWidget('inventoryHealth')} 
              />
              <WidgetToggle 
                icon={<PieChart size={18} />} 
                label="Channel Split Pie Chart" 
                active={businessProfile.dashboardWidgets?.channels} 
                onToggle={() => toggleWidget('channels')} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionTitle title="Financials & Rules" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white shadow-sm">
            <SettingsItem icon={<CreditCard size={20} />} label="Currency" sub={businessProfile.currency} onClick={() => setActiveEdit('financials')} />
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center"><Tag size={20} /></div>
                <div>
                  <p className="font-bold text-sm">Default Channel</p>
                  <p className="text-xs text-gray-500">For unsourced orders</p>
                </div>
              </div>
              <select 
                value={businessProfile.defaultSalesSource || 'Other'}
                onChange={handleSourceChange}
                className="bg-white border border-[#0F172A]/10 rounded-xl text-xs font-bold px-3 py-2 outline-none"
              >
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <SectionTitle title="Preferences & Notifications" />
          <div className="cyber-border rounded-3xl overflow-hidden divide-y divide-[#0F172A]/5 bg-white shadow-sm">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center"><Bell size={20} /></div>
                <div>
                  <p className="font-bold text-sm">In-app Notifications</p>
                  <p className="text-xs text-gray-500">Sale, Stock & CRM alerts</p>
                </div>
              </div>
              <button onClick={toggleNotifications} className={`w-12 h-6 rounded-full relative transition-colors ${businessProfile.notificationsEnabled ? 'bg-[#2DD4BF]' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${businessProfile.notificationsEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <SettingsItem icon={<Lock size={20} />} label="Storage Mode" sub={businessProfile.persistenceMode === 'cloud' ? 'Cloud Sync Enabled' : 'Local Device Only'} onClick={() => setActiveEdit('security')} />
            <div className="p-5">
               <div className="flex items-center gap-3 mb-2">
                 <Shield size={18} className="text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Compliance Shield Active</span>
               </div>
               <p className="text-[9px] text-gray-400 leading-relaxed italic">Last updated: {businessProfile.consentTimestamp ? new Date(businessProfile.consentTimestamp).toLocaleDateString() : 'Initial Setup'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">{title}</h2>
);

const SettingsItem: React.FC<{ icon: React.ReactNode, label: string, sub: string, onClick?: () => void }> = ({ icon, label, sub, onClick }) => (
  <button onClick={onClick} className="w-full p-5 flex items-center justify-between hover:bg-[#0F172A]/[0.02] transition-all group text-left">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-[#0F172A]/5 text-[#0F172A] rounded-xl flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all">{icon}</div>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </button>
);

const WidgetToggle: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onToggle: () => void }> = ({ icon, label, active, onToggle }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-2xl">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-[#2DD4BF]/10 text-[#2DD4BF]' : 'bg-gray-100 text-gray-400'}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-[#0F172A]">{label}</span>
    </div>
    <button 
      onClick={onToggle} 
      className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-[#2DD4BF]' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  </div>
);

export default Settings;

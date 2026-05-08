import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Sprout, 
  ClipboardList, 
  BookOpen, 
  Bug, 
  FlaskConical, 
  Wheat, 
  Wallet,
  Package,
  TrendingUp,
  Menu as MenuIcon,
  X,
  RefreshCcw,
  Beaker,
  Droplets
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { farms, selectedFarmId, setSelectedFarmId } = useStore();
  const { t } = useTranslation();
  
  const currentFarm = farms.find(f => f.id === selectedFarmId);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const allItems = [
    { to: '/', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/farms', icon: Map, label: t('sidebar.farms') },
    { to: '/cycles', icon: Sprout, label: t('sidebar.cycles') },
    { to: '/tasks', icon: ClipboardList, label: t('sidebar.tasks') },
    { to: '/soil', icon: Beaker, label: t('sidebar.soil') },
    { to: '/irrigation', icon: Droplets, label: t('sidebar.irrigation') },
    { to: '/inventory', icon: Package, label: t('sidebar.inventory') },
    { to: '/market', icon: TrendingUp, label: t('sidebar.markets') },
    { to: '/scouting', icon: Bug, label: t('sidebar.pest_log') },
    { to: '/fertilizer', icon: FlaskConical, label: t('sidebar.fertilizer') },
    { to: '/harvest', icon: Wheat, label: t('sidebar.harvest') },
    { to: '/finance', icon: Wallet, label: t('sidebar.finance') },
    { to: '/library', icon: BookOpen, label: t('sidebar.library') },
  ];

  const mobileBottomNavItems = [
    { to: '/', icon: LayoutDashboard, label: t('sidebar.home') },
    { to: '/tasks', icon: ClipboardList, label: t('sidebar.tasks') },
    { to: '/inventory', icon: Package, label: t('sidebar.stock') },
  ];

  const mobileMenuOnlyItems = [
    { to: '/farms', icon: Map, label: t('sidebar.farms') },
    { to: '/cycles', icon: Sprout, label: t('sidebar.cycles') },
    { to: '/soil', icon: Beaker, label: t('sidebar.soil') },
    { to: '/irrigation', icon: Droplets, label: t('sidebar.irrigation') },
    { to: '/market', icon: TrendingUp, label: t('sidebar.markets') },
    { to: '/scouting', icon: Bug, label: t('sidebar.pest_log') },
    { to: '/fertilizer', icon: FlaskConical, label: t('sidebar.fertilizer') },
    { to: '/harvest', icon: Wheat, label: t('sidebar.harvest') },
    { to: '/finance', icon: Wallet, label: t('sidebar.finance') },
    { to: '/library', icon: BookOpen, label: t('sidebar.library') },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-earth-100 z-10 sticky top-0 ltr:text-left rtl:text-right">
        <div className="flex items-center gap-3 font-bold text-xl">
          <div className="w-8 h-8 bg-terracotta-500 rounded-lg flex items-center justify-center text-white">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-earth-900 leading-tight">Deurbi <span className="text-terracotta-500">Farms</span></span>
            {currentFarm && (
              <button 
                onClick={() => setSelectedFarmId(null)}
                className="text-[10px] text-forest-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5 line-clamp-1 text-left rtl:text-right"
              >
                {currentFarm.name}
                <RefreshCcw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col items-center py-6 bg-[#050505] text-white w-[88px] flex-shrink-0 z-50 h-full border-r rtl:border-l rtl:border-r-0 border-white/10 shadow-2xl">
        <div className="mb-8 mt-2 relative group">
          <div className="w-[48px] h-[48px] bg-forest-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-transform hover:scale-110">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          {currentFarm && (
            <button 
              onClick={() => setSelectedFarmId(null)}
              className="absolute -right-2 -bottom-2 w-6 h-6 bg-earth-900 rounded-full flex items-center justify-center text-forest-400 border border-white/10 shadow-xl hover:bg-forest-900 transition-all scale-0 group-hover:scale-100 object-cover"
              title="Change Farm Plot"
            >
              <RefreshCcw className="w-3 h-3" />
            </button>
          )}
        </div>
        <nav className="flex flex-col gap-4 w-full items-center">
          {allItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "group relative flex items-center justify-center rounded-2xl transition-all duration-300 w-[52px] h-[52px]",
                isActive 
                  ? "bg-white text-earth-900 shadow-lg scale-105" 
                  : "text-white/40 hover:bg-white/10 hover:text-white"
              )}
              title={item.label}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-6 h-6 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                  {/* Tooltip */}
                  <div className="absolute ltr:left-full rtl:right-full ltr:ml-4 rtl:mr-4 px-3 py-1.5 bg-white text-earth-900 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 ltr:-translate-x-4 rtl:translate-x-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50">
                    {item.label}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-earth-100 z-40 px-6 py-2 flex justify-between items-center pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {mobileBottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-terracotta-500" : "text-earth-400 hover:text-earth-600"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-6 h-6", isActive ? "fill-terracotta-500/20" : "")} />
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-2 text-earth-400 hover:text-earth-600 transition-colors"
        >
          <MenuIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold tracking-wide">{t('sidebar.more')}</span>
        </button>
      </div>

      {/* Mobile "More" Menu Fullscreen Overlay */}
      <div className={cn(
        "fixed inset-0 z-[60] bg-earth-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
        isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="flex flex-shrink-0 items-center justify-between p-4 bg-white border-b border-earth-100 pt-[max(env(safe-area-inset-top),16px)]">
          <h2 className="text-xl font-bold text-earth-900">{t('sidebar.all_modules')}</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-earth-100 rounded-full text-earth-600 hover:bg-earth-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-24">
          {mobileMenuOnlyItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-colors bg-white shadow-sm border",
                isActive ? "border-terracotta-500 text-terracotta-700" : "border-earth-100 text-earth-700"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn("p-3 rounded-xl", isActive ? "bg-terracotta-100 text-terracotta-600" : "bg-earth-50 text-earth-500")}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}

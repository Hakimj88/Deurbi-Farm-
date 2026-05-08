import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
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
      <div className="hidden md:flex flex-col items-center py-8 bg-[#0A0A0A] text-white w-[100px] flex-shrink-0 z-50 h-full border-r rtl:border-l rtl:border-r-0 border-white/5 shadow-2xl relative">
        <div className="mb-10 mt-2 relative group px-4">
          <Link to="/" className="w-full aspect-square bg-gradient-to-br from-forest-500 to-forest-700 rounded-2xl flex items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(22,163,74,0.25)] transition-all duration-500 hover:rotate-12 hover:scale-110 active:scale-95 group">
            <Sprout className="w-7 h-7 text-white animate-in zoom-in duration-500" />
            
            {/* Pulsing indicator for active farm */}
            {currentFarm && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-terracotta-500 rounded-full border-2 border-[#0A0A0A] animate-pulse" />
            )}
          </Link>
        </div>

        <nav className="flex flex-col gap-3 w-full items-center px-3 flex-1 overflow-y-auto custom-scrollbar no-scrollbar">
          {allItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "group relative flex items-center justify-center rounded-2xl transition-all duration-400 w-full aspect-square",
                isActive 
                  ? "bg-white text-earth-900 shadow-xl shadow-black/20" 
                  : "text-white/30 hover:bg-white/5 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-6 h-6 transition-all duration-500", isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3")} />
                  {/* Tooltip */}
                  <div className="absolute ltr:left-full rtl:right-full ltr:ml-4 rtl:mr-4 px-4 py-2 bg-white text-earth-900 text-[11px] font-display font-bold uppercase tracking-widest rounded-xl opacity-0 ltr:-translate-x-4 rtl:translate-x-4 pointer-events-none transition-all duration-400 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap shadow-2xl z-50 border border-earth-100">
                    {item.label}
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute ltr:left-[-12px] rtl:right-[-12px] w-1 h-8 bg-forest-500 rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {currentFarm && (
          <div className="mt-auto py-8 w-full px-4 text-center">
            <button 
              onClick={() => setSelectedFarmId(null)}
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-forest-500/10 border border-white/5 flex items-center justify-center text-forest-400 transition-all hover:scale-110 active:scale-95 group"
              title="Switch Plot"
            >
              <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
            </button>
            <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-3 truncate px-1">{currentFarm.name}</p>
          </div>
        )}
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

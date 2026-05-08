import { motion } from 'motion/react';
import { useStore } from '../store';
import { Sprout, CheckCircle2, Clock, AlertCircle, Sparkles, Loader2, Map, CloudSun, Package, TrendingUp, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateFarmInsights } from '../lib/gemini';
import { WeatherWidget } from '../components/WeatherWidget';
import { fetchWeather, WeatherData } from '../services/weatherService';
import { cropLibrary } from '../data/cropLibrary';
import { CropCycleProgressBar } from '../components/CropCycleProgressBar';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { t } = useTranslation();
  const { farmer, cropCycles, tasks, farms, scoutingRecords, harvestRecords, selectedFarmId, toggleChecklistItem, completeTask, inventory, financialRecords, soilTests, irrigationRecords } = useStore();
  
  const currentFarm = farms.find(f => f.id === selectedFarmId);
  
  const currentFarmCycles = cropCycles.filter(c => c.farmId === selectedFarmId);
  const currentFarmTasks = tasks.filter(t => {
    const cycle = currentFarmCycles.find(c => c.id === t.cropCycleId);
    return !!cycle;
  });

  const farmFinancialRecords = financialRecords.filter(r => currentFarmCycles.some(c => c.id === r.cropCycleId));
  const farmRevenue = farmFinancialRecords.filter(r => r.category === 'revenue').reduce((acc, curr) => acc + curr.totalCost, 0);
  const farmExpenses = farmFinancialRecords.filter(r => r.category !== 'revenue').reduce((acc, curr) => acc + curr.totalCost, 0);
  const farmProfitability = farmRevenue - farmExpenses;

  const latestSoilTest = [...soilTests].reverse().find(t => currentFarmCycles.some(c => c.id === t.cropCycleId));
  const recentIrrigation = irrigationRecords.filter(r => currentFarmCycles.some(c => c.id === r.cropCycleId)).reduce((acc, curr) => acc + curr.volume, 0);

  const activeCycles = currentFarmCycles.filter(c => c.status === 'active');
  const pendingTasks = currentFarmTasks.filter(t => t.status !== 'completed');
  const lowStockItems = inventory.filter(i => i.quantity <= i.minThreshold);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tasksDueToday = pendingTasks.filter(t => t.dueDate === todayStr);

  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      if (!currentFarm?.latitude || !currentFarm?.longitude) return;
      
      try {
        const weather = await fetchWeather(currentFarm.latitude, currentFarm.longitude);
        setCurrentWeather(weather);
        
        // Fetch AI insights after getting weather
        setLoadingInsights(true);
        const dataForAI = {
          activeCycles,
          pendingTasks: pendingTasks.length,
          recentScouting: scoutingRecords.slice(0, 5),
          recentHarvests: harvestRecords.slice(0, 5),
          weather: {
            temp: weather.temp,
            condition: weather.description,
            humidity: weather.humidity,
            rain: weather.rain,
            forecast: weather.forecast
          }
        };
        const newInsights = await generateFarmInsights(dataForAI);
        setInsights(newInsights);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInsights(false);
      }
    }
    
    if (insights.length === 0) {
      loadInitialData();
    }
  }, [currentFarm, farms, cropCycles, tasks, scoutingRecords, harvestRecords]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-700 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-10 border-b border-earth-100">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-forest-50 text-forest-600 rounded-[1.25rem] shadow-sm border border-forest-100">
               <Map className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-display font-black text-forest-600 uppercase tracking-[0.3em]">{currentFarm?.name || "Global Farm Operations"}</p>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-display font-black text-earth-900 tracking-tighter mb-4 sm:mb-6 leading-[0.85] italic">
            {getGreeting()},<br/>
            <span className="text-terracotta-600">{farmer?.name || 'Farmer'}</span>
          </h1>
          <p className="text-earth-400 font-medium text-lg sm:text-xl max-w-xl leading-relaxed italic">{t('dashboard.overview')}</p>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-display font-bold text-earth-700 bg-white px-6 sm:px-10 py-4 sm:py-6 rounded-[2rem] sm:rounded-[2.5rem] border border-earth-100 shadow-soft transition-all hover:shadow-elevated hover:scale-[1.02] cursor-default group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CloudSun className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
          <div className="flex flex-col relative z-10">
            <span className="uppercase tracking-[0.2em] text-[10px] text-earth-300 font-black mb-1">{format(new Date(), 'EEEE').toUpperCase()}</span>
            <span className="tracking-tighter text-xl sm:text-2xl font-black text-earth-900">{format(new Date(), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          {/* AI Insights Banner - Ultra Premium */}
          {(insights.length > 0 || loadingInsights) && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[3rem] bg-[#0A0A0A] text-white shadow-3xl border border-white/5"
            >
              <div className="absolute top-0 right-0 p-24 opacity-[0.05] rotate-12 flex justify-end pointer-events-none">
                <Sparkles className="w-[800px] h-[800px] text-amber-400 animate-pulse" />
              </div>
              
              <div className="relative z-10 p-6 sm:p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12">
                <div className="md:w-1/3 flex flex-col justify-between">
                  <div>
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-900/40 mb-6 sm:mb-8 border border-white/20">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tighter italic leading-none">{t('dashboard.ai_insights')}</h2>
                    <p className="text-amber-500 text-[9px] sm:text-[10px] font-display font-black uppercase tracking-[0.4em] mt-4 sm:mt-5">{t('dashboard.realtime_analysis')}</p>
                  </div>
                  
                  <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 hidden md:block">
                     <p className="text-white/40 text-[10px] sm:text-xs font-medium leading-relaxed pr-6 uppercase tracking-widest">Precision agriculture engine v2.0</p>
                  </div>
                </div>

                <div className="md:w-2/3 bg-white/[0.03] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-xl border border-white/10 shadow-inner">
                  {loadingInsights ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
                      <p className="text-xs font-display font-black tracking-[0.3em] uppercase text-white/40">{t('dashboard.analyzing')}</p>
                    </div>
                  ) : (
                    <ul className="space-y-8">
                      {insights.map((insight, idx) => (
                        <motion.li 
                          key={idx} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.15 }}
                          className="flex gap-6 items-start group"
                        >
                          <span className="flex-shrink-0 w-12 h-12 rounded-[1.25rem] bg-white/5 flex items-center justify-center text-xs font-display font-black text-amber-500 border border-white/5 group-hover:bg-amber-500 group-hover:text-[#0A0A0A] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                            {idx + 1}
                          </span>
                          <p className="text-lg leading-relaxed text-white/70 font-medium group-hover:text-white transition-colors duration-300 pt-2">{insight}</p>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* KPI Bento Grid - Ultra Premium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <motion.div whileHover={{ y: -8 }} className="card p-6 sm:p-8 lg:p-10 card-hover relative overflow-hidden group border-earth-100">
              <div className="absolute top-0 right-0 p-6 sm:p-8 lg:p-10 opacity-[0.03] -mr-6 -mt-6 group-hover:scale-125 transition-transform duration-700 italic font-black text-4xl">STATS</div>
              <div className="p-3 sm:p-4 bg-forest-50 text-forest-600 rounded-2xl sm:rounded-3xl border border-forest-100 w-fit mb-6 sm:mb-8 shadow-sm">
                <Sprout className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <p className="text-5xl sm:text-6xl font-display font-black text-earth-900 tracking-tighter leading-none italic">{activeCycles.length}</p>
              <div className="flex items-center gap-2 mt-4 sm:mt-6">
                <span className="w-1.5 h-1.5 bg-forest-500 rounded-full"></span>
                <p className="text-[9px] sm:text-[10px] font-display font-black text-earth-400 uppercase tracking-widest leading-none">{t('dashboard.active_cycles')}</p>
              </div>
            </motion.div>
            
            <motion.div whileHover={{ y: -8 }} className="card p-6 sm:p-8 lg:p-10 card-hover relative overflow-hidden group border-earth-100">
              <div className="p-3 sm:p-4 bg-amber-50 text-amber-600 rounded-2xl sm:rounded-3xl border border-amber-100 w-fit mb-6 sm:mb-8 shadow-sm">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <p className="text-5xl sm:text-6xl font-display font-black text-earth-900 tracking-tighter leading-none italic">{pendingTasks.length}</p>
              <div className="flex items-center gap-2 mt-4 sm:mt-6">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                <p className="text-[9px] sm:text-[10px] font-display font-black text-earth-400 uppercase tracking-widest leading-none">TASKS DUE</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="card p-6 sm:p-8 lg:p-10 card-hover relative overflow-hidden group border-earth-100">
              <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-2xl sm:rounded-3xl border border-blue-100 w-fit mb-6 sm:mb-8 shadow-sm">
                <Package className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <p className={cn("text-5xl sm:text-6xl font-display font-black tracking-tighter leading-none italic", lowStockItems.length > 0 ? 'text-terracotta-600 underline decoration-4 underline-offset-8' : 'text-earth-900')}>
                {lowStockItems.length}
              </p>
              <div className="flex items-center gap-2 mt-4 sm:mt-6">
                <span className={cn("w-1.5 h-1.5 rounded-full", lowStockItems.length > 0 ? 'bg-terracotta-500 animate-pulse' : 'bg-blue-500')}></span>
                <p className="text-[9px] sm:text-[10px] font-display font-black text-earth-400 uppercase tracking-widest leading-none">SUPPLY ALERTS</p>
              </div>
            </motion.div>

            <Link to="/finance" className="card p-6 sm:p-8 lg:p-10 card-hover relative overflow-hidden group border-earth-100 hover:bg-forest-900 hover:text-white transition-all duration-700">
              <div className="p-3 sm:p-4 bg-forest-50 text-forest-600 rounded-2xl sm:rounded-3xl border border-forest-100 w-fit mb-6 sm:mb-8 shadow-sm group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white animate-soft-bounce">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <p className={cn("text-3xl sm:text-4xl lg:text-4xl font-display font-black tracking-tighter leading-none italic transition-colors flex items-end gap-1 truncate", farmProfitability >= 0 ? "text-forest-600 group-hover:text-white" : "text-terracotta-600 group-hover:text-terracotta-400")}>
                {farmProfitability >= 0 ? "+" : ""}{farmProfitability >= 1000 ? `${(farmProfitability / 1000).toFixed(1)}k` : farmProfitability.toLocaleString()} <span className="text-sm sm:text-base font-black opacity-40 uppercase ml-1">GMD</span>
              </p>
              <div className="flex items-center gap-2 mt-4 sm:mt-6">
                <span className="w-1.5 h-1.5 bg-forest-500 rounded-full group-hover:bg-amber-400"></span>
                <p className="text-[9px] sm:text-[10px] font-display font-black text-earth-400 group-hover:text-white/40 uppercase tracking-widest leading-none">LEDGER BALANCE</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Link to="/soil" className="card p-6 sm:p-8 lg:p-10 card-hover group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8 bg-white border-earth-100 hover:scale-[1.01]">
              <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
                <div className="p-4 sm:p-5 bg-amber-50 text-amber-600 rounded-[1.5rem] sm:rounded-[2rem] border border-amber-100 group-hover:bg-amber-100 group-hover:-rotate-12 transition-all duration-500">
                  <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                   <p className="text-[9px] sm:text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-2 sm:mb-3 leading-none italic">Biosphere Health</p>
                   <p className="text-4xl sm:text-5xl font-display font-black text-earth-900 tracking-tighter leading-none italic">{latestSoilTest?.ph || '6.5'} <span className="text-lg sm:text-xl opacity-20">pH</span></p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                 <p className="text-[9px] font-display font-black text-amber-600 uppercase tracking-widest leading-none mb-2 sm:mb-3 hidden sm:block">Status</p>
                 <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-50 rounded-full text-[10px] sm:text-xs font-display font-black text-amber-700 border border-amber-100">OPTIMAL</span>
              </div>
            </Link>

            <Link to="/irrigation" className="card p-6 sm:p-8 lg:p-10 card-hover group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8 bg-white border-earth-100 hover:scale-[1.01]">
              <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
                <div className="p-4 sm:p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] sm:rounded-[2rem] border border-blue-100 group-hover:bg-blue-100 group-hover:rotate-12 transition-all duration-500">
                  <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                   <p className="text-[9px] sm:text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-2 sm:mb-3 leading-none italic">Hydration Flux</p>
                   <p className="text-4xl sm:text-5xl font-display font-black text-earth-900 tracking-tighter leading-none italic">{recentIrrigation} <span className="text-lg sm:text-xl opacity-20 truncate">liters</span></p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                 <p className="text-[9px] font-display font-black text-blue-600 uppercase tracking-widest leading-none mb-2 sm:mb-3 hidden sm:block">Status</p>
                 <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 rounded-full text-[10px] sm:text-xs font-display font-black text-blue-700 border border-blue-100">NORMAL</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-8 h-full">
          <WeatherWidget 
            lat={currentFarm?.latitude} 
            lon={currentFarm?.longitude} 
            locationName={currentFarm?.name} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Cycles - Refined Display */}
        <section className="card p-0 overflow-hidden border-earth-200 shadow-xl bg-white">
          <div className="p-10 border-b border-earth-100 bg-earth-50/30 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-2 h-2 bg-forest-600 rounded-full"></div>
                 <h2 className="text-[10px] font-display font-black text-forest-600 uppercase tracking-[0.4em]">{t('sidebar.cycles')}</h2>
              </div>
              <h3 className="text-3xl font-display font-black italic tracking-tighter text-earth-900 leading-none">{t('dashboard.current_plantings')}</h3>
            </div>
            <Link to="/cycles" className="text-[10px] font-display font-black text-earth-400 hover:text-earth-900 transition-colors uppercase tracking-widest border-b border-earth-200 pb-1">View Archive</Link>
          </div>
          <div className="p-10 space-y-8">
            {activeCycles.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-earth-50 rounded-[2.5rem] border border-earth-100 flex items-center justify-center mb-6 shadow-inner">
                   <Sprout className="w-10 h-10 text-earth-200" />
                </div>
                <p className="text-earth-400 font-display font-black uppercase tracking-[0.2em] text-xs">{t('dashboard.no_active_cycles')}</p>
              </div>
            ) : (
              activeCycles.map((cycle, idx) => {
                const farm = farms.find(f => f.id === cycle.farmId);
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={cycle.id}
                  >
                    <Link to={`/cycles/${cycle.id}`} className="block group">
                      <div className="flex items-center gap-8 mb-6">
                        <div className="h-20 w-20 bg-forest-50 border border-forest-100 rounded-[2rem] flex items-center justify-center group-hover:bg-forest-600 group-hover:scale-110 transition-all duration-500 shadow-sm relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <Sprout className="w-10 h-10 text-forest-600 group-hover:text-white relative z-10 transition-colors duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-4 mb-2">
                            <h4 className="font-display font-black text-earth-900 text-3xl italic tracking-tighter group-hover:text-forest-600 transition-colors truncate">{cycle.purpose} {cycle.variety}</h4>
                            <span className="px-3 py-1 bg-forest-100 text-forest-700 text-[9px] font-display font-black uppercase tracking-widest rounded-xl">ACTIVE</span>
                          </div>
                          <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] flex items-center gap-3">
                            {farm?.name} <span className="w-1.5 h-1.5 bg-earth-200 rounded-full"></span> {cycle.area} LECTARES
                          </p>
                        </div>
                      </div>
                      <CropCycleProgressBar cycle={cycle} crop={cropLibrary.find(c => c.id === cycle.cropId)} />
                    </Link>
                  </motion.div>
                )
              })
            )}
          </div>
        </section>

        {/* Action Items - Refined Display */}
        <section className="card p-0 overflow-hidden border-earth-200 shadow-xl bg-white">
          <div className="p-10 border-b border-earth-100 bg-earth-50/30 flex justify-between items-end">
             <div>
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <h2 className="text-[10px] font-display font-black text-amber-600 uppercase tracking-[0.4em]">{t('dashboard.tasks_due')}</h2>
               </div>
               <h3 className="text-3xl font-display font-black italic tracking-tighter text-earth-900 leading-none">{t('dashboard.action_items')}</h3>
             </div>
             <Link to="/tasks" className="text-[10px] font-display font-black text-earth-400 hover:text-earth-900 transition-colors uppercase tracking-widest border-b border-earth-200 pb-1 text-right">Task Matrix</Link>
          </div>
          <div className="p-10 space-y-6">
            {pendingTasks.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-forest-50 rounded-[2.5rem] border border-forest-100 flex items-center justify-center mb-6 shadow-inner">
                   <CheckCircle2 className="w-10 h-10 text-forest-200" />
                </div>
                <p className="text-earth-400 font-display font-black uppercase tracking-[0.2em] text-xs">{t('dashboard.all_completed')}</p>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((task, idx) => {
                const isExpanded = expandedTaskId === task.id;
                const isDueToday = task.dueDate === todayStr;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={task.id} 
                    className={`border rounded-[2.5rem] transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-earth-50 border-earth-200 shadow-lg' : 'bg-white border-earth-100 hover:border-earth-300'}`}
                  >
                    <div 
                      className="p-8 flex items-center gap-6 cursor-pointer group"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-[1.75rem] border flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110",
                        isDueToday ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-earth-50 border-earth-100 text-earth-400'
                      )}>
                        {isDueToday ? <AlertCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-2 overflow-hidden">
                          <p className="font-display font-black text-earth-900 text-2xl italic tracking-tighter truncate uppercase group-hover:text-forest-600 transition-colors">{task.taskType}</p>
                          {task.checklist && (
                            <span className="px-3 py-1 bg-white border border-earth-200 text-earth-900 text-[9px] font-display font-black uppercase tracking-widest rounded-xl shadow-sm">
                              {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                            </span>
                          )}
                        </div>
                        <p className={cn("text-[9px] font-display font-black uppercase tracking-[0.3em] font-bold", isDueToday ? "text-amber-600 animate-pulse" : "text-earth-300")}>
                          {t('dashboard.due')}: {task.dueDate}
                        </p>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-10 pb-10 space-y-6 pt-2 animate-in slide-in-from-top-4 duration-500">
                        <div className="h-px bg-earth-200 w-full mb-6 opacity-30"></div>
                        {task.checklist ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {task.checklist.map(item => (
                              <label key={item.id} className="flex items-center gap-4 cursor-pointer group/item p-4 bg-white/50 rounded-2xl border border-earth-100 hover:bg-white hover:border-forest-200 transition-all">
                                <input 
                                  type="checkbox" 
                                  className="w-5 h-5 rounded-lg text-forest-600 focus:ring-forest-500 border-earth-300 transition-all"
                                  checked={item.completed}
                                  onChange={() => toggleChecklistItem(task.id, item.id)}
                                />
                                <span className={cn(
                                  "text-sm font-display font-bold transition-all",
                                  item.completed ? 'text-earth-300 line-through' : 'text-earth-700'
                                )}>{item.label}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-earth-400 italic font-medium font-serif">{t('dashboard.no_checklist')}</p>
                        )}
                        
                        <div className="flex gap-4 mt-8">
                           <button 
                             onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}
                             disabled={task.checklist && !task.checklist.every(i => i.completed)}
                             className="flex-1 bg-forest-900 text-white font-display font-black py-5 rounded-[1.5rem] text-xs uppercase tracking-widest shadow-2xl shadow-forest-900/10 hover:bg-forest-800 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                           >
                             EXECUTE COMPLETE
                           </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
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

  const latestSoilTest = soilTests.findLast(t => currentFarmCycles.some(c => c.id === t.cropCycleId));
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

  return (
    <div className="space-y-6">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-forest-100 text-forest-600 rounded-xl shadow-sm">
               <Map className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-forest-600 uppercase tracking-[0.2em]">{currentFarm?.name}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-earth-900 tracking-tighter mb-2">
            {t('dashboard.welcome')},<br/>
            <span className="text-forest-600 italic">{farmer?.name || 'Farmer'}</span>
          </h1>
          <p className="text-earth-500 font-medium text-lg mt-4 max-w-lg">{t('dashboard.overview')}</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold text-earth-600 bg-white px-6 py-4 rounded-2xl border border-earth-100 shadow-sm transition-transform hover:scale-105 cursor-default">
          <CloudSun className="w-5 h-5 text-amber-500" />
          <span className="uppercase tracking-widest text-[11px]">{format(new Date(), 'EEEE, MMMM do')}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights Banner */}
          {(insights.length > 0 || loadingInsights) && (
            <div className="relative overflow-hidden rounded-[32px] bg-forest-900 text-white shadow-2xl shadow-forest-900/20 mb-8 border border-forest-800">
               <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 flex justify-end">
                 <Sparkles className="w-64 h-64 text-amber-400" />
               </div>
               <div className="relative z-10 p-8 border-b border-white/5 bg-white/5 flex items-center justify-between backdrop-blur-md">
                 <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-inner">
                     <Sparkles className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black tracking-tight italic">{t('dashboard.ai_insights')}</h2>
                     <p className="text-forest-200 text-[10px] font-bold uppercase tracking-widest mt-1">{t('dashboard.realtime_analysis')}</p>
                   </div>
                 </div>
               </div>
              <div className="relative z-10 p-8 bg-forest-900/50">
                {loadingInsights ? (
                  <div className="flex items-center gap-4 text-forest-200 py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-sm font-bold tracking-widest uppercase">{t('dashboard.analyzing')}</p>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {insights.map((insight, idx) => (
                      <li key={idx} className="flex gap-4 items-start group">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-amber-400 border border-white/10 group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </span>
                        <p className="text-base leading-relaxed text-forest-50 font-medium">{insight}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6 bg-earth-50/50 hover:bg-white border-earth-100 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-earth-100 text-forest-500">
                  <Sprout className="w-6 h-6" />
                </div>
              </div>
              <p className="text-4xl font-black text-earth-900 tracking-tighter truncate">{activeCycles.length}</p>
              <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mt-2">{t('dashboard.active_cycles')}</p>
            </div>
            
            <div className="card p-6 bg-earth-50/50 hover:bg-white border-earth-100 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-earth-100 text-amber-500">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <p className="text-4xl font-black text-earth-900 tracking-tighter truncate">{pendingTasks.length}</p>
              <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mt-2">{t('dashboard.pending_tasks')}</p>
            </div>

            <div className="card p-6 bg-earth-50/50 hover:bg-white border-earth-100 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-earth-100 text-blue-500">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <p className={cn("text-4xl font-black tracking-tighter truncate", lowStockItems.length > 0 ? 'text-terracotta-600' : 'text-earth-900')}>{lowStockItems.length}</p>
              <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mt-2">{t('dashboard.stock_alerts')}</p>
            </div>

          <Link to="/finance" className="card p-6 bg-earth-50/50 hover:bg-white border-earth-100 transition-colors group block cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-earth-100 text-forest-500">
                  <Calculator className="w-6 h-6" />
                </div>
              </div>
              <p className={cn("text-4xl font-black tracking-tighter truncate", farmProfitability >= 0 ? "text-forest-600" : "text-terracotta-600")}>
                {farmProfitability >= 0 ? "+" : ""}{farmProfitability >= 1000 ? `${(farmProfitability / 1000).toFixed(1)}k` : farmProfitability} <span className="text-xl">GMD</span>
              </p>
              <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mt-2 flex items-center justify-between">
                 <span className="truncate">{t('dashboard.net_profit')}</span>
                 <span className="text-earth-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">{t('common.view_details')} →</span>
              </p>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/soil" className="card p-6 bg-amber-50/30 hover:bg-white border-amber-100 transition-colors group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-amber-100 text-amber-600">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest leading-none mb-1">Latest Soil pH</p>
                   <p className="text-2xl font-black text-earth-900 tracking-tight">{latestSoilTest?.ph || '6.5'}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Health Status</p>
                 <p className="text-sm font-black text-earth-900 italic">Optimal</p>
              </div>
            </Link>

            <Link to="/irrigation" className="card p-6 bg-blue-50/30 hover:bg-white border-blue-100 transition-colors group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-blue-100 text-blue-600">
                  <CloudSun className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest leading-none mb-1">Weekly Water</p>
                   <p className="text-2xl font-black text-earth-900 tracking-tight">{recentIrrigation} L</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Usage</p>
                 <p className="text-sm font-black text-earth-900 italic">Normal</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Weather Center */}
          <WeatherWidget 
            lat={currentFarm?.latitude} 
            lon={currentFarm?.longitude} 
            locationName={currentFarm?.name} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Cycles */}
        <section className="card p-0 overflow-hidden border-earth-100 shadow-md">
          <div className="p-6 border-b border-earth-100 bg-earth-50/80 backdrop-blur-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-earth-900 uppercase tracking-tight">{t('sidebar.cycles')}</h2>
              <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mt-1">{t('dashboard.current_plantings')}</p>
            </div>
          </div>
          <div className="p-6 space-y-4 bg-white">
            {activeCycles.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <Sprout className="w-12 h-12 text-earth-200 mb-3" />
                <p className="text-earth-500 font-bold uppercase tracking-widest text-sm">{t('dashboard.no_active_cycles')}</p>
              </div>
            ) : (
              activeCycles.map(cycle => {
                const farm = farms.find(f => f.id === cycle.farmId);
                return (
                  <Link to={`/cycles/${cycle.id}`} key={cycle.id} className="block p-5 rounded-2xl border border-earth-100 bg-white hover:bg-forest-50/30 hover:border-forest-200 transition-all active:scale-[0.98] group relative overflow-hidden">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 bg-forest-50 border border-forest-100 rounded-2xl flex items-center justify-center group-hover:bg-forest-500 transition-colors shadow-sm">
                        <Sprout className="w-6 h-6 text-forest-600 group-hover:text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-earth-900 text-lg uppercase tracking-tight group-hover:text-forest-700 transition-colors truncate pr-2">{cycle.purpose} {cycle.variety}</p>
                          <span className="flex-shrink-0 px-3 py-1 bg-forest-50 border border-forest-100 text-forest-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            Active
                          </span>
                        </div>
                        <p className="text-xs font-bold text-earth-500 uppercase tracking-widest truncate">{farm?.name} <span className="mx-2 opacity-30">•</span> {cycle.area} ha</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-earth-100">
                      <CropCycleProgressBar cycle={cycle} crop={cropLibrary.find(c => c.id === cycle.cropId)} />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </section>

        {/* Tasks Due Today & Pending */}
        <section className="card p-0 overflow-hidden border-earth-100 shadow-md">
          <div className="p-6 border-b border-earth-100 bg-earth-50/80 backdrop-blur-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-earth-900 uppercase tracking-tight">{t('dashboard.tasks_due')}</h2>
              <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mt-1">{t('dashboard.action_items')}</p>
            </div>
          </div>
          <div className="p-6 space-y-4 bg-white">
            {pendingTasks.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-12 h-12 text-earth-200 mb-3" />
                <p className="text-earth-500 font-bold uppercase tracking-widest text-sm">{t('dashboard.all_completed')}</p>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map(task => {
                const isExpanded = expandedTaskId === task.id;
                return (
                  <div key={task.id} className={`border rounded-[24px] border-earth-100 overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-forest-50/30 border-forest-200' : 'bg-white hover:border-earth-300'}`}>
                    <div 
                      className="p-5 flex items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    >
                      {task.dueDate === todayStr ? (
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-earth-50 border border-earth-100 flex items-center justify-center flex-shrink-0 text-earth-500">
                          <Clock className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 overflow-hidden">
                          <p className="font-black text-earth-900 tracking-tight truncate">{task.taskType}</p>
                          {task.checklist && (
                            <span className="text-[9px] bg-white border border-earth-200 text-earth-600 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest shadow-sm flex-shrink-0">
                              {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-earth-500 font-bold uppercase tracking-widest truncate">{t('dashboard.due')}: {task.dueDate}</p>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-12 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {task.checklist ? (
                          <div className="space-y-1.5">
                            {task.checklist.slice(0, 3).map(item => (
                              <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500"
                                  checked={item.completed}
                                  onChange={() => toggleChecklistItem(task.id, item.id)}
                                />
                                <span className={`text-[11px] ${item.completed ? 'text-earth-400 line-through' : 'text-earth-600'}`}>{item.label}</span>
                              </label>
                            ))}
                            {task.checklist.length > 3 && (
                              <p className="text-[10px] text-earth-400 font-bold uppercase tracking-widest pl-6">+{task.checklist.length - 3} more items...</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-earth-400 italic">{t('dashboard.no_checklist')}</p>
                        )}
                        
                        {(!task.checklist || task.checklist.every(i => i.completed)) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              completeTask(task.id);
                            }}
                            className="w-full py-1.5 bg-forest-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                          >
                            {t('dashboard.complete_task')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
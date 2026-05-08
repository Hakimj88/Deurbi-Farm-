import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { cropLibrary } from '../data/cropLibrary';
import { botanicalsLibrary } from '../data/botanicalsLibrary';
import { cropPlans } from '../data/cropPlans';
import { FertilizerSchedule } from '../types';
import { 
  ArrowLeft, Sprout, Calendar, MapPin, Target, Wallet, Wheat, FlaskConical, Bug, 
  CheckCircle2, Circle, AlertCircle, Lightbulb, Sparkles, Loader2, Info, Droplet, 
  FlaskRound as Flask, Zap, ShieldCheck, RefreshCcw, Plus, X, Trash2, CloudRain, Thermometer, Sun
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateCycleInsights, generateFertilizerRecommendations, generateSoilRecommendations, generateWeatherAlertAdvice, generateIntegratedActionPlan, generateIrrigationAdvice } from '../lib/gemini';
import { fetchWeather, WeatherData } from '../services/weatherService';
import { CropCycleProgressBar } from '../components/CropCycleProgressBar';

export function CropCycleDetails() {
  const { id } = useParams<{ id: string }>();
  const { 
    cropCycles, farms, tasks, scoutingRecords, 
    fertilizerLogs, pestControlLogs, harvestRecords, financialRecords,
    soilTests, fertilizerSchedules,
    addSoilTest, addPestControlLog, addFertilizerLog,
    completeTask, toggleChecklistItem, selectedFarmId,
    addFertilizerSchedule, removeFertilizerSchedule, markFertilizerScheduleAsApplied
  } = useStore();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const cycle = useMemo(() => {
    const c = cropCycles.find(c => c.id === id);
    if (c && c.farmId === selectedFarmId) return c;
    return undefined;
  }, [cropCycles, id, selectedFarmId]);

  const farm = useMemo(() => farms.find(f => f.id === cycle?.farmId), [farms, cycle]);
  const crop = useMemo(() => cropLibrary.find(c => c.id === cycle?.cropId), [cycle]);

  const cycleTasks = useMemo(() => tasks.filter(t => t.cropCycleId === id).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [tasks, id]);
  const cycleScouting = useMemo(() => scoutingRecords.filter(s => s.cropCycleId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [scoutingRecords, id]);
  const cycleFertilizer = useMemo(() => fertilizerLogs.filter(f => f.cropCycleId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [fertilizerLogs, id]);
  const cyclePestControl = useMemo(() => (pestControlLogs || []).filter(p => p.cropCycleId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [pestControlLogs, id]);
  const cycleHarvests = useMemo(() => harvestRecords.filter(h => h.cropCycleId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [harvestRecords, id]);
  const cycleFinance = useMemo(() => financialRecords.filter(f => f.cropCycleId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [financialRecords, id]);
  const cycleSoilTests = useMemo(() => (soilTests || []).filter(s => s.cropCycleId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [soilTests, id]);
  const cycleFertilizerSchedule = useMemo(() => (fertilizerSchedules || []).filter(s => s.cropCycleId === id).sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()), [fertilizerSchedules, id]);

  const detailedPlan = useMemo(() => cropPlans[cycle?.cropId || ''] || [], [cycle]);
  const currentStagePlan = useMemo(() => detailedPlan.find(p => p.stage === cycle?.currentStage) || detailedPlan[0], [detailedPlan, cycle]);

  const latestMoisture = useMemo(() => {
    const recordsWithMoisture = cycleScouting.filter(s => s.soilMoisture !== undefined);
    return recordsWithMoisture.length > 0 ? recordsWithMoisture[0].soilMoisture : null;
  }, [cycleScouting]);

  const totalCosts = useMemo(() => cycleFinance.filter(f => f.category !== 'revenue').reduce((acc, curr) => acc + curr.totalCost, 0), [cycleFinance]);
  const totalRevenue = useMemo(() => cycleFinance.filter(f => f.category === 'revenue').reduce((acc, curr) => acc + curr.totalCost, 0), [cycleFinance]);
  const totalYield = useMemo(() => cycleHarvests.reduce((acc, curr) => curr.unit === 'kg' ? acc + curr.quantity : curr.unit === 'tons' ? acc + (curr.quantity * 1000) : acc + (curr.quantity * 50), 0), [cycleHarvests]);

  // Find recommended botanicals based on the pests found in scouting
  const recommendedBotanicals = useMemo(() => {
    const pestsFound: string[] = Array.from(new Set(cycleScouting.map(s => s.pestId.toLowerCase())));
    return botanicalsLibrary.filter(botanical => {
      return botanical.targetPests?.some(targetPest => {
        const pestWords = targetPest.toLowerCase().split(' ');
        return pestsFound.some(pf => pestWords.some(pw => pf.includes(pw) || pw.includes(pf)));
      });
    });
  }, [cycleScouting]);

  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [fertilizerRecs, setFertilizerRecs] = useState<{type: string, product: string, dosage: string, method: string, recommendation: string}[]>([]);
  const [soilRecommendations, setSoilRecommendations] = useState<string[]>([]);
  const [irrigationAdvice, setIrrigationAdvice] = useState<{frequency: string, method: string, estimatedVolume: string, rationale: string, optimizationTips?: string[]}|null>(null);
  const [integratedPlan, setIntegratedPlan] = useState<{tasks: any[], summary: string}|null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingFertilizer, setLoadingFertilizer] = useState(false);
  const [loadingSoil, setLoadingSoil] = useState(false);
  const [loadingIrrigation, setLoadingIrrigation] = useState(false);
  const [loadingActionPlan, setLoadingActionPlan] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData|null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<{type: 'rain' | 'heat' | 'drought', message: string, advice: string}[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [isAddingSoilTest, setIsAddingSoilTest] = useState(false);
  const [isAddingPestControl, setIsAddingPestControl] = useState(false);
  const [isAddingFertilizer, setIsAddingFertilizer] = useState(false);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  
  const [newSoilTest, setNewSoilTest] = useState({
    nitrogen: 'medium' as 'low' | 'medium' | 'high',
    phosphorus: 'medium' as 'low' | 'medium' | 'high',
    potassium: 'medium' as 'low' | 'medium' | 'high',
    ph: 6.5,
    organicMatter: 2.0,
    notes: ''
  });

  const [newPestControl, setNewPestControl] = useState({
    type: 'organic' as 'organic' | 'synthetic',
    product: '',
    dosage: '',
    method: '',
    cost: 0,
    notes: ''
  });

  const [newFertilizer, setNewFertilizer] = useState({
    product: '',
    rate: '',
    method: '',
    cost: 0,
    notes: ''
  });

  const [newSchedule, setNewSchedule] = useState({
    plannedDate: new Date().toISOString().split('T')[0],
    stage: '',
    product: '',
    dosage: '',
    method: ''
  });

  const fetchInsights = async () => {
    if (!cycle || !crop) return;
    setLoadingInsights(true);
    setLoadingFertilizer(true);
    setLoadingIrrigation(true);
    setLoadingActionPlan(true);
    try {
      const cycleData = {
        cropName: crop.name,
        variety: cycle.variety,
        plantingDate: cycle.plantingDate,
        currentStage: cycle.currentStage,
        system: cycle.system,
        latestMoisture,
        tasksCompleted: cycleTasks.filter(t => t.status === 'completed').length,
        tasksPending: cycleTasks.filter(t => t.status !== 'completed').length,
        scoutingRecords: cycleScouting.slice(0, 5).map(s => ({ 
          observation: s.pestId, 
          severity: s.severity,
          date: s.date,
          soilMoisture: s.soilMoisture
        })),
        fertilizerHistory: cycleFertilizer.slice(0, 3).map(f => ({
          product: f.product,
          date: f.date
        })),
        soilTests: cycleSoilTests.slice(0, 2).map(s => ({
          date: s.date,
          nitrogen: s.nitrogen,
          phosphorus: s.phosphorus,
          potassium: s.potassium,
          ph: s.ph,
          organicMatter: s.organicMatter
        }))
      };
      
      const weatherInfo = weatherData ? {
        temp: weatherData.temp,
        humidity: weatherData.humidity,
        forecast: weatherData.forecast.slice(0, 3)
      } : null;

      // Fetch all in parallel
      const [insights, recs, actionPlan, irrigation] = await Promise.all([
        generateCycleInsights(cycleData),
        generateFertilizerRecommendations(cycleData),
        generateIntegratedActionPlan(cycleData, weatherInfo),
        generateIrrigationAdvice(cycleData, weatherInfo)
      ]);
      
      setAiInsights(insights);
      setFertilizerRecs(recs);
      setIntegratedPlan(actionPlan);
      setIrrigationAdvice(irrigation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
      setLoadingFertilizer(false);
      setLoadingIrrigation(false);
      setLoadingActionPlan(false);
    }
  };

  const fetchSoilRecommendations = async () => {
    if (cycleSoilTests.length === 0) return;
    setLoadingSoil(true);
    try {
      const latestTest = cycleSoilTests[0];
      const recs = await generateSoilRecommendations(latestTest);
      setSoilRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSoil(false);
    }
  };

  const fetchWeatherAndAlerts = async () => {
    if (!farm?.latitude || !farm?.longitude || !cycle || !crop) return;
    setLoadingWeather(true);
    try {
      const weather = await fetchWeather(farm.latitude, farm.longitude);
      setWeatherData(weather);
      
      const alerts: {type: 'rain' | 'heat' | 'drought', message: string, advice: string}[] = [];
      
      // Check for heavy rain
      const rainDay = weather.forecast.find(d => 
        d.description.toLowerCase().includes('heavy') || 
        d.description.toLowerCase().includes('thunderstorm') ||
        d.description.toLowerCase().includes('storm')
      );
      if (rainDay) {
        alerts.push({
          type: 'rain',
          message: `Heavy rain expected on ${rainDay.date}`,
          advice: ''
        });
      }

      // Heat alert
      const heatDay = weather.forecast.find(d => d.temp > 35);
      if (heatDay) {
        alerts.push({
          type: 'heat',
          message: `Extreme heat (${heatDay.temp}°C) expected on ${heatDay.date}`,
          advice: ''
        });
      }

      // Drought/Dry alert
      if (weather.humidity < 40 && weather.temp > 32 && !weather.forecast.some(d => d.description.toLowerCase().includes('rain'))) {
         alerts.push({
           type: 'drought',
           message: 'High evaporation risk. Low humidity and no rain forecasted.',
           advice: ''
         });
      }

      if (alerts.length > 0) {
        const cycleInfo = {
          cropName: crop.name,
          currentStage: cycle.currentStage,
          variety: cycle.variety
        };
        const advice = await generateWeatherAlertAdvice({ alerts }, cycleInfo);
        if (advice) {
          setWeatherAlerts(alerts.map(a => ({ ...a, advice })));
        } else {
          setWeatherAlerts(alerts);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (aiInsights.length === 0 && fertilizerRecs.length === 0) {
      fetchInsights();
    }
    if (!weatherData && farm) {
      fetchWeatherAndAlerts();
    }
  }, [cycle, crop, farm, cycleTasks, cycleScouting, cycleSoilTests]);

  useEffect(() => {
    if (soilRecommendations.length === 0 && cycleSoilTests.length > 0) {
      fetchSoilRecommendations();
    }
  }, [cycleSoilTests]);

  const handleAddSoilTest = () => {
    const test = {
      id: Math.random().toString(36).substr(2, 9),
      cropCycleId: id!,
      date: new Date().toISOString().split('T')[0],
      ...newSoilTest
    };
    addSoilTest(test);
    setIsAddingSoilTest(false);
    setSoilRecommendations([]); // Clear old recs to trigger re-fetch
  };

  const handleAddPestControl = () => {
    if (!newPestControl.product || !newPestControl.dosage) return;

    const log = {
      id: Math.random().toString(36).substr(2, 9),
      cropCycleId: id!,
      date: new Date().toISOString().split('T')[0],
      ...newPestControl
    };
    addPestControlLog(log);
    setIsAddingPestControl(false);
    setNewPestControl({
      type: 'organic',
      product: '',
      dosage: '',
      method: '',
      cost: 0,
      notes: ''
    });
  };

  const handlePreFillFertilizer = (rec: {type: string, product: string, dosage: string, method: string, recommendation: string}) => {
    setNewFertilizer({
      product: rec.product,
      rate: rec.dosage,
      method: rec.method,
      cost: 0,
      notes: `Based on AI recommendation: ${rec.recommendation}`
    });
    setIsAddingFertilizer(true);
  };

  const handleScheduleFromAI = (rec: {type: string, product: string, dosage: string, method: string, recommendation: string}) => {
    setNewSchedule({
      plannedDate: new Date().toISOString().split('T')[0],
      stage: cycle.currentStage || '',
      product: rec.product,
      dosage: rec.dosage,
      method: rec.method
    });
    setIsAddingSchedule(true);
  };

  const handleAddFertilizer = () => {
    if (!newFertilizer.product || !newFertilizer.rate) return;

    const logId = Math.random().toString(36).substr(2, 9);
    const log = {
      id: logId,
      cropCycleId: id!,
      date: new Date().toISOString().split('T')[0],
      ...newFertilizer,
      scheduleId: activeScheduleId || undefined
    };
    addFertilizerLog(log);
    
    if (activeScheduleId) {
      markFertilizerScheduleAsApplied(activeScheduleId, logId);
    }

    setIsAddingFertilizer(false);
    setActiveScheduleId(null);
    setNewFertilizer({
      product: '',
      rate: '',
      method: '',
      cost: 0,
      notes: ''
    });
  };

  const handleAddSchedule = () => {
    if (!newSchedule.product || !newSchedule.plannedDate) return;

    const schedule = {
      id: Math.random().toString(36).substr(2, 9),
      cropCycleId: id!,
      ...newSchedule,
      status: 'planned' as const
    };
    addFertilizerSchedule(schedule);
    setIsAddingSchedule(false);
    setNewSchedule({
      plannedDate: new Date().toISOString().split('T')[0],
      stage: '',
      product: '',
      dosage: '',
      method: ''
    });
  };

  const handleApplyFromSchedule = (schedule: FertilizerSchedule) => {
    setNewFertilizer({
      product: schedule.product,
      rate: schedule.dosage,
      method: schedule.method,
      cost: 0,
      notes: `Applied based on schedule for ${schedule.stage}`
    });
    setActiveScheduleId(schedule.id);
    setIsAddingFertilizer(true);
  };

  if (!cycle || !crop) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold text-earth-900 mb-2">Cycle Not Found</h2>
        <p className="text-earth-500 mb-6">This crop cycle may have been removed or doesn't exist.</p>
        <Link to="/cycles" className="text-forest-600 font-medium hover:text-forest-700">Return to Cycles</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">      <nav className="flex items-center justify-between mb-6">
        <Link to="/cycles" className="group inline-flex items-center gap-2 text-earth-500 hover:text-earth-900 transition-all font-bold text-sm uppercase tracking-wider">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-earth-100 group-hover:scale-110 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to list
        </Link>
        <div className="flex gap-2">
          <button className="p-2 bg-white rounded-xl shadow-sm border border-earth-100 text-earth-500 hover:text-forest-600 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </nav>
      
      <header className="glass rounded-[40px] shadow-2xl shadow-earth-900/5 p-6 sm:p-10 relative overflow-hidden mb-8">
        {/* Decorative elements */}
        <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-forest-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-50px] left-[-20px] w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
           <Sprout className="w-48 h-48 text-forest-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-earth-100/50 pb-8 mb-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-earth-900 tracking-tight">
                {crop.name} <span className="font-medium text-earth-400">({cycle.variety})</span>
              </h1>
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`badge pointer-events-none py-1.5
                ${cycle.status === 'active' ? 'bg-forest-100 text-forest-700' : 
                  cycle.status === 'planned' ? 'bg-amber-100 text-amber-700' : 
                  'bg-earth-100 text-earth-700'}`}>
                {cycle.status}
              </motion.span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <p className="text-earth-500 font-bold flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-earth-100">
                <MapPin className="w-4 h-4 text-terracotta-500" /> {farm?.name}
              </p>
              <p className="text-earth-500 font-bold flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-earth-100">
                <Target className="w-4 h-4 text-forest-500" /> {cycle.area} ha
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-3xl border border-white shadow-xl shadow-earth-900/5 transition-transform hover:scale-105">
              <p className="text-earth-400 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2">Planted On</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-earth-50 flex items-center justify-center text-earth-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="text-earth-900 font-extrabold text-lg">{cycle.plantingDate}</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-3xl border border-white shadow-xl shadow-earth-900/5 transition-transform hover:scale-105">
              <p className="text-earth-400 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2">Growth System</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-forest-50 flex items-center justify-center text-forest-700">
                  <Sprout className="w-4 h-4" />
                </div>
                <p className="text-earth-900 font-extrabold text-lg capitalize">{cycle.system?.replace('_', ' ') || 'Open Field'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modern Stage Progress Tracker */}
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-extrabold text-earth-400 uppercase tracking-[0.3em] mb-1">Growth Journey</p>
              <h3 className="text-lg font-bold text-earth-900">Stage: {cycle.currentStage}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-extrabold text-forest-400 uppercase tracking-[0.3em] mb-1">Completion</p>
              <span className="text-2xl font-black text-forest-600">
                {Math.round(((['Nursery', 'Vegetative', 'Flowering', 'Fruiting'].indexOf(cycle.currentStage || '') + 1) / 4) * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center relative py-8 px-4">
            <div className="absolute h-1.5 bg-earth-100 left-8 right-8 z-0 rounded-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(['Nursery', 'Vegetative', 'Flowering', 'Fruiting'].indexOf(cycle.currentStage || '') / 3) * 100}%` }}
                className="h-full bg-forest-500 rounded-full shadow-lg shadow-forest-500/30"
              />
            </div>
            
            {['Nursery', 'Vegetative', 'Flowering', 'Fruiting'].map((s, idx) => {
              const stages = ['Nursery', 'Vegetative', 'Flowering', 'Fruiting'];
              const currentIdx = stages.indexOf(cycle.currentStage || '');
              const isPast = currentIdx > idx;
              const isCurrent = cycle.currentStage === s;
              
              return (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-14 h-14 rounded-[20px] flex items-center justify-center border-[6px] border-white shadow-xl transition-all
                    ${isCurrent ? 'bg-forest-500 text-white shadow-forest-500/40 rotate-12' : 
                      isPast ? 'bg-forest-100 text-forest-600' : 'bg-earth-50 text-earth-200'}`}
                  >
                    {isPast ? <CheckCircle2 className="w-6 h-6" /> : 
                     isCurrent ? <Droplet className="w-6 h-6 animate-bounce" /> :
                     <Circle className="w-5 h-5 opacity-30" />}
                  </motion.div>
                  <div className="absolute top-16 w-32 text-center pointer-events-none">
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isCurrent ? 'text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full' : 'text-earth-400'}`}>
                      {s}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Bento Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 relative z-10">
           <div className="p-6 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm shadow-sm transition-all hover:scale-[1.02]">
             <p className="text-[10px] font-extrabold text-earth-400 uppercase tracking-widest mb-2">Total Yield</p>
             <p className="text-3xl font-black text-earth-900">{totalYield > 0 ? `${totalYield} kg` : '-'}</p>
           </div>
           <div className="p-6 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm shadow-sm transition-all hover:scale-[1.02]">
             <p className="text-[10px] font-extrabold text-earth-400 uppercase tracking-widest mb-2">Input Costs</p>
             <p className="text-3xl font-black text-terracotta-600">{formatCurrency(totalCosts)}</p>
           </div>
           <div className="p-6 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm shadow-sm transition-all hover:scale-[1.02]">
             <p className="text-[10px] font-extrabold text-earth-400 uppercase tracking-widest mb-2">Revenue</p>
             <p className="text-3xl font-black text-forest-600">{formatCurrency(totalRevenue)}</p>
           </div>
           <div className="p-6 bg-forest-500 rounded-3xl shadow-xl shadow-forest-500/20 transition-all hover:scale-[1.02] group">
             <p className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest mb-2">Total Profit</p>
             <p className="text-3xl font-black text-white">{formatCurrency(totalRevenue - totalCosts)}</p>
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap className="w-4 h-4 text-white animate-pulse" />
             </div>
           </div>
        </div>
      </header>

      {/* Weather Alerts */}
      <AnimatePresence>
        {weatherAlerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {weatherAlerts.map((alert, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-3xl border shadow-lg flex flex-col md:flex-row gap-6 relative overflow-hidden transition-all
                  ${alert.type === 'rain' ? 'bg-indigo-600 border-indigo-400 text-white' : 
                    alert.type === 'heat' ? 'bg-amber-600 border-amber-400 text-white' : 
                    'bg-earth-800 border-earth-600 text-white'}`}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  {alert.type === 'rain' ? <CloudRain className="w-24 h-24" /> : 
                   alert.type === 'heat' ? <Thermometer className="w-24 h-24" /> : 
                   <Sun className="w-24 h-24" />}
                </div>

                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  {alert.type === 'rain' ? <CloudRain className="w-8 h-8" /> : 
                   alert.type === 'heat' ? <Thermometer className="w-8 h-8" /> : 
                   <Sun className="w-8 h-8" />}
                </div>

                <div className="space-y-2 flex-grow relative z-10">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Weather Alert</span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{alert.message}</h3>
                  {alert.advice && (
                    <div className="p-4 bg-black/10 rounded-2xl backdrop-blur-sm border border-white/10 mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">AI Agronomist Advice</span>
                      </div>
                      <p className="text-sm leading-relaxed opacity-95 font-medium">{alert.advice}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {cycle.status !== 'planned' && (
        <div className="card shadow-lg border-earth-100 p-8">
          <h2 className="text-xl font-black text-earth-900 uppercase tracking-tight mb-6">Growth Timeline</h2>
          <CropCycleProgressBar cycle={cycle} crop={crop} />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center / Main content - Tasks & Scouting */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Integrated Smart Action Plan */}
          {(integratedPlan || loadingActionPlan) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card shadow-2xl shadow-forest-900/10 border-forest-100 overflow-hidden"
            >
              <div className="p-8 bg-forest-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Zap className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-amber-400 p-2 rounded-xl text-amber-900">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase">Smart Action Plan</h2>
                      <p className="text-forest-200 text-[10px] font-bold uppercase tracking-widest">Integrated Field Operations</p>
                    </div>
                  </div>
                  {integratedPlan && (
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <p className="text-white text-sm font-medium leading-relaxed italic">
                        "{integratedPlan.summary}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-8 bg-white space-y-6">
                {loadingActionPlan ? (
                  <div className="py-12 flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-forest-600 animate-spin mb-4" />
                    <p className="text-sm font-bold text-earth-500 uppercase tracking-widest animate-pulse">Designing Integrated Workflow...</p>
                  </div>
                ) : integratedPlan && (
                  <div className="space-y-4">
                     {integratedPlan.tasks.map((task, idx) => (
                       <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className={`p-6 rounded-[28px] border transition-all hover:scale-[1.01] ${
                          task.urgency === 'high' ? 'bg-red-50 border-red-100' : 
                          task.urgency === 'moderate' ? 'bg-amber-50 border-amber-100' : 
                          'bg-forest-50 border-forest-100'
                        }`}
                       >
                         <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                               task.category === 'fertilizer' ? 'bg-forest-600 text-white' : 
                               task.category === 'irrigation' ? 'bg-blue-600 text-white' : 
                               task.category === 'pest_scouting' ? 'bg-terracotta-600 text-white' : 
                               'bg-earth-800 text-white'
                             }`}>
                               {task.category === 'fertilizer' ? <Flask /> : 
                                task.category === 'irrigation' ? <Droplet /> : 
                                task.category === 'pest_scouting' ? <Bug /> : 
                                <CheckCircle2 />}
                             </div>
                             <div>
                               <h4 className="font-black text-earth-900 tracking-tight">{task.title}</h4>
                               <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">{task.plannedDate}</p>
                             </div>
                           </div>
                           <span className={`badge ${
                             task.urgency === 'high' ? 'bg-red-100 text-red-700' : 
                             task.urgency === 'moderate' ? 'bg-amber-100 text-amber-700' : 
                             'bg-forest-100 text-forest-700'
                           }`}>
                             {task.urgency}
                           </span>
                         </div>
                         <p className="text-sm text-earth-700 leading-relaxed font-medium pl-13">
                           {task.description}
                         </p>
                       </motion.div>
                     ))}
                  </div>
                )}
                
                <button 
                  onClick={fetchInsights}
                  className="w-full py-4 bg-earth-50 hover:bg-earth-100 text-earth-600 font-bold rounded-2xl border border-earth-200 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  Regenerate Strategy
                </button>
              </div>
            </motion.div>
          )}

          {/* Insights Section */}
          {(aiInsights.length > 0 || loadingInsights) && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] shadow-xl shadow-indigo-600/20 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              
              <div className="p-6 flex items-center justify-between border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg tracking-tight uppercase">Agronomist Intel</h2>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">AI Generated Wisdom</p>
                  </div>
                </div>
                <button 
                  onClick={fetchInsights}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <RefreshCcw className={`w-4 h-4 text-white ${loadingInsights ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="p-8 relative z-10">
                {loadingInsights ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-amber-400 animate-spin"></div>
                    <p className="text-white font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Crunching Data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiInsights.map((insight, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-default group"
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-400 flex items-center justify-center text-amber-900 mt-0.5 group-hover:scale-110 transition-transform">
                            <Lightbulb className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-sm text-white/90 leading-relaxed font-medium">{insight}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Detailed Day-to-Day Plan */}
          {currentStagePlan && (
            <div className="card card-hover overflow-hidden">
              <div className="p-8 bg-forest-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 bg-white/20 rounded-full blur-2xl"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-forest-500 p-2 rounded-xl">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight uppercase">Stage Protocol</h2>
                    </div>
                    <p className="text-forest-200 text-sm font-medium">Strategic Activities: Days {currentStagePlan.dayRange}</p>
                  </div>
                  <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                    <span className="text-lg font-black text-white">{currentStagePlan.activity}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-earth-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Critical Scouting Points
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentStagePlan.lookOutFor.map((item, i) => (
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        key={i} 
                        className="bg-amber-50 text-amber-800 border border-amber-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider"
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {currentStagePlan.monitoringChecklist && (
                  <div className="bg-forest-50/50 p-6 rounded-[32px] border border-forest-100">
                    <h3 className="text-[10px] font-black text-forest-700 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-forest-600" />
                      Protocol Compliance Checklist
                    </h3>
                    <div className="grid gap-3">
                      {currentStagePlan.monitoringChecklist.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-forest-100 shadow-sm transition-all hover:translate-x-1">
                          <div className="w-6 h-6 rounded-lg bg-forest-100 flex-shrink-0 flex items-center justify-center">
                            <span className="text-[10px] font-black text-forest-600">{i + 1}</span>
                          </div>
                          <p className="text-sm text-forest-900 font-bold tracking-tight">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-earth-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Flask className="w-4 h-4 text-forest-600" />
                    INTERVENTION OPTIONS (SIDE-BY-SIDE)
                  </h3>
                  
                  {currentStagePlan.interventions.fertilizer && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-earth-700 bg-earth-50 px-3 py-2 rounded-lg">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        FERTILIZER APPLICATION
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Organic Option */}
                        <div className="border-2 border-forest-100 rounded-2xl p-4 bg-forest-50/10 relative overflow-hidden">
                          <div className="absolute -top-1 -right-1">
                            <span className="bg-forest-500 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg uppercase">ORGANIC</span>
                          </div>
                          <h4 className="font-bold text-forest-900">{currentStagePlan.interventions.fertilizer.organic.product}</h4>
                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Dosage</p>
                              <p className="font-bold text-earth-900">{currentStagePlan.interventions.fertilizer.organic.dosage}</p>
                            </div>
                            <div>
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Method</p>
                              <p className="font-bold text-earth-900">{currentStagePlan.interventions.fertilizer.organic.method}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Benefits</p>
                              <p className="text-earth-600 italic leading-relaxed">{currentStagePlan.interventions.fertilizer.organic.notes}</p>
                            </div>
                          </div>
                        </div>
                        {/* Synthetic Option */}
                        <div className="border-2 border-amber-100 rounded-2xl p-4 bg-amber-50/10 relative overflow-hidden">
                          <div className="absolute -top-1 -right-1">
                            <span className="bg-amber-500 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg uppercase">SYNTHETIC</span>
                          </div>
                          <h4 className="font-bold text-amber-900">{currentStagePlan.interventions.fertilizer.synthetic.product}</h4>
                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Dosage</p>
                              <p className="font-bold text-earth-900">{currentStagePlan.interventions.fertilizer.synthetic.dosage}</p>
                            </div>
                            <div>
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Method</p>
                              <p className="font-bold text-earth-900">{currentStagePlan.interventions.fertilizer.synthetic.method}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Usage</p>
                              <p className="text-earth-600 italic leading-relaxed">{currentStagePlan.interventions.fertilizer.synthetic.notes}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStagePlan.interventions.pestControl && (
                    <div className="space-y-3 pt-4 border-t border-earth-100">
                      <div className="flex items-center gap-2 text-sm font-bold text-earth-700 bg-earth-50 px-3 py-2 rounded-lg">
                        <Bug className="w-4 h-4 text-terracotta-500" />
                        PEST & DISEASE CONTROL
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Organic Option */}
                        <div className="border-2 border-forest-100 rounded-2xl p-4 bg-forest-50/10 relative overflow-hidden">
                          <div className="absolute -top-1 -right-1">
                            <span className="bg-forest-500 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg uppercase">ORGANIC</span>
                          </div>
                          <h4 className="font-bold text-forest-900">{currentStagePlan.interventions.pestControl.organic.product}</h4>
                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Dosage</p>
                              <p className="font-bold text-earth-900">{currentStagePlan.interventions.pestControl.organic.dosage}</p>
                            </div>
                            <div>
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Method</p>
                              <p className="font-bold text-earth-900">{currentStagePlan.interventions.pestControl.organic.method}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Benefits</p>
                              <p className="text-earth-600 italic leading-relaxed">{currentStagePlan.interventions.pestControl.organic.notes}</p>
                            </div>
                          </div>
                        </div>
                        {/* Synthetic Option */}
                        <div className="border-2 border-terracotta-100 rounded-2xl p-4 bg-terracotta-50/10 relative overflow-hidden">
                          <div className="absolute -top-1 -right-1">
                            <span className="bg-terracotta-500 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg uppercase">SYNTHETIC</span>
                          </div>
                          <h4 className="font-bold text-terracotta-900">{currentStagePlan.interventions.pestControl.synthetic.product}</h4>
                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Dosage</p>
                              <p className="font-bold text-earth-900">{currentStagePlan.interventions.pestControl.synthetic.dosage}</p>
                            </div>
                            <div>
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Method</p>
                              <p className="font-bold text-earth-900">{currentStagePlan.interventions.pestControl.synthetic.method}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-earth-400 uppercase font-bold text-[9px]">Usage</p>
                              <p className="text-earth-600 italic leading-relaxed">{currentStagePlan.interventions.pestControl.synthetic.notes}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tasks Section */}
          <div className="card shadow-xl shadow-earth-900/5 group/tasks">
            <div className="p-8 flex items-center justify-between border-b border-earth-100/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-600 group-hover/tasks:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-earth-900 text-xl tracking-tight uppercase">Operational Timeline</h2>
                  <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">Day-by-Day Workflow</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-earth-100/50">
                {cycleTasks.length === 0 ? (
                  <p className="p-6 text-earth-500 text-center">No tasks assigned to this cycle yet.</p>
                ) : (
                  cycleTasks.map(task => {
                    const isExpanded = expandedTaskId === task.id;
                    return (
                      <div key={task.id} className="border-b border-earth-100 last:border-0">
                        <div 
                          className={`p-5 flex gap-4 hover:bg-earth-50 transition-colors cursor-pointer ${isExpanded ? 'bg-forest-50/10' : ''}`}
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        >
                          <div className="mt-1">
                            {task.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-forest-500" />
                            ) : task.status === 'overdue' ? (
                              <AlertCircle className="w-5 h-5 text-terracotta-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-earth-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${task.status === 'completed' ? 'text-earth-500 line-through' : 'text-earth-900'}`}>
                                {task.taskType}
                              </h4>
                              {task.checklist && (
                                <span className="text-[10px] bg-forest-100 text-forest-700 px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">
                                  {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-1">
                              <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">Due: {task.dueDate}</p>
                              
                              {task.checklist && task.checklist.length > 0 && (
                                <div className="flex-1 max-w-[120px] flex items-center gap-3">
                                  <div className="h-1.5 flex-1 bg-earth-100 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(task.checklist.filter(i => i.completed).length / task.checklist.length) * 100}%` }}
                                      className={`h-full rounded-full ${
                                        task.status === 'completed' ? 'bg-earth-300' : 'bg-forest-500'
                                      }`}
                                    />
                                  </div>
                                  <span className="text-[9px] font-black text-earth-500">
                                    {Math.round((task.checklist.filter(i => i.completed).length / task.checklist.length) * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-14 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            {task.notes && (
                              <p className="text-sm text-earth-600 bg-earth-50 p-3 rounded-xl border border-earth-100">{task.notes}</p>
                            )}

                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Monitoring Checklist
                              </p>
                              {task.checklist ? (
                                <div className="grid gap-2">
                                  {task.checklist.map(item => (
                                    <label 
                                      key={item.id}
                                      className="flex items-center gap-3 p-2.5 rounded-xl border border-earth-100 hover:bg-forest-50 transition-colors cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500"
                                        checked={item.completed}
                                        onChange={() => toggleChecklistItem(task.id, item.id)}
                                      />
                                      <span className={`text-sm ${item.completed ? 'text-earth-400 line-through' : 'text-earth-700'}`}>
                                        {item.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-earth-400 italic">No checklist items.</p>
                              )}
                            </div>
                            
                            {task.status !== 'completed' && (!task.checklist || task.checklist.every(i => i.completed)) && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completeTask(task.id);
                                }}
                                className="w-full py-2 bg-forest-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-forest-700 transition-colors"
                              >
                                Mark Task as Completed
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
            </div>
          </div>
          
          {/* Pest & Botanicals Section */}
          <div className="card shadow-xl shadow-earth-900/5 group/pests">
            <div className="p-8 flex items-center gap-4 border-b border-earth-100/50">
              <div className="w-12 h-12 rounded-2xl bg-terracotta-50 flex items-center justify-center text-terracotta-600 group-hover/pests:scale-110 transition-transform">
                <Bug className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-earth-900 text-xl tracking-tight uppercase">Biosecurity & Scouting</h2>
                <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">Pest Defense System</p>
              </div>
            </div>
            
            <div className="p-5 border-b border-earth-100">
              <h3 className="text-sm uppercase tracking-wider font-bold text-earth-500 mb-3">Scouting History</h3>
              {cycleScouting.length === 0 ? (
                 <p className="text-earth-500 text-sm">No pests recorded for this cycle.</p>
              ) : (
                <div className="space-y-3">
                  {cycleScouting.map(scout => (
                    <div key={scout.id} className="flex justify-between items-start bg-earth-50 p-3 rounded-lg border border-earth-100">
                      <div>
                        <p className="font-semibold text-earth-900">{scout.pestId} <span className="text-xs font-normal bg-white px-2 py-0.5 rounded border border-earth-200 ml-2">{scout.severity} severity</span></p>
                        <p className="text-xs text-earth-500 mt-1">{scout.date}</p>
                      </div>
                      {scout.actionTaken && (
                        <p className="text-xs text-earth-600 bg-white px-2 py-1 rounded border border-earth-200">
                          {scout.actionTaken}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {recommendedBotanicals.length > 0 && (
              <div className="p-5 bg-amber-50/50">
                <h3 className="text-sm uppercase tracking-wider font-bold text-amber-700 mb-4 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" /> Recommended Bio-Pesticides
                </h3>
                <div className="space-y-4">
                  {recommendedBotanicals.map(botanical => (
                    <div key={botanical.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-amber-900">{botanical.name}</h4>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">{botanical.type}</span>
                      </div>
                      <p className="text-xs text-earth-500 italic mb-3">{botanical.scientificName} • {botanical.localNames}</p>
                      <div className="space-y-2 mt-3 text-sm">
                        <p><strong className="text-earth-800">Prep:</strong> <span className="text-earth-700">{botanical.preparation}</span></p>
                        <p><strong className="text-earth-800">Apply:</strong> <span className="text-earth-700">{botanical.application}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        {/* Sidebar - Logs */}
        <div className="space-y-6">
          
          {/* Harvests */}
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
            <div className="p-5 flex items-center gap-3 border-b border-earth-100 bg-earth-50/50">
              <Wheat className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-earth-900">Harvest Records</h2>
            </div>
            <div className="p-5">
              {cycleHarvests.length === 0 ? (
                <p className="text-sm text-earth-500">No harvests recorded.</p>
              ) : (
                <div className="space-y-3">
                  {cycleHarvests.map(h => (
                    <div key={h.id} className="flex justify-between items-center bg-earth-50 p-3 rounded-lg border border-earth-100">
                      <div>
                        <p className="font-semibold text-earth-900">{h.quantity} {h.unit}</p>
                        <p className="text-xs text-earth-500">{h.date}</p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">{h.quality}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Soil Health Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-earth-100 bg-earth-50/50">
              <div className="flex items-center gap-3">
                <Flask className="w-5 h-5 text-forest-600" />
                <h2 className="font-bold text-earth-900">Soil Health</h2>
              </div>
              <button 
                onClick={() => setIsAddingSoilTest(true)}
                className="p-1.5 bg-forest-50 text-forest-600 rounded-lg hover:bg-forest-100 transition-colors"
                title="Log Soil Test"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 border-b border-earth-100">
              {cycleSoilTests.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider">Latest Test Analysis</p>
                    <span className="text-[10px] font-bold text-earth-400">{cycleSoilTests[0].date}</span>
                  </div>
                  
                  {/* Visual Nutrient Bars */}
                  <div className="space-y-3">
                    {[
                      { label: 'Nitrogen (N)', key: 'nitrogen', color: 'bg-forest-500' },
                      { label: 'Phosphorus (P)', key: 'phosphorus', color: 'bg-amber-500' },
                      { label: 'Potassium (K)', key: 'potassium', color: 'bg-indigo-500' }
                    ].map(n => {
                      const level = cycleSoilTests[0][n.key as keyof typeof cycleSoilTests[0]] as string;
                      const width = level === 'high' ? 'w-full' : level === 'medium' ? 'w-2/3' : 'w-1/3';
                      const opacity = level === 'high' ? 'opacity-100' : level === 'medium' ? 'opacity-70' : 'opacity-40';
                      return (
                        <div key={n.key}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-earth-700">{n.label}</span>
                            <span className="text-[10px] font-bold text-earth-500 capitalize">{level}</span>
                          </div>
                          <div className="h-1.5 w-full bg-earth-100 rounded-full overflow-hidden">
                            <div className={`h-full ${n.color} ${width} ${opacity} transition-all duration-500`}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-earth-50 p-2 rounded-lg border border-earth-100 text-center">
                      <p className="text-[8px] font-bold text-earth-400 uppercase mb-0.5">pH Level</p>
                      <p className="text-sm font-bold text-earth-900">{cycleSoilTests[0].ph}</p>
                    </div>
                    <div className="bg-earth-50 p-2 rounded-lg border border-earth-100 text-center">
                      <p className="text-[8px] font-bold text-earth-400 uppercase mb-0.5">Org. Matter</p>
                      <p className="text-sm font-bold text-earth-900">{cycleSoilTests[0].organicMatter}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-white/50 rounded-2xl border border-dashed border-earth-200">
                  <p className="text-xs text-earth-400 italic">No soil tests logged for this cycle yet.</p>
                  <button 
                    onClick={() => setIsAddingSoilTest(true)}
                    className="mt-3 text-forest-600 text-[10px] font-bold uppercase tracking-wider hover:underline"
                  >
                    Log First Test
                  </button>
                </div>
              )}
            </div>

            {/* AI Soil Amendments Section */}
            <div className="p-5 bg-forest-50/30">
               <div className="flex items-center justify-between mb-4">
                 <div>
                   <h3 className="text-xs uppercase tracking-wider font-bold text-forest-700 flex items-center gap-2">
                     <Sparkles className="w-3 h-3" /> AI AMENDMENTS
                   </h3>
                   <p className="text-[10px] text-forest-600 mt-0.5">Personalized soil health plan</p>
                 </div>
                 {cycleSoilTests.length > 0 && (
                    <button 
                      onClick={fetchSoilRecommendations}
                      disabled={loadingSoil}
                      className="text-forest-600 hover:text-forest-800 transition-colors p-1 bg-white rounded-lg shadow-sm border border-forest-100"
                      title="Recalculate Soil Recommendations"
                    >
                      <RefreshCcw className={`w-3 h-3 ${loadingSoil ? 'animate-spin' : ''}`} />
                    </button>
                 )}
               </div>

               {loadingSoil ? (
                 <div className="flex items-center gap-3 text-forest-600 py-6 justify-center">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Analyzing Soil Deficiencies...</span>
                 </div>
               ) : soilRecommendations.length > 0 ? (
                 <div className="space-y-3">
                    {soilRecommendations.map((rec, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-forest-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex gap-3">
                          <div className="bg-forest-100 p-1.5 rounded-lg h-fit mt-0.5">
                            <Lightbulb className="w-3 h-3 text-forest-600" />
                          </div>
                          <p className="text-[11px] text-forest-900 leading-relaxed font-medium">{rec}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="py-6 text-center">
                   <p className="text-xs text-earth-400 italic">
                     {cycleSoilTests.length > 0 ? 'Click refresh to get AI recommendations' : 'Log a test result to see recommendations.'}
                   </p>
                 </div>
               )}
            </div>
          </div>

          {/* Fertilizers & Inputs */}
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-earth-100 bg-earth-50/50">
              <div className="flex items-center gap-3">
                <Droplet className="w-5 h-5 text-forest-600" />
                <h2 className="font-bold text-earth-900">Crop Nutrition</h2>
              </div>
              <button 
                onClick={() => setIsAddingFertilizer(true)}
                className="p-1.5 bg-forest-50 text-forest-600 rounded-lg hover:bg-forest-100 transition-colors"
                title="Log Fertilizer Application"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* AI Fertilizer Recommendations Subsection */}
            <div className="p-5 bg-forest-50/30 border-b border-earth-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-forest-700 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> AI NUTRIENT PLAN
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] text-forest-600">Based on {cycle.currentStage} stage & soil data</p>
                    <Info className="w-2.5 h-2.5 text-forest-400 cursor-help" title="Recommendations are dynamically generated using current growth stage and your logged soil test results for optimal precision." />
                  </div>
                </div>
                <button 
                  onClick={fetchInsights}
                  disabled={loadingFertilizer}
                  className="text-forest-600 hover:text-forest-800 transition-colors p-1 bg-white rounded-lg shadow-sm border border-forest-100"
                  title="Recalculate AI Recommendations"
                >
                  <RefreshCcw className={`w-3 h-3 ${loadingFertilizer ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingFertilizer ? (
                <div className="flex items-center gap-3 text-forest-600 py-6 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Analyzing Soil & Growth Stage...</span>
                </div>
              ) : fertilizerRecs.length > 0 ? (
                <div className="space-y-4">
                  {fertilizerRecs.some(r => r.type === 'Local Botanical') && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest pl-1">Local Plant-Based Fertilizers</p>
                      {fertilizerRecs.filter(r => r.type === 'Local Botanical').map((rec, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-amber-200 bg-white shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-1">
                             <Sprout className="w-4 h-4 text-amber-200 opacity-20" />
                          </div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-amber-900 text-sm leading-tight">{rec.product}</p>
                              <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Local Bio-Fertilizer</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleScheduleFromAI(rec)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100 text-amber-700 p-1.5 rounded-lg shadow-sm border border-amber-200"
                                title="Schedule this application"
                              >
                                <Calendar className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handlePreFillFertilizer(rec)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-600 text-white p-1.5 rounded-lg shadow-sm"
                                title="Log this application"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
                            <div className="bg-amber-50/50 p-1.5 rounded-lg">
                              <span className="block text-[8px] uppercase font-bold text-amber-600">Dosage</span>
                              <span className="font-medium text-amber-900 line-clamp-1">{rec.dosage}</span>
                            </div>
                            <div className="bg-amber-50/50 p-1.5 rounded-lg">
                              <span className="block text-[8px] uppercase font-bold text-amber-600">Method</span>
                              <span className="font-medium text-amber-900 line-clamp-1">{rec.method}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed opacity-90">{rec.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {fertilizerRecs.some(r => r.type === 'Organic') && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-forest-500 uppercase tracking-widest pl-1">Standard Organic Options</p>
                      {fertilizerRecs.filter(r => r.type === 'Organic').map((rec, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-forest-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-forest-900 text-sm leading-tight">{rec.product}</p>
                              <span className="text-[8px] bg-forest-50 text-forest-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Organic Bio-input</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleScheduleFromAI(rec)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-forest-100 text-forest-700 p-1.5 rounded-lg shadow-sm border border-forest-200"
                                title="Schedule this application"
                              >
                                <Calendar className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handlePreFillFertilizer(rec)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-forest-600 text-white p-1.5 rounded-lg shadow-sm"
                                title="Log this application"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
                            <div className="bg-forest-50/50 p-1.5 rounded-lg">
                              <span className="block text-[8px] uppercase font-bold text-forest-600">Dosage</span>
                              <span className="font-medium text-forest-900 line-clamp-1">{rec.dosage}</span>
                            </div>
                            <div className="bg-forest-50/50 p-1.5 rounded-lg">
                              <span className="block text-[8px] uppercase font-bold text-forest-600">Method</span>
                              <span className="font-medium text-forest-900 line-clamp-1">{rec.method}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-forest-800 leading-relaxed opacity-90">{rec.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {fertilizerRecs.some(r => r.type === 'Synthetic') && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest pl-1">Synthetic Options</p>
                      {fertilizerRecs.filter(r => r.type === 'Synthetic').map((rec, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-indigo-900 text-sm leading-tight">{rec.product}</p>
                              <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Synthetic Booster</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleScheduleFromAI(rec)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-100 text-indigo-700 p-1.5 rounded-lg shadow-sm border border-indigo-200"
                                title="Schedule this application"
                              >
                                <Calendar className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handlePreFillFertilizer(rec)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm"
                                title="Log this application"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
                            <div className="bg-indigo-50/50 p-1.5 rounded-lg">
                              <span className="block text-[8px] uppercase font-bold text-indigo-600">Dosage</span>
                              <span className="font-medium text-indigo-900 line-clamp-1">{rec.dosage}</span>
                            </div>
                            <div className="bg-indigo-50/50 p-1.5 rounded-lg">
                              <span className="block text-[8px] uppercase font-bold text-indigo-600">Method</span>
                              <span className="font-medium text-indigo-900 line-clamp-1">{rec.method}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-indigo-800 leading-relaxed opacity-90">{rec.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center bg-white/50 rounded-2xl border border-dashed border-forest-200">
                  <p className="text-xs text-earth-400 italic">No specific fertilizer recommendations available.</p>
                  <button 
                    onClick={fetchInsights}
                    className="mt-3 text-forest-600 text-[10px] font-bold uppercase tracking-wider hover:underline"
                  >
                    Refresh Recommendations
                  </button>
                </div>
              )}
            </div>

            {/* Fertilization Schedule Subsection */}
            <div className="p-5 border-b border-earth-100 bg-amber-50/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-amber-700 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> FERTILIZATION SCHEDULE
                  </h3>
                  <p className="text-[10px] text-amber-600 mt-0.5">Upcoming nutrition applications</p>
                </div>
                <button 
                  onClick={() => setIsAddingSchedule(true)}
                  className="p-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  title="Add Schedule Item"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {cycleFertilizerSchedule.length === 0 ? (
                <div className="py-4 text-center border border-dashed border-amber-200 rounded-xl bg-white/50">
                  <p className="text-[11px] text-amber-600 italic">No scheduled applications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cycleFertilizerSchedule.map(item => (
                    <div 
                      key={item.id} 
                      className={`p-3 rounded-xl border transition-all ${
                        item.status === 'applied' 
                          ? 'bg-earth-50 border-earth-100 opacity-60' 
                          : 'bg-white border-amber-100 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${item.status === 'applied' ? 'text-earth-500' : 'text-amber-900'}`}>{item.product}</p>
                            {item.status === 'applied' && <CheckCircle2 className="w-3 h-3 text-forest-500" />}
                          </div>
                          <p className="text-[10px] text-earth-500 font-medium">{item.stage} • {item.plannedDate}</p>
                        </div>
                        <div className="flex gap-2">
                          {item.status === 'planned' && (
                            <>
                              <button 
                                onClick={() => removeFertilizerSchedule(item.id)}
                                className="p-1.5 text-earth-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleApplyFromSchedule(item)}
                                className="bg-forest-600 text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-sm hover:bg-forest-700 uppercase tracking-wider transition-colors"
                              >
                                Apply Now
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-earth-600">
                        <p><span className="font-bold opacity-70">Dosage:</span> {item.dosage}</p>
                        <p><span className="font-bold opacity-70">Method:</span> {item.method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-xs uppercase tracking-wider font-bold text-earth-500 mb-3">Application History</h3>
              {cycleFertilizer.length === 0 ? (
                <p className="text-sm text-earth-500">No fertilizers applied.</p>
              ) : (
                <div className="space-y-4">
                  {cycleFertilizer.map(f => (
                    <div key={f.id} className="border-l-2 border-forest-500 pl-3">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-earth-900">{f.product}</p>
                        <span className="text-[9px] font-bold text-earth-400">{f.date}</span>
                      </div>
                      <p className="text-sm text-earth-600">{f.rate} • {f.method}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Irrigation Management */}
          <div className="card shadow-xl shadow-earth-900/5 group/irrigation">
            <div className="p-8 flex items-center justify-between border-b border-earth-100/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover/irrigation:scale-110 transition-transform">
                  <Droplet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-earth-900 text-xl tracking-tight uppercase">Hydration Plan</h2>
                  <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">Water Resource Management</p>
                </div>
              </div>
              <button 
                onClick={fetchInsights}
                disabled={loadingIrrigation}
                className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all active:scale-95 shadow-sm border border-blue-200/50"
                title="Recalculate Irrigation Plan"
              >
                <RefreshCcw className={`w-4 h-4 ${loadingIrrigation ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {latestMoisture !== null ? (
                <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Droplet className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Live Soil Moisture</p>
                      <span className="text-3xl font-black">{latestMoisture}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden mb-6">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${latestMoisture}%` }}
                        className={`h-full transition-all duration-1000 ${
                          latestMoisture < 30 ? 'bg-amber-400' : latestMoisture > 80 ? 'bg-white' : 'bg-forest-400'
                        }`} 
                      ></motion.div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                      <Info className="w-5 h-5 text-blue-200" />
                      <p className="text-sm font-medium">
                        {latestMoisture < 30 ? 'Soil is critically dry. Immediate local action recommended.' : 
                         latestMoisture > 80 ? 'Soil is saturated. Halt all irrigation immediately.' : 
                         'Optimal moisture levels detected for this stage.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-earth-50 p-8 rounded-[32px] border border-earth-100 border-dashed text-center">
                  <p className="text-sm text-earth-500 font-bold">No Moisture Sensors Detected</p>
                  <p className="text-[10px] text-earth-400 mt-2 uppercase font-black">Link a field sensor or log manual data</p>
                </div>
              )}

              {loadingIrrigation ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mb-4"></div>
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest animate-pulse">Syncing Hydration Plan...</p>
                </div>
              ) : irrigationAdvice ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-[24px] bg-slate-900 text-white shadow-xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Schedule</p>
                      <p className="text-xl font-bold tracking-tight">{irrigationAdvice.frequency}</p>
                    </div>
                    <div className="p-6 rounded-[24px] bg-blue-600 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Droplet className="w-12 h-12" />
                      </div>
                      <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-3">Target Volume</p>
                      <p className="text-xl font-bold tracking-tight">{irrigationAdvice.estimatedVolume}</p>
                    </div>
                    <div className="p-6 rounded-[24px] bg-white border border-earth-100 shadow-sm">
                      <p className="text-[10px] font-black text-earth-400 uppercase tracking-[0.2em] mb-3">Recommended Tech</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Zap className="w-4 h-4" />
                        </div>
                        <p className="text-lg font-bold text-earth-900">{irrigationAdvice.method.split(' ')[0]}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-[24px] bg-earth-50/50 border border-earth-100 relative overflow-hidden group/advice">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover/advice:scale-110 transition-transform">
                      <Sparkles className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <p className="text-[10px] font-black text-earth-700 uppercase tracking-[0.2em]">Technical Rationale</p>
                    </div>
                    <p className="text-sm text-earth-800 leading-relaxed font-medium">{irrigationAdvice.rationale}</p>
                  </div>

                  {irrigationAdvice.optimizationTips && irrigationAdvice.optimizationTips.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-earth-400 uppercase tracking-[0.2em] px-2">Conservation & efficiency tips</p>
                      <div className="grid grid-cols-1 gap-2">
                        {irrigationAdvice.optimizationTips.map((tip: string, i: number) => (
                          <div key={i} className="flex gap-3 p-4 bg-white rounded-2xl border border-earth-100 shadow-sm transition-all hover:bg-earth-50">
                            <div className="w-8 h-8 rounded-xl bg-forest-50 flex-shrink-0 flex items-center justify-center text-forest-600">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <p className="text-xs text-earth-700 font-bold leading-snug">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-earth-400 font-medium">Hydration intel pending cycle refresh.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pest & Disease Interventions Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-earth-100 bg-earth-50/50">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-terracotta-600" />
                <h2 className="font-bold text-earth-900">Control Logs</h2>
              </div>
              <button 
                onClick={() => setIsAddingPestControl(true)}
                className="p-1.5 bg-terracotta-50 text-terracotta-600 rounded-lg hover:bg-terracotta-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              {cyclePestControl.length === 0 ? (
                <p className="text-sm text-earth-500">No interventions logged.</p>
              ) : (
                <div className="space-y-4">
                  {cyclePestControl.map(p => (
                    <div key={p.id} className="border-l-2 border-terracotta-500 pl-3">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-earth-900">{p.product}</p>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          p.type === 'organic' ? 'bg-forest-100 text-forest-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.type}
                        </span>
                      </div>
                      <p className="text-sm text-earth-600">{p.dosage} • {p.method}</p>
                      <p className="text-xs text-earth-400 mt-1">{p.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Finance Snippets */}
           <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
            <div className="p-5 flex items-center gap-3 border-b border-earth-100 bg-earth-50/50">
              <Wallet className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-earth-900">Financial History</h2>
            </div>
            <div className="p-5">
              {cycleFinance.length === 0 ? (
                <p className="text-sm text-earth-500">No transactions recorded.</p>
              ) : (
                <div className="space-y-3">
                  {cycleFinance.slice(0, 5).map(f => (
                    <div key={f.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-earth-900 line-clamp-1">{f.item}</p>
                        <p className="text-xs text-earth-500">{f.date}</p>
                      </div>
                      <p className={`font-semibold ml-2 ${f.category === 'revenue' ? 'text-forest-600' : 'text-terracotta-600'}`}>
                        {f.category === 'revenue' ? '+' : '-'}{formatCurrency(f.totalCost)}
                      </p>
                    </div>
                  ))}
                  {cycleFinance.length > 5 && (
                    <p className="text-xs text-center text-earth-500 pt-2 border-t border-earth-100 block">
                      +{cycleFinance.length - 5} more records
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {isAddingSchedule && (
        <div className="fixed inset-0 z-[60] bg-earth-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-lg overflow-hidden shadow-2xl border-none"
          >
            <div className="bg-amber-700 p-6 text-white flex justify-between items-center">
               <h3 className="text-xl font-bold border-none">Schedule Fertilization</h3>
               <button onClick={() => setIsAddingSchedule(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Planned Date</label>
                  <input 
                    type="date" 
                    value={newSchedule.plannedDate}
                    onChange={(e) => setNewSchedule({...newSchedule, plannedDate: e.target.value})}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Growth Stage</label>
                  <input 
                    type="text" 
                    value={newSchedule.stage}
                    onChange={(e) => setNewSchedule({...newSchedule, stage: e.target.value})}
                    placeholder="e.g. Vegetative (V4)"
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Product</label>
                <input 
                  type="text" 
                  value={newSchedule.product}
                  onChange={(e) => setNewSchedule({...newSchedule, product: e.target.value})}
                  placeholder="e.g. NPK 15-15-15"
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Dosage</label>
                  <input 
                    type="text" 
                    value={newSchedule.dosage}
                    onChange={(e) => setNewSchedule({...newSchedule, dosage: e.target.value})}
                    placeholder="e.g. 50kg / ha"
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Method</label>
                  <input 
                    type="text" 
                    value={newSchedule.method}
                    onChange={(e) => setNewSchedule({...newSchedule, method: e.target.value})}
                    placeholder="e.g. Banding"
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-earth-50 border-t border-earth-100 flex gap-3">
              <button 
                onClick={() => setIsAddingSchedule(false)}
                className="flex-1 py-2.5 border border-earth-200 text-earth-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddSchedule}
                className="flex-1 py-2.5 bg-amber-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-800 transition-all shadow-lg"
              >
                Add to Schedule
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isAddingFertilizer && (
        <div className="fixed inset-0 z-[60] bg-earth-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-lg overflow-hidden shadow-2xl border-none"
          >
            <div className="bg-forest-800 p-6 text-white flex justify-between items-center">
               <h3 className="text-xl font-bold border-none">Log Nutrient Application</h3>
               <button onClick={() => setIsAddingFertilizer(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Fertilizer Product</label>
                <input 
                  type="text" 
                  value={newFertilizer.product}
                  onChange={(e) => setNewFertilizer({...newFertilizer, product: e.target.value})}
                  placeholder="e.g. NPK 15-15-15, Compost, Urea..."
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Application Rate</label>
                  <input 
                    type="text" 
                    value={newFertilizer.rate}
                    onChange={(e) => setNewFertilizer({...newFertilizer, rate: e.target.value})}
                    placeholder="e.g. 50kg / ha"
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Method</label>
                  <input 
                    type="text" 
                    value={newFertilizer.method}
                    onChange={(e) => setNewFertilizer({...newFertilizer, method: e.target.value})}
                    placeholder="e.g. Broadcast, Side-dress"
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Cost (GMD)</label>
                <input 
                  type="number" 
                  value={newFertilizer.cost}
                  onChange={(e) => setNewFertilizer({...newFertilizer, cost: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Notes</label>
                <textarea 
                  value={newFertilizer.notes}
                  onChange={(e) => setNewFertilizer({...newFertilizer, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                />
              </div>
            </div>

            <div className="p-6 bg-earth-50 border-t border-earth-100 flex gap-3">
              <button 
                onClick={() => {
                  setIsAddingFertilizer(false);
                  setActiveScheduleId(null);
                }}
                className="flex-1 py-2.5 border border-earth-200 text-earth-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddFertilizer}
                className="flex-1 py-2.5 bg-forest-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-forest-800 transition-all shadow-lg shadow-forest-200"
              >
                Log Application
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isAddingPestControl && (
        <div className="fixed inset-0 z-[60] bg-earth-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-lg overflow-hidden shadow-2xl border-none"
          >
            <div className="bg-terracotta-800 p-6 text-white flex justify-between items-center">
               <h3 className="text-xl font-bold border-none">Log Control Intervention</h3>
               <button onClick={() => setIsAddingPestControl(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex gap-4">
                <button 
                  onClick={() => setNewPestControl({...newPestControl, type: 'organic'})}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-wider ${
                    newPestControl.type === 'organic' 
                    ? 'border-forest-500 bg-forest-50 text-forest-700' 
                    : 'border-earth-100 text-earth-400 hover:border-earth-200'
                  }`}
                >
                  Organic
                </button>
                <button 
                  onClick={() => setNewPestControl({...newPestControl, type: 'synthetic'})}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-wider ${
                    newPestControl.type === 'synthetic' 
                    ? 'border-amber-500 bg-amber-50 text-amber-700' 
                    : 'border-earth-100 text-earth-400 hover:border-earth-200'
                  }`}
                >
                  Synthetic
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={newPestControl.product}
                  onChange={(e) => setNewPestControl({...newPestControl, product: e.target.value})}
                  placeholder="e.g. Neem Oil, Cypermethrin..."
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-terracotta-500 focus:border-terracotta-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Dosage</label>
                  <input 
                    type="text" 
                    value={newPestControl.dosage}
                    onChange={(e) => setNewPestControl({...newPestControl, dosage: e.target.value})}
                    placeholder="e.g. 5ml / Litre"
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-terracotta-500 focus:border-terracotta-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Method</label>
                  <input 
                    type="text" 
                    value={newPestControl.method}
                    onChange={(e) => setNewPestControl({...newPestControl, method: e.target.value})}
                    placeholder="e.g. Foliar Spray"
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-terracotta-500 focus:border-terracotta-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Cost (GMD)</label>
                <input 
                  type="number" 
                  value={newPestControl.cost}
                  onChange={(e) => setNewPestControl({...newPestControl, cost: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-terracotta-500 focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Observations / Notes</label>
                <textarea 
                  value={newPestControl.notes}
                  onChange={(e) => setNewPestControl({...newPestControl, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-terracotta-500 focus:border-terracotta-500"
                />
              </div>
            </div>

            <div className="p-6 bg-earth-50 border-t border-earth-100 flex gap-3">
              <button 
                onClick={() => setIsAddingPestControl(false)}
                className="flex-1 py-2.5 border border-earth-200 text-earth-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddPestControl}
                className="flex-1 py-2.5 bg-terracotta-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-terracotta-700 transition-all shadow-lg shadow-terracotta-200"
              >
                Save Record
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isAddingSoilTest && (
        <div className="fixed inset-0 z-[60] bg-earth-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-lg overflow-hidden shadow-2xl border-none"
          >
            <div className="bg-forest-900 p-6 text-white flex justify-between items-center">
               <h3 className="text-xl font-bold border-none">Log Soil Test</h3>
               <button onClick={() => setIsAddingSoilTest(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-xs font-bold text-earth-400 uppercase tracking-widest mb-3">N-P-K Levels</p>
                <div className="grid grid-cols-3 gap-3">
                  {['nitrogen', 'phosphorus', 'potassium'].map((nutrient) => (
                    <div key={nutrient}>
                      <label className="block text-[10px] font-bold text-earth-500 uppercase mb-1">{nutrient}</label>
                      <select 
                        value={newSoilTest[nutrient as keyof typeof newSoilTest] as string}
                        onChange={(e) => setNewSoilTest({...newSoilTest, [nutrient]: e.target.value})}
                        className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">pH Level</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="14"
                    value={newSoilTest.ph}
                    onChange={(e) => setNewSoilTest({...newSoilTest, ph: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Organic Matter (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    value={newSoilTest.organicMatter}
                    onChange={(e) => setNewSoilTest({...newSoilTest, organicMatter: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-1">Observations / Notes</label>
                <textarea 
                  value={newSoilTest.notes}
                  onChange={(e) => setNewSoilTest({...newSoilTest, notes: e.target.value})}
                  rows={3}
                  placeholder="e.g. Soil feels compacted, seen some fungal growth..."
                  className="w-full px-3 py-2 bg-earth-50 border border-earth-100 rounded-lg text-sm focus:ring-forest-500 focus:border-forest-500"
                />
              </div>
            </div>

            <div className="p-6 bg-earth-50 border-t border-earth-100 flex gap-3">
              <button 
                onClick={() => setIsAddingSoilTest(false)}
                className="flex-1 py-2.5 border border-earth-200 text-earth-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddSoilTest}
                className="flex-1 py-2.5 bg-forest-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-forest-700 transition-all shadow-lg shadow-forest-200"
              >
                Save Record
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

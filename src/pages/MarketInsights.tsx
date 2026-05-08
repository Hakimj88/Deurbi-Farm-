import { useStore } from '../store';
import { TrendingUp, DollarSign, BarChart3, MapPin, RefreshCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { generateMarketInsights } from '../lib/gemini';
import { cropLibrary } from '../data/cropLibrary';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function MarketInsights() {
  const { farmer, cropCycles, marketBenchmarks } = useStore();
  const [insights, setInsights] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const activeCrops = Array.from(new Set(cropCycles.map(c => c.cropId)))
    .map(id => cropLibrary.find(cl => cl.id === id))
    .filter(Boolean);

  const fetchInsights = async (cropName: string, id: string) => {
    if (!farmer) return;
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const data = await generateMarketInsights(farmer.region, cropName);
      if (data) {
        setInsights(prev => ({ ...prev, [id]: data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    activeCrops.forEach(crop => {
      if (crop && !insights[crop.id]) {
        fetchInsights(crop.name, crop.id);
      }
    });
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-8 border-b border-earth-100">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-forest-50 text-forest-600 rounded-2xl shadow-sm border border-forest-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-display font-black text-forest-600 uppercase tracking-[0.3em]">Economic Intelligence Hub</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-earth-900 tracking-tighter leading-tight italic">
            Market <br/>
            <span className="text-terracotta-600 italic">Strategic Analysis</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] border border-earth-100 shadow-soft text-earth-700 font-display font-bold text-sm group hover:shadow-elevated transition-shadow">
           <MapPin className="w-5 h-5 text-terracotta-500 transition-transform group-hover:scale-110" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-earth-400 uppercase tracking-widest">Active Region</span>
              <span>{farmer?.region}, The Gambia</span>
           </div>
        </div>
      </header>
      
      {/* Benchmarks Section - Refined Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {marketBenchmarks.map((market, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={market.id} 
            className="card p-8 card-hover group bg-gradient-to-br from-white to-earth-50/10 border-transparent hover:border-earth-200"
          >
             <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform pointer-events-none">
                <BarChart3 className="w-24 h-24 text-earth-900" />
             </div>
             
             <div className="flex justify-between items-start mb-8 relative z-10">
               <div>
                 <h3 className="text-3xl font-display font-bold text-earth-900 tracking-tight italic leading-none">{market.cropType}</h3>
                 <div className="flex items-center gap-2 mt-3 p-1.5 bg-earth-50 rounded-lg w-fit">
                    <MapPin className="w-3 h-3 text-earth-400" />
                    <p className="text-[9px] font-display font-black text-earth-400 uppercase tracking-widest">{market.location}</p>
                 </div>
               </div>
               <div className={cn(
                 "p-3.5 rounded-2xl transition-all duration-500 shadow-sm border group-hover:rotate-6",
                 market.trend === 'up' ? "bg-forest-50 text-forest-600 border-forest-100" :
                 market.trend === 'down' ? "bg-terracotta-50 text-terracotta-600 border-terracotta-100" :
                 "bg-blue-50 text-blue-600 border-blue-100"
               )}>
                 {market.trend === 'up' ? <TrendingUp className="w-6 h-6" /> : 
                  market.trend === 'down' ? <TrendingUp className="w-6 h-6 rotate-180" /> : 
                  <RefreshCcw className="w-6 h-6" />}
               </div>
             </div>

             <div className="relative z-10 pt-4 border-t border-earth-100/50">
               <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest mb-2 leading-none">Live Valuation</p>
               <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-display font-black text-earth-900 tracking-tighter">{market.pricePerUnit} <span className="text-xl opacity-30">GMD</span></p>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-display font-black uppercase tracking-widest border",
                    market.trend === 'up' ? "text-forest-600 bg-forest-50 border-forest-100" :
                    market.trend === 'down' ? "text-terracotta-600 bg-terracotta-50 border-terracotta-100" :
                    "text-blue-600 bg-blue-50 border-blue-100"
                  )}>
                    {market.trend === 'up' ? '+5.2%' : market.trend === 'down' ? '-2.1%' : 'Stable'}
                  </span>
               </div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {activeCrops.length === 0 ? (
          <div className="lg:col-span-2 card p-24 text-center border-dashed border-2 bg-earth-50/20 flex flex-col items-center">
            <div className="p-6 bg-white rounded-[2rem] shadow-soft border border-earth-100 mb-6 transition-transform">
              <BarChart3 className="w-12 h-12 text-earth-200" />
            </div>
            <h3 className="text-2xl font-display font-bold text-earth-900 mb-2">No market telemetry</h3>
            <p className="text-earth-500 font-medium text-sm max-w-sm">Strategic market insights will appear here once you initiate your first crop cycle.</p>
          </div>
        ) : (
          activeCrops.map((crop, idx) => {
            if (!crop) return null;
            const data = insights[crop.id];
            const isLoading = loading[crop.id];

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15 }}
                key={crop.id} 
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-forest-400 to-terracotta-400 rounded-[2.5rem] opacity-0 blur-xl group-hover:opacity-10 transition-opacity duration-700"></div>
                <div className="card h-full flex flex-col border-earth-100 shadow-soft overflow-hidden group-hover:border-forest-200 group-hover:shadow-elevated transition-all">
                  <div className="p-8 border-b border-earth-100 flex justify-between items-center bg-gradient-to-r from-white to-earth-50/50">
                    <div>
                      <h3 className="text-3xl font-display font-black text-earth-900 uppercase italic tracking-tight leading-none mb-2">{crop.name}</h3>
                      <p className="text-[10px] font-display font-bold text-forest-600 uppercase tracking-[0.3em]">{crop.scientificName}</p>
                    </div>
                    <button 
                      onClick={() => fetchInsights(crop.name, crop.id)}
                      className="p-3 bg-white border border-earth-100 hover:border-forest-200 rounded-2xl transition-all shadow-sm active:scale-95 group/refresh"
                    >
                      <RefreshCcw className={cn("w-6 h-6 text-earth-400 transition-transform duration-700 group-hover/refresh:rotate-180", isLoading && "animate-spin text-forest-600")} />
                    </button>
                  </div>

                  <div className="p-10 flex-1 flex flex-col">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                         <div className="w-16 h-16 rounded-[2rem] border-[6px] border-earth-100 border-t-forest-600 animate-spin mb-6"></div>
                         <p className="text-[11px] font-display font-black text-earth-500 uppercase tracking-[0.3em] animate-pulse">Scanning Global & Local Markets</p>
                      </div>
                    ) : data ? (
                      <div className="space-y-10 flex-1 flex flex-col">
                         <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-earth-50/50 rounded-3xl border border-earth-100 shadow-inner group/data">
                               <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-widest mb-3 leading-none group-hover/data:text-forest-600 transition-colors">Projected Price</p>
                               <div className="flex items-baseline gap-1">
                                 <span className="text-4xl font-display font-black text-earth-900 tracking-tighter">{data.priceRange}</span>
                               </div>
                            </div>
                            <div className="p-6 bg-earth-50/50 rounded-3xl border border-earth-100 shadow-inner group/stat">
                               <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-widest mb-3 leading-none group-hover/stat:text-terracotta-600 transition-colors">Trend Velocity</p>
                               <div className="flex items-center gap-3">
                                 <span className={cn("text-2xl font-display font-black uppercase tracking-tight", 
                                   data.trend === 'Rising' ? 'text-forest-600' : 
                                   data.trend === 'Falling' ? 'text-terracotta-600' : 'text-blue-600'
                                 )}>{data.trend}</span>
                                 <div className={cn("p-1.5 rounded-lg border", 
                                   data.trend === 'Rising' ? 'bg-forest-50 border-forest-100 text-forest-600' : 
                                   data.trend === 'Falling' ? 'bg-terracotta-50 border-terracotta-100 text-terracotta-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                                 )}>
                                   <TrendingUp className={cn("w-4 h-4", 
                                     data.trend === 'Rising' ? 'rotate-0' : 
                                     data.trend === 'Falling' ? 'rotate-180' : 'rotate-90'
                                   )} />
                                 </div>
                               </div>
                            </div>
                         </div>

                         <div className="bg-forest-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-forest-800">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform pointer-events-none">
                              <Sparkles className="w-32 h-32" />
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                              <div>
                                 <p className="text-[10px] font-display font-black text-forest-300 uppercase tracking-[0.3em] mb-2 leading-none">AI Business Strategy</p>
                                 <p className="text-2xl font-display font-black uppercase italic tracking-tight group-hover:text-amber-400 transition-colors leading-tight">{data.recommendation}</p>
                              </div>
                              <div className="px-5 py-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 flex flex-col items-end">
                                 <span className="text-[9px] font-black text-forest-400 uppercase tracking-widest mb-1">Local Demand</span>
                                 <span className="text-sm font-display font-black text-amber-400 tracking-widest">{data.demand}</span>
                              </div>
                            </div>
                         </div>

                         <div className="flex-1 p-8 bg-earth-50 rounded-[2.5rem] border border-earth-100 relative group/tip overflow-hidden shadow-inner">
                           <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 transition-transform duration-700 pointer-events-none group-hover:scale-125">
                              <TrendingUp className="w-24 h-24 text-earth-900" />
                           </div>
                           <div className="flex items-center gap-4 mb-4">
                              <div className="p-2.5 bg-white rounded-xl shadow-soft border border-earth-100 group-hover/tip:scale-110 transition-transform">
                                <TrendingUp className="w-5 h-5 text-forest-600" />
                              </div>
                              <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-[0.2em]">Contextual Intelligence</p>
                           </div>
                           <p className="text-base text-earth-800 font-medium leading-relaxed italic pr-6 group-hover/tip:text-earth-900 transition-colors">"{data.tacticalTip}"</p>
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 py-12 text-center opacity-40">
                         <AlertCircle className="w-16 h-16 text-earth-300 mb-6" />
                         <p className="text-sm font-display font-bold text-earth-500 uppercase tracking-widest leading-loose">Cognitive scan failed.<br/>Request new analysis cycle.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="card p-12 bg-[#0A0A0A] border-white/5 relative overflow-hidden md:mt-12 group shadow-2xl">
         <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
           <TrendingUp className="w-64 h-64 text-white" />
         </div>
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="text-center lg:text-left max-w-2xl">
               <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                 <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                   <AlertCircle className="w-6 h-6 text-amber-500" />
                 </div>
                 <h2 className="text-4xl font-display font-black text-white tracking-tighter uppercase italic leading-none">Strategic <span className="text-amber-500">Volatilty</span> Guard</h2>
               </div>
               <p className="text-earth-400 font-medium text-lg leading-relaxed antialiased">Financial analytics are generated based on regional seasonal history and real-time AI modeling. Final commercial decisions should be verified with registered produce brokers in Serekunda or Lumos.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:w-auto">
               <div className="p-8 bg-white/[0.03] rounded-[2rem] backdrop-blur-md border border-white/[0.06] hover:bg-white/[0.06] transition-all group/box shadow-inner">
                  <p className="text-[10px] font-display font-black text-amber-400 uppercase tracking-[0.3em] mb-4">Risk Mitigation</p>
                  <p className="text-white font-display font-bold text-lg leading-snug">Prepare for price adjustments as central seasons shift.</p>
               </div>
               <div className="p-8 bg-white/[0.03] rounded-[2rem] backdrop-blur-md border border-white/[0.06] hover:bg-white/[0.06] transition-all group/box shadow-inner">
                  <p className="text-[10px] font-display font-black text-forest-400 uppercase tracking-[0.3em] mb-4">Market Trend</p>
                  <p className="text-white font-display font-bold text-lg leading-snug">Strong demand for organic sorghum in western corridors.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

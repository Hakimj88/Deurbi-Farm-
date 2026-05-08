import { useStore } from '../store';
import { TrendingUp, DollarSign, BarChart3, MapPin, RefreshCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { generateMarketInsights } from '../lib/gemini';
import { cropLibrary } from '../data/cropLibrary';
import { motion } from 'motion/react';

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-earth-900 tracking-tight flex items-center gap-3 italic">
            <TrendingUp className="w-10 h-10 text-forest-600 animate-pulse" />
            Market Intelligence
          </h1>
          <p className="text-earth-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1 ml-13">Price monitoring & strategic selling</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-earth-100 shadow-sm text-earth-600 font-bold text-sm">
           <MapPin className="w-4 h-4 text-terracotta-500" />
           {farmer?.region}, The Gambia
        </div>
      </header>
      
      {/* Benchmarks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {marketBenchmarks.map(market => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={market.id} 
            className="card bg-white p-6 border-earth-100 hover:shadow-xl transition-all group overflow-hidden relative"
          >
             <div className="absolute top-0 right-0 p-12 opacity-5 -mr-8 -mt-8 group-hover:scale-125 transition-transform">
                <BarChart3 className="w-32 h-32 text-earth-900" />
             </div>
             
             <div className="flex justify-between items-start mb-6 border-b border-earth-50 pb-4">
               <div>
                 <h3 className="text-2xl font-black text-earth-900 tracking-tight italic">{market.cropType}</h3>
                 <p className="text-[10px] font-bold text-earth-400 uppercase flex items-center gap-1.5 mt-1">
                   <MapPin className="w-3 h-3" /> {market.location}
                 </p>
               </div>
               <div className={cn(
                 "p-2 rounded-xl transition-colors",
                 market.trend === 'up' ? "bg-forest-50 text-forest-600" :
                 market.trend === 'down' ? "bg-terracotta-50 text-terracotta-600" :
                 "bg-amber-50 text-amber-600"
               )}>
                 {market.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : 
                  market.trend === 'down' ? <TrendingUp className="w-5 h-5 rotate-180" /> : 
                  <RefreshCcw className="w-5 h-5" />}
               </div>
             </div>

             <div className="mt-4">
               <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Price per KG (Live)</p>
               <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-earth-900 tracking-tighter">{market.pricePerUnit} GMD</p>
                  <span className={cn(
                    "text-xs font-bold",
                    market.trend === 'up' ? "text-forest-600" :
                    market.trend === 'down' ? "text-terracotta-600" :
                    "text-amber-600"
                  )}>
                    {market.trend === 'up' ? '+5.2%' : market.trend === 'down' ? '-2.1%' : 'Stable'}
                  </span>
               </div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {activeCrops.length === 0 ? (
          <div className="lg:col-span-2 card p-12 text-center">
            <BarChart3 className="w-16 h-16 text-earth-200 mx-auto mb-4" />
            <p className="text-earth-500 font-bold uppercase tracking-widest">No active crops to track</p>
          </div>
        ) : (
          activeCrops.map(crop => {
            if (!crop) return null;
            const data = insights[crop.id];
            const isLoading = loading[crop.id];

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={crop.id} 
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-forest-400 to-blue-400 rounded-[34px] opacity-20 blur group-hover:opacity-40 transition-opacity"></div>
                <div className="card relative overflow-hidden h-full">
                  <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                    <div>
                      <h3 className="text-2xl font-black text-earth-900 uppercase italic tracking-tight">{crop.name}</h3>
                      <p className="text-[10px] font-bold text-forest-600 uppercase tracking-widest">{crop.scientificName}</p>
                    </div>
                    <button 
                      onClick={() => fetchInsights(crop.name, crop.id)}
                      className="p-2 hover:bg-white rounded-xl transition-all active:rotate-180 duration-500"
                    >
                      <RefreshCcw className={`w-5 h-5 text-earth-400 ${isLoading ? 'animate-spin text-forest-500' : ''}`} />
                    </button>
                  </div>

                  <div className="p-8">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                         <div className="w-12 h-12 rounded-full border-4 border-earth-100 border-t-forest-600 animate-spin mb-4"></div>
                         <p className="text-[10px] font-black text-earth-500 uppercase tracking-[0.2em] animate-pulse">Scanning Markets...</p>
                      </div>
                    ) : data ? (
                      <div className="space-y-8">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-3xl border border-earth-100 shadow-sm">
                               <p className="text-[9px] font-black text-earth-400 uppercase tracking-widest mb-2">Market Price (estimated)</p>
                               <div className="flex items-baseline gap-1">
                                 <span className="text-3xl font-black text-earth-900">{data.priceRange}</span>
                               </div>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border border-earth-100 shadow-sm relative overflow-hidden">
                               <p className="text-[9px] font-black text-earth-400 uppercase tracking-widest mb-2">Trend Status</p>
                               <div className="flex items-center gap-2">
                                 <span className={`text-xl font-black uppercase ${
                                   data.trend === 'Rising' ? 'text-forest-600' : 
                                   data.trend === 'Falling' ? 'text-terracotta-600' : 'text-blue-600'
                                 }`}>{data.trend}</span>
                                 <TrendingUp className={`w-5 h-5 ${
                                   data.trend === 'Rising' ? 'text-forest-600 rotate-0' : 
                                   data.trend === 'Falling' ? 'text-terracotta-600 rotate-180' : 'text-blue-600 rotate-90'
                                 }`} />
                               </div>
                               <p className="text-[9px] text-earth-500 mt-2 font-medium">{data.trendReason}</p>
                            </div>
                         </div>

                         <div className="flex items-center justify-between p-4 bg-slate-900 rounded-[24px] text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                              <DollarSign className="w-16 h-16" />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">AI Recommendation</p>
                               <p className="text-xl font-black uppercase italic tracking-wider">{data.recommendation}</p>
                            </div>
                            <div className="px-5 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                               <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">{data.demand} Demand</span>
                            </div>
                         </div>

                         <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 relative group/tip overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover/tip:scale-110 transition-transform">
                              <Sparkles className="w-16 h-16" />
                           </div>
                           <div className="flex items-center gap-3 mb-3">
                              <Sparkles className="w-5 h-5 text-amber-500" />
                              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Tactical Seller's Tip</p>
                           </div>
                           <p className="text-sm text-earth-800 font-bold leading-relaxed">{data.tacticalTip}</p>
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                         <AlertCircle className="w-12 h-12 text-earth-200 mb-4" />
                         <p className="text-sm font-bold text-earth-400">Failed to generate insights. Try again.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="card p-8 bg-forest-900 border-forest-800 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
           <BarChart3 className="w-48 h-48 text-white" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
               <h2 className="text-2xl font-black text-white tracking-tight uppercase italic mb-2">Market Volatility Warning</h2>
               <p className="text-forest-200 font-medium max-w-lg">Market prices are estimates based on seasonal trends and AI analysis. Actual prices at Lumos or city markets may vary. Always verify with local brokers.</p>
            </div>
            <div className="flex gap-4">
               <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Seasonal Tip</p>
                  <p className="text-white font-bold">Expect harvest-time price drops.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

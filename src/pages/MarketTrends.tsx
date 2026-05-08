import React from 'react';
import { useStore } from '../store';
import { TrendingUp, TrendingDown, MapPin, Calendar, ShoppingBag, ArrowUpRight, ArrowDownRight, Minus, PieChart } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export function MarketTrends() {
  const { marketBenchmarks, harvestRecords, cropCycles } = useStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] border border-earth-100 shadow-sm gap-6">
        <div>
          <h1 className="text-4xl font-black text-earth-900 tracking-tight flex items-center gap-4 italic uppercase">
            <TrendingUp className="w-10 h-10 text-amber-600" />
            Market Insights
          </h1>
          <p className="text-earth-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ml-14">Gambia Regional Price Benchmarking</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-earth-50 px-6 py-3 rounded-2xl border border-earth-100">
              <p className="text-[9px] font-black text-earth-400 uppercase tracking-widest mb-1">Current Focus</p>
              <p className="text-sm font-black text-earth-900 italic">North Bank Region</p>
           </div>
           <div className="bg-forest-50 px-6 py-3 rounded-2xl border border-forest-100">
              <p className="text-[9px] font-black text-forest-600 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-black text-forest-900 italic flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-forest-500 animate-pulse"></div>
                 Live Updates
              </p>
           </div>
        </div>
      </header>

      {/* Main Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketBenchmarks.map(market => (
          <div key={market.id} className="card bg-white p-6 border-earth-100 hover:shadow-xl transition-all group overflow-hidden relative">
             <div className="absolute top-0 right-0 p-12 opacity-5 -mr-8 -mt-8 group-hover:scale-125 transition-transform">
                <ShoppingBag className="w-32 h-32 text-earth-900" />
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
                 {market.trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> : 
                  market.trend === 'down' ? <ArrowDownRight className="w-5 h-5" /> : 
                  <Minus className="w-5 h-5" />}
               </div>
             </div>

             <div className="mt-4">
               <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Price per KG</p>
               <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-earth-900 tracking-tighter">{formatCurrency(market.pricePerUnit)}</p>
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
             
             <p className="text-[10px] font-bold text-earth-400 mt-6 pt-4 border-t border-earth-50 uppercase tracking-widest italic">
               Updated: {market.date}
             </p>
          </div>
        ))}
        
        {/* Market Prediction Card */}
        <div className="card bg-earth-900 text-white p-8 border-none flex flex-col justify-between shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
              <PieChart className="w-32 h-32" />
           </div>
           <div>
             <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">AI Prediction</p>
             <h3 className="text-2xl font-black italic tracking-tight leading-tight">Prices expected to RISE by 15% in 3 weeks.</h3>
             <p className="text-xs text-earth-400 font-bold mt-4 leading-relaxed">
               Lower rainfall in neighboring regions is reducing supply. Consider delaying harvest for Maize CC-1 by 7 days if quality permits.
             </p>
           </div>
           <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md">
             View Full Market Map
           </button>
        </div>
      </div>

      {/* Price History Visualization Placeholder */}
      <div className="card bg-white p-8 border-earth-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           <div>
             <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tight italic">Price History (6 Months)</h2>
             <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mt-1">Maize & Cowpea Aggregated Data</p>
           </div>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-earth-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Maize</button>
              <button className="px-4 py-2 bg-earth-50 text-earth-400 hover:text-earth-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Cowpea</button>
           </div>
        </div>
        
        {/* Placeholder for a chart */}
        <div className="h-64 flex items-end justify-between gap-4 px-4 overflow-hidden">
           {[45, 60, 55, 80, 95, 85, 100, 90, 110, 105, 120, 130].map((val, i) => (
             <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  className="w-full bg-forest-600/20 group-hover:bg-forest-600 rounded-t-xl transition-all duration-500 relative" 
                  style={{ height: `${val}%` }}
                >
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-earth-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {val + 150} GMD
                   </div>
                </div>
                <div className="h-4 w-1 bg-earth-100 rounded-full"></div>
             </div>
           ))}
        </div>
        <div className="flex justify-between mt-6 px-4">
           {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
             <p key={m} className="text-[10px] font-black text-earth-400 uppercase tracking-widest">{m}</p>
           ))}
        </div>
      </div>

      {/* Recent Harvest Sales */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tight italic">Your Recent Sales vs. Market</h2>
        <div className="bg-white border border-earth-100 rounded-[2.5rem] overflow-hidden shadow-sm">
           {harvestRecords.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center">
                <ShoppingBag className="w-12 h-12 text-earth-100 mb-4" />
                <p className="text-earth-400 font-bold uppercase tracking-widest">No harvest sales yet.</p>
             </div>
           ) : (
             <table className="w-full text-left border-collapse">
               <thead className="bg-earth-50/50">
                 <tr>
                   <th className="p-6 text-[10px] font-black text-earth-400 uppercase tracking-widest">Crop</th>
                   <th className="p-6 text-[10px] font-black text-earth-400 uppercase tracking-widest">Your Price</th>
                   <th className="p-6 text-[10px] font-black text-earth-400 uppercase tracking-widest">Market Avg</th>
                   <th className="p-6 text-[10px] font-black text-earth-400 uppercase tracking-widest">Performance</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-earth-50">
                 {harvestRecords.map(record => {
                   const cycle = cropCycles.find(c => c.id === record.cropCycleId);
                   const market = marketBenchmarks.find(m => m.cropType.toLowerCase().includes(cycle?.variety.toLowerCase() || ''));
                   const yourPrice = 185; // Mock sold price
                   const marketPrice = market?.pricePerUnit || 180;
                   const diff = ((yourPrice - marketPrice) / marketPrice) * 100;
                   
                   return (
                     <tr key={record.id} className="hover:bg-earth-50/30 transition-colors">
                       <td className="p-6">
                         <p className="font-black text-earth-900 italic tracking-tight">{cycle?.variety || 'Unknown Crop'}</p>
                         <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">{record.date}</p>
                       </td>
                       <td className="p-6 font-black text-earth-900">{formatCurrency(yourPrice)}</td>
                       <td className="p-6 font-black text-earth-400">{formatCurrency(marketPrice)}</td>
                       <td className="p-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            diff >= 0 ? "bg-forest-50 text-forest-600 border-forest-100" : "bg-terracotta-50 text-terracotta-600 border-terracotta-100"
                          )}>
                             {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% vs. Market
                          </span>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
}

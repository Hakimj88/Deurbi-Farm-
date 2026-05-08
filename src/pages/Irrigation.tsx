import React, { useState } from 'react';
import { useStore } from '../store';
import { Droplets, TrendingUp, Info, Plus, Clock, Waves, Calculator, Droplet } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn, formatCurrency } from '../lib/utils';
import { cropLibrary } from '../data/cropLibrary';

export function Irrigation() {
  const { t } = useTranslation();
  const { irrigationRecords, cropCycles, selectedFarmId, addIrrigationRecord, addFinancialRecord } = useStore();
  const [isAddingLog, setIsAddingLog] = useState(false);
  
  const activeCycles = cropCycles.filter(c => c.farmId === selectedFarmId && c.status === 'active');

  const [newLog, setNewLog] = useState({
    cropCycleId: '',
    volume: 500,
    duration: 60,
    method: 'Drip',
    cost: 50
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const logId = `irr_${Date.now()}`;
    const date = format(new Date(), 'yyyy-MM-dd');
    
    addIrrigationRecord({
      id: logId,
      ...newLog,
      date
    });

    if (newLog.cost > 0 && newLog.cropCycleId) {
      addFinancialRecord({
        id: `fr_irr_${Date.now()}`,
        cropCycleId: newLog.cropCycleId,
        category: 'service',
        item: `Irrigation - ${newLog.method}`,
        quantity: 1,
        unitCost: newLog.cost,
        totalCost: newLog.cost,
        date
      });
    }

    setIsAddingLog(false);
  };

  const totalVolume = irrigationRecords.reduce((acc, curr) => acc + curr.volume, 0);
  const totalCost = irrigationRecords.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-earth-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-earth-900 tracking-tight flex items-center gap-4 italic uppercase">
            <Droplets className="w-10 h-10 text-blue-600" />
            Smart Irrigation
          </h1>
          <p className="text-earth-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ml-14">Water Resource Management & Cost Tracking</p>
        </div>
        <button 
          onClick={() => setIsAddingLog(true)}
          className="group relative bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 overflow-hidden transition-all hover:pr-10 active:scale-95 shadow-lg shadow-blue-200"
        >
          <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="w-5 h-5 transition-transform group-hover:scale-125" />
          Log Watering
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white p-6 border-earth-100 transition-transform cursor-default relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <Waves className="w-32 h-32 text-blue-600" />
           </div>
           <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-4">Total Volume (30 Days)</p>
           <p className="text-5xl font-black text-earth-900 tracking-tighter">{totalVolume.toLocaleString()} <span className="text-xl text-earth-400 font-bold uppercase">Liters</span></p>
           <div className="flex items-center gap-2 mt-4 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full w-fit">
              <TrendingUp className="w-3 h-3" />
              <span>12% more efficient than last month</span>
           </div>
        </div>

        <div className="card bg-white p-6 border-earth-100 transition-transform cursor-default">
           <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-4">Cumulative Cost</p>
           <p className="text-5xl font-black text-earth-900 tracking-tighter">{formatCurrency(totalCost)}</p>
           <p className="text-[10px] font-bold text-earth-400 mt-4 uppercase tracking-widest">Mainly electricity & fuel</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-600 to-blue-800 p-6 border-none shadow-xl text-white">
           <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-4">Next Scheduled Run</p>
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Clock className="w-6 h-6 text-white" />
             </div>
             <div>
               <p className="text-2xl font-black italic tracking-tight">Tomorrow, 06:00 AM</p>
               <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Post-Planting Maize Plot</p>
             </div>
           </div>
           <p className="text-[10px] font-bold text-blue-100 mt-6 bg-white/10 p-3 rounded-xl border border-white/10 italic">
             AI Note: Soil moisture is at 65%. 30 mins run recommended based on low humidity.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tight italic">Watering Logs</h2>
          <div className="bg-white border border-earth-100 rounded-[2rem] overflow-hidden shadow-sm">
             {irrigationRecords.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Droplets className="w-12 h-12 text-earth-100 mb-4" />
                  <p className="text-earth-400 font-bold uppercase tracking-widest">No logs recorded.</p>
                </div>
             ) : (
                <div className="divide-y divide-earth-100">
                   {irrigationRecords.map(log => {
                     const cycle = cropCycles.find(c => c.id === log.cropCycleId);
                     return (
                        <div key={log.id} className="p-6 hover:bg-earth-50/50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                               <Waves className="w-6 h-6" />
                            </div>
                            <div>
                               <h3 className="font-black text-earth-900 tracking-tight italic">{cycle?.variety || 'General Farm'}</h3>
                               <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest mt-1">
                                 {log.date} • {log.method} • {log.duration} mins
                               </p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-earth-900 tracking-tighter">{log.volume} L</p>
                             <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{formatCurrency(log.cost)}</p>
                          </div>
                        </div>
                     );
                   })}
                </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tight italic">Resource Insights</h2>
           <div className="card p-8 bg-white border-earth-100 border shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-earth-900 uppercase tracking-tight italic">Water Usage per Cycle</h3>
                 <Calculator className="w-6 h-6 text-earth-200" />
              </div>
              <div className="space-y-6">
                 {activeCycles.length === 0 ? (
                    <p className="text-sm text-earth-400 italic">No active cycles to track.</p>
                 ) : (
                    activeCycles.map(cycle => {
                       const cycleLogs = irrigationRecords.filter(l => l.cropCycleId === cycle.id);
                       const volume = cycleLogs.reduce((acc, c) => acc + c.volume, 0);
                       const maxVolume = 5000; // Mock max for progress bar
                       const percentage = Math.min(100, (volume / maxVolume) * 100);
                       
                       return (
                          <div key={cycle.id}>
                             <div className="flex justify-between items-baseline mb-2">
                                <p className="font-black text-earth-900 tracking-tight">{cycle.variety}</p>
                                <p className="text-xs font-bold text-earth-400">{volume.toLocaleString()} L</p>
                             </div>
                             <div className="w-full bg-earth-100 h-3 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                             </div>
                          </div>
                       );
                    })
                 )}
              </div>
              
              <div className="mt-12 p-6 bg-earth-50 rounded-2xl border border-dashed border-earth-200">
                 <p className="text-xs font-bold text-earth-600 leading-relaxed italic">
                   "Your average water consumption for Maize is up by 15% due to higher temperatures this week. Automatic adjustments have been suggested to your schedule."
                 </p>
              </div>
           </div>
        </div>
      </div>

      {isAddingLog && (
        <div className="fixed inset-0 bg-earth-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="p-8 border-b border-earth-100 flex justify-between items-center bg-blue-50/50">
               <div>
                 <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tight italic">Log Irrigation Run</h2>
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Record water application & cost</p>
               </div>
               <button onClick={() => setIsAddingLog(false)} className="p-3 hover:bg-white rounded-2xl text-earth-400 transition-colors border border-transparent hover:border-earth-100">
                 <Droplets className="w-6 h-6" />
               </button>
             </div>
             
             <form onSubmit={handleAddLog} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Target Plot / Cycle</label>
                  <select 
                    required
                    value={newLog.cropCycleId}
                    onChange={e => setNewLog({...newLog, cropCycleId: e.target.value})}
                    className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                  >
                    <option value="">Select a cycle...</option>
                    {activeCycles.map(c => (
                      <option key={c.id} value={c.id}>{c.variety} - {c.season}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Volume (Liters)</label>
                    <input 
                      type="number"
                      className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                      value={newLog.volume}
                      onChange={e => setNewLog({...newLog, volume: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Duration (Mins)</label>
                    <input 
                      type="number"
                      className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                      value={newLog.duration}
                      onChange={e => setNewLog({...newLog, duration: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Method</label>
                    <select 
                      className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                      value={newLog.method}
                      onChange={e => setNewLog({...newLog, method: e.target.value})}
                    >
                      <option value="Drip">Drip Irrigation</option>
                      <option value="Sprinkler">Sprinkler</option>
                      <option value="Manual/Bucket">Manual / Bucket</option>
                      <option value="Flood">Flood Irrigation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Cost (GMD)</label>
                    <input 
                      type="number"
                      className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                      value={newLog.cost}
                      onChange={e => setNewLog({...newLog, cost: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAddingLog(false)} className="flex-1 py-4 text-earth-400 font-black uppercase tracking-widest text-xs hover:text-earth-600 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200">Save Watering Log</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

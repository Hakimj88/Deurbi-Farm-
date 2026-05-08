import React, { useState } from 'react';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { Beaker, TrendingUp, AlertCircle, Plus, Info, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { cropLibrary } from '../data/cropLibrary';

export function SoilAndNutrition() {
  const { t } = useTranslation();
  const { soilTests, farms, selectedFarmId, addSoilTest, cropCycles } = useStore();
  const [isAddingTest, setIsAddingTest] = useState(false);
  
  const currentFarm = farms.find(f => f.id === selectedFarmId);
  const activeCycles = cropCycles.filter(c => c.farmId === selectedFarmId && c.status === 'active');
  
  // Calculate latest snapshot
  const latestTest = soilTests[soilTests.length - 1];

  const [newTest, setNewTest] = useState({
    cropCycleId: '',
    ph: 6.5,
    nitrogen: 'medium' as const,
    phosphorus: 'medium' as const,
    potassium: 'medium' as const,
    organicMatter: 2.0,
    notes: ''
  });

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    const testId = `st_${Date.now()}`;
    addSoilTest({
      id: testId,
      ...newTest,
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setIsAddingTest(false);
  };

  const getStatusColor = (value: string) => {
    switch (value) {
      case 'low': return 'text-terracotta-600 bg-terracotta-50 border-terracotta-100';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'high': return 'text-forest-600 bg-forest-50 border-forest-100';
      default: return 'text-earth-400 bg-earth-50 border-earth-100';
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-earth-200">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-forest-50 text-forest-600 rounded-[1.25rem] shadow-sm border border-forest-100">
              <Beaker className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-display font-black text-forest-600 uppercase tracking-[0.3em]">Precision Agriculture Lab</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-earth-900 tracking-tighter leading-tight italic">
            Soil Health & <br/>
            <span className="text-terracotta-600 italic">Nutrition Monitoring</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsAddingTest(true)}
          className="btn-primary flex items-center gap-3 px-10 py-5 shadow-2xl shadow-forest-200/50"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:scale-125" />
          Log Soil Test
        </button>
      </header>

      {/* Nutrients Snapshot - Refined Bento Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-8 card-hover relative group bg-gradient-to-br from-white to-earth-50/10">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
             <Beaker className="w-24 h-24 text-forest-600" />
           </div>
           <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest mb-6">Latest pH Level</p>
           <div className="flex items-baseline gap-3 mb-6">
             <p className="text-6xl font-display font-black text-earth-900 tracking-tighter leading-none">{latestTest?.ph || '—'}</p>
             <span className="text-xs font-display font-bold text-forest-600 uppercase tracking-widest bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-100">
               {latestTest?.ph ? (latestTest.ph < 6 ? 'Acidic' : latestTest.ph > 7 ? 'Alkaline' : 'Optimal') : 'N/A'}
             </span>
           </div>
           <div className="w-full bg-earth-100/50 h-2.5 rounded-full overflow-hidden flex shadow-inner">
             <div className="h-full bg-terracotta-400" style={{ width: '30%' }}></div>
             <div className="h-full bg-forest-400" style={{ width: '40%' }}></div>
             <div className="h-full bg-amber-400" style={{ width: '30%' }}></div>
           </div>
           <p className="text-[9px] font-display font-bold text-earth-400 mt-4 uppercase tracking-[0.2em]">Scale: Acidic / Optimal / Alkaline</p>
        </div>

        {[
          { label: 'Nitrogen (N)', key: 'nitrogen', color: 'bg-forest-500', icon: 'N' },
          { label: 'Phosphorus (P)', key: 'phosphorus', color: 'bg-amber-500', icon: 'P' },
          { label: 'Potassium (K)', key: 'potassium', color: 'bg-blue-500', icon: 'K' }
        ].map((nutrient) => (
          <div key={nutrient.key} className="card p-8 card-hover group relative overflow-hidden bg-gradient-to-br from-white to-earth-50/10">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-display font-black text-6xl select-none group-hover:scale-110 transition-transform">
               {nutrient.icon}
             </div>
             <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest mb-6">{nutrient.label}</p>
             <div className="flex items-baseline gap-2 mb-4">
               <p className={cn("text-5xl font-display font-black tracking-tight uppercase leading-none", latestTest ? getStatusColor(latestTest[nutrient.key as keyof typeof latestTest] as string).split(' ')[0] : "text-earth-200")}>
                 {latestTest ? latestTest[nutrient.key as keyof typeof latestTest] : '—'}
               </p>
             </div>
             <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", latestTest ? "bg-black/20" : "bg-earth-100")}></div>
                <p className="text-[10px] font-display font-bold text-earth-400 uppercase tracking-widest">
                  {latestTest ? (latestTest[nutrient.key as keyof typeof latestTest] === 'low' ? 'Urgent Enrichment' : 'Maintenance Mode') : 'Pending Test'}
                </p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Test History - Refined List */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-earth-100 pb-4">
            <h2 className="text-2xl font-display font-bold text-earth-900 tracking-tight italic">Test Archive</h2>
            {soilTests.length > 0 && <span className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest">{soilTests.length} Records</span>}
          </div>
          
          <div className="space-y-4">
            {soilTests.length === 0 ? (
              <div className="card p-20 text-center border-dashed border-2 bg-earth-50/30 flex flex-col items-center">
                <div className="p-5 bg-white rounded-[2rem] shadow-soft border border-earth-100 mb-6 group-hover:scale-110 transition-transform">
                  <Info className="w-10 h-10 text-earth-200" />
                </div>
                <h3 className="text-xl font-display font-bold text-earth-900 mb-2">No soil telemetry found</h3>
                <p className="text-earth-500 font-medium text-sm max-w-[240px]">Start by logging your first manual or lab analysis result.</p>
              </div>
            ) : (
              [...soilTests].reverse().map((test, idx) => {
                const cycle = cropCycles.find(c => c.id === test.cropCycleId);
                const cropInLibrary = cropLibrary.find(c => c.id === cycle?.cropId);
                
                let phStatus = 'Normal';
                if (cropInLibrary?.optimalPh) {
                  if (test.ph < cropInLibrary.optimalPh[0]) phStatus = 'Acidic for ' + cropInLibrary.name;
                  if (test.ph > cropInLibrary.optimalPh[1]) phStatus = 'Alkaline for ' + cropInLibrary.name;
                }

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={test.id} 
                    className="card p-8 group hover:bg-white hover:border-forest-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 border-transparent"
                  >
                    <div className="flex gap-8 items-start">
                      <div className="w-20 h-20 bg-earth-50 rounded-[2rem] flex flex-col items-center justify-center border border-earth-100 group-hover:bg-forest-50 group-hover:border-forest-100 transition-colors shadow-inner shrink-0">
                        <p className="text-[11px] font-display font-black text-earth-400 uppercase tracking-widest leading-none mb-1 group-hover:text-forest-400">{format(new Date(test.date), 'MMM')}</p>
                        <p className="text-3xl font-display font-black text-earth-900 tracking-tighter leading-none group-hover:text-forest-900">{format(new Date(test.date), 'dd')}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="text-2xl font-display font-bold text-earth-900 tracking-tight italic">{cycle?.variety || 'Field Boundary Test'}</h3>
                           <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[9px] font-display font-black uppercase tracking-widest rounded-lg border border-amber-100">Lab Analysis</span>
                        </div>
                        <p className={cn(
                          "text-[10px] font-display font-bold uppercase tracking-[0.2em] mb-6",
                          phStatus === 'Normal' ? "text-earth-400" : "text-terracotta-600"
                        )}>
                          {phStatus} {test.notes ? `• ${test.notes}` : ''}
                        </p>
                        <div className="flex flex-wrap gap-3">
                           <div className={cn("px-4 py-2 rounded-2xl border text-[10px] font-display font-black uppercase tracking-widest shadow-sm", getStatusColor(test.nitrogen))}>N: {test.nitrogen}</div>
                           <div className={cn("px-4 py-2 rounded-2xl border text-[10px] font-display font-black uppercase tracking-widest shadow-sm", getStatusColor(test.phosphorus))}>P: {test.phosphorus}</div>
                           <div className={cn("px-4 py-2 rounded-2xl border text-[10px] font-display font-black uppercase tracking-widest shadow-sm", getStatusColor(test.potassium))}>K: {test.potassium}</div>
                           <div className="px-4 py-2 rounded-2xl border border-earth-100 text-earth-600 text-[10px] font-display font-black uppercase tracking-widest bg-earth-50 shadow-sm">pH: {test.ph}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Nutrition Advisor - Refined Card */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-earth-100 pb-4">
             <TrendingUp className="w-5 h-5 text-forest-600" />
             <h2 className="text-2xl font-display font-bold text-earth-900 tracking-tight italic">Intelligence Hub</h2>
          </div>
          
          <div className="card p-10 bg-forest-900 text-white border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-125 transition-transform pointer-events-none">
               <Beaker className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-forest-300">Bioavailability Alert</p>
                  <p className="text-xs font-bold text-white/50">Updated 2h ago</p>
                </div>
              </div>
              
              <h3 className="text-3xl font-display font-black italic mb-6 tracking-tight leading-tight">Nitrogen levels in <span className="text-amber-400 italic">Sector 4</span> are drifting from setpoints.</h3>
              
              <div className="space-y-6 mb-10">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors group/item">
                  <p className="text-[10px] font-display font-black text-amber-400 uppercase tracking-widest mb-2">Recommendation 01</p>
                  <p className="text-sm font-medium text-forest-50 leading-relaxed italic">Apply 50kg Urea/ha as top-dressing immediately. Focus on silking phase crops.</p>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors group/item">
                  <p className="text-[10px] font-display font-black text-amber-400 uppercase tracking-widest mb-2">Recommendation 02</p>
                  <p className="text-sm font-medium text-forest-50 leading-relaxed italic">Initiate organic mulching to retain nutrient leach from recent high-intensity rains.</p>
                </div>
              </div>
              
              <button className="w-full py-5 bg-white text-forest-900 rounded-[1.5rem] text-[11px] font-display font-black uppercase tracking-[0.2em] hover:bg-forest-50 transition-all hover:scale-[1.02] active:scale-95 shadow-xl">
                Generate Full Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAddingTest && (
        <div className="fixed inset-0 bg-earth-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden border border-earth-100 animate-in fade-in zoom-in duration-300">
             <div className="p-8 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
               <div>
                 <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tight italic">New Soil Analysis</h2>
                 <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mt-1">Enter Lab or Field Kit Results</p>
               </div>
               <button onClick={() => setIsAddingTest(false)} className="p-3 hover:bg-white rounded-2xl text-earth-400 transition-colors border border-transparent hover:border-earth-100">
                 <AlertCircle className="w-6 h-6" />
               </button>
             </div>
             
             <form onSubmit={handleAddTest} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Crop Cycle Link</label>
                  <select 
                    value={newTest.cropCycleId}
                    onChange={e => setNewTest({...newTest, cropCycleId: e.target.value})}
                    className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:outline-none focus:ring-4 focus:ring-forest-500/10 transition-all appearance-none"
                  >
                    <option value="">General (No specific cycle)</option>
                    {activeCycles.map(c => (
                      <option key={c.id} value={c.id}>{c.variety} - {c.season}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">pH Level</label>
                    <input 
                      type="number" step="0.1"
                      className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                      value={newTest.ph}
                      onChange={e => setNewTest({...newTest, ph: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Organic Matter (%)</label>
                    <input 
                      type="number" step="0.1"
                      className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                      value={newTest.organicMatter}
                      onChange={e => setNewTest({...newTest, organicMatter: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   {['nitrogen', 'phosphorus', 'potassium'].map((nutrient) => (
                     <div key={nutrient}>
                       <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 block truncate">{nutrient.slice(0, 3)} (N/P/K)</label>
                       <select 
                         className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                         value={newTest[nutrient as keyof typeof newTest] as string}
                         onChange={e => setNewTest({...newTest, [nutrient]: e.target.value})}
                       >
                         <option value="low">Low</option>
                         <option value="medium">Medium</option>
                         <option value="high">High</option>
                       </select>
                     </div>
                   ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAddingTest(false)} className="flex-1 py-4 text-earth-400 font-black uppercase tracking-widest text-xs hover:text-earth-600 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-forest-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-forest-200">Save Analysis</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

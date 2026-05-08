import React, { useState } from 'react';
import { useStore } from '../store';
import { Beaker, TrendingUp, AlertCircle, Plus, Info } from 'lucide-react';
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
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-earth-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-earth-900 tracking-tight flex items-center gap-4 italic uppercase">
            <Beaker className="w-10 h-10 text-forest-600" />
            Soil Health & Nutrition
          </h1>
          <p className="text-earth-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ml-14">Precision Monitoring for Peak Harvests</p>
        </div>
        <button 
          onClick={() => setIsAddingTest(true)}
          className="group relative bg-forest-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 overflow-hidden transition-all hover:pr-10 active:scale-95 shadow-lg shadow-forest-200"
        >
          <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="w-5 h-5 transition-transform group-hover:scale-125" />
          Log Soil Test
        </button>
      </header>

      {/* Nutrients Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-white p-6 border-earth-100 hover:scale-105 transition-transform cursor-default">
           <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-4">Latest pH Level</p>
           <div className="flex items-baseline gap-2">
             <p className="text-5xl font-black text-earth-900 tracking-tighter">{latestTest?.ph || '—'}</p>
             <span className="text-sm font-bold text-forest-600">
               {latestTest?.ph ? (latestTest.ph < 6 ? 'Acidic' : latestTest.ph > 7 ? 'Alkaline' : 'Optimal') : 'No Data'}
             </span>
           </div>
           <div className="w-full bg-earth-100 h-2 rounded-full mt-6 overflow-hidden flex">
             <div className="h-full bg-terracotta-500" style={{ width: '30%' }}></div>
             <div className="h-full bg-forest-500" style={{ width: '40%' }}></div>
             <div className="h-full bg-amber-500" style={{ width: '30%' }}></div>
           </div>
        </div>

        <div className="card bg-white p-6 border-earth-100 hover:scale-105 transition-transform cursor-default">
           <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-4">Nitrogen (N)</p>
           <div className="flex items-baseline gap-2">
             <p className={cn("text-4xl font-black tracking-tight uppercase", latestTest ? getStatusColor(latestTest.nitrogen).split(' ')[0] : "text-earth-200")}>
               {latestTest?.nitrogen || '—'}
             </p>
           </div>
           <p className="text-[10px] font-bold text-earth-400 mt-2">
             {latestTest?.nitrogen === 'low' ? 'Recommended: Urea top-dress' : 'Status: Acceptable'}
           </p>
        </div>

        <div className="card bg-white p-6 border-earth-100 hover:scale-105 transition-transform cursor-default">
           <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-4">Phosphorus (P)</p>
           <div className="flex items-baseline gap-2">
             <p className={cn("text-4xl font-black tracking-tight uppercase", latestTest ? getStatusColor(latestTest.phosphorus).split(' ')[0] : "text-earth-200")}>
               {latestTest?.phosphorus || '—'}
             </p>
           </div>
           <p className="text-[10px] font-bold text-earth-400 mt-2">
             {latestTest?.phosphorus === 'low' ? 'Recommended: NPK 15-15-15' : 'Status: Acceptable'}
           </p>
        </div>

        <div className="card bg-white p-6 border-earth-100 hover:scale-105 transition-transform cursor-default">
           <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-4">Potassium (K)</p>
           <div className="flex items-baseline gap-2">
             <p className={cn("text-4xl font-black tracking-tight uppercase", latestTest ? getStatusColor(latestTest.potassium).split(' ')[0] : "text-earth-200")}>
               {latestTest?.potassium || '—'}
             </p>
           </div>
           <p className="text-[10px] font-bold text-earth-400 mt-2">
             {latestTest?.potassium === 'low' ? 'Recommended: MOP application' : 'Status: Acceptable'}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tight italic">Soil Test History</h2>
          </div>
          
          <div className="space-y-4">
            {soilTests.length === 0 ? (
              <div className="card p-12 text-center border-dashed border-2 bg-earth-50/50">
                <Info className="w-12 h-12 text-earth-200 mx-auto mb-4" />
                <p className="text-earth-500 font-bold uppercase tracking-widest">No soil tests logged yet.</p>
              </div>
            ) : (
              soilTests.map(test => {
                const cycle = cropCycles.find(c => c.id === test.cropCycleId);
                const cropInLibrary = cropLibrary.find(c => c.id === cycle?.cropId);
                
                let phStatus = 'Normal';
                if (cropInLibrary?.optimalPh) {
                  if (test.ph < cropInLibrary.optimalPh[0]) phStatus = 'Too Acidic for ' + cropInLibrary.name;
                  if (test.ph > cropInLibrary.optimalPh[1]) phStatus = 'Too Alkaline for ' + cropInLibrary.name;
                }

                return (
                  <div key={test.id} className="card p-6 bg-white border-earth-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 bg-earth-50 rounded-2xl flex flex-col items-center justify-center border border-earth-100 shrink-0">
                        <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest leading-none mb-1">{format(new Date(test.date), 'MMM')}</p>
                        <p className="text-2xl font-black text-earth-900 tracking-tighter leading-none">{format(new Date(test.date), 'dd')}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-earth-900 tracking-tight italic">{cycle?.variety || 'General Plot'}</h3>
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.2em] mt-1",
                          phStatus === 'Normal' ? "text-earth-400" : "text-terracotta-600"
                        )}>
                          {phStatus} {test.notes ? `• ${test.notes}` : ''}
                        </p>
                        <div className="flex gap-2 mt-3">
                           <span className={cn("text-[9px] font-black px-2 py-1 rounded-full border uppercase tracking-widest", getStatusColor(test.nitrogen))}>N: {test.nitrogen}</span>
                           <span className={cn("text-[9px] font-black px-2 py-1 rounded-full border uppercase tracking-widest", getStatusColor(test.phosphorus))}>P: {test.phosphorus}</span>
                           <span className={cn("text-[9px] font-black px-2 py-1 rounded-full border uppercase tracking-widest", getStatusColor(test.potassium))}>K: {test.potassium}</span>
                           <span className="text-[9px] font-black px-2 py-1 rounded-full border border-earth-100 text-earth-600 uppercase tracking-widest bg-earth-50">pH: {test.ph}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tight italic">AI Nutrition Advisor</h2>
          <div className="card p-8 bg-gradient-to-br from-forest-700 to-forest-900 text-white border-none shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
               <Beaker className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-forest-200">Attention Required</p>
              </div>
              <h3 className="text-2xl font-black italic mb-4 tracking-tight leading-tight">Nitrogen levels in Post-Planting plots are 25% below optimal.</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-xs font-bold text-forest-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></div>
                  Apply 50kg Urea/ha as top-dressing immediately.
                </li>
                <li className="flex items-start gap-3 text-xs font-bold text-forest-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5"></div>
                  Consider intercropping with Cowpea to fix biological nitrogen.
                </li>
              </ul>
              <button className="w-full py-4 bg-white text-forest-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-forest-50 transition-colors">
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

import { motion } from 'motion/react';
import { useStore } from '../store';
import { Sprout, Plus, X, ArrowRight, Loader2, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { cropLibrary } from '../data/cropLibrary';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { generateCropPlan } from '../lib/gemini';
import { CropCycleProgressBar } from '../components/CropCycleProgressBar';

export function CropCycles() {
  const { cropCycles, farms, addCropCycle, addTasks, selectedFarmId } = useStore();
  const [isAddingCycle, setIsAddingCycle] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  const currentFarmCycles = cropCycles.filter(c => c.farmId === selectedFarmId);

  const [newCycle, setNewCycle] = useState({
    farmId: selectedFarmId || '',
    cropId: '',
    variety: '',
    area: '',
    plantingDate: '',
    season: 'Wet Season',
    purpose: 'Commercial',
    system: 'open_field' as const,
    status: 'planned' as const
  });

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCycle.farmId && newCycle.cropId && newCycle.plantingDate) {
      setIsGeneratingPlan(true);
      const cycleId = `cc_${Date.now()}`;
      
      addCropCycle({
        id: cycleId,
        farmId: newCycle.farmId,
        cropId: newCycle.cropId,
        variety: newCycle.variety,
        area: parseFloat(newCycle.area) || 0,
        plantingDate: newCycle.plantingDate,
        season: newCycle.season,
        purpose: newCycle.purpose,
        system: newCycle.system,
        status: newCycle.status
      });

      try {
        const crop = cropLibrary.find(c => c.id === newCycle.cropId);
        const farm = farms.find(f => f.id === newCycle.farmId);
        if (crop && farm) {
          const plan = await generateCropPlan({
            cropName: crop.name,
            variety: newCycle.variety || 'Unknown',
            plantingDate: newCycle.plantingDate,
            system: newCycle.system || 'open_field',
            location: farm.agroZone + ', ' + farm.waterSource
          });

          if (plan && plan.tasks) {
            const mappedTasks = plan.tasks.map((t: any, index: number) => ({
              id: `t_${Date.now()}_${index}`,
              cropCycleId: cycleId,
              taskType: t.taskType,
              dueDate: t.dueDate,
              status: 'pending',
              notes: t.notes
            }));
            addTasks(mappedTasks);
          }
        }
      } catch (err) {
        console.error("Failed to generate crop plan:", err);
      } finally {
        setIsGeneratingPlan(false);
        setIsAddingCycle(false);
        setNewCycle({
          farmId: '',
          cropId: '',
          variety: '',
          area: '',
          plantingDate: '',
          season: 'Wet Season',
          purpose: 'Commercial',
          system: 'open_field',
          status: 'planned'
        });
      }
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-earth-100">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-forest-50 text-forest-600 rounded-[1.25rem] shadow-sm border border-forest-100">
              <Sprout className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-display font-black text-forest-600 uppercase tracking-[0.3em]">Temporal Cultivation</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-earth-900 tracking-tighter leading-tight italic">
            Crop <br/>
            <span className="text-terracotta-600 italic">Lifecycle Registry</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsAddingCycle(true)}
          className="btn-primary flex items-center gap-3 px-10 py-5 shadow-2xl shadow-forest-200/50"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:scale-125" />
          Initialize Cycle
        </button>
      </header>

      {isAddingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-earth-100 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center p-8 border-b border-earth-100 bg-earth-50/50">
               <div>
                 <h2 className="text-2xl font-display font-black text-earth-900 italic tracking-tight leading-none">New Cultivation Protocol</h2>
                 <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-widest mt-2">Define parameters & environmental system</p>
               </div>
               <button onClick={() => setIsAddingCycle(false)} className="p-3 bg-white border border-earth-100 rounded-2xl text-earth-400 hover:text-earth-900 transition-all hover:scale-110">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-10 overflow-y-auto custom-scrollbar">
              <form id="add-cycle-form" onSubmit={handleCreateCycle} className="space-y-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Farm / Plot Allocation</label>
                  <select required className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 appearance-none focus:outline-none focus:ring-4 focus:ring-forest-500/10 transition-all" value={newCycle.farmId} onChange={e => setNewCycle({...newCycle, farmId: e.target.value})}>
                    <option value="">Select Target Plot...</option>
                    {farms.filter(f => !selectedFarmId || f.id === selectedFarmId).map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.area} {f.areaUnit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Biological Class (Crop)</label>
                    <select required className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 appearance-none focus:outline-none focus:ring-4 focus:ring-forest-500/10 transition-all" value={newCycle.cropId} onChange={e => setNewCycle({...newCycle, cropId: e.target.value})}>
                      <option value="">Select Species...</option>
                      {cropLibrary.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Variety Variant</label>
                    <input type="text" className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900" value={newCycle.variety} onChange={e => setNewCycle({...newCycle, variety: e.target.value})} placeholder="e.g. F1 Hybrid" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Initialization Date</label>
                    <input required type="date" className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900" value={newCycle.plantingDate} onChange={e => setNewCycle({...newCycle, plantingDate: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Allocated Area (ha)</label>
                    <input type="number" step="0.1" className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900" value={newCycle.area} onChange={e => setNewCycle({...newCycle, area: e.target.value})} placeholder="1.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Seasonal Period</label>
                    <select className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 appearance-none focus:outline-none focus:ring-4 focus:ring-forest-500/10 transition-all" value={newCycle.season} onChange={e => setNewCycle({...newCycle, season: e.target.value})}>
                      <option value="Wet Season">Wet Season</option>
                      <option value="Dry Season">Dry Season</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Commercial Intent</label>
                    <select className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 appearance-none focus:outline-none focus:ring-4 focus:ring-forest-500/10 transition-all" value={newCycle.purpose} onChange={e => setNewCycle({...newCycle, purpose: e.target.value})}>
                      <option value="Commercial">Commercial Export/Local</option>
                      <option value="Subsistence">Internal Research/Seed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Cultivation System</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'open_field', label: 'Open Field', icon: Sprout },
                      { id: 'greenhouse', label: 'Greenhouse', icon: Sprout },
                      { id: 'shade_net', label: 'Shade Net', icon: Sprout },
                    ].map((sys) => (
                      <button
                        key={sys.id}
                        type="button"
                        onClick={() => setNewCycle({...newCycle, system: sys.id as any})}
                        className={cn(
                          "p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3",
                          newCycle.system === sys.id 
                            ? "bg-[#0A0A0A] border-black text-white shadow-xl scale-105" 
                            : "bg-earth-50 border-earth-100 text-earth-400 hover:border-earth-200"
                        )}
                      >
                        <sys.icon className="w-6 h-6" />
                        <span className="text-[10px] font-display font-black uppercase tracking-widest">{sys.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-8 border-t border-earth-100 bg-earth-50 flex justify-end gap-6">
              <button type="button" onClick={() => setIsAddingCycle(false)} className="px-6 py-4 text-earth-400 font-display font-black uppercase tracking-widest text-xs hover:text-earth-900" disabled={isGeneratingPlan}>Cancel</button>
              <button type="submit" form="add-cycle-form" className="btn-primary px-10 py-4 shadow-xl shadow-forest-200/50 flex items-center gap-3" disabled={isGeneratingPlan}>
                {isGeneratingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isGeneratingPlan ? 'Synthesizing Plan...' : 'Initialize Protocol'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {currentFarmCycles.length === 0 ? (
          <div className="col-span-full card p-32 text-center border-dashed border-2 bg-earth-50/30 flex flex-col items-center">
            <div className="p-8 bg-white rounded-[2.5rem] shadow-soft border border-earth-100 mb-8">
              <Sprout className="w-16 h-16 text-forest-100" />
            </div>
            <h3 className="text-3xl font-display font-bold text-earth-900 mb-3 tracking-tight">No Active Cycles Detected</h3>
            <p className="text-earth-500 font-medium max-w-sm">The farm registry is currently dormant. Use the "Initialize" button to begin a new cultivation protocol.</p>
          </div>
        ) : (
          currentFarmCycles.map((cycle, idx) => {
            const crop = cropLibrary.find(c => c.id === cycle.cropId);
            const farm = farms.find(f => f.id === cycle.farmId);
            
            return (
              <Link 
                to={`/cycles/${cycle.id}`} 
                key={cycle.id} 
                className="group relative"
              >
                <div className="card p-0 overflow-hidden card-hover border-transparent flex flex-col h-full">
                  <div className="p-8 border-b border-earth-100 bg-earth-50/50 flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-earth-100 shadow-sm">
                           <Sprout className="w-6 h-6 text-forest-600" />
                         </div>
                         <h3 className="text-2xl font-display font-bold text-earth-900 tracking-tight leading-none italic group-hover:text-forest-600 transition-colors">
                            {crop?.name || 'Unknown Species'}
                         </h3>
                       </div>
                       <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">{cycle.variety}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-display font-black uppercase tracking-[0.2em] shadow-lg",
                      cycle.status === 'active' ? 'bg-forest-600 text-white shadow-forest-200' : 
                      cycle.status === 'planned' ? 'bg-amber-500 text-black shadow-amber-200' : 
                      'bg-earth-200 text-earth-700'
                    )}>
                      {cycle.status}
                    </span>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Environment & Plot</p>
                        <p className="text-lg font-display font-bold text-earth-900 tracking-tight leading-none italic">
                          {farm?.name} <span className="text-earth-300 font-medium mx-1">/</span> {cycle.area} ha <br/>
                          <span className="text-sm text-earth-500 font-medium not-italic mt-2 block">
                            {cycle.system === 'greenhouse' ? 'Controlled Greenhouse' : cycle.system === 'shade_net' ? 'Atmospheric Shade Net' : 'Open Field Cultivation'}
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pb-8">
                        <div>
                          <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-widest mb-2 leading-none">Initialization</p>
                          <p className="font-display font-bold text-earth-900 italic tracking-tight">{cycle.plantingDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-widest mb-2 leading-none">Target Intent</p>
                          <p className="font-display font-bold text-earth-900 italic tracking-tight">{cycle.purpose}</p>
                        </div>
                      </div>
                    </div>
                    
                    {cycle.status !== 'planned' && (
                      <div className="pt-8 border-t border-earth-100 relative group/progress">
                         <div className="flex justify-between items-end mb-4">
                            <p className="text-[10px] font-display font-black text-forest-600 uppercase tracking-widest">Biological Maturity</p>
                            <ArrowRight className="w-5 h-5 text-earth-200 group-hover:text-forest-600 transition-all group-hover:translate-x-2" />
                         </div>
                         <CropCycleProgressBar cycle={cycle} crop={crop} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  );
}

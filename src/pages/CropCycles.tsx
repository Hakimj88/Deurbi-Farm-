import { useStore } from '../store';
import { Sprout, Plus, X, ArrowRight } from 'lucide-react';
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
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 tracking-tight flex items-center gap-3">
            <Sprout className="w-8 h-8 text-forest-600" />
            Crop Cycles
          </h1>
          <p className="text-earth-500 mt-1">Manage active and planned planting cycles.</p>
        </div>
        <button 
          onClick={() => setIsAddingCycle(true)}
          className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Cycle
        </button>
      </header>

      {isAddingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-earth-100 bg-earth-50">
               <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                 <Sprout className="w-5 h-5 text-terracotta-500" />
                 Create New Crop Cycle
               </h2>
               <button onClick={() => setIsAddingCycle(false)} className="text-earth-500 hover:text-earth-900">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="add-cycle-form" onSubmit={handleCreateCycle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">Farm / Plot</label>
                  <select required className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newCycle.farmId} onChange={e => setNewCycle({...newCycle, farmId: e.target.value})}>
                    <option value="">Select Farm...</option>
                    {farms.filter(f => !selectedFarmId || f.id === selectedFarmId).map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.area} {f.areaUnit})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Crop</label>
                    <select required className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newCycle.cropId} onChange={e => setNewCycle({...newCycle, cropId: e.target.value})}>
                      <option value="">Select Crop...</option>
                      {cropLibrary.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Variety</label>
                    <input type="text" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newCycle.variety} onChange={e => setNewCycle({...newCycle, variety: e.target.value})} placeholder="e.g. Oba Super 6" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Planting Date</label>
                    <input required type="date" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newCycle.plantingDate} onChange={e => setNewCycle({...newCycle, plantingDate: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Area Planted (ha)</label>
                    <input type="number" step="0.1" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newCycle.area} onChange={e => setNewCycle({...newCycle, area: e.target.value})} placeholder="1.5" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Season</label>
                    <select className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newCycle.season} onChange={e => setNewCycle({...newCycle, season: e.target.value})}>
                      <option value="Wet Season">Wet Season</option>
                      <option value="Dry Season">Dry Season</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Purpose</label>
                    <select className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newCycle.purpose} onChange={e => setNewCycle({...newCycle, purpose: e.target.value})}>
                      <option value="Commercial">Commercial</option>
                      <option value="Subsistence">Subsistence</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">System / Method</label>
                  <select className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newCycle.system} onChange={e => setNewCycle({...newCycle, system: e.target.value as any})}>
                    <option value="open_field">Open Field</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="shade_net">Shade Net</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-earth-100 bg-earth-50 flex justify-end gap-3 mt-auto">
              <button type="button" onClick={() => setIsAddingCycle(false)} className="px-4 py-2 text-earth-600 font-medium hover:bg-earth-100 rounded-lg" disabled={isGeneratingPlan}>Cancel</button>
              <button type="submit" form="add-cycle-form" className="px-4 py-2 bg-forest-600 text-white font-medium hover:bg-forest-700 rounded-lg flex items-center gap-2" disabled={isGeneratingPlan}>
                {isGeneratingPlan ? 'Generating Plan...' : 'Create Cycle'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentFarmCycles.length === 0 ? (
          <div className="col-span-full card p-8 text-center">
            <p className="text-earth-500">No crop cycles started yet on this farm.</p>
          </div>
        ) : (
          currentFarmCycles.map(cycle => {
            const crop = cropLibrary.find(c => c.id === cycle.cropId);
            const farm = farms.find(f => f.id === cycle.farmId);
            
            return (
              <Link to={`/cycles/${cycle.id}`} key={cycle.id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                <div className="p-4 border-b border-earth-100 bg-earth-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-earth-900 flex items-center md:gap-2">
                    {crop?.name || 'Unknown Crop'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                      ${cycle.status === 'active' ? 'bg-forest-100 text-forest-700' : 
                        cycle.status === 'planned' ? 'bg-amber-100 text-amber-700' : 
                        'bg-earth-100 text-earth-700'}`}>
                      {cycle.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-earth-400 group-hover:text-forest-600 transition-colors" />
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Variety</p>
                    <p className="font-medium text-earth-900">{cycle.variety}</p>
                  </div>
                  <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Location & System</p>
                    <p className="font-medium text-earth-900">{farm?.name} ({cycle.area} ha) • {cycle.system === 'greenhouse' ? 'Greenhouse' : cycle.system === 'shade_net' ? 'Shade Net' : 'Open Field'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Planting Date</p>
                      <p className="font-medium text-earth-900">{cycle.plantingDate}</p>
                    </div>
                     <div>
                      <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Purpose</p>
                      <p className="font-medium text-earth-900">{cycle.purpose}</p>
                    </div>
                  </div>
                  
                  {cycle.status !== 'planned' && (
                    <div className="mt-4 pt-4 border-t border-earth-100">
                       <CropCycleProgressBar cycle={cycle} crop={crop} />
                    </div>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

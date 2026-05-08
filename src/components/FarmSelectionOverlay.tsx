import { useStore } from '../store';
import { Map, Plus, ChevronRight, LocateFixed, Loader2, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { Farm } from '../types';

export function FarmSelectionOverlay() {
  const { farms, selectedFarmId, setSelectedFarmId, addFarm, farmer } = useStore();
  const [showAddFarm, setShowAddFarm] = useState(farms.length === 0);
  const [isLocating, setIsLocating] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: '',
    area: '',
    soilType: 'loamy' as Farm['soilType'],
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });

  const handleSelect = (id: string) => {
    setSelectedFarmId(id);
  };

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarm.name || !newFarm.area) return;

    const farm: Farm = {
      id: `farm-${Date.now()}`,
      farmerId: farmer?.id || 'f1',
      name: newFarm.name,
      area: parseFloat(newFarm.area),
      areaUnit: 'ha',
      soilType: newFarm.soilType,
      agroZone: 'Sudan Savanna',
      waterSource: 'Rain-fed',
      latitude: newFarm.latitude,
      longitude: newFarm.longitude
    };

    addFarm(farm);
    setSelectedFarmId(farm.id);
    setShowAddFarm(false);
  };

  const getGPSLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewFarm({
            ...newFarm,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
          alert("Could not get exact location. Please enter manually if needed.");
        }
      );
    }
  };

  if (selectedFarmId) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-earth-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full md:h-auto md:max-w-4xl grid md:grid-cols-2 bg-white md:rounded-3xl md:shadow-2xl overflow-hidden"
      >
        <div className="bg-forest-900 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
            <Map className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <Sprout className="w-10 h-10 text-forest-400" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4 leading-tight">Welcome to <br/><span className="text-forest-400">Deurbi Farms</span></h2>
            <p className="text-forest-100 text-lg opacity-80 leading-relaxed">
              Empowering your farm with data-driven insights. Select your plot to begin monitoring and optimizations.
            </p>
          </div>
          
          <div className="mt-auto pt-12 text-[10px] uppercase tracking-[0.2em] font-bold text-forest-500">
            Phase 1 Deployment • West Africa Region
          </div>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!showAddFarm ? (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="grid gap-3">
                  {farms.map(farm => (
                    <button
                      key={farm.id}
                      onClick={() => handleSelect(farm.id)}
                      className="flex items-center justify-between p-5 bg-white border-2 border-earth-100 rounded-2xl hover:border-forest-500 hover:bg-forest-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600 transition-colors group-hover:bg-forest-500 group-hover:text-white">
                          <Map className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-earth-900">{farm.name}</p>
                          <p className="text-sm text-earth-500">{farm.area} {farm.areaUnit} • {farm.agroZone}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-earth-300 group-hover:text-forest-500 transition-colors" />
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowAddFarm(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 text-forest-600 font-bold border-2 border-dashed border-forest-200 rounded-2xl hover:bg-forest-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  ADD NEW FARM PLOT
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="add-farm"
                onSubmit={handleAddFarm}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-earth-400 uppercase tracking-widest mb-2">Plot Name</label>
                    <input 
                      required
                      className="w-full bg-earth-50 border-none rounded-xl p-4 text-earth-900 focus:ring-2 focus:ring-forest-500 transition-all"
                      placeholder="e.g., North Bank Maize Field"
                      value={newFarm.name}
                      onChange={e => setNewFarm({...newFarm, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-earth-400 uppercase tracking-widest mb-2">Size (Hectares)</label>
                      <input 
                        required
                        type="number"
                        step="0.1"
                        className="w-full bg-earth-50 border-none rounded-xl p-4 text-earth-900 focus:ring-2 focus:ring-forest-500 transition-all"
                        placeholder="e.g., 2.5"
                        value={newFarm.area}
                        onChange={e => setNewFarm({...newFarm, area: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-earth-400 uppercase tracking-widest mb-2">Soil Type</label>
                      <select 
                        className="w-full bg-earth-50 border-none rounded-xl p-4 text-earth-900 focus:ring-2 focus:ring-forest-500 transition-all appearance-none"
                        value={newFarm.soilType}
                        onChange={e => setNewFarm({...newFarm, soilType: e.target.value as Farm['soilType']})}
                      >
                        <option value="sandy">Sandy</option>
                        <option value="loamy">Loamy</option>
                        <option value="clay">Clay</option>
                        <option value="laterite">Laterite</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-earth-50 rounded-2xl p-4 border border-earth-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <LocateFixed className="w-4 h-4 text-forest-500" />
                        <span className="text-sm font-bold text-earth-900 uppercase">GPS Location</span>
                      </div>
                      <button 
                        type="button"
                        onClick={getGPSLocation}
                        disabled={isLocating}
                        className="text-xs font-bold text-forest-600 hover:text-forest-700 flex items-center gap-1"
                      >
                        {isLocating ? <Loader2 className="w-3 h-3 animate-spin"/> : null}
                        GET CURRENT GPS
                      </button>
                    </div>
                    
                    {newFarm.latitude && newFarm.longitude ? (
                      <div className="bg-white rounded-xl p-3 text-xs text-earth-600 font-mono flex justify-between border border-forest-100">
                        <span>LAT: {newFarm.latitude.toFixed(6)}</span>
                        <span>LON: {newFarm.longitude.toFixed(6)}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-earth-400 text-center italic">No exact location set. Highly recommended for accurate weather.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {farms.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => setShowAddFarm(false)}
                      className="flex-1 p-4 font-bold text-earth-500 bg-earth-50 rounded-2xl hover:bg-earth-100 transition-colors"
                    >
                      BACK
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="flex-3 p-4 font-bold text-white bg-forest-600 rounded-2xl hover:bg-forest-700 shadow-lg shadow-forest-200 transition-all"
                  >
                    SAVE & START
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

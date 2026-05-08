import { useStore } from '../store';
import { Map, User, Plus, X, CloudSun } from 'lucide-react';
import React, { useState } from 'react';

export function Farms() {
  const { farmer, farms, addFarm, selectedFarmId } = useStore();
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: '',
    area: '',
    areaUnit: 'ha',
    soilType: 'sandy',
    agroZone: 'Sudan Savanna',
    waterSource: 'Rain-fed',
    latitude: '',
    longitude: ''
  });

  const displayedFarms = farms.filter(f => !selectedFarmId || f.id === selectedFarmId);

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFarm.name && newFarm.area) {
      addFarm({
        id: `farm_${Date.now()}`,
        farmerId: farmer?.id || 'f1',
        name: newFarm.name,
        area: parseFloat(newFarm.area),
        areaUnit: newFarm.areaUnit as 'ha' | 'acres',
        soilType: newFarm.soilType,
        agroZone: newFarm.agroZone,
        waterSource: newFarm.waterSource,
        latitude: newFarm.latitude ? parseFloat(newFarm.latitude) : undefined,
        longitude: newFarm.longitude ? parseFloat(newFarm.longitude) : undefined
      });
      setIsAddingFarm(false);
      setNewFarm({
        name: '',
        area: '',
        areaUnit: 'ha',
        soilType: 'sandy',
        agroZone: 'Sudan Savanna',
        waterSource: 'Rain-fed',
        latitude: '',
        longitude: ''
      });
    }
  };

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setNewFarm({
          ...newFarm,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        });
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 tracking-tight">Profile & Farms</h1>
          <p className="text-earth-500 mt-1">Manage your details and farm plots.</p>
        </div>
        <button 
          onClick={() => setIsAddingFarm(true)}
          className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Farm Plot
        </button>
      </header>

      {isAddingFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-earth-100 bg-earth-50">
               <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                 <Map className="w-5 h-5 text-terracotta-500" />
                 Add New Farm Plot
               </h2>
               <button onClick={() => setIsAddingFarm(false)} className="text-earth-500 hover:text-earth-900">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <form onSubmit={handleAddFarm} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Farm Name</label>
                <input required type="text" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newFarm.name} onChange={e => setNewFarm({...newFarm, name: e.target.value})} placeholder="e.g. Kerewan Plot 2" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-earth-700 mb-1">Area</label>
                  <input required type="number" step="0.1" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newFarm.area} onChange={e => setNewFarm({...newFarm, area: e.target.value})} placeholder="2.5" />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-earth-700 mb-1">Unit</label>
                  <select className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newFarm.areaUnit} onChange={e => setNewFarm({...newFarm, areaUnit: e.target.value})}>
                    <option value="ha">Hectares</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1">Soil Type</label>
                <select className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newFarm.soilType} onChange={e => setNewFarm({...newFarm, soilType: e.target.value})}>
                  <option value="sandy">Sandy</option>
                  <option value="loamy">Loamy</option>
                  <option value="clay">Clay</option>
                </select>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-earth-700">Coordinates (Optional)</label>
                  <button 
                    type="button" 
                    onClick={useMyLocation}
                    className="text-xs text-forest-600 font-bold flex items-center gap-1 hover:text-forest-700"
                  >
                    <Map className="w-3 h-3" />
                    USE MY LOCATION
                  </button>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input type="number" step="0.000001" className="w-full border border-earth-200 rounded-lg p-2 text-sm" value={newFarm.latitude} onChange={e => setNewFarm({...newFarm, latitude: e.target.value})} placeholder="Latitude" />
                  </div>
                  <div className="flex-1">
                    <input type="number" step="0.000001" className="w-full border border-earth-200 rounded-lg p-2 text-sm" value={newFarm.longitude} onChange={e => setNewFarm({...newFarm, longitude: e.target.value})} placeholder="Longitude" />
                  </div>
                </div>
                <p className="text-[10px] text-earth-400">Coordinates enable localized weather forecasts for your farm.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingFarm(false)} className="px-4 py-2 text-earth-600 font-medium hover:bg-earth-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-forest-600 text-white font-medium hover:bg-forest-700 rounded-lg">Save Plot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farmer Profile */}
        <section className="card p-0 overflow-hidden lg:col-span-1">
          <div className="p-6 border-b border-earth-100 bg-earth-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-earth-900">Farmer Profile</h2>
            <User className="w-5 h-5 text-earth-400" />
          </div>
          <div className="p-6 space-y-4">
            {farmer ? (
              <>
                <div>
                  <p className="text-xs text-earth-500 uppercase tracking-wider">Name</p>
                  <p className="font-medium text-earth-900">{farmer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-earth-500 uppercase tracking-wider">Phone</p>
                  <p className="font-medium text-earth-900">{farmer.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-earth-500 uppercase tracking-wider">Location</p>
                  <p className="font-medium text-earth-900">{farmer.village}, {farmer.region}</p>
                </div>
                <div>
                  <p className="text-xs text-earth-500 uppercase tracking-wider">Preferred Language</p>
                  <p className="font-medium text-earth-900">{farmer.language}</p>
                </div>
              </>
            ) : (
              <p className="text-earth-500 text-sm">No profile setup yet.</p>
            )}
          </div>
        </section>

        {/* Farms List */}
        <section className="lg:col-span-2 space-y-4">
          {displayedFarms.length === 0 ? (
            <div className="card p-8 text-center">
              <Map className="w-12 h-12 text-earth-300 mx-auto mb-4" />
              <p className="text-earth-500">No farms registered yet.</p>
            </div>
          ) : (
            displayedFarms.map(farm => (
              <div key={farm.id} className="card p-0 overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-terracotta-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Map className="w-6 h-6 text-terracotta-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-earth-900">{farm.name}</h3>
                      <p className="text-sm text-earth-500 mt-1">
                        {farm.area} {farm.areaUnit} • {farm.soilType} Soil • {farm.waterSource}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-earth-100 text-earth-800">
                          {farm.agroZone}
                        </div>
                        {farm.latitude && farm.longitude && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest-50 text-forest-700">
                            <CloudSun className="w-3 h-3" />
                            Weather Active
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-forest-600 hover:text-forest-500 text-sm font-medium self-start md:self-center">
                    Edit Plot
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

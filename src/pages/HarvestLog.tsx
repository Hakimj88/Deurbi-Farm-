import { useStore } from '../store';
import { Wheat, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { cropLibrary } from '../data/cropLibrary';

export function HarvestLog() {
  const { harvestRecords, cropCycles, addHarvestRecord, farms, selectedFarmId } = useStore();
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState({
    cropCycleId: '',
    date: '',
    quantity: '',
    unit: 'kg',
    quality: 'Good',
    destination: 'Market'
  });

  const currentFarmCycles = cropCycles.filter(c => c.farmId === selectedFarmId);
  const filteredRecords = harvestRecords.filter(record => 
    currentFarmCycles.some(c => c.id === record.cropCycleId)
  );

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.cropCycleId && newLog.quantity && newLog.date) {
      addHarvestRecord({
        id: `hr_${Date.now()}`,
        cropCycleId: newLog.cropCycleId,
        date: newLog.date,
        quantity: parseFloat(newLog.quantity) || 0,
        unit: newLog.unit as 'kg' | 'bags' | 'tons',
        quality: newLog.quality,
        destination: newLog.destination
      });
      setIsAddingLog(false);
      setNewLog({
        cropCycleId: '',
        date: '',
        quantity: '',
        unit: 'kg',
        quality: 'Good',
        destination: 'Market'
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 tracking-tight flex items-center gap-3">
            <Wheat className="w-8 h-8 text-forest-600" />
            Harvest Records
          </h1>
          <p className="text-earth-500 mt-1">Track crop yields and destinations.</p>
        </div>
        <button 
          onClick={() => setIsAddingLog(true)}
          className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Record Harvest
        </button>
      </header>

      {isAddingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-earth-100 bg-earth-50">
               <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                 <Wheat className="w-5 h-5 text-terracotta-500" />
                 Log Harvest
               </h2>
               <button onClick={() => setIsAddingLog(false)} className="text-earth-500 hover:text-earth-900">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="add-harvest-form" onSubmit={handleAddLog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">Crop Cycle</label>
                  <select required className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.cropCycleId} onChange={e => setNewLog({...newLog, cropCycleId: e.target.value})}>
                    <option value="">Select Cycle...</option>
                    {currentFarmCycles.map(c => {
                      const farm = farms.find(f => f.id === c.farmId);
                      const crop = cropLibrary.find(cl => cl.id === c.cropId);
                      return <option key={c.id} value={c.id}>{crop?.name} ({c.season} at {farm?.name})</option>
                    })}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Date</label>
                    <input required type="date" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Quality</label>
                    <select className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.quality} onChange={e => setNewLog({...newLog, quality: e.target.value})}>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Quantity</label>
                    <input required type="number" step="0.1" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.quantity} onChange={e => setNewLog({...newLog, quantity: e.target.value})} placeholder="e.g. 1500" />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Unit</label>
                    <select className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.unit} onChange={e => setNewLog({...newLog, unit: e.target.value})}>
                      <option value="kg">kg</option>
                      <option value="bags">bags</option>
                      <option value="tons">tons</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">Destination</label>
                  <select className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.destination} onChange={e => setNewLog({...newLog, destination: e.target.value})}>
                    <option value="Market">Market (Sell)</option>
                    <option value="Storage">Storage</option>
                    <option value="Home Consumption">Home Consumption</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-earth-100 bg-earth-50 flex justify-end gap-3 mt-auto">
              <button type="button" onClick={() => setIsAddingLog(false)} className="px-4 py-2 text-earth-600 font-medium hover:bg-earth-100 rounded-lg">Cancel</button>
              <button type="submit" form="add-harvest-form" className="px-4 py-2 bg-forest-600 text-white font-medium hover:bg-forest-700 rounded-lg">Save Record</button>
            </div>
          </div>
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-earth-500">No harvests recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map(record => {
             const cycle = cropCycles.find(c => c.id === record.cropCycleId);
             const cropName = cycle ? cropLibrary.find(c => c.id === cycle.cropId)?.name : 'Unknown';
             return (
              <div key={record.id} className="card p-5">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="font-bold text-lg text-earth-900">{cropName}</h3>
                     <p className="text-sm text-earth-500">{record.date}</p>
                   </div>
                   <span className="px-3 py-1 bg-forest-50 text-forest-700 text-xs font-bold uppercase tracking-wider rounded-full">
                     {record.destination}
                   </span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Yield</p>
                     <p className="font-semibold text-earth-900 text-xl">{record.quantity} <span className="text-sm font-normal text-earth-500">{record.unit}</span></p>
                   </div>
                   <div>
                     <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Quality</p>
                     <p className="font-medium text-earth-900">{record.quality}</p>
                   </div>
                 </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

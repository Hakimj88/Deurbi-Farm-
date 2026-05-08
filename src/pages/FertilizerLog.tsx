import { useStore } from '../store';
import { FlaskConical, Plus, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { cropLibrary } from '../data/cropLibrary';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function FertilizerLogList() {
  const { t } = useTranslation();
  const { fertilizerLogs, cropCycles, addFertilizerLog, farms, selectedFarmId, inventory, updateInventoryQuantity, addFinancialRecord } = useStore();
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLog, setNewLog] = useState({
    cropCycleId: '',
    date: new Date().toISOString().split('T')[0],
    product: '',
    inventoryItemId: '',
    appliedQuantity: 0,
    rate: '', // Visual display rate e.g. "2 bags"
    method: '',
    cost: 0
  });

  const currentFarmCycles = cropCycles.filter(c => c.farmId === selectedFarmId);
  const fertilizerInventory = inventory.filter(i => i.category === 'fertilizer');

  const filteredLogs = fertilizerLogs.filter(log => 
    currentFarmCycles.some(c => c.id === log.cropCycleId)
  );

  const handleInventoryChange = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      const unitPrice = item.subUnit && item.subUnitsPerPackage 
        ? item.unitPrice / item.subUnitsPerPackage 
        : item.unitPrice;
      
      setNewLog({
        ...newLog,
        inventoryItemId: itemId,
        product: item.name,
        cost: unitPrice * (newLog.appliedQuantity || 0)
      });
    } else {
      setNewLog({
        ...newLog,
        inventoryItemId: '',
        product: '',
        cost: 0
      });
    }
  };

  const handleQuantityChange = (qty: number) => {
    const item = inventory.find(i => i.id === newLog.inventoryItemId);
    let cost = newLog.cost;
    
    if (item) {
      const unitPrice = item.subUnit && item.subUnitsPerPackage 
        ? item.unitPrice / item.subUnitsPerPackage 
        : item.unitPrice;
      cost = unitPrice * qty;
    }
    
    setNewLog({
      ...newLog,
      appliedQuantity: qty,
      cost
    });
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.cropCycleId && newLog.product && newLog.date) {
      const logId = `fl_${Date.now()}`;
      const item = inventory.find(i => i.id === newLog.inventoryItemId);
      
      addFertilizerLog({
        id: logId,
        cropCycleId: newLog.cropCycleId,
        date: newLog.date,
        product: newLog.product,
        inventoryItemId: newLog.inventoryItemId,
        appliedQuantity: newLog.appliedQuantity,
        rate: newLog.rate || `${newLog.appliedQuantity} ${item?.subUnit || item?.unit || 'units'}`,
        method: newLog.method,
        cost: newLog.cost
      });

      // Deduct from inventory if linked
      if (newLog.inventoryItemId && newLog.appliedQuantity > 0 && item) {
        let deduction = newLog.appliedQuantity;
        if (item.subUnit && item.subUnitsPerPackage) {
          deduction = newLog.appliedQuantity / item.subUnitsPerPackage;
        }
        updateInventoryQuantity(item.id, Math.max(0, item.quantity - deduction));
      }

      // Add to Finance
      if (newLog.cost > 0) {
        addFinancialRecord({
          id: `fr_${Date.now()}`,
          cropCycleId: newLog.cropCycleId,
          category: 'input',
          item: `Fertilizer: ${newLog.product}`,
          quantity: newLog.appliedQuantity || 1,
          unitCost: newLog.inventoryItemId ? (inventory.find(i => i.id === newLog.inventoryItemId)?.unitPrice || 0) : newLog.cost,
          totalCost: newLog.cost,
          date: newLog.date
        });
      }

      setIsAddingLog(false);
      setNewLog({
        cropCycleId: '',
        date: new Date().toISOString().split('T')[0],
        product: '',
        inventoryItemId: '',
        appliedQuantity: 0,
        rate: '',
        method: '',
        cost: 0
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 tracking-tight flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-forest-600" />
            {t('fertilizer.title')}
          </h1>
          <p className="text-earth-500 mt-1">{t('fertilizer.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAddingLog(true)}
          className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('fertilizer.add_log')}
        </button>
      </header>

      {isAddingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-earth-100 bg-earth-50">
               <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                 <FlaskConical className="w-5 h-5 text-terracotta-500" />
                 Log Fertilizer Application
               </h2>
               <button onClick={() => setIsAddingLog(false)} className="text-earth-500 hover:text-earth-900">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="add-fertilizer-form" onSubmit={handleAddLog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">Crop Cycle</label>
                  <select required className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.cropCycleId} onChange={e => setNewLog({...newLog, cropCycleId: e.target.value})}>
                    <option value="">Select Cycle...</option>
                    {currentFarmCycles.map(c => {
                      const farm = farms.find(f => f.id === c.farmId);
                      return <option key={c.id} value={c.id}>{farm?.name} ({c.season} - {cropLibrary.find(cl => cl.id === c.cropId)?.name})</option>
                    })}
                  </select>
                  {newLog.cropCycleId && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100 flex items-start gap-2">
                      <div className="text-[10px] items-center flex gap-1 font-bold text-amber-700 uppercase">
                        Nutrient Needs: 
                        {(() => {
                           const cycle = cropCycles.find(c => c.id === newLog.cropCycleId);
                           const crop = cropLibrary.find(cl => cl.id === cycle?.cropId);
                           if (!crop?.nutrients) return 'General';
                           return `N:${crop.nutrients.n} P:${crop.nutrients.p} K:${crop.nutrients.k}`;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Date</label>
                    <input required type="date" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Select Product</label>
                    <select 
                      className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" 
                      value={newLog.inventoryItemId} 
                      onChange={e => handleInventoryChange(e.target.value)}
                    >
                      <option value="">-- Custom / Not in Stock --</option>
                      {fertilizerInventory.map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit} in stock)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!newLog.inventoryItemId && (
                  <div>
                    <label className="block text-sm font-medium text-earth-700 mb-1">Custom Product Name</label>
                    <input required type="text" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.product} onChange={e => setNewLog({...newLog, product: e.target.value})} placeholder="e.g. NPK 15-15-15" />
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">
                      Applied Quantity ({newLog.inventoryItemId ? inventory.find(i => i.id === newLog.inventoryItemId)?.unit : 'units'})
                    </label>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" 
                      value={newLog.appliedQuantity} 
                      onChange={e => handleQuantityChange(parseFloat(e.target.value) || 0)} 
                      placeholder="0.00" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-earth-700 mb-1">Method</label>
                    <input type="text" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newLog.method} onChange={e => setNewLog({...newLog, method: e.target.value})} placeholder="e.g. Banding" />
                  </div>
                </div>

                <div className="bg-earth-50 p-4 rounded-xl border border-earth-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-earth-700 uppercase tracking-wider">{t('fertilizer.calculated_cost')}</label>
                    <span className="text-lg font-black text-earth-900">{formatCurrency(newLog.cost)}</span>
                  </div>
                  {!newLog.inventoryItemId ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-earth-500">Manual Price:</span>
                      <input 
                        type="number" 
                        className="flex-1 border border-earth-200 rounded-md p-1 text-sm" 
                        value={newLog.cost} 
                        onChange={e => setNewLog({...newLog, cost: parseFloat(e.target.value) || 0})} 
                        placeholder="0.00" 
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] text-earth-400 font-bold uppercase tracking-widest leading-tight">
                      Based on Unit Price: {formatCurrency(inventory.find(i => i.id === newLog.inventoryItemId)?.unitPrice || 0)} per {inventory.find(i => i.id === newLog.inventoryItemId)?.unit}
                    </p>
                  )}
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-earth-100 bg-earth-50 flex justify-end gap-3 mt-auto">
              <button type="button" onClick={() => setIsAddingLog(false)} className="px-4 py-2 text-earth-600 font-medium hover:bg-earth-100 rounded-lg">Cancel</button>
              <button type="submit" form="add-fertilizer-form" className="px-4 py-2 bg-forest-600 text-white font-medium hover:bg-forest-700 rounded-lg">Save Log</button>
            </div>
          </div>
        </div>
      )}

      {filteredLogs.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-earth-500">No fertilizer applications recorded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map(log => {
             const cycle = cropCycles.find(c => c.id === log.cropCycleId);
             const cropName = cycle ? cropLibrary.find(c => c.id === cycle.cropId)?.name : 'Unknown';
             return (
              <div key={log.id} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className="font-semibold text-earth-900">{log.product}</span>
                     <span className="text-xs bg-forest-50 text-forest-700 px-2 py-1 rounded-md">{log.method}</span>
                   </div>
                   <p className="text-sm text-earth-500">{cropName} Cycle • Date: {log.date}</p>
                 </div>
                 <div className="text-left md:text-right">
                   <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Rate / Cost</p>
                   <p className="font-medium text-earth-900">{log.rate} • {formatCurrency(log.cost)}</p>
                 </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

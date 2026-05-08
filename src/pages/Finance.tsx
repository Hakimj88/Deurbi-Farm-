import { useStore } from '../store';
import { Wallet, Plus, TrendingUp, TrendingDown, X, ChevronDown, ChevronRight, Calculator, PieChart, ShoppingCart, Leaf } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { cropLibrary } from '../data/cropLibrary';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function Finance() {
  const { t } = useTranslation();
  const { financialRecords, cropCycles, addFinancialRecord, farms, selectedFarmId, inventory, updateInventoryQuantity } = useStore();
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    cropCycleId: '',
    category: 'input' as const,
    item: '',
    inventoryItemId: '',
    quantity: 1,
    unitCost: '',
    date: ''
  });

  const currentFarmCycles = cropCycles.filter(c => c.farmId === selectedFarmId);
  const filteredRecords = financialRecords.filter(record => 
    currentFarmCycles.some(c => c.id === record.cropCycleId)
  );

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecord.cropCycleId && newRecord.item && newRecord.unitCost && newRecord.date) {
      const unitCost = parseFloat(newRecord.unitCost);
      addFinancialRecord({
        id: `fr_${Date.now()}`,
        cropCycleId: newRecord.cropCycleId,
        category: newRecord.category,
        item: newRecord.item,
        quantity: newRecord.quantity,
        unitCost: unitCost,
        totalCost: unitCost * newRecord.quantity,
        date: newRecord.date
      });

      // Deduct from inventory if applicable
      if (newRecord.category === 'input' && newRecord.inventoryItemId) {
         const invItem = inventory.find(i => i.id === newRecord.inventoryItemId);
         if (invItem) {
           const newQty = Math.max(0, invItem.quantity - newRecord.quantity);
           updateInventoryQuantity(invItem.id, newQty);
         }
      }

      setIsAddingRecord(false);
      setNewRecord({
        cropCycleId: '',
        category: 'input',
        item: '',
        inventoryItemId: '',
        quantity: 1,
        unitCost: '',
        date: ''
      });
    }
  };

  const totalRevenue = filteredRecords.filter(r => r.category === 'revenue').reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalCost = filteredRecords.filter(r => r.category !== 'revenue').reduce((acc, curr) => acc + curr.totalCost, 0);
  const netIncome = totalRevenue - totalCost;

  // Group by crop cycle for Balance Sheets
  const cycleFinancials = useMemo(() => {
    const data: Record<string, {
      cycleId: string,
      cropName: string,
      season: string,
      farmName: string,
      revenue: number,
      inputCost: number,
      laborCost: number,
      serviceCost: number,
      totalCost: number,
      netProfit: number,
      roi: number,
      records: any[]
    }> = {};

    currentFarmCycles.forEach(cycle => {
      const crop = cropLibrary.find(c => c.id === cycle.cropId);
      const farm = farms.find(f => f.id === cycle.farmId);
      data[cycle.id] = {
        cycleId: cycle.id,
        cropName: crop?.name || 'Unknown Crop',
        season: cycle.season,
        farmName: farm?.name || '',
        revenue: 0,
        inputCost: 0,
        laborCost: 0,
        serviceCost: 0,
        totalCost: 0,
        netProfit: 0,
        roi: 0,
        records: []
      };
    });

    filteredRecords.forEach(record => {
      const sheet = data[record.cropCycleId];
      if (sheet) {
        sheet.records.push(record);
        if (record.category === 'revenue') sheet.revenue += record.totalCost;
        else if (record.category === 'input') sheet.inputCost += record.totalCost;
        else if (record.category === 'labor') sheet.laborCost += record.totalCost;
        else if (record.category === 'service') sheet.serviceCost += record.totalCost;
        
        if (record.category !== 'revenue') sheet.totalCost += record.totalCost;
      }
    });

    Object.values(data).forEach(sheet => {
      sheet.netProfit = sheet.revenue - sheet.totalCost;
      sheet.roi = sheet.totalCost > 0 ? (sheet.netProfit / sheet.totalCost) * 100 : 0;
    });

    return Object.values(data).filter(sheet => sheet.records.length > 0 || currentFarmCycles.some(c => c.id === sheet.cycleId && c.status === 'active'));
  }, [filteredRecords, currentFarmCycles, cropLibrary, farms]);

  const [expandedCycleId, setExpandedCycleId] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-earth-900 tracking-tight flex items-center gap-3 italic">
            <Wallet className="w-10 h-10 text-forest-600" />
            {t('finance.title')}
          </h1>
          <p className="text-earth-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1 ml-13">{t('finance.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAddingRecord(true)}
          className="group relative flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-earth-900/20"
        >
          <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="w-5 h-5" />
          {t('finance.add_transaction')}
        </button>
      </header>

      {/* Global Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-4 md:p-6 bg-terracotta-50/50 border-terracotta-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-32 h-32 text-terracotta-500" />
          </div>
          <p className="text-[10px] font-black text-terracotta-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> {t('finance.total_expenses')}
          </p>
          <p className="text-2xl md:text-4xl font-black text-terracotta-900 mt-2 tracking-tighter truncate">{formatCurrency(totalCost)}</p>
          <p className="text-[10px] md:text-xs font-bold text-terracotta-600/70 mt-2">Inputs, labor, services</p>
        </div>
        <div className="card p-4 md:p-6 bg-forest-50/50 border-forest-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-32 h-32 text-forest-500" />
          </div>
          <p className="text-[10px] font-black text-forest-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> {t('finance.total_revenue')}
          </p>
          <p className="text-2xl md:text-4xl font-black text-forest-900 mt-2 tracking-tighter truncate">{formatCurrency(totalRevenue)}</p>
          <p className="text-[10px] md:text-xs font-bold text-forest-600/70 mt-2">Crop sales & other income</p>
        </div>
        <div className={`card p-4 md:p-6 border relative overflow-hidden group ${netIncome >= 0 ? 'bg-slate-900 border-slate-800' : 'bg-terracotta-900 border-terracotta-800'}`}>
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
            <Calculator className="w-32 h-32 text-white" />
          </div>
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2 flex items-center gap-2">
             <PieChart className="w-4 h-4 text-white/50" /> {t('finance.net_profit')}
          </p>
          <p className="text-2xl md:text-4xl font-black text-white mt-2 tracking-tighter truncate">
            {formatCurrency(netIncome)}
          </p>
          <p className="text-[10px] md:text-xs font-bold text-white/40 mt-2">Total farm profitability</p>
        </div>
      </div>

      <h2 className="text-xl font-black text-earth-900 uppercase tracking-tight italic mb-4">{t('finance.crop_balance_sheets')}</h2>
      <div className="space-y-4">
        {cycleFinancials.length === 0 ? (
           <div className="card p-12 text-center border-dashed border-2 bg-earth-50/50">
             <ShoppingCart className="w-16 h-16 text-earth-200 mx-auto mb-4" />
             <p className="text-earth-500 font-bold uppercase tracking-widest">No crop financial records yet.</p>
           </div>
        ) : (
          cycleFinancials.map(sheet => {
            const isExpanded = expandedCycleId === sheet.cycleId;
            return (
              <div key={sheet.cycleId} className={cn("card p-0 transition-all duration-300", isExpanded ? "border-earth-300 shadow-md ring-4 ring-earth-50" : "hover:border-earth-300")}>
                <div 
                  className="p-4 md:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8"
                  onClick={() => setExpandedCycleId(isExpanded ? null : sheet.cycleId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-earth-100 flex-shrink-0 flex items-center justify-center text-earth-600">
                      <Leaf className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-black text-earth-900 tracking-tight uppercase italic flex flex-wrap items-center gap-2">
                         <span className="truncate">{sheet.cropName}</span>
                         <span className="text-[9px] md:text-[10px] whitespace-nowrap font-bold text-earth-400 bg-earth-50 px-2 py-0.5 rounded-lg border border-earth-100 not-italic uppercase tracking-widest">{sheet.season}</span>
                      </h3>
                      <p className="text-[10px] md:text-[11px] font-bold text-earth-500 uppercase tracking-widest truncate">{sheet.farmName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-8 lg:gap-12 w-full md:w-auto mt-2 md:mt-0">
                     <div className="text-left md:text-right p-2 md:p-0 bg-earth-50 md:bg-transparent rounded-lg border md:border-transparent border-earth-100">
                        <p className="text-[9px] font-black text-earth-400 uppercase tracking-widest mb-1">{t('finance.revenue')}</p>
                        <p className="text-sm md:text-lg font-black text-forest-700 truncate">{formatCurrency(sheet.revenue)}</p>
                     </div>
                     <div className="text-left md:text-right p-2 md:p-0 bg-earth-50 md:bg-transparent rounded-lg border md:border-transparent border-earth-100">
                        <p className="text-[9px] font-black text-earth-400 uppercase tracking-widest mb-1">{t('finance.cost')}</p>
                        <p className="text-sm md:text-lg font-black text-terracotta-700 truncate">{formatCurrency(sheet.totalCost)}</p>
                     </div>
                     <div className="text-left md:text-right md:w-24 p-2 md:p-0 bg-earth-50 md:bg-transparent rounded-lg border md:border-transparent border-earth-100 relative">
                        <p className="text-[9px] font-black text-earth-400 uppercase tracking-widest mb-1">{t('finance.profit')}</p>
                        <p className={cn("text-sm md:text-lg font-black truncate", sheet.netProfit >= 0 ? "text-slate-900" : "text-terracotta-600")}>
                          {formatCurrency(sheet.netProfit)}
                        </p>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden text-earth-300">
                           {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                     </div>
                     <div className="hidden md:flex w-8 justify-center text-earth-300">
                       {isExpanded ? <ChevronDown /> : <ChevronRight />}
                     </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-earth-100 bg-earth-50/30 p-6 md:p-8">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                       {/* Expenses Chart */}
                       <div>
                         <h4 className="text-[10px] font-black text-earth-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <TrendingDown className="w-4 h-4 text-terracotta-500" />
                           Cost Breakdown
                         </h4>
                         <div className="space-y-3">
                           <CostRow label="Inputs (Raw Materials)" value={sheet.inputCost} total={sheet.totalCost} />
                           <CostRow label="Labor Wages" value={sheet.laborCost} total={sheet.totalCost} />
                           <CostRow label="Services / Equipment" value={sheet.serviceCost} total={sheet.totalCost} />
                           <div className="pt-3 border-t border-earth-200 flex justify-between items-center">
                             <span className="font-bold text-earth-900">Total Costs</span>
                             <span className="font-black text-terracotta-700">{formatCurrency(sheet.totalCost)}</span>
                           </div>
                         </div>
                       </div>
                       {/* Profitability Metric */}
                       <div>
                         <h4 className="text-[10px] font-black text-earth-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <TrendingUp className="w-4 h-4 text-forest-500" />
                           Profitability & ROI
                         </h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-earth-200">
                               <p className="text-[10px] font-bold text-earth-500 uppercase tracking-widest mb-1">Net Margin</p>
                               <p className={cn("text-2xl font-black", sheet.netProfit >= 0 ? "text-forest-600" : "text-terracotta-600")}>
                                 {sheet.revenue > 0 ? ((sheet.netProfit / sheet.revenue) * 100).toFixed(1) : 0}%
                               </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-earth-200">
                               <p className="text-[10px] font-bold text-earth-500 uppercase tracking-widest mb-1">ROI</p>
                               <p className={cn("text-2xl font-black", sheet.roi >= 0 ? "text-forest-600" : "text-terracotta-600")}>
                                 {sheet.roi.toFixed(1)}%
                               </p>
                            </div>
                         </div>
                         <p className="text-xs text-earth-500 font-medium mt-4">
                           {sheet.roi > 30 ? "Excellent return on invested capital! This crop is highly profitable." : 
                            sheet.roi > 0 ? "Positive return, but monitor costs closely to improve margins." : 
                            "Operating at a loss. Review input costs and market prices."}
                         </p>
                       </div>
                     </div>

                     {/* Transaction Ledger */}
                     <h4 className="text-[10px] font-black text-earth-800 uppercase tracking-widest mb-4">{t('finance.ledger')}</h4>
                     <div className="bg-white border border-earth-200 rounded-[20px] overflow-hidden">
                       {sheet.records.length === 0 ? (
                         <div className="p-4 text-center text-sm text-earth-500 font-medium">No transactions recorded.</div>
                       ) : (
                         <table className="w-full text-left text-sm">
                           <thead className="bg-earth-50/50 border-b border-earth-100 text-[10px] font-black text-earth-400 uppercase tracking-widest">
                             <tr>
                               <th className="p-4">Date</th>
                               <th className="p-4">Category</th>
                               <th className="p-4">Item</th>
                               <th className="p-4">Qty</th>
                               <th className="p-4 text-right">Amount</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-earth-100">
                             {sheet.records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                               <tr key={record.id} className="hover:bg-earth-50/50 transition-colors">
                                 <td className="p-4 font-bold text-earth-600 whitespace-nowrap">{record.date}</td>
                                 <td className="p-4 uppercase text-[9px] font-black tracking-widest text-earth-400">{record.category}</td>
                                 <td className="p-4 font-medium text-earth-900">{record.item}</td>
                                 <td className="p-4 font-bold text-earth-600">{record.quantity}</td>
                                 <td className={cn("p-4 text-right font-black", record.category === 'revenue' ? "text-forest-600" : "text-earth-900")}>
                                   {record.category === 'revenue' ? '+' : '-'}{formatCurrency(record.totalCost)}
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       )}
                     </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {isAddingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-earth-100 bg-earth-50 w-full">
               <h2 className="text-xl font-black text-earth-900 tracking-tight flex items-center gap-3 uppercase italic">
                 <Wallet className="w-6 h-6 text-terracotta-500" />
                 Log Transaction
               </h2>
               <button onClick={() => setIsAddingRecord(false)} className="bg-white p-2 rounded-xl shadow-sm text-earth-500 hover:text-earth-900 border border-earth-100 transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <form id="add-finance-form" onSubmit={handleAddRecord} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Type</label>
                     <select className="w-full border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-earth-50" value={newRecord.category} onChange={e => setNewRecord({...newRecord, category: e.target.value as any})}>
                       <option value="input">Input / Raw Material</option>
                       <option value="labor">Labor Wage</option>
                       <option value="service">Services / Equip</option>
                       <option value="revenue">Revenue (Sales)</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Date</label>
                     <input required type="date" className="w-full border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-earth-50" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
                   </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Crop Cycle</label>
                  <select required className="w-full border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-earth-50" value={newRecord.cropCycleId} onChange={e => setNewRecord({...newRecord, cropCycleId: e.target.value})}>
                    <option value="">Select Cycle...</option>
                    {currentFarmCycles.map(c => {
                      const farm = farms.find(f => f.id === c.farmId);
                      const crop = cropLibrary.find(cl => cl.id === c.cropId);
                      return <option key={c.id} value={c.id}>{crop?.name} ({c.season} at {farm?.name})</option>
                    })}
                  </select>
                </div>

                {newRecord.category === 'input' && (
                   <div>
                      <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                         <span>Raw Material (From Inventory)</span>
                         <span className="text-earth-400 font-bold">Optional</span>
                      </label>
                      <select 
                        className="w-full border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-earth-50" 
                        value={newRecord.inventoryItemId} 
                        onChange={e => {
                          const itemId = e.target.value;
                          const invItem = inventory.find(i => i.id === itemId);
                          setNewRecord({
                            ...newRecord, 
                            inventoryItemId: itemId,
                            item: invItem ? invItem.name : newRecord.item
                          })
                        }}
                      >
                        <option value="">-- Custom Item / Not in Inventory --</option>
                        {inventory.map(item => (
                           <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                             {item.name} ({item.quantity} {item.unit} available)
                           </option>
                        ))}
                      </select>
                      {newRecord.inventoryItemId && (
                         <p className="text-[10px] font-bold text-earth-500 mt-2 px-1">
                           * Logging this transaction will automatically deduct the quantity from your inventory.
                         </p>
                      )}
                   </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Description</label>
                  <input required type="text" className="w-full border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-earth-50" value={newRecord.item} onChange={e => setNewRecord({...newRecord, item: e.target.value})} placeholder="e.g. Tomato Seeds, Labor for weeding" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Quantity</label>
                    <input required type="number" min="1" className="w-full border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-earth-50" value={newRecord.quantity} onChange={e => setNewRecord({...newRecord, quantity: parseInt(e.target.value) || 1})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Unit Price / Wage (GMD)</label>
                    <input required type="number" step="0.01" className="w-full border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-earth-50" value={newRecord.unitCost} onChange={e => setNewRecord({...newRecord, unitCost: e.target.value})} placeholder="0.00" />
                  </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-[24px] mt-6 flex justify-between items-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Calculator className="w-16 h-16" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[10px] text-white/50 relative z-10">Total Required</span>
                  <span className="font-black text-3xl tracking-tighter relative z-10">{formatCurrency((parseFloat(newRecord.unitCost) || 0) * newRecord.quantity)}</span>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-earth-100 bg-earth-50 w-full flex justify-end gap-4 mt-auto">
              <button type="button" onClick={() => setIsAddingRecord(false)} className="px-6 py-3 text-[11px] uppercase tracking-widest text-earth-600 font-black hover:bg-earth-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" form="add-finance-form" className="px-8 py-3 bg-forest-600 text-[11px] uppercase tracking-widest text-white font-black hover:bg-forest-500 rounded-xl transition-colors active:scale-95 shadow-xl shadow-forest-900/20">Commit Ledger</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CostRow({ label, value, total }: { label: string, value: number, total: number }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-earth-700">{label}</span>
        <span className="text-sm font-black text-earth-900">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 w-full bg-earth-200 rounded-full overflow-hidden">
        <div className="h-full bg-terracotta-500 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}


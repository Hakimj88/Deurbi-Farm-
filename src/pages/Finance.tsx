import { useStore } from '../store';
import { Wallet, Plus, TrendingUp, TrendingDown, X, ChevronDown, ChevronRight, Calculator, PieChart, ShoppingCart, Leaf, Receipt, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { cropLibrary } from '../data/cropLibrary';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

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
    <div className="space-y-12 max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-earth-100">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-forest-50 text-forest-600 rounded-[1.25rem] shadow-sm border border-forest-100 italic">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-display font-black text-forest-600 uppercase tracking-[0.4em] italic">{t('finance.subtitle')}</p>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black text-earth-900 tracking-tighter leading-tight italic">
            Capital <br/>
            <span className="text-forest-600 italic">& Farm Economics</span>
          </h1>
        </div>
        
        <button 
          onClick={() => setIsAddingRecord(true)}
          className="group relative flex items-center justify-center gap-3 sm:gap-4 w-full md:w-auto bg-[#0A0A0A] text-white px-6 sm:px-10 py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] font-display font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-earth-900/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-forest-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="w-5 h-5 text-forest-400" />
          <span>New Transaction</span>
        </button>
      </header>

      {/* Global Financial Overview - Premium Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full min-h-max">
        {/* Main Profit Card */}
        <div className={cn(
          "md:col-span-6 lg:col-span-5 card p-6 sm:p-8 md:p-12 border transition-all duration-500 relative overflow-hidden group flex flex-col justify-between min-h-[280px] md:h-[340px]",
          netIncome >= 0 ? 'bg-[#0A0A0A] border-white/5 text-white shadow-3xl' : 'bg-terracotta-900 border-white/5 text-white shadow-3xl'
        )}>
          <div className="absolute -right-12 -top-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 mt-[15%] md:mt-0">
            <Calculator className="w-64 h-64 md:w-96 md:h-96" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/10", netIncome >= 0 ? "bg-forest-500/10 text-forest-400" : "bg-white/10 text-white")}>
                <PieChart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-display font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/40 italic">Consolidated Net Equity</p>
            </div>
            
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter italic leading-none truncate overflow-hidden text-ellipsis whitespace-nowrap" title={formatCurrency(netIncome)}>
              {formatCurrency(netIncome)}
            </h2>
          </div>

          <div className="relative z-10 pt-8 sm:pt-12 flex items-center justify-between border-t border-white/5 mt-auto gap-4">
            <div>
              <p className="text-[8px] sm:text-[9px] font-display font-black uppercase tracking-widest text-white/30 mb-2 leading-none italic">Status</p>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", netIncome >= 0 ? "bg-forest-500 shadow-lg shadow-forest-500/50" : "bg-amber-500")} />
                <p className="text-[10px] sm:text-xs font-display font-black uppercase italic tracking-widest opacity-80 whitespace-nowrap">
                  {netIncome >= 0 ? "Surplus Operating" : "Deficit Warning"}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[8px] sm:text-[9px] font-display font-black uppercase tracking-widest text-white/30 mb-2 leading-none italic">Efficiency</p>
              <p className="text-xl sm:text-2xl font-display font-black tracking-tighter italic text-white/90">
                {totalCost > 0 ? ((netIncome / totalCost) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Expenses & Revenue Split */}
        <div className="md:col-span-6 lg:col-span-7 grid md:grid-cols-2 flex-col gap-8 md:h-[340px]">
          <div className="card p-6 sm:p-8 md:p-10 bg-white border-earth-100 relative overflow-hidden group hover:border-terracotta-200 transition-all flex flex-col justify-between min-h-[220px]">
            <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
               <ArrowDownRight className="w-32 h-32 md:w-48 md:h-48 text-terracotta-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 sm:mb-6 font-display font-black italic">
                <div className="p-2 sm:p-2.5 bg-terracotta-50 text-terracotta-600 rounded-lg sm:rounded-xl border border-terracotta-100">
                   <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-[9px] sm:text-[10px] text-earth-300 uppercase tracking-[0.3em] font-bold">Operational Outflow</p>
              </div>
              <p className="text-4xl sm:text-5xl font-display font-black text-terracotta-900 tracking-tighter truncate italic overflow-hidden text-ellipsis whitespace-nowrap" title={formatCurrency(totalCost)}>{formatCurrency(totalCost)}</p>
            </div>

            <div className="relative z-10 space-y-3 sm:space-y-4 mt-auto pt-4 md:pt-0">
              <div className="flex justify-between items-end gap-4">
                 <p className="text-[8px] sm:text-[9px] font-display font-black uppercase text-earth-300 italic tracking-widest leading-none">Input Saturation</p>
                 <p className="text-[10px] sm:text-xs font-display font-black text-terracotta-600 italic leading-none">64%</p>
              </div>
              <div className="h-1 flex-1 w-full bg-earth-50 rounded-full overflow-hidden">
                <div className="h-full bg-terracotta-500 w-[64%]" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-medium text-earth-400 italic">Fertilizer, seed, and labor intensive cycles.</p>
            </div>
          </div>

          <div className="card p-6 sm:p-8 md:p-10 bg-white border-earth-100 relative overflow-hidden group hover:border-forest-200 transition-all flex flex-col justify-between min-h-[220px]">
             <div className="absolute right-0 top-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
               <ArrowUpRight className="w-32 h-32 md:w-48 md:h-48 text-forest-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 sm:mb-6 font-display font-black italic">
                <div className="p-2 sm:p-2.5 bg-forest-50 text-forest-600 rounded-lg sm:rounded-xl border border-forest-100">
                   <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-[9px] sm:text-[10px] text-earth-300 uppercase tracking-[0.3em] font-bold">Capital Inflow</p>
              </div>
              <p className="text-4xl sm:text-5xl font-display font-black text-forest-900 tracking-tighter truncate italic overflow-hidden text-ellipsis whitespace-nowrap" title={formatCurrency(totalRevenue)}>{formatCurrency(totalRevenue)}</p>
            </div>

            <div className="relative z-10 space-y-3 sm:space-y-4 mt-auto pt-4 md:pt-0">
               <div className="flex justify-between items-end gap-4">
                 <p className="text-[8px] sm:text-[9px] font-display font-black uppercase text-earth-300 italic tracking-widest leading-none">Market Realization</p>
                 <p className="text-[10px] sm:text-xs font-display font-black text-forest-600 italic leading-none">+12.4%</p>
              </div>
              <div className="h-1 flex-1 w-full bg-earth-50 rounded-full overflow-hidden">
                <div className="h-full bg-forest-600 w-[78%]" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-medium text-earth-400 italic">Mainly driven by off-season vegetable realization.</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-display font-black text-earth-900 uppercase tracking-tighter italic mt-20 mb-8 border-l-4 border-forest-600 pl-6">Sector Balance Sheets</h2>
      <div className="space-y-6">
        {cycleFinancials.length === 0 ? (
           <div className="card p-20 text-center border-dashed border-2 bg-earth-50/30 rounded-[3rem]">
             <ShoppingCart className="w-20 h-20 text-earth-200 mx-auto mb-6 opacity-40 shadow-sm" />
             <p className="text-earth-400 font-display font-black uppercase tracking-[0.4em] text-xs italic">No financial chronology detected.</p>
           </div>
        ) : (
          cycleFinancials.map((sheet, idx) => {
            const isExpanded = expandedCycleId === sheet.cycleId;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={sheet.cycleId} 
                className={cn(
                  "card p-0 transition-all duration-700 overflow-hidden group border-earth-100/50 hover:border-forest-200 shadow-xl",
                  isExpanded ? "ring-1 ring-forest-500/20 bg-earth-50/20" : "bg-white"
                )}
              >
                <div 
                  className="p-8 md:p-12 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8 group-hover:bg-earth-50/50 transition-colors"
                  onClick={() => setExpandedCycleId(isExpanded ? null : sheet.cycleId)}
                >
                  <div className="flex items-center gap-8">
                    <div className={cn(
                      "h-16 w-16 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center transition-all duration-500 shadow-sm border",
                      isExpanded ? "bg-forest-600 text-white border-forest-600 rotate-12" : "bg-earth-50 text-earth-400 border-earth-100 group-hover:bg-forest-50 group-hover:text-forest-600"
                    )}>
                      <Leaf className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-4 mb-2">
                        <h3 className="text-3xl font-display font-black text-earth-900 tracking-tighter uppercase italic truncate">
                           {sheet.cropName}
                        </h3>
                        <span className="text-[10px] font-display font-black text-forest-600 bg-forest-50 px-4 py-1.5 rounded-full border border-forest-100 uppercase tracking-widest leading-none shadow-sm">{sheet.season}</span>
                      </div>
                      <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] truncate">{sheet.farmName}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-12 md:gap-16">
                     <div className="text-right group/stat">
                        <p className="text-[9px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-2 leading-none group-hover/stat:text-forest-600 transition-colors italic border-r-2 border-earth-100 pr-4">Revenue Stream</p>
                        <p className="text-2xl font-display font-black text-forest-700 italic tracking-tighter">{formatCurrency(sheet.revenue)}</p>
                     </div>
                     <div className="text-right group/stat">
                        <p className="text-[9px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-2 leading-none group-hover/stat:text-terracotta-500 transition-colors italic border-r-2 border-earth-100 pr-4">Opex Outflow</p>
                        <p className="text-2xl font-display font-black text-terracotta-700 italic tracking-tighter">{formatCurrency(sheet.totalCost)}</p>
                     </div>
                     <div className="text-right group/stat min-w-[120px]">
                        <p className="text-[9px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-2 leading-none group-hover/stat:text-forest-600 transition-colors italic border-r-2 border-earth-100 pr-4">Net Balance</p>
                        <p className={cn("text-3xl font-display font-black italic tracking-tighter", sheet.netProfit >= 0 ? "text-slate-900" : "text-terracotta-600")}>
                          {formatCurrency(sheet.netProfit)}
                        </p>
                     </div>
                     <div className={cn("hidden md:flex h-10 w-10 items-center justify-center rounded-xl bg-earth-50 text-earth-300 transition-all duration-500", isExpanded && "rotate-180 bg-forest-600 text-white shadow-lg shadow-forest-900/20")}>
                       <ChevronDown className="w-5 h-5" />
                     </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="border-t border-earth-100 bg-earth-50/20 overflow-hidden"
                    >
                      <div className="p-10 md:p-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
                          {/* Expenses Hierarchy */}
                          <div className="space-y-10">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-terracotta-50 text-terracotta-600 rounded-xl">
                                <TrendingDown className="w-5 h-5" />
                              </div>
                              <h4 className="text-[11px] font-display font-black text-earth-900 uppercase tracking-[0.4em] italic">Expense Segmentation</h4>
                            </div>
                            <div className="space-y-8">
                              <CostRow label="Input Materials" value={sheet.inputCost} total={sheet.totalCost} type="input" />
                              <CostRow label="Human Capital / Labor" value={sheet.laborCost} total={sheet.totalCost} type="labor" />
                              <CostRow label="Technical Services" value={sheet.serviceCost} total={sheet.totalCost} type="service" />
                              <div className="pt-8 border-t border-earth-200 flex justify-between items-center group/total">
                                <span className="font-display font-black text-earth-300 uppercase tracking-widest text-[10px] italic">Total Operating Cost</span>
                                <span className="font-display font-black text-3xl text-terracotta-700 tracking-tighter italic group-hover/total:scale-105 transition-transform">{formatCurrency(sheet.totalCost)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Efficiency Metrics */}
                          <div className="space-y-10">
                             <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-forest-50 text-forest-600 rounded-xl">
                                <TrendingUp className="w-5 h-5" />
                              </div>
                              <h4 className="text-[11px] font-display font-black text-earth-900 uppercase tracking-[0.4em] italic">ROI Analysis</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-8 h-full">
                               <div className="bg-white p-10 rounded-[2.5rem] border border-earth-100 shadow-sm group/metric">
                                  <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest mb-4 group-hover/metric:text-forest-600 transition-colors italic">Net Margin</p>
                                  <div className="flex items-baseline gap-2">
                                    <p className={cn("text-6xl font-display font-black italic tracking-tighter leading-none", sheet.netProfit >= 0 ? "text-forest-600" : "text-terracotta-600")}>
                                      {sheet.revenue > 0 ? ((sheet.netProfit / sheet.revenue) * 100).toFixed(0) : 0}
                                    </p>
                                    <span className="text-xl font-display font-black opacity-20">%</span>
                                  </div>
                               </div>
                               <div className="bg-white p-10 rounded-[2.5rem] border border-earth-100 shadow-sm group/metric">
                                  <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest mb-4 group-hover/metric:text-forest-600 transition-colors italic">ROI Efficiency</p>
                                  <div className="flex items-baseline gap-2">
                                    <p className={cn("text-6xl font-display font-black italic tracking-tighter leading-none", sheet.roi >= 0 ? "text-forest-600" : "text-terracotta-600")}>
                                      {sheet.roi.toFixed(0)}
                                    </p>
                                    <span className="text-xl font-display font-black opacity-20">%</span>
                                  </div>
                               </div>
                            </div>
                            <div className="p-8 bg-white border border-earth-100 rounded-[2rem] flex items-center gap-6 relative overflow-hidden group/advice">
                              <div className="absolute inset-0 bg-forest-600 opacity-0 group-hover/advice:opacity-5 transition-opacity duration-700"></div>
                              <Calculator className="w-10 h-10 text-earth-200 flex-shrink-0 group-hover/advice:scale-110 group-hover/advice:text-forest-400 transition-all duration-500" />
                              <p className="text-sm text-earth-500 font-medium italic italic leading-relaxed">
                                {sheet.roi > 30 ? "Premier tier performance. This cycle is demonstrating exceptional capital utilization." : 
                                 sheet.roi > 0 ? "Standard performance matrix. Monitor input-to-yield conversion rates." : 
                                 "Critical deficit. Reassess agronomic protocols and market timing."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Professional Ledger */}
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                              <Receipt className="w-5 h-5" />
                            </div>
                            <h4 className="text-[11px] font-display font-black text-earth-900 uppercase tracking-[0.4em] italic">Transaction Chronology</h4>
                          </div>
                          
                          <div className="bg-white border border-earth-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                            {sheet.records.length === 0 ? (
                              <div className="p-12 text-center text-sm text-earth-400 font-medium italic">No financial artifacts detected for this cycle.</div>
                            ) : (
                              <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-earth-50/50 border-b border-earth-100">
                                  <tr>
                                    <th className="p-8 text-[9px] font-display font-black text-earth-300 uppercase tracking-[0.3em] italic">Date</th>
                                    <th className="p-8 text-[9px] font-display font-black text-earth-300 uppercase tracking-[0.3em] italic">Category</th>
                                    <th className="p-8 text-[9px] font-display font-black text-earth-300 uppercase tracking-[0.3em] italic">Itemization</th>
                                    <th className="p-8 text-[9px] font-display font-black text-earth-300 uppercase tracking-[0.3em] italic">Quantity</th>
                                    <th className="p-8 text-[9px] font-display font-black text-earth-300 uppercase tracking-[0.3em] italic text-right">Liquidity</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-earth-50">
                                  {sheet.records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                                    <tr key={record.id} className="hover:bg-earth-50/30 transition-colors group/tr">
                                      <td className="p-8 font-display font-black text-earth-400 text-xs tracking-widest">{record.date}</td>
                                      <td className="p-8">
                                         <span className={cn(
                                           "px-4 py-1.5 rounded-full text-[9px] font-display font-black uppercase tracking-widest border",
                                           record.category === 'revenue' ? "bg-forest-50/50 text-forest-700 border-forest-100" :
                                           record.category === 'input' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                           record.category === 'labor' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-earth-50 text-earth-600 border-earth-100"
                                         )}>{record.category}</span>
                                      </td>
                                      <td className="p-8 font-display font-bold text-earth-900 text-base italic tracking-tight">{record.item}</td>
                                      <td className="p-8 font-display font-black text-earth-400 text-sm tracking-tighter">{record.quantity}</td>
                                      <td className={cn("p-8 text-right font-display font-black text-xl tracking-tighter italic", record.category === 'revenue' ? "text-forest-600" : "text-earth-900")}>
                                        <div className="flex items-center justify-end gap-2 group-hover/tr:scale-105 transition-transform">
                                          <span className="opacity-20 text-sm">{record.category === 'revenue' ? '+' : '—'}</span>
                                          {formatCurrency(record.totalCost)}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {isAddingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingRecord(false)}
              className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-xl" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden flex flex-col relative z-10 max-h-[90vh] border border-white/10"
            >
              <div className="flex justify-between items-center p-10 md:p-12 bg-earth-50/50 border-b border-earth-100">
                 <div>
                   <p className="text-[10px] font-display font-black text-forest-600 uppercase tracking-[0.4em] mb-2 italic">Finance Portal</p>
                   <h2 className="text-4xl font-display font-black text-earth-900 tracking-tighter uppercase italic flex items-center gap-4">
                     <CreditCard className="w-8 h-8 text-forest-600" />
                     Initialize Entry
                   </h2>
                 </div>
                 <button 
                   onClick={() => setIsAddingRecord(false)} 
                   className="p-4 bg-white rounded-2xl shadow-sm text-earth-400 hover:text-earth-900 border border-earth-100 transition-all hover:rotate-90"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-10 md:p-12 overflow-y-auto custom-scrollbar">
                <form id="add-finance-form" onSubmit={handleAddRecord} className="space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-3">
                       <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Classification</label>
                       <select 
                         className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 outline-none transition-all appearance-none italic" 
                         value={newRecord.category} 
                         onChange={e => setNewRecord({...newRecord, category: e.target.value as any})}
                       >
                         <option value="input">Resource Input</option>
                         <option value="labor">Human Capital</option>
                         <option value="service">Technical Service</option>
                         <option value="revenue">Capital Revenue</option>
                       </select>
                     </div>
                     <div className="space-y-3">
                       <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Timestamp</label>
                       <input 
                         required 
                         type="date" 
                         className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 outline-none transition-all" 
                         value={newRecord.date} 
                         onChange={e => setNewRecord({...newRecord, date: e.target.value})} 
                       />
                     </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Crop Cycle Association</label>
                    <select 
                      required 
                      className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 outline-none transition-all appearance-none italic" 
                      value={newRecord.cropCycleId} 
                      onChange={e => setNewRecord({...newRecord, cropCycleId: e.target.value})}
                    >
                      <option value="">Select Allocation Target...</option>
                      {currentFarmCycles.map(c => {
                        const farm = farms.find(f => f.id === c.farmId);
                        const crop = cropLibrary.find(cl => cl.id === c.cropId);
                        return <option key={c.id} value={c.id}>{crop?.name} — {c.season} ({farm?.name})</option>
                      })}
                    </select>
                  </div>

                  {newRecord.category === 'input' && (
                     <div className="p-8 bg-forest-50/30 rounded-[2rem] border border-forest-100 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                           <ShoppingCart className="w-5 h-5 text-forest-600" />
                           <p className="text-[10px] font-display font-black text-forest-600 uppercase tracking-widest italic">Inventory Reconciliation</p>
                        </div>
                        <select 
                          className="w-full bg-white border border-forest-100 rounded-2xl p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all" 
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
                          <option value="">-- Manual/Custom Entry --</option>
                          {inventory.map(item => (
                             <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                               {item.name} ({item.quantity} {item.unit} in-stock)
                             </option>
                          ))}
                        </select>
                     </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Liner Item Description</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 outline-none transition-all italic placeholder:text-earth-200" 
                      value={newRecord.item} 
                      onChange={e => setNewRecord({...newRecord, item: e.target.value})} 
                      placeholder="Enter detailed description..." 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-1 space-y-3">
                      <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Qty</label>
                      <input 
                        required 
                        type="number" 
                        min="1" 
                        className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-black text-earth-900 text-center text-xl outline-none" 
                        value={newRecord.quantity} 
                        onChange={e => setNewRecord({...newRecord, quantity: parseInt(e.target.value) || 1})} 
                      />
                    </div>
                    <div className="col-span-2 space-y-3">
                      <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Unit Value (GMD)</label>
                      <input 
                        required 
                        type="number" 
                        step="0.01" 
                        className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-black text-earth-900 text-2xl tracking-tighter outline-none italic placeholder:text-earth-200" 
                        value={newRecord.unitCost} 
                        onChange={e => setNewRecord({...newRecord, unitCost: e.target.value})} 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] p-10 rounded-[2.5rem] flex justify-between items-center text-white relative overflow-hidden group/total shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/total:scale-125 transition-transform duration-1000">
                      <Calculator className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                       <span className="font-display font-black uppercase tracking-[0.4em] text-[10px] text-white/40 mb-2 block italic">Transaction Total</span>
                       <span className="font-display font-black text-5xl tracking-tighter italic">{formatCurrency((parseFloat(newRecord.unitCost) || 0) * newRecord.quantity)}</span>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-10 md:p-12 border-t border-earth-100 bg-earth-50/50 w-full flex items-center justify-end gap-8">
                <button 
                  type="button" 
                  onClick={() => setIsAddingRecord(false)} 
                  className="px-8 py-4 text-[10px] font-display font-black uppercase tracking-[0.3em] text-earth-400 hover:text-earth-900 transition-colors italic"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  form="add-finance-form" 
                  className="px-12 py-5 bg-forest-600 text-[11px] font-display font-black uppercase tracking-[0.3em] text-white rounded-2xl hover:bg-forest-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-forest-900/20 italic"
                >
                  Execute Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CostRow({ label, value, total, type }: { label: string, value: number, total: number, type: 'input' | 'labor' | 'service' }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="group/row">
      <div className="flex justify-between items-end mb-3">
        <span className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic group-hover/row:text-earth-900 transition-colors">{label}</span>
        <span className="text-lg font-display font-black text-earth-900 tracking-tighter italic">{formatCurrency(value)} <span className="text-[10px] opacity-20 ml-1">({percentage.toFixed(0)}%)</span></span>
      </div>
      <div className="h-1.5 w-full bg-earth-50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full transition-all duration-500",
            type === 'input' ? "bg-amber-400" :
            type === 'labor' ? "bg-blue-500" : "bg-forest-500"
          )}
        />
      </div>
    </div>
  )
}


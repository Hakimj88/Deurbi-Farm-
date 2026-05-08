import { useStore } from '../store';
import { Package, Plus, AlertTriangle, Search, Filter, Trash2, Edit3, X, Clock } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export function Inventory() {
  const { t } = useTranslation();
  const { inventory, addInventoryItem, updateInventoryQuantity, removeInventoryItem } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'seeds' as const,
    quantity: 0,
    unit: 'bags',
    unitPrice: 0,
    subUnit: '',
    subUnitsPerPackage: 0,
    minThreshold: 0
  });

  const categories = ['seeds', 'fertilizer', 'pesticide', 'tools', 'other'];

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, categoryFilter]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name && newItem.quantity >= 0) {
      addInventoryItem({
        id: `inv_${Date.now()}`,
        ...newItem,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
      setIsAddingItem(false);
      setNewItem({ name: '', category: 'seeds', quantity: 0, unit: 'bags', unitPrice: 0, subUnit: '', subUnitsPerPackage: 0, minThreshold: 0 });
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      const newQty = Math.max(0, item.quantity + delta);
      updateInventoryQuantity(id, newQty);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-earth-100">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-forest-50 text-forest-600 rounded-[1.25rem] shadow-sm border border-forest-100">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-display font-black text-forest-600 uppercase tracking-[0.3em]">Resource Logistics</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-earth-900 tracking-tighter leading-tight italic">
            Inventory <br/>
            <span className="text-terracotta-600 italic">& Supply Ledger</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsAddingItem(true)}
          className="btn-primary flex items-center gap-3 px-10 py-5 shadow-2xl shadow-forest-200/50 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:scale-125" />
          {t('inventory.add_item')}
        </button>
      </header>

      {/* Stats Summary - Refined Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-8 bg-white border-earth-100 shadow-soft group hover:shadow-elevated transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-forest-50 text-forest-600 rounded-lg">
               <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-display font-black text-forest-600 uppercase tracking-widest bg-forest-50 px-2 py-1 rounded">Total Stock</span>
          </div>
          <p className="text-4xl font-display font-black text-earth-900 italic tracking-tighter">{inventory.length}</p>
          <p className="text-[10px] font-medium text-earth-400 mt-2">Active catalog entries</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-8 bg-white border-earth-100 shadow-soft group hover:shadow-elevated transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-display font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">Depletion Alert</span>
          </div>
          <p className="text-4xl font-display font-black text-earth-900 italic tracking-tighter">{inventory.filter(i => i.quantity <= i.minThreshold).length}</p>
          <p className="text-[10px] font-medium text-earth-400 mt-2">Critical threshold reach</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-8 bg-white border-earth-100 shadow-soft group hover:shadow-elevated transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-display font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Genetic Bank</span>
          </div>
          <p className="text-4xl font-display font-black text-earth-900 italic tracking-tighter">{inventory.filter(i => i.category === 'seeds').length}</p>
          <p className="text-[10px] font-medium text-earth-400 mt-2">Unique seed varieties</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-8 bg-white border-earth-100 shadow-soft group hover:shadow-elevated transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-terracotta-50 text-terracotta-600 rounded-lg">
               <Edit3 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-display font-black text-terracotta-600 uppercase tracking-widest bg-terracotta-50 px-2 py-1 rounded">Hardware Asset</span>
          </div>
          <p className="text-4xl font-display font-black text-earth-900 italic tracking-tighter">{inventory.filter(i => i.category === 'tools').length}</p>
          <p className="text-[10px] font-medium text-earth-400 mt-2">Mechanical & manual tools</p>
        </motion.div>
      </div>

      <div className="card overflow-hidden shadow-elevated border-earth-200">
        <div className="p-10 bg-earth-50/50 border-b border-earth-100 flex flex-col md:flex-row gap-8">
           <div className="flex-1 relative group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
             <input 
               type="text" 
               placeholder="Search supply chain..." 
               className="w-full pl-14 pr-6 py-4 rounded-2xl border border-earth-200 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 font-bold bg-white transition-all shadow-inner"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-4">
             <div className="p-4 bg-white border border-earth-200 rounded-2xl flex items-center gap-4 pr-6 shadow-sm">
               <Filter className="w-4 h-4 text-earth-400" />
               <select 
                 className="focus:outline-none font-display font-bold text-earth-700 bg-transparent cursor-pointer appearance-none uppercase text-[10px] tracking-widest min-w-[120px]"
                 value={categoryFilter}
                 onChange={e => setCategoryFilter(e.target.value)}
               >
                 <option value="all">Catalog All</option>
                 {categories.map(c => (
                   <option key={c} value={c} className="capitalize">{c}</option>
                 ))}
               </select>
             </div>
           </div>
        </div>

        <div className="divide-y divide-earth-100">
          {filteredInventory.length === 0 ? (
            <div className="p-32 text-center bg-white">
              <div className="w-24 h-24 bg-earth-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-earth-100 shadow-inner">
                <Package className="w-10 h-10 text-earth-200" />
              </div>
              <h3 className="text-2xl font-display font-bold text-earth-900 mb-2">No results found</h3>
              <p className="text-earth-400 font-medium">Verify your search parameter or filter criteria.</p>
            </div>
          ) : (
            filteredInventory.map((item, idx) => {
              const isLow = item.quantity <= item.minThreshold;
              return (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id} 
                  className="p-10 hover:bg-earth-50/50 transition-all duration-300 group bg-white"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                    <div className="flex items-center gap-8">
                       <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 relative overflow-hidden ${
                         item.category === 'seeds' ? 'bg-forest-50 border-forest-100 text-forest-600' :
                         item.category === 'fertilizer' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                         item.category === 'pesticide' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                         'bg-earth-50 border-earth-100 text-earth-600'
                       }`}>
                         <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <Package className="w-10 h-10 relative z-10" />
                       </div>
                       <div>
                         <div className="flex flex-wrap items-center gap-4 mb-2">
                           <h3 className="text-2xl font-display font-bold text-earth-900 tracking-tight italic group-hover:text-forest-600 transition-colors uppercase">{item.name}</h3>
                           <span className={cn(
                             "px-3 py-1 rounded-xl text-[9px] font-display font-black uppercase tracking-[0.2em] border shadow-sm",
                             item.category === 'seeds' ? 'bg-forest-600 text-white border-forest-500' :
                             item.category === 'fertilizer' ? 'bg-blue-600 text-white border-blue-500' :
                             item.category === 'pesticide' ? 'bg-amber-500 text-black border-amber-400' :
                             'bg-earth-100 text-earth-700 border-earth-200'
                           )}>{item.category}</span>
                         </div>
                         <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] flex items-center gap-2">
                           <Clock className="w-3 h-3" /> REGISTERED {item.lastUpdated}
                         </p>
                       </div>
                    </div>

                     <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end">
                       <div className="text-right">
                          <div className="flex items-center gap-3 justify-end mb-2">
                             <p className={cn(
                               "text-4xl font-display font-black tracking-tighter italic",
                               isLow ? 'text-amber-500' : 'text-earth-900'
                             )}>
                               {item.quantity}
                             </p>
                             <span className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest mb-1">{item.unit}</span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-[0.2em] bg-earth-50 px-2 py-0.5 rounded border border-earth-100">
                              Valuation: {item.unitPrice} <span className="text-earth-300">/</span> {item.unit}
                            </p>
                            {isLow && (
                              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 shadow-sm">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-display font-black uppercase tracking-widest leading-none">Resource Critical</span>
                              </motion.div>
                            )}
                          </div>
                       </div>

                       <div className="flex items-center gap-4">
                         <div className="flex bg-white border border-earth-200 rounded-2xl p-1 shadow-sm overflow-hidden group/controls">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="w-12 h-12 flex items-center justify-center text-earth-400 hover:bg-earth-50 hover:text-earth-900 transition-all font-black text-xl active:scale-90"
                            >-</button>
                            <div className="w-px bg-earth-100 my-2"></div>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="w-12 h-12 flex items-center justify-center text-earth-400 hover:bg-forest-50 hover:text-forest-600 transition-all font-black text-xl active:scale-90"
                            >+</button>
                         </div>
                         
                         <button 
                           onClick={() => removeInventoryItem(item.id)}
                           className="p-4 text-earth-200 hover:text-terracotta-600 transition-all hover:bg-terracotta-50 rounded-2xl group/del"
                           title="Purge Entry"
                         >
                           <Trash2 className="w-6 h-6 group-hover/del:scale-110" />
                         </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Item Modal - Refined Premium Design */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-earth-100"
          >
            <div className="p-8 bg-earth-50/50 border-b border-earth-100 flex justify-between items-center text-earth-900">
               <div>
                  <h2 className="text-3xl font-display font-black italic tracking-tighter leading-none">Register Stock Entry</h2>
                  <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest mt-2">Initialize supply chain tracking</p>
               </div>
               <button onClick={() => setIsAddingItem(false)} className="p-4 bg-white border border-earth-100 rounded-2xl text-earth-300 hover:text-earth-900 transition-all hover:scale-110 shadow-sm shadow-earth-900/5">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <form onSubmit={handleAddItem} className="p-10 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
               <div className="space-y-4">
                 <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Biological or Technical Designation</label>
                 <input 
                   required
                   type="text" 
                   value={newItem.name}
                   onChange={e => setNewItem({...newItem, name: e.target.value})}
                   className="w-full bg-earth-50 border border-earth-200 rounded-[1.5rem] p-6 font-display font-bold text-earth-900 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all shadow-inner text-xl"
                   placeholder="e.g. Hybrid Maize S-40"
                 />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                   <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Resource Taxonomy</label>
                   <select 
                     value={newItem.category}
                     onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                     className="w-full bg-earth-50 border border-earth-200 rounded-[1.5rem] p-6 font-display font-bold text-earth-900 appearance-none focus:outline-none"
                   >
                     {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                   </select>
                 </div>
                 <div className="space-y-4">
                   <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Initial Inventory Batch</label>
                   <input 
                     required
                     type="number" 
                     value={newItem.quantity}
                     onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                     className="w-full bg-earth-50 border border-earth-200 rounded-[1.5rem] p-6 font-display font-bold text-earth-900 text-center text-2xl italic tracking-tighter"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                   <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Logistic Package Unit</label>
                   <input 
                     required
                     type="text" 
                     value={newItem.unit}
                     onChange={e => setNewItem({...newItem, unit: e.target.value})}
                     className="w-full bg-earth-50 border border-earth-200 rounded-[1.5rem] p-6 font-display font-bold text-earth-900"
                     placeholder="e.g. 50kg Sack"
                   />
                 </div>
                 <div className="space-y-4">
                   <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Economic Valuation (Per Unit)</label>
                   <input 
                     required
                     type="number" 
                     step="0.01"
                     value={newItem.unitPrice}
                     onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})}
                     className="w-full bg-earth-50 border border-earth-200 rounded-[1.5rem] p-6 font-display font-bold text-earth-900 text-center text-2xl italic tracking-tighter"
                     placeholder="0.00"
                   />
                 </div>
               </div>

               <div className="bg-[#0A0A0A] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform pointer-events-none italic font-display font-black text-5xl text-white">RATIO</div>
                  <p className="text-[10px] font-display font-black text-amber-500 uppercase tracking-[0.3em] mb-6">Fractional Utilization Parameters</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-3">
                      <label className="block text-[9px] font-display font-black text-white/30 uppercase tracking-widest">Sub-Unit Metric</label>
                      <input 
                        type="text" 
                        value={newItem.subUnit}
                        onChange={e => setNewItem({...newItem, subUnit: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="e.g. Grams"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[9px] font-display font-black text-white/30 uppercase tracking-widest">Base Ratio (Total / Pkg)</label>
                      <input 
                        type="number" 
                        value={newItem.subUnitsPerPackage}
                        onChange={e => setNewItem({...newItem, subUnitsPerPackage: parseInt(e.target.value) || 0})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                  {newItem.subUnit && newItem.subUnitsPerPackage > 0 && (
                    <div className="mt-8 flex items-center gap-3">
                       <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                       <p className="text-[11px] font-display font-black text-white/60 uppercase tracking-widest italic">
                         Calculated: 1 {newItem.subUnit} = {(newItem.unitPrice / newItem.subUnitsPerPackage).toFixed(4)} <span className="text-amber-500">GMD</span>
                       </p>
                    </div>
                  )}
               </div>

               <div className="space-y-4">
                 <label className="block text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">Analytical Depletion Alert</label>
                 <input 
                   required
                   type="number" 
                   value={newItem.minThreshold}
                   onChange={e => setNewItem({...newItem, minThreshold: parseInt(e.target.value) || 0})}
                   className="w-full bg-earth-50 border border-earth-200 rounded-[1.5rem] p-6 font-display font-bold text-earth-900 shadow-inner"
                 />
                 <p className="text-[10px] text-earth-400 italic">System will trigger notifications when stock level reaches this value.</p>
               </div>
               
               <div className="pt-6 flex gap-6">
                  <button type="button" onClick={() => setIsAddingItem(false)} className="px-8 py-5 text-earth-400 font-display font-black uppercase tracking-widest text-xs">Abandom</button>
                  <button 
                    type="submit"
                    className="flex-1 bg-forest-600 hover:bg-forest-500 text-white font-display font-black py-5 rounded-[2rem] shadow-2xl shadow-forest-900/20 transition-all active:scale-95 uppercase tracking-[0.3em] flex items-center justify-center gap-4"
                  >
                    Commit Entry 
                  </button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

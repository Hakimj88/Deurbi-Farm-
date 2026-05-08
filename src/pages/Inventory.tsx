import { useStore } from '../store';
import { Package, Plus, AlertTriangle, Search, Filter, Trash2, Edit3, X } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export function Inventory() {
  const { t } = useTranslation();
  const { inventory, addInventoryItem, updateInventoryQuantity, removeInventoryItem } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

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
      setNewItem({ name: '', category: 'seeds', quantity: 0, unit: 'kg', unitPrice: 0, minThreshold: 0 });
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-earth-900 tracking-tight flex items-center gap-3 italic">
            <Package className="w-10 h-10 text-forest-600 animate-bounce-slow" />
            {t('inventory.title')}
          </h1>
          <p className="text-earth-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1 ml-13">{t('inventory.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAddingItem(true)}
          className="group relative flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-earth-900/20"
        >
          <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="w-5 h-5" />
          {t('inventory.add_item')}
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6 bg-forest-50 border-forest-100">
          <p className="text-[10px] font-black text-forest-500 uppercase tracking-widest mb-1">Total Items</p>
          <p className="text-3xl font-black text-earth-900">{inventory.length}</p>
        </div>
        <div className="card p-6 bg-amber-50 border-amber-100">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Low Stock Alerts</p>
          <p className="text-3xl font-black text-earth-900">{inventory.filter(i => i.quantity <= i.minThreshold).length}</p>
        </div>
        <div className="card p-6 bg-blue-50 border-blue-100">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Seeds Types</p>
            <p className="text-3xl font-black text-earth-900">{inventory.filter(i => i.category === 'seeds').length}</p>
        </div>
        <div className="card p-6 bg-terracotta-50 border-terracotta-100">
            <p className="text-[10px] font-black text-terracotta-600 uppercase tracking-widest mb-1">Tools & Equipment</p>
            <p className="text-3xl font-black text-earth-900">{inventory.filter(i => i.category === 'tools').length}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 bg-earth-50 border-b border-earth-100 flex flex-col md:flex-row gap-4">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
             <input 
               type="text" 
               placeholder="Search inventory..." 
               className="w-full pl-10 pr-4 py-2 rounded-xl border border-earth-200 focus:ring-forest-500 focus:border-forest-500 font-medium"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-2">
             <Filter className="w-4 h-4 text-earth-400" />
             <select 
               className="rounded-xl border border-earth-200 py-2 px-4 font-medium text-earth-700 bg-white focus:ring-forest-500"
               value={categoryFilter}
               onChange={e => setCategoryFilter(e.target.value)}
             >
               <option value="all">All Categories</option>
               {categories.map(c => (
                 <option key={c} value={c} className="capitalize">{c}</option>
               ))}
             </select>
           </div>
        </div>

        <div className="divide-y divide-earth-100">
          {filteredInventory.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-earth-200 mx-auto mb-4" />
              <p className="text-earth-500 font-bold uppercase tracking-widest">No matching items found</p>
            </div>
          ) : (
            filteredInventory.map(item => {
              const isLow = item.quantity <= item.minThreshold;
              return (
                <div key={item.id} className="p-6 hover:bg-earth-50/50 transition-colors group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 ${
                         item.category === 'seeds' ? 'bg-forest-100 border-forest-200 text-forest-600' :
                         item.category === 'fertilizer' ? 'bg-blue-100 border-blue-200 text-blue-600' :
                         item.category === 'pesticide' ? 'bg-amber-100 border-amber-200 text-amber-600' :
                         'bg-earth-100 border-earth-200 text-earth-600'
                       }`}>
                         <Package className="w-7 h-7" />
                       </div>
                       <div>
                         <div className="flex items-center gap-3">
                           <h3 className="text-lg font-black text-earth-900 tracking-tight uppercase italic">{item.name}</h3>
                           <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                             item.category === 'seeds' ? 'bg-forest-50 text-forest-700 border-forest-100' :
                             item.category === 'fertilizer' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                             item.category === 'pesticide' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                             'bg-earth-50 text-earth-700 border-earth-100'
                           }`}>{item.category}</span>
                         </div>
                         <p className="text-[10px] font-bold text-earth-400 mt-1 uppercase tracking-widest">Last Updated: {item.lastUpdated}</p>
                       </div>
                    </div>

                     <div className="flex items-center gap-8 w-full md:w-auto justify-between">
                       <div className="text-right">
                         <div className="flex items-center gap-2 justify-end mb-1">
                            <p className={`text-2xl font-black tracking-tight ${isLow ? 'text-amber-600' : 'text-earth-900'}`}>
                              {item.quantity}
                            </p>
                            <span className="text-xs font-bold text-earth-400 mb-1">{item.unit}</span>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                           <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest">
                             {item.unitPrice} / {item.unit}
                           </p>
                           {isLow && (
                             <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 justify-end">
                               <AlertTriangle className="w-3 h-3" />
                               <span className="text-[9px] font-black uppercase tracking-widest">{t('inventory.restock_soon')}</span>
                             </div>
                           )}
                         </div>
                       </div>

                       <div className="flex items-center gap-2">
                         <button 
                           onClick={() => handleUpdateQuantity(item.id, -1)}
                           className="w-10 h-10 flex items-center justify-center rounded-xl bg-earth-50 border border-earth-200 text-earth-600 hover:bg-earth-100 transition-colors font-black text-lg"
                         >-</button>
                         <button 
                           onClick={() => handleUpdateQuantity(item.id, 1)}
                           className="w-10 h-10 flex items-center justify-center rounded-xl bg-forest-50 border border-forest-100 text-forest-600 hover:bg-forest-100 transition-colors font-black text-lg"
                         >+</button>
                         <button 
                           onClick={() => removeInventoryItem(item.id)}
                           className="ml-4 p-2 text-earth-300 hover:text-terracotta-600 transition-colors opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 bg-earth-50 border-b border-earth-100 flex justify-between items-center text-earth-900">
               <h2 className="text-xl font-black italic tracking-tight uppercase">New Stock Item</h2>
               <button onClick={() => setIsAddingItem(false)} className="p-2 hover:bg-earth-100 rounded-xl transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <form onSubmit={handleAddItem} className="p-8 space-y-5">
               <div>
                 <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Item Name</label>
                 <input 
                   required
                   type="text" 
                   value={newItem.name}
                   onChange={e => setNewItem({...newItem, name: e.target.value})}
                   className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 focus:ring-2 focus:ring-forest-500 transition-all"
                   placeholder="e.g. Urea Fertilizer, Hybrid Maize Seeds"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Category</label>
                   <select 
                     value={newItem.category}
                     onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                     className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900 capitalize"
                   >
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Initial Quantity</label>
                   <input 
                     required
                     type="number" 
                     value={newItem.quantity}
                     onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                     className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                   />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Package Unit (e.g. Bag)</label>
                   <input 
                     required
                     type="text" 
                     value={newItem.unit}
                     onChange={e => setNewItem({...newItem, unit: e.target.value})}
                     className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                     placeholder="bags, liters..."
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Price Per Package</label>
                   <input 
                     required
                     type="number" 
                     step="0.01"
                     value={newItem.unitPrice}
                     onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})}
                     className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                     placeholder="0.00"
                   />
                 </div>
               </div>

               <div className="bg-earth-50/50 p-4 rounded-2xl border border-dashed border-earth-200">
                 <p className="text-[9px] font-black text-earth-400 uppercase tracking-widest mb-3">Usage Conversion (Optional)</p>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Sub-Unit (e.g. Grams)</label>
                     <input 
                       type="text" 
                       value={newItem.subUnit}
                       onChange={e => setNewItem({...newItem, subUnit: e.target.value})}
                       className="w-full bg-white border border-earth-200 rounded-xl p-3 text-sm font-bold text-earth-900"
                       placeholder="grams, ml..."
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Units Per Pkg</label>
                     <input 
                       type="number" 
                       value={newItem.subUnitsPerPackage}
                       onChange={e => setNewItem({...newItem, subUnitsPerPackage: parseInt(e.target.value) || 0})}
                       className="w-full bg-white border border-earth-200 rounded-xl p-3 text-sm font-bold text-earth-900"
                       placeholder="e.g. 50000"
                     />
                   </div>
                 </div>
                 {newItem.subUnit && newItem.subUnitsPerPackage > 0 && (
                   <p className="text-[10px] font-bold text-forest-600 mt-2">
                     1 {newItem.subUnit} = {(newItem.unitPrice / newItem.subUnitsPerPackage).toFixed(4)} GMD
                   </p>
                 )}
               </div>

               <div>
                 <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2">Min. Threshold (Packages)</label>
                 <input 
                   required
                   type="number" 
                   value={newItem.minThreshold}
                   onChange={e => setNewItem({...newItem, minThreshold: parseInt(e.target.value) || 0})}
                   className="w-full bg-earth-50 border border-earth-200 rounded-2xl p-4 font-bold text-earth-900"
                 />
               </div>
               <button 
                 type="submit"
                 className="w-full mt-4 bg-forest-600 hover:bg-forest-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-forest-900/20 transition-all active:scale-95 uppercase tracking-widest"
               >
                 Register Item
               </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

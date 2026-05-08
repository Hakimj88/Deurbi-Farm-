import { BookOpen, Sprout, FlaskConical, Bug, Bookmark, Sun } from 'lucide-react';
import { cropLibrary } from '../data/cropLibrary';
import { botanicalsLibrary } from '../data/botanicalsLibrary';
import { useSearchParams } from 'react-router-dom';
import { AgronomyPlaybook } from '../data/agronomyPlaybook';
import { GreenhouseGuide } from '../data/greenhouseGuide';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function CropLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'crops';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-earth-100">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-forest-50 text-forest-600 rounded-[1.25rem] shadow-sm border border-forest-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-display font-black text-forest-600 uppercase tracking-[0.3em]">Knowledge Base v4.2</p>
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-black text-earth-900 tracking-tighter leading-tight italic">
            Agronomy <br/>
            <span className="text-forest-600 italic">Library & Playbook</span>
          </h1>
          <p className="text-earth-400 font-medium text-xl mt-6 max-w-2xl italic">West African specific database for crops, botanical remedies, and technical agronomy protocols.</p>
        </div>
      </header>

      {/* Tabs - Modernized and Premium */}
      <div className="flex flex-wrap bg-white rounded-[2.5rem] shadow-soft border border-earth-100 p-2 w-fit mb-12 gap-2">
        <button
          onClick={() => setActiveTab('crops')}
          className={`px-8 py-4 rounded-[1.75rem] text-[10px] font-display font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
            activeTab === 'crops'
              ? 'bg-forest-600 text-white shadow-xl shadow-forest-900/20 active:scale-95'
              : 'text-earth-400 hover:text-earth-900 hover:bg-earth-50'
          }`}
        >
          <Sprout className="w-4 h-4" />
          Cultivars
        </button>
        <button
          onClick={() => setActiveTab('greenhouse')}
          className={`px-8 py-4 rounded-[1.75rem] text-[10px] font-display font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
            activeTab === 'greenhouse'
              ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/20 active:scale-95'
              : 'text-earth-400 hover:text-earth-900 hover:bg-earth-50'
          }`}
        >
          <Sun className="w-4 h-4" />
          Greenhouse
        </button>
        <button
          onClick={() => setActiveTab('botanicals')}
          className={`px-8 py-4 rounded-[1.75rem] text-[10px] font-display font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
            activeTab === 'botanicals'
              ? 'bg-amber-500 text-black shadow-xl shadow-amber-900/20 active:scale-95'
              : 'text-earth-400 hover:text-earth-900 hover:bg-earth-50'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Botanicals
        </button>
        <button
          onClick={() => setActiveTab('playbook')}
          className={`px-8 py-4 rounded-[1.75rem] text-[10px] font-display font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
            activeTab === 'playbook'
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 active:scale-95'
              : 'text-earth-400 hover:text-earth-900 hover:bg-earth-50'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Protocols
        </button>
      </div>

      {activeTab === 'crops' && (
        <div className="grid grid-cols-1 mb-8 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {cropLibrary.map((crop, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={crop.id} 
              className="card overflow-hidden flex flex-col group border-earth-100/50 hover:shadow-elevated hover:border-forest-200 transition-all duration-500"
            >
              <div className="bg-forest-50 p-10 border-b border-earth-100 relative overflow-hidden group-hover:bg-forest-600 transition-colors duration-500">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity italic font-display font-black text-5xl text-white group-hover:scale-125 transition-transform duration-700">CROP</div>
                <h2 className="text-3xl font-display font-black text-forest-900 italic tracking-tighter group-hover:text-white transition-colors">{crop.name}</h2>
                <p className="text-xs italic text-forest-600 font-medium mt-3 group-hover:text-white/60 tracking-widest uppercase">{crop.scientificName}</p>
              </div>
              <div className="p-10 space-y-8 flex-1 flex flex-col justify-between bg-white relative">
                <div>
                  <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-3">Local Designations</p>
                  <p className="font-display font-bold text-earth-900 text-lg italic">{crop.localNames}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 border-y border-earth-50 py-8">
                   <div className="relative group/stat">
                    <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-2 leading-none group-hover/stat:text-forest-600">Cycle Matrix</p>
                    <p className="text-3xl font-display font-black text-earth-900 tracking-tighter italic">{crop.cycleDays} <span className="text-sm opacity-30">days</span></p>
                  </div>
                  <div className="relative group/stat text-right">
                    <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-2 leading-none group-hover/stat:text-forest-600">Expected Yield</p>
                    <p className="text-3xl font-display font-black text-earth-900 tracking-tighter italic group-hover/stat:text-forest-600 transition-colors">{crop.expectedYield}</p>
                  </div>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-3">Agro-Ecological Distribution</p>
                   <div className="flex flex-wrap gap-2">
                     {crop.zones.map(zone => (
                       <span key={zone} className="bg-earth-50 text-earth-500 text-[10px] font-display font-black px-3 py-1.5 rounded-xl border border-earth-100 uppercase tracking-widest">
                         {zone}
                       </span>
                     ))}
                   </div>
                </div>
                 <div className="pt-8 border-t border-earth-50">
                    <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-2">Technical Spacing Protocol</p>
                    <p className="font-display font-bold text-earth-900 text-lg italic">{crop.spacing}</p>
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'botanicals' && (
        <div className="grid grid-cols-1 mb-8 gap-8 xl:grid-cols-2">
          {botanicalsLibrary.map((botanical, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={botanical.id} 
              className="card overflow-hidden flex flex-col group border-earth-100/50 hover:shadow-elevated transition-all duration-500"
            >
              <div className={`p-10 border-b border-earth-100 relative overflow-hidden transition-colors duration-500 ${
                botanical.type === 'biopesticide' ? 'bg-amber-50 group-hover:bg-amber-500' : 
                botanical.type === 'fertilizer' ? 'bg-forest-50 group-hover:bg-forest-600' : 'bg-terracotta-50 group-hover:bg-terracotta-600'
              }`}>
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.1] transition-all italic font-display font-black text-5xl text-white group-hover:scale-125 group-hover:rotate-12 duration-700 uppercase tracking-widest">{botanical.type}</div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h2 className="text-4xl font-display font-black text-earth-900 italic tracking-tighter group-hover:text-white transition-colors">{botanical.name}</h2>
                    <p className="text-xs italic text-earth-600 font-medium mt-3 group-hover:text-white/60 tracking-[0.2em] uppercase">{botanical.scientificName}</p>
                  </div>
                   <span className={cn(
                     "px-4 py-2 text-[9px] font-display font-black uppercase rounded-2xl tracking-[0.3em] border group-hover:bg-white group-hover:text-black group-hover:border-white transition-all shadow-sm",
                      botanical.type === 'biopesticide' ? 'bg-white border-amber-200 text-amber-700' : 
                      botanical.type === 'fertilizer' ? 'bg-white border-forest-200 text-forest-700' : 'bg-white border-terracotta-200 text-terracotta-700'
                   )}>
                     {botanical.type === 'both' ? 'Hybrid Defense' : botanical.type}
                   </span>
                </div>
              </div>
              
              <div className="p-10 space-y-8 flex-1 flex flex-col bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.3em] mb-3">Vernacular Identification</p>
                      <p className="font-display font-bold text-earth-900 text-xl italic">{botanical.localNames}</p>
                    </div>
                    
                    {botanical.targetPests && (
                      <div className="bg-amber-50/30 p-6 rounded-3xl border border-amber-100/50">
                        <p className="text-[10px] font-display font-black text-amber-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-3">
                          <Bug className="w-3 h-3" /> Elimination Targets
                        </p>
                        <p className="text-sm font-display font-bold text-earth-900 italic tracking-tight">{botanical.targetPests.join(' — ')}</p>
                      </div>
                    )}
                    
                    {botanical.nutrients && (
                      <div className="bg-forest-50/30 p-6 rounded-3xl border border-forest-100/50">
                        <p className="text-[10px] font-display font-black text-forest-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-3">
                          <Sprout className="w-3 h-3" /> Nutrient Synthesis
                        </p>
                        <p className="text-sm font-display font-bold text-earth-900 italic tracking-tight">{botanical.nutrients}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8 border-l border-earth-100 pl-10">
                    <div>
                      <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-[0.3em] mb-3 underline decoration-forest-500 underline-offset-4">Prep Protocol</p>
                      <p className="text-base text-earth-600 leading-relaxed font-medium italic">{botanical.preparation}</p>
                    </div>
                    
                    <div className="flex gap-10">
                      <div>
                        <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-[0.3em] mb-2 leading-none">Dosage</p>
                        <p className="text-sm font-display font-black text-earth-900 italic tracking-tighter">{botanical.dosage}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-display font-black text-earth-400 uppercase tracking-[0.3em] mb-2 leading-none">Application Matrix</p>
                        <p className="text-sm font-display font-black text-earth-900 italic tracking-tighter truncate">{botanical.application}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'playbook' && (
        <AgronomyPlaybook />
      )}

      {activeTab === 'greenhouse' && (
        <GreenhouseGuide />
      )}
    </div>
  );
}

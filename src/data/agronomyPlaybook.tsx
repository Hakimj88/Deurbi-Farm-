import React from 'react';
import { Leaf, Droplets, Sun, Wheat, Apple, Bug, LineChart, TrendingUp, Calculator, ShieldCheck, Info, Droplet } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const AgronomyPlaybook = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 max-w-5xl pb-20"
    >
      <motion.section variants={item} className="card overflow-hidden border-earth-100 shadow-xl bg-white group">
        <div className="bg-forest-50 p-10 border-b border-earth-100 flex items-center justify-between relative overflow-hidden group-hover:bg-forest-600 transition-all duration-700">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.1] transition-all italic font-display font-black text-6xl text-white uppercase tracking-tighter">PHASE 01</div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-forest-600 group-hover:scale-110 transition-transform duration-500">
               <Wheat className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-display font-black text-forest-900 group-hover:text-white transition-colors italic tracking-tighter">Cereals <span className="opacity-40 italic">/ Staple Systems</span></h2>
          </div>
        </div>
        <div className="p-10 space-y-10 group-hover:bg-earth-50/20 transition-colors">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-1.5 h-1.5 bg-forest-500 rounded-full"></div>
                 <h3 className="text-[10px] font-display font-black text-forest-600 uppercase tracking-[0.4em]">Core Management Matrix</h3>
               </div>
               <div className="space-y-6">
                 {[
                   { label: "Pedology", text: "Sandy to loamy profiles. Millet and Sorghum exhibit extreme drought-resilience." },
                   { label: "Temporal Strategy", text: "Target first steady precipitation (June/July). Deploy 1m x 1m spacing in arid zones." },
                   { label: "Nutrient Injection", text: "Organic foundation during land prep. Nitro-tea top dressing at 4 weeks post-emergence." },
                   { label: "Biosphere Guard", text: "Critical weed mitigation in weeks 2-4. Rotation prevents parasitic Striga cycles." }
                 ].map((row, i) => (
                   <div key={i} className="flex gap-6 group/row">
                     <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest min-w-[100px] pt-1 group-hover/row:text-forest-600 transition-colors underline decoration-earth-100 underline-offset-4">{row.label}</p>
                     <p className="text-earth-600 font-medium text-sm leading-relaxed">{row.text}</p>
                   </div>
                 ))}
               </div>
            </div>
            <div className="space-y-6">
               <div className="p-8 bg-earth-50 rounded-[2.5rem] border border-earth-100 relative group/tile overflow-hidden">
                 <div className="absolute inset-0 bg-forest-600 opacity-0 group-hover/tile:opacity-5 transition-opacity"></div>
                 <h4 className="font-display font-black text-earth-900 mb-3 italic tracking-tight text-xl">Rice Production Logic</h4>
                 <p className="text-sm text-earth-500 leading-relaxed italic">Senegal River Valley protocol: 21-day nursery trans-planting. Irrigated systems demand absolute hydrological control for peak yield potential.</p>
               </div>
               <div className="p-8 bg-earth-50 rounded-[2.5rem] border border-earth-100 relative group/tile overflow-hidden">
                 <div className="absolute inset-0 bg-amber-600 opacity-0 group-hover/tile:opacity-5 transition-opacity"></div>
                 <h4 className="font-display font-black text-earth-900 mb-3 italic tracking-tight text-xl">Ecological Adaptation</h4>
                 <p className="text-sm text-earth-500 leading-relaxed italic">Maize requires high-input moisture/nutrients. Avoid deployment in marginal dry sandy sectors where Millet/Sorghum find their niche.</p>
               </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="card overflow-hidden border-earth-100 shadow-xl bg-[#0A0A0A] text-white group">
        <div className="p-12 flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
             <div className="h-20 w-20 bg-amber-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-amber-900/40 border border-white/10 group-hover:scale-110 transition-all duration-700">
               <Leaf className="w-10 h-10 text-black" />
             </div>
             <h2 className="text-5xl font-display font-black italic tracking-tighter leading-[0.85] mb-6">Horticultural <br/> <span className="text-amber-500">Engines</span></h2>
             <p className="text-amber-500/40 text-[10px] font-display font-black uppercase tracking-[0.4em] mb-8 leading-none">Maraîchage Sector</p>
             <p className="text-white/40 text-xs font-medium leading-relaxed italic border-l border-white/10 pl-6 pr-4">Primary cash engine for smallholders, specialized for dry-season irrigation cycles.</p>
          </div>
          
          <div className="md:w-2/3 space-y-6">
            {[
              { title: "Incubation Strategy", text: "Tomatoes, onions, and crucifers require 3-5 week shaded nurseries. Maintain moisture equilibrium to prevent damping-off pathology." },
              { title: "Hydraulic Integrity", text: "Daily dry-season application is mandatory. Drip-infusion is the gold standard for leaf fungus mitigation. Weekly Neem protocol for whitefly suppression." },
              { title: "Yield Continuity", text: "Okra and Eggplant: 48-72 hour harvest intervals and mechanical stimulus to maintain hormonal flowering cycles." }
            ].map((box, i) => (
              <div key={i} className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-amber-500 transition-all group/box relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/box:opacity-[0.05] transition-all font-display font-black text-4xl text-white">0{i+1}</div>
                <h4 className="font-display font-black text-amber-500 mb-4 text-xl italic tracking-tight">{box.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{box.text}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid md:grid-cols-2 gap-8">
        <div className="card p-10 border-earth-100 shadow-xl bg-white group hover:border-terracotta-500 transition-all duration-500">
          <div className="h-16 w-16 bg-terracotta-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-terracotta-500 group-hover:text-white transition-all">
             <Apple className="w-8 h-8 text-terracotta-600 group-hover:text-white" />
          </div>
          <h3 className="text-3xl font-display font-black italic text-earth-900 tracking-tighter mb-6">Orchard Systems</h3>
          <div className="space-y-8">
             <div className="flex gap-6">
               <div className="w-1 bg-terracotta-100 rounded-full h-auto"></div>
               <div>
                  <h4 className="font-display font-black text-earth-900 tracking-tighter text-xl mb-2 italic">Mango & Citrus Establishment</h4>
                  <p className="text-sm text-earth-500 leading-relaxed italic">Kent/Keitt grafting is essential for export parity. Establishment: 36-60 months per cycle.</p>
               </div>
             </div>
             <div className="p-6 bg-terracotta-50/50 rounded-[2rem] border border-terracotta-100">
                <p className="text-[10px] font-display font-black text-terracotta-600 uppercase tracking-widest mb-3">CRITICAL VECTOR ALERT</p>
                <p className="text-xs text-earth-700 font-medium leading-relaxed italic">Fruit Fly (Bactrocera) remains the primary threat. Deploy pheromone saturation traps and pre-terminal harvesting protocols.</p>
             </div>
          </div>
        </div>

        <div className="card p-10 border-earth-100 shadow-xl bg-white group hover:border-forest-500 transition-all duration-500">
          <div className="h-16 w-16 bg-forest-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-forest-500 transition-all">
             <Bug className="w-8 h-8 text-forest-600 group-hover:text-white" />
          </div>
          <h3 className="text-3xl font-display font-black italic text-earth-900 tracking-tighter mb-6">Botanical Synthesis</h3>
          <div className="space-y-6 divide-y divide-earth-100">
             {[
               { icon: <ShieldCheck className="w-4 h-4 text-forest-600" />, label: "Neem Protocol", text: "Crushed kernel infusion. Broad-spectrum repellant for chewing/sucking vectors." },
               { icon: <Droplet className="w-4 h-4 text-blue-500" />, label: "Papaya Synthesis", text: "Breaking fungal cell structures and combating thrips/aphids via enzyme action." },
               { icon: <Sun className="w-4 h-4 text-amber-500" />, label: "Capsicum Saturation", text: "Chili/Garlic repellant sprays for localized heavy infestation control." }
             ].map((item, i) => (
               <div key={i} className={cn("flex gap-5 py-5 first:pt-0 pb-0 last:pb-0 group/item", i !== 0 && "pt-6")}>
                 <div className="p-2.5 bg-earth-50 rounded-xl group-hover/item:bg-forest-50 transition-colors">{item.icon}</div>
                 <div>
                   <h5 className="text-[10px] font-display font-black text-earth-900 uppercase tracking-widest leading-none mb-1 group-hover/item:text-forest-600">{item.label}</h5>
                   <p className="text-xs text-earth-500 font-medium italic">{item.text}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="card p-12 bg-white border-earth-200 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div>
               <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl w-fit mb-8 shadow-sm">
                 <LineChart className="w-8 h-8" />
               </div>
               <h2 className="text-4xl font-display font-black italic tracking-tighter text-earth-900 mb-4">Financial & Hydraulic Systems</h2>
               <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.4em]">Operations Playbook v1.8</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-display font-black text-blue-600 italic tracking-tight flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-500"/> Hydraulic Matrix
              </h3>
              <div className="space-y-4">
                 {[
                   { t: "Rainfed (95%)", d: "Wet season dominance. Deploy tie-ridging and heavy mulching to trap residual moisture." },
                   { t: "Precision Drip", d: "Saves 60% water. Enables localized fertigation and minimizes weed germination profiles." },
                   { t: "Solar Infusion", d: "Zero OPEX strategy. High initial CapEx offset within 24-36 months vs petrol logistics." }
                 ].map((d, i) => (
                   <div key={i} className="flex gap-4 group/h">
                     <span className="w-6 h-px bg-blue-200 mt-2.5 group-hover/h:w-10 transition-all"></span>
                     <p className="text-sm font-medium text-earth-500 leading-relaxed italic"><strong className="text-earth-900 font-black uppercase text-[11px] tracking-widest">{d.t}:</strong> {d.d}</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="bg-earth-50 rounded-[3rem] p-10 border border-earth-100 space-y-10 relative group/eco overflow-hidden">
            <div className="absolute bottom-0 right-0 p-10 opacity-[0.04] italic font-display font-black text-7xl text-earth-900 pointer-events-none group-hover/eco:scale-125 transition-transform duration-1000">CAPITAL</div>
            <h3 className="text-xl font-display font-black text-forest-700 italic tracking-tight flex items-center gap-3 relative z-10">
              <TrendingUp className="w-5 h-5 text-forest-600"/> Economics of Scale
            </h3>
            <div className="space-y-8 relative z-10">
              {[
                { t: "Post-Harvest Retention", d: "Critical yield leak (30%). Invest in PICS hermetic sealing to neutralize weevil logistics." },
                { t: "Agroforestry Dividend", d: "Integrating Faidherbia/Moringa boosts annual carbon drop and dry-season resilience." },
                { t: "Off-Season Leverage", d: "Onions/Tomatoes grown in dry cycles fetch 300%—500% price parity spikes." }
              ].map((d, i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-earth-100 shadow-sm hover:shadow-md transition-all">
                   <h5 className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest mb-2 leading-none italic">{d.t}</h5>
                   <p className="text-sm text-earth-800 font-medium italic leading-relaxed">{d.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

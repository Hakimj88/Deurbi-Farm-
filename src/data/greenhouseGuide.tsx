import React from 'react';
import { Sun, ThermometerSun, ShieldAlert, Bug, Droplet, Sprout, Wind, Layers, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const GreenhouseGuide = () => {
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
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 max-w-5xl pb-20"
    >
      <motion.section variants={item} className="card overflow-hidden border-earth-100 shadow-2xl bg-white group">
        <div className="bg-emerald-600 p-12 text-white relative overflow-hidden transition-all duration-700">
           <div className="absolute top-0 right-0 p-12 opacity-[0.1] group-hover:opacity-[0.2] transition-all italic font-display font-black text-7xl text-white uppercase tracking-tighter group-hover:scale-125 duration-1000">SHADE NET</div>
           <div className="flex items-center gap-8 relative z-10">
            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl group-hover:rotate-12 transition-transform duration-500">
               <Sun className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-5xl font-display font-black italic tracking-tighter leading-none mb-3">Biosphere Management</h2>
              <p className="text-emerald-100/60 text-[10px] font-display font-black uppercase tracking-[0.4em]">Region: Sahel / Sudano-Guinean v1.2</p>
            </div>
          </div>
        </div>
        
        <div className="p-12 space-y-12">
          <p className="text-lg text-earth-800 font-medium italic border-l-4 border-emerald-500 pl-8 max-w-3xl leading-relaxed">
            Protected cropping in West Africa demands absolute thermodynamic control. Atmospheric stabilization is the primary driver of high-value vegetable yields in high-radiation sectors.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              { icon: <ThermometerSun className="w-6 h-6" />, title: "Thermodynamic Ventilation", desc: "Temperatures can exceed 55°C. High-arch structures with top-flow venting and roll-up lateral walls are critical. Use 40% aluminized shade netting to reflect peak infrared radiation." },
              { icon: <Droplet className="w-6 h-6" />, title: "Hydraulic Equilibrium", desc: "Drip-infusion is mandatory. Atmospheric saturation triggers Botrytis pathology. Target early morning irrigation windows to maintain leaf-dry cycles and laminar airflow." },
              { icon: <Layers className="w-6 h-6" />, title: "Substrate Solarization", desc: "Confined cultivation triggers Nematode vectors. Apply 4-week thermal plastic solarization between cycles. Alternatively, migrate to Coco-Peat grow-bag systems." },
              { icon: <Activity className="w-6 h-6" />, title: "Manual Pollination", desc: "Natural vectors are excluded. Solanaceous crops require mechanical flower stimulation (shaking wires) during optimal morning humidity windows." }
            ].map((box, i) => (
              <div key={i} className="p-8 bg-earth-50 rounded-[2.5rem] border border-earth-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all group/box">
                <div className="p-3 bg-white rounded-2xl w-fit text-emerald-600 shadow-sm mb-6 group-hover/box:scale-110 transition-transform">
                  {box.icon}
                </div>
                <h4 className="font-display font-black text-earth-900 mb-4 text-xl italic tracking-tight">{box.title}</h4>
                <p className="text-sm text-earth-500 leading-relaxed italic">{box.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-12 bg-[#0A0A0A] text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all italic font-display font-black text-7xl text-white pointer-events-none group-hover:scale-125 duration-1000 uppercase">Vector Control</div>
           
           <div className="flex items-center gap-6 mb-12 relative z-10">
             <div className="p-4 bg-amber-500 rounded-2xl group-hover:rotate-12 transition-transform">
                <Bug className="w-8 h-8 text-black" />
             </div>
             <h2 className="text-4xl font-display font-black italic tracking-tighter">Integrated Pest Logic</h2>
           </div>

           <div className="grid sm:grid-cols-2 gap-8 relative z-10">
              {[
                { t: "Mite & Whitefly Suppression", d: "Enclosed environments accelerate populations. Use dual-spectrum sticky traps and weekly Neem infusion protocols." },
                { t: "Nematode Nullification", d: "Soil-borne threats demand rotation. Solarize moist profiles or utilize soilless mediums to break the reproductive cycle." },
                { t: "Hyper-Humid Pathology", d: "Prune lower leaf tiers to enhance laminar flow. Deploy Allium-based bio-fungicides during peak humidity spikes." },
                { t: "Biosphere Integrity", d: "Dual-door entry systems. Full mechanical disinfection. Immediate thermal neutralization of infected biomass." }
              ].map((d, i) => (
                <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-amber-500 transition-all hover:bg-white/[0.08] group/d">
                   <h5 className="text-[10px] font-display font-black text-white/40 uppercase tracking-[0.3em] mb-3 group-hover/d:text-amber-500">Protocol 0{i+1}</h5>
                   <h4 className="text-lg font-display font-black text-white italic tracking-tight mb-3">{d.t}</h4>
                   <p className="text-xs text-white/40 leading-relaxed italic">{d.d}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="card p-12 bg-white border-earth-100 shadow-xl overflow-hidden group">
           <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-10 shadow-sm group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-8 h-8" />
           </div>
           <h2 className="text-4xl font-display font-black italic tracking-tighter text-earth-900 mb-4 leading-none">Optimal Cultivars</h2>
           <p className="text-earth-400 text-xs font-display font-black uppercase tracking-[0.3em] mb-12 italic border-b border-earth-100 pb-4">Greenhouse Selection</p>
           
           <div className="space-y-10">
              {[
                { t: "Indeterminate Tomatoes", d: "Requires high-altitude trellising. Extreme susceptibility to bacterial wilt." },
                { t: "Hybrid Bell Peppers", d: "High export parity. Sensitive to thermal flower-drop above 35°C." },
                { t: "Parthenocarpic Cucumber", d: "Fast-cycle systems. Self-setting fruit prevents manual pollination requirements." },
                { t: "Laminar Leafy Greens", d: "Hydroponic shade-net integration prevents bolting during thermal peaks." }
              ].map((d, i) => (
                <div key={i} className="relative pl-8 group/item">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-earth-100 group-hover/item:bg-blue-600 transition-colors"></div>
                  <h5 className="font-display font-black text-earth-900 text-lg italic tracking-tight leading-none mb-2">{d.t}</h5>
                  <p className="text-xs text-earth-500 leading-relaxed italic">{d.d}</p>
                </div>
              ))}
           </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

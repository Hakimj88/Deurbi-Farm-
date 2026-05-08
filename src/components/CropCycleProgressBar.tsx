import React from 'react';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';
import { Crop, CropCycle } from '../types';
import { Leaf, Sprout, Flower, Apple, Citrus, Wheat, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  cycle: CropCycle;
  crop: Crop | undefined;
  className?: string;
}

const STAGES = [
  { name: 'Seedling', ratio: 0.15, icon: Sprout, color: 'text-earth-500', bg: 'bg-earth-500' },
  { name: 'Vegetative', ratio: 0.25, icon: Leaf, color: 'text-forest-500', bg: 'bg-forest-500' },
  { name: 'Flowering', ratio: 0.25, icon: Flower, color: 'text-amber-500', bg: 'bg-amber-500' },
  { name: 'Fruiting/Grain', ratio: 0.20, icon: Citrus, color: 'text-terracotta-500', bg: 'bg-terracotta-500' },
  { name: 'Maturity', ratio: 0.15, icon: CheckCircle2, color: 'text-slate-500', bg: 'bg-slate-500' },
];

export function CropCycleProgressBar({ cycle, crop, className }: Props) {
  if (!crop || !cycle.plantingDate) return null;

  const plantingDate = parseISO(cycle.plantingDate);
  const now = new Date();
  
  // How many days have passed since planting
  const daysPassed = Math.max(0, differenceInDays(now, plantingDate));
  
  // Total expected days
  const totalDays = crop.cycleDays;
  
  // Status check - are we past harvest?
  const isCompleted = cycle.status === 'harvested';
  
  let currentAccumulatedRatio = 0;
  let currentStageIndex = 0;
  
  const currentRatio = isCompleted ? 1 : Math.min(1, daysPassed / totalDays);
  
  for (let i = 0; i < STAGES.length; i++) {
    currentAccumulatedRatio += STAGES[i].ratio;
    if (currentRatio <= currentAccumulatedRatio) {
      currentStageIndex = i;
      break;
    }
  }

  if (isCompleted || currentRatio >= 1) {
    currentStageIndex = STAGES.length - 1;
  }

  let accumulatedRatio = 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-[10px] font-black text-earth-400 border border-earth-200 bg-earth-50 px-2 py-0.5 rounded inline-block uppercase tracking-widest mb-1">
             Progress
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-earth-900 tracking-tighter">
              {isCompleted ? totalDays : Math.min(daysPassed, totalDays)} <span className="text-sm font-bold text-earth-500 uppercase tracking-widest">/ {totalDays} days</span>
            </span>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-1">Est. Harvest</p>
           <p className="font-bold text-forest-700">
             {format(addDays(plantingDate, totalDays), 'MMM do, yyyy')}
           </p>
        </div>
      </div>

      <div className="relative pt-4">
        {/* Track Line */}
        <div className="absolute top-7 left-0 w-full h-2 bg-earth-100 rounded-full overflow-hidden">
           <div 
             className="h-full bg-forest-500 transition-all duration-1000 ease-out"
             style={{ width: `${Math.min(100, (currentRatio * 100))}%` }}
           />
        </div>

        {/* Stage Nodes */}
        <div className="relative flex justify-between items-center w-full">
          {STAGES.map((stage, idx) => {
             const isPast = idx < currentStageIndex || isCompleted || currentRatio >= 1;
             const isCurrent = idx === currentStageIndex && !isCompleted && currentRatio < 1;
             const StageIcon = stage.icon;
             
             return (
               <div key={stage.name} className="flex flex-col items-center relative z-10 w-1/5">
                 <div 
                   className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-500",
                     isPast ? stage.bg + " text-white scale-90" : 
                     isCurrent ? "bg-white border-2 border-forest-500 ring-4 ring-forest-50 scale-110" : 
                     "bg-earth-100 text-earth-400"
                   )}
                 >
                   <StageIcon className={cn("w-4 h-4", isCurrent ? "text-forest-600" : (isPast ? "text-white" : ""))} />
                 </div>
                 <div className={cn(
                   "mt-2 text-center transition-all duration-300",
                   isCurrent ? "scale-110" : "opacity-70"
                 )}>
                   <p className={cn(
                     "text-[9px] font-black uppercase tracking-widest px-1",
                     isCurrent ? stage.color : (isPast ? "text-earth-900" : "text-earth-400")
                   )}>
                     {stage.name}
                   </p>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}

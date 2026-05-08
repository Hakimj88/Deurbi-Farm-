import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { CheckCircle2, Clock, Check, Plus, X, Sparkles, Loader2, ListChecks, ArrowRight, ShieldAlert, Activity, ClipboardList, ChevronDown } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { parseTask } from '../lib/gemini';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export function Tasks() {
  const { t } = useTranslation();
  const { tasks, cropCycles, completeTask, toggleChecklistItem, addTask, addChecklistItem, farms, selectedFarmId } = useStore();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [smartInput, setSmartInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newTask, setNewTask] = useState({
    cropCycleId: '',
    taskType: '',
    dueDate: '',
    notes: '',
    dependencyTaskId: '',
  });

  const currentFarmTasks = useMemo(() => tasks.filter(t => {
    const cycle = cropCycles.find(c => c.id === t.cropCycleId);
    return cycle?.farmId === selectedFarmId;
  }), [tasks, cropCycles, selectedFarmId]);

  const pendingTasks = currentFarmTasks.filter(t => t.status !== 'completed');
  const completedTasks = currentFarmTasks.filter(t => t.status === 'completed');
  const blockedTasks = pendingTasks.filter(t => {
    const dependency = t.dependencyTaskId ? tasks.find(dep => dep.id === t.dependencyTaskId) : null;
    return dependency && dependency.status !== 'completed';
  });

  const handleSmartParse = async () => {
    if (!smartInput) return;
    setIsParsing(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const parsed = await parseTask(smartInput, today);
      if (parsed) {
        setNewTask(prev => ({
          ...prev,
          taskType: parsed.taskType || prev.taskType,
          dueDate: parsed.dueDate || prev.dueDate,
          notes: parsed.notes || prev.notes,
        }));
        setSmartInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.cropCycleId && newTask.taskType && newTask.dueDate) {
      addTask({
        id: `task_${Date.now()}`,
        cropCycleId: newTask.cropCycleId,
        taskType: newTask.taskType,
        dueDate: newTask.dueDate,
        notes: newTask.notes,
        status: 'pending',
        dependencyTaskId: newTask.dependencyTaskId || undefined
      });
      setIsAddingTask(false);
      setNewTask({
        cropCycleId: '',
        taskType: '',
        dueDate: '',
        notes: '',
        dependencyTaskId: '',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-earth-100">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-forest-50 text-forest-600 rounded-[1.25rem] shadow-sm border border-forest-100 italic">
              <ClipboardList className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-display font-black text-forest-600 uppercase tracking-[0.4em] italic">Operational Ledger</p>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black text-earth-900 tracking-tighter leading-tight italic">
            Logistics <br/>
            <span className="text-terracotta-600 italic">& Farm Workflow</span>
          </h1>
        </div>
        
        <button 
          onClick={() => setIsAddingTask(true)}
          className="group relative flex items-center justify-center gap-3 sm:gap-4 w-full md:w-auto bg-[#0A0A0A] text-white px-6 sm:px-10 py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] font-display font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-earth-900/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-terracotta-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Plus className="w-5 h-5 text-terracotta-400" />
          <span>New Operation</span>
        </button>
      </header>

      {/* Task Summary Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          label="Total Pipeline" 
          value={currentFarmTasks.length} 
          icon={ListChecks} 
          color="earth"
          status="All recorded tasks"
        />
        <SummaryCard 
          label="In Execution" 
          value={pendingTasks.length - blockedTasks.length} 
          icon={Activity} 
          color="forest"
          status="Ready for field action"
        />
        <SummaryCard 
          label="Blocked" 
          value={blockedTasks.length} 
          icon={ShieldAlert} 
          color="terracotta"
          status="Waiting for dependencies"
        />
        <SummaryCard 
          label="Accomplished" 
          value={completedTasks.length} 
          icon={CheckCircle2} 
          color="blue"
          status="Operational success"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 mt-16">
        <section className="xl:col-span-8 space-y-10">
          <div className="flex items-center justify-between border-b border-earth-100 pb-6">
            <div className="flex items-center gap-4">
              <Clock className="w-6 h-6 text-amber-500 italic" />
              <h2 className="text-2xl font-display font-black text-earth-900 uppercase tracking-tighter italic">Active Schedule</h2>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-earth-50 rounded-full border border-earth-100">
               <div className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
               <span className="text-[10px] font-display font-black text-earth-400 uppercase tracking-widest">{pendingTasks.length} Operations Pending</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {pendingTasks.length === 0 ? (
              <div className="card p-24 text-center border-dashed border-2 bg-earth-50/20 rounded-[3rem] group">
                <div className="p-8 bg-white rounded-[2.5rem] shadow-soft border border-earth-100 mb-8 mx-auto w-fit group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-16 h-16 text-forest-200" />
                </div>
                <h3 className="text-3xl font-display font-black text-earth-900 italic tracking-tight mb-4 uppercase">Agenda Clear</h3>
                <p className="text-earth-400 font-medium text-base max-w-sm mx-auto leading-relaxed italic">The current farm cycle has no pending logistics or field tasks. Check back after next soil analysis.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {pendingTasks.map((task, idx) => {
                  const cycle = cropCycles.find(c => c.id === task.cropCycleId);
                  const isExpanded = expandedTaskId === task.id;
                  const dependency = task.dependencyTaskId ? tasks.find(t => t.id === task.dependencyTaskId) : null;
                  const isBlocked = dependency && dependency.status !== 'completed';
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      key={task.id} 
                      className={cn(
                        "card p-0 overflow-hidden group transition-all duration-700 border-earth-100/50 hover:border-forest-200 shadow-xl",
                        isBlocked ? "opacity-75 bg-earth-50/50 shadow-none grayscale-[0.5]" : "bg-white",
                        isExpanded && "ring-1 ring-forest-500/20 shadow-2xl"
                      )}
                    >
                      <div 
                        className={cn(
                          "p-8 md:p-10 flex items-center justify-between gap-8 cursor-pointer transition-colors",
                          isExpanded ? 'bg-earth-50/50' : 'hover:bg-earth-50/20'
                        )}
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-2xl font-display font-black text-earth-900 tracking-tighter uppercase italic truncate">
                              {task.taskType}
                            </h3>
                            {task.checklist && (
                              <div className="flex items-center gap-1.5 bg-forest-50 px-3 py-1 rounded-full border border-forest-100">
                                 <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
                                 <span className="text-[9px] font-display font-black text-forest-600 uppercase tracking-widest">{task.checklist.filter(i => i.completed).length}/{task.checklist.length}</span>
                              </div>
                            )}
                            {isBlocked && (
                               <div className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1 rounded-full text-[9px] font-display font-black uppercase tracking-widest italic animate-in slide-in-from-left duration-700">
                                 <Loader2 className="w-3 h-3 animate-spin" />
                                 Operational Halt
                               </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-6">
                             <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span className={cn(
                                  "text-[10px] font-display font-black uppercase tracking-[0.2em] italic",
                                  new Date(task.dueDate) < new Date() ? "text-terracotta-600" : "text-earth-400"
                                )}>Due: {task.dueDate}</span>
                             </div>
                             
                             {cycle && (
                                <div className="flex items-center gap-3">
                                  <div className="w-1 h-4 bg-earth-200 rounded-full" />
                                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-forest-600 italic">
                                    {cycle.purpose} — {cycle.variety}
                                  </span>
                                </div>
                             )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                           <div className={cn("hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-earth-50 text-earth-300 transition-all duration-500", isExpanded && "rotate-180 bg-[#0A0A0A] text-white shadow-lg")}>
                             <ChevronDown className="w-6 h-6" />
                           </div>
                           <button 
                            disabled={isBlocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isBlocked) completeTask(task.id);
                            }}
                            className={cn(
                              "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-xl border",
                              isBlocked ? "bg-earth-100 text-earth-300 border-earth-200 cursor-not-allowed" : "bg-[#0A0A0A] text-white border-black hover:scale-110 active:scale-95 hover:bg-forest-600 group-hover:shadow-forest-500/20"
                            )}
                          >
                            <Check className="w-8 h-8" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="border-t border-earth-100 bg-earth-50/30 overflow-hidden"
                          >
                            <div className="p-10 md:p-14 space-y-12">
                              {isBlocked && dependency && (
                                <div className="flex items-center gap-6 p-8 bg-amber-50 rounded-[2rem] border border-amber-100 shadow-sm">
                                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-amber-100 shadow-inner text-amber-600">
                                     <ShieldAlert className="w-8 h-8" />
                                   </div>
                                   <div>
                                     <p className="text-[10px] font-display font-black text-amber-800 uppercase tracking-[0.3em] mb-2 leading-none italic">Logical dependency restriction</p>
                                     <p className="text-xl font-display font-black italic text-amber-900 tracking-tight">Complete <span className="text-amber-600 underline decoration-2 underline-offset-4">"{dependency.taskType}"</span> to unlock this protocol.</p>
                                   </div>
                                </div>
                              )}

                              {task.notes && (
                                <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                    <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic">Protocol Directives</p>
                                    <div className="flex-1 h-px bg-earth-100" />
                                  </div>
                                  <p className="text-xl text-earth-800 font-medium italic leading-relaxed pl-4 border-l-4 border-earth-200">
                                    "{task.notes}"
                                  </p>
                                </div>
                              )}
                              
                              <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <ListChecks className="w-5 h-5 text-forest-600" />
                                     <h4 className="text-[11px] font-display font-black text-earth-900 uppercase tracking-[0.4em] italic">Verification Sub-Tasks</h4>
                                  </div>
                                  {task.checklist && <span className="text-[9px] font-display font-black text-earth-400 uppercase tracking-widest italic">{task.checklist.filter(i => i.completed).length} of {task.checklist.length} verified</span>}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {task.checklist?.map(item => (
                                    <motion.div 
                                      whileHover={{ scale: 1.02 }}
                                      key={item.id}
                                      onClick={() => toggleChecklistItem(task.id, item.id)}
                                      className={cn(
                                        "flex items-center gap-5 p-6 rounded-[1.5rem] border transition-all cursor-pointer group shadow-sm",
                                        item.completed ? "bg-forest-50/50 border-forest-100" : "bg-white border-earth-100 hover:border-forest-300"
                                      )}
                                    >
                                      <div className={cn(
                                        "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all",
                                        item.completed ? "bg-forest-600 border-forest-600" : "bg-white border-earth-200 group-hover:border-forest-400 shadow-inner"
                                      )}>
                                        {item.completed && <Check className="w-4 h-4 text-white" />}
                                      </div>
                                      <span className={cn(
                                        "text-base font-display font-bold italic transition-all",
                                        item.completed ? 'text-forest-700/40 line-through' : 'text-earth-900'
                                      )}>
                                        {item.label}
                                      </span>
                                    </motion.div>
                                  ))}
                                  
                                  {/* Add Sub-task field inline */}
                                  <div className="flex gap-4 col-span-1 md:col-span-2 mt-4">
                                    <input 
                                      type="text" 
                                      placeholder="Identify required sub-action..." 
                                      className="flex-1 bg-white border border-earth-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 font-display font-bold italic"
                                      value={newChecklistItem}
                                      onChange={(e) => setNewChecklistItem(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newChecklistItem.trim()) {
                                          addChecklistItem(task.id, newChecklistItem.trim());
                                          setNewChecklistItem('');
                                        }
                                      }}
                                    />
                                    <button 
                                      onClick={() => {
                                        if (newChecklistItem.trim()) {
                                          addChecklistItem(task.id, newChecklistItem.trim());
                                          setNewChecklistItem('');
                                        }
                                      }}
                                      className="bg-[#0A0A0A] text-white px-8 rounded-2xl hover:bg-forest-600 shadow-xl transition-all active:scale-95 font-display font-black text-[10px] uppercase tracking-widest italic"
                                    >
                                      Apply Step
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </section>

        <section className="xl:col-span-4 space-y-12">
           {/* Completed Feed */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-earth-100 pb-6">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-forest-500 italic" />
                <h2 className="text-2xl font-display font-black text-earth-900 uppercase tracking-tighter italic">Archive</h2>
              </div>
              <span className="text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic">{completedTasks.length} Logged</span>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {completedTasks.length === 0 ? (
                <div className="card p-12 text-center bg-earth-50/10 border-earth-100 border-dashed rounded-[2rem]">
                  <p className="text-[10px] font-display font-black text-earth-200 uppercase tracking-[0.3em] italic">Operation history null</p>
                </div>
              ) : (
                [...completedTasks].reverse().map((task, idx) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    whileHover={{ opacity: 1, scale: 1.02 }}
                    key={task.id} 
                    className="bg-white p-6 rounded-[2rem] border border-earth-100 flex items-center justify-between gap-6 group transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600 border border-forest-100 shadow-inner">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-lg font-display font-black text-earth-900 italic tracking-tight">{task.taskType}</p>
                        <p className="text-[9px] font-display font-black text-earth-300 uppercase tracking-widest mt-1">Closed: {task.dueDate}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modern Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingTask(false)}
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
                   <p className="text-[10px] font-display font-black text-forest-600 uppercase tracking-[0.4em] mb-2 italic">Operation Planner</p>
                   <h2 className="text-4xl font-display font-black text-earth-900 tracking-tighter uppercase italic flex items-center gap-4">
                     <Plus className="w-8 h-8 text-forest-600" />
                     Initialize Task
                   </h2>
                 </div>
                 <button 
                   onClick={() => setIsAddingTask(false)} 
                   className="p-4 bg-white rounded-2xl shadow-sm text-earth-400 hover:text-earth-900 border border-earth-100 transition-all hover:rotate-90"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-10 md:p-12 overflow-y-auto custom-scrollbar">
                 {/* Smart AI Section */}
                <div className="mb-12 bg-[#0A0A0A] p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-3xl">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
                    <Sparkles className="w-32 h-32 text-white" />
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <label className="text-[10px] font-display font-black text-amber-500 uppercase tracking-[0.4em] italic leading-none">Antigravity AI Input</label>
                  </div>
                  <div className="flex gap-4 relative z-10">
                    <input 
                      type="text" 
                      placeholder="e.g. Schedule weeding for tomato cycle at North Farm tomorrow" 
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/20 text-base font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all italic"
                      value={smartInput}
                      onChange={(e) => setSmartInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSmartParse()}
                    />
                    <button 
                      type="button" 
                      onClick={handleSmartParse}
                      disabled={isParsing || !smartInput}
                      className="bg-amber-500 text-black px-8 rounded-2xl hover:bg-amber-400 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-amber-500/20"
                    >
                      {isParsing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                    </button>
                  </div>
                  <p className="text-[10px] font-display font-black text-white/20 mt-6 tracking-widest italic uppercase">Semantic parsing enabled • 1.4s latency estimated</p>
                </div>

                <form id="add-task-form" onSubmit={handleAddTask} className="space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Allocation Target</label>
                      <select 
                        required 
                        className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 outline-none transition-all appearance-none italic" 
                        value={newTask.cropCycleId} 
                        onChange={e => setNewTask({...newTask, cropCycleId: e.target.value})}
                      >
                        <option value="">Select Cycle...</option>
                        {cropCycles.filter(c => c.farmId === selectedFarmId).map(c => {
                          const farm = farms.find(f => f.id === c.farmId);
                          return <option key={c.id} value={c.id}>{farm?.name} ({c.season})</option>
                        })}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Deadline Date</label>
                      <input 
                        required 
                        type="date" 
                        className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all" 
                        value={newTask.dueDate} 
                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Protocol Type</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Precision Fertigation" 
                      className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all italic" 
                      value={newTask.taskType} 
                      onChange={e => setNewTask({...newTask, taskType: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic ml-1">Procedural Notes</label>
                    <textarea 
                      className="w-full bg-earth-50 border border-earth-100 rounded-[1.5rem] p-5 font-display font-bold text-earth-900 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all italic" 
                      value={newTask.notes} 
                      onChange={e => setNewTask({...newTask, notes: e.target.value})} 
                      rows={3} 
                      placeholder="Environmental conditions, sector details..."
                    />
                  </div>

                  {newTask.cropCycleId && (
                    <div className="space-y-3 p-8 bg-amber-50/50 rounded-[2rem] border border-amber-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                         <ShieldAlert className="w-12 h-12 text-amber-500" />
                      </div>
                      <label className="block text-[10px] font-display font-black text-amber-800 uppercase tracking-widest italic ml-1 mb-2">Relational Dependency</label>
                      <select 
                        className="w-full bg-white border border-amber-100 rounded-[1.25rem] p-4 font-display font-bold text-earth-900 focus:ring-2 focus:ring-amber-500/20 outline-none appearance-none italic" 
                        value={newTask.dependencyTaskId} 
                        onChange={e => setNewTask({...newTask, dependencyTaskId: e.target.value})}
                      >
                        <option value="">No Procedural Lock (Immediate)</option>
                        {tasks.filter(t => t.cropCycleId === newTask.cropCycleId).map(t => (
                          <option key={t.id} value={t.id}>{t.taskType}</option>
                        ))}
                      </select>
                      <p className="text-[10px] font-display font-black text-amber-600/60 mt-4 italic tracking-widest">Selected task must reach 'Completed' status before release.</p>
                    </div>
                  )}
                </form>
              </div>

              <div className="p-10 md:p-12 border-t border-earth-100 bg-earth-50/50 w-full flex items-center justify-end gap-8 mt-auto">
                <button 
                  type="button" 
                  onClick={() => setIsAddingTask(false)} 
                  className="px-8 py-4 text-[10px] font-display font-black uppercase tracking-[0.3em] text-earth-400 hover:text-earth-900 transition-colors italic"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  form="add-task-form" 
                  className="px-12 py-5 bg-[#0A0A0A] text-[11px] font-display font-black uppercase tracking-[0.3em] text-white rounded-2xl hover:bg-forest-900 transition-all hover:scale-105 active:scale-95 shadow-xl italic"
                >
                  Initialize Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color, status }: { label: string, value: number, icon: any, color: string, status: string }) {
  const colorMap: Record<string, string> = {
    earth: "text-earth-400 bg-earth-50 border-earth-100",
    forest: "text-forest-600 bg-forest-50 border-forest-100",
    terracotta: "text-terracotta-600 bg-terracotta-50 border-terracotta-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100"
  };

  return (
    <div className="card p-6 sm:p-8 bg-white border-earth-100 relative overflow-hidden group hover:border-earth-200 transition-all flex flex-col justify-between min-h-[160px] sm:min-h-[180px]">
      <div className="absolute right-0 top-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 mt-[10%]">
         <Icon className="w-24 h-24 sm:w-40 sm:h-40" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("p-2 rounded-xl border", colorMap[color])}>
             <Icon className="w-4 h-4" />
          </div>
          <p className="text-[9px] sm:text-[10px] font-display font-black text-earth-300 uppercase tracking-widest italic">{label}</p>
        </div>
        <p className="text-4xl sm:text-5xl font-display font-black text-earth-900 tracking-tighter italic">{value}</p>
      </div>

      <div className="relative z-10 pt-4 border-t border-earth-50 flex items-center justify-between">
         <p className="text-[9px] font-display font-black uppercase tracking-widest text-earth-400 italic">{status}</p>
         <div className={cn("w-1.5 h-1.5 rounded-full", color === 'forest' && "bg-forest-500 animate-pulse", color === 'terracotta' && "bg-amber-500")} />
      </div>
    </div>
  );
}

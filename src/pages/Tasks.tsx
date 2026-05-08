import { useStore } from '../store';
import { CheckCircle2, Clock, Check, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
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

  const currentFarmTasks = tasks.filter(t => {
    const cycle = cropCycles.find(c => c.id === t.cropCycleId);
    return cycle?.farmId === selectedFarmId;
  });

  const pendingTasks = currentFarmTasks.filter(t => t.status !== 'completed');
  const completedTasks = currentFarmTasks.filter(t => t.status === 'completed');

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
        setSmartInput(''); // clear after parsing
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
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 tracking-tight">{t('tasks.title')}</h1>
          <p className="text-earth-500 mt-1">{t('tasks.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAddingTask(true)}
          className="flex items-center gap-2 bg-forest-600 hover:bg-forest-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('tasks.add_task')}
        </button>
      </header>

      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-earth-100 bg-earth-50">
               <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-terracotta-500" />
                 Add New Task
               </h2>
               <button onClick={() => setIsAddingTask(false)} className="text-earth-500 hover:text-earth-900">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {/* Smart Add AI Section */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" /> {t('tasks.smart_add')}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g., Remind me to weed the tomatoes tomorrow" 
                    className="flex-1 border text-sm border-blue-200 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSmartParse()}
                  />
                  <button 
                    type="button" 
                    onClick={handleSmartParse}
                    disabled={isParsing || !smartInput}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">{t('tasks.smart_desc')}</p>
              </div>

              <form id="add-task-form" onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">{t('tasks.crop_cycle')}</label>
                  <select required className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newTask.cropCycleId} onChange={e => setNewTask({...newTask, cropCycleId: e.target.value})}>
                    <option value="">{t('common.view_details')}...</option>
                    {cropCycles.filter(c => c.farmId === selectedFarmId).map(c => {
                      const farm = farms.find(f => f.id === c.farmId);
                      return <option key={c.id} value={c.id}>{farm?.name} ({c.season})</option>
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">{t('tasks.task_type')}</label>
                  <input required type="text" placeholder="e.g. Weeding, Fertilizing" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newTask.taskType} onChange={e => setNewTask({...newTask, taskType: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">{t('tasks.notes')}</label>
                  <textarea className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newTask.notes} onChange={e => setNewTask({...newTask, notes: e.target.value})} rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1">{t('tasks.due_date')}</label>
                  <input required type="date" className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
                {newTask.cropCycleId && (
                  <div>
                    <label className="block text-sm font-medium text-earth-700 mb-1">Wait for Task (Optional)</label>
                    <select 
                      className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" 
                      value={newTask.dependencyTaskId} 
                      onChange={e => setNewTask({...newTask, dependencyTaskId: e.target.value})}
                    >
                      <option value="">Start immediately</option>
                      {tasks.filter(t => t.cropCycleId === newTask.cropCycleId).map(t => (
                        <option key={t.id} value={t.id}>{t.taskType}</option>
                      ))}
                    </select>
                  </div>
                )}
              </form>
            </div>
            <div className="p-4 border-t border-earth-100 bg-earth-50 flex justify-end gap-3 mt-auto">
              <button type="button" onClick={() => setIsAddingTask(false)} className="px-4 py-2 text-earth-600 font-medium hover:bg-earth-100 rounded-lg">Cancel</button>
              <button type="submit" form="add-task-form" className="px-4 py-2 bg-forest-600 text-white font-medium hover:bg-forest-700 rounded-lg">Add Task</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold text-earth-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            {t('tasks.pending')}
          </h2>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-earth-500 card p-4">{t('tasks.no_pending')}</p>
            ) : (
              pendingTasks.map(task => {
                const cycle = cropCycles.find(c => c.id === task.cropCycleId);
                const isExpanded = expandedTaskId === task.id;
                
                const dependency = task.dependencyTaskId ? tasks.find(t => t.id === task.dependencyTaskId) : null;
                const isBlocked = dependency && dependency.status !== 'completed';
                
                return (
                  <div key={task.id} className={cn(
                    "card overflow-hidden shadow-sm hover:shadow-md transition-shadow relative",
                    isBlocked && "opacity-60 grayscale-[0.5]"
                  )}>
                    <div 
                      className={`p-4 flex items-start justify-between gap-4 cursor-pointer ${isExpanded ? 'bg-forest-50/30' : ''}`}
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-earth-900">{task.taskType}</p>
                          {task.checklist && (
                            <span className="text-[10px] bg-forest-100 text-forest-700 px-1.5 py-0.5 rounded font-bold">
                              {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                            </span>
                          )}
                          {isBlocked && (
                            <span className="flex items-center gap-1 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Blocked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-earth-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          Due: {task.dueDate}
                        </p>
                        {isBlocked && dependency && (
                          <p className="text-[10px] text-amber-600 font-bold mt-1">Waiting for: {dependency.taskType}</p>
                        )}
                        {cycle && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-forest-600 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
                              {cycle.purpose}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-earth-400 bg-earth-50 px-2 py-0.5 rounded border border-earth-100">
                              {cycle.variety}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={isBlocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isBlocked) completeTask(task.id);
                          }}
                          className={cn(
                            "p-2.5 rounded-xl transition-all shadow-sm",
                            isBlocked ? "bg-earth-100 text-earth-300 cursor-not-allowed" : "bg-earth-50 hover:bg-forest-500 text-earth-400 hover:text-white"
                          )}
                          title={isBlocked ? "Dependent task must be completed first" : "Quick complete"}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-earth-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {task.notes && (
                          <div className="bg-earth-50 p-3 rounded-xl">
                            <p className="text-xs text-earth-400 uppercase font-bold tracking-widest mb-1">NOTES</p>
                            <p className="text-sm text-earth-700 leading-relaxed">{task.notes}</p>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <p className="text-xs text-earth-400 uppercase font-bold tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-forest-500" />
                            Monitoring Checklist
                          </p>
                          {task.checklist ? (
                            <div className="space-y-2">
                              {task.checklist.map(item => (
                                <label 
                                  key={item.id}
                                  className="flex items-center gap-3 p-3 rounded-xl border border-earth-100 hover:bg-forest-50/50 cursor-pointer transition-colors group"
                                >
                                  <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-md border-earth-300 text-forest-600 focus:ring-forest-500"
                                    checked={item.completed}
                                    onChange={() => toggleChecklistItem(task.id, item.id)}
                                  />
                                  <span className={`text-sm font-medium ${item.completed ? 'text-earth-400 line-through' : 'text-earth-700'}`}>
                                    {item.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-earth-400 italic">No checklist items defined for this task.</p>
                          )}

                          <div className="flex gap-2 mt-3 pt-3 border-t border-earth-100 border-dashed">
                            <input 
                              type="text" 
                              placeholder="Add sub-task..." 
                              className="flex-1 bg-clear border border-earth-100 rounded-xl px-3 py-1.5 text-xs focus:ring-forest-500 focus:border-forest-500"
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
                              className="bg-forest-600 text-white p-1.5 rounded-lg hover:bg-forest-700 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {task.checklist?.every(i => i.completed) && task.status !== 'completed' && (
                          <div className="bg-forest-500 p-3 rounded-xl flex items-center justify-between text-white">
                            <p className="text-xs font-bold uppercase tracking-wider">All items checked!</p>
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-earth-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-forest-500" />
            {t('tasks.completed')}
          </h2>
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <p className="text-earth-500 card p-4">{t('tasks.no_completed')}</p>
            ) : (
              completedTasks.map(task => (
                <div key={task.id} className="bg-earth-50 p-4 rounded-xl border border-earth-100 flex items-start justify-between gap-4 opacity-75">
                  <div>
                    <p className="font-medium text-earth-900 line-through decoration-earth-300">{task.taskType}</p>
                    <p className="text-sm text-earth-500 mt-1">Due: {task.dueDate}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

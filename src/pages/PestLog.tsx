import { useStore } from '../store';
import { Bug, Plus, Upload, X, Loader2, FlaskConical, Sparkles, Camera } from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';
import { diagnosePest } from '../lib/gemini';
import { useNavigate } from 'react-router-dom';
import { botanicalsLibrary } from '../data/botanicalsLibrary';
import { cropLibrary } from '../data/cropLibrary';

export function PestLog() {
  const { scoutingRecords, addScoutingRecord, cropCycles, farms, selectedFarmId } = useStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cycleIdForScan, setCycleIdForScan] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFarmCycles = cropCycles.filter(c => c.farmId === selectedFarmId);
  const filteredRecords = scoutingRecords.filter(record => 
    currentFarmCycles.some(c => c.id === record.cropCycleId)
  );

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      setSelectedImage(base64String);
      setAnalysisResult(null);
      setIsAnalyzing(true);
      
      try {
        const base64Data = base64String.split(',')[1];
        const result = await diagnosePest(base64Data, file.type);
        setAnalysisResult(result);
      } catch (error) {
        console.error(error);
        alert("Failed to analyze the image.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (analysisResult) {
       addScoutingRecord({
          id: `scout_${Date.now()}`,
          cropCycleId: cycleIdForScan || 'unknown',
          date: new Date().toISOString().split('T')[0],
          pestId: analysisResult.diagnosis,
          severity: analysisResult.severity === 'high' ? 'severe' : analysisResult.severity === 'medium' ? 'moderate' : 'low',
          actionTaken: analysisResult.recommendations?.[0] || 'Pending',
       });
       setIsModalOpen(false);
       setAnalysisResult(null);
       setSelectedImage(null);
       setCycleIdForScan('');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 tracking-tight flex items-center gap-3">
            <Bug className="w-8 h-8 text-forest-600" />
            Pest & Disease Log
          </h1>
          <p className="text-earth-500 mt-1">Track and manage crop health observations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-terracotta-200 active:scale-95 group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          AI DIAGNOSIS
        </button>
      </header>

      {filteredRecords.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-2 border-earth-200 bg-earth-50/30">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-earth-100 flex items-center justify-center mx-auto mb-6">
            <Bug className="w-8 h-8 text-earth-300" />
          </div>
          <h3 className="text-xl font-bold text-earth-900 mb-2">Monitor Crop Health</h3>
          <p className="text-earth-500 max-w-sm mx-auto mb-8">No scouting records yet. Use our AI tool to identify pests or diseases simply by taking a photo.</p>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-3 bg-white border-2 border-terracotta-500 text-terracotta-600 px-8 py-4 rounded-2xl font-bold hover:bg-terracotta-50 transition-all shadow-sm"
          >
            <Camera className="w-6 h-6" />
            START AI SCAN
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(record => {
            const matchedBotanicals = botanicalsLibrary.filter(bot => 
              bot.type !== 'fertilizer' && 
              bot.targetPests?.some(pest => 
                record.pestId.toLowerCase().includes(pest.toLowerCase()) || 
                pest.toLowerCase().includes(record.pestId.toLowerCase())
              )
            );

            return (
            <div key={record.id} className="card p-5">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-lg text-earth-900">{record.pestId}</h3>
                   <p className="text-sm text-earth-500 mt-1">Date: {record.date}</p>
                 </div>
                 <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${record.severity === 'severe' ? 'bg-red-100 text-red-700' : record.severity === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                   {record.severity}
                 </span>
               </div>
               
               <div className="mt-4 pt-4 border-t border-earth-100 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                 <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Action / Recommendation</p>
                    <p className="text-earth-800 text-sm">{record.actionTaken}</p>
                 </div>
                 <button 
                   onClick={() => navigate('/library?tab=botanicals')}
                   className="flex items-center gap-2 text-forest-600 hover:text-forest-700 bg-forest-50 hover:bg-forest-100 px-3 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
                 >
                   <FlaskConical className="w-4 h-4" />
                   Library
                 </button>
               </div>

               {matchedBotanicals.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-earth-100 bg-terracotta-50/30 -mx-5 px-5 pb-1">
                    <p className="text-xs text-terracotta-700 uppercase tracking-wider mb-3 flex items-center gap-1 font-bold">
                      <FlaskConical className="w-4 h-4" /> Suggested Local Remedies
                    </p>
                    <div className="flex flex-col gap-3 pb-4">
                      {matchedBotanicals.map(bot => (
                        <div key={bot.id} className="bg-white border text-earth-800 p-3 rounded-xl text-sm flex flex-col hover:border-terracotta-300 transition-colors shadow-sm">
                           <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-earth-900">{bot.name}</span>
                             <span className="text-xs font-semibold text-terracotta-600 bg-terracotta-100 px-2 py-0.5 rounded-full">Match found</span>
                           </div>
                           <p className="text-xs text-earth-600 line-clamp-2">{bot.preparation}</p>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
            </div>
          )})}
        </div>
      )}

      {/* AI Diagnosis Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-earth-100 bg-earth-50">
               <h2 className="text-lg font-bold text-earth-900 flex items-center gap-2">
                 <Bug className="w-5 h-5 text-terracotta-500" />
                 AI Pest Diagnosis
               </h2>
               <button onClick={() => { setIsModalOpen(false); setSelectedImage(null); setAnalysisResult(null); setCycleIdForScan(''); }} className="text-earth-500 hover:text-earth-900">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {!selectedImage ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 mb-1">Select Crop Cycle</label>
                    <select 
                      className="w-full border border-earth-200 rounded-lg p-2 focus:ring-forest-500 focus:border-forest-500" 
                      value={cycleIdForScan} 
                      onChange={e => setCycleIdForScan(e.target.value)}
                    >
                      <option value="">General Scan (No Cycle)</option>
                      {currentFarmCycles.map(c => {
                        const farm = farms.find(f => f.id === c.farmId);
                        const crop = cropLibrary.find(cr => cr.id === c.cropId);
                        return <option key={c.id} value={c.id}>{crop?.name} at {farm?.name}</option>
                      })}
                    </select>
                  </div>
                  <div 
                    className="border-2 border-dashed border-earth-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-earth-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-earth-400 mb-4" />
                    <p className="text-earth-900 font-medium text-center">Tap to upload photo</p>
                    <p className="text-earth-500 text-sm mt-1 text-center">Take a clear picture of the affected leaves or pests.</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              ) : (
                 <div className="space-y-6">
                    <img src={selectedImage} alt="Crop" className="w-full h-48 object-cover rounded-xl" />
                    
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-forest-500 animate-spin mb-4" />
                        <p className="text-earth-900 font-medium">Analyzing plant health...</p>
                      </div>
                    ) : analysisResult ? (
                      <div className="space-y-4">
                        {!analysisResult.isPlantRelated ? (
                           <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-sm border border-amber-100">
                             <strong>Note:</strong> The AI couldn't confidently identify a plant or pest in this image. Please try uploading a clearer photo.
                           </div>
                        ) : (
                          <>
                            <div>
                               <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Diagnosis</p>
                               <p className="font-bold text-lg text-earth-900">{analysisResult.diagnosis}</p>
                            </div>
                            <div>
                               <p className="text-xs text-earth-500 uppercase tracking-wider mb-2">Severity</p>
                               <div className="flex items-center gap-3">
                                 <div className="flex gap-1">
                                   <div className={`w-4 h-2 rounded-full ${analysisResult.severity === 'high' ? 'bg-red-500' : analysisResult.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                   <div className={`w-4 h-2 rounded-full ${analysisResult.severity === 'high' ? 'bg-red-500' : analysisResult.severity === 'medium' ? 'bg-amber-500' : 'bg-earth-200'}`}></div>
                                   <div className={`w-4 h-2 rounded-full ${analysisResult.severity === 'high' ? 'bg-red-500' : 'bg-earth-200'}`}></div>
                                 </div>
                                 <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded-md ${analysisResult.severity === 'high' ? 'bg-red-100 text-red-700' : analysisResult.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                   {analysisResult.severity}
                                 </span>
                               </div>
                            </div>
                            <div>
                               <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Recommendations</p>
                               <ul className="list-disc pl-5 space-y-1 text-sm text-earth-800">
                                 {analysisResult.recommendations?.map((rec: string, i: number) => (
                                   <li key={i}>{rec}</li>
                                 ))}
                               </ul>
                            </div>
                          </>
                        )}
                      </div>
                    ) : null}
                 </div>
              )}
            </div>

            {analysisResult && analysisResult.isPlantRelated && (
              <div className="p-4 border-t border-earth-100 bg-earth-50 flex justify-end gap-3">
                <button 
                  onClick={() => { setSelectedImage(null); setAnalysisResult(null); }}
                  className="px-4 py-2 text-earth-600 font-medium hover:bg-earth-100 rounded-lg"
                >
                  Try Another
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-forest-600 text-white font-medium hover:bg-forest-700 rounded-lg"
                >
                  Save to Log
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

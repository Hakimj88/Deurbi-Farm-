import { BookOpen, Sprout, FlaskConical, Bug, Bookmark, Sun } from 'lucide-react';
import { cropLibrary } from '../data/cropLibrary';
import { botanicalsLibrary } from '../data/botanicalsLibrary';
import { useSearchParams } from 'react-router-dom';
import { AgronomyPlaybook } from '../data/agronomyPlaybook';
import { GreenhouseGuide } from '../data/greenhouseGuide';

export function CropLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'crops';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-earth-900 tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-forest-600" />
          Library & Playbook
        </h1>
        <p className="text-earth-500 mt-1">West African specific database for crops, remedies, and agronomy guides.</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-earth-100 p-1 w-full lg:w-max mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('crops')}
          className={`flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'crops'
              ? 'bg-forest-50 text-forest-700'
              : 'text-earth-500 hover:text-earth-900 hover:bg-earth-50'
          }`}
        >
          <Sprout className="w-4 h-4" />
          Crops
        </button>
        <button
          onClick={() => setActiveTab('greenhouse')}
          className={`flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'greenhouse'
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-earth-500 hover:text-earth-900 hover:bg-earth-50'
          }`}
        >
          <Sun className="w-4 h-4" />
          Greenhouse
        </button>
        <button
          onClick={() => setActiveTab('botanicals')}
          className={`flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'botanicals'
              ? 'bg-terracotta-50 text-terracotta-700'
              : 'text-earth-500 hover:text-earth-900 hover:bg-earth-50'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Local Remedies
        </button>
        <button
          onClick={() => setActiveTab('playbook')}
          className={`flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'playbook'
              ? 'bg-blue-50 text-blue-700'
              : 'text-earth-500 hover:text-earth-900 hover:bg-earth-50'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Agronomy Playbook
        </button>
      </div>

      {activeTab === 'crops' && (
        <div className="grid grid-cols-1 mb-8 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cropLibrary.map(crop => (
            <div key={crop.id} className="card p-0 overflow-hidden flex flex-col">
              <div className="bg-forest-50 p-4 border-b border-earth-100">
                <h2 className="text-xl font-bold text-forest-900">{crop.name}</h2>
                <p className="text-sm italic text-forest-600 font-medium mt-1">{crop.scientificName}</p>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Local Names</p>
                  <p className="font-medium text-earth-900">{crop.localNames}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Cycle Days</p>
                    <p className="font-medium text-earth-900">{crop.cycleDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Yield / Ha</p>
                    <p className="font-medium text-earth-900">{crop.expectedYield}</p>
                  </div>
                </div>
                <div>
                   <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Agro-Ecological Zones</p>
                   <div className="flex flex-wrap gap-2 mt-1">
                     {crop.zones.map(zone => (
                       <span key={zone} className="bg-earth-100 text-earth-800 text-xs px-2 py-1 rounded-md font-medium">
                         {zone}
                       </span>
                     ))}
                   </div>
                </div>
                 <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Spacing</p>
                    <p className="font-medium text-earth-900">{crop.spacing}</p>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'botanicals' && (
        <div className="grid grid-cols-1 mb-8 gap-6 xl:grid-cols-2">
          {botanicalsLibrary.map(botanical => (
            <div key={botanical.id} className="card p-0 overflow-hidden flex flex-col">
              <div className={`p-4 border-b border-earth-100 ${
                botanical.type === 'biopesticide' ? 'bg-amber-50' : 
                botanical.type === 'fertilizer' ? 'bg-forest-50' : 'bg-terracotta-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-earth-900">{botanical.name}</h2>
                    <p className="text-sm italic text-earth-600 font-medium mt-1">{botanical.scientificName}</p>
                  </div>
                   <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${
                      botanical.type === 'biopesticide' ? 'bg-amber-100 text-amber-700' : 
                      botanical.type === 'fertilizer' ? 'bg-forest-100 text-forest-700' : 'bg-terracotta-100 text-terracotta-700'
                   }`}>
                     {botanical.type === 'both' ? 'Pesticide & Fertilizer' : botanical.type}
                   </span>
                </div>
              </div>
              
              <div className="p-5 space-y-4 flex-1 flex flex-col">
                <div>
                  <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Local Names</p>
                  <p className="font-medium text-earth-900">{botanical.localNames}</p>
                </div>
                
                {botanical.targetPests && (
                  <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Bug className="w-3 h-3" /> Target Pests
                    </p>
                    <p className="text-sm font-medium text-earth-900">{botanical.targetPests.join(', ')}</p>
                  </div>
                )}
                
                {botanical.nutrients && (
                  <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sprout className="w-3 h-3" /> Nutrients Provided
                    </p>
                    <p className="text-sm font-medium text-earth-900">{botanical.nutrients}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-earth-100">
                  <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Preparation</p>
                  <p className="text-sm text-earth-800">{botanical.preparation}</p>
                </div>
                
                <div>
                  <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Dosage</p>
                  <p className="text-sm text-earth-800">{botanical.dosage}</p>
                </div>
                
                <div>
                  <p className="text-xs text-earth-500 uppercase tracking-wider mb-1">Application</p>
                  <p className="text-sm text-earth-800">{botanical.application}</p>
                </div>

              </div>
            </div>
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

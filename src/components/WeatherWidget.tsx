import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Loader2, ThermometerSun } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchWeather, WeatherData } from '../services/weatherService';

interface WeatherWidgetProps {
  lat?: number;
  lon?: number;
  locationName?: string;
}

export function WeatherWidget({ lat, lon, locationName }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWeather() {
      if (!lat || !lon) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchWeather(lat, lon);
        setWeather(data);
      } catch (err) {
        setError('Could not load weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="card p-6 min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-forest-500" />
          <p className="text-earth-500 text-sm">Fetching local weather...</p>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card p-6 bg-red-50 border-red-100 min-h-[200px] flex items-center justify-center text-center">
        <div>
          <p className="text-red-600 font-medium">{error || 'Location coordinates not found'}</p>
          <p className="text-red-400 text-sm mt-1">Please update your farm location.</p>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('01')) return <Sun className="w-10 h-10 text-amber-500" />;
    if (iconCode.includes('10') || iconCode.includes('09')) return <CloudRain className="w-10 h-10 text-blue-500" />;
    if (iconCode.includes('03') || iconCode.includes('04')) return <Cloud className="w-10 h-10 text-earth-400" />;
    return <Sun className="w-10 h-10 text-amber-500" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-0 overflow-hidden border-earth-100 shadow-3xl relative group h-full flex flex-col"
    >
      <div className="bg-[#0A0A0A] p-12 text-white relative overflow-hidden flex-1 flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
           {weather.icon.includes('01') && <Sun className="w-96 h-96" />}
           {(weather.icon.includes('10') || weather.icon.includes('09')) && <CloudRain className="w-96 h-96" />}
           {(weather.icon.includes('03') || weather.icon.includes('04')) && <Cloud className="w-96 h-96" />}
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 bg-forest-500 rounded-full animate-pulse shadow-lg shadow-forest-500/50" />
                <p className="text-white/40 text-[10px] font-display font-black uppercase tracking-[0.4em]">{locationName || weather.locationName}</p>
              </div>
              <h2 className="text-9xl font-display font-black tracking-tighter leading-none italic">{weather.temp}<span className="text-4xl align-top opacity-20 ml-2">°C</span></h2>
              <div className="flex items-center gap-3 mt-6">
                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                  <Sun className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-white/60 font-display font-black uppercase tracking-[0.2em] text-xs">
                  {weather.description}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white/10 to-transparent p-8 rounded-[2.5rem] backdrop-blur-2xl border border-white/10 shadow-2xl group-hover:rotate-6 transition-all duration-700">
              {getWeatherIcon(weather.icon)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 relative z-10">
          <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center border border-white/5 hover:bg-white/10 transition-all duration-500 group/item">
            <Droplets className="w-6 h-6 mb-4 text-white/20 group-hover/item:text-blue-400 transition-colors" />
            <p className="text-[9px] text-white/30 font-display font-black uppercase tracking-widest mb-1">Humidity</p>
            <p className="font-display font-black text-2xl tracking-tighter italic">{weather.humidity}%</p>
          </div>
          <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center border border-white/5 hover:bg-white/10 transition-all duration-500 group/item">
            <Wind className="w-6 h-6 mb-4 text-white/20 group-hover/item:text-forest-400 transition-colors" />
            <p className="text-[9px] text-white/30 font-display font-black uppercase tracking-widest mb-1">Velocity</p>
            <p className="font-display font-black text-2xl tracking-tighter italic">{weather.windSpeed}<span className="text-[10px] opacity-30 ml-1">KPH</span></p>
          </div>
          <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center border border-white/5 hover:bg-white/10 transition-all duration-500 group/item">
            <ThermometerSun className="w-6 h-6 mb-4 text-white/20 group-hover/item:text-amber-400 transition-colors" />
            <p className="text-[9px] text-white/30 font-display font-black uppercase tracking-widest mb-1">Index</p>
            <p className="font-display font-black text-2xl tracking-tighter italic">{weather.temp + 1}°</p>
          </div>
        </div>
      </div>

      <div className="p-12 bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-10 border-b border-earth-100 pb-5">
           <p className="text-[10px] font-display font-black text-earth-300 uppercase tracking-[0.4em]">Extended Chronology</p>
           <div className="flex gap-1">
             {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-earth-200 rounded-full"></div>)}
           </div>
        </div>
        <div className="flex justify-between items-center px-4">
          {weather.forecast.map((day, i) => (
            <div key={i} className="flex flex-col items-center text-center group/day">
              <span className="text-[10px] font-display font-black text-earth-300 mb-6 uppercase tracking-[0.2em] group-hover/day:text-forest-600 transition-colors">{day.date}</span>
              <div className="mb-4 p-5 bg-earth-50 rounded-[1.5rem] group-hover/day:bg-forest-50 group-hover/day:-translate-y-2 transition-all duration-500 shadow-sm">
                {day.icon.includes('01') && <Sun className="w-8 h-8 text-amber-500" />}
                {day.icon.includes('10') && <CloudRain className="w-8 h-8 text-blue-500" />}
                {day.icon.includes('03') && <Cloud className="w-8 h-8 text-earth-400" />}
                {!day.icon.includes('01') && !day.icon.includes('10') && !day.icon.includes('03') && <Sun className="w-8 h-8 text-amber-500" />}
              </div>
              <span className="text-2xl font-display font-black text-earth-900 tracking-tighter italic">{day.temp}°</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

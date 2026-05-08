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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-0 overflow-hidden border-earth-100 shadow-md relative"
    >
      <div className="bg-[#050505] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           {weather.icon.includes('01') && <Sun className="w-32 h-32" />}
           {(weather.icon.includes('10') || weather.icon.includes('09')) && <CloudRain className="w-32 h-32" />}
           {(weather.icon.includes('03') || weather.icon.includes('04')) && <Cloud className="w-32 h-32" />}
        </div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">{locationName || weather.locationName}</p>
            <h2 className="text-6xl font-black mt-2 tracking-tighter">{weather.temp}°</h2>
            <p className="text-forest-400 font-bold capitalize mt-1 text-sm tracking-wide">{weather.description}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-md border border-white/5">
            {getWeatherIcon(weather.icon)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-10 relative z-10">
          <div className="bg-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center border border-white/5">
            <Droplets className="w-5 h-5 mb-2 text-white/40" />
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Humidity</p>
            <p className="font-bold text-lg mt-0.5">{weather.humidity}%</p>
          </div>
          <div className="bg-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center border border-white/5">
            <Wind className="w-5 h-5 mb-2 text-white/40" />
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Wind</p>
            <p className="font-bold text-lg mt-0.5">{weather.windSpeed} <span className="text-xs">km/h</span></p>
          </div>
          <div className="bg-white/5 rounded-[20px] p-4 flex flex-col items-center justify-center border border-white/5">
            <ThermometerSun className="w-5 h-5 mb-2 text-white/40" />
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Feel</p>
            <p className="font-bold text-lg mt-0.5">{weather.temp + 1}°</p>
          </div>
        </div>
      </div>

      <div className="p-8 bg-white border-t border-earth-100">
        <p className="text-[10px] font-black text-earth-300 uppercase tracking-widest mb-6 border-b border-earth-100 pb-2">5-Day Forecast</p>
        <div className="flex justify-between items-center">
          {weather.forecast.map((day, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-earth-400 mb-3 uppercase tracking-widest">{day.date}</span>
              <div className="mb-2 p-2 bg-earth-50 rounded-xl">
                {day.icon.includes('01') && <Sun className="w-5 h-5 text-amber-500" />}
                {day.icon.includes('10') && <CloudRain className="w-5 h-5 text-blue-500" />}
                {day.icon.includes('03') && <Cloud className="w-5 h-5 text-earth-400" />}
                {!day.icon.includes('01') && !day.icon.includes('10') && !day.icon.includes('03') && <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <span className="text-base font-black text-earth-900">{day.temp}°</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

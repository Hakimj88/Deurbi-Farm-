const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rain?: number;
  locationName: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  temp: number;
  description: string;
  icon: string;
}

const MOCK_WEATHER: WeatherData = {
  temp: 32,
  description: 'Partly cloudy',
  icon: '02d',
  humidity: 65,
  windSpeed: 12,
  rain: 0,
  locationName: 'Kerewan, Gambia',
  forecast: [
    { date: 'Mon', temp: 33, description: 'Sunny', icon: '01d' },
    { date: 'Tue', temp: 31, description: 'Rain', icon: '10d' },
    { date: 'Wed', temp: 29, description: 'Thunderstorm', icon: '11d' },
    { date: 'Thu', temp: 30, description: 'Cloudy', icon: '03d' },
    { date: 'Fri', temp: 32, description: 'Sunny', icon: '01d' },
  ]
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  // If no API key or placeholder, return mock data
  if (!API_KEY || API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
    console.log('Using mock weather data: No valid API key provided.');
    return MOCK_WEATHER;
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      console.warn(`Weather API error: Current: ${currentRes.status}, Forecast: ${forecastRes.status}`);
      // Fallback to mock data if key is invalid (401) or other server issues
      if (currentRes.status === 401 || forecastRes.status === 401) {
        console.warn('Invalid Weather API key. Falling back to mock data.');
        return MOCK_WEATHER;
      }
      throw new Error(`Weather API failed with status ${currentRes.status}/${forecastRes.status}`);
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Process daily forecast (OpenWeather free API gives 3-hour steps)
    const dailyForecast: ForecastDay[] = [];
    const seenDates = new Set<string>();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!seenDates.has(dayName) && dailyForecast.length < 5) {
        seenDates.add(dayName);
        dailyForecast.push({
          date: dayName,
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon
        });
      }
    }

    return {
      temp: Math.round(currentData.main.temp),
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // convert m/s to km/h
      rain: currentData.rain?.['1h'] || 0,
      locationName: currentData.name,
      forecast: dailyForecast
    };
  } catch (error) {
    console.error('Weather service error, falling back to mock:', error);
    return MOCK_WEATHER;
  }
}

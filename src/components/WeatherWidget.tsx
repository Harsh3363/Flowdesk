import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Thermometer, Droplets, Wind, MapPin, RefreshCw } from "lucide-react";

interface WeatherWidgetProps {
    title?: string;
    city?: string;
}

interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    isDay: boolean;
}

// Open-Meteo weather codes mapping
function getWeatherInfo(code: number, isDay: boolean): { icon: JSX.Element; condition: string } {
    if (code === 0) return { icon: <Sun className="h-16 w-16 text-yellow-400" />, condition: "Clear sky" };
    if (code <= 3) return { icon: <Cloud className="h-16 w-16 text-gray-400" />, condition: "Partly cloudy" };
    if (code <= 49) return { icon: <Cloud className="h-16 w-16 text-gray-500" />, condition: "Foggy" };
    if (code <= 69) return { icon: <CloudRain className="h-16 w-16 text-blue-400" />, condition: "Rainy" };
    if (code <= 79) return { icon: <CloudRain className="h-16 w-16 text-blue-300" />, condition: "Snowy" };
    if (code <= 99) return { icon: <CloudRain className="h-16 w-16 text-purple-400" />, condition: "Thunderstorm" };
    return { icon: isDay ? <Sun className="h-16 w-16 text-yellow-400" /> : <Cloud className="h-16 w-16 text-gray-400" />, condition: "Unknown" };
}

// Hyderabad coordinates
const CITIES: Record<string, { lat: number; lon: number }> = {
    "Hyderabad": { lat: 17.385, lon: 78.4867 },
    "Mumbai": { lat: 19.076, lon: 72.8777 },
    "Delhi": { lat: 28.6139, lon: 77.209 },
    "Bangalore": { lat: 12.9716, lon: 77.5946 },
    "Chennai": { lat: 13.0827, lon: 80.2707 },
};

export function WeatherWidget({ title = "Weather", city = "Hyderabad" }: WeatherWidgetProps): JSX.Element {
    const [selectedCity, setSelectedCity] = useState(city);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchWeather = async () => {
        setLoading(true);
        setError(null);

        const coords = CITIES[selectedCity] || CITIES["Hyderabad"];

        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day&timezone=auto`
            );

            if (!response.ok) throw new Error("Failed to fetch weather");

            const data = await response.json();

            setWeather({
                temperature: Math.round(data.current.temperature_2m),
                humidity: data.current.relative_humidity_2m,
                windSpeed: Math.round(data.current.wind_speed_10m),
                weatherCode: data.current.weather_code,
                isDay: data.current.is_day === 1,
            });
            setLastUpdated(new Date());
        } catch (err) {
            setError("Unable to fetch weather data");
            console.error("Weather fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
        // Refresh every 10 minutes
        const interval = setInterval(fetchWeather, 600000);
        return () => clearInterval(interval);
    }, [selectedCity]);

    const weatherInfo = weather ? getWeatherInfo(weather.weatherCode, weather.isDay) : null;

    return (
        <div className="rounded-xl border border-border bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 shadow-luxe">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gradient">{title}</h3>
                <button
                    onClick={fetchWeather}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* City Selector */}
            <div className="mb-6">
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background/50 backdrop-blur-sm pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                    >
                        {Object.keys(CITIES).map((cityName) => (
                            <option key={cityName} value={cityName}>
                                {cityName}, India
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Weather Display */}
            {error ? (
                <div className="text-center py-8 text-destructive">
                    <p>{error}</p>
                    <button
                        onClick={fetchWeather}
                        className="mt-2 text-sm underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            ) : loading && !weather ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Fetching weather...</p>
                </div>
            ) : weather ? (
                <>
                    <div className="text-center mb-6">
                        <div className="mb-3 flex justify-center">
                            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse-glow">
                                {weatherInfo?.icon}
                            </div>
                        </div>
                        <div className="text-5xl font-bold text-gradient mb-2">
                            {weather.temperature}°C
                        </div>
                        <div className="text-lg text-muted-foreground font-medium">
                            {weatherInfo?.condition}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
                        <div className="flex flex-col items-center p-3 rounded-lg bg-card/50 backdrop-blur-sm">
                            <Thermometer className="h-5 w-5 text-orange-400 mb-1" />
                            <span className="text-xs text-muted-foreground">Feels like</span>
                            <span className="font-semibold">{weather.temperature}°C</span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-card/50 backdrop-blur-sm">
                            <Droplets className="h-5 w-5 text-blue-400 mb-1" />
                            <span className="text-xs text-muted-foreground">Humidity</span>
                            <span className="font-semibold">{weather.humidity}%</span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-card/50 backdrop-blur-sm">
                            <Wind className="h-5 w-5 text-teal-400 mb-1" />
                            <span className="text-xs text-muted-foreground">Wind</span>
                            <span className="font-semibold">{weather.windSpeed} km/h</span>
                        </div>
                    </div>

                    {/* Last Updated */}
                    {lastUpdated && (
                        <div className="mt-4 text-xs text-center text-muted-foreground">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}

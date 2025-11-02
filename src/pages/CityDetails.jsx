import React, { useEffect, useState } from "react";
import { getForecast, getCurrent } from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function CityDetails({ cityName, onBack, units, onUnitsChange }) {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [curRes, foreRes] = await Promise.all([
          getCurrent({ city: cityName }, units),
          getForecast({ city: cityName }, units),
        ]);
        setCurrent(curRes.data);
        setForecast(foreRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [cityName, units]);

  if (loading) {
    return (
      <div className="city-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading weather details for {cityName}...</p>
      </div>
    );
  }

  if (!current || !forecast) {
    return (
      <div className="city-details-error">
        <h2>Error loading data for {cityName}</h2>
        <button className="button" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // ✅ Prepare hourly data (next 24h from forecast.list)
  const hourly = forecast.list.slice(0, 8).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temp: item.main.temp,
  }));

  // ✅ Group 5-day forecast (pick entry around 12:00 each day)
  const grouped = {};
  forecast.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  const daily = Object.keys(grouped)
    .slice(0, 5)
    .map((date) => {
      const entries = grouped[date];
      let noonEntry =
        entries.find((e) => e.dt_txt.includes("12:00:00")) ||
        entries[Math.floor(entries.length / 2)];
      return {
        date: new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        min: Math.min(...entries.map((e) => e.main.temp_min)),
        max: Math.max(...entries.map((e) => e.main.temp_max)),
        icon: noonEntry.weather[0].icon,
        desc: noonEntry.weather[0].description,
      };
    });

  return (
    <div className="city-details">
      {/* Header Section with Units Toggle */}
      <div className="city-details-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h1 className="city-details-title">{cityName}</h1>
        </div>
        
        <div className="header-right">
          <div className="current-temp-large">
            {Math.round(current.main.temp)}°
            {units === "metric" ? "C" : "F"}
          </div>
          
          {/* Units Toggle in Header */}
          <div className="header-units-toggle">
            <span className="units-label">Units:</span>
            <div className="toggle-buttons">
              <button 
                className={`toggle-btn ${units === 'metric' ? 'active' : ''}`}
                onClick={() => onUnitsChange('metric')}
              >
                °C
              </button>
              <button 
                className={`toggle-btn ${units === 'imperial' ? 'active' : ''}`}
                onClick={() => onUnitsChange('imperial')}
              >
                °F
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Weather Overview */}
      <div className="current-overview">
        <div className="weather-main">
          <img
            src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
            alt={current.weather[0].description}
            className="weather-icon-large"
          />
          <div className="weather-text">
            <div className="weather-description">
              {current.weather[0].description}
            </div>
            <div className="feels-like">
              Feels like {Math.round(current.main.feels_like)}°
            </div>
          </div>
        </div>
        <div className="weather-stats">
          <div className="stat-item">
            <span className="stat-label">Humidity</span>
            <span className="stat-value">{current.main.humidity}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pressure</span>
            <span className="stat-value">{current.main.pressure} hPa</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wind</span>
            <span className="stat-value">
              {current.wind.speed} {units === "metric" ? "m/s" : "mph"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Visibility</span>
            <span className="stat-value">
              {(current.visibility / 1000).toFixed(1)} km
            </span>
          </div>
        </div>
      </div>

      {/* Full Width Charts Section */}
      <div className="charts-section-full">
        {/* Hourly Temperature Chart - Full Width */}
        <div className="chart-container-full">
          <h3 className="chart-title">24-Hour Temperature Forecast</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourly} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280' }}
                  label={{ 
                    value: `Temperature (°${units === "metric" ? "C" : "F"})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -10,
                    style: { fill: '#6B7280' }
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value) => [`${value}°${units === "metric" ? "C" : "F"}`, "Temperature"]}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#60A5FA"
                  strokeWidth={3}
                  dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Min/Max Chart - Full Width */}
        <div className="chart-container-full">
          <h3 className="chart-title">5-Day Temperature Range</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={daily} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#6B7280' }}
                  label={{ 
                    value: `Temperature (°${units === "metric" ? "C" : "F"})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -10,
                    style: { fill: '#6B7280' }
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value) => [`${value}°${units === "metric" ? "C" : "F"}`, "Temperature"]}
                />
                <Area
                  type="monotone"
                  dataKey="max"
                  stroke="#F87171"
                  fill="#F87171"
                  fillOpacity={0.3}
                  name="Max Temp"
                />
                <Area
                  type="monotone"
                  dataKey="min"
                  stroke="#34D399"
                  fill="#34D399"
                  fillOpacity={0.3}
                  name="Min Temp"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="daily-forecast">
        <h3 className="section-title">5-Day Forecast</h3>
        <div className="daily-cards">
          {daily.map((day, index) => (
            <div key={index} className="daily-card">
              <div className="day-date">{day.date}</div>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                alt={day.desc}
                className="daily-icon"
              />
              <div className="daily-temps">
                <span className="temp-high">{Math.round(day.max)}°</span>
                <span className="temp-low">{Math.round(day.min)}°</span>
              </div>
              <div className="daily-desc">{day.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
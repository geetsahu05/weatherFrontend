import React, { useEffect, useState, useCallback } from "react";
import SearchBar from "../components/SearchBar.jsx";
import CityCard from "../components/CityCard.jsx";
import CityDetails from "./CityDetails.jsx";
import { getCurrent, getFavorites, addFavorite, removeFavorite } from "../api";

export default function Dashboard() {
  const [favorites, setFavorites] = useState([]);
  const [cityDatas, setCityDatas] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [units, setUnits] = useState(localStorage.getItem("units") || "metric");
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  
  // Update localStorage when units change and refresh data
  useEffect(() => { 
    localStorage.setItem("units", units);
    // Refresh all data when units change
    if (favorites.length > 0) {
      refreshAllData();
    }
  }, [units]);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getFavorites();
      const favs = res.data || [];
      setFavorites(favs);
      
      // Auto-select first favorite if none selected
      if (favs.length > 0 && !selectedCity) {
        setSelectedCity(favs[0]);
      }
    } catch (err) { 
      setFavorites([]); 
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  // Refresh all weather data
  const refreshAllData = useCallback(async () => {
    const u = localStorage.getItem("units") || "metric";
    const allCities = [...favorites, ...Object.keys(cityDatas).filter(city => !favorites.includes(city))];
    
    const newCityDatas = {};
    for (const city of allCities) {
      try {
        const res = await getCurrent({ city }, u);
        newCityDatas[city] = res.data;
      } catch (err) {
        console.error(`Failed to fetch data for ${city}`);
      }
    }
    setCityDatas(newCityDatas);
  }, [favorites, cityDatas]);

  useEffect(() => { 
    loadFavorites(); 
  }, [loadFavorites]);

  // Load weather for favorites
  useEffect(() => {
    const fetchAll = async () => {
      const u = localStorage.getItem("units") || "metric";
      for (const city of favorites) {
        try {
          const res = await getCurrent({ city }, u);
          setCityDatas(prev => ({ ...prev, [city]: res.data }));
        } catch (err) { /* ignore per-city */ }
      }
    };
    if (favorites.length > 0) {
      fetchAll();
    }
  }, [favorites]);

  // Polling refresh every 60s
  useEffect(() => {
    const id = setInterval(async () => {
      const u = localStorage.getItem("units") || "metric";
      for (const city of favorites) {
        try {
          const res = await getCurrent({ city }, u);
          setCityDatas(prev => ({ ...prev, [city]: res.data }));
        } catch {}
      }
    }, 60000);
    return () => clearInterval(id);
  }, [favorites]);

  const onSearchSelect = async (geo) => {
    const name = `${geo.name}${geo.state ? `, ${geo.state}` : ""}, ${geo.country}`;
    try {
      const res = await getCurrent({ lat: geo.lat, lon: geo.lon }, localStorage.getItem("units") || "metric");
      setCityDatas(prev => ({ ...prev, [name]: res.data }));
      setSelectedCity(name);
      setShowSearch(false);
      
      // Add to favorites automatically or just show in recent
      if (!favorites.includes(name)) {
        try {
          const favRes = await addFavorite(name);
          setFavorites(favRes.data || []);
        } catch (err) {
          console.log("Could not add to favorites");
        }
      }
    } catch (err) {
      alert("Failed to fetch weather for selected city");
    }
  };

  const onFavoriteToggle = async (city) => {
    try {
      if (favorites.includes(city)) {
        const res = await removeFavorite(city);
        const updatedFavorites = res.data || [];
        setFavorites(updatedFavorites);
        
        // If the removed city was selected, select another favorite or clear
        if (selectedCity === city) {
          setSelectedCity(updatedFavorites.length > 0 ? updatedFavorites[0] : null);
        }
      } else {
        const res = await addFavorite(city);
        setFavorites(res.data || []);
      }
    } catch (err) {
      alert("Favorite action failed");
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowSearch(false);
  };

  const clearRecentCities = () => {
    setCityDatas({});
    if (selectedCity && !favorites.includes(selectedCity)) {
      setSelectedCity(favorites.length > 0 ? favorites[0] : null);
    }
  };

  const handleRefreshData = () => {
    refreshAllData();
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Weather App</h2>
          <div className="sidebar-controls">
            <button 
              className={`search-toggle-btn ${showSearch ? 'active' : ''}`}
              onClick={() => setShowSearch(!showSearch)}
              title="Search Cities"
            >
              🔍
            </button>
            <button 
              className="refresh-btn"
              onClick={handleRefreshData}
              title="Refresh All Data"
            >
              ↻
            </button>
          </div>
        </div>

        {/* Units Toggle - Moved to top for better visibility */}
        <div className="units-section">
          <div className="units-toggle">
            <span className="units-label">Temperature Units:</span>
            <div className="toggle-buttons">
              <button 
                className={`toggle-btn ${units === 'metric' ? 'active' : ''}`}
                onClick={() => setUnits('metric')}
              >
                °C (Metric)
              </button>
              <button 
                className={`toggle-btn ${units === 'imperial' ? 'active' : ''}`}
                onClick={() => setUnits('imperial')}
              >
                °F (Imperial)
              </button>
            </div>
          </div>
        </div>

        {/* Search Section - Shows when search is active */}
        {showSearch && (
          <div className="sidebar-search">
            <SearchBar onSelect={onSearchSelect} />
          </div>
        )}

        {/* Favorites Section */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">⭐ Favorite Cities</span>
            <span className="sidebar-badge">{favorites.length}</span>
          </div>

          {loading ? (
            <div className="sidebar-loading">
              <div className="loading-spinner small"></div>
              <span>Loading...</span>
            </div>
          ) : favorites.length === 0 ? (
            <div className="sidebar-empty">
              <span>No favorites yet</span>
              <button 
                className="text-button"
                onClick={() => setShowSearch(true)}
              >
                Add cities
              </button>
            </div>
          ) : (
            <div className="favorites-list">
              {favorites.map(city => (
                <div 
                  key={city} 
                  className={`favorite-item ${selectedCity === city ? 'active' : ''}`}
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="favorite-info">
                    <span className="favorite-name">{city}</span>
                    {cityDatas[city] && (
                      <span className="favorite-temp">
                        {Math.round(cityDatas[city].main?.temp)}°
                        {units === "metric" ? "C" : "F"}
                      </span>
                    )}
                  </div>
                  <button 
                    className="favorite-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavoriteToggle(city);
                    }}
                    title="Remove from favorites"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Cities Section */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">🕒 Recent Cities</span>
            {Object.keys(cityDatas).length > 0 && (
              <button 
                className="clear-recent"
                onClick={clearRecentCities}
                title="Clear all recent cities"
              >
                🗑️
              </button>
            )}
          </div>

          {Object.keys(cityDatas).length === 0 ? (
            <div className="sidebar-empty">
              <span>No recent cities</span>
            </div>
          ) : (
            <div className="recent-list">
              {Object.entries(cityDatas)
                .filter(([name]) => !favorites.includes(name))
                .map(([name, data]) => (
                  <div 
                    key={name} 
                    className={`recent-item ${selectedCity === name ? 'active' : ''}`}
                    onClick={() => handleCitySelect(name)}
                  >
                    <div className="recent-info">
                      <span className="recent-name">{name}</span>
                      <span className="recent-temp">
                        {Math.round(data.main?.temp)}°
                        {units === "metric" ? "C" : "F"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {selectedCity ? (
          <div className="city-details-container">
            <CityDetails 
              cityName={selectedCity} 
              onBack={() => setSelectedCity(null)}
              units={units}
              onUnitsChange={setUnits}
            />
          </div>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h1>Welcome to Weather Dashboard</h1>
              <p>Select a city from the sidebar or use the search to get started</p>
              <button 
                className="button primary"
                onClick={() => setShowSearch(true)}
              >
                🔍 Search Cities
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import CityDetails from "./pages/CityDetails.jsx";
import Settings from "./components/Settings.jsx";

export default function App(){
  return (
    <BrowserRouter>
      <div className="app">
        <div className="header">
          <h1>Weather Analytics</h1>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Link to="/" className="button">Home</Link>
            <Settings />
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/city/:cityName" element={<CityDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

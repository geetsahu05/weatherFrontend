import React from "react";
import { useNavigate } from "react-router-dom";

export default function CityCard({ cityName, data, onFavoriteToggle, isFavorite, units }) {
  const nav = useNavigate();
  if (!data) return <div className="card">Loading...</div>;
  const temp = Math.round(data.main.temp);
  const icon = data.weather?.[0]?.icon;
  const cond = data.weather?.[0]?.main;
  return (
    <div className="card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h3 style={{margin:0}}>{cityName}</h3>
          <div className="small">{cond}</div>
        </div>
        <div className="center">
          {icon && <img src={`http://openweathermap.org/img/wn/${icon}@2x.png`} alt="" style={{width:50}} />}
          <div style={{fontSize:22}}>{temp}°{units==="metric"?"C":"F"}</div>
        </div>
      </div>

      <div className="small" style={{marginTop:8}}>
        Humidity: {data.main.humidity}% • Wind: {data.wind.speed} {units==="metric"?"m/s":"mph"}
      </div>

      <div style={{marginTop:8,display:"flex",gap:8}}>
        <button className="button" onClick={()=>nav(`/city/${encodeURIComponent(cityName)}`)}>Details</button>
        <button className="button" style={{background:isFavorite?"#ef4444":"#2563eb"}} onClick={()=>onFavoriteToggle(cityName)}>
          {isFavorite?"Unfavorite":"Favorite"}
        </button>
      </div>
    </div>
  );
}

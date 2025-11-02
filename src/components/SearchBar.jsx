import React, { useState, useEffect } from "react";
import { geocode } from "../api";

export default function SearchBar({ onSelect }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (!q) { setResults([]); return; }
    const id = setTimeout(async () => {
      try {
        const res = await geocode(q);
        setResults(res.data || []);
      } catch (err) {
        setResults([]);
      }
    }, 300);
    return ()=>clearTimeout(id);
  }, [q]);

  return (
    <div style={{ position:"relative" }}>
      <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search city (autocomplete)" />
      {results.length>0 && (
        <div className="card" style={{ position:"absolute", zIndex:50, width:"100%" }}>
          {results.map((r, idx)=>(
            <div key={idx} style={{ padding:8, cursor:"pointer" }} onClick={()=>{ onSelect(r); setQ(""); setResults([]); }}>
              <div style={{ fontWeight:600 }}>{r.name}{r.state?`, ${r.state}`:""}, {r.country}</div>
              <div className="small">Lat: {r.lat.toFixed(2)}, Lon: {r.lon.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

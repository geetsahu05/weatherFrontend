import React, { useState, useEffect } from "react";

export default function Settings(){
  const [units, setUnits] = useState(localStorage.getItem("units") || "metric");
  useEffect(()=> localStorage.setItem("units", units),[units]);
  return (
    <div className="settings">
    </div>
  );
}

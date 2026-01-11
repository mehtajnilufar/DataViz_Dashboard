// KPICards.js
import React, { useMemo } from "react";

export default function KPICards({ data }) {
  const stats = useMemo(() => {
    const countries = new Set();
    const sectors = new Set();
    let maxIntensity = 0;
    data.forEach(d => {
      if (d.country) countries.add(d.country);
      if (d.sector) sectors.add(d.sector);
      const intensity = Number(d.intensity) || 0;
      if (intensity > maxIntensity) maxIntensity = intensity;
    });
    return {
      uniqueCountries: countries.size,
      uniqueSectors: sectors.size,
      maxIntensity: maxIntensity
    };
  }, [data]);

  return (
    <div className="card-row">
      <div className="kpi-card">
        <div className="kpi-number">{stats.uniqueCountries}</div>
        <div className="kpi-label">Unique Countries</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-number">{stats.uniqueSectors}</div>
        <div className="kpi-label">Unique Sectors</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-number">{stats.maxIntensity}</div>
        <div className="kpi-label">Max Intensity</div>
      </div>
    </div>
  );
}

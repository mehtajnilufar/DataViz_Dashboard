import React, { useEffect, useState } from "react";

const normalize = (v) => {
  if (v === null || v === undefined) return "Unknown";
  const s = String(v).trim();
  return s === "" ? "Unknown" : s;
};

const Filters = () => {
  const [data, setData] = useState([]);

  // All filters
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedPEST, setSelectedPEST] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");

  const [filteredData, setFilteredData] = useState([]);

  // Load data
  useEffect(() => {
    fetch("http://localhost:8000/data")
      .then((res) => res.json())
      .then((json) => {
        const d = (json.data || []).map((item) => ({
          ...item,
          _end_year: normalize(item.end_year),
          _topic: normalize(item.topic),
          _sector: normalize(item.sector),
          _region: normalize(item.region),
          _country: normalize(item.country),
          _city: normalize(item.city),
          _pestle: normalize(item.pestle),
          _source: normalize(item.source),
        }));
        setData(d);
        setFilteredData(d);
      })
      .catch(() => {
        setData([]);
        setFilteredData([]);
      });
  }, []);

  // dropdown values
  const endYears = [...new Set(data.map((i) => i._end_year))].sort();
  const topics = [...new Set(data.map((i) => i._topic))].sort();
  const sectors = [...new Set(data.map((i) => i._sector))].sort();
  const regions = [...new Set(data.map((i) => i._region))].sort();
  const countries = [...new Set(data.map((i) => i._country))].sort();
  const cities = [...new Set(data.map((i) => i._city))].sort();
  const pests = [...new Set(data.map((i) => i._pestle))].sort();
  const sources = [...new Set(data.map((i) => i._source))].sort();

  // main filtering logic
  const applyFilters = (
    year,
    topic,
    sector,
    region,
    country,
    city,
    pest,
    source
  ) => {
    let filtered = data;

    if (year !== "All") filtered = filtered.filter((i) => i._end_year === year);
    if (topic !== "All") filtered = filtered.filter((i) => i._topic === topic);
    if (sector !== "All") filtered = filtered.filter((i) => i._sector === sector);
    if (region !== "All") filtered = filtered.filter((i) => i._region === region);
    if (country !== "All")
      filtered = filtered.filter((i) => i._country === country);
    if (city !== "All") filtered = filtered.filter((i) => i._city === city);
    if (pest !== "All") filtered = filtered.filter((i) => i._pestle === pest);
    if (source !== "All")
      filtered = filtered.filter((i) => i._source === source);

    setFilteredData(filtered);
  };

  // handlers
  const handleYear = (e) => {
    const v = e.target.value;
    setSelectedYear(v);
    applyFilters(
      v,
      selectedTopic,
      selectedSector,
      selectedRegion,
      selectedCountry,
      selectedCity,
      selectedPEST,
      selectedSource
    );
  };

  const handleTopic = (e) => {
    const v = e.target.value;
    setSelectedTopic(v);
    applyFilters(
      selectedYear,
      v,
      selectedSector,
      selectedRegion,
      selectedCountry,
      selectedCity,
      selectedPEST,
      selectedSource
    );
  };

  const handleSector = (e) => {
    const v = e.target.value;
    setSelectedSector(v);
    applyFilters(
      selectedYear,
      selectedTopic,
      v,
      selectedRegion,
      selectedCountry,
      selectedCity,
      selectedPEST,
      selectedSource
    );
  };

  const handleRegion = (e) => {
    const v = e.target.value;
    setSelectedRegion(v);
    applyFilters(
      selectedYear,
      selectedTopic,
      selectedSector,
      v,
      selectedCountry,
      selectedCity,
      selectedPEST,
      selectedSource
    );
  };

  const handleCountry = (e) => {
    const v = e.target.value;
    setSelectedCountry(v);
    applyFilters(
      selectedYear,
      selectedTopic,
      selectedSector,
      selectedRegion,
      v,
      selectedCity,
      selectedPEST,
      selectedSource
    );
  };

  const handleCity = (e) => {
    const v = e.target.value;
    setSelectedCity(v);
    applyFilters(
      selectedYear,
      selectedTopic,
      selectedSector,
      selectedRegion,
      selectedCountry,
      v,
      selectedPEST,
      selectedSource
    );
  };

  const handlePEST = (e) => {
    const v = e.target.value;
    setSelectedPEST(v);
    applyFilters(
      selectedYear,
      selectedTopic,
      selectedSector,
      selectedRegion,
      selectedCountry,
      selectedCity,
      v,
      selectedSource
    );
  };

  const handleSource = (e) => {
    const v = e.target.value;
    setSelectedSource(v);
    applyFilters(
      selectedYear,
      selectedTopic,
      selectedSector,
      selectedRegion,
      selectedCountry,
      selectedCity,
      selectedPEST,
      v
    );
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Filters</h1>

      {/* All dropdowns */}
      <Filter label="End Year" options={endYears} value={selectedYear} onChange={handleYear} />
      <Filter label="Topic" options={topics} value={selectedTopic} onChange={handleTopic} />
      <Filter label="Sector" options={sectors} value={selectedSector} onChange={handleSector} />
      <Filter label="Region" options={regions} value={selectedRegion} onChange={handleRegion} />
      <Filter label="Country" options={countries} value={selectedCountry} onChange={handleCountry} />
      <Filter label="City" options={cities} value={selectedCity} onChange={handleCity} />
      <Filter label="PEST" options={pests} value={selectedPEST} onChange={handlePEST} />
      <Filter label="Source" options={sources} value={selectedSource} onChange={handleSource} />

      <h3>Filtered Results: {filteredData.length}</h3>
    </div>
  );
};

// Reusable dropdown component
const Filter = ({ label, options, value, onChange }) => (
  <div style={{ marginBottom: "20px" }}>
    <label>{label} Filter: </label>
    <select value={value} onChange={onChange}>
      <option value="All">All</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default Filters;

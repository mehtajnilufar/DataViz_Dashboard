// IntegratedDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

/*
  Integrated Dashboard:
  - Fetches once from /data
  - All filters (year, topic, sector, region, country, city, pestle, source)
  - Search (keyword in title/insight)
  - Charts update with filtered+searched data
  - Table updates with filtered+searched data
  - Export CSV for current filtered dataset
*/

const normalize = (v) => {
  if (v === null || v === undefined) return "Unknown";
  const s = String(v).trim();
  return s === "" ? "Unknown" : s;
};

const smallStyle = { color: "#bbb", marginTop: 6 };

export default function IntegratedDashboard() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [year, setYear] = useState("All");
  const [topic, setTopic] = useState("All");
  const [sector, setSector] = useState("All");
  const [region, setRegion] = useState("All");
  const [country, setCountry] = useState("All");
  const [city, setCity] = useState("All");
  const [pestle, setPestle] = useState("All");
  const [source, setSource] = useState("All");

  // Search
  const [q, setQ] = useState("");

  // Pagination for table
  const [page, setPage] = useState(1);
  const ROWS = 20;

  // Fetch + normalize once
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/data")
      .then((r) => r.json())
      .then((j) => {
        const data = (j.data || []).map((it) => ({
          ...it,
          _end_year: normalize(it.end_year),
          _topic: normalize(it.topic),
          _sector: normalize(it.sector),
          _region: normalize(it.region),
          _country: normalize(it.country),
          _city: normalize(it.city),
          _pestle: normalize(it.pestle),
          _source: normalize(it.source),
          // helpful search string
          _search: ((it.title || "") + " " + (it.insight || "")).toLowerCase(),
        }));
        setAllData(data);
      })
      .catch(() => setAllData([]))
      .finally(() => setLoading(false));
  }, []);

  // Unique dropdown options
  const opts = useMemo(() => {
    const years = new Set();
    const topics = new Set();
    const sectors = new Set();
    const regions = new Set();
    const countries = new Set();
    const cities = new Set();
    const pests = new Set();
    const sources = new Set();

    allData.forEach((d) => {
      years.add(d._end_year);
      topics.add(d._topic);
      sectors.add(d._sector);
      regions.add(d._region);
      countries.add(d._country);
      cities.add(d._city);
      pests.add(d._pestle);
      sources.add(d._source);
    });

    const sortAlpha = (arr) => Array.from(arr).sort();

    return {
      years: sortAlpha(years),
      topics: sortAlpha(topics),
      sectors: sortAlpha(sectors),
      regions: sortAlpha(regions),
      countries: sortAlpha(countries),
      cities: sortAlpha(cities),
      pests: sortAlpha(pests),
      sources: sortAlpha(sources),
    };
  }, [allData]);

  // Apply filters + search
  const filtered = useMemo(() => {
    let d = allData;
    if (year !== "All") d = d.filter((i) => i._end_year === year);
    if (topic !== "All") d = d.filter((i) => i._topic === topic);
    if (sector !== "All") d = d.filter((i) => i._sector === sector);
    if (region !== "All") d = d.filter((i) => i._region === region);
    if (country !== "All") d = d.filter((i) => i._country === country);
    if (city !== "All") d = d.filter((i) => i._city === city);
    if (pestle !== "All") d = d.filter((i) => i._pestle === pestle);
    if (source !== "All") d = d.filter((i) => i._source === source);

    const ql = q.trim().toLowerCase();
    if (ql !== "") d = d.filter((i) => i._search.includes(ql));

    return d;
  }, [allData, year, topic, sector, region, country, city, pestle, source, q]);

  // Charts data derived from filtered
  const charts = useMemo(() => {
    // Intensity by year (sum)
    const yearMap = {};
    filtered.forEach((it) => {
      const y = it._end_year || "Unknown";
      yearMap[y] = (yearMap[y] || 0) + (Number(it.intensity) || 0);
    });
    const yearLabels = Object.keys(yearMap).sort();
    const intensityDataset = {
      labels: yearLabels,
      datasets: [
        {
          label: "Intensity by Year",
          data: yearLabels.map((y) => yearMap[y]),
          borderColor: "cyan",
          backgroundColor: "rgba(0,255,255,0.12)",
        },
      ],
    };

    // Likelihood counts
    const lkMap = {};
    filtered.forEach((it) => {
      const lk = String(it.likelihood || "Unknown");
      lkMap[lk] = (lkMap[lk] || 0) + 1;
    });
    const lkLabels = Object.keys(lkMap).sort();
    const likelihoodDataset = {
      labels: lkLabels,
      datasets: [
        { label: "Likelihood count", data: lkLabels.map((l) => lkMap[l]) },
      ],
    };

    // Topic pie
    const topicMap = {};
    filtered.forEach((it) => {
      const t = it._topic || "Unknown";
      topicMap[t] = (topicMap[t] || 0) + 1;
    });
    const topicLabels = Object.keys(topicMap).sort();
    const topicDataset = {
      labels: topicLabels,
      datasets: [{ data: topicLabels.map((l) => topicMap[l]) }],
    };

    // Region doughnut
    const regionMap = {};
    filtered.forEach((it) => {
      const r = it._region || "Unknown";
      regionMap[r] = (regionMap[r] || 0) + 1;
    });
    const regionLabels = Object.keys(regionMap).sort();
    const regionDataset = {
      labels: regionLabels,
      datasets: [{ data: regionLabels.map((l) => regionMap[l]) }],
    };

    return {
      intensityDataset,
      likelihoodDataset,
      topicDataset,
      regionDataset,
    };
  }, [filtered]);

  // Table pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS));
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  const pageData = filtered.slice((page - 1) * ROWS, page * ROWS);

  // Export CSV
  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = [
      "title",
      "sector",
      "country",
      "region",
      "end_year",
      "intensity",
      "likelihood",
      "pestle",
      "source",
    ];
    const rows = filtered.map((r) =>
      headers.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Integrated Dashboard</h1>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Left column: filters */}
        <div style={{ width: 320 }}>
          <div style={{ padding: 16, background: "#0f0f0f", borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Filters & Search</h3>

            <label style={{ display: "block", marginTop: 8 }}>
              End Year:
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {opts.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginTop: 8 }}>
              Topic:
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {opts.topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginTop: 8 }}>
              Sector:
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {opts.sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginTop: 8 }}>
              Region:
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {opts.regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginTop: 8 }}>
              Country:
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {opts.countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginTop: 8 }}>
              City:
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {opts.cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginTop: 8 }}>
              PEST:
              <select
                value={pestle}
                onChange={(e) => setPestle(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {opts.pests.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block", marginTop: 8, marginBottom: 12 }}>
              Source:
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={selectStyle}
              >
                <option value="All">All</option>
                {opts.sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ marginTop: 8 }}>
              <input
                placeholder="Search title / insight..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #333",
                  background: "#0b0b0b",
                  color: "white",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => {
                // reset
                setYear("All"); setTopic("All"); setSector("All"); setRegion("All");
                setCountry("All"); setCity("All"); setPestle("All"); setSource("All");
                setQ(""); setPage(1);
              }} style={btnStyle}>Reset</button>

              <button onClick={exportCSV} style={{ ...btnStyle, background: "#0b6", color: "#000" }}>
                Export CSV ({filtered.length})
              </button>
            </div>
          </div>
        </div>

        {/* Right column: charts + table */}
        <div style={{ flex: 1 }}>
          {/* Top KPIs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <KPI title="Records" value={filtered.length} />
            <KPI title="Unique Countries" value={new Set(filtered.map(i => i._country)).size} />
            <KPI title="Unique Sectors" value={new Set(filtered.map(i => i._sector)).size} />
            <KPI title="Max Intensity" value={Math.max(0, ...filtered.map(i => Number(i.intensity) || 0))} />
          </div>

          {/* Charts */}
          <div style={{ background: "#0f0f0f", padding: 18, borderRadius: 8 }}>
            <h2 style={{ marginTop: 0 }}>Charts</h2>

            <div style={{ marginBottom: 28 }}>
              <h3>Intensity by Year</h3>
              <Line data={charts.intensityDataset} />
            </div>

            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h3>Likelihood Distribution</h3>
                <Bar data={charts.likelihoodDataset} />
              </div>

              <div style={{ width: 320 }}>
                <h3>Topic Breakdown</h3>
                <Pie data={charts.topicDataset} />
                <h3 style={{ marginTop: 18 }}>Region Distribution</h3>
                <Doughnut data={charts.regionDataset} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "#0f0f0f", padding: 18, borderRadius: 8, marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>Data Table</h2>
            <p style={smallStyle}>Showing page {page} of {pageCount}</p>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#ddd" }}>
                  <th style={thStyle}>Title / Insight</th>
                  <th style={thStyle}>Sector</th>
                  <th style={thStyle}>Country</th>
                  <th style={thStyle}>Intensity</th>
                  <th style={thStyle}>Likelihood</th>
                  <th style={thStyle}>Year</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: "10px 8px", maxWidth: 600 }}>{r.title || r.insight}</td>
                    <td style={cellStyle}>{r._sector}</td>
                    <td style={cellStyle}>{r._country}</td>
                    <td style={cellStyle}>{r.intensity}</td>
                    <td style={cellStyle}>{r.likelihood}</td>
                    <td style={cellStyle}>{r._end_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} style={btnStyle}>Previous</button>
              <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} style={btnStyle}>Next</button>
              <div style={{ marginLeft: 12 }}>{filtered.length} records</div>
            </div>
          </div>
        </div>
      </div>

      {loading && <div style={{ position: "fixed", left: 20, bottom: 20, color: "white" }}>Loading data...</div>}
    </div>
  );
}

/* small UI components & styles */
const KPI = ({ title, value }) => (
  <div style={{
    background: "#0b0b0b",
    padding: 16,
    borderRadius: 8,
    minWidth: 160,
    textAlign: "center"
  }}>
    <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    <div style={{ color: "#bbb", marginTop: 6 }}>{title}</div>
  </div>
);

const selectStyle = {
  width: "100%",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#0b0b0b",
  color: "white"
};

const btnStyle = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#222",
  color: "white",
  cursor: "pointer"
};

const thStyle = { padding: "8px 6px", color: "#ddd" };
const cellStyle = { padding: "10px 6px", color: "#ddd", verticalAlign: "top", maxWidth: 160, whiteSpace: "normal" };

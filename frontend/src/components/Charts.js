import React, { useEffect, useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
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

const Charts = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/data")
      .then((res) => res.json())
      .then((json) => setData(json.data || []));
  }, []);

  // ---------------------------
  // Intensity by Year
  // ---------------------------
  const yearMap = {};
  data.forEach((item) => {
    const year = item.start_year || item.end_year || "Unknown";
    if (!yearMap[year]) yearMap[year] = 0;
    yearMap[year] += item.intensity || 0;
  });

  const intensityData = {
    labels: Object.keys(yearMap),
    datasets: [
      {
        label: "Intensity by Year",
        data: Object.values(yearMap),
        borderColor: "cyan",
        backgroundColor: "rgba(0,255,255,0.3)"
      }
    ]
  };

  // ---------------------------
  // Likelihood
  // ---------------------------
  const likelihoodCounts = {};
  data.forEach((item) => {
    const lk = item.likelihood;
    if (!likelihoodCounts[lk]) likelihoodCounts[lk] = 0;
    likelihoodCounts[lk] += 1;
  });

  const likelihoodData = {
    labels: Object.keys(likelihoodCounts),
    datasets: [
      {
        label: "Likelihood Count",
        data: Object.values(likelihoodCounts),
        backgroundColor: "orange"
      }
    ]
  };

  // ---------------------------
  // Topic Breakdown
  // ---------------------------
  const topicCounts = {};
  data.forEach((item) => {
    const t = item.topic || "Unknown";
    if (!topicCounts[t]) topicCounts[t] = 0;
    topicCounts[t] += 1;
  });

  const topicData = {
    labels: Object.keys(topicCounts),
    datasets: [
      {
        label: "Topics",
        data: Object.values(topicCounts),
        backgroundColor: [
          "red",
          "blue",
          "green",
          "yellow",
          "purple",
          "pink",
          "cyan",
          "orange"
        ]
      }
    ]
  };

  // ---------------------------
  // Region Breakdown
  // ---------------------------
  const regionCounts = {};
  data.forEach((item) => {
    const r = item.region || "Unknown";
    if (!regionCounts[r]) regionCounts[r] = 0;
    regionCounts[r] += 1;
  });

  const regionData = {
    labels: Object.keys(regionCounts),
    datasets: [
      {
        data: Object.values(regionCounts),
        backgroundColor: [
          "cyan",
          "magenta",
          "yellow",
          "lime",
          "orange",
          "purple",
          "pink"
        ]
      }
    ]
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Charts Dashboard</h1>

      <div style={{ width: "70%", marginBottom: "40px" }}>
        <h2>Intensity by Year</h2>
        <Line data={intensityData} />
      </div>

      <div style={{ width: "70%", marginBottom: "40px" }}>
        <h2>Likelihood Distribution</h2>
        <Bar data={likelihoodData} />
      </div>

      <div style={{ width: "40%", marginBottom: "40px" }}>
        <h2>Topic Breakdown</h2>
        <Pie data={topicData} />
      </div>

      <div style={{ width: "40%", marginBottom: "40px" }}>
        <h2>Region-wise Distribution</h2>
        <Doughnut data={regionData} />
      </div>
    </div>
  );
};

export default Charts;

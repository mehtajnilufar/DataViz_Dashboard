import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Charts from "./components/Charts";
import IntegratedDashboard from "./components/IntegratedDashboard";
import DataTable from "./components/DataTable";
import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/data")
      .then(res => res.json())
      .then(json => setData(json.data || []));
  }, []);

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, padding: "25px", marginLeft: "250px" }}>
          <Routes>
            <Route path="/" element={<Overview data={data} />} />
            <Route path="/overview" element={<Overview data={data} />} />
            <Route path="/charts" element={<Charts data={data} />} />
            <Route path="/filters" element={<IntegratedDashboard />} />

            {/* FIXED: DataTable now receives data */}
            <Route path="/data-table" element={<DataTable data={data} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

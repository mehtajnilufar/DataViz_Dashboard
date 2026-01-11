// DataTable.js
import React from "react";

const DataTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        <h2>Data Table</h2>
        <p>No data available.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "white" }}>Data Table</h2>
      <p style={{ color: "white" }}>Total Records: {data.length}</p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          color: "white",
        }}
      >
        <thead>
          <tr style={{ background: "#222" }}>
            <th style={th}>Title</th>
            <th style={th}>Sector</th>
            <th style={th}>Country</th>
            <th style={th}>Intensity</th>
            <th style={th}>Likelihood</th>
            <th style={th}>Year</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={index} style={tr}>
              <td style={td}>{item.title || "-"}</td>
              <td style={td}>{item.sector || "-"}</td>
              <td style={td}>{item.country || "-"}</td>
              <td style={td}>{item.intensity || "-"}</td>
              <td style={td}>{item.likelihood || "-"}</td>
              <td style={td}>{item.end_year || "Unknown"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const th = {
  border: "1px solid #444",
  padding: "10px",
  textAlign: "left",
};

const td = {
  border: "1px solid #444",
  padding: "10px",
};

const tr = {
  background: "#111",
};

export default DataTable;

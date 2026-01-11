import React, { useEffect, useState } from "react";

export default function Overview() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/data")
      .then((res) => res.json())
      .then((json) => setData(json.data || []));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Overview</h2>

      <p style={{ color: "#bbb" }}>
        Total records: {data.length}
      </p>

      <p style={{ color: "#bbb" }}>
        Use the Filters page to narrow data. Charts show insights.
      </p>
    </div>
  );
}

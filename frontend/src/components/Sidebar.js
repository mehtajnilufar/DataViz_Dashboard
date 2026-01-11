import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Blackcoffer</h2>

      <ul>
        <li>
          <Link to="/">Overview</Link>
        </li>
        <li>
          <Link to="/charts">Charts</Link>
        </li>
        <li>
          <Link to="/filters">Filters</Link>
        </li>
        <li>
          <Link to="/data-table">Data Table</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

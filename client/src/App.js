import { useState } from "react";
import "./App.css";
import Transactions from "./components/Transactions";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";

function App() {
  const [month, setMonth] = useState("March");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return (
    <div className="app">
      <h2 className="app-title">Transactions Dashboard</h2>
      <div className="app-select-container">
        <label htmlFor="month" className="app-label">Select Month: </label>
        <select
          id="month"
          className="app-select"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <Transactions month={month} />
      <BarChart month={month} />
      <PieChart month={month} />
    </div>
  );
}

export default App;

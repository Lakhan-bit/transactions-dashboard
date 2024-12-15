import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import '../charts.css';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Registering required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ month }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchPieData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/pie-chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month }),
        });
        const result = await response.json();
        if (result?.success === true) {
          setData(result?.data);
        }
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    };

    fetchPieData();
  }, [month]);

  if (!data) return <p className="loading-text">Loading Pie Chart...</p>;

  const chartData = {
    labels: data?.map((item) => item._id),
    datasets: [
      {
        label: "Category Distribution",
        data: data?.map((item) => item.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          font: {
            size: 14,
          },
          color: "#333",
        },
      },
      tooltip: {
        backgroundColor: "#f5f5f5",
        bodyColor: "#333",
        titleColor: "#000",
        titleFont: { weight: "bold" },
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw} items`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-container pie-chart">
      <h2 className="chart-title">Pie Chart- {month}</h2>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;

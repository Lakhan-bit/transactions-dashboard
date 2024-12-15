import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import '../charts.css';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// Register required components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = ({ month }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchBarData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/bar-chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month }),
        });
        const result = await response.json();
        if (result.success === true) {
          setData(result?.data);
        }
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      }
    };

    fetchBarData();
  }, [month]);

  if (!data) return <p className="loading-text">Loading Bar Chart...</p>;

  const chartData = {
    labels: data?.map((item) => item?.range),
    datasets: [
      {
        label: "Number of Items",
        data: data?.map((item) => item?.count),
        backgroundColor: data.map(() => "rgba(54, 162, 235, 0.6)"),
        borderColor: data.map(() => "rgba(54, 162, 235, 1)"),
        borderWidth: 2,
        borderRadius: 5,
        barPercentage: 0.8,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#555",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        bodyColor: "#fff",
        titleColor: "#fff",
        borderColor: "#36A2EB",
        borderWidth: 1,
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw} items`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Items",
          color: "#333",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(200, 200, 200, 0.3)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Price Ranges",
          color: "#333",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(200, 200, 200, 0.3)",
        },
      },
    },
  };

  return (
    <div className="chart-container bar-chart">
      <h2 className="chart-title">Bar Chart- {month}</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;

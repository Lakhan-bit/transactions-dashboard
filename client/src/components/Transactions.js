import React, { useEffect, useState } from "react";
import "../Transactions.css";

const Transactions = ({ month }) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          page,
          perPage: 10,
          search: debouncedSearch,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setTransactions(result.data);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/statistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      const result = await response.json();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [month, page, debouncedSearch]);

  useEffect(() => {
    fetchStatistics();
  }, [month]);

  return (
    <div className="transactions">
      <div className="transactions-search">
        <input
          type="text"
          className="transactions-search-input"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction._id}</td>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>${transaction.price.toFixed(2)}</td>
                <td>{transaction.category}</td>
                <td>{transaction.sold ? "Yes" : "No"}</td>
                <td>
                  <img src={transaction.image} alt="" className="transaction-image" />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-transactions">
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="transactions-pagination">
        <button
          className="pagination-button"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {page} of {totalPages}
        </span>
        <button
          className="pagination-button"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {statistics && (
        <div className="transactions-statistics">
          <div className="statistics-card">
            <h3>Total Sale Amount</h3>
            <p>${statistics[0]?.totalSale.toFixed(2)}</p>
          </div>
          <div className="statistics-card">
            <h3>Total Sold Items</h3>
            <p>{statistics[0]?.sold}</p>
          </div>
          <div className="statistics-card">
            <h3>Total Unsold Items</h3>
            <p>{statistics[0]?.notSold}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;

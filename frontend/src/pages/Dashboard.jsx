import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/dashboard.css";
import SummaryCard from "../components/common/SummaryCard";
import Table from "../components/common/Table";

function Dashboard() {
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalPallets: 0,
    currentStock: 0,
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/summary");
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of items, pallets, stock and recent movements.</p>
      </div>

      <div className="stats-grid">
        <SummaryCard title="Total Items" value={summary.totalItems} />
        <SummaryCard title="Total Pallets" value={summary.totalPallets} />
        <SummaryCard title="Current Stock" value={summary.currentStock} />
      </div>

      <div className="dashboard-table-card">
        <div className="section-header">
          <h3>Recent Stock Transactions</h3>
        </div>

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <Table
            columns={[
              "Item Code",
              "Item Name",
              "Type",
              "Quantity",
              "Reference",
              "Date",
            ]}
            data={summary.recentTransactions}
            emptyMessage="No recent transactions found."
            renderRow={(tx) => (
              <tr key={tx.id}>
                <td>{tx.item_code}</td>
                <td>{tx.item_name}</td>
                <td>
                  <span
                    className={
                      tx.transaction_type === "IN"
                        ? "badge badge-in"
                        : "badge badge-out"
                    }
                  >
                    {tx.transaction_type}
                  </span>
                </td>
                <td>{tx.quantity}</td>
                <td>{tx.reference_type}</td>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
              </tr>
            )}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/inventory.css";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [stockOutForm, setStockOutForm] = useState({
    item_id: "",
    quantity: "",
    notes: "",
  });

  const fetchInventory = async () => {
    try {
      const res = await api.get("/inventory");
      setInventory(res.data.inventory || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/inventory/transactions");
      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    setStockOutForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleStockOut = async (e) => {
    e.preventDefault();

    try {
      await api.post("/inventory/stock-out", {
        item_id: Number(stockOutForm.item_id),
        quantity: Number(stockOutForm.quantity),
        notes: stockOutForm.notes,
      });

      setStockOutForm({
        item_id: "",
        quantity: "",
        notes: "",
      });

      fetchInventory();
      fetchTransactions();
      alert("Stock issued successfully");
    } catch (error) {
      console.error("Error during stock out:", error);
      alert(error.response?.data?.message || "Failed to issue stock");
    }
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h2>Inventory Management</h2>
        <p>Track current stock and issue items from inventory.</p>
      </div>

      <div className="inventory-grid">
        <div className="form-card">
          <h3>Stock Out</h3>

          <form onSubmit={handleStockOut} className="item-form">
            <select
              name="item_id"
              value={stockOutForm.item_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Item</option>
              {inventory.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_code} - {item.item_name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              name="quantity"
              placeholder="Quantity"
              value={stockOutForm.quantity}
              onChange={handleChange}
              required
            />

            <textarea
              rows="4"
              name="notes"
              placeholder="Notes (optional)"
              value={stockOutForm.notes}
              onChange={handleChange}
            />

            <button type="submit" className="primary-btn">
              Issue Stock
            </button>
          </form>
        </div>

        <div className="table-card">
          <div className="table-topbar">
            <h3>Current Inventory</h3>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      No inventory available.
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td>{item.category || "-"}</td>
                      <td>{item.unit}</td>
                      <td>{item.quantity_on_hand}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="table-card inventory-transactions-card">
        <div className="table-topbar">
          <h3>Stock Transactions</h3>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Notes</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
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
                    <td>{tx.notes || "-"}</td>
                    <td>{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
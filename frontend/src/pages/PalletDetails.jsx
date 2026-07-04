import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/pallets.css";

function PalletDetails() {
  const { id } = useParams();

  const [pallet, setPallet] = useState(null);
  const [palletItems, setPalletItems] = useState([]);
  const [allItems, setAllItems] = useState([]);

  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");

  const fetchPalletDetails = async () => {
    try {
      const res = await api.get(`/pallets/${id}`);
      setPallet(res.data.pallet);
      setPalletItems(res.data.palletItems || []);
    } catch (error) {
      console.error("Error fetching pallet details:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get("/items");
      setAllItems(res.data.items || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchPalletDetails();
    fetchItems();
  }, [id]);

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!itemId || !quantity) return;

    try {
      await api.post(`/pallets/${id}/items`, {
        item_id: Number(itemId),
        quantity: Number(quantity),
      });

      setItemId("");
      setQuantity("");
      fetchPalletDetails();
    } catch (error) {
      console.error("Error adding item to pallet:", error);
      alert(error.response?.data?.message || "Failed to add item");
    }
  };

  const handleDeletePalletItem = async (palletItemId) => {
    const confirmDelete = window.confirm("Delete this pallet item?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/pallets/${id}/items/${palletItemId}`);
      fetchPalletDetails();
    } catch (error) {
      console.error("Error deleting pallet item:", error);
      alert(error.response?.data?.message || "Failed to delete pallet item");
    }
  };

  const handleStockIn = async () => {
    const confirmAction = window.confirm(
      "Receive stock from this pallet into inventory?"
    );
    if (!confirmAction) return;

    try {
      await api.post(`/pallets/${id}/stock-in`);
      fetchPalletDetails();
      alert("Stock received successfully");
    } catch (error) {
      console.error("Error stocking in pallet:", error);
      alert(error.response?.data?.message || "Failed to stock in pallet");
    }
  };

  if (!pallet) {
    return <div className="pallets-page">Loading pallet details...</div>;
  }

  return (
    <div className="pallets-page">
      <div className="page-header pallets-header">
        <div>
          <h2>Pallet Details</h2>
          <p>
            {pallet.pallet_code} • Status:{" "}
            <strong>{pallet.status}</strong>
          </p>
        </div>

        {pallet.status !== "RECEIVED" && (
          <button className="primary-btn" onClick={handleStockIn}>
            Receive Stock
          </button>
        )}
      </div>

      {pallet.status !== "RECEIVED" && (
        <div className="form-card pallet-form-card">
          <h3>Add Item to Pallet</h3>

          <form onSubmit={handleAddItem} className="pallet-item-form">
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              required
            >
              <option value="">Select Item</option>
              {allItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_code} - {item.item_name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <button type="submit" className="primary-btn">
              Add Item
            </button>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-topbar">
          <h3>Pallet Items</h3>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {palletItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No items in this pallet.
                  </td>
                </tr>
              ) : (
                palletItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_code}</td>
                    <td>{item.item_name}</td>
                    <td>{item.category || "-"}</td>
                    <td>{item.unit}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {pallet.status !== "RECEIVED" ? (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeletePalletItem(item.id)}
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="locked-text">Locked</span>
                      )}
                    </td>
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

export default PalletDetails;
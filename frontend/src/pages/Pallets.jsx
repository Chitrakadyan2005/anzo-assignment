import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/pallets.css";

function Pallets() {
  const [pallets, setPallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPallets = async () => {
    try {
      const res = await api.get("/pallets");
      setPallets(res.data.pallets || []);
    } catch (error) {
      console.error("Error fetching pallets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPallets();
  }, []);

  const handleCreatePallet = async () => {
    try {
      await api.post("/pallets");
      fetchPallets();
    } catch (error) {
      console.error("Error creating pallet:", error);
      alert(error.response?.data?.message || "Failed to create pallet");
    }
  };

  return (
    <div className="pallets-page">
      <div className="page-header pallets-header">
        <div>
          <h2>Pallet Management</h2>
          <p>Create pallets and manage grouped incoming stock.</p>
        </div>

        <button className="primary-btn" onClick={handleCreatePallet}>
          + Create Pallet
        </button>
      </div>

      <div className="table-card">
        <div className="table-topbar">
          <h3>All Pallets</h3>
        </div>

        {loading ? (
          <p>Loading pallets...</p>
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Pallet Code</th>
                  <th>Status</th>
                  <th>Total Quantity</th>
                  <th>Item Types</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pallets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No pallets found.
                    </td>
                  </tr>
                ) : (
                  pallets.map((pallet) => (
                    <tr key={pallet.id}>
                      <td>{pallet.pallet_code}</td>
                      <td>
                        <span
                          className={
                            pallet.status === "RECEIVED"
                              ? "badge badge-received"
                              : "badge badge-open"
                          }
                        >
                          {pallet.status}
                        </span>
                      </td>
                      <td>{pallet.total_quantity}</td>
                      <td>{pallet.total_item_types}</td>
                      <td>{new Date(pallet.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => navigate(`/pallets/${pallet.id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pallets;
import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/goodsReceipts.css";

function GoodsReceipts() {
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPOItems, setSelectedPOItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    purchase_order_id: "",
    receipt_date: "",
    remarks: "",
    items: [],
  });

  const fetchInitialData = async () => {
    try {
      const [grnRes, poRes] = await Promise.all([
        api.get("/goods-receipts"),
        api.get("/purchase-orders"),
      ]);

      setGoodsReceipts(grnRes.data.goodsReceipts || []);
      setPurchaseOrders(poRes.data.purchaseOrders || []);
    } catch (error) {
      console.error("Error fetching goods receipt data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleBasicChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "purchase_order_id" && value) {
      try {
        const res = await api.get(`/purchase-orders/${value}`);
        const poItems = res.data.items || [];

        setSelectedPOItems(poItems);
        setFormData((prev) => ({
          ...prev,
          purchase_order_id: value,
          items: poItems.map((item) => ({
            purchase_order_item_id: item.id,
            item_name: item.item_name,
            item_code: item.item_code,
            pending_quantity: item.ordered_quantity - item.received_quantity,
            received_quantity: "",
          })),
        }));
      } catch (error) {
        console.error("Error fetching PO details:", error);
      }
    }
  };

  const handleGRNItemChange = (index, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index].received_quantity = value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleCreateGRN = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        purchase_order_id: Number(formData.purchase_order_id),
        receipt_date: formData.receipt_date,
        remarks: formData.remarks,
        items: formData.items
          .filter((item) => Number(item.received_quantity) > 0)
          .map((item) => ({
            purchase_order_item_id: item.purchase_order_item_id,
            received_quantity: Number(item.received_quantity),
          })),
      };

      await api.post("/goods-receipts", payload);

      setFormData({
        purchase_order_id: "",
        receipt_date: "",
        remarks: "",
        items: [],
      });
      setSelectedPOItems([]);

      fetchInitialData();
    } catch (error) {
      console.error("Error creating goods receipt:", error);
      alert(error.response?.data?.message || "Failed to create goods receipt");
    }
  };

  return (
    <div className="goods-receipts-page">
      <div className="page-header">
        <h2>Goods Receipts</h2>
        <p>Receive inventory against approved purchase orders.</p>
      </div>

      <div className="grn-form-card">
        <h3>Create Goods Receipt</h3>

        <form className="grn-form" onSubmit={handleCreateGRN}>
          <div className="grn-top-grid">
            <select
              name="purchase_order_id"
              value={formData.purchase_order_id}
              onChange={handleBasicChange}
              required
            >
              <option value="">Select Purchase Order</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.po_number} - {po.supplier_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="receipt_date"
              value={formData.receipt_date}
              onChange={handleBasicChange}
              required
            />

            <input
              type="text"
              name="remarks"
              placeholder="Remarks"
              value={formData.remarks}
              onChange={handleBasicChange}
            />
          </div>

          {formData.items.length > 0 && (
            <div className="grn-items-section">
              <h4>PO Items to Receive</h4>

              {formData.items.map((item, index) => (
                <div className="grn-item-row" key={item.purchase_order_item_id}>
                  <div className="grn-item-info">
                    <strong>{item.item_name}</strong>
                    <span>{item.item_code}</span>
                  </div>

                  <div className="pending-box">
                    Pending: {item.pending_quantity}
                  </div>

                  <input
                    type="number"
                    min="0"
                    max={item.pending_quantity}
                    placeholder="Receive Qty"
                    value={item.received_quantity}
                    onChange={(e) =>
                      handleGRNItemChange(index, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="primary-btn">
            Create Goods Receipt
          </button>
        </form>
      </div>

      <div className="grn-table-card">
        <div className="section-header">
          <h3>Goods Receipt History</h3>
        </div>

        {loading ? (
          <p>Loading goods receipts...</p>
        ) : goodsReceipts.length === 0 ? (
          <p>No goods receipts found.</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>GRN Number</th>
                <th>PO Number</th>
                <th>Receipt Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {goodsReceipts.map((grn) => (
                <tr key={grn.id}>
                  <td>{grn.grn_number}</td>
                  <td>{grn.po_number}</td>
                  <td>{new Date(grn.receipt_date).toLocaleDateString()}</td>
                  <td>{grn.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default GoodsReceipts;
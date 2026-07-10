import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/purchaseOrders.css";

function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    supplier_id: "",
    order_date: "",
    remarks: "",
    items: [{ item_id: "", ordered_quantity: "", unit_price: "" }],
  });

  const fetchInitialData = async () => {
    try {
      const [poRes, supplierRes, itemRes] = await Promise.all([
        api.get("/purchase-orders"),
        api.get("/suppliers"),
        api.get("/items"),
      ]);

      setPurchaseOrders(poRes.data.purchaseOrders || []);
      setSuppliers(supplierRes.data.suppliers || []);
      setItems(itemRes.data.items || []);
    } catch (error) {
      console.error("Error fetching purchase order page data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { item_id: "", ordered_quantity: "", unit_price: "" },
      ],
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) return;

    const updatedItems = formData.items.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        supplier_id: Number(formData.supplier_id),
        order_date: formData.order_date,
        remarks: formData.remarks,
        items: formData.items.map((item) => ({
          item_id: Number(item.item_id),
          ordered_quantity: Number(item.ordered_quantity),
          unit_price: Number(item.unit_price || 0),
        })),
      };

      await api.post("/purchase-orders", payload);

      setFormData({
        supplier_id: "",
        order_date: "",
        remarks: "",
        items: [{ item_id: "", ordered_quantity: "", unit_price: "" }],
      });

      fetchInitialData();
    } catch (error) {
      console.error("Error creating purchase order:", error);
      alert(error.response?.data?.message || "Failed to create purchase order");
    }
  };

  return (
    <div className="purchase-orders-page">
      <div className="page-header">
        <h2>Purchase Orders</h2>
        <p>Create and manage purchase orders for suppliers.</p>
      </div>

      <div className="po-form-card">
        <h3>Create Purchase Order</h3>

        <form className="po-form" onSubmit={handleCreatePO}>
          <div className="po-top-grid">
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleBasicChange}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplier_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="order_date"
              value={formData.order_date}
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

          <div className="po-items-section">
            <div className="po-items-header">
              <h4>PO Items</h4>
              <button type="button" className="secondary-btn" onClick={addItemRow}>
                + Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div className="po-item-row" key={index}>
                <select
                  value={item.item_id}
                  onChange={(e) =>
                    handleItemChange(index, "item_id", e.target.value)
                  }
                  required
                >
                  <option value="">Select Item</option>
                  {items.map((itm) => (
                    <option key={itm.id} value={itm.id}>
                      {itm.item_name} ({itm.item_code})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={item.ordered_quantity}
                  onChange={(e) =>
                    handleItemChange(index, "ordered_quantity", e.target.value)
                  }
                  required
                />

                <input
                  type="number"
                  min="0"
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onChange={(e) =>
                    handleItemChange(index, "unit_price", e.target.value)
                  }
                />

              </div>
            ))}
          </div>

          <button type="submit" className="primary-btn">
            Create Purchase Order
          </button>
        </form>
      </div>

      <div className="po-table-card">
        <div className="section-header">
          <h3>Purchase Orders</h3>
        </div>

        {loading ? (
          <p>Loading purchase orders...</p>
        ) : purchaseOrders.length === 0 ? (
          <p>No purchase orders found.</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td>{po.po_number}</td>
                  <td>{po.supplier_name}</td>
                  <td>{new Date(po.order_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`po-status-badge ${po.status.toLowerCase()}`}>
                      {po.status}
                    </span>
                  </td>
                  <td>{po.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PurchaseOrders;
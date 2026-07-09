import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/suppliers.css";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    supplier_code: "",
    supplier_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    status: "ACTIVE",
  });

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data.suppliers || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();

    try {
      await api.post("/suppliers", formData);

      setFormData({
        supplier_code: "",
        supplier_name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        status: "ACTIVE",
      });

      fetchSuppliers();
    } catch (error) {
      console.error("Error creating supplier:", error);
      alert(error.response?.data?.message || "Failed to create supplier");
    }
  };

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <h2>Suppliers</h2>
        <p>Manage supplier records for purchase orders and goods receipts.</p>
      </div>

      <div className="supplier-form-card">
        <h3>Add Supplier</h3>

        <form className="supplier-form" onSubmit={handleAddSupplier}>
          <div className="form-grid">
            <input
              type="text"
              name="supplier_code"
              placeholder="Supplier Code"
              value={formData.supplier_code}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="supplier_name"
              placeholder="Supplier Name"
              value={formData.supplier_name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="contact_person"
              placeholder="Contact Person"
              value={formData.contact_person}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <button type="submit" className="primary-btn">
            Add Supplier
          </button>
        </form>
      </div>

      <div className="supplier-table-card">
        <div className="section-header">
          <h3>Supplier List</h3>
        </div>

        {loading ? (
          <p>Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p>No suppliers found.</p>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.supplier_code}</td>
                  <td>{supplier.supplier_name}</td>
                  <td>{supplier.contact_person || "-"}</td>
                  <td>{supplier.email || "-"}</td>
                  <td>{supplier.phone || "-"}</td>
                  <td>
                    <span
                      className={
                        supplier.status === "ACTIVE"
                          ? "status-badge active"
                          : "status-badge inactive"
                      }
                    >
                      {supplier.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Suppliers;
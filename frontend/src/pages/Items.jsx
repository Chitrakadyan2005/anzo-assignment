import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/items.css";

const initialForm = {
  item_code: "",
  item_name: "",
  description: "",
  unit: "",
  category: "",
};

function Items() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    try {
      const res = await api.get("/items", {
        params: search ? { search } : {},
      });
      setItems(res.data.items || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/items/${editingId}`, formData);
      } else {
        await api.post("/items", formData);
      }

      resetForm();
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
      alert(error.response?.data?.message || "Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      item_code: item.item_code || "",
      item_name: item.item_name || "",
      description: item.description || "",
      unit: item.unit || "",
      category: item.category || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this item?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(error.response?.data?.message || "Failed to delete item");
    }
  };

  return (
    <div className="items-page">
      <div className="page-header">
        <h2>Item Management</h2>
        <p>Add, edit, search and manage warehouse items.</p>
      </div>

      <div className="item-grid">
        <div className="form-card">
          <h3>{editingId ? "Edit Item" : "Add New Item"}</h3>

          <form onSubmit={handleSubmit} className="item-form">
            <input
              type="text"
              name="item_code"
              placeholder="Item Code"
              value={formData.item_code}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="item_name"
              placeholder="Item Name"
              value={formData.item_name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
            />

            <input
              type="text"
              name="unit"
              placeholder="Unit (pcs, box, kg...)"
              value={formData.unit}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? "Update Item" : "Add Item"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="table-card">
          <div className="table-topbar">
            <h3>Items List</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Search by code, name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.item_code}</td>
                      <td>{item.item_name}</td>
                      <td>{item.category || "-"}</td>
                      <td>{item.unit}</td>
                      <td>{item.description || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Items;
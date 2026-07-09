const pool = require("../config/db");

const createSupplier = async (req, res) => {
  try {
    const {
      supplier_code,
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      status,
    } = req.body;

    if (!supplier_code || !supplier_name) {
      return res.status(400).json({
        message: "supplier_code and supplier_name are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO suppliers
       (supplier_code, supplier_name, contact_person, email, phone, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier_code,
        supplier_name,
        contact_person || null,
        email || null,
        phone || null,
        address || null,
        status || "ACTIVE",
      ]
    );

    const [rows] = await pool.query("SELECT * FROM suppliers WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      message: "Supplier created successfully",
      supplier: rows[0],
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ message: "Failed to create supplier" });
  }
};

const getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM suppliers ORDER BY created_at DESC"
    );

    res.status(200).json({ suppliers: rows });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query("SELECT * FROM suppliers WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ supplier: rows[0] });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ message: "Failed to fetch supplier" });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier_code,
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      status,
    } = req.body;

    const [existing] = await pool.query("SELECT * FROM suppliers WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await pool.query(
      `UPDATE suppliers
       SET supplier_code = ?, supplier_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, status = ?
       WHERE id = ?`,
      [
        supplier_code || existing[0].supplier_code,
        supplier_name || existing[0].supplier_name,
        contact_person ?? existing[0].contact_person,
        email ?? existing[0].email,
        phone ?? existing[0].phone,
        address ?? existing[0].address,
        status || existing[0].status,
        id,
      ]
    );

    const [updatedRows] = await pool.query(
      "SELECT * FROM suppliers WHERE id = ?",
      [id]
    );

    res.status(200).json({
      message: "Supplier updated successfully",
      supplier: updatedRows[0],
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ message: "Failed to update supplier" });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query("SELECT * FROM suppliers WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await pool.query("DELETE FROM suppliers WHERE id = ?", [id]);

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ message: "Failed to delete supplier" });
  }
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
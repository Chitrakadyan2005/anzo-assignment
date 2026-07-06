const pool = require("../config/db");

// GET all items + optional search
const getAllItems = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT id, item_code, item_name, description, unit, category, created_at, updated_at
      FROM items
    `;
    let values = [];

    if (search) {
      query += `
        WHERE item_name LIKE ? OR item_code LIKE ? OR category LIKE ?
      `;
      const searchValue = `%${search}%`;
      values = [searchValue, searchValue, searchValue];
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      count: rows.length,
      items: rows,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch items",
      error: error.message,
    });
  }
};

// GET single item
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT id, item_code, item_name, description, unit, category, created_at, updated_at
      FROM items
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      item: rows[0],
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch item",
      error: error.message,
    });
  }
};

// CREATE item
const createItem = async (req, res) => {
  try {
    const { item_code, item_name, description, unit, category } = req.body;

    if (!item_code || !item_name || !unit) {
      return res.status(400).json({
        success: false,
        message: "item_code, item_name and unit are required",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM items WHERE item_code = ?",
      [item_code]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Item code already exists",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO items (item_code, item_name, description, unit, category)
      VALUES (?, ?, ?, ?, ?)
      `,
      [item_code, item_name, description || null, unit, category || null]
    );

    const [newItem] = await pool.query(
      "SELECT * FROM items WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: newItem[0],
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create item",
      error: error.message,
    });
  }
};

// UPDATE item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_code, item_name, description, unit, category } = req.body;

    const [existingItem] = await pool.query(
      "SELECT * FROM items WHERE id = ?",
      [id]
    );

    if (existingItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (!item_code || !item_name || !unit) {
      return res.status(400).json({
        success: false,
        message: "item_code, item_name and unit are required",
      });
    }

    const [duplicateCode] = await pool.query(
      "SELECT id FROM items WHERE item_code = ? AND id != ?",
      [item_code, id]
    );

    if (duplicateCode.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Another item with this code already exists",
      });
    }

    await pool.query(
      `
      UPDATE items
      SET item_code = ?, item_name = ?, description = ?, unit = ?, category = ?
      WHERE id = ?
      `,
      [item_code, item_name, description || null, unit, category || null, id]
    );

    const [updatedItem] = await pool.query(
      "SELECT * FROM items WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item: updatedItem[0],
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update item",
      error: error.message,
    });
  }
};

// DELETE item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingItem] = await pool.query(
      "SELECT * FROM items WHERE id = ?",
      [id]
    );

    if (existingItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    await pool.query("DELETE FROM items WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
const pool = require("../config/db");

// GET current inventory
const getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        inv.id,
        inv.item_id,
        i.item_code,
        i.item_name,
        i.category,
        i.unit,
        inv.quantity_on_hand,
        inv.updated_at
      FROM inventory inv
      JOIN items i ON inv.item_id = i.id
      ORDER BY i.item_name ASC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      inventory: rows,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// STOCK OUT
const stockOut = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { item_id, quantity, notes } = req.body;

    if (!item_id || !quantity || quantity <= 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Valid item_id and quantity are required",
      });
    }

    await connection.beginTransaction();

    // Check item exists
    const [itemRows] = await connection.query(
      "SELECT id, item_name FROM items WHERE id = ?",
      [item_id]
    );

    if (itemRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check inventory row exists
    const [inventoryRows] = await connection.query(
      "SELECT id, quantity_on_hand FROM inventory WHERE item_id = ?",
      [item_id]
    );

    if (inventoryRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: "No inventory record found for this item",
      });
    }

    const currentStock = inventoryRows[0].quantity_on_hand;

    if (currentStock < quantity) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock: ${currentStock}`,
      });
    }

    // Reduce stock
    await connection.query(
      `
      UPDATE inventory
      SET quantity_on_hand = quantity_on_hand - ?
      WHERE item_id = ?
      `,
      [quantity, item_id]
    );

    // Add transaction
    await connection.query(
      `
      INSERT INTO stock_transactions
      (item_id, transaction_type, quantity, reference_type, reference_id, notes)
      VALUES (?, 'OUT', ?, 'MANUAL', NULL, ?)
      `,
      [item_id, quantity, notes || "Manual stock out"]
    );

    await connection.commit();
    connection.release();

    return res.status(200).json({
      success: true,
      message: "Stock issued successfully",
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error during stock out:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to issue stock",
      error: error.message,
    });
  }
};

// GET stock transactions
const getTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        st.id,
        st.item_id,
        i.item_code,
        i.item_name,
        st.transaction_type,
        st.quantity,
        st.reference_type,
        st.reference_id,
        st.notes,
        st.created_at
      FROM stock_transactions st
      JOIN items i ON st.item_id = i.id
      ORDER BY st.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      transactions: rows,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

module.exports = {
  getInventory,
  stockOut,
  getTransactions,
};
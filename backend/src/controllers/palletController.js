const pool = require("../config/db");
const generatePalletCode = require("../utils/palletCodeGenerator");
const { stockInPalletService } = require("../services/palletService");

// CREATE pallet
const createPallet = async (req, res) => {
  try {
    const palletCode = await generatePalletCode();

    const [result] = await pool.query(
      `
      INSERT INTO pallets (pallet_code, status)
      VALUES (?, 'OPEN')
      `,
      [palletCode]
    );

    const [newPallet] = await pool.query(
      "SELECT * FROM pallets WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Pallet created successfully",
      pallet: newPallet[0],
    });
  } catch (error) {
    console.error("Error creating pallet:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create pallet",
      error: error.message,
    });
  }
};

// GET all pallets
const getAllPallets = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.pallet_code,
        p.status,
        p.created_at,
        p.updated_at,
        COALESCE(SUM(pi.quantity), 0) AS total_quantity,
        COUNT(pi.id) AS total_item_types
      FROM pallets p
      LEFT JOIN pallet_items pi ON p.id = pi.pallet_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      pallets: rows,
    });
  } catch (error) {
    console.error("Error fetching pallets:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pallets",
      error: error.message,
    });
  }
};

// GET single pallet details
const getPalletById = async (req, res) => {
  try {
    const { id } = req.params;

    const [palletRows] = await pool.query(
      "SELECT * FROM pallets WHERE id = ?",
      [id]
    );

    if (palletRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pallet not found",
      });
    }

    const [itemRows] = await pool.query(
      `
      SELECT 
        pi.id,
        pi.pallet_id,
        pi.item_id,
        i.item_code,
        i.item_name,
        i.category,
        i.unit,
        pi.quantity,
        pi.created_at,
        pi.updated_at
      FROM pallet_items pi
      JOIN items i ON pi.item_id = i.id
      WHERE pi.pallet_id = ?
      ORDER BY pi.created_at DESC
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      pallet: palletRows[0],
      palletItems: itemRows,
    });
  } catch (error) {
    console.error("Error fetching pallet:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pallet details",
      error: error.message,
    });
  }
};

// ADD item to pallet
const addItemToPallet = async (req, res) => {
  try {
    const { palletId } = req.params;
    const { item_id, quantity } = req.body;

    if (!item_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid item_id and quantity are required",
      });
    }

    const [palletRows] = await pool.query(
      "SELECT * FROM pallets WHERE id = ?",
      [palletId]
    );

    if (palletRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pallet not found",
      });
    }

    if (palletRows[0].status === "RECEIVED") {
      return res.status(400).json({
        success: false,
        message: "Cannot add items to a received pallet",
      });
    }

    const [itemRows] = await pool.query(
      "SELECT * FROM items WHERE id = ?",
      [item_id]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const [existingPalletItem] = await pool.query(
      `
      SELECT * FROM pallet_items
      WHERE pallet_id = ? AND item_id = ?
      `,
      [palletId, item_id]
    );

    if (existingPalletItem.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This item already exists in the pallet",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO pallet_items (pallet_id, item_id, quantity)
      VALUES (?, ?, ?)
      `,
      [palletId, item_id, quantity]
    );

    const [newPalletItem] = await pool.query(
      "SELECT * FROM pallet_items WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Item added to pallet successfully",
      palletItem: newPalletItem[0],
    });
  } catch (error) {
    console.error("Error adding item to pallet:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to pallet",
      error: error.message,
    });
  }
};

// UPDATE pallet item
const updatePalletItem = async (req, res) => {
  try {
    const { palletId, palletItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const [palletRows] = await pool.query(
      "SELECT * FROM pallets WHERE id = ?",
      [palletId]
    );

    if (palletRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pallet not found",
      });
    }

    if (palletRows[0].status === "RECEIVED") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit items of a received pallet",
      });
    }

    const [palletItemRows] = await pool.query(
      `
      SELECT * FROM pallet_items
      WHERE id = ? AND pallet_id = ?
      `,
      [palletItemId, palletId]
    );

    if (palletItemRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pallet item not found",
      });
    }

    await pool.query(
      `
      UPDATE pallet_items
      SET quantity = ?
      WHERE id = ? AND pallet_id = ?
      `,
      [quantity, palletItemId, palletId]
    );

    const [updatedPalletItem] = await pool.query(
      "SELECT * FROM pallet_items WHERE id = ?",
      [palletItemId]
    );

    return res.status(200).json({
      success: true,
      message: "Pallet item updated successfully",
      palletItem: updatedPalletItem[0],
    });
  } catch (error) {
    console.error("Error updating pallet item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update pallet item",
      error: error.message,
    });
  }
};

// DELETE pallet item
const deletePalletItem = async (req, res) => {
  try {
    const { palletId, palletItemId } = req.params;

    const [palletRows] = await pool.query(
      "SELECT * FROM pallets WHERE id = ?",
      [palletId]
    );

    if (palletRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pallet not found",
      });
    }

    if (palletRows[0].status === "RECEIVED") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete items from a received pallet",
      });
    }

    const [palletItemRows] = await pool.query(
      `
      SELECT * FROM pallet_items
      WHERE id = ? AND pallet_id = ?
      `,
      [palletItemId, palletId]
    );

    if (palletItemRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Pallet item not found",
      });
    }

    await pool.query(
      "DELETE FROM pallet_items WHERE id = ? AND pallet_id = ?",
      [palletItemId, palletId]
    );

    return res.status(200).json({
      success: true,
      message: "Pallet item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pallet item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete pallet item",
      error: error.message,
    });
  }
};

// STOCK IN from pallet
const stockInFromPallet = async (req, res) => {
  try {
    const { palletId } = req.params;

    const result = await stockInPalletService(palletId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error during stock in from pallet:", error);

    const knownErrors = [
      "Pallet not found",
      "This pallet has already been received",
      "Cannot stock in an empty pallet",
    ];

    const statusCode = knownErrors.includes(error.message) ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to stock in from pallet",
    });
  }
};

module.exports = {
  createPallet,
  getAllPallets,
  getPalletById,
  addItemToPallet,
  updatePalletItem,
  deletePalletItem,
  stockInFromPallet,
};
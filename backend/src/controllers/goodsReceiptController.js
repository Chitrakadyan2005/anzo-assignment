const pool = require("../config/db");
const { receiveGoodsAgainstPO } = require("../services/grnService");

const createGoodsReceipt = async (req, res) => {
  try {
    const { purchase_order_id, receipt_date, remarks, items } = req.body;

    if (
      !purchase_order_id ||
      !receipt_date ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "purchase_order_id, receipt_date and items are required",
      });
    }

    for (const item of items) {
      if (!item.purchase_order_item_id || !item.received_quantity) {
        return res.status(400).json({
          message: "Each GRN item must have purchase_order_item_id and received_quantity",
        });
      }
    }

    const goodsReceiptId = await receiveGoodsAgainstPO({
      purchase_order_id,
      receipt_date,
      remarks,
      items,
    });

    const [grnRows] = await pool.query(
      "SELECT * FROM goods_receipts WHERE id = ?",
      [goodsReceiptId]
    );

    res.status(201).json({
      message: "Goods receipt created successfully",
      goodsReceipt: grnRows[0],
    });
  } catch (error) {
    console.error("Error creating goods receipt:", error);
    res.status(500).json({
      message: error.message || "Failed to create goods receipt",
    });
  }
};

const getAllGoodsReceipts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT gr.*, po.po_number
       FROM goods_receipts gr
       JOIN purchase_orders po ON gr.purchase_order_id = po.id
       ORDER BY gr.created_at DESC`
    );

    res.status(200).json({ goodsReceipts: rows });
  } catch (error) {
    console.error("Error fetching goods receipts:", error);
    res.status(500).json({ message: "Failed to fetch goods receipts" });
  }
};

const getGoodsReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const [grnRows] = await pool.query(
      `SELECT gr.*, po.po_number
       FROM goods_receipts gr
       JOIN purchase_orders po ON gr.purchase_order_id = po.id
       WHERE gr.id = ?`,
      [id]
    );

    if (grnRows.length === 0) {
      return res.status(404).json({ message: "Goods receipt not found" });
    }

    const [itemRows] = await pool.query(
      `SELECT gri.*, i.item_code, i.item_name
       FROM goods_receipt_items gri
       JOIN items i ON gri.item_id = i.id
       WHERE gri.goods_receipt_id = ?`,
      [id]
    );

    res.status(200).json({
      goodsReceipt: grnRows[0],
      items: itemRows,
    });
  } catch (error) {
    console.error("Error fetching goods receipt:", error);
    res.status(500).json({ message: "Failed to fetch goods receipt" });
  }
};

module.exports = {
  createGoodsReceipt,
  getAllGoodsReceipts,
  getGoodsReceiptById,
};
const pool = require("../config/db");
const {
  createPurchaseOrderWithItems,
} = require("../services/purchaseOrderService");

const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier_id, order_date, remarks, items } = req.body;

    if (!supplier_id || !order_date || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "supplier_id, order_date and at least one item are required",
      });
    }

    const [supplierRows] = await pool.query(
      "SELECT * FROM suppliers WHERE id = ?",
      [supplier_id]
    );

    if (supplierRows.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    for (const item of items) {
      if (!item.item_id || !item.ordered_quantity) {
        return res.status(400).json({
          message: "Each PO item must have item_id and ordered_quantity",
        });
      }

      const [itemRows] = await pool.query("SELECT * FROM items WHERE id = ?", [
        item.item_id,
      ]);

      if (itemRows.length === 0) {
        return res.status(404).json({
          message: `Item not found for item_id ${item.item_id}`,
        });
      }
    }

    const purchaseOrderId = await createPurchaseOrderWithItems({
      supplier_id,
      order_date,
      remarks,
      items,
    });

    const [poRows] = await pool.query(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [purchaseOrderId]
    );

    res.status(201).json({
      message: "Purchase order created successfully",
      purchaseOrder: poRows[0],
    });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({ message: "Failed to create purchase order" });
  }
};

const getAllPurchaseOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT po.*, s.supplier_name
       FROM purchase_orders po
       JOIN suppliers s ON po.supplier_id = s.id
       ORDER BY po.created_at DESC`
    );

    res.status(200).json({ purchaseOrders: rows });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({ message: "Failed to fetch purchase orders" });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [poRows] = await pool.query(
      `SELECT po.*, s.supplier_name
       FROM purchase_orders po
       JOIN suppliers s ON po.supplier_id = s.id
       WHERE po.id = ?`,
      [id]
    );

    if (poRows.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const [itemRows] = await pool.query(
      `SELECT poi.*, i.item_code, i.item_name
       FROM purchase_order_items poi
       JOIN items i ON poi.item_id = i.id
       WHERE poi.purchase_order_id = ?`,
      [id]
    );

    res.status(200).json({
      purchaseOrder: poRows[0],
      items: itemRows,
    });
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    res.status(500).json({ message: "Failed to fetch purchase order" });
  }
};

const approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    if (existing[0].status !== "DRAFT") {
      return res.status(400).json({
        message: "Only draft purchase orders can be approved",
      });
    }

    await pool.query(
      "UPDATE purchase_orders SET status = 'APPROVED' WHERE id = ?",
      [id]
    );

    const [updatedRows] = await pool.query(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id]
    );

    res.status(200).json({
      message: "Purchase order approved successfully",
      purchaseOrder: updatedRows[0],
    });
  } catch (error) {
    console.error("Error approving purchase order:", error);
    res.status(500).json({ message: "Failed to approve purchase order" });
  }
};

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  approvePurchaseOrder,
};
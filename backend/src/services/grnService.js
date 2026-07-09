const pool = require("../config/db");

const generateGRNNumber = async (connection) => {
  const [rows] = await connection.query(
    "SELECT id FROM goods_receipts ORDER BY id DESC LIMIT 1",
  );

  const nextId = rows.length === 0 ? 1 : rows[0].id + 1;
  return `GRN-${String(nextId).padStart(3, "0")}`;
};

const receiveGoodsAgainstPO = async ({
  purchase_order_id,
  receipt_date,
  remarks,
  items,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [poRows] = await connection.query(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [purchase_order_id],
    );

    if (poRows.length === 0) {
      throw new Error("Purchase order not found");
    }

    const purchaseOrder = poRows[0];

    if (
      purchaseOrder.status !== "APPROVED" &&
      purchaseOrder.status !== "PARTIALLY_RECEIVED"
    ) {
      throw new Error(
        "Goods can only be received against an approved or partially received PO",
      );
    }

    const grnNumber = await generateGRNNumber(connection);

    const [grnResult] = await connection.query(
      `INSERT INTO goods_receipts
       (grn_number, purchase_order_id, receipt_date, remarks)
       VALUES (?, ?, ?, ?)`,
      [grnNumber, purchase_order_id, receipt_date, remarks || null],
    );

    const goodsReceiptId = grnResult.insertId;

    for (const receivedItem of items) {
      const { purchase_order_item_id, received_quantity } = receivedItem;

      const [poItemRows] = await connection.query(
        `SELECT id, purchase_order_id, item_id, ordered_quantity, received_quantity
   FROM purchase_order_items
   WHERE id = ? AND purchase_order_id = ?`,
        [purchase_order_item_id, purchase_order_id],
      );

      if (poItemRows.length === 0) {
        throw new Error(`PO item not found for id ${purchase_order_item_id}`);
      }

      const poItem = poItemRows[0];
      const pendingQty = poItem.ordered_quantity - poItem.received_quantity;

      if (received_quantity <= 0) {
        throw new Error("Received quantity must be greater than 0");
      }

      if (received_quantity > pendingQty) {
        throw new Error(
          `Received quantity exceeds pending quantity for PO item ${purchase_order_item_id}`,
        );
      }

      await connection.query(
        `INSERT INTO goods_receipt_items
         (goods_receipt_id, purchase_order_item_id, item_id, received_quantity)
         VALUES (?, ?, ?, ?)`,
        [
          goodsReceiptId,
          purchase_order_item_id,
          poItem.item_id,
          received_quantity,
        ],
      );

      await connection.query(
        `UPDATE purchase_order_items
         SET received_quantity = received_quantity + ?
         WHERE id = ?`,
        [received_quantity, purchase_order_item_id],
      );

      const [inventoryRows] = await connection.query(
        "SELECT * FROM inventory WHERE item_id = ?",
        [poItem.item_id],
      );

      if (inventoryRows.length === 0) {
        await connection.query(
          `INSERT INTO inventory (item_id, quantity_on_hand)
           VALUES (?, ?)`,
          [poItem.item_id, received_quantity],
        );
      } else {
        await connection.query(
          `UPDATE inventory
           SET quantity_on_hand = quantity_on_hand + ?
           WHERE item_id = ?`,
          [received_quantity, poItem.item_id],
        );
      }

      await connection.query(
        `INSERT INTO stock_transactions
         (item_id, transaction_type, quantity, reference_type, reference_id, notes)
         VALUES (?, 'IN', ?, 'MANUAL', ?, ?)`,
        [
          poItem.item_id,
          received_quantity,
          goodsReceiptId,
          `GRN against PO ${purchaseOrder.po_number}`,
        ],
      );
    }

    const [updatedPOItems] = await connection.query(
      `SELECT ordered_quantity, received_quantity
       FROM purchase_order_items
       WHERE purchase_order_id = ?`,
      [purchase_order_id],
    );

    const allReceived = updatedPOItems.every(
      (item) => item.received_quantity >= item.ordered_quantity,
    );

    const newStatus = allReceived ? "CLOSED" : "PARTIALLY_RECEIVED";

    await connection.query(
      "UPDATE purchase_orders SET status = ? WHERE id = ?",
      [newStatus, purchase_order_id],
    );

    await connection.commit();

    return goodsReceiptId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  receiveGoodsAgainstPO,
};

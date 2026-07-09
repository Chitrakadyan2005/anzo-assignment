const pool = require("../config/db");

const generatePONumber = async () => {
  const [rows] = await pool.query(
    "SELECT id FROM purchase_orders ORDER BY id DESC LIMIT 1"
  );

  const nextId = rows.length === 0 ? 1 : rows[0].id + 1;
  return `PO-${String(nextId).padStart(3, "0")}`;
};

const createPurchaseOrderWithItems = async ({
  supplier_id,
  order_date,
  remarks,
  items,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const poNumber = await generatePONumber();

    const [poResult] = await connection.query(
      `INSERT INTO purchase_orders
       (po_number, supplier_id, order_date, status, remarks)
       VALUES (?, ?, ?, 'DRAFT', ?)`,
      [poNumber, supplier_id, order_date, remarks || null]
    );

    const purchaseOrderId = poResult.insertId;

    for (const item of items) {
      await connection.query(
        `INSERT INTO purchase_order_items
         (purchase_order_id, item_id, ordered_quantity, received_quantity, unit_price)
         VALUES (?, ?, ?, 0, ?)`,
        [
          purchaseOrderId,
          item.item_id,
          item.ordered_quantity,
          item.unit_price || 0,
        ]
      );
    }

    await connection.commit();

    return purchaseOrderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createPurchaseOrderWithItems,
};
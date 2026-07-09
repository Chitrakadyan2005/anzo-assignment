const pool = require("../config/db");

const getDashboardSummary = async (req, res) => {
  try {
    // Total items
    const [itemRows] = await pool.query(
      "SELECT COUNT(*) AS totalItems FROM items"
    );

    // Total pallets
    const [palletRows] = await pool.query(
      "SELECT COUNT(*) AS totalPallets FROM pallets"
    );

    // Current stock = total quantity in inventory
    const [stockRows] = await pool.query(
      "SELECT COALESCE(SUM(quantity_on_hand), 0) AS currentStock FROM inventory"
    );

    // Total suppliers
    const [supplierRows] = await pool.query(
      "SELECT COUNT(*) AS totalSuppliers FROM suppliers"
    );

    // Total purchase orders
    const [purchaseOrderRows] = await pool.query(
      "SELECT COUNT(*) AS totalPurchaseOrders FROM purchase_orders"
    );

    // Pending receipts = approved or partially received POs
    const [pendingReceiptRows] = await pool.query(`
      SELECT COUNT(*) AS pendingReceipts
      FROM purchase_orders
      WHERE status IN ('APPROVED', 'PARTIALLY_RECEIVED')
    `);

    // Recent stock transactions
    const [transactionRows] = await pool.query(`
      SELECT 
        st.id,
        st.transaction_type,
        st.quantity,
        st.reference_type,
        st.reference_id,
        st.notes,
        st.created_at,
        i.item_name,
        i.item_code
      FROM stock_transactions st
      JOIN items i ON st.item_id = i.id
      ORDER BY st.created_at DESC
      LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      summary: {
        totalItems: itemRows[0].totalItems,
        totalPallets: palletRows[0].totalPallets,
        currentStock: stockRows[0].currentStock,
        totalSuppliers: supplierRows[0].totalSuppliers,
        totalPurchaseOrders: purchaseOrderRows[0].totalPurchaseOrders,
        pendingReceipts: pendingReceiptRows[0].pendingReceipts,
        recentTransactions: transactionRows,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};
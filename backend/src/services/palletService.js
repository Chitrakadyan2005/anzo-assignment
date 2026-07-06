const pool = require("../config/db");

const stockInPalletService = async (palletId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check pallet exists
    const [palletRows] = await connection.query(
      "SELECT * FROM pallets WHERE id = ?",
      [palletId]
    );

    if (palletRows.length === 0) {
      throw new Error("Pallet not found");
    }

    const pallet = palletRows[0];

    // 2. Prevent duplicate stock-in
    if (pallet.status === "RECEIVED") {
      throw new Error("This pallet has already been received");
    }

    // 3. Get pallet items
    const [palletItems] = await connection.query(
      `
      SELECT item_id, quantity
      FROM pallet_items
      WHERE pallet_id = ?
      `,
      [palletId]
    );

    if (palletItems.length === 0) {
      throw new Error("Cannot stock in an empty pallet");
    }

    // 4. Add each pallet item into inventory + transaction history
    for (const palletItem of palletItems) {
      const { item_id, quantity } = palletItem;

      const [inventoryRows] = await connection.query(
        "SELECT * FROM inventory WHERE item_id = ?",
        [item_id]
      );

      if (inventoryRows.length === 0) {
        await connection.query(
          `
          INSERT INTO inventory (item_id, quantity_on_hand)
          VALUES (?, ?)
          `,
          [item_id, quantity]
        );
      } else {
        await connection.query(
          `
          UPDATE inventory
          SET quantity_on_hand = quantity_on_hand + ?
          WHERE item_id = ?
          `,
          [quantity, item_id]
        );
      }

      await connection.query(
        `
        INSERT INTO stock_transactions
        (item_id, transaction_type, quantity, reference_type, reference_id, notes)
        VALUES (?, 'IN', ?, 'PALLET', ?, ?)
        `,
        [
          item_id,
          quantity,
          palletId,
          `Stock received from pallet ${pallet.pallet_code}`,
        ]
      );
    }

    // 5. Mark pallet as received
    await connection.query(
      `
      UPDATE pallets
      SET status = 'RECEIVED'
      WHERE id = ?
      `,
      [palletId]
    );

    await connection.commit();

    return {
      success: true,
      message: "Stock received successfully from pallet",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  stockInPalletService,
};
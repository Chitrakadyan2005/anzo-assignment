const pool = require("../config/db");

const generatePalletCode = async () => {
  const [rows] = await pool.query(`
    SELECT pallet_code
    FROM pallets
    ORDER BY id DESC
    LIMIT 1
  `);

  if (rows.length === 0) {
    return "PLT-001";
  }

  const lastCode = rows[0].pallet_code; // e.g. PLT-009
  const lastNumber = parseInt(lastCode.split("-")[1], 10);
  const nextNumber = lastNumber + 1;

  return `PLT-${String(nextNumber).padStart(3, "0")}`;
};

module.exports = generatePalletCode;
const express = require("express");
const router = express.Router();

const {
  createPallet,
  getAllPallets,
  getPalletById,
  addItemToPallet,
  updatePalletItem,
  deletePalletItem,
  stockInFromPallet,
} = require("../controllers/palletController");

// Pallet CRUD-ish
router.get("/", getAllPallets);
router.get("/:id", getPalletById);
router.post("/", createPallet);

// Pallet items
router.post("/:palletId/items", addItemToPallet);
router.put("/:palletId/items/:palletItemId", updatePalletItem);
router.delete("/:palletId/items/:palletItemId", deletePalletItem);

// Stock in from pallet
router.post("/:palletId/stock-in", stockInFromPallet);

module.exports = router;
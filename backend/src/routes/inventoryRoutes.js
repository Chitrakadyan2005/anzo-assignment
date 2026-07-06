const express = require("express");
const router = express.Router();

const {
  getInventory,
  stockOut,
  getTransactions,
} = require("../controllers/inventoryController");

router.get("/", getInventory);
router.post("/stock-out", stockOut);
router.get("/transactions", getTransactions);

module.exports = router;
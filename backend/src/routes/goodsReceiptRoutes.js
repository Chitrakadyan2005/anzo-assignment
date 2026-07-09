const express = require("express");
const {
  createGoodsReceipt,
  getAllGoodsReceipts,
  getGoodsReceiptById,
} = require("../controllers/goodsReceiptController");

const router = express.Router();

router.post("/", createGoodsReceipt);
router.get("/", getAllGoodsReceipts);
router.get("/:id", getGoodsReceiptById);

module.exports = router;
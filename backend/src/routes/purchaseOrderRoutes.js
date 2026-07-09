const express = require("express");
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  approvePurchaseOrder,
} = require("../controllers/purchaseOrderController");

const router = express.Router();

router.post("/", createPurchaseOrder);
router.get("/", getAllPurchaseOrders);
router.get("/:id", getPurchaseOrderById);
router.put("/:id/approve", approvePurchaseOrder);

module.exports = router;
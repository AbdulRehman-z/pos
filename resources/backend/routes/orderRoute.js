const express = require("express");
const { addOrder, getOrders, getOrderById, updateOrder, deleteOrder, deleteAllOrders } = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();


router.route("/").post(addOrder);
router.route("/").get(getOrders);
router.route("/delete-all").delete(deleteAllOrders);
router.route("/:id").get(getOrderById);
router.route("/:id").put(updateOrder);
router.route("/:id").delete(deleteOrder);

module.exports = router;
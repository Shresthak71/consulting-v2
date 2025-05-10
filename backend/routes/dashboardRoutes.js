const express = require("express")
const router = express.Router()
const { getDashboardStats, getApplicationTrends, getDocumentStats } = require("../controllers/dashboardController")
const { protect } = require("../middleware/authMiddleware")

router.get("/stats", protect, getDashboardStats)
router.get("/trends", protect, getApplicationTrends)
router.get("/documents", protect, getDocumentStats)

module.exports = router

const express = require("express")
const { getDashboardStats, getBranchComparison } = require("../controllers/dashboardController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/stats", protect, getDashboardStats)
router.get("/branch-comparison", protect, authorize("admin", "super_admin"), getBranchComparison)

module.exports = router

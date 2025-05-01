const express = require("express")
const {
  upload,
  importStudents,
  exportStudents,
  exportApplications,
  exportDocumentChecklist,
} = require("../controllers/bulkController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

// Import routes
router.post(
  "/import/students",
  protect,
  authorize("admin", "super_admin", "branch_manager"),
  upload.single("csv"),
  importStudents,
)

// Export routes
router.get("/export/students", protect, authorize("admin", "super_admin", "branch_manager"), exportStudents)

router.get("/export/applications", protect, authorize("admin", "super_admin", "branch_manager"), exportApplications)

router.get("/export/documents/:applicationId", protect, exportDocumentChecklist)

module.exports = router

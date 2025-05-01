const express = require("express")
const {
  upload,
  uploadDocument,
  updateDocumentStatus,
  getApplicationDocuments,
  getExpiringDocuments,
  updateExpiryDate,
} = require("../controllers/documentController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/upload/:applicationId/:documentId", protect, upload.single("document"), uploadDocument)

router.put("/status/:appDocId", protect, authorize("admin", "super_admin", "counselor"), updateDocumentStatus)

router.get("/application/:applicationId", protect, getApplicationDocuments)

// New routes for document expiry
router.get("/expiring", protect, authorize("admin", "super_admin", "counselor", "branch_manager"), getExpiringDocuments)

router.put("/expiry/:appDocId", protect, authorize("admin", "super_admin", "counselor"), updateExpiryDate)

module.exports = router

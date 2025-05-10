const express = require("express")
const router = express.Router()
const {
  upload,
  uploadDocument,
  getApplicationDocuments,
  updateDocumentStatus,
  deleteDocument,
  getDocumentTypes,
  createDocumentType,
  updateDocumentType,
} = require("../controllers/documentController")
const { protect, admin, counselor } = require("../middleware/authMiddleware")

// Document upload routes
router.post("/upload", protect, counselor, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }
    uploadDocument(req, res)
  })
})

router.get("/application/:id", protect, getApplicationDocuments)
router.put("/:id/status", protect, counselor, updateDocumentStatus)
router.delete("/:id", protect, counselor, deleteDocument)

// Document types routes
router.get("/types", protect, getDocumentTypes)
router.post("/types", protect, admin, createDocumentType)
router.put("/types/:id", protect, admin, updateDocumentType)

module.exports = router

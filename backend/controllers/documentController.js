const pool = require("../config/db")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { format, addMonths, isBefore, parseISO } = require("date-fns")

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/documents"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedFileTypes.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed."))
  }
}

// Initialize upload
exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// @desc    Upload document for an application
// @route   POST /api/documents/upload/:applicationId/:documentId
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    const { applicationId, documentId } = req.params
    const { expiryDate } = req.body // Get expiry date if provided

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      })
    }

    // Check if application exists and belongs to the user's branch
    const [applications] = await pool.query(
      `SELECT a.*, s.branch_id 
       FROM applications a 
       JOIN students s ON a.student_id = s.student_id 
       WHERE a.application_id = ?`,
      [applicationId],
    )

    if (applications.length === 0) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path)

      return res.status(404).json({
        success: false,
        message: "Application not found",
      })
    }

    const application = applications[0]

    // Check branch access for non-admin users
    const [roles] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])

    const roleName = roles[0].role_name

    if (roleName !== "admin" && roleName !== "super_admin" && application.branch_id !== req.user.branch_id) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path)

      return res.status(403).json({
        success: false,
        message: "You are not authorized to upload documents for this application",
      })
    }

    // Check if document exists
    const [documents] = await pool.query("SELECT * FROM documents WHERE document_id = ?", [documentId])

    if (documents.length === 0) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path)

      return res.status(404).json({
        success: false,
        message: "Document type not found",
      })
    }

    // Get document type info to check if it has expiry
    const [documentTypes] = await pool.query("SELECT * FROM document_types WHERE document_id = ?", [documentId])

    // Determine expiry date
    let finalExpiryDate = null
    if (expiryDate) {
      // Use provided expiry date
      finalExpiryDate = expiryDate
    } else if (documentTypes.length > 0 && documentTypes[0].has_expiry && documentTypes[0].validity_period_months) {
      // Calculate expiry date based on validity period
      const today = new Date()
      finalExpiryDate = format(addMonths(today, documentTypes[0].validity_period_months), "yyyy-MM-dd")
    }

    // Check if document already exists for this application
    const [existingDocs] = await pool.query(
      "SELECT * FROM application_documents WHERE application_id = ? AND document_id = ?",
      [applicationId, documentId],
    )

    let result

    if (existingDocs.length > 0) {
      // Update existing document
      const oldFilePath = existingDocs[0].file_path
      ;[result] = await pool.query(
        "UPDATE application_documents SET file_path = ?, status = ?, expiry_date = ?, expiry_notification_sent = FALSE, uploaded_at = NOW() WHERE app_doc_id = ?",
        [req.file.path.replace(/\\/g, "/"), "pending", finalExpiryDate, existingDocs[0].app_doc_id],
      )

      // Delete old file if it exists
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    } else {
      // Insert new document
      ;[result] = await pool.query(
        "INSERT INTO application_documents (application_id, document_id, file_path, status, expiry_date) VALUES (?, ?, ?, ?, ?)",
        [applicationId, documentId, req.file.path.replace(/\\/g, "/"), "pending", finalExpiryDate],
      )
    }

    if (result.affectedRows === 1) {
      // Log document upload in audit trail
      await pool.query(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, branch_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          req.user.user_id,
          "UPLOAD",
          "document",
          documentId,
          JSON.stringify({
            applicationId,
            fileName: req.file.filename,
            expiryDate: finalExpiryDate,
          }),
          req.user.branch_id,
        ],
      )

      res.status(200).json({
        success: true,
        data: {
          filePath: req.file.path.replace(/\\/g, "/"),
          fileName: req.file.filename,
          status: "pending",
          expiryDate: finalExpiryDate,
        },
        message: "Document uploaded successfully",
      })
    } else {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path)

      res.status(400).json({
        success: false,
        message: "Failed to upload document",
      })
    }
  } catch (error) {
    console.error(error)

    // Delete the uploaded file if it exists
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// @desc    Get expiring documents
// @route   GET /api/documents/expiring
// @access  Private (Admin, Branch Manager, Counselor)
exports.getExpiringDocuments = async (req, res) => {
  try {
    const { days = 30, branchId } = req.query
    const userId = req.user.user_id

    // Get user role
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])
    const roleName = roleRows[0].role_name

    // Calculate the date threshold
    const today = new Date()
    const thresholdDate = format(addMonths(today, 0), "yyyy-MM-dd")
    const futureDate = format(addMonths(today, Number.parseInt(days) / 30), "yyyy-MM-dd")

    // Branch condition for queries
    let branchCondition = ""
    const branchParams = [thresholdDate, futureDate]

    if (branchId) {
      branchCondition = "AND s.branch_id = ?"
      branchParams.push(branchId)
    } else if (roleName !== "admin" && roleName !== "super_admin") {
      // Non-admin users can only see their branch data
      branchCondition = "AND s.branch_id = ?"
      branchParams.push(req.user.branch_id)
    }

    // Get expiring documents
    const [expiringDocuments] = await pool.query(
      `SELECT 
        ad.app_doc_id, ad.file_path, ad.status, ad.uploaded_at, ad.expiry_date,
        d.document_id, d.document_name, d.description,
        a.application_id, a.application_status,
        s.student_id, s.full_name as student_name, s.email as student_email,
        b.name as branch_name
      FROM application_documents ad
      JOIN documents d ON ad.document_id = d.document_id
      JOIN applications a ON ad.application_id = a.application_id
      JOIN students s ON a.student_id = s.student_id
      JOIN branches b ON s.branch_id = b.branch_id
      WHERE ad.expiry_date IS NOT NULL
      AND ad.expiry_date >= ?
      AND ad.expiry_date <= ?
      ${branchCondition}
      ORDER BY ad.expiry_date ASC`,
      branchParams,
    )

    res.status(200).json({
      success: true,
      data: expiringDocuments,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// @desc    Update document expiry date
// @route   PUT /api/documents/expiry/:appDocId
// @access  Private (Admin, Counselor)
exports.updateExpiryDate = async (req, res) => {
  try {
    const { appDocId } = req.params
    const { expiryDate } = req.body

    if (!expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Expiry date is required",
      })
    }

    // Check if document exists and belongs to the user's branch
    const [documents] = await pool.query(
      `SELECT ad.*, a.student_id, s.branch_id 
       FROM application_documents ad 
       JOIN applications a ON ad.application_id = a.application_id 
       JOIN students s ON a.student_id = s.student_id 
       WHERE ad.app_doc_id = ?`,
      [appDocId],
    )

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      })
    }

    const document = documents[0]

    // Check branch access for non-admin users
    const [roles] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])
    const roleName = roles[0].role_name

    if (roleName !== "admin" && roleName !== "super_admin" && document.branch_id !== req.user.branch_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update documents for this application",
      })
    }

    // Update document expiry date
    const [result] = await pool.query(
      "UPDATE application_documents SET expiry_date = ?, expiry_notification_sent = FALSE WHERE app_doc_id = ?",
      [expiryDate, appDocId],
    )

    if (result.affectedRows === 1) {
      // Log document update in audit trail
      await pool.query(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, branch_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
          req.user.user_id,
          "UPDATE_EXPIRY",
          "document",
          document.document_id,
          JSON.stringify({
            applicationId: document.application_id,
            expiryDate,
          }),
          req.user.branch_id,
        ],
      )

      res.status(200).json({
        success: true,
        message: "Document expiry date updated successfully",
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update document expiry date",
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// Keep existing methods...
// (updateDocumentStatus, getApplicationDocuments, etc.)

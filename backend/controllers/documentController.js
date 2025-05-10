const pool = require("../config/db")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  },
})

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX, XLS, XLSX files are allowed."))
  }
}

// Initialize upload
exports.upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
}).single("document")

// @desc    Upload document for an application
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" })
    }

    const { applicationId, documentId } = req.body

    if (!applicationId || !documentId) {
      return res.status(400).json({ message: "Please provide application ID and document ID" })
    }

    // Check if application exists and belongs to the user's branch
    const [appRows] = await pool.query(
      `SELECT a.*, s.branch_id 
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       WHERE a.application_id = ?`,
      [applicationId],
    )

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== appRows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to access this application" })
    }

    // Check if document exists
    const [docRows] = await pool.query("SELECT * FROM documents WHERE document_id = ?", [documentId])

    if (docRows.length === 0) {
      return res.status(404).json({ message: "Document type not found" })
    }

    // Check if document already exists for this application
    const [existingDoc] = await pool.query(
      "SELECT * FROM application_documents WHERE application_id = ? AND document_id = ?",
      [applicationId, documentId],
    )

    let result
    if (existingDoc.length > 0) {
      // Update existing document
      ;[result] = await pool.query(
        'UPDATE application_documents SET file_path = ?, status = "pending", uploaded_at = NOW() WHERE app_doc_id = ?',
        [`/uploads/${req.file.filename}`, existingDoc[0].app_doc_id],
      )
    } else {
      // Insert new document
      ;[result] = await pool.query(
        'INSERT INTO application_documents (application_id, document_id, file_path, status, uploaded_at) VALUES (?, ?, ?, "pending", NOW())',
        [applicationId, documentId, `/uploads/${req.file.filename}`],
      )
    }

    if (result.affectedRows === 1) {
      res.status(201).json({
        message: "Document uploaded successfully",
        filePath: `/uploads/${req.file.filename}`,
        applicationId,
        documentId,
      })
    } else {
      res.status(400).json({ message: "Failed to save document information" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get documents for an application
// @route   GET /api/documents/application/:id
// @access  Private
exports.getApplicationDocuments = async (req, res) => {
  try {
    // Check if application exists and belongs to the user's branch
    const [appRows] = await pool.query(
      `SELECT a.*, s.branch_id 
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       WHERE a.application_id = ?`,
      [req.params.id],
    )

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== appRows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to access this application" })
    }

    // Get all documents for this application
    const [rows] = await pool.query(
      `SELECT ad.*, d.document_name, d.description
       FROM application_documents ad
       JOIN documents d ON ad.document_id = d.document_id
       WHERE ad.application_id = ?`,
      [req.params.id],
    )

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update document status
// @route   PUT /api/documents/:id/status
// @access  Private
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Please provide a valid status" })
    }

    // Get document details
    const [docRows] = await pool.query(
      `SELECT ad.*, a.student_id, s.branch_id
       FROM application_documents ad
       JOIN applications a ON ad.application_id = a.application_id
       JOIN students s ON a.student_id = s.student_id
       WHERE ad.app_doc_id = ?`,
      [req.params.id],
    )

    if (docRows.length === 0) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== docRows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to update this document" })
    }

    // Update document status
    const [result] = await pool.query("UPDATE application_documents SET status = ? WHERE app_doc_id = ?", [
      status,
      req.params.id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Document not found" })
    }

    res.json({ message: "Document status updated", status })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    // Get document details
    const [docRows] = await pool.query(
      `SELECT ad.*, a.student_id, s.branch_id, ad.file_path
       FROM application_documents ad
       JOIN applications a ON ad.application_id = a.application_id
       JOIN students s ON a.student_id = s.student_id
       WHERE ad.app_doc_id = ?`,
      [req.params.id],
    )

    if (docRows.length === 0) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== docRows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to delete this document" })
    }

    // Delete the file
    const filePath = path.join(__dirname, "..", docRows[0].file_path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete from database
    const [result] = await pool.query("DELETE FROM application_documents WHERE app_doc_id = ?", [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Document not found" })
    }

    res.json({ message: "Document removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get document types
// @route   GET /api/documents/types
// @access  Private
exports.getDocumentTypes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM documents")
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Create document type
// @route   POST /api/documents/types
// @access  Private/Admin
exports.createDocumentType = async (req, res) => {
  try {
    const { documentName, description } = req.body

    if (!documentName) {
      return res.status(400).json({ message: "Please provide a document name" })
    }

    const [result] = await pool.query("INSERT INTO documents (document_name, description) VALUES (?, ?)", [
      documentName,
      description,
    ])

    if (result.affectedRows === 1) {
      const [rows] = await pool.query("SELECT * FROM documents WHERE document_id = ?", [result.insertId])

      res.status(201).json(rows[0])
    } else {
      res.status(400).json({ message: "Invalid document data" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update document type
// @route   PUT /api/documents/types/:id
// @access  Private/Admin
exports.updateDocumentType = async (req, res) => {
  try {
    const { documentName, description } = req.body

    if (!documentName) {
      return res.status(400).json({ message: "Please provide a document name" })
    }

    const [result] = await pool.query("UPDATE documents SET document_name = ?, description = ? WHERE document_id = ?", [
      documentName,
      description,
      req.params.id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Document type not found" })
    }

    const [rows] = await pool.query("SELECT * FROM documents WHERE document_id = ?", [req.params.id])

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

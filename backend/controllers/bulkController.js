const pool = require("../config/db")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { processCsvFile, generateCsv, formatDateForCsv, parseDateFromCsv } = require("../utils/csvProcessor")

// Set up storage for uploaded CSV files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/csv"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`)
  },
})

// File filter for CSV files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()

  if (ext === ".csv") {
    cb(null, true)
  } else {
    cb(new Error("Only CSV files are allowed"))
  }
}

// Initialize upload
exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// @desc    Import students from CSV
// @route   POST /api/bulk/import/students
// @access  Private (Admin, Branch Manager)
exports.importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file",
      })
    }

    // Get branch ID (for non-admin users)
    let branchId = null
    if (req.body.branchId) {
      branchId = req.body.branchId
    } else {
      const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])
      const roleName = roleRows[0].role_name

      if (roleName !== "admin" && roleName !== "super_admin") {
        branchId = req.user.branch_id
      }
    }

    // Process CSV file
    const students = await processCsvFile(req.file.path)

    // Validate required fields
    const missingFields = []
    students.forEach((student, index) => {
      if (!student.full_name) missingFields.push(`Row ${index + 2}: Missing full_name`)
      if (!student.email) missingFields.push(`Row ${index + 2}: Missing email`)
    })

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: missingFields,
      })
    }

    // Insert students
    const results = {
      total: students.length,
      inserted: 0,
      errors: [],
    }

    for (const student of students) {
      try {
        // Check if student already exists
        const [existingStudents] = await pool.query("SELECT * FROM students WHERE email = ?", [student.email])

        if (existingStudents.length > 0) {
          results.errors.push(`Student with email ${student.email} already exists`)
          continue
        }

        // Insert student
        const [result] = await pool.query(
          "INSERT INTO students (full_name, email, phone, branch_id, registered_by) VALUES (?, ?, ?, ?, ?)",
          [student.full_name, student.email, student.phone || null, branchId, req.user.user_id],
        )

        if (result.affectedRows === 1) {
          results.inserted++
        }
      } catch (error) {
        console.error(`Error inserting student: ${student.email}`, error)
        results.errors.push(`Error inserting student: ${student.email} - ${error.message}`)
      }
    }

    // Log the import in audit trail
    await pool.query(
      "INSERT INTO audit_logs (user_id, action, entity_type, details, branch_id) VALUES (?, ?, ?, ?, ?)",
      [
        req.user.user_id,
        "BULK_IMPORT",
        "students",
        JSON.stringify({
          total: results.total,
          inserted: results.inserted,
          errors: results.errors.length,
        }),
        req.user.branch_id,
      ],
    )

    res.status(200).json({
      success: true,
      data: results,
      message: `Imported ${results.inserted} out of ${results.total} students`,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// @desc    Export students to CSV
// @route   GET /api/bulk/export/students
// @access  Private (Admin, Branch Manager)
exports.exportStudents = async (req, res) => {
  try {
    const { branchId } = req.query

    // Get user role
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])
    const roleName = roleRows[0].role_name

    // Branch condition for queries
    let branchCondition = ""
    let branchParams = []

    if (branchId) {
      branchCondition = "WHERE s.branch_id = ?"
      branchParams = [branchId]
    } else if (roleName !== "admin" && roleName !== "super_admin") {
      // Non-admin users can only see their branch data
      branchCondition = "WHERE s.branch_id = ?"
      branchParams = [req.user.branch_id]
    }

    // Get students
    const [students] = await pool.query(
      `SELECT 
        s.student_id, s.full_name, s.email, s.phone, s.created_at,
        b.name as branch_name,
        u.full_name as registered_by
      FROM students s
      LEFT JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN users u ON s.registered_by = u.user_id
      ${branchCondition}
      ORDER BY s.created_at DESC`,
      branchParams,
    )

    // Format data for CSV
    const formattedStudents = students.map((student) => ({
      ID: student.student_id,
      Name: student.full_name,
      Email: student.email,
      Phone: student.phone || "",
      Branch: student.branch_name || "",
      "Registered By": student.registered_by || "",
      "Registration Date": formatDateForCsv(student.created_at),
    }))

    // Generate CSV
    const csv = await generateCsv(formattedStudents)

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=students.csv")

    // Send CSV
    res.status(200).send(csv)

    // Log the export in audit trail
    await pool.query(
      "INSERT INTO audit_logs (user_id, action, entity_type, details, branch_id) VALUES (?, ?, ?, ?, ?)",
      [
        req.user.user_id,
        "BULK_EXPORT",
        "students",
        JSON.stringify({
          count: students.length,
          branchId: branchId || null,
        }),
        req.user.branch_id,
      ],
    )
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// @desc    Export applications to CSV
// @route   GET /api/bulk/export/applications
// @access  Private (Admin, Branch Manager)
exports.exportApplications = async (req, res) => {
  try {
    const { branchId, status } = req.query

    // Get user role
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])
    const roleName = roleRows[0].role_name

    // Build query conditions
    const conditions = []
    const params = []

    if (branchId) {
      conditions.push("s.branch_id = ?")
      params.push(branchId)
    } else if (roleName !== "admin" && roleName !== "super_admin") {
      // Non-admin users can only see their branch data
      conditions.push("s.branch_id = ?")
      params.push(req.user.branch_id)
    }

    if (status) {
      conditions.push("a.application_status = ?")
      params.push(status)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Get applications
    const [applications] = await pool.query(
      `SELECT 
        a.application_id, a.application_status, a.submitted_at,
        s.student_id, s.full_name as student_name, s.email as student_email, s.phone as student_phone,
        c.name as course_name, c.level as course_level,
        u.name as university_name,
        co.name as country_name,
        b.name as branch_name,
        usr.full_name as counselor_name
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN courses c ON a.course_id = c.course_id
      JOIN universities u ON c.university_id = u.university_id
      JOIN countries co ON u.country_id = co.country_id
      JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN users usr ON a.counselor_id = usr.user_id
      ${whereClause}
      ORDER BY a.submitted_at DESC`,
      params,
    )

    // Format data for CSV
    const formattedApplications = applications.map((app) => ({
      "Application ID": app.application_id,
      "Student Name": app.student_name,
      "Student Email": app.student_email,
      "Student Phone": app.student_phone || "",
      Course: app.course_name,
      Level: app.course_level || "",
      University: app.university_name,
      Country: app.country_name,
      Branch: app.branch_name,
      Counselor: app.counselor_name || "",
      Status: app.application_status,
      "Submitted Date": formatDateForCsv(app.submitted_at),
    }))

    // Generate CSV
    const csv = await generateCsv(formattedApplications)

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=applications.csv")

    // Send CSV
    res.status(200).send(csv)

    // Log the export in audit trail
    await pool.query(
      "INSERT INTO audit_logs (user_id, action, entity_type, details, branch_id) VALUES (?, ?, ?, ?, ?)",
      [
        req.user.user_id,
        "BULK_EXPORT",
        "applications",
        JSON.stringify({
          count: applications.length,
          branchId: branchId || null,
          status: status || null,
        }),
        req.user.branch_id,
      ],
    )
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// @desc    Export document checklist to CSV
// @route   GET /api/bulk/export/documents/:applicationId
// @access  Private
exports.exportDocumentChecklist = async (req, res) => {
  try {
    const { applicationId } = req.params

    // Check if application exists and belongs to the user's branch
    const [applications] = await pool.query(
      `SELECT a.*, s.branch_id 
       FROM applications a 
       JOIN students s ON a.student_id = s.student_id 
       WHERE a.application_id = ?`,
      [applicationId],
    )

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      })
    }

    const application = applications[0]

    // Check branch access for non-admin users
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])
    const roleName = roleRows[0].role_name

    if (roleName !== "admin" && roleName !== "super_admin" && application.branch_id !== req.user.branch_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access documents for this application",
      })
    }

    // Get student info
    const [students] = await pool.query("SELECT * FROM students WHERE student_id = ?", [application.student_id])

    const student = students[0]

    // Get course and university info
    const [courses] = await pool.query(
      `SELECT c.*, u.name as university_name, co.name as country_name
       FROM courses c
       JOIN universities u ON c.university_id = u.university_id
       JOIN countries co ON u.country_id = co.country_id
       WHERE c.course_id = ?`,
      [application.course_id],
    )

    const course = courses[0]

    // Get all documents for this application
    const [documents] = await pool.query(
      `SELECT ad.app_doc_id, ad.file_path, ad.status, ad.uploaded_at, ad.expiry_date,
              d.document_id, d.document_name, d.description
       FROM application_documents ad
       JOIN documents d ON ad.document_id = d.document_id
       WHERE ad.application_id = ?`,
      [applicationId],
    )

    // Format data for CSV
    const formattedDocuments = documents.map((doc) => ({
      "Document Name": doc.document_name,
      Description: doc.description || "",
      Status: doc.status,
      "Uploaded Date": formatDateForCsv(doc.uploaded_at),
      "Expiry Date": formatDateForCsv(doc.expiry_date),
      "File Path": doc.file_path || "",
    }))

    // Add header with application info
    const headerInfo = [
      {
        "Application ID": application.application_id,
        "Student Name": student.full_name,
        "Student Email": student.email,
        Course: course.name,
        University: course.university_name,
        Country: course.country_name,
        Status: application.application_status,
        "Submitted Date": formatDateForCsv(application.submitted_at),
      },
    ]

    // Generate CSV with header
    const csv = await generateCsv([...headerInfo, ...formattedDocuments])

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename=documents_${applicationId}.csv`)

    // Send CSV
    res.status(200).send(csv)

    // Log the export in audit trail
    await pool.query(
      "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, branch_id) VALUES (?, ?, ?, ?, ?, ?)",
      [
        req.user.user_id,
        "BULK_EXPORT",
        "documents",
        applicationId,
        JSON.stringify({
          count: documents.length,
          applicationId,
        }),
        req.user.branch_id,
      ],
    )
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

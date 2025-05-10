const pool = require("../config/db")

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res) => {
  try {
    let query = `
      SELECT 
        a.*,
        s.full_name as student_name,
        s.branch_id,
        b.name as branch_name,
        c.name as course_name,
        u.name as university_name,
        co.name as country_name,
        us.full_name as counselor_name
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      JOIN branches b ON s.branch_id = b.branch_id
      JOIN courses c ON a.course_id = c.course_id
      JOIN universities u ON c.university_id = u.university_id
      JOIN countries co ON u.country_id = co.country_id
      JOIN users us ON a.counselor_id = us.user_id
    `
    let params = []

    // If not admin, filter by branch
    if (req.user.role_id !== 1) {
      query += " WHERE s.branch_id = ?"
      params = [req.user.branch_id]
    }

    // Add status filter if provided
    if (req.query.status) {
      const statusCondition = params.length > 0 ? " AND a.application_status = ?" : " WHERE a.application_status = ?"
      query += statusCondition
      params.push(req.query.status)
    }

    // Add branch filter if provided (admin only)
    if (req.query.branch && req.user.role_id === 1) {
      const branchCondition = params.length > 0 ? " AND s.branch_id = ?" : " WHERE s.branch_id = ?"
      query += branchCondition
      params.push(req.query.branch)
    }

    // Add country filter if provided
    if (req.query.country) {
      const countryCondition = params.length > 0 ? " AND co.country_id = ?" : " WHERE co.country_id = ?"
      query += countryCondition
      params.push(req.query.country)
    }

    // Add order by
    query += " ORDER BY a.submitted_at DESC"

    const [rows] = await pool.query(query, params)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        a.*,
        s.full_name as student_name,
        s.email as student_email,
        s.phone as student_phone,
        s.branch_id,
        b.name as branch_name,
        c.name as course_name,
        c.level as course_level,
        u.name as university_name,
        co.name as country_name,
        us.full_name as counselor_name
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       JOIN branches b ON s.branch_id = b.branch_id
       JOIN courses c ON a.course_id = c.course_id
       JOIN universities u ON c.university_id = u.university_id
       JOIN countries co ON u.country_id = co.country_id
       JOIN users us ON a.counselor_id = us.user_id
       WHERE a.application_id = ?`,
      [req.params.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "Application not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== rows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to access this application" })
    }

    // Get document checklist for this application
    const [documents] = await pool.query(
      `SELECT 
        d.document_id,
        d.document_name,
        d.description,
        ad.app_doc_id,
        ad.file_path,
        ad.status,
        ad.uploaded_at
       FROM documents d
       JOIN checklist_items ci ON d.document_id = ci.document_id
       JOIN checklists c ON ci.checklist_id = c.checklist_id
       JOIN countries co ON c.country_id = co.country_id
       LEFT JOIN application_documents ad ON d.document_id = ad.document_id AND ad.application_id = ?
       WHERE co.country_id = (
         SELECT co.country_id
         FROM applications a
         JOIN courses c ON a.course_id = c.course_id
         JOIN universities u ON c.university_id = u.university_id
         JOIN countries co ON u.country_id = co.country_id
         WHERE a.application_id = ?
       )`,
      [req.params.id, req.params.id],
    )

    const application = rows[0]
    application.documents = documents

    res.json(application)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Create an application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    const { studentId, courseId } = req.body

    if (!studentId || !courseId) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }

    // Check if student exists and belongs to user's branch
    const [studentRows] = await pool.query("SELECT * FROM students WHERE student_id = ?", [studentId])

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== studentRows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to create application for this student" })
    }

    // Check if course exists
    const [courseRows] = await pool.query("SELECT * FROM courses WHERE course_id = ?", [courseId])

    if (courseRows.length === 0) {
      return res.status(404).json({ message: "Course not found" })
    }

    const [result] = await pool.query(
      'INSERT INTO applications (student_id, course_id, counselor_id, application_status) VALUES (?, ?, ?, "draft")',
      [studentId, courseId, req.user.user_id],
    )

    if (result.affectedRows === 1) {
      const [rows] = await pool.query(
        `SELECT 
          a.*,
          s.full_name as student_name,
          s.branch_id,
          b.name as branch_name,
          c.name as course_name,
          u.name as university_name,
          co.name as country_name,
          us.full_name as counselor_name
         FROM applications a
         JOIN students s ON a.student_id = s.student_id
         JOIN branches b ON s.branch_id = b.branch_id
         JOIN courses c ON a.course_id = c.course_id
         JOIN universities u ON c.university_id = u.university_id
         JOIN countries co ON u.country_id = co.country_id
         JOIN users us ON a.counselor_id = us.user_id
         WHERE a.application_id = ?`,
        [result.insertId],
      )

      res.status(201).json(rows[0])
    } else {
      res.status(400).json({ message: "Invalid application data" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!status || !["draft", "submitted", "processing", "visa_applied", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Please provide a valid status" })
    }

    // Check if application exists and belongs to user's branch
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
      return res.status(403).json({ message: "Not authorized to update this application" })
    }

    // Update submitted_at if status is changing to submitted
    let query = "UPDATE applications SET application_status = ? WHERE application_id = ?"
    const params = [status, req.params.id]

    if (status === "submitted" && appRows[0].application_status !== "submitted") {
      query = "UPDATE applications SET application_status = ?, submitted_at = NOW() WHERE application_id = ?"
    }

    const [result] = await pool.query(query, params)

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found" })
    }

    const [rows] = await pool.query(
      `SELECT 
        a.*,
        s.full_name as student_name,
        s.branch_id,
        b.name as branch_name,
        c.name as course_name,
        u.name as university_name,
        co.name as country_name,
        us.full_name as counselor_name
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       JOIN branches b ON s.branch_id = b.branch_id
       JOIN courses c ON a.course_id = c.course_id
       JOIN universities u ON c.university_id = u.university_id
       JOIN countries co ON u.country_id = co.country_id
       JOIN users us ON a.counselor_id = us.user_id
       WHERE a.application_id = ?`,
      [req.params.id],
    )

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res) => {
  try {
    // Check if application exists and belongs to user's branch
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
      return res.status(403).json({ message: "Not authorized to delete this application" })
    }

    // Start transaction
    await pool.query("START TRANSACTION")

    // Delete application documents
    await pool.query("DELETE FROM application_documents WHERE application_id = ?", [req.params.id])

    // Delete application
    const [result] = await pool.query("DELETE FROM applications WHERE application_id = ?", [req.params.id])

    // Commit transaction
    await pool.query("COMMIT")

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found" })
    }

    res.json({ message: "Application removed" })
  } catch (error) {
    // Rollback transaction on error
    await pool.query("ROLLBACK")
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

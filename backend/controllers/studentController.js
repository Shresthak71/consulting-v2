const pool = require("../config/db")

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    let query = `
      SELECT 
        s.*, 
        b.name as branch_name,
        u.full_name as registered_by_name
      FROM students s
      JOIN branches b ON s.branch_id = b.branch_id
      JOIN users u ON s.registered_by = u.user_id
    `
    let params = []

    // If not admin, filter by branch
    if (req.user.role_id !== 1) {
      query += " WHERE s.branch_id = ?"
      params = [req.user.branch_id]
    }

    const [rows] = await pool.query(query, params)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        s.*, 
        b.name as branch_name,
        u.full_name as registered_by_name
       FROM students s
       JOIN branches b ON s.branch_id = b.branch_id
       JOIN users u ON s.registered_by = u.user_id
       WHERE s.student_id = ?`,
      [req.params.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== rows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to access this student" })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Create a student
// @route   POST /api/students
// @access  Private
exports.createStudent = async (req, res) => {
  try {
    const { fullName, email, phone, branchId, registeredBy } = req.body

    if (!fullName) {
      return res.status(400).json({ message: "Please provide a student name" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== Number.parseInt(branchId)) {
      return res.status(403).json({ message: "Not authorized to add student to this branch" })
    }

    // Use user's branch if not specified
    const branch = branchId || req.user.branch_id

    // Use the provided registeredBy or default to the current user
    const registeredByUser = registeredBy || req.user.user_id

    const [result] = await pool.query(
      "INSERT INTO students (full_name, email, phone, branch_id, registered_by) VALUES (?, ?, ?, ?, ?)",
      [fullName, email, phone, branch, registeredByUser],
    )

    if (result.affectedRows === 1) {
      const [rows] = await pool.query(
        `SELECT 
          s.*, 
          b.name as branch_name,
          u.full_name as registered_by_name
         FROM students s
         JOIN branches b ON s.branch_id = b.branch_id
         JOIN users u ON s.registered_by = u.user_id
         WHERE s.student_id = ?`,
        [result.insertId],
      )

      res.status(201).json(rows[0])
    } else {
      res.status(400).json({ message: "Invalid student data" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res) => {
  try {
    const { fullName, email, phone, registeredBy } = req.body

    if (!fullName) {
      return res.status(400).json({ message: "Please provide a student name" })
    }

    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM students WHERE student_id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== studentRows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to update this student" })
    }

    // Only update registered_by if provided and user is admin
    let query = "UPDATE students SET full_name = ?, email = ?, phone = ? WHERE student_id = ?"
    let params = [fullName, email, phone, req.params.id]

    if (registeredBy && req.user.role_id === 1) {
      query = "UPDATE students SET full_name = ?, email = ?, phone = ?, registered_by = ? WHERE student_id = ?"
      params = [fullName, email, phone, registeredBy, req.params.id]
    }

    const [result] = await pool.query(query, params)

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" })
    }

    const [rows] = await pool.query(
      `SELECT 
        s.*, 
        b.name as branch_name,
        u.full_name as registered_by_name
       FROM students s
       JOIN branches b ON s.branch_id = b.branch_id
       JOIN users u ON s.registered_by = u.user_id
       WHERE s.student_id = ?`,
      [req.params.id],
    )

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
exports.deleteStudent = async (req, res) => {
  try {
    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM students WHERE student_id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== studentRows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to delete this student" })
    }

    // Check if student has applications
    const [appCheck] = await pool.query("SELECT COUNT(*) as count FROM applications WHERE student_id = ?", [
      req.params.id,
    ])

    if (appCheck[0].count > 0) {
      return res.status(400).json({
        message: "Cannot delete student with existing applications",
      })
    }

    const [result] = await pool.query("DELETE FROM students WHERE student_id = ?", [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json({ message: "Student removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get student applications
// @route   GET /api/students/:id/applications
// @access  Private
exports.getStudentApplications = async (req, res) => {
  try {
    // Check if student exists
    const [studentRows] = await pool.query("SELECT * FROM students WHERE student_id = ?", [req.params.id])

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check branch access (admin can access all)
    if (req.user.role_id !== 1 && req.user.branch_id !== studentRows[0].branch_id) {
      return res.status(403).json({ message: "Not authorized to access this student" })
    }

    const [rows] = await pool.query(
      `SELECT 
        a.*,
        c.name as course_name,
        u.name as university_name,
        co.name as country_name,
        us.full_name as counselor_name
       FROM applications a
       JOIN courses c ON a.course_id = c.course_id
       JOIN universities u ON c.university_id = u.university_id
       JOIN countries co ON u.country_id = co.country_id
       JOIN users us ON a.counselor_id = us.user_id
       WHERE a.student_id = ?`,
      [req.params.id],
    )

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

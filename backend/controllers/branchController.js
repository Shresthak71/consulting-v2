const pool = require("../config/db")

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private
exports.getBranches = async (req, res) => {
  try {
    // Admin can see all branches, others only see their own branch
    let query = "SELECT * FROM branches"
    let params = []

    if (req.user.role_id !== 1) {
      query = "SELECT * FROM branches WHERE branch_id = ?"
      params = [req.user.branch_id]
    }

    const [rows] = await pool.query(query, params)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get branch by ID
// @route   GET /api/branches/:id
// @access  Private
exports.getBranchById = async (req, res) => {
  try {
    // Admin can see any branch, others only see their own branch
    if (req.user.role_id !== 1 && req.user.branch_id !== Number.parseInt(req.params.id)) {
      return res.status(403).json({ message: "Not authorized to access this branch" })
    }

    const [rows] = await pool.query("SELECT * FROM branches WHERE branch_id = ?", [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ message: "Branch not found" })
    }

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Create a branch
// @route   POST /api/branches
// @access  Private/Admin
exports.createBranch = async (req, res) => {
  try {
    const { name, address, phone, email } = req.body

    if (!name) {
      return res.status(400).json({ message: "Please provide a branch name" })
    }

    const [result] = await pool.query("INSERT INTO branches (name, address, phone, email) VALUES (?, ?, ?, ?)", [
      name,
      address,
      phone,
      email,
    ])

    if (result.affectedRows === 1) {
      const [rows] = await pool.query("SELECT * FROM branches WHERE branch_id = ?", [result.insertId])

      res.status(201).json(rows[0])
    } else {
      res.status(400).json({ message: "Invalid branch data" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private/Admin
exports.updateBranch = async (req, res) => {
  try {
    const { name, address, phone, email } = req.body

    if (!name) {
      return res.status(400).json({ message: "Please provide a branch name" })
    }

    const [result] = await pool.query(
      "UPDATE branches SET name = ?, address = ?, phone = ?, email = ? WHERE branch_id = ?",
      [name, address, phone, email, req.params.id],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Branch not found" })
    }

    const [rows] = await pool.query("SELECT * FROM branches WHERE branch_id = ?", [req.params.id])

    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private/Admin
exports.deleteBranch = async (req, res) => {
  try {
    // Check if branch has associated users or students
    const [usersCheck] = await pool.query("SELECT COUNT(*) as count FROM users WHERE branch_id = ?", [req.params.id])

    const [studentsCheck] = await pool.query("SELECT COUNT(*) as count FROM students WHERE branch_id = ?", [
      req.params.id,
    ])

    if (usersCheck[0].count > 0 || studentsCheck[0].count > 0) {
      return res.status(400).json({
        message: "Cannot delete branch with associated users or students",
      })
    }

    const [result] = await pool.query("DELETE FROM branches WHERE branch_id = ?", [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Branch not found" })
    }

    res.json({ message: "Branch removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get branch staff
// @route   GET /api/branches/:id/staff
// @access  Private
exports.getBranchStaff = async (req, res) => {
  try {
    // Admin can see any branch staff, others only see their own branch
    if (req.user.role_id !== 1 && req.user.branch_id !== Number.parseInt(req.params.id)) {
      return res.status(403).json({ message: "Not authorized to access this branch" })
    }

    const [rows] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, r.role_name 
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.branch_id = ?`,
      [req.params.id],
    )

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

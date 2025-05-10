const pool = require("../config/db")
const bcrypt = require("bcryptjs")

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Check if user is admin or super admin
    if (req.user.role_id > 2) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const [rows] = await pool.query(`
      SELECT u.user_id, u.full_name, u.email, u.role_id, r.role_name, u.branch_id, b.name as branch_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN branches b ON u.branch_id = b.branch_id
      ORDER BY u.full_name
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    // Only admin can see user details
    if (req.user.role_id !== 1) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const [rows] = await pool.query(
      `SELECT 
        u.user_id, u.full_name, u.email, u.role_id, u.branch_id, 
        r.role_name, 
        b.name as branch_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN branches b ON u.branch_id = b.branch_id
       WHERE u.user_id = ?`,
      [req.params.id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const user = rows[0]

    // Format the response
    const formattedUser = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: {
        id: user.role_id,
        name: user.role_name,
      },
      branch: user.branch_id
        ? {
            id: user.branch_id,
            name: user.branch_name,
          }
        : null,
    }

    res.json(formattedUser)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    // Only admin can update users
    if (req.user.role_id !== 1) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const { fullName, email, branchId } = req.body

    if (!fullName || !email) {
      return res.status(400).json({ message: "Please provide name and email" })
    }

    // Check if user exists
    const [userCheck] = await pool.query("SELECT * FROM users WHERE user_id = ?", [req.params.id])

    if (userCheck.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update user
    const [result] = await pool.query("UPDATE users SET full_name = ?, email = ?, branch_id = ? WHERE user_id = ?", [
      fullName,
      email,
      branchId,
      req.params.id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get updated user
    const [rows] = await pool.query(
      `SELECT 
        u.user_id, u.full_name, u.email, u.role_id, u.branch_id, 
        r.role_name, 
        b.name as branch_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN branches b ON u.branch_id = b.branch_id
       WHERE u.user_id = ?`,
      [req.params.id],
    )

    const user = rows[0]

    // Format the response
    const formattedUser = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: {
        id: user.role_id,
        name: user.role_name,
      },
      branch: user.branch_id
        ? {
            id: user.branch_id,
            name: user.branch_name,
          }
        : null,
    }

    res.json(formattedUser)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/SuperAdmin
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { roleId } = req.body

    // Check if user is super admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ message: "Not authorized to update roles" })
    }

    // Validate role ID
    if (!roleId) {
      return res.status(400).json({ message: "Role ID is required" })
    }

    // Check if role exists
    const [roleRows] = await pool.query("SELECT * FROM roles WHERE role_id = ?", [roleId])
    if (roleRows.length === 0) {
      return res.status(400).json({ message: "Invalid role ID" })
    }

    // Check if user exists
    const [userRows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id])
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update user role
    await pool.query("UPDATE users SET role_id = ? WHERE user_id = ?", [roleId, id])

    res.json({ user_id: Number.parseInt(id), role_id: roleId })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Only admin can delete users
    if (req.user.role_id !== 1) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Check if user exists
    const [userCheck] = await pool.query("SELECT * FROM users WHERE user_id = ?", [req.params.id])

    if (userCheck.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user is the last admin
    if (userCheck[0].role_id === 1) {
      const [adminCount] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role_id = 1")

      if (adminCount[0].count <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin user" })
      }
    }

    // Delete user
    const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get all roles
// @route   GET /api/users/roles
// @access  Private
exports.getRoles = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM roles ORDER BY role_id")
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

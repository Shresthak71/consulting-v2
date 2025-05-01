const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const pool = require("../config/db")

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, roleId, branchId } = req.body

    // Validate input
    if (!fullName || !email || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      })
    }

    // Check if user exists
    const [existingUsers] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role_id, branch_id) VALUES (?, ?, ?, ?, ?)",
      [fullName, email, hashedPassword, roleId, branchId || null],
    )

    if (result.affectedRows === 1) {
      const [newUser] = await pool.query(
        "SELECT user_id, full_name, email, role_id, branch_id FROM users WHERE user_id = ?",
        [result.insertId],
      )

      res.status(201).json({
        success: true,
        data: {
          user: newUser[0],
          token: generateToken(result.insertId),
        },
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data",
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

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    // Check for user
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const user = users[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Get role name
    const [roles] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [user.role_id])

    // Get branch name if branch_id exists
    let branchName = null
    if (user.branch_id) {
      const [branches] = await pool.query("SELECT name FROM branches WHERE branch_id = ?", [user.branch_id])
      if (branches.length > 0) {
        branchName = branches[0].name
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.user_id,
          fullName: user.full_name,
          email: user.email,
          role: roles[0].role_name,
          roleId: user.role_id,
          branchId: user.branch_id,
          branchName,
        },
        token: generateToken(user.user_id),
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const [user] = await pool.query(
      "SELECT user_id, full_name, email, role_id, branch_id FROM users WHERE user_id = ?",
      [req.user.user_id],
    )

    // Get role name
    const [roles] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [user[0].role_id])

    // Get branch name if branch_id exists
    let branchName = null
    if (user[0].branch_id) {
      const [branches] = await pool.query("SELECT name FROM branches WHERE branch_id = ?", [user[0].branch_id])
      if (branches.length > 0) {
        branchName = branches[0].name
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: user[0].user_id,
        fullName: user[0].full_name,
        email: user[0].email,
        role: roles[0].role_name,
        roleId: user[0].role_id,
        branchId: user[0].branch_id,
        branchName,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

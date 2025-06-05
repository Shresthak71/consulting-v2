const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const pool = require("../config/db")

// Generate JWT
const generateToken = (id) => {
  //console.log("secret key is" + process.env.JWT_SECRET)
  return jwt.sign({ id }, "S@cret123#", {
    expiresIn: "30d",
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public/Admin for role assignment
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password,  branchId } = req.body
   const roleId = parseInt(req.body.roleId) || 3 // Default to user role if not provided
    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please add all fields" })
    }

    // Check if user exists
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" })
    }

    // If roleId is provided and it's for super admin (1), check if the request is from a super admin
    if (roleId === 1) {
      // Check if request has authorization header
      const token =
        req.headers.authorization && req.headers.authorization.startsWith("Bearer")
          ? req.headers.authorization.split(" ")[1]
          : null

      if (token) {
        try {
          // Verify token
          const decoded = jwt.verify(token, process.env.JWT_SECRET)

          // Get user from the token
          const [userRows] = await pool.query("SELECT role_id FROM users WHERE user_id = ?", [decoded.id])

          // Check if user is super admin
          if (userRows.length === 0 || userRows[0].role_id !== 1) {
            return res.status(403).json({ message: "Not authorized to create super admin accounts" })
          }
        } catch (error) {
          return res.status(403).json({ message: "Not authorized to create super admin accounts" })
        }
      } else {
        return res.status(403).json({ message: "Not authorized to create super admin accounts" })
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role_id, branch_id) VALUES (?, ?, ?, ?, ?)",
      [fullName, email, hashedPassword, roleId || 3, branchId],
    )

    if (result.affectedRows === 1) {
      // Get the created user
      const [rows] = await pool.query(
        "SELECT user_id, full_name, email, role_id, branch_id FROM users WHERE user_id = ?",
        [result.insertId],
      )

      const user = rows[0]

      // Get role name
      const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [user.role_id])
      const roleName = roleRows.length > 0 ? roleRows[0].role_name : "Unknown"

      // Get branch name if applicable
      let branchName = null
      if (user.branch_id) {
        const [branchRows] = await pool.query("SELECT name FROM branches WHERE branch_id = ?", [user.branch_id])
        if (branchRows.length > 0) {
          branchName = branchRows[0].name
        }
      }

      res.status(201).json({
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: {
          id: user.role_id,
          name: roleName,
        },
        branch: {
          id: user.branch_id,
          name: branchName,
        },
        token: generateToken(user.user_id),
      })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check for user email
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const user = rows[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Get branch name
    let branchName = null
    if (user.branch_id) {
      const [branchRows] = await pool.query("SELECT name FROM branches WHERE branch_id = ?", [user.branch_id])
      if (branchRows.length > 0) {
        branchName = branchRows[0].name
      }
    }

    // Get role name
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [user.role_id])

    const roleName = roleRows.length > 0 ? roleRows[0].role_name : "Unknown"
    console.log("user id is"+user.user_id)

    res.json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: {
        id: user.role_id,
        name: roleName,
      },
      branch: {
        id: user.branch_id,
        name: branchName,
      },
      token: generateToken(user.user_id),
    })
  } catch (error) {
    console.log(error)
    //console.error(error)
    //res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, full_name, email, role_id, branch_id FROM users WHERE user_id = ?",
      [req.user.user_id],
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const user = rows[0]

    // Get branch name
    let branchName = null
    if (user.branch_id) {
      const [branchRows] = await pool.query("SELECT name FROM branches WHERE branch_id = ?", [user.branch_id])
      if (branchRows.length > 0) {
        branchName = branchRows[0].name
      }
    }

    // Get role name
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [user.role_id])

    const roleName = roleRows.length > 0 ? roleRows[0].role_name : "Unknown"

    res.json({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: {
        id: user.role_id,
        name: roleName,
      },
      branch: {
        id: user.branch_id,
        name: branchName,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

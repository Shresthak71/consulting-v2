const jwt = require("jsonwebtoken")
const pool = require("../config/db")

exports.protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from the token
      const [rows] = await pool.query("SELECT user_id, email, role_id, branch_id FROM users WHERE user_id = ?", [
        decoded.id,
      ])

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        })
      }

      req.user = rows[0]
      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    })
  }
}

exports.authorize = (...roles) => {
  return async (req, res, next) => {
    // Get role name from role_id
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])

    if (roleRows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Role not found",
      })
    }

    const roleName = roleRows[0].role_name

    if (!roles.includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: `User role ${roleName} is not authorized to access this route`,
      })
    }
    next()
  }
}

// Branch access middleware
exports.checkBranchAccess = async (req, res, next) => {
  try {
    // Get user role
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])

    const roleName = roleRows[0].role_name

    // Admin and super admin can access all branches
    if (roleName === "admin" || roleName === "super_admin") {
      return next()
    }

    // Check if the requested branch matches the user's branch
    const requestedBranchId = Number.parseInt(req.params.branchId || req.body.branchId)

    if (requestedBranchId && requestedBranchId !== req.user.branch_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access data from this branch",
      })
    }

    next()
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

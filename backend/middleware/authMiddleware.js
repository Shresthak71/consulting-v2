const jwt = require("jsonwebtoken")
const pool = require("../config/db")

exports.protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Verify token
      const decoded = jwt.verify(token, "S@cret123#")

      // Get user from the token
      const [rows] = await pool.query("SELECT user_id, email, role_id, branch_id FROM users WHERE user_id = ?", [
        decoded.id,
      ])

      if (rows.length === 0) {
        return res.status(401).json({ message: "Not authorized" })
      }

      req.user = rows[0]
      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: "Not authorized, token failed" })
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" })
  }
}

// Middleware to check if user has admin role
exports.admin = (req, res, next) => {
  if (req.user && req.user.role_id === 1) {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as an admin" })
  }
}

// Middleware to check if user has branch manager role
exports.branchManager = (req, res, next) => {
  if (req.user && req.user.role_id === 2) {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as a branch manager" })
  }
}

// Middleware to check if user has counselor role
exports.counselor = (req, res, next) => {
  if (req.user && (req.user.role_id === 3 || req.user.role_id === 2 || req.user.role_id === 1)) {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as a counselor" })
  }
}

// Middleware to check if user belongs to the same branch
exports.sameBranch = (req, res, next) => {
  const branchId = Number.parseInt(req.params.branchId || req.body.branchId)

  // Admin can access all branches
  if (req.user.role_id === 1) {
    return next()
  }

  if (req.user.branch_id === branchId) {
    next()
  } else {
    res.status(403).json({ message: "Not authorized to access this branch data" })
  }
}

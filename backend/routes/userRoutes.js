const express = require("express")
const router = express.Router()
const { getUsers, getRoles, updateUserRole } = require("../controllers/userController")
const { protect } = require("../middleware/authMiddleware")

router.get("/", protect, getUsers)
//router.get("/roles", protect, getRoles)
router.get("/roles", getRoles)
router.put("/:id/role", protect, updateUserRole)

module.exports = router

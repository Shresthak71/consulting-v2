const express = require("express")
const router = express.Router()
const {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStaff,
} = require("../controllers/branchController")
const { protect, admin } = require("../middleware/authMiddleware")

router.route("/").get(protect, getBranches).post(protect, admin, createBranch)

router.route("/:id").get(protect, getBranchById).put(protect, admin, updateBranch).delete(protect, admin, deleteBranch)

router.get("/:id/staff", protect, getBranchStaff)

module.exports = router

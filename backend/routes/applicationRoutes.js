const express = require("express")
const router = express.Router()
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController")
const { protect, counselor } = require("../middleware/authMiddleware")

router.route("/").get(protect, getApplications).post(protect, counselor, createApplication)

router.route("/:id").get(protect, getApplicationById).delete(protect, counselor, deleteApplication)

router.put("/:id/status", protect, counselor, updateApplicationStatus)

module.exports = router

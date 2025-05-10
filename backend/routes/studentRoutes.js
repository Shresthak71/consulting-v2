const express = require("express")
const router = express.Router()
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentApplications,
} = require("../controllers/studentController")
const { protect, counselor } = require("../middleware/authMiddleware")

router.route("/").get(protect, getStudents).post(protect, counselor, createStudent)

router
  .route("/:id")
  .get(protect, getStudentById)
  .put(protect, counselor, updateStudent)
  .delete(protect, counselor, deleteStudent)

router.get("/:id/applications", protect, getStudentApplications)

module.exports = router

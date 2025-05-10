const express = require("express")
const router = express.Router()
const {
  getChecklists,
  getChecklistById,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  getChecklistByCountry,
} = require("../controllers/checklistController")
const { protect, admin } = require("../middleware/authMiddleware")

router.route("/").get(protect, getChecklists).post(protect, admin, createChecklist)

router
  .route("/:id")
  .get(protect, getChecklistById)
  .put(protect, admin, updateChecklist)
  .delete(protect, admin, deleteChecklist)

router.get("/country/:id", protect, getChecklistByCountry)

module.exports = router

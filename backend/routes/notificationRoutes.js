const express = require("express")
const { getUserNotifications, markAsRead, sendExpiryReminders } = require("../controllers/notificationController")
const { protect, authorize } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/", protect, getUserNotifications)

router.put("/:id/read", protect, markAsRead)

router.post("/send-expiry-reminders", protect, authorize("admin", "super_admin"), sendExpiryReminders)

// Route for cron job (protected by API key)
router.post("/cron/send-expiry-reminders", sendExpiryReminders)

module.exports = router

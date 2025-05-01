import axiosInstance from "../../api/axiosConfig"

// Get user notifications
const getUserNotifications = async () => {
  const response = await axiosInstance.get("/notifications")
  return response.data.data
}

// Mark notification as read
const markAsRead = async (notificationId) => {
  const response = await axiosInstance.put(`/notifications/${notificationId}/read`)
  return response.data
}

// Send expiry reminders (admin only)
const sendExpiryReminders = async () => {
  const response = await axiosInstance.post("/notifications/send-expiry-reminders")
  return response.data
}

const notificationService = {
  getUserNotifications,
  markAsRead,
  sendExpiryReminders,
}

export default notificationService

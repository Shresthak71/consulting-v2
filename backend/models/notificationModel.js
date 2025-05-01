const pool = require("../config/db")

// Create notification
exports.createNotification = async (userId, type, message, entityId = null, entityType = null, branchId = null) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO notifications (user_id, type, message, entity_id, entity_type, branch_id, created_at, is_read) VALUES (?, ?, ?, ?, ?, ?, NOW(), FALSE)",
      [userId, type, message, entityId, entityType, branchId],
    )

    return result.insertId
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Get user notifications
exports.getUserNotifications = async (userId, limit = 20, offset = 0) => {
  try {
    const [notifications] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [userId, limit, offset],
    )

    return notifications
  } catch (error) {
    console.error("Error getting user notifications:", error)
    throw error
  }
}

// Mark notification as read
exports.markAsRead = async (notificationId, userId) => {
  try {
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?",
      [notificationId, userId],
    )

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Get unread count
exports.getUnreadCount = async (userId) => {
  try {
    const [result] = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [userId],
    )

    return result[0].count
  } catch (error) {
    console.error("Error getting unread count:", error)
    throw error
  }
}

// Create branch notification (for all users in a branch)
exports.createBranchNotification = async (branchId, type, message, entityId = null, entityType = null) => {
  try {
    // Get all users in the branch
    const [users] = await pool.query("SELECT user_id FROM users WHERE branch_id = ?", [branchId])

    // Create a notification for each user
    const promises = users.map((user) =>
      exports.createNotification(user.user_id, type, message, entityId, entityType, branchId),
    )

    await Promise.all(promises)

    return true
  } catch (error) {
    console.error("Error creating branch notification:", error)
    throw error
  }
}

const notificationModel = require("../models/notificationModel")
const pool = require("../config/db")
const nodemailer = require("nodemailer")

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const userId = req.user.user_id

    const notifications = await notificationModel.getUserNotifications(
      userId,
      Number.parseInt(limit),
      Number.parseInt(offset),
    )

    const unreadCount = await notificationModel.getUnreadCount(userId)

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.user_id

    const success = await notificationModel.markAsRead(id, userId)

    if (success) {
      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      })
    } else {
      res.status(404).json({
        success: false,
        message: "Notification not found or not owned by user",
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

// @desc    Send document expiry notifications
// @route   POST /api/notifications/send-expiry-reminders
// @access  Private (Admin only or via cron job)
exports.sendExpiryReminders = async (req, res) => {
  try {
    // Check if request is from admin or authorized cron job
    if (req.user) {
      const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])
      const roleName = roleRows[0].role_name

      if (roleName !== "admin" && roleName !== "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to send expiry reminders",
        })
      }
    } else if (req.headers["x-api-key"] !== process.env.CRON_API_KEY) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    // Get documents expiring in the next 30 days
    const [expiringDocuments] = await pool.query(
      `SELECT 
        ad.app_doc_id, ad.file_path, ad.status, ad.uploaded_at, ad.expiry_date, ad.expiry_notification_sent,
        d.document_id, d.document_name,
        a.application_id, a.counselor_id,
        s.student_id, s.full_name as student_name, s.email as student_email,
        b.branch_id, b.name as branch_name,
        u.email as counselor_email, u.full_name as counselor_name
      FROM application_documents ad
      JOIN documents d ON ad.document_id = d.document_id
      JOIN applications a ON ad.application_id = a.application_id
      JOIN students s ON a.student_id = s.student_id
      JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN users u ON a.counselor_id = u.user_id
      WHERE ad.expiry_date IS NOT NULL
      AND ad.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      AND ad.expiry_notification_sent = FALSE`,
    )

    // Send notifications and emails
    const notificationPromises = []
    const emailPromises = []
    const documentUpdatePromises = []

    for (const doc of expiringDocuments) {
      // Create notification for counselor if assigned
      if (doc.counselor_id) {
        const message = `Document "${doc.document_name}" for student ${doc.student_name} will expire on ${new Date(doc.expiry_date).toLocaleDateString()}`

        notificationPromises.push(
          notificationModel.createNotification(
            doc.counselor_id,
            "DOCUMENT_EXPIRY",
            message,
            doc.app_doc_id,
            "document",
            doc.branch_id,
          ),
        )

        // Send email to counselor
        if (doc.counselor_email) {
          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: doc.counselor_email,
            subject: "Document Expiry Notification",
            html: `
              <h1>Document Expiry Notification</h1>
              <p>Hello ${doc.counselor_name},</p>
              <p>This is to inform you that the following document will expire soon:</p>
              <ul>
                <li><strong>Document:</strong> ${doc.document_name}</li>
                <li><strong>Student:</strong> ${doc.student_name}</li>
                <li><strong>Expiry Date:</strong> ${new Date(doc.expiry_date).toLocaleDateString()}</li>
              </ul>
              <p>Please take necessary action to renew this document.</p>
              <p>Regards,<br>Education Consulting System</p>
            `,
          }

          emailPromises.push(transporter.sendMail(mailOptions))
        }
      }

      // Create branch notification
      const branchMessage = `Document "${doc.document_name}" for student ${doc.student_name} will expire on ${new Date(doc.expiry_date).toLocaleDateString()}`

      notificationPromises.push(
        notificationModel.createBranchNotification(
          doc.branch_id,
          "DOCUMENT_EXPIRY",
          branchMessage,
          doc.app_doc_id,
          "document",
        ),
      )

      // Mark document as notification sent
      documentUpdatePromises.push(
        pool.query("UPDATE application_documents SET expiry_notification_sent = TRUE WHERE app_doc_id = ?", [
          doc.app_doc_id,
        ]),
      )
    }

    // Wait for all promises to resolve
    await Promise.all([...notificationPromises, ...emailPromises, ...documentUpdatePromises])

    res.status(200).json({
      success: true,
      message: `Sent expiry reminders for ${expiringDocuments.length} documents`,
      data: {
        documentCount: expiringDocuments.length,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

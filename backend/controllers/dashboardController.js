const pool = require("../config/db")

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    let branchCondition = ""
    let params = []

    // If not admin, filter by branch
    if (req.user.role_id !== 1) {
      branchCondition = "WHERE s.branch_id = ?"
      params = [req.user.branch_id]
    }

    // Get total students
    const [studentsCount] = await pool.query(`SELECT COUNT(*) as count FROM students s ${branchCondition}`, params)

    // Get applications by status
    const [applicationStats] = await pool.query(
      `SELECT 
        application_status, 
        COUNT(*) as count 
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       ${branchCondition}
       GROUP BY application_status`,
      params,
    )

    // Get document status stats
    const [documentStats] = await pool.query(
      `SELECT 
        ad.status, 
        COUNT(*) as count 
       FROM application_documents ad
       JOIN applications a ON ad.application_id = a.application_id
       JOIN students s ON a.student_id = s.student_id
       ${branchCondition}
       GROUP BY ad.status`,
      params,
    )

    // Get applications by country
    const [countryStats] = await pool.query(
      `SELECT 
        c.name as country, 
        COUNT(*) as count 
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       JOIN courses co ON a.course_id = co.course_id
       JOIN universities u ON co.university_id = u.university_id
       JOIN countries c ON u.country_id = c.country_id
       ${branchCondition}
       GROUP BY c.country_id`,
      params,
    )

    // Get recent applications
    const [recentApplications] = await pool.query(
      `SELECT 
        a.application_id,
        a.application_status,
        a.submitted_at,
        s.full_name as student_name,
        c.name as country,
        u.name as university,
        co.name as course
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       JOIN courses co ON a.course_id = co.course_id
       JOIN universities u ON co.university_id = u.university_id
       JOIN countries c ON u.country_id = c.country_id
       ${branchCondition}
       ORDER BY a.submitted_at DESC
       LIMIT 5`,
      params,
    )

    // Get branch stats if admin
    let branchStats = []
    if (req.user.role_id === 1) {
      ;[branchStats] = await pool.query(
        `SELECT 
          b.name as branch, 
          COUNT(DISTINCT s.student_id) as students,
          COUNT(DISTINCT a.application_id) as applications
         FROM branches b
         LEFT JOIN students s ON b.branch_id = s.branch_id
         LEFT JOIN applications a ON s.student_id = a.student_id
         GROUP BY b.branch_id`,
      )
    }

    res.json({
      totalStudents: studentsCount[0].count,
      applicationsByStatus: applicationStats,
      documentsByStatus: documentStats,
      applicationsByCountry: countryStats,
      recentApplications,
      branchStats,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get monthly application trends
// @route   GET /api/dashboard/trends
// @access  Private
exports.getApplicationTrends = async (req, res) => {
  try {
    let branchCondition = ""
    let params = []

    // If not admin, filter by branch
    if (req.user.role_id !== 1) {
      branchCondition = "WHERE s.branch_id = ?"
      params = [req.user.branch_id]
    }

    // Get monthly application counts for the last 12 months
    const [monthlyTrends] = await pool.query(
      `SELECT 
        DATE_FORMAT(a.submitted_at, '%Y-%m') as month,
        COUNT(*) as count
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       ${branchCondition}
       WHERE a.submitted_at IS NOT NULL
       AND a.submitted_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(a.submitted_at, '%Y-%m')
       ORDER BY month`,
      params,
    )

    // Get monthly visa approval counts
    const [visaTrends] = await pool.query(
      `SELECT 
        DATE_FORMAT(a.submitted_at, '%Y-%m') as month,
        COUNT(*) as count
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       ${branchCondition}
       WHERE a.application_status = 'approved'
       AND a.submitted_at IS NOT NULL
       AND a.submitted_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(a.submitted_at, '%Y-%m')
       ORDER BY month`,
      params,
    )

    res.json({
      monthlyApplications: monthlyTrends,
      monthlyApprovals: visaTrends,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// @desc    Get document completion stats
// @route   GET /api/dashboard/documents
// @access  Private
exports.getDocumentStats = async (req, res) => {
  try {
    let branchCondition = ""
    let params = []

    // If not admin, filter by branch
    if (req.user.role_id !== 1) {
      branchCondition = "WHERE s.branch_id = ?"
      params = [req.user.branch_id]
    }

    // Get document completion stats for active applications
    const [documentCompletion] = await pool.query(
      `SELECT 
        a.application_id,
        s.full_name as student_name,
        c.name as country,
        u.name as university,
        COUNT(ci.item_id) as total_required,
        COUNT(ad.app_doc_id) as total_submitted,
        SUM(CASE WHEN ad.status = 'approved' THEN 1 ELSE 0 END) as total_approved
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       JOIN courses co ON a.course_id = co.course_id
       JOIN universities u ON co.university_id = u.university_id
       JOIN countries c ON u.country_id = c.country_id
       JOIN checklists ch ON c.country_id = ch.country_id
       JOIN checklist_items ci ON ch.checklist_id = ci.checklist_id
       LEFT JOIN application_documents ad ON a.application_id = ad.application_id AND ci.document_id = ad.document_id
       ${branchCondition}
       WHERE a.application_status NOT IN ('approved', 'rejected')
       GROUP BY a.application_id
       ORDER BY total_approved / total_required DESC`,
      params,
    )

    res.json(documentCompletion)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

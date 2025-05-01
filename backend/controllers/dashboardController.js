const pool = require("../config/db")

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const { branchId } = req.query
    const userId = req.user.user_id

    // Get user role
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])

    const roleName = roleRows[0].role_name

    // Branch condition for queries
    let branchCondition = ""
    let branchParams = []

    if (branchId) {
      branchCondition = "AND s.branch_id = ?"
      branchParams = [branchId]
    } else if (roleName !== "admin" && roleName !== "super_admin") {
      // Non-admin users can only see their branch data
      branchCondition = "AND s.branch_id = ?"
      branchParams = [req.user.branch_id]
    }

    // Total students
    const [totalStudents] = await pool.query(
      `SELECT COUNT(*) as count FROM students s WHERE 1=1 ${branchCondition}`,
      branchParams,
    )

    // Total applications
    const [totalApplications] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM applications a 
       JOIN students s ON a.student_id = s.student_id 
       WHERE 1=1 ${branchCondition}`,
      branchParams,
    )

    // Applications by status
    const [applicationsByStatus] = await pool.query(
      `SELECT application_status, COUNT(*) as count 
       FROM applications a 
       JOIN students s ON a.student_id = s.student_id 
       WHERE 1=1 ${branchCondition}
       GROUP BY application_status`,
      branchParams,
    )

    // Applications by country
    const [applicationsByCountry] = await pool.query(
      `SELECT c.name as country, COUNT(*) as count 
       FROM applications a 
       JOIN students s ON a.student_id = s.student_id 
       JOIN courses co ON a.course_id = co.course_id 
       JOIN universities u ON co.university_id = u.university_id 
       JOIN countries c ON u.country_id = c.country_id 
       WHERE 1=1 ${branchCondition}
       GROUP BY c.country_id`,
      branchParams,
    )

    // Recent applications
    const [recentApplications] = await pool.query(
      `SELECT a.application_id, a.application_status, a.submitted_at, 
              s.full_name as student_name, 
              c.name as country_name,
              u.name as university_name,
              co.name as course_name
       FROM applications a 
       JOIN students s ON a.student_id = s.student_id 
       JOIN courses co ON a.course_id = co.course_id 
       JOIN universities u ON co.university_id = u.university_id 
       JOIN countries c ON u.country_id = c.country_id 
       WHERE 1=1 ${branchCondition}
       ORDER BY a.submitted_at DESC
       LIMIT 5`,
      branchParams,
    )

    // Document completion stats
    const [documentStats] = await pool.query(
      `SELECT 
         COUNT(DISTINCT a.application_id) as total_applications,
         COUNT(DISTINCT CASE WHEN ad.status = 'approved' THEN ad.application_id END) as complete_applications,
         COUNT(DISTINCT CASE WHEN ad.status = 'pending' THEN ad.application_id END) as pending_applications,
         COUNT(DISTINCT CASE WHEN ad.status = 'rejected' THEN ad.application_id END) as rejected_applications
       FROM applications a
       JOIN students s ON a.student_id = s.student_id
       LEFT JOIN application_documents ad ON a.application_id = ad.application_id
       WHERE 1=1 ${branchCondition}`,
      branchParams,
    )

    res.status(200).json({
      success: true,
      data: {
        totalStudents: totalStudents[0].count,
        totalApplications: totalApplications[0].count,
        applicationsByStatus,
        applicationsByCountry,
        recentApplications,
        documentStats: documentStats[0],
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

// @desc    Get branch performance comparison
// @route   GET /api/dashboard/branch-comparison
// @access  Private (Admin only)
exports.getBranchComparison = async (req, res) => {
  try {
    // Check if user is admin
    const [roleRows] = await pool.query("SELECT role_name FROM roles WHERE role_id = ?", [req.user.role_id])

    const roleName = roleRows[0].role_name

    if (roleName !== "admin" && roleName !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      })
    }

    // Get branch performance data
    const [branchPerformance] = await pool.query(
      `SELECT 
         b.branch_id,
         b.name as branch_name,
         COUNT(DISTINCT s.student_id) as total_students,
         COUNT(DISTINCT a.application_id) as total_applications,
         COUNT(DISTINCT CASE WHEN a.application_status = 'approved' THEN a.application_id END) as approved_applications,
         COUNT(DISTINCT CASE WHEN a.application_status = 'rejected' THEN a.application_id END) as rejected_applications,
         COUNT(DISTINCT CASE WHEN ad.status = 'approved' THEN ad.application_id END) as complete_documents
       FROM branches b
       LEFT JOIN students s ON b.branch_id = s.branch_id
       LEFT JOIN applications a ON s.student_id = a.student_id
       LEFT JOIN application_documents ad ON a.application_id = ad.application_id
       GROUP BY b.branch_id, b.name`,
    )

    res.status(200).json({
      success: true,
      data: branchPerformance,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server Error",
    })
  }
}

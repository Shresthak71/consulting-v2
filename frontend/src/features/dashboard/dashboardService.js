import axiosInstance from "../../api/axiosConfig"

// Get dashboard stats
const getDashboardStats = async (branchId) => {
  const url = branchId ? `/dashboard/stats?branchId=${branchId}` : "/dashboard/stats"
  const response = await axiosInstance.get(url)
  return response.data.data
}

// Get branch comparison
const getBranchComparison = async () => {
  const response = await axiosInstance.get("/dashboard/branch-comparison")
  return response.data.data
}

const dashboardService = {
  getDashboardStats,
  getBranchComparison,
}

export default dashboardService

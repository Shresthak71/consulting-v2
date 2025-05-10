import axios from "../../api/axiosConfig"

// Get dashboard stats
const getDashboardStats = async () => {
  const response = await axios.get("/dashboard/stats")
  return response.data
}

// Get application trends
const getApplicationTrends = async () => {
  const response = await axios.get("/dashboard/trends")
  return response.data
}

// Get document stats
const getDocumentStats = async () => {
  const response = await axios.get("/dashboard/documents")
  return response.data
}

const dashboardService = {
  getDashboardStats,
  getApplicationTrends,
  getDocumentStats,
}

export default dashboardService

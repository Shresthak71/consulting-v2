import axios from "../../api/axiosConfig"

// Get all applications
const getApplications = async (filters = {}) => {
  let queryString = ""
  if (filters.status) queryString += `status=${filters.status}&`
  if (filters.branch) queryString += `branch=${filters.branch}&`
  if (filters.country) queryString += `country=${filters.country}&`

  const url = queryString ? `/applications?${queryString.slice(0, -1)}` : "/applications"
  const response = await axios.get(url)
  return response.data
}

// Get application by ID
const getApplicationById = async (applicationId) => {
  const response = await axios.get(`/applications/${applicationId}`)
  return response.data
}

// Create new application
const createApplication = async (applicationData) => {
  const response = await axios.post("/applications", applicationData)
  return response.data
}

// Update application status
const updateApplicationStatus = async (applicationId, status) => {
  const response = await axios.put(`/applications/${applicationId}/status`, { status })
  return response.data
}

// Delete application
const deleteApplication = async (applicationId) => {
  const response = await axios.delete(`/applications/${applicationId}`)
  return response.data
}

const applicationService = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
}

export default applicationService

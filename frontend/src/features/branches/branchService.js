import axios from "../../api/axiosConfig"

// Get all branches
const getBranches = async () => {
  const response = await axios.get("/branches")
  return response.data
}

// Get branch by ID
const getBranchById = async (branchId) => {
  const response = await axios.get(`/branches/${branchId}`)
  return response.data
}

// Create new branch
const createBranch = async (branchData) => {
  const response = await axios.post("/branches", branchData)
  return response.data
}

// Update branch
const updateBranch = async (branchId, branchData) => {
  const response = await axios.put(`/branches/${branchId}`, branchData)
  return response.data
}

// Delete branch
const deleteBranch = async (branchId) => {
  const response = await axios.delete(`/branches/${branchId}`)
  return response.data
}

// Get branch staff
const getBranchStaff = async (branchId) => {
  const response = await axios.get(`/branches/${branchId}/staff`)
  return response.data
}

const branchService = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStaff,
}

export default branchService

import axios from "../../api/axiosConfig"

// Get all users
const getUsers = async () => {
  const response = await axios.get("/users")
  return response.data
}

// Get all roles
const getRoles = async () => {
  const response = await axios.get("/users/roles")
  return response.data
}

// Update user role
const updateUserRole = async (userData) => {
  const response = await axios.put(`/users/${userData.userId}/role`, { roleId: userData.roleId })
  return response.data
}

const userService = {
  getUsers,
  getRoles,
  updateUserRole,
}

export default userService

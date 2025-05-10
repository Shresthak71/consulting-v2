import axios from "../../api/axiosConfig"

// Register user
const register = async (userData) => {
  const response = await axios.post("/auth/register", userData)

  // Only store user data if this is an admin creating a user
  // For public registration, we want them to log in separately
  if (response.data && userData.isAdminCreating) {
    localStorage.setItem("user", JSON.stringify(response.data))
    localStorage.setItem("token", response.data.token)
  }

  return response.data
}

// Login user
const login = async (userData) => {
  const response = await axios.post("/auth/login", userData)

  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data))
    localStorage.setItem("token", response.data.token)
  }

  return response.data
}

// Logout user
const logout = () => {
  localStorage.removeItem("user")
  localStorage.removeItem("token")
}

// Get user profile
const getProfile = async () => {
  const response = await axios.get("/auth/me")
  return response.data
}

const authService = {
  register,
  login,
  logout,
  getProfile,
}

export default authService

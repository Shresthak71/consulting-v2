import axiosInstance from "../../api/axiosConfig"

// Register user
const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData)

  if (response.data.success) {
    localStorage.setItem("user", JSON.stringify(response.data.data.user))
    localStorage.setItem("token", response.data.data.token)
  }

  return response.data.data
}

// Login user
const login = async (userData) => {
  const response = await axiosInstance.post("/auth/login", userData)

  if (response.data.success) {
    localStorage.setItem("user", JSON.stringify(response.data.data.user))
    localStorage.setItem("token", response.data.data.token)
  }

  return response.data.data
}

// Logout user
const logout = () => {
  localStorage.removeItem("user")
  localStorage.removeItem("token")
}

// Get current user
const getCurrentUser = async () => {
  const response = await axiosInstance.get("/auth/me")
  return response.data.data
}

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
}

export default authService

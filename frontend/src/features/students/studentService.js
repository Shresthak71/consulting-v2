import axios from "../../api/axiosConfig"

// Get all students
const getStudents = async () => {
  const response = await axios.get("/students")
  return response.data
}

// Get student by ID
const getStudentById = async (studentId) => {
  const response = await axios.get(`/students/${studentId}`)
  return response.data
}

// Create new student
const createStudent = async (studentData) => {
  const response = await axios.post("/students", {
    fullName: studentData.fullName,
    email: studentData.email,
    phone: studentData.phone,
    branchId: studentData.branchId,
    registeredBy: studentData.registeredBy,
  })
  return response.data
}

// Update student
const updateStudent = async (studentId, studentData) => {
  const response = await axios.put(`/students/${studentId}`, studentData)
  return response.data
}

// Delete student
const deleteStudent = async (studentId) => {
  const response = await axios.delete(`/students/${studentId}`)
  return response.data
}

// Get student applications
const getStudentApplications = async (studentId) => {
  const response = await axios.get(`/students/${studentId}/applications`)
  return response.data
}

const studentService = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentApplications,
}

export default studentService

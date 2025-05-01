import axiosInstance from "../../api/axiosConfig"

// Import students
const importStudents = async (formData) => {
  const response = await axiosInstance.post("/bulk/import/students", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data.data
}

// Export functions don't need to be in the service since they're direct downloads

const bulkService = {
  importStudents,
}

export default bulkService

import axiosInstance from "../../api/axiosConfig"

// Upload document
const uploadDocument = async (applicationId, documentId, formData) => {
  const response = await axiosInstance.post(`/documents/upload/${applicationId}/${documentId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data.data
}

// Update document status
const updateDocumentStatus = async (appDocId, status) => {
  const response = await axiosInstance.put(`/documents/status/${appDocId}`, { status })
  return response.data
}

// Get application documents
const getApplicationDocuments = async (applicationId) => {
  const response = await axiosInstance.get(`/documents/application/${applicationId}`)
  return response.data.data
}

// Get expiring documents
const getExpiringDocuments = async (url) => {
  const response = await axiosInstance.get(url)
  return response.data.data
}

// Update document expiry date
const updateExpiryDate = async (appDocId, expiryDate) => {
  const response = await axiosInstance.put(`/documents/expiry/${appDocId}`, { expiryDate })
  return response.data
}

const documentService = {
  uploadDocument,
  updateDocumentStatus,
  getApplicationDocuments,
  getExpiringDocuments,
  updateExpiryDate,
}

export default documentService

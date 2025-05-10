import axios from "../../api/axiosConfig"

// Upload document
const uploadDocument = async (formData) => {
  const response = await axios.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

// Get application documents
const getApplicationDocuments = async (applicationId) => {
  const response = await axios.get(`/documents/application/${applicationId}`)
  return response.data
}

// Update document status
const updateDocumentStatus = async (documentId, status) => {
  const response = await axios.put(`/documents/${documentId}/status`, { status })
  return response.data
}

// Delete document
const deleteDocument = async (documentId) => {
  const response = await axios.delete(`/documents/${documentId}`)
  return response.data
}

// Get document types
const getDocumentTypes = async () => {
  const response = await axios.get("/documents/types")
  return response.data
}

// Create document type
const createDocumentType = async (documentData) => {
  const response = await axios.post("/documents/types", documentData)
  return response.data
}

// Update document type
const updateDocumentType = async (documentId, documentData) => {
  const response = await axios.put(`/documents/types/${documentId}`, documentData)
  return response.data
}

const documentService = {
  uploadDocument,
  getApplicationDocuments,
  updateDocumentStatus,
  deleteDocument,
  getDocumentTypes,
  createDocumentType,
  updateDocumentType,
}

export default documentService

"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { uploadDocument, getDocumentTypes, reset } from "../features/documents/documentSlice"
import { toast } from "react-toastify"
import { FaUpload, FaSpinner } from "react-icons/fa"

function DocumentUpload({ applicationId, onUploadComplete }) {
  const dispatch = useDispatch()
  const { documentTypes, isLoading, isSuccess, isError, message, uploadProgress } = useSelector(
    (state) => state.document,
  )

  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    dispatch(getDocumentTypes())

    return () => {
      dispatch(reset())
    }
  }, [dispatch])

  useEffect(() => {
    if (isError) {
      toast.error(message)
      setUploading(false)
    }

    if (isSuccess && uploading) {
      toast.success("Document uploaded successfully")
      setSelectedFile(null)
      setSelectedDocumentId("")
      setUploading(false)
      if (onUploadComplete) {
        onUploadComplete()
      }
    }
  }, [isSuccess, isError, message, uploading, onUploadComplete])

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleDocumentTypeChange = (e) => {
    setSelectedDocumentId(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Please select a file")
      return
    }

    if (!selectedDocumentId) {
      toast.error("Please select a document type")
      return
    }

    const formData = new FormData()
    formData.append("document", selectedFile)
    formData.append("applicationId", applicationId)
    formData.append("documentId", selectedDocumentId)

    setUploading(true)
    dispatch(uploadDocument(formData))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            id="documentType"
            value={selectedDocumentId}
            onChange={handleDocumentTypeChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Document Type</option>
            {documentTypes.map((doc) => (
              <option key={doc.document_id} value={doc.document_id}>
                {doc.document_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Accepted formats: PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX (Max size: 10MB)
          </p>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !selectedFile || !selectedDocumentId}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2 -ml-1" /> Uploading...
            </>
          ) : (
            <>
              <FaUpload className="mr-2 -ml-1" /> Upload Document
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default DocumentUpload

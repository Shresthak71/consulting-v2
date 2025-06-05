"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  getApplicationDocuments,
  updateDocumentStatus,
  deleteDocument,
  reset,
} from "../features/documents/documentSlice"
import { toast } from "react-toastify"
import { FaDownload, FaTrash, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa"
import Modal from "./Modal"
import DocumentUpload from "../pages/DocumentUpload"

function ApplicationDocuments({ applicationId }) {
  const dispatch = useDispatch()
  const { documents, isLoading, isError, message } = useSelector((state) => state.document)
  const { user } = useSelector((state) => state.auth)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [showUploadForm, setShowUploadForm] = useState(false)

  useEffect(() => {
    if (applicationId) {
      dispatch(getApplicationDocuments(applicationId))
    }

    return () => {
      dispatch(reset())
    }
  }, [dispatch, applicationId])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const confirmDelete = (documentId) => {
    setDocumentToDelete(documentId)
    setShowDeleteModal(true)
  }

  const handleDelete = () => {
    dispatch(deleteDocument(documentToDelete))
      .unwrap()
      .then(() => {
        toast.success("Document deleted successfully")
        setShowDeleteModal(false)
      })
      .catch((error) => {
        toast.error(error)
      })
  }

  const handleStatusChange = (documentId, status) => {
    dispatch(updateDocumentStatus({ documentId, status }))
      .unwrap()
      .then(() => {
        toast.success(`Document status updated to ${status}`)
      })
      .catch((error) => {
        toast.error(error)
      })
  }

  const handleUploadComplete = () => {
    setShowUploadForm(false)
    dispatch(getApplicationDocuments(applicationId))
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FaCheckCircle className="text-green-500" />
      case "rejected":
        return <FaTimesCircle className="text-red-500" />
      case "pending":
      default:
        return <FaSpinner className="text-yellow-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Application Documents</h2>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-white text-indigo-600 hover:bg-indigo-50 text-sm font-medium py-1 px-3 rounded-md"
        >
          {showUploadForm ? "Hide Upload Form" : "Upload Document"}
        </button>
      </div>

      {showUploadForm && (
        <div className="p-4 border-b border-gray-200">
          <DocumentUpload applicationId={applicationId} onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {documents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.app_doc_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doc.document_name}</div>
                    <div className="text-xs text-gray-500">{doc.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(doc.status)}
                      <span
                        className={`ml-1.5 inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${getStatusBadgeClass(
                          doc.status,
                        )}`}
                      >
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </div>
                    {(user.role_id === 1 || user.role_id === 2) && (
                      <div className="mt-1 flex space-x-1">
                        <button
                          onClick={() => handleStatusChange(doc.app_doc_id, "approved")}
                          className="text-xs text-green-600 hover:text-green-900"
                          disabled={doc.status === "approved"}
                        >
                          Approve
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleStatusChange(doc.app_doc_id, "rejected")}
                          className="text-xs text-red-600 hover:text-red-900"
                          disabled={doc.status === "rejected"}
                        >
                          Reject
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleStatusChange(doc.app_doc_id, "pending")}
                          className="text-xs text-yellow-600 hover:text-yellow-900"
                          disabled={doc.status === "pending"}
                        >
                          Pending
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(doc.uploaded_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Download"
                    >
                      <FaDownload />
                    </a>
                    <button
                      onClick={() => confirmDelete(doc.app_doc_id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No documents uploaded for this application.</p>
          <p className="text-sm text-gray-400 mt-1">Click the "Upload Document" button to add documents.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        footer={
          <>
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this document? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

export default ApplicationDocuments

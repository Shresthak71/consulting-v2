"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { getDocumentTypes, deleteDocumentType, reset } from "../features/documents/documentSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa"
import Spinner from "../components/Spinner"
import Modal from "../components/Modal"

function DocumentList() {
  const dispatch = useDispatch()
  const {
    documentTypes = [],
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.document || { documentTypes: [] })
  const { user } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)

  useEffect(() => {
    dispatch(getDocumentTypes())

    return () => {
      dispatch(reset())
    }
  }, [dispatch])

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
    dispatch(deleteDocumentType(documentToDelete))
      .unwrap()
      .then(() => {
        toast.success("Document type deleted successfully")
        setShowDeleteModal(false)
      })
      .catch((error) => {
        toast.error(error)
      })
  }

  const filteredDocuments = documentTypes.filter(
    (doc) =>
      doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Document Types</h1>
          {user && (user.role_id === 1 || user.role_id === 2) && (
            <Link
              to="/documents/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Add Document Type
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search document types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <tr key={document.document_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{document.document_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{document.description || "No description"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user && (user.role_id === 1 || user.role_id === 2) && (
                          <>
                            <Link
                              to={`/documents/${document.document_id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <FaEdit className="inline mr-1" /> Edit
                            </Link>
                            <button
                              onClick={() => confirmDelete(document.document_id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash className="inline mr-1" /> Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No document types found.</p>
            </div>
          )}
        </div>
      </div>

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
          Are you sure you want to delete this document type? This action cannot be undone and may affect existing
          applications.
        </p>
      </Modal>
    </>
  )
}

export default DocumentList

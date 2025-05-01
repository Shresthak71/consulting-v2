"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { getApplicationDocuments, uploadDocument, updateDocumentStatus } from "../features/document/documentSlice"
import { toast } from "react-toastify"

const ChecklistPage = () => {
  const { applicationId } = useParams()
  const dispatch = useDispatch()
  const { documents, isLoading, isSuccess, isError, message } = useSelector((state) => state.document)
  const { user } = useSelector((state) => state.auth)

  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingDocId, setUploadingDocId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    dispatch(getApplicationDocuments(applicationId))
  }, [dispatch, applicationId])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const handleFileChange = (e, documentId) => {
    setSelectedFile(e.target.files[0])
    setUploadingDocId(documentId)
  }

  const handleUpload = async (e, documentId) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    const formData = new FormData()
    formData.append("document", selectedFile)

    setIsUploading(true)

    try {
      await dispatch(
        uploadDocument({
          applicationId,
          documentId,
          formData,
        }),
      ).unwrap()

      toast.success("Document uploaded successfully")
      dispatch(getApplicationDocuments(applicationId))
      setSelectedFile(null)
      setUploadingDocId(null)
    } catch (error) {
      toast.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleStatusChange = async (appDocId, status) => {
    try {
      await dispatch(
        updateDocumentStatus({
          appDocId,
          status,
        }),
      ).unwrap()

      toast.success("Document status updated successfully")
      dispatch(getApplicationDocuments(applicationId))
    } catch (error) {
      toast.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Document Checklist</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Application Documents</h2>

          {documents.length === 0 ? (
            <p className="text-gray-500">No documents found for this application.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.app_doc_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doc.document_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doc.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : doc.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* View document */}
                          <a
                            href={`${process.env.REACT_APP_API_URL}/${doc.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </a>

                          {/* Upload new version */}
                          <div className="relative">
                            <input
                              type="file"
                              id={`file-${doc.document_id}`}
                              className="sr-only"
                              onChange={(e) => handleFileChange(e, doc.document_id)}
                            />
                            <label
                              htmlFor={`file-${doc.document_id}`}
                              className="cursor-pointer text-indigo-600 hover:text-indigo-900"
                            >
                              Replace
                            </label>
                            {selectedFile && uploadingDocId === doc.document_id && (
                              <button
                                onClick={(e) => handleUpload(e, doc.document_id)}
                                disabled={isUploading}
                                className="ml-2 text-green-600 hover:text-green-900"
                              >
                                {isUploading ? "Uploading..." : "Upload"}
                              </button>
                            )}
                          </div>

                          {/* Status change buttons (admin/counselor only) */}
                          {(user.role === "admin" || user.role === "super_admin" || user.role === "counselor") && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusChange(doc.app_doc_id, "approved")}
                                disabled={doc.status === "approved"}
                                className={`text-green-600 hover:text-green-900 ${doc.status === "approved" ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(doc.app_doc_id, "rejected")}
                                disabled={doc.status === "rejected"}
                                className={`text-red-600 hover:text-red-900 ${doc.status === "rejected" ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChecklistPage

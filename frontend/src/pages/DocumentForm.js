"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { createDocumentType, updateDocumentType, getDocumentTypes, reset } from "../features/documents/documentSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaSave, FaTimes } from "react-icons/fa"
import Spinner from "../components/Spinner"

function DocumentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { documentTypes, isLoading, isSuccess, isError, message } = useSelector((state) => state.document)
  const { user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    documentName: "",
    description: "",
  })

  const { documentName, description } = formData

  useEffect(() => {
    // Check if user has admin or manager role
    if (user && user.role_id !== 1 && user.role_id !== 2) {
      toast.error("Not authorized")
      navigate("/dashboard")
    }

    if (id) {
      dispatch(getDocumentTypes())
    }

    return () => {
      dispatch(reset())
    }
  }, [id, user, navigate, dispatch])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess) {
      dispatch(reset())
      navigate("/documents")
    }
  }, [isSuccess, isError, message, navigate, dispatch])

  useEffect(() => {
    if (id && documentTypes.length > 0) {
      const documentType = documentTypes.find((doc) => doc.document_id.toString() === id)
      if (documentType) {
        setFormData({
          documentName: documentType.document_name,
          description: documentType.description || "",
        })
      } else {
        toast.error("Document type not found")
        navigate("/documents")
      }
    }
  }, [id, documentTypes, navigate])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (!documentName) {
      toast.error("Please enter a document name")
      return
    }

    if (id) {
      dispatch(updateDocumentType({ documentId: id, documentData: { documentName, description } }))
    } else {
      dispatch(createDocumentType({ documentName, description }))
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            {id ? "Edit Document Type" : "Create Document Type"}
          </h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <form onSubmit={onSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="documentName"
                  name="documentName"
                  value={documentName}
                  onChange={onChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter document name"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={onChange}
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter document description"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/documents")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaTimes className="mr-2 -ml-1" /> Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaSave className="mr-2 -ml-1" /> {id ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default DocumentForm

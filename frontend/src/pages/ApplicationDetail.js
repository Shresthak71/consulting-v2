"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  reset,
} from "../features/applications/applicationSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaGraduationCap,
  FaGlobe,
  FaEdit,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa"
import Spinner from "../components/Spinner"
import Modal from "../components/Modal"
import ApplicationDocuments from "../components/ApplicationDocuments"

function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { application, isLoading, isError, message } = useSelector((state) => state.applications)
  const { user } = useSelector((state) => state.auth)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    dispatch(getApplicationById(id))

    return () => {
      dispatch(reset())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const handleStatusChange = (status) => {
    setNewStatus(status)
    setShowStatusModal(true)
  }

  const confirmStatusChange = () => {
    dispatch(updateApplicationStatus({ id, status: newStatus }))
      .unwrap()
      .then(() => {
        toast.success(`Application status updated to ${newStatus.replace("_", " ")}`)
        setShowStatusModal(false)
      })
      .catch((error) => {
        toast.error(error)
      })
  }

  const confirmDelete = () => {
    setShowDeleteModal(true)
  }

  const handleDelete = () => {
    dispatch(deleteApplication(id))
      .unwrap()
      .then(() => {
        toast.success("Application deleted successfully")
        navigate("/applications")
      })
      .catch((error) => {
        toast.error(error)
      })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "visa_applied":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading || !application) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Application Details</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/applications")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Applications
            </button>
            <Link
              to={`/applications/${id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaEdit className="mr-2" /> Edit
            </Link>
            <button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaTrash className="mr-2" /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden col-span-1">
            <div className="bg-indigo-600 px-4 py-3">
              <h2 className="text-lg font-medium text-white">Student Information</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <FaUser className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{application.student_name}</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <FaEnvelope className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{application.student_email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <FaPhone className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{application.student_phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaBuilding className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium">{application.branch_name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden col-span-1">
            <div className="bg-indigo-600 px-4 py-3">
              <h2 className="text-lg font-medium text-white">Application Details</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <FaGraduationCap className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">University</p>
                  <p className="font-medium">{application.university_name}</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <FaGraduationCap className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">
                    {application.course_name} - {application.course_level}
                  </p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <FaGlobe className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{application.country_name}</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <FaUser className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Counselor</p>
                  <p className="font-medium">{application.counselor_name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {["draft", "submitted", "processing", "visa_applied", "approved", "rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        application.application_status === status
                          ? getStatusBadgeClass(status) + " ring-2 ring-offset-2 ring-indigo-500"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden col-span-1">
            <div className="bg-indigo-600 px-4 py-3">
              <h2 className="text-lg font-medium text-white">Timeline</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-4 w-4 rounded-full bg-indigo-500 mt-1"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Application Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()} at{" "}
                      {new Date(application.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {application.submitted_at && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                      <p className="text-sm text-gray-500">
                        {new Date(application.submitted_at).toLocaleDateString()} at{" "}
                        {new Date(application.submitted_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Add more timeline events as needed */}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ApplicationDocuments applicationId={id} />
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
          Are you sure you want to delete this application? This action cannot be undone.
        </p>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Confirm Status Change"
        footer={
          <>
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={confirmStatusChange}
            >
              Change Status
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to change the application status to{" "}
          <span className="font-medium">{newStatus.replace("_", " ")}</span>?
        </p>
        {newStatus === "submitted" && application.application_status === "draft" && (
          <p className="mt-2 text-sm text-yellow-600">
            This will record the submission date and time for this application.
          </p>
        )}
      </Modal>
    </>
  )
}

export default ApplicationDetail

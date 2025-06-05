"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { getApplications, deleteApplication, reset } from "../features/applications/applicationSlice"
import { getBranches } from "../features/branches/branchSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaFilter, FaFileAlt } from "react-icons/fa"
import Spinner from "../components/Spinner"
import Modal from "../components/Modal"

function ApplicationList() {
  const dispatch = useDispatch()
  const { applications, isLoading, isError, isSuccess, message } = useSelector((state) => state.applications)
  const { branches } = useSelector((state) => state.branches)
  const { user } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState(null)
  const [filters, setFilters] = useState({
    status: "",
    branch: "",
    country: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    dispatch(getApplications())
    if (user.role.id === 1) {
      dispatch(getBranches())
    }

    return () => {
      dispatch(reset())
    }
  }, [dispatch, user.role.id])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const confirmDelete = (application) => {
    setApplicationToDelete(application)
    setShowDeleteModal(true)
  }

  const handleDelete = () => {
    dispatch(deleteApplication(applicationToDelete.application_id))
      .unwrap()
      .then(() => {
        toast.success("Application deleted successfully")
        setShowDeleteModal(false)
      })
      .catch((error) => {
        toast.error(error)
      })
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const applyFilters = () => {
    dispatch(getApplications(filters))
  }

  const resetFilters = () => {
    setFilters({
      status: "",
      branch: "",
      country: "",
    })
    dispatch(getApplications())
  }

  const filteredApplications = applications.filter(
    (application) =>
      application.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.university_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.country_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Applications</h1>
          <Link
            to="/applications/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> New Application
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaFilter className="mr-2" /> {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="visa_applied">Visa Applied</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {user.role.id === 1 && (
                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <select
                      id="branch"
                      name="branch"
                      value={filters.branch}
                      onChange={handleFilterChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Branches</option>
                      {branches.map((branch) => (
                        <option key={branch.branch_id} value={branch.branch_id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={filters.country}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Countries</option>
                    {/* Get unique countries from applications */}
                    {[...new Set(applications.map((app) => app.country_name))].map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 flex justify-end space-x-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University & Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Counselor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <tr key={application.application_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.student_name}</div>
                        <div className="text-sm text-gray-500">{application.branch_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.university_name}</div>
                        <div className="text-sm text-gray-500">{application.course_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.country_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${application.application_status === "approved" ? "bg-green-100 text-green-800" : ""}
                              ${application.application_status === "rejected" ? "bg-red-100 text-red-800" : ""}
                              ${application.application_status === "processing" ? "bg-yellow-100 text-yellow-800" : ""}
                              ${application.application_status === "submitted" ? "bg-blue-100 text-blue-800" : ""}
                              ${application.application_status === "draft" ? "bg-gray-100 text-gray-800" : ""}
                              ${application.application_status === "visa_applied" ? "bg-purple-100 text-purple-800" : ""}
                            `}
                        >
                          {application.application_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.counselor_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {application.submitted_at
                            ? new Date(application.submitted_at).toLocaleDateString()
                            : "Not submitted"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/applications/${application.application_id}#documents`}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="View Documents"
                        >
                          <FaFileAlt className="mr-1" />
                          <span>
                            {application.document_count ? (
                              <>
                                {application.document_count}{" "}
                                <span className="hidden sm:inline">
                                  {application.document_count === 1 ? "Document" : "Documents"}
                                </span>
                              </>
                            ) : (
                              <span className="hidden sm:inline">View Documents</span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/applications/${application.application_id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/applications/${application.application_id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => confirmDelete(application)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
          Are you sure you want to delete this application for {applicationToDelete?.student_name}? This action cannot
          be undone.
        </p>
      </Modal>
    </>
  )
}

export default ApplicationList

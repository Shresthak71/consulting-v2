"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getStudentById, getStudentApplications, reset } from "../features/students/studentSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCalendarAlt,
  FaEdit,
  FaArrowLeft,
  FaFileAlt,
  FaPlus,
} from "react-icons/fa"
import Spinner from "../components/Spinner"

function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { student, studentApplications, isLoading, isError, message } = useSelector((state) => state.students)

  useEffect(() => {
    dispatch(getStudentById(id))
    dispatch(getStudentApplications(id))

    return () => {
      dispatch(reset())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  if (isLoading || !student) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Student Details</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/students")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Students
            </button>
            <Link
              to={`/students/${id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaEdit className="mr-2" /> Edit Student
            </Link>
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
                  <p className="font-medium">{student.full_name}</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <FaEnvelope className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{student.email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <FaPhone className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{student.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <FaBuilding className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium">{student.branch_name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Registration Date</p>
                  <p className="font-medium">{new Date(student.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden col-span-2">
            <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">Applications</h2>
              <Link
                to={`/applications/new?studentId=${id}`}
                className="bg-white text-indigo-600 hover:bg-indigo-50 text-sm font-medium py-1 px-3 rounded-md flex items-center"
              >
                <FaPlus className="mr-1" /> New Application
              </Link>
            </div>
            <div className="p-4">
              {studentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentApplications.map((app) => (
                        <tr key={app.application_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{app.university_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{app.course_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{app.country_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${app.application_status === "approved" ? "bg-green-100 text-green-800" : ""}
                                ${app.application_status === "rejected" ? "bg-red-100 text-red-800" : ""}
                                ${app.application_status === "processing" ? "bg-yellow-100 text-yellow-800" : ""}
                                ${app.application_status === "submitted" ? "bg-blue-100 text-blue-800" : ""}
                                ${app.application_status === "draft" ? "bg-gray-100 text-gray-800" : ""}
                                ${app.application_status === "visa_applied" ? "bg-purple-100 text-purple-800" : ""}
                              `}
                            >
                              {app.application_status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Not submitted"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/applications/${app.application_id}`} className="text-indigo-600 hover:text-indigo-900">
                              <FaFileAlt className="inline" /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No applications found for this student.</p>
                  <Link
                    to={`/applications/new?studentId=${id}`}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaPlus className="mr-2 -ml-1" /> Create Application
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StudentDetail
